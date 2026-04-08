import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Get all users from Auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    // 2. Get all existing profiles
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('id');
    if (profileError) throw profileError;

    const profileIds = new Set(profiles?.map(p => p.id));
    const missingUsers = users.filter(u => !profileIds.has(u.id));

    if (missingUsers.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'All profiles already in sync', count: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 3. Create missing profiles
    const newProfiles = missingUsers.map(u => ({
      id: u.id,
      email: u.email,
      display_name: u.user_metadata?.display_name || u.email?.split('@')[0],
      wallet_balance: 0
    }));

    const { error: insertError } = await supabase.from('profiles').upsert(newProfiles);
    if (insertError) throw insertError;

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Successfully synchronized ${newProfiles.length} missing profiles`,
      count: newProfiles.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
