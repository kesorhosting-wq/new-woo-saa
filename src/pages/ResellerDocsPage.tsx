import React, { useState } from 'react';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import { useSite } from '@/contexts/SiteContext';
import { Helmet } from 'react-helmet-async';
import { Terminal, Key, ShieldCheck, Zap, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const ResellerDocsPage: React.FC = () => {
  const { settings } = useSite();
  const { toast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getGamesCode = `curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/reseller-api/get-games \\
  -H "x-api-key: your_api_key_here" \\
  -H "Content-Type: application/json"`;

  const getPackagesCode = `curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/reseller-api/get-packages \\
  -H "x-api-key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"game_id": "uuid-of-game"}'`;

  const placeOrderCode = `curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/reseller-api/place-order \\
  -H "x-api-key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "game_id": "uuid-of-game",
    "package_id": "uuid-of-package",
    "player_id": "12345678",
    "zone_id": "1234"
  }'`;

  const checkBalanceCode = `curl -X POST https://[PROJECT_REF].supabase.co/functions/v1/reseller-api/check-balance \\
  -H "x-api-key: your_api_key_here" \\
  -H "Content-Type: application/json"`;

  return (
    <>
      <Helmet>
        <title>API Documentation | {settings.siteName}</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-pink-100 selection:text-[#FF2D85]">
        <ModernHeader />
        
        <main className="flex-1 pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-5xl">
             
            {/* Header */}
            <div className="mb-16 text-center">
               <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF2D85]/10 text-[#FF2D85] rounded-2xl mb-6">
                  <Terminal className="w-8 h-8" />
               </div>
               <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase text-[#3D001F]">Reseller API Protocol</h1>
               <p className="text-slate-500 font-bold uppercase tracking-widest">Integrate our top-up infrastructure directly into your platform.</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
               <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <Key className="w-8 h-8 text-[#FF2D85] mb-4" />
                  <h3 className="font-black uppercase tracking-tight mb-2">Authentication</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                     Include your unique API Key in the <code className="bg-slate-100 px-1 py-0.5 rounded text-[#FF2D85]">x-api-key</code> header for every request. Contact admin to generate your key.
                  </p>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <Zap className="w-8 h-8 text-blue-500 mb-4" />
                  <h3 className="font-black uppercase tracking-tight mb-2">Discounted Pricing</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                     The `/get-packages` endpoint automatically returns prices with your global reseller discount applied.
                  </p>
               </div>
               <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                  <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
                  <h3 className="font-black uppercase tracking-tight mb-2">Atomic Deductions</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                     Orders are placed using your Main Wallet balance. If balance is insufficient, the transaction fails securely.
                  </p>
               </div>
            </div>

            {/* Endpoints */}
            <div className="space-y-12">
               
               {/* Get Games */}
               <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
                  <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded tracking-widest">POST</span>
                        <span className="text-white font-mono text-sm">/reseller-api/get-games</span>
                     </div>
                  </div>
                  <div className="p-8">
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Fetch all available game catalogs and their required player ID parameters.</p>
                     <div className="relative">
                        <pre className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto">
                           {getGamesCode}
                        </pre>
                        <button 
                           onClick={() => copyCode(getGamesCode, 'games')}
                           className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                           {copiedSection === 'games' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </button>
                     </div>
                  </div>
               </section>

               {/* Get Packages */}
               <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
                  <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded tracking-widest">POST</span>
                        <span className="text-white font-mono text-sm">/reseller-api/get-packages</span>
                     </div>
                  </div>
                  <div className="p-8">
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Fetch available packages for a specific game with your reseller discount applied.</p>
                     <div className="relative">
                        <pre className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto">
                           {getPackagesCode}
                        </pre>
                        <button 
                           onClick={() => copyCode(getPackagesCode, 'packages')}
                           className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                           {copiedSection === 'packages' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </button>
                     </div>
                  </div>
               </section>

               {/* Check Balance */}
               <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
                  <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded tracking-widest">POST</span>
                        <span className="text-white font-mono text-sm">/reseller-api/check-balance</span>
                     </div>
                  </div>
                  <div className="p-8">
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Check your current available Main Wallet balance.</p>
                     <div className="relative">
                        <pre className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto">
                           {checkBalanceCode}
                        </pre>
                        <button 
                           onClick={() => copyCode(checkBalanceCode, 'balance')}
                           className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                           {copiedSection === 'balance' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </button>
                     </div>
                  </div>
               </section>

               {/* Place Order */}
               <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
                  <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded tracking-widest">POST</span>
                        <span className="text-white font-mono text-sm">/reseller-api/place-order</span>
                     </div>
                  </div>
                  <div className="p-8">
                     <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Deduct from your wallet and place a top-up order into the system queue.</p>
                     <div className="relative">
                        <pre className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto">
                           {placeOrderCode}
                        </pre>
                        <button 
                           onClick={() => copyCode(placeOrderCode, 'order')}
                           className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                           {copiedSection === 'order' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                        </button>
                     </div>
                  </div>
               </section>

            </div>
          </div>
        </main>
        
        <ModernFooter />
      </div>
    </>
  );
};

export default ResellerDocsPage;
