import { serve } from "https://deno.land/std@0.192.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Parse Request
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { frontPath, backPath, selfiePath, userId } = body;

    if (!frontPath || !backPath || !selfiePath || !userId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // 2. Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const AI_KEY = Deno.env.get('AI_KEY');
    if (!AI_KEY) {
      console.error("AI_KEY is missing");
      // Don't expose internal config error to client, but log it
      throw new Error('Server configuration error');
    }

    console.log(`[verify-identity] Processing for user: ${userId}`);

    // 3. Generate Signed URLs (Valid for 60 seconds)
    const createUrl = async (path: string) => {
       const { data, error } = await supabaseAdmin.storage.from('verification-docs').createSignedUrl(path, 120); // increased to 120s
       if (error) throw error;
       return data?.signedUrl;
    }

    const [frontImage, backImage, selfieImage] = await Promise.all([
        createUrl(frontPath),
        createUrl(backPath),
        createUrl(selfiePath)
    ]);

    if (!frontImage || !backImage || !selfieImage) {
        throw new Error("Failed to generate access URLs for documents");
    }

    // 4. Call OpenAI API
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
            content: `You are an expert identity verification AI for Dominican Republic documents. 
            Analyze the 3 provided images: 
            1. ID Card Front
            2. ID Card Back
            3. User Selfie
            
            Tasks:
            1. Verify the ID is a valid "Cédula de Identidad y Electoral" from Dominican Republic.
            2. Check if the ID photo matches the User Selfie.
            3. Ensure documents are legible and not screen captures.
            
            Respond ONLY in JSON format:
            {
              "approved": boolean,
              "reason": "short explanation",
              "confidence": number (0.0 to 1.0)
            }`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Verify this identity.' },
              { type: 'image_url', image_url: { url: frontImage } },
              { type: 'image_url', image_url: { url: backImage } },
              { type: 'image_url', image_url: { url: selfieImage } }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0
      })
    });

    if (!aiResponse.ok) {
        const errText = await aiResponse.text();
        console.error("[verify-identity] OpenAI Error:", errText);
        throw new Error(`OpenAI API Error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    
    // 5. Parse AI Response
    let analysis;
    try {
      const content = aiData.choices?.[0]?.message?.content || '{}';
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
      analysis = JSON.parse(cleanContent);
    } catch (e) {
      console.error("[verify-identity] Failed to parse AI response", e);
      analysis = { approved: false, reason: "AI parsing error", confidence: 0 };
    }

    console.log("[verify-identity] Analysis result:", analysis);

    // 6. Update Database
    // We approve automatically only if confidence is very high
    let status = 'manual_review';
    let isVerified = false;

    if (analysis.approved && analysis.confidence > 0.85) {
       status = 'verified';
       isVerified = true;
    }

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        is_verified: isVerified,
        verification_status: status
      })
      .eq('id', userId);

    if (updateError) {
        console.error("[verify-identity] DB Update Error:", updateError);
        throw updateError;
    }

    return new Response(
      JSON.stringify({ success: true, status, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("[verify-identity] Critical Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal Server Error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
})