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

    // Prompt intelligent : fidélité vêtement + background adapté au style
    const prompt = backgroundPrompt
      ? `Preserve with absolute fidelity the exact colors, fabric texture, pattern, cut and every design detail of the garment — no color shift, no pattern alteration. The garment must look identical to the product reference image. Always tuck the shirt neatly inside the pants. Critically important: preserve the exact face, facial features, hair, skin tone, body shape and original pose of the person — do not alter the person's appearance, identity or pose in any way. Background: ${backgroundPrompt}. Match the lighting direction, color temperature, and shadows of the background perfectly to the person's original photo. The overall image must look like one cohesive professional photograph.`
      : `Preserve with absolute fidelity the exact colors, fabric texture, pattern, cut and every design detail of the garment. No color shift, no pattern alteration. Always tuck the shirt neatly inside the pants. Critically important: preserve the exact face, facial features, hair, skin tone, body shape and original pose of the person — do not alter the person's appearance, identity or pose in any way. Clean neutral background matching the lighting of the original photo. Photorealistic result.`

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
          resolution: '1k',
          generation_mode: 'balanced',
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
