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
    const searchQuery = `${query} en ${location || 'Republica Dominicana'}`
    const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_KEY}&language=es`
    
    const googleResponse = await fetch(googleUrl)
    const googleData = await googleResponse.json()

    // 2. Procesar y limpiar datos para el Frontend (Incluyendo Imágenes)
    const places = googleData.results?.slice(0, 5).map((p: any) => {
      // Construir URL de imagen si existe referencia
      let imageUrl = null;
      if (p.photos && p.photos.length > 0) {
        const photoRef = p.photos[0].photo_reference;
        imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_KEY}`;
      }

      return {
        id: p.place_id,
        name: p.name,
        address: p.formatted_address,
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
        open_now: p.opening_hours?.open_now,
        image: imageUrl,
        lat: p.geometry?.location?.lat,
        lng: p.geometry?.location?.lng,
        place_id: p.place_id
      };
    }) || []

    // 3. Procesar con GPT (Contexto actualizado)
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Usamos un modelo rápido
        messages: [
          {
            role: 'system',
            content: `Eres el Asistente de ServiAPP.
            
            CONTEXTO:
            El usuario ha buscado servicios. Hemos encontrado ${places.length} resultados en Google Maps que se mostrarán en TARJETAS visuales debajo de tu mensaje.
            
            INSTRUCCIONES:
            1. NO listes los negocios en el texto (ya se mostrarán las tarjetas).
            2. Haz una introducción muy breve y amable (ej: "Aquí tienes los mejores plomeros que encontré cerca de ti...").
            3. Menciona algún detalle general positivo si hay buenas calificaciones.
            4. Sé conciso.`
          },
          {
            role: 'user',
            content: `Busco: ${query}. Resultados encontrados: ${JSON.stringify(places.map(p => ({ name: p.name, rating: p.rating })))}`
          }
        ],
        max_tokens: 150
      })
    })

    const aiData = await aiResponse.json()
    const aiMessage = aiData.choices?.[0]?.message?.content || "Aquí tienes los resultados encontrados."

    return new Response(
      JSON.stringify({ 
        response: aiMessage,
        places: places // Enviamos el array procesado con imágenes
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