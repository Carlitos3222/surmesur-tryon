import { getUsageReport, getUsageLog, isUsageTrackingConfigured } from '../../../lib/usage'

// ─────────────────────────────────────────────────────────────────────────
// Endpoint privé pour consulter le nombre EXACT de générations Fashn
// effectuées (incluant les régénérations), afin de produire le rapport de
// facturation à Surmesur.
//
// Utilisation :
//   /api/usage?key=VOTRE_CLE                 → rapport agrégé JSON (inclut
//     désormais, en plus du total/mois/boutique : itemsRanked — la liste des
//     pièces du catalogue classées de la plus générée à la moins générée,
//     avec le détail mois par mois pour chacune)
//   /api/usage?key=VOTRE_CLE&format=csv       → journal détaillé en CSV
//     (une ligne par génération : date, boutique, type, PIÈCE, client)
//   /api/usage?key=VOTRE_CLE&format=items     → CSV résumé par pièce
//     (une ligne par pièce du catalogue : total de générations + une colonne
//     par mois) — c'est le format le plus pratique pour voir en un coup
//     d'oeil quelles pièces intéressent le plus les clients.
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
    const header = 'date,heure,boutique,type,piece_id,piece_nom,client_nom,client_telephone,client_id,prediction_id'
    const rows = log.map(e => {
      const d = e.ts ? new Date(e.ts) : null
      const date = d ? d.toISOString().slice(0, 10) : ''
      const heure = d ? d.toISOString().slice(11, 19) : ''
      const esc = (v) => v == null ? '' : `"${String(v).replace(/"/g, '""')}"`
      return [
        date, heure, esc(e.cityLabel || e.cityId), esc(e.genType),
        esc(e.itemId), esc(e.itemName),
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

  // Résumé par pièce du catalogue : total + une colonne par mois, trié de la
  // pièce la plus générée à la moins générée. C'est le format à utiliser pour
  // répondre à "quelles pièces se vendent le mieux / intéressent le plus les
  // clients".
  if (format === 'items') {
    const report = await getUsageReport()
    if (!report.configured) {
      return Response.json({ error: "Le stockage Redis n'est pas configuré." }, { status: 500 })
    }
    const esc = (v) => v == null ? '' : `"${String(v).replace(/"/g, '""')}"`
    const header = ['piece_id', 'piece_nom', 'total', ...report.months].join(',')
    const rows = (report.itemsRanked || []).map(it => [
      esc(it.itemId), esc(it.itemName), it.total,
      ...report.months.map(m => it.byMonth?.[m] || 0),
    ].join(','))
    const csv = [header, ...rows].join('\n')
    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="pieces-surmesur.csv"',
      },
    })
  }

  const report = await getUsageReport()
  return Response.json(report)
}
