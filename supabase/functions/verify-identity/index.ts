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
    const { frontPath, backPath, selfiePath, userId } = await req.json()
    
    // 1. Inicializar Supabase Admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const AI_KEY = Deno.env.get('AI_KEY')
    const GMAIL_USER = Deno.env.get('GMAIL_USER')
    const GMAIL_APP_PASSWORD = Deno.env.get('GMAIL_APP_PASSWORD')

    if (!AI_KEY) throw new Error('AI_KEY no configurada')

    console.log(`[verify-identity] Iniciando verificación para usuario: ${userId}`)

    // 2. Generar URLs temporales para la IA (Cortas, 60 segundos)
    const getUrl = async (path: string, expire: number) => {
       const { data } = await supabaseAdmin.storage.from('verification-docs').createSignedUrl(path, expire)
       return data?.signedUrl
    }

    const frontImage = await getUrl(frontPath, 60)
    const backImage = await getUrl(backPath, 60)
    const selfieImage = await getUrl(selfiePath, 60)

    if(!frontImage || !backImage || !selfieImage) throw new Error("Error generando links")

    // 3. Preparar el Prompt para la IA
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

    // 4. Lógica de Decisión
    if (analysis.approved && analysis.confidence > 0.85) {
      // --- APROBADO ---
      await supabaseAdmin.from('profiles').update({ is_verified: true, verification_status: 'verified' }).eq('id', userId)

      return new Response(
        JSON.stringify({ success: true, status: 'verified', message: 'Identidad verificada.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      // --- REVISIÓN MANUAL ---
      
      await supabaseAdmin.from('profiles').update({ verification_status: 'manual_review' }).eq('id', userId)

      // Generar URLs de LARGA DURACIÓN (7 días) para el email
      const frontEmail = await getUrl(frontPath, 60 * 60 * 24 * 7)
      const backEmail = await getUrl(backPath, 60 * 60 * 24 * 7)
      const selfieEmail = await getUrl(selfiePath, 60 * 60 * 24 * 7)

      // Obtener datos del usuario
      const { data: profile } = await supabaseAdmin.from('profiles').select('first_name, last_name, email').eq('id', userId).single();
      const userName = profile ? `${profile.first_name} ${profile.last_name}` : 'Usuario Desconocido';

      if (GMAIL_USER && GMAIL_APP_PASSWORD) {
        try {
          console.log("[verify-identity] Bot enviando correo a rodrigopepe281@gmail.com...")
          
          const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: GMAIL_USER,
              pass: GMAIL_APP_PASSWORD,
            },
          });

          const mailOptions = {
            from: `"ServiAPP Bot" <${GMAIL_USER}>`,
            to: 'rodrigopepe281@gmail.com', // El correo llega AQUÍ
            subject: `⚠️ Revisión Manual: ${userName}`,
            html: `
              <div style="font-family: sans-serif; padding: 20px;">
                <h2 style="color: #F97316;">Solicitud de Verificación Manual</h2>
                <p>La IA no pudo verificar automáticamente a este usuario.</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
                  <p><strong>Usuario ID:</strong> ${userId}</p>
                  <p><strong>Nombre:</strong> ${userName}</p>
                  <p><strong>Razón IA:</strong> ${analysis.reason}</p>
                  <p><strong>Confianza IA:</strong> ${analysis.confidence}</p>
                </div>
                <h3>Evidencias (Links válidos por 7 días):</h3>
                <ul>
                  <li><a href="${frontEmail}" style="color: #F97316; font-weight: bold;">Ver Cédula Frontal</a></li>
                  <li><a href="${backEmail}" style="color: #F97316; font-weight: bold;">Ver Cédula Trasera</a></li>
                  <li><a href="${selfieEmail}" style="color: #F97316; font-weight: bold;">Ver Selfie</a></li>
                </ul>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">Este correo fue enviado automáticamente por el sistema de verificación.</p>
              </div>
            `,
          };

          await transporter.sendMail(mailOptions);
          console.log("[verify-identity] Correo enviado exitosamente.");
        
        } catch (emailError) {
          console.error("[verify-identity] Error enviando correo:", emailError);
        }
      } else {
        console.warn("[verify-identity] Credenciales GMAIL no configuradas. No se pudo enviar el reporte.");
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