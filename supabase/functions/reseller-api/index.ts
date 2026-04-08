import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key, x-idempotency-key',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    // Expecting: /reseller-api/v1/action or /reseller-api/api/v2
    const isV1 = pathParts.includes('v1')
    const isV2 = pathParts.includes('v2')
    const action = pathParts[pathParts.length - 1]

    const body = await req.json().catch(() => ({}))

    // 1. Authenticate Request
    let apiKey = req.headers.get('x-api-key') || req.headers.get('X-API-Key')
    
    // SMM v2 supports API key in body
    if (!apiKey && isV2 && body.key) {
      apiKey = body.key
    }

    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, message: 'Missing API Key', error_code: '401' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Find the reseller
    const { data: keyData, error: keyError } = await supabase
      .from('reseller_api_keys')
      .select('user_id, is_active')
      .eq('api_key', apiKey)
      .single()

    if (keyError || !keyData || !keyData.is_active) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid or inactive API key', error_code: '401' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const userId = keyData.user_id;

    // Verify role is reseller
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'reseller')
      .single()
      
    if (!roleData) {
      return new Response(JSON.stringify({ success: false, message: 'Unauthorized role', error_code: '403' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
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

    // 2. ROUTING LOGIC

    // --- SMM V2 PROTOCOL ---
    if (isV2) {
      const smmAction = body.action;
      
      switch (smmAction) {
        case 'services': {
          const { data: packages, error } = await supabase
            .from('packages')
            .select('id, name, price, games(name)')
            .order('name');
          if (error) throw error;
          
          return new Response(JSON.stringify(packages.map(p => ({
            service: p.id,
            name: `${p.games?.name} - ${p.name}`,
            type: "Package",
            category: p.games?.name,
            rate: (p.price - (p.price * (discount / 100))).toFixed(2),
            min: "1",
            max: "1",
            refill: false,
            cancel: false
          }))), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        case 'balance': {
          const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();
          return new Response(JSON.stringify({ balance: profile?.wallet_balance?.toFixed(4) || "0.0000", currency: "USD" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        case 'add': {
          const { service, link, quantity } = body;
          if (!service || !link) return new Response(JSON.stringify({ error: "Service and Link required" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          
          // Split link for PlayerID|ServerID
          const [playerId, serverId] = link.split('|');

          const { data: pkg } = await supabase.from('packages').select('*, games(name)').eq('id', service).single();
          if (!pkg) return new Response(JSON.stringify({ error: "Service not found" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

          const price = pkg.price - (pkg.price * (discount / 100));
          const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();

          if (!profile || profile.wallet_balance < price) return new Response(JSON.stringify({ error: "Insufficient balance" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

          // Atomic Deduction & Order
          const { data: order } = await supabase.from('topup_orders').insert({
            user_id: userId,
            game_name: pkg.games.name,
            package_name: pkg.name,
            player_id: playerId,
            server_id: serverId || null,
            amount: price,
            status: 'pending',
            payment_method: 'api_v2'
          }).select().single();

          await supabase.from('profiles').update({ wallet_balance: profile.wallet_balance - price }).eq('id', userId);

          return new Response(JSON.stringify({ order: order?.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        case 'status': {
          if (body.orders) {
            const ids = body.orders.split(',');
            const { data: orders } = await supabase.from('topup_orders').select('id, status, amount').in('id', ids);
            const res: any = {};
            orders?.forEach(o => {
              res[o.id] = { charge: o.amount.toFixed(3), status: o.status, currency: "USD" };
            });
            return new Response(JSON.stringify(res), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
          }
          const { data: order } = await supabase.from('topup_orders').select('status, amount').eq('id', body.order).single();
          return new Response(JSON.stringify({ charge: order?.amount.toFixed(3), status: order?.status, currency: "USD" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    // --- MAIN V1 API PROTOCOL ---
    switch (action) {
      case 'getMe': {
        const { data: profile } = await supabase.from('profiles').select('id, display_name, email, wallet_balance').eq('id', userId).single();
        return new Response(JSON.stringify({
          success: true,
          user_id: profile?.id,
          username: profile?.display_name || profile?.email?.split('@')[0],
          balance: profile?.wallet_balance || 0
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'category': {
        const { data: games } = await supabase.from('games').select('id, name, image, description');
        return new Response(JSON.stringify({ success: true, categories: games?.map(g => ({ id: g.id, title: g.name, image_url: g.image })) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'products': {
        const { data: pkgs } = await supabase.from('packages').select('*, games(name)');
        return new Response(JSON.stringify({
          success: true,
          products: pkgs?.map(p => ({
            id: p.id,
            title: p.name,
            category_title: p.games?.name,
            unit_price: p.price - (p.price * (discount / 100)),
            stock: 999 // Placeholder
          }))
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'games': {
        const { data: games } = await supabase.from('games').select('id, name, image');
        return new Response(JSON.stringify({ success: true, games: games?.map(g => ({ id: g.id, code: g.id, name: g.name })) }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'order':
      case 'purchase': {
        // Shared logic for V1 purchase
        const pkgId = body.package_id || url.pathname.split('/')[3]; // Support both body and path param
        const { data: pkg } = await supabase.from('packages').select('*, games(name)').eq('id', pkgId).single();
        if (!pkg) return new Response(JSON.stringify({ success: false, message: 'Package not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

        const price = pkg.price - (pkg.price * (discount / 100));
        const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', userId).single();

        if (!profile || profile.wallet_balance < price) {
          return new Response(JSON.stringify({ success: false, message: 'Insufficient balance', error_code: '402' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        const { data: newOrder } = await supabase.from('topup_orders').insert({
          user_id: userId,
          game_name: pkg.games.name,
          package_name: pkg.name,
          player_id: body.player_id || 'N/A',
          amount: price,
          status: 'pending',
          payment_method: 'api_v1'
        }).select().single();

        await supabase.from('profiles').update({ wallet_balance: profile.wallet_balance - price }).eq('id', userId);

        return new Response(JSON.stringify({ success: true, order_id: newOrder?.id, status: "PENDING" }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'orders': {
        const { data: orders } = await supabase.from('topup_orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
        return new Response(JSON.stringify({ success: true, orders }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'transactions': {
        const { data: txs } = await supabase.from('wallet_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
        return new Response(JSON.stringify({ success: true, data: txs }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      default:
        return new Response(JSON.stringify({ success: false, message: 'Invalid Action' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
})