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

    // 1. Buscar en Google Places API
    const searchQuery = `${query} en ${location || 'Republica Dominicana'}`
    const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_KEY}&language=es`
    
    const googleResponse = await fetch(googleUrl)
    const googleData = await googleResponse.json()

    // 2. OPTIMIZACIÓN: Solo tomamos los primeros 4 resultados crudos
    const rawPlaces = googleData.results?.slice(0, 4) || [];

    // 3. Preparar datos RICOS para el Frontend (Tarjetas Visuales)
    // Estos NO se envían a la IA, solo al celular del usuario.
    const uiPlaces = rawPlaces.map((p: any) => {
      let imageUrl = null;
      if (p.photos && p.photos.length > 0) {
        const photoRef = p.photos[0].photo_reference;
        imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoRef}&key=${GOOGLE_KEY}`;
      }

      return {
        id: p.place_id,
        name: p.name,
        address: p.formatted_address, // Dirección completa para la tarjeta
        rating: p.rating,
        user_ratings_total: p.user_ratings_total,
        open_now: p.opening_hours?.open_now,
        image: imageUrl, // URL larga de la imagen
        lat: p.geometry?.location?.lat,
        lng: p.geometry?.location?.lng,
        place_id: p.place_id
      };
    });

    // 4. Preparar datos MINIATURA para la IA (Ahorro Masivo de Tokens)
    // Esto es lo único que la IA va a "leer".
    const aiContext = rawPlaces.map((p: any) => ({
      n: p.name,          // Solo el nombre
      r: p.rating || 0,   // Solo el rating
      c: p.user_ratings_total || 0 // Cantidad de votos (da contexto de popularidad)
    }));

    // 5. Consultar a OpenAI con el contexto mínimo
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Modelo económico y rápido
        messages: [
          {
            role: 'system',
            content: `Eres el Asistente de ServiAPP.
            Se mostrarán 4 tarjetas visuales al usuario con los resultados.
            
            TU TAREA:
            Da una introducción amable y ultra-corta (máximo 2 frases).
            No listes los nombres de los lugares, solo invítalo a ver las tarjetas.`
          },
          {
            role: 'user',
            // Aquí inyectamos el JSON minúsculo
            content: `Busco: ${query}. Datos encontrados: ${JSON.stringify(aiContext)}`
          }
        ],
        max_tokens: 100 // Limitamos la respuesta para ahorrar tokens de salida también
      })
    })

    const aiData = await aiResponse.json()
    const aiMessage = aiData.choices?.[0]?.message?.content || "Aquí tienes las mejores opciones que encontré."

    return new Response(
      JSON.stringify({ 
        response: aiMessage,
        places: uiPlaces // Enviamos las tarjetas completas al frontend
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