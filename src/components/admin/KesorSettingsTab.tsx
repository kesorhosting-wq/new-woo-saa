import React, { useState, useEffect } from 'react';
import { Save, Server, Key, Link, Loader2, TestTube, Globe, Wifi, ShieldCheck, Zap, User, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface IkhodeConfig {
  node_api_url: string;
  websocket_url: string;
  webhook_secret: string;
  custom_webhook_url: string;
  merchant_name: string;
  merchant_id: string;
}

interface GatewayData {
  id: string;
  slug: string;
  name: string;
  enabled: boolean;
  config: IkhodeConfig;
}

const defaultConfig: IkhodeConfig = {
  node_api_url: '',
  websocket_url: '',
  webhook_secret: '',
  custom_webhook_url: '',
  merchant_name: 'Kesor',
  merchant_id: ''
};

const KesorSettingsTab: React.FC = () => {
  const [gateway, setGateway] = useState<GatewayData | null>(null);
  const [config, setConfig] = useState<IkhodeConfig>(defaultConfig);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_gateways')
        .select('*')
        .eq('slug', 'ikhode-bakong')
        .maybeSingle();
      
      if (error) throw error;

      if (data) {
        const configData = (data.config as any) || defaultConfig;
        setGateway({
          id: data.id,
          slug: data.slug,
          name: data.name,
          enabled: data.enabled || false,
          config: configData
        });
        setConfig({
          ...defaultConfig,
          ...configData
        });
        setEnabled(data.enabled || false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!gateway) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('payment_gateways')
        .update({
          enabled,
          config: config,
          updated_at: new Date().toISOString()
        })
        .eq('id', gateway.id);

      if (error) throw error;
      toast({ title: 'Gateway Config Synchronized' });
    } catch (error) {
      toast({ title: 'Sync Failed', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ikhode-payment', {
        body: { action: 'test-connection' }
      });
      if (data?.success) toast({ title: 'Link Active', description: data.message });
      else throw new Error(data?.error);
    } catch (error: any) {
      toast({ title: 'Link Offline', description: error.message, variant: 'destructive' });
    } finally {
      setTesting(false);
    }
  };

  const webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ikhode-webhook`;

  if (loading) return null;

  return (
    <div className="space-y-10 text-black">
      <div className="bg-white border-2 border-pink-100 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 text-pink-500">
            <Server className="w-48 h-48" />
         </div>

         <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-5">
               <div className="w-14 h-14 bg-[#FF2D85] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                  <Zap className="w-7 h-7 text-white" />
               </div>
               <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight text-[#3D001F]">Ikhode Gateway Hub</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Bakong KHQR Transmission Terminal</p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Node Power</span>
               <Switch checked={enabled} onCheckedChange={setEnabled} className="data-[state=checked]:bg-[#FF2D85]" />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-3">
               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <User className="w-3 h-3" /> Merchant Display Name
               </Label>
               <Input 
                  value={config.merchant_name}
                  onChange={(e) => setConfig({ ...config, merchant_name: e.target.value })}
                  placeholder="e.g. Kesor"
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-black" 
               />
            </div>
            <div className="space-y-3">
               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> Bakong Account ID (merchantId)
               </Label>
               <Input 
                  value={config.merchant_id}
                  onChange={(e) => setConfig({ ...config, merchant_id: e.target.value })}
                  placeholder="e.g. example@bkrt"
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-black" 
               />
            </div>
            <div className="space-y-3">
               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Node API Link</Label>
               <Input 
                  value={config.node_api_url}
                  onChange={(e) => setConfig({ ...config, node_api_url: e.target.value })}
                  placeholder="https://api.node.example"
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-black" 
               />
            </div>
            <div className="space-y-3">
               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WebSocket Stream URL</Label>
               <Input 
                  value={config.websocket_url}
                  onChange={(e) => setConfig({ ...config, websocket_url: e.target.value })}
                  placeholder="wss://ws.example"
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-black" 
               />
            </div>
            <div className="space-y-3 md:col-span-2">
               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Webhook Secret</Label>
               <div className="relative">
                  <Input 
                     type={showSecret ? "text" : "password"}
                     value={config.webhook_secret}
                     onChange={(e) => setConfig({ ...config, webhook_secret: e.target.value })}
                     className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold text-black pr-14" 
                  />
                  <button onClick={() => setShowSecret(!showSecret)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#FF2D85]">
                     {showSecret ? <Key className="w-5 h-5" /> : <Key className="w-5 h-5 opacity-30" />}
                  </button>
               </div>
            </div>
         </div>

         <div className="flex flex-wrap gap-4 mt-12 pt-10 border-t border-slate-50">
            <Button onClick={handleSave} disabled={saving} className="h-16 px-12 bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-all">
               {saving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
               Sync Node Config
            </Button>
            <Button onClick={handleTestConnection} disabled={testing} variant="outline" className="h-16 px-10 border-pink-100 text-[#FF2D85] font-black uppercase text-[10px] tracking-[0.2em] rounded-2xl hover:bg-pink-50">
               {testing ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
               Probe Link
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="bg-pink-50/50 border-2 border-pink-100 rounded-[2.5rem] p-8">
            <h4 className="font-black text-[#FF2D85] uppercase text-[10px] tracking-[0.3em] mb-4">Transmission Payload</h4>
            <pre className="text-[10px] font-mono bg-white p-6 rounded-2xl border border-pink-100 overflow-x-auto text-[#3D001F]">
{`POST /generate-khqr
{
  "amount": 10.00,
  "transactionId": "ORD-...",
  "merchantName": "${config.merchant_name}",
  "merchantId": "${config.merchant_id}",
  "websocketUrl": "${config.websocket_url}",
  "callbackUrl": "https://...",
  "secret": "****"
}`}
            </pre>
         </div>
         <div className="bg-slate-50/50 border-2 border-slate-100 rounded-[2.5rem] p-8 flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
               <Link className="w-6 h-6 text-[#FF2D85]" />
               <h4 className="font-black text-[#3D001F] uppercase text-[10px] tracking-[0.3em]">Callback Node Target</h4>
            </div>
            <code className="text-[10px] bg-white p-4 rounded-xl border border-slate-100 break-all text-slate-400 font-bold">
               {webhookUrl}/{'{order_id}'}
            </code>
         </div>
      </div>
    </div>
  );
};

export default KesorSettingsTab;
