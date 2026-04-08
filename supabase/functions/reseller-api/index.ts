import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Authenticate Request
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing x-api-key header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Find the reseller
    const { data: keyData, error: keyError } = await supabase
      .from('reseller_api_keys')
      .select('user_id, is_active')
      .eq('api_key', apiKey)
      .single()

    if (keyError || !keyData || !keyData.is_active) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive API key' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const userId = keyData.user_id;

    // Verify role is actually reseller
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'reseller')
      .single()
      
    if (roleError || !roleData) {
      return new Response(JSON.stringify({ error: 'Unauthorized role' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Get Reseller Discount
    const { data: settingsData } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'reseller_discount_percentage')
      .single()
      
    let discount = 0;
    if (settingsData && settingsData.value) {
       discount = parseFloat(settingsData.value as string);
       if (isNaN(discount)) discount = 0;
    }

    // 2. Route Request
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop() // e.g., 'get-games', 'place-order'

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Only POST method allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const body = await req.json().catch(() => ({}))

    switch (action) {
      case 'get-games': {
        const { data: games, error } = await supabase
          .from('games')
          .select('id, name, image, description')
          .order('name');
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, games }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'get-packages': {
        const { game_id } = body;
        if (!game_id) return new Response(JSON.stringify({ error: 'Missing game_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        
        const { data: packages, error } = await supabase
          .from('packages')
          .select('id, name, price, amount, quantity, label')
          .eq('game_id', game_id)
          .order('price');
          
        if (error) throw error;

        // Apply discount
        const discountedPackages = packages.map(pkg => ({
            ...pkg,
            original_price: pkg.price,
            price: pkg.price - (pkg.price * (discount / 100))
        }));

        return new Response(JSON.stringify({ success: true, packages: discountedPackages }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'check-balance': {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('wallet_balance')
          .eq('id', userId)
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, balance: profile.wallet_balance }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      case 'place-order': {
        const { game_id, package_id, player_id, zone_id } = body;
        if (!game_id || !package_id || !player_id) {
             return new Response(JSON.stringify({ error: 'Missing required fields (game_id, package_id, player_id)' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // 1. Get Package & Game Details
        const { data: pkg, error: pkgError } = await supabase
            .from('packages')
            .select('*, games(name)')
            .eq('id', package_id)
            .eq('game_id', game_id)
            .single()

        if (pkgError || !pkg) return new Response(JSON.stringify({ error: 'Invalid package' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

        const discountedPrice = pkg.price - (pkg.price * (discount / 100));

        // 2. Lock & Check Balance (Using RPC or atomic check)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('wallet_balance, display_name')
          .eq('id', userId)
          .single();

        if (profileError || !profile) throw profileError;

        if (profile.wallet_balance < discountedPrice) {
            return new Response(JSON.stringify({ error: 'Insufficient balance', required: discountedPrice, current: profile.wallet_balance }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        // 3. Process Transaction
        const newBalance = profile.wallet_balance - discountedPrice;
        
        // Update balance
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ wallet_balance: newBalance })
            .eq('id', userId)
            
        if (updateError) throw updateError;

        // Log transaction
        await supabase
            .from('wallet_transactions')
            .insert({
                user_id: userId,
                type: 'reseller_api_purchase',
                amount: -discountedPrice,
                balance_before: profile.wallet_balance,
                balance_after: newBalance,
                description: `API Order for ${pkg.games.name} - ${pkg.name}`,
            });

        // Create Order
        const { data: order, error: orderError } = await supabase
            .from('topup_orders')
            .insert({
                user_id: userId,
                game_name: pkg.games.name,
                package_name: pkg.name,
                player_id: player_id,
                server_id: zone_id || null,
                amount: pkg.price, // Record original or discounted? Usually original is better for external APIs, but discounted is what they paid.
                currency: 'USD',
                status: 'processing',
                payment_method: 'wallet',
                g2bulk_product_id: pkg.g2bulk_product_id,
            })
            .select()
            .single();

        if (orderError) throw orderError;

        // TODO: Here you would typically also trigger your internal provider webhook (like G2Bulk) 
        // to actually fulfill the order, just like your frontend does.
        // For now, it's marked as 'processing' in your DB.

        return new Response(JSON.stringify({ 
            success: true, 
            message: 'Order placed successfully', 
            order_id: order.id,
            new_balance: newBalance 
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
  } catch (error) {
    console.error('Error in reseller API:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})