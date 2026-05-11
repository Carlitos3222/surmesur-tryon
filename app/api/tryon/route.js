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

    const modelBuffer = await modelImage.arrayBuffer()
    const modelBase64 = `data:image/jpeg;base64,${Buffer.from(modelBuffer).toString('base64')}`

    const response = await fetch('https://api.fashn.ai/v1/run', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_name: 'fashn/tryon',
        inputs: {
          model_image: modelBase64,
          garment_image: garmentUrl,
          category: category,
          mode: 'balanced',
          garment_photo_type: 'model',
          nsfw_filter: true,
        }
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Fashn API error:', JSON.stringify(data))
      return Response.json({ 
        error: data.detail || data.error || data.message || `Erreur API: ${response.status}` 
      }, { status: response.status })
    }

    const predictionId = data.id
    let result = null
    let attempts = 0

    while (attempts < 40) {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const statusResponse = await fetch(`https://api.fashn.ai/v1/status/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      })
      
      const statusData = await statusResponse.json()
      
      if (statusData.status === 'completed') {
        result = statusData.output[0]
        break
      } else if (statusData.status === 'failed') {
        console.error('Failed:', JSON.stringify(statusData))
        return Response.json({ error: 'Génération échouée — réessayez' }, { status: 500 })
      }
      
      attempts++
    }

    if (!result) return Response.json({ error: 'Timeout' }, { status: 408 })
    return Response.json({ output: result })

  } catch (error) {
    console.error('Erreur:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
