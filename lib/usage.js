import Redis from 'ioredis'

// ─────────────────────────────────────────────────────────────────────────
// Compteur d'utilisation persistant (server-side) pour facturation Surmesur.
//
// Pourquoi ce fichier existe :
// Chaque appel à l'API Fashn.ai (génération OU régénération) coûte de l'argent,
// que le client garde le résultat ou non. L'ancien "compteur" (generations.length
// dans app/page.js) est purement côté navigateur, plafonné à 3, et ne compte PAS
// les régénérations (elles remplacent une entrée existante au lieu d'en ajouter
// une nouvelle). Il ne peut donc pas servir à produire un rapport exact pour
// Surmesur. Ce module logue CHAQUE appel réel à Fashn, côté serveur, dans une
// base Redis persistante (intégration "Redis" du Vercel Marketplace), ce qui
// survit au caractère "serverless" (sans disque persistant) de Vercel.
//
// Configuration requise (Vercel → Storage → Create Database → Redis, puis
// "Connect Project") : une seule variable est injectée automatiquement,
// REDIS_URL (chaîne de connexion redis:// ou rediss://). Ce module utilise
// le protocole Redis natif (via ioredis), PAS l'API REST Upstash.
// ─────────────────────────────────────────────────────────────────────────

let redis = null
let triedConnect = false

function getRedis() {
  if (redis) return redis
  if (triedConnect) return null // évite de retenter une connexion à chaque appel si l'URL est absente/invalide
  triedConnect = true

  const url = process.env.REDIS_URL
  if (!url) return null

  redis = new Redis(url, {
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    lazyConnect: false,
  })
  redis.on('error', (err) => {
    console.error('[usage] Erreur de connexion Redis:', err.message)
  })
  return redis
}

export function isUsageTrackingConfigured() {
  return !!process.env.REDIS_URL
}

const LOG_MAX_ENTRIES = 20000

/**
 * Enregistre une génération Fashn réellement effectuée (facturable).
 * Ne doit être appelé qu'après confirmation que Fashn a accepté le job
 * (c-à-d qu'on a reçu un predictionId), peu importe si le polling échoue
 * ou time-out ensuite — Fashn facture dès l'acceptation du job.
 *
 * itemId/itemName identifient la pièce du catalogue (ex: 'j5' / 'Blazer Sarcelle
 * Loro Piana') afin de pouvoir rapporter, pièce par pièce, le nombre de
 * générations demandées — utile pour voir quelles pièces intéressent le plus
 * les clients (le "meilleur vendeur" côté essayage virtuel).
 */
export async function logGeneration({ predictionId, cityId, cityLabel, genType, client, itemId, itemName }) {
  const client_ = getRedis()
  if (!client_) {
    console.warn('[usage] Redis non configuré — génération NON comptabilisée pour la facturation Surmesur.')
    return
  }

  try {
    const now = new Date()
    const monthKey = now.toISOString().slice(0, 7) // "YYYY-MM"
    const city = cityId || 'inconnu'
    const type = genType || 'generate'
    const item = itemId || 'inconnu'

    const entry = JSON.stringify({
      id: predictionId || null,
      ts: now.toISOString(),
      cityId: city,
      cityLabel: cityLabel || null,
      genType: type,
      itemId: item,
      itemName: itemName || null,
      client: client && (client.name || client.phone || client.customerId)
        ? { name: client.name || null, phone: client.phone || null, customerId: client.customerId || null }
        : null,
    })

    await client_
      .pipeline()
      .incr('usage:total')
      .incr(`usage:month:${monthKey}`)
      .incr(`usage:city:${city}:${monthKey}`)
      .incr(`usage:type:${type}:${monthKey}`)
      .incr(`usage:item:${item}:total`)
      .incr(`usage:item:${item}:${monthKey}`)
      .sadd('usage:months', monthKey)
      .sadd('usage:cities', city)
      .sadd('usage:items', item)
      .hset('usage:itemNames', item, itemName || item)
      .lpush('usage:log', entry)
      .ltrim('usage:log', 0, LOG_MAX_ENTRIES - 1)
      .exec()
  } catch (err) {
    // Ne jamais faire échouer une génération à cause d'un problème de logging.
    console.error('[usage] Échec de l\'enregistrement de la génération:', err)
  }
}

