import { getUsageReport, getUsageLog, isUsageTrackingConfigured, itemCategoryLabel } from '../../../lib/usage'

// ─────────────────────────────────────────────────────────────────────────
// Endpoint privé pour consulter le nombre EXACT de générations Fashn
// effectuées (incluant les régénérations), afin de produire le rapport de
// facturation à Surmesur.
//
// Utilisation :
//   /api/usage?key=VOTRE_CLE                 → rapport agrégé JSON :
//     - total : nombre total de générations (toutes périodes confondues)
//     - byMonth : nombre de générations par mois
//     - byCityMonth : nombre de générations par boutique, par mois
//     - itemsRanked : chaque pièce du catalogue — VESTONS, CHEMISES,
//       PANTALONS, mais aussi les COMPLETS (3 pièces) et les OUTFITS (looks
//       complets multi-pièces), chacun étant une pièce à part entière avec
//       son propre id — classée de la plus générée à la moins générée, avec
//       son total ET son détail mois par mois
//     - top3Items : uniquement les 3 pièces les plus générées (raccourci de
//       itemsRanked)
//   /api/usage?key=VOTRE_CLE&format=csv       → journal détaillé en CSV,
//     une ligne PAR GÉNÉRATION : date, heure, boutique, type, pièce (id +
//     nom + catégorie : Complet / Outfit / Veston / Chemise / Pantalon),
//     nom du client, téléphone, numéro de client, prediction_id
//   /api/usage?key=VOTRE_CLE&format=items     → CSV résumé par pièce
//     (une ligne par pièce du catalogue — complets et outfits inclus —,
//     triée par rang : total de générations + une colonne par mois) — les
//     3 premières lignes (rang 1 à 3) sont les pièces les plus générées.
//
// Important — vie privée : le rapport n'inclut JAMAIS l'image générée du
// client (photo du client habillé de la pièce). Seule la pièce du catalogue
// essayée (piece_id / piece_nom) est rapportée, jamais la photo elle-même.
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
    const header = 'date,heure,boutique,type,piece_id,piece_nom,piece_categorie,client_nom,client_telephone,client_id,prediction_id'
    const rows = log.map(e => {
      const d = e.ts ? new Date(e.ts) : null
      const date = d ? d.toISOString().slice(0, 10) : ''
      const heure = d ? d.toISOString().slice(11, 19) : ''
      const esc = (v) => v == null ? '' : `"${String(v).replace(/"/g, '""')}"`
      return [
        date, heure, esc(e.cityLabel || e.cityId), esc(e.genType),
        esc(e.itemId), esc(e.itemName), esc(itemCategoryLabel(e.itemId)),
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
    const header = ['rang', 'piece_id', 'piece_nom', 'piece_categorie', 'total', ...report.months].join(',')
    const rows = (report.itemsRanked || []).map((it, idx) => [
      idx + 1, esc(it.itemId), esc(it.itemName), esc(it.itemCategory), it.total,
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
