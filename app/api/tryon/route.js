export async function POST(request) {
  try {
    const formData = await request.formData()
    const modelImage = formData.get('model_image')   // File upload (première génération)
    const modelUrl = formData.get('model_url')        // URL string (générations suivantes)
    const garmentUrl = formData.get('garment_url')
    const backgroundPrompt = formData.get('background_prompt') || ''
    const seed = parseInt(formData.get('seed') || Math.floor(Math.random() * 1000000))

    if (!garmentUrl) {
      return Response.json({ error: 'Images manquantes' }, { status: 400 })
    }

    if (!modelImage && !modelUrl) {
      return Response.json({ error: 'Photo du modèle manquante' }, { status: 400 })
    }

    const apiKey = process.env.FASHN_API_KEY
    if (!apiKey || apiKey === 'ta-clé-ici') {
      return Response.json({ error: 'Clé API non configurée' }, { status: 500 })
    }

    // Construire le model_image : soit base64 depuis fichier, soit URL directe
    let modelImageValue
    if (modelImage && typeof modelImage === 'object' && modelImage.arrayBuffer) {
      // C'est un fichier uploadé — convertir en base64
      const buffer = await modelImage.arrayBuffer()
      modelImageValue = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`
    } else if (modelUrl) {
      // C'est une URL — l'envoyer directement à Fashn.ai
      modelImageValue = modelUrl
    } else {
      return Response.json({ error: 'Format de photo invalide' }, { status: 400 })
    }

    // Prompt maximum — préservation morphologie absolue homme et femme
    const prompt = `ABSOLUTE PRIORITY — FULL BODY PRESERVATION FOR ALL BODY TYPES (male and female): The person's complete body shape MUST remain 100% identical to the original photo. This is non-negotiable. 

UPPER BODY: Do NOT slim the torso, chest, arms, or shoulders. Do NOT reduce belly size. Preserve exact body width and belly shape.

LOWER BODY — CRITICAL: Do NOT slim, reshape, or alter the hips, waist, thighs, knees, calves, ankles, or feet in any way. Preserve the exact hip width, thigh thickness, calf size, and leg shape as seen in the original photo. Do NOT make legs thinner or longer. Do NOT narrow the hips. The pants or skirt must conform to the real leg and hip shape — never alter the lower body to fit the garment.

GARMENT FIDELITY — CRITICAL: Reproduce the garment with 100% exact fidelity to the product image. Do NOT alter, simplify, or reinterpret the garment in any way. Preserve exactly: the fabric texture and material appearance, every color and color variation, all patterns, stripes, checks, prints or motifs at exact scale and position, all buttons and their exact number, size, color and placement, all seams, stitching and construction details, all pockets and their exact position, lapels, collars, cuffs and their exact shape, any logos, labels or branding, the exact cut and silhouette of the garment. The garment in the output must be indistinguishable from the product image — any deviation is unacceptable.

GENERAL: Do NOT idealize or beautify the body shape in any way. The clothing must stretch and conform to the real body. Preserve exact face, skin tone, hair, and expression. Tuck shirt inside pants always. When jacket is worn, show shirt collar and cuffs underneath. White studio background, soft front lighting.`

    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_name: 'tryon-max',
        inputs: {
          model_image: modelImageValue,
          product_image: garmentUrl,
          prompt,
          seed,
          resolution: '2k',
          generation_mode: 'quality',
        }
      }),
    })

    const data = await response.json()
    console.log('Fashn response:', JSON.stringify(data).slice(0, 200))

    if (!response.ok) {
      return Response.json({
        error: data.detail || data.error || data.message || `Erreur API: ${response.status}`
      }, { status: response.status })
    }

    const predictionId = data.id
    if (!predictionId) {
      return Response.json({ error: `Pas d'ID de prédiction: ${JSON.stringify(data)}` }, { status: 500 })
    }

    // Polling jusqu'au résultat
    let result = null
    let attempts = 0
    while (attempts < 40) {
      await new Promise(r => setTimeout(r, 3000))
      const statusRes = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
      const statusData = await statusRes.json()
      console.log(`Status ${attempts}:`, statusData.status)

      if (statusData.status === 'completed') {
        result = statusData.output?.[0]
        break
      } else if (statusData.status === 'failed') {
        return Response.json({ error: 'Génération échouée — réessayez' }, { status: 500 })
      }
      attempts++
    }

    if (!result) return Response.json({ error: 'Timeout — réessayez' }, { status: 408 })
    return Response.json({ output: result })

  } catch (error) {
    console.error('Erreur serveur:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