/**
 * Enregistre l'image générée (URL du résultat Fashn) une fois la génération
 * terminée avec succès. Appelé séparément de logGeneration() car l'image
 * n'est connue qu'après le polling — logGeneration(), lui, s'exécute dès
 * l'acceptation du job par Fashn (pour ne jamais rater une génération
 * facturable, même si le polling échoue ou time-out ensuite).
 */
export async function logGenerationResult({ predictionId, resultUrl }) {
  const client_ = getRedis()
  if (!client_ || !predictionId || !resultUrl) return
  try {
    await client_.hset('usage:images', predictionId, resultUrl)
  } catch (err) {
    console.error('[usage] Échec de l\'enregistrement de l\'image:', err)
  }
}

/**
 * Construit le rapport agrégé (total, par mois, par boutique, par pièce) pour
 * la facturation Surmesur ET pour l'analyse des pièces les plus essayées
 * (quelles pièces "se vendent le mieux" / intéressent le plus les clients).
 */
export async function getUsageReport() {
  const client_ = getRedis()
  if (!client_) return { configured: false }

  const [total, months, cities, items, itemNames] = await Promise.all([
    client_.get('usage:total'),
    client_.smembers('usage:months'),
    client_.smembers('usage:cities'),
    client_.smembers('usage:items'),
    client_.hgetall('usage:itemNames'),
  ])

  const sortedMonths = (months || []).sort()
  const sortedCities = (cities || []).sort()
  const sortedItems = (items || []).sort()

  let results = []
  if (sortedMonths.length || sortedCities.length || sortedItems.length) {
    const pipeline = client_.pipeline()
    for (const m of sortedMonths) pipeline.get(`usage:month:${m}`)
    for (const c of sortedCities) {
      for (const m of sortedMonths) pipeline.get(`usage:city:${c}:${m}`)
    }
    for (const it of sortedItems) pipeline.get(`usage:item:${it}:total`)
    for (const it of sortedItems) {
      for (const m of sortedMonths) pipeline.get(`usage:item:${it}:${m}`)
    }
    // ioredis renvoie un tableau de [erreur, résultat] par commande
    const raw = await pipeline.exec()
    results = raw.map(([err, val]) => (err ? null : val))
  }

  let i = 0
  const byMonth = {}
  for (const m of sortedMonths) byMonth[m] = Number(results[i++]) || 0

  const byCityMonth = {}
  for (const c of sortedCities) {
    byCityMonth[c] = {}
    for (const m of sortedMonths) byCityMonth[c][m] = Number(results[i++]) || 0
  }

  const byItem = {}
  for (const it of sortedItems) byItem[it] = Number(results[i++]) || 0

  const byItemMonth = {}
  for (const it of sortedItems) {
    byItemMonth[it] = {}
    for (const m of sortedMonths) byItemMonth[it][m] = Number(results[i++]) || 0
  }

  // Classement des pièces les plus générées (du plus populaire au moins populaire)
  const itemsRanked = sortedItems
    .map(it => ({
      itemId: it,
      itemName: (itemNames && itemNames[it]) || it,
      total: byItem[it] || 0,
      byMonth: byItemMonth[it],
    }))
    .sort((a, b) => b.total - a.total)

  // Les 3 pièces les plus générées — pratique à afficher telles quelles dans
  // le rapport donné au client (Surmesur), sans avoir à retraiter itemsRanked.
  const top3Items = itemsRanked.slice(0, 3)

  return {
    configured: true,
    total: Number(total) || 0,
    months: sortedMonths,
    cities: sortedCities,
    byMonth,
    byCityMonth,
    items: sortedItems,
    itemNames: itemNames || {},
    byItem,
    byItemMonth,
    itemsRanked,
    top3Items,
  }
}

/**
 * Retourne les N dernières entrées détaillées du journal (les plus récentes
 * en premier), utile pour un export CSV détaillé si Surmesur le demande.
 * Chaque entrée est enrichie avec `imageUrl` (l'image générée, si la
 * génération a réussi — voir logGenerationResult ci-dessus).
 */
export async function getUsageLog(limit = 1000) {
  const client_ = getRedis()
  if (!client_) return []
  const [raw, images] = await Promise.all([
    client_.lrange('usage:log', 0, Math.max(0, limit - 1)),
    client_.hgetall('usage:images'),
  ])
  return raw.map((r) => {
    try {
      const entry = typeof r === 'string' ? JSON.parse(r) : r
      return { ...entry, imageUrl: (entry.id && images?.[entry.id]) || null }
    } catch { return null }
  }).filter(Boolean)
}
