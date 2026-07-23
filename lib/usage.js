import { Redis } from '@upstash/redis'

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
// base Redis persistante (Upstash / Vercel Marketplace "Redis"), ce qui survit
// au caractère "serverless" (sans disque persistant) de Vercel.
//
// Configuration requise (une seule fois, dans Vercel → Storage → Create Database
// → Redis, puis "Connect Project") :
//   - UPSTASH_REDIS_REST_URL
//   - UPSTASH_REDIS_REST_TOKEN
// (Si l'intégration a été créée via l'ancienne "Vercel KV", les variables
// s'appellent KV_REST_API_URL / KV_REST_API_TOKEN — les deux noms sont acceptés
// ci-dessous.)
// ─────────────────────────────────────────────────────────────────────────

let redis = null

function getRedis() {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

export function isUsageTrackingConfigured() {
  return !!getRedis()
}

const LOG_MAX_ENTRIES = 20000

/**
 * Enregistre une génération Fashn réellement effectuée (facturable).
 * Ne doit être appelé qu'après confirmation que Fashn a accepté le job
 * (c-à-d qu'on a reçu un predictionId), peu importe si le polling échoue
 * ou time-out ensuite — Fashn facture dès l'acceptation du job.
 */
export async function logGeneration({ predictionId, cityId, cityLabel, genType, client }) {
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

    const entry = JSON.stringify({
      id: predictionId || null,
      ts: now.toISOString(),
      cityId: city,
      cityLabel: cityLabel || null,
      genType: type,
      client: client && (client.name || client.phone || client.customerId)
        ? { name: client.name || null, phone: client.phone || null, customerId: client.customerId || null }
        : null,
    })

    const pipeline = client_.pipeline()
    pipeline.incr('usage:total')
    pipeline.incr(`usage:month:${monthKey}`)
    pipeline.incr(`usage:city:${city}:${monthKey}`)
    pipeline.incr(`usage:type:${type}:${monthKey}`)
    pipeline.sadd('usage:months', monthKey)
    pipeline.sadd('usage:cities', city)
    pipeline.lpush('usage:log', entry)
    pipeline.ltrim('usage:log', 0, LOG_MAX_ENTRIES - 1)
    await pipeline.exec()
  } catch (err) {
    // Ne jamais faire échouer une génération à cause d'un problème de logging.
    console.error('[usage] Échec de l\'enregistrement de la génération:', err)
  }
}

/**
 * Construit le rapport agrégé (total, par mois, par boutique) pour la
 * facturation Surmesur.
 */
export async function getUsageReport() {
  const client_ = getRedis()
  if (!client_) return { configured: false }

  const [total, months, cities] = await Promise.all([
    client_.get('usage:total'),
    client_.smembers('usage:months'),
    client_.smembers('usage:cities'),
  ])

  const sortedMonths = (months || []).sort()
  const sortedCities = (cities || []).sort()

  const pipeline = client_.pipeline()
  for (const m of sortedMonths) pipeline.get(`usage:month:${m}`)
  for (const c of sortedCities) {
    for (const m of sortedMonths) pipeline.get(`usage:city:${c}:${m}`)
  }
  const results = sortedMonths.length || sortedCities.length ? await pipeline.exec() : []

  let i = 0
  const byMonth = {}
  for (const m of sortedMonths) byMonth[m] = Number(results[i++]) || 0

  const byCityMonth = {}
  for (const c of sortedCities) {
    byCityMonth[c] = {}
    for (const m of sortedMonths) byCityMonth[c][m] = Number(results[i++]) || 0
  }

  return {
    configured: true,
    total: Number(total) || 0,
    months: sortedMonths,
    cities: sortedCities,
    byMonth,
    byCityMonth,
  }
}

/**
 * Retourne les N dernières entrées détaillées du journal (les plus récentes
 * en premier), utile pour un export CSV détaillé si Surmesur le demande.
 */
export async function getUsageLog(limit = 1000) {
  const client_ = getRedis()
  if (!client_) return []
  const raw = await client_.lrange('usage:log', 0, Math.max(0, limit - 1))
  return raw.map((r) => {
    try { return typeof r === 'string' ? JSON.parse(r) : r } catch { return null }
  }).filter(Boolean)
}
