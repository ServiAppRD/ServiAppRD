import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as crypto from "https://deno.land/std@0.173.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('x-signature') || '';
    const secret = Deno.env.get('LEMONSQUEEZY_WEBHOOK_SECRET');
    const body = await req.text();

    if (!secret) {
        console.error("LEMONSQUEEZY_WEBHOOK_SECRET no configurado");
        return new Response('Webhook Secret not configured', { status: 500 });
    }

    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.crypto.subtle.importKey(
        "raw",
        encoder.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );
    const verified = await crypto.crypto.subtle.verify(
        "HMAC",
        key,
        Uint8Array.from(signature.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))),
        encoder.encode(body)
    );

    if (!verified) {
        console.error("Firma inválida");
        return new Response('Invalid signature', { status: 401 });
    }

    const payload = JSON.parse(body);
    const { meta, data } = payload;
    const eventName = meta.event_name;
    const customData = meta.custom_data || {};
    
    console.log(`[Webhook] Evento recibido: ${eventName}`, customData);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (eventName === 'order_created') {
        const userId = customData.user_id;
        const serviceId = customData.service_id;
        const durationHours = parseInt(customData.duration || '0');
        const amount = data.attributes.total_formatted;
        
        // Caso 1: Boost de Servicio
        if (serviceId && durationHours > 0) {
            console.log(`[Webhook] Activando Boost para servicio ${serviceId} por ${durationHours} horas`);
            
            const now = new Date();
            const futureDate = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

            const { error } = await supabaseAdmin
                .from('services')
                .update({ 
                    is_promoted: true, 
                    promoted_until: futureDate.toISOString() 
                })
                .eq('id', serviceId);

            if (error) {
                console.error("[Webhook] Error actualizando servicio:", error);
                throw error;
            }

            // Registrar transacción
            await supabaseAdmin.from('transactions').insert({
                user_id: userId,
                amount: data.attributes.total / 100, // Lemon envía en centavos
                description: `Boost ${durationHours}h pagado`,
                type: 'boost'
            });
        }
        
        // Caso 2: Suscripción Plus (si es one-time payment o primer pago de sub)
        if (!serviceId && userId && data.attributes.first_order_item?.product_name?.includes("Plus")) {
             console.log(`[Webhook] Activando Plus para usuario ${userId}`);
             
             // Por defecto 30 días si no es recurrente
             const now = new Date();
             const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

             await supabaseAdmin.from('profiles').update({
                 is_plus: true,
                 plus_expires_at: futureDate.toISOString()
             }).eq('id', userId);

             await supabaseAdmin.from('transactions').insert({
                user_id: userId,
                amount: data.attributes.total / 100,
                description: `Suscripción Plus`,
                type: 'subscription'
            });
        }
    }

    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
        const userId = customData.user_id;
        if (userId) {
             const renawalDate = data.attributes.renews_at;
             console.log(`[Webhook] Actualizando suscripción Plus para ${userId} hasta ${renawalDate}`);
             
             await supabaseAdmin.from('profiles').update({
                 is_plus: true,
                 plus_expires_at: renawalDate
             }).eq('id', userId);
        }
    }

    if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
        const userId = customData.user_id;
        if (userId) {
             console.log(`[Webhook] Cancelando suscripción Plus para ${userId}`);
             await supabaseAdmin.from('profiles').update({
                 is_plus: false,
                 plus_expires_at: null
             }).eq('id', userId);
        }
    }

    return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("[Webhook] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})