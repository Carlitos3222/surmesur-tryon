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
 * Déduit la catégorie d'une pièce (Complet, Outfit, Veston, Chemise, Pantalon)
 * à partir du préfixe de son itemId — convention utilisée dans le catalogue
 * (app/page.js) : "s" = suits/complets, "o" = outfits, "j" = jackets/vestons,
 * "sh" = shirts/chemises, "p" = pants/pantalons.
 *
 * Important : les "complets" (3 pièces) et les "outfits" (looks complets
 * multi-pièces) sont des PIÈCES à part entière du catalogue, au même titre
 * qu'un veston, une chemise ou un pantalon — elles doivent donc apparaître
 * dans le rapport par pièce (itemsRanked / top3Items / export "items") comme
 * n'importe quelle autre pièce, chacune avec son propre itemId (ex: 's1',
 * 'o1') et son propre total de générations.
 */
export function itemCategoryLabel(itemId) {
  if (!itemId || itemId === 'inconnu') return ''
  if (itemId.startsWith('sh')) return 'Chemise'
  if (itemId.startsWith('s')) return 'Complet'
  if (itemId.startsWith('o')) return 'Outfit'
  if (itemId.startsWith('j')) return 'Veston'
  if (itemId.startsWith('p')) return 'Pantalon'
  return 'Autre'
}

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
 *
 * itemImage est l'URL de la PHOTO DU PRODUIT dans le catalogue (le vêtement,
 * l'outfit ou le complet tel que photographié pour le catalogue — ex.
 * .../suit-1.jpeg) — PAS la photo générée du client qui porte la pièce.
 * Comme cette URL est lue dynamiquement depuis le catalogue au moment de la
 * génération (jamais codée en dur ici), toute nouvelle pièce ajoutée plus
 * tard au catalogue (changement de saison, nouvelle promotion, etc.) sera
 * automatiquement incluse dans le rapport sans modification de ce fichier.
 */
export async function logGeneration({ predictionId, cityId, cityLabel, genType, client, itemId, itemName, itemImage }) {
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
      itemImage: itemImage || null,
      client: client && (client.name || client.phone || client.customerId)
        ? { name: client.name || null, phone: client.phone || null, customerId: client.customerId || null }
        : null,
    })

    const pipeline = client_
      .pipeline()
      .incr('usage:total')
      .incr(`usage:month:${monthKey}`)
      .incr(`usage:city:${city}:${monthKey}`)
      .incr(`usage:city:${city}:total`)
      .incr(`usage:type:${type}:${monthKey}`)
      .incr(`usage:item:${item}:total`)
      .incr(`usage:item:${item}:${monthKey}`)
      .incr(`usage:city:${city}:item:${item}:total`)
      .incr(`usage:city:${city}:item:${item}:${monthKey}`)
      .sadd('usage:months', monthKey)
      .sadd('usage:cities', city)
      .sadd('usage:items', item)
      .sadd(`usage:city:${city}:items`, item)
      .hset('usage:itemNames', item, itemName || item)
      .hset('usage:cityLabels', city, cityLabel || city)
      .lpush('usage:log', entry)
      .ltrim('usage:log', 0, LOG_MAX_ENTRIES - 1)

    if (itemImage) pipeline.hset('usage:itemImages', item, itemImage)

    await pipeline.exec()
  } catch (err) {
    // Ne jamais faire échouer une génération à cause d'un problème de logging.
    console.error('[usage] Échec de l\'enregistrement de la génération:', err)
  }
}

/**
 * Construit le rapport agrégé (total, par mois, par boutique, par pièce) pour
 * la facturation Surmesur ET pour l'analyse des pièces les plus essayées
 * (quelles pièces "se vendent le mieux" / intéressent le plus les clients).
 *
 * Si `city` est fourni (ex: 'montreal'), le rapport est limité à CE SEUL
 * magasin — mêmes concepts que le rapport global (total, par mois, par
 * pièce classée, top pièces), mais scoped à la boutique demandée. Utile pour
 * donner à chaque magasin son propre rapport, séparément du rapport global.
 */
