export async function POST(request) {
  try {
    const formData = await request.formData()
    const modelImage = formData.get('model_image')
    const garmentUrl = formData.get('garment_url')
    const category = formData.get('category') || 'one-pieces'

    if (!modelImage || !garmentUrl) {
      return Response.json({ error: 'Images manquantes' }, { status: 400 })
    }

    const apiKey = process.env.FASHN_API_KEY
    if (!apiKey || apiKey === 'ta-clé-ici') {
      return Response.json({ error: 'Clé API non configurée' }, { status: 500 })
    }

    // Convert model image to base64
    const modelBuffer = await modelImage.arrayBuffer()
    const modelBase64 = `data:image/jpeg;base64,${Buffer.from(modelBuffer).toString('base64')}`

    // Try the correct Fashn.ai API format
    const requestBody = {
      model_image: modelBase64,
      garment_image: garmentUrl,
      category: category,
      mode: 'balanced',
      garment_photo_type: 'model',
      nsfw_filter: true,
    }

    console.log('Sending to Fashn.ai:', JSON.stringify({ 
      model_image: 'base64_data...', 
      garment_image: garmentUrl,
      category: category 
    }))

    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const responseText = await response.text()
    console.log('Fashn.ai raw response:', responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      return Response.json({ error: `Réponse invalide: ${responseText}` }, { status: 500 })
    }

    if (!response.ok) {
      console.error('Fashn API error full:', JSON.stringify(data))
      return Response.json({ 
        error: data.detail || data.error || data.message || JSON.stringify(data)
      }, { status: response.status })
    }

    const predictionId = data.id
    if (!predictionId) {
      return Response.json({ error: `Pas d'ID reçu: ${JSON.stringify(data)}` }, { status: 500 })
    }

    console.log('Prediction ID:', predictionId)

    let result = null
    let attempts = 0

    while (attempts < 40) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const statusResponse = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
      
      const statusText = await statusResponse.text()
      console.log(`Status attempt ${attempts}:`, statusText)
      
      let statusData
      try {
        statusData = JSON.parse(statusText)
      } catch {
        attempts++
        continue
      }
      
      if (statusData.status === 'completed') {
        result = statusData.output?.[0] || statusData.output
        break
      } else if (statusData.status === 'failed') {
        console.error('Generation failed:', JSON.stringify(statusData))
        return Response.json({ error: `Génération échouée: ${JSON.stringify(statusData.error || statusData)}` }, { status: 500 })
      }
      
      attempts++
    }

    if (!result) return Response.json({ error: 'Timeout - réessayez' }, { status: 408 })
    return Response.json({ output: result })

  } catch (error) {
    console.error('Server error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
