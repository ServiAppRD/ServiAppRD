import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, location } = await req.json()
    const AI_KEY = Deno.env.get('AI_KEY')
    const GOOGLE_KEY = Deno.env.get('GOOGLE_PLACES')

    if (!AI_KEY || !GOOGLE_KEY) {
      throw new Error('Faltan las API KEYS en la configuración')
    }

    console.log(`[ai-search] Buscando: ${query} cerca de ${location || 'Santo Domingo'}`)

    // 1. Buscar en Google Places API (Text Search)
    // Combinamos la query con la ubicación para ser precisos
    const searchQuery = `${query} en ${location || 'Republica Dominicana'}`
    const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_KEY}&language=es`
    
    const googleResponse = await fetch(googleUrl)
    const googleData = await googleResponse.json()

    // Filtramos los datos relevantes de Google para no saturar el contexto de la IA
    const places = googleData.results?.slice(0, 5).map((p: any) => ({
      name: p.name,
      address: p.formatted_address,
      rating: p.rating,
      user_ratings_total: p.user_ratings_total,
      open_now: p.opening_hours?.open_now ? "Abierto ahora" : "Cerrado o sin horario",
    })) || []

    console.log(`[ai-search] Encontrados ${places.length} lugares en Google`)

    // 2. Procesar con GPT-5-NANO (como solicitaste)
    // Le damos los datos crudos de Google para que responda como un asistente amable
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano', // Usando el modelo especificado
        messages: [
          {
            role: 'system',
            content: `Eres el Asistente Inteligente de ServiAPP. Tu objetivo es ayudar a los usuarios a encontrar servicios profesionales.
            
            CONTEXTO:
            La app a veces no tiene suficientes usuarios registrados, por lo que buscamos en Google Maps para llenar el vacío (problema huevo-gallina).
            
            INSTRUCCIONES:
            1. Recibirás una lista de negocios reales encontrados en Google.
            2. Debes recomendar estos negocios al usuario de forma amigable y resumida.
            3. Si hay datos de calificación (estrellas), menciónalos para dar confianza.
            4. Si NO se encontraron resultados en Google, sugiere intentar con otra categoría o zona.
            5. Responde en formato texto enriquecido (Markdown simple) pero breve.
            6. Al final, invita al usuario a que, si conoce a estos profesionales, les diga que se registren en ServiAPP gratis.
            
            DATOS ENCONTRADOS:
            ${JSON.stringify(places)}`
          },
          {
            role: 'user',
            content: `Busco: ${query}. Ubicación aprox: ${location || 'No especificada'}`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    const aiData = await aiResponse.json()
    const aiMessage = aiData.choices?.[0]?.message?.content || "Lo siento, no pude procesar la búsqueda en este momento."

    return new Response(
      JSON.stringify({ 
        response: aiMessage,
        raw_places: places // Devolvemos también los raw por si el frontend quiere renderizar tarjetas
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("[ai-search] Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})