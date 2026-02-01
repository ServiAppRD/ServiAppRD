import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Validar Autenticación
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Debes iniciar sesión para usar el asistente.')
    }

    // Inicializar Cliente Supabase (Service Role para poder escribir en la tabla de uso sin restricciones)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Obtener usuario a partir del token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !user) {
      throw new Error('Sesión inválida o expirada.')
    }

    // 2. Verificar Límite Diario (5 mensajes)
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    const { data: usageData, error: usageError } = await supabaseAdmin
      .from('daily_ai_usage')
      .select('request_count')
      .eq('user_id', user.id)
      .eq('usage_date', today)
      .maybeSingle()

    const currentCount = usageData?.request_count || 0

    if (currentCount >= 5) {
      return new Response(
        JSON.stringify({ 
          error: "Has alcanzado tu límite diario de 5 consultas gratuitas. Vuelve mañana." 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Proceder con la búsqueda (Lógica original)
    const { query, location } = await req.json()
    const AI_KEY = Deno.env.get('AI_KEY')
    const GOOGLE_KEY = Deno.env.get('GOOGLE_PLACES')

    if (!AI_KEY || !GOOGLE_KEY) throw new Error('Configuración de servidor incompleta')

    console.log(`[ai-search] User: ${user.id} | Count: ${currentCount + 1} | Query: ${query}`)

    const searchQuery = `${query} en ${location || 'Republica Dominicana'}`
    const googleUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(searchQuery)}&key=${GOOGLE_KEY}&language=es`
    
    const googleResponse = await fetch(googleUrl)
    const googleData = await googleResponse.json()
    const rawPlaces = googleData.results?.slice(0, 4) || [];

    const uiPlaces = rawPlaces.map((p: any) => {
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
    });

    const aiContext = rawPlaces.map((p: any) => ({
      n: p.name,
      r: p.rating || 0,
      c: p.user_ratings_total || 0
    }));

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Eres el Asistente de ServiAPP. Da una introducción amable y ultra-corta (máximo 2 frases).`
          },
          {
            role: 'user',
            content: `Busco: ${query}. Datos encontrados: ${JSON.stringify(aiContext)}`
          }
        ],
        max_tokens: 100
      })
    })

    const aiData = await aiResponse.json()
    const aiMessage = aiData.choices?.[0]?.message?.content || "Aquí tienes las mejores opciones."

    // 4. Incrementar contador en BD
    await supabaseAdmin
      .from('daily_ai_usage')
      .upsert(
        { user_id: user.id, usage_date: today, request_count: currentCount + 1 },
        { onConflict: 'user_id, usage_date' }
      )

    return new Response(
      JSON.stringify({ 
        response: aiMessage,
        places: uiPlaces,
        remaining: 5 - (currentCount + 1)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("[ai-search] Error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})