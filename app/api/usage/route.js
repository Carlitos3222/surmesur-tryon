import { getUsageReport, getUsageLog, isUsageTrackingConfigured } from '../../../lib/usage'

// ─────────────────────────────────────────────────────────────────────────
// Endpoint privé pour consulter le nombre EXACT de générations Fashn
// effectuées (incluant les régénérations), afin de produire le rapport de
// facturation à Surmesur.
//
// Utilisation :
//   /api/usage?key=VOTRE_CLE                → rapport agrégé JSON
//   /api/usage?key=VOTRE_CLE&format=csv      → journal détaillé en CSV
//     (une ligne par génération : date, boutique, type, client)
//
// Sécurité : protégé par la variable d'environnement USAGE_ADMIN_KEY.
// Sans cette variable configurée, l'accès est refusé (pour éviter d'exposer
// les noms/téléphones de clients publiquement).
// ─────────────────────────────────────────────────────────────────────────

export async function GET(request) {
  const adminKey = process.env.USAGE_ADMIN_KEY
  if (!adminKey) {
    return Response.json(
      { error: "USAGE_ADMIN_KEY n'est pas configurée sur le serveur — accès refusé par sécurité." },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  if (key !== adminKey) {
    return Response.json({ error: 'Clé invalide' }, { status: 401 })
  }

  if (!isUsageTrackingConfigured()) {
    return Response.json({
      error: "Le stockage Redis n'est pas configuré (variables UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN manquantes). Aucune génération n'a pu être comptabilisée.",
    }, { status: 500 })
  }

  const format = searchParams.get('format') || 'json'

  if (format === 'csv') {
    const limit = parseInt(searchParams.get('limit') || '5000')
    const log = await getUsageLog(limit)
    const header = 'date,heure,boutique,type,client_nom,client_telephone,client_id,prediction_id'
    const rows = log.map(e => {
      const d = e.ts ? new Date(e.ts) : null
      const date = d ? d.toISOString().slice(0, 10) : ''
      const heure = d ? d.toISOString().slice(11, 19) : ''
      const esc = (v) => v == null ? '' : `"${String(v).replace(/"/g, '""')}"`
      return [
        date, heure, esc(e.cityLabel || e.cityId), esc(e.genType),
        esc(e.client?.name), esc(e.client?.phone), esc(e.client?.customerId), esc(e.id),
      ].join(',')
    })
    const csv = [header, ...rows].join('\n')
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="generations-surmesur.csv"',
      },
    })
  }

  const report = await getUsageReport()
  return Response.json(report)
}
