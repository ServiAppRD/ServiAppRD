import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { frontPath, backPath, selfiePath, userId } = await req.json()
    
    // 1. Inicializar Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const AI_KEY = Deno.env.get('AI_KEY')
    if (!AI_KEY) throw new Error('AI_KEY no configurada')

    console.log(`[verify-identity] Iniciando verificación para usuario: ${userId}`)

    // 2. Generar URLs temporales para la IA (Cortas, 60 segundos)
    const getUrl = async (path: string) => {
       const { data } = await supabaseAdmin.storage.from('verification-docs').createSignedUrl(path, 60)
       return data?.signedUrl
    }

    const frontImage = await getUrl(frontPath)
    const backImage = await getUrl(backPath)
    const selfieImage = await getUrl(selfiePath)

    if(!frontImage || !backImage || !selfieImage) throw new Error("Error generando links")

    // 3. Preparar el Prompt para la IA
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Eres un experto en seguridad de República Dominicana. Analiza 3 imágenes: 
            1. Cédula Frontal
            2. Cédula Trasera
            3. Selfie del usuario.
            
            Tareas:
            1. Verifica que sea una Cédula de Identidad y Electoral Dominicana válida (no borrosa, no cortada).
            2. Verifica que la foto en la Cédula coincida con la Selfie.
            
            Responde ESTRICTAMENTE en JSON:
            {
              "approved": boolean,
              "reason": "breve explicación",
              "confidence": number (0-1)
            }`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Verifica esta identidad.' },
              { type: 'image_url', image_url: { url: frontImage } },
              { type: 'image_url', image_url: { url: backImage } },
              { type: 'image_url', image_url: { url: selfieImage } }
            ]
          }
        ],
        max_tokens: 300
      })
    })

    const aiData = await response.json()
    
    // Parsear respuesta IA
    let analysis
    try {
      const content = aiData.choices?.[0]?.message?.content || '{}'
      // Limpiar markdown si la IA lo pone
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim()
      analysis = JSON.parse(cleanContent)
    } catch (e) {
      console.error("[verify-identity] Error IA", e)
      analysis = { approved: false, reason: "Error de análisis IA", confidence: 0 }
    }

    console.log("[verify-identity] Resultado:", analysis)

    // 4. Actualizar Base de Datos según resultado
    let status = 'manual_review'
    let isVerified = false

    if (analysis.approved && analysis.confidence > 0.85) {
       status = 'verified'
       isVerified = true
    } else {
       status = 'manual_review' // Fallback a manual si la IA duda
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_verified: isVerified,
        verification_status: status
      })
      .eq('id', userId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ success: true, status, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("[verify-identity] Error crítico:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})