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
    // 1. Crear cliente de Supabase con permisos de ADMIN (Service Role)
    // Esto es necesario para borrar usuarios de auth.users
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Obtener el usuario que hace la petición (para asegurar que se borra a sí mismo)
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[delete-user] Eliminando usuario: ${user.id}`)

    // 3. Eliminar el usuario del sistema de autenticación
    // Gracias al "ON DELETE CASCADE" en la base de datos, esto borrará también
    // el perfil, servicios, favoritos, etc. automáticamente.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    )

    if (deleteError) {
        console.error("[delete-user] Error al borrar:", deleteError)
        throw deleteError
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Usuario eliminado correctamente' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("[delete-user] Error crítico:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})