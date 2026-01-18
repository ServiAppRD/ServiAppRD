import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from "npm:nodemailer@6.9.13";

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
    
    // 1. Inicializar Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const AI_KEY = Deno.env.get('AI_KEY')
    const GMAIL_USER = Deno.env.get('GMAIL_USER')
    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')

    if (!AI_KEY) throw new Error('AI_KEY no configurada')

    console.log(`[verify-identity] Iniciando verificación para usuario: ${userId} usando gpt-5-nano`)

    // 2. Preparar el Prompt para la IA
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en seguridad de RD. Analiza: Cédula Frontal, Trasera y Selfie.
            Verifica validez, coincidencia facial y legibilidad.
            Responde JSON: { "approved": boolean, "reason": "string", "confidence": number }`
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
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim()
      analysis = JSON.parse(cleanContent)
    } catch (e) {
      console.error("[verify-identity] Error IA", e)
      analysis = { approved: false, reason: "Error de análisis IA", confidence: 0 }
    }

    console.log("[verify-identity] Resultado:", analysis)

    // 3. Lógica de Decisión
    if (analysis.approved && analysis.confidence > 0.85) {
      // --- APROBADO ---
      await supabaseAdmin.from('profiles').update({ is_verified: true, verification_status: 'verified' }).eq('id', userId)

      return new Response(
        JSON.stringify({ success: true, status: 'verified', message: 'Identidad verificada.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      // --- REVISIÓN MANUAL (ENVIAR CORREO GMAIL) ---
      
      await supabaseAdmin.from('profiles').update({ verification_status: 'manual_review' }).eq('id', userId)

      // Obtener datos del usuario para el correo
      const { data: profile } = await supabaseAdmin.from('profiles').select('first_name, last_name, email').eq('id', userId).single();
      const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Usuario Desconocido';

      if (GMAIL_USER && GMAIL_APP_PASSWORD) {
        try {
          console.log("[verify-identity] Enviando correo vía Gmail...")
          
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: GMAIL_USER,
              pass: GMAIL_APP_PASSWORD,
            },
          });

          const mailOptions = {
            from: `"ServiAPP Bot" <${GMAIL_USER}>`,
            to: 'rodrigopepe281@gmail.com', // Correo destino fijo
            subject: `⚠️ Revisión Manual: ${userName}`,
            html: `
              <h1>Solicitud de Verificación Manual</h1>
              <p>La IA no pudo verificar automáticamente a este usuario.</p>
              <ul>
                <li><strong>Usuario ID:</strong> ${userId}</li>
                <li><strong>Nombre:</strong> ${userName}</li>
                <li><strong>Razón IA:</strong> ${analysis.reason}</li>
                <li><strong>Confianza IA:</strong> ${analysis.confidence}</li>
              </ul>
              <h2>Evidencias:</h2>
              <p>Haz clic para ver las imágenes:</p>
              <ul>
                <li><a href="${frontImage}">Cédula Frontal</a></li>
                <li><a href="${backImage}">Cédula Trasera</a></li>
                <li><a href="${selfieImage}">Selfie</a></li>
              </ul>
              <hr/>
              <p>Para aprobar, ve al panel de Supabase y cambia el estado a 'verified' y is_verified a TRUE.</p>
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log("[verify-identity] Correo enviado exitosamente.");
        
        } catch (emailError) {
          console.error("[verify-identity] Error enviando correo:", emailError);
          // No fallamos la request completa si falla el email, solo logueamos
        }
      } else {
        console.warn("[verify-identity] Credenciales GMAIL no configuradas. Correo omitido.");
      }

      return new Response(
        JSON.stringify({ success: false, status: 'manual_review', message: 'Pasado a revisión manual.' }),
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