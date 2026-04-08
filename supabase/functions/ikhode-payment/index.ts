import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function normalizeWsUrl(input?: string | null): string {
  const raw = (input || '').trim();
  if (!raw) return '';
  if (raw.startsWith('ws://') || raw.startsWith('wss://')) return raw;
  if (raw.startsWith('https://')) return `wss://${raw.slice('https://'.length)}`;
  if (raw.startsWith('http://')) return `ws://${raw.slice('http://'.length)}`;
  return raw;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: gateway } = await supabase
      .from("payment_gateways")
      .select("config, enabled")
      .eq("slug", "ikhode-bakong")
      .maybeSingle();

    const config = gateway?.config as any || {};
    const apiUrl = config.node_api_url?.replace(/\/$/, "") || "http://45.132.75.208:7777";
    const wsUrl = normalizeWsUrl(config.websocket_url) || "ws://45.132.75.208:8080";
    const webhookSecret = config.webhook_secret || "";
    
    // 🔥 FORCED OVERRIDE - BYPASSING DATABASE
    const merchantName = "WooSaa";
    const merchantId = "sonmeng_leng@bkrt";
    
    const body = await req.json();
    const { action, ...params } = body;

    if (action === "generate-khqr") {
      const { amount, orderId, playerName } = params;
      const shortTransactionId = `ORD-${orderId.slice(0, 8)}-${Date.now().toString().slice(-6)}`;
      const callbackUrl = config.custom_webhook_url ? config.custom_webhook_url.replace("{order_id}", orderId) : `${supabaseUrl}/functions/v1/ikhode-webhook/${orderId}`;

      const requestBody = {
        amount: Math.round(Number(amount) * 100) / 100,
        transactionId: shortTransactionId,
        email: params.email || "customer@woosaa.com",
        username: playerName || "Customer",
        callbackUrl: callbackUrl,
        secret: webhookSecret,
        merchantName: merchantName,
        merchantId: merchantId,
        websocketUrl: wsUrl,
      };

      console.log("[Ikhode] FORCED PAYLOAD:", JSON.stringify(requestBody));

      const response = await fetch(`${apiUrl}/generate-khqr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      return new Response(JSON.stringify({ qrCodeData: data.qrCodeData, wsUrl, orderId, amount }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
