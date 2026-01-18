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
    const { frontImage, backImage, selfieImage, userId } = await req.json()
    
    // 1. Inicializar Supabase Admin (para actualizar perfil si es exitoso)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const AI_KEY = Deno.env.get('AI_KEY')

    if (!AI_KEY) {
      throw new Error('AI_KEY no configurada')
    }

    console.log(`[verify-identity] Iniciando verificación para usuario: ${userId} usando gpt-5-nano`)

    // 2. Preparar el Prompt para la IA
    // Nota: Asumimos que la API acepta imágenes en formato URL o base64 en el contenido del mensaje
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano', // Tu modelo específico
        messages: [
          {
            role: 'system',
            content: `Eres un experto en seguridad y verificación de identidad de la República Dominicana. 
            Tu trabajo es analizar 3 imágenes: Cédula Frontal, Cédula Trasera y una Selfie.
            Debes verificar:
            1. Que sea una Cédula de Identidad y Electoral Dominicana válida y no una falsificación obvia.
            2. Que la foto de la cédula coincida razonablemente con la persona de la selfie.
            3. Que los datos sean legibles.
            
            Responde EXCLUSIVAMENTE con un objeto JSON con este formato:
            { "approved": boolean, "reason": "string", "confidence": number }`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Verifica esta identidad por favor.' },
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
    console.log("[verify-identity] Respuesta IA Raw:", JSON.stringify(aiData))

    if (!aiData.choices || !aiData.choices[0]) {
      throw new Error("Error conectando con el modelo de IA")
    }

    // Parsear respuesta de la IA
    let analysis
    try {
      const content = aiData.choices[0].message.content
      // Intentar limpiar el json si viene con markdown
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim()
      analysis = JSON.parse(cleanContent)
    } catch (e) {
      console.error("[verify-identity] Error parseando JSON de IA", e)
      analysis = { approved: false, reason: "Error de análisis IA", confidence: 0 }
    }

    console.log("[verify-identity] Análisis final:", analysis)

    // 3. Lógica de Decisión
    if (analysis.approved && analysis.confidence > 0.85) {
      // CASO APROBADO AUTOMÁTICAMENTE
      await supabaseAdmin
        .from('profiles')
        .update({ 
          is_verified: true, 
          verification_status: 'verified' 
        })
        .eq('id', userId)

      return new Response(
        JSON.stringify({ success: true, status: 'verified', message: 'Identidad verificada exitosamente' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      // CASO REVISIÓN MANUAL
      await supabaseAdmin
        .from('profiles')
        .update({ 
          verification_status: 'manual_review' 
        })
        .eq('id', userId)

      // 4. Enviar Correo al Admin (Simulado/Placeholder)
      // Nota: Para enviar emails reales, se recomienda usar Resend o SendGrid.
      // Aquí hacemos el log para que quede registrado el intento.
      console.log(`[verify-identity] ALERTA: Verificación fallida o dudosa.`)
      console.log(`[verify-identity] Enviando correo a: rodrigopepe281@gmail.com`)
      console.log(`[verify-identity] Datos: Usuario ${userId}. Razón IA: ${analysis.reason}`)
      
      // Si tuvieras una API de email configurada, aquí harías el fetch:
      /*
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_KEY}` },
        body: JSON.stringify({
          from: 'ServiAPP <noreply@serviapp.com>',
          to: 'rodrigopepe281@gmail.com',
          subject: 'Revisión Manual de Identidad Requerida',
          html: `<p>El usuario ${userId} requiere verificación manual.</p><p>Links: ${frontImage}, ${selfieImage}</p>`
        })
      })
      */

      return new Response(
        JSON.stringify({ success: false, status: 'manual_review', message: 'Tu verificación ha pasado a revisión manual por nuestro equipo.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error("[verify-identity] Error crítico:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})