export async function POST(request) {
  try {
    const formData = await request.formData()
    const modelImage = formData.get('model_image')
    const modelUrl = formData.get('model_url')
    const garmentUrl = formData.get('garment_url')
    const backgroundPrompt = formData.get('background_prompt') || ''
    const seed = parseInt(formData.get('seed') || Math.floor(Math.random() * 1000000))
    const mensurationsRaw = formData.get('mensurations')
    const mensurations = mensurationsRaw ? JSON.parse(mensurationsRaw) : null

    // Construire le bloc mensurations enrichi
    let mensurationsBlock = ''
    let mensurationsReinforcement = ''
    if (mensurations) {
      const parts = []
      if (mensurations.genre) {
        const genreEN = mensurations.genre === 'Homme' ? 'male' : mensurations.genre === 'Femme' ? 'female' : 'non-binary'
        parts.push(`Gender: ${genreEN}`)
      }
      if (mensurations.taille) {
        // Convertir en cm pour uniformité
        let tailleVal = parseFloat(mensurations.taille)
        let tailleCm = tailleVal
        if (mensurations.tailleUnit === 'po') tailleCm = Math.round(tailleVal * 2.54)
        if (mensurations.tailleUnit === 'pi') tailleCm = Math.round(tailleVal * 30.48)
        parts.push(`Height: ${tailleCm} cm`)
        mensurationsReinforcement += `The person is ${tailleCm} cm tall — preserve this exact height in the output. Do NOT make them appear taller or shorter. `
      }
      if (mensurations.poids) {
        let poidsVal = parseFloat(mensurations.poids)
        let poidsKg = mensurations.poidsUnit === 'lb' ? Math.round(poidsVal * 0.453) : poidsVal
        parts.push(`Weight: ${poidsKg} kg`)
        mensurationsReinforcement += `The person weighs ${poidsKg} kg — preserve this exact body weight and mass in the output. Do NOT slim or reshape their body. `
      }
      if (mensurations.morphologie) {
        const morphoMap = {
          mince: 'slim / thin body type with narrow frame',
          moyen: 'average / medium body type',
          athletic: 'athletic / muscular body type with broad shoulders',
          poire: 'pear-shaped body type with wider hips than shoulders',
          costaud: 'stocky / broad body type with large frame',
          enveloppe: 'full / overweight body type with rounded silhouette',
        }
        const morphoEN = morphoMap[mensurations.morphologie] || mensurations.morphologie
        parts.push(`Body type: ${morphoEN}`)
        mensurationsReinforcement += `The person has a ${morphoEN} — the generated image MUST reflect this body type accurately and visibly. `
      }

      if (parts.length > 0) {
        mensurationsBlock = `\n\nVERIFIED CLIENT MEASUREMENTS — MANDATORY COMPLIANCE:\n${parts.join('\n')}\n${mensurationsReinforcement}\nThese measurements were provided by the client and MUST be respected in the output. Any deviation from these measurements is unacceptable.`
      }
    }

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

    // Construire le model_image
    let modelImageValue
    if (modelImage && typeof modelImage === 'object' && modelImage.arrayBuffer) {
      const buffer = await modelImage.arrayBuffer()
      modelImageValue = `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`
    } else if (modelUrl) {
      modelImageValue = modelUrl
    } else {
      return Response.json({ error: 'Format de photo invalide' }, { status: 400 })
    }
    const prompt = `CRITICAL INSTRUCTION — BODY IDENTITY PRESERVATION:

The output image MUST show the exact same person with the exact same body. This is the highest priority rule that overrides everything else.

MEASUREMENTS TO PRESERVE EXACTLY:
- Total body height and proportions: identical to original photo
- Leg length: exact same length as original — do NOT elongate or shorten legs
- Leg width and thigh thickness: exact same width as original — do NOT slim legs
- Torso width: exact same shoulder-to-shoulder width — do NOT narrow the chest or shoulders
- Torso length: exact same distance from shoulder to waist — do NOT alter
- Hip width: identical to original
- Arm length and thickness: identical to original
- Waist and belly shape: identical to original — do NOT reduce belly or waist size
- Calf, ankle and foot size: identical to original

BODY TYPE RULE: If the person appears athletic, muscular, slim, average, overweight, or any body type — preserve that body type 100% unchanged. Do NOT apply any body idealization, slimming, elongation, or beautification of any kind.

FACE AND IDENTITY: Preserve exact face, skin tone, hair color, hair style, beard, and facial expression unchanged.

GARMENT RULE: The garment must conform to the real body shape. Never alter the body to fit the garment. The garment stretches and adapts to the person — not the other way around.

GARMENT FIDELITY: Reproduce exact fabric texture, colors, patterns, buttons, seams, pockets, lapels, and all construction details with 100% accuracy. The garment must be indistinguishable from the product image.

Always tuck shirt inside pants. Show shirt collar and cuffs under jacket when worn. White studio background, soft front lighting.${mensurationsBlock}`

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