export async function getUsageReport(city = null) {
  const client_ = getRedis()
  if (!client_) return { configured: false }

  if (city) return getUsageReportForCity(client_, city)

  const [total, months, cities, items, itemNames, itemImages, cityLabels] = await Promise.all([
    client_.get('usage:total'),
    client_.smembers('usage:months'),
    client_.smembers('usage:cities'),
    client_.smembers('usage:items'),
    client_.hgetall('usage:itemNames'),
    client_.hgetall('usage:itemImages'),
    client_.hgetall('usage:cityLabels'),
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
      itemCategory: itemCategoryLabel(it),
      itemImage: (itemImages && itemImages[it]) || null,
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
    cityLabels: cityLabels || {},
    byMonth,
    byCityMonth,
    items: sortedItems,
    itemNames: itemNames || {},
    itemImages: itemImages || {},
    byItem,
    byItemMonth,
    itemsRanked,
    top3Items,
  }
}

/**
 * Variante de getUsageReport() limitée à UN SEUL magasin. Utilise des
 * compteurs Redis dédiés par boutique (usage:city:{city}:*), alimentés en
 * parallèle des compteurs globaux dans logGeneration(), afin de ne pas avoir
 * à recalculer/filtrer sur l'ensemble du journal à chaque appel.
 */
async function getUsageReportForCity(client_, city) {
  const [cityTotal, months, items, itemNames, itemImages, cityLabels] = await Promise.all([
    client_.get(`usage:city:${city}:total`),
    client_.smembers('usage:months'),
    client_.smembers(`usage:city:${city}:items`),
    client_.hgetall('usage:itemNames'),
    client_.hgetall('usage:itemImages'),
    client_.hgetall('usage:cityLabels'),
  ])

  const sortedMonths = (months || []).sort()
  const sortedItems = (items || []).sort()

  let results = []
  if (sortedMonths.length || sortedItems.length) {
    const pipeline = client_.pipeline()
    for (const m of sortedMonths) pipeline.get(`usage:city:${city}:${m}`)
    for (const it of sortedItems) pipeline.get(`usage:city:${city}:item:${it}:total`)
    for (const it of sortedItems) {
      for (const m of sortedMonths) pipeline.get(`usage:city:${city}:item:${it}:${m}`)
    }
    const raw = await pipeline.exec()
    results = raw.map(([err, val]) => (err ? null : val))
  }

  let i = 0
  const byMonth = {}
  for (const m of sortedMonths) byMonth[m] = Number(results[i++]) || 0

  const byItem = {}
  for (const it of sortedItems) byItem[it] = Number(results[i++]) || 0

  const byItemMonth = {}
  for (const it of sortedItems) {
    byItemMonth[it] = {}
    for (const m of sortedMonths) byItemMonth[it][m] = Number(results[i++]) || 0
  }

  const itemsRanked = sortedItems
    .map(it => ({
      itemId: it,
      itemName: (itemNames && itemNames[it]) || it,
      itemCategory: itemCategoryLabel(it),
      itemImage: (itemImages && itemImages[it]) || null,
      total: byItem[it] || 0,
      byMonth: byItemMonth[it],
    }))
    .sort((a, b) => b.total - a.total)

  const top3Items = itemsRanked.slice(0, 3)

  return {
    configured: true,
    city,
    cityLabel: (cityLabels && cityLabels[city]) || city,
    total: Number(cityTotal) || 0,
    months: sortedMonths,
    cities: [city],
    cityLabels: cityLabels || {},
    byMonth,
    byCityMonth: { [city]: byMonth },
    items: sortedItems,
    itemNames: itemNames || {},
    itemImages: itemImages || {},
    byItem,
    byItemMonth,
    itemsRanked,
    top3Items,
  }
}

/**
 * Retourne les N dernières entrées détaillées du journal (les plus récentes
 * en premier), utile pour un export CSV détaillé si Surmesur le demande.
 *
 * Si `city` est fourni, ne retourne que les entrées de CE magasin (les N
 * dernières entrées DE CE MAGASIN, pas les N dernières entrées toutes
 * boutiques confondues) — utile pour donner à chaque magasin son propre
 * journal détaillé, séparément.
 *
 * Volontairement, aucune image générée (photo du client habillé) n'est
 * jamais enregistrée ni exposée ici — seule la PIÈCE du catalogue utilisée
 * (itemId/itemName/itemImage) est conservée, où itemImage est la photo du
 * PRODUIT du catalogue (pas celle du client). Le rapport doit permettre de
 * savoir quel vêtement a été essayé, jamais montrer l'image du client.
 */
export async function getUsageLog(limit = 1000, city = null) {
  const client_ = getRedis()
  if (!client_) return []

  if (!city) {
    const raw = await client_.lrange('usage:log', 0, Math.max(0, limit - 1))
    return raw.map((r) => {
      try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
    }).filter(Boolean)
  }

  // Le journal complet (usage:log) mélange toutes les boutiques ; pour filtrer
  // par magasin il faut donc parcourir jusqu'à LOG_MAX_ENTRIES entrées, puis
  // ne garder que celles du magasin demandé, avant d'appliquer la limite.
  const raw = await client_.lrange('usage:log', 0, LOG_MAX_ENTRIES - 1)
  const parsed = raw.map((r) => {
    try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
  }).filter(Boolean)
  return parsed.filter((e) => e.cityId === city).slice(0, Math.max(0, limit))
}
