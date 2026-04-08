import React, { useState } from 'react';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import { useSite } from '@/contexts/SiteContext';
import { Helmet } from 'react-helmet-async';
import { Terminal, Key, ShieldCheck, Zap, Copy, CheckCircle2, BookOpen, Wallet, CreditCard, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, List, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const DocsPage: React.FC = () => {
  const { settings } = useSite();
  const { toast } = useToast();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('user');

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

  return (
    <>
      <Helmet>
        <title>Documentation | {settings.siteName}</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-pink-100 selection:text-[#FF2D85]">
        <ModernHeader />
        
        <main className="flex-1 pt-32 pb-24">
          <div className="container mx-auto px-4 max-w-5xl">
             
            {/* Header */}
            <div className="mb-12 text-center">
               <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter uppercase text-[#3D001F]">Knowledge Base</h1>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Everything you need to know about {settings.siteName || 'WOO SAA'}</p>
            </div>

            <Tabs defaultValue="user" onValueChange={setActiveTab} className="space-y-12">
               <div className="flex justify-center">
                  <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm inline-flex">
                     <TabsTrigger 
                        value="user" 
                        className={cn(
                           "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           activeTab === 'user' ? "bg-[#FF2D85] text-white shadow-lg shadow-pink-200" : "text-slate-400 hover:text-slate-600"
                        )}
                     >
                        <BookOpen className="w-4 h-4 mr-2" /> User Guide
                     </TabsTrigger>
                     <TabsTrigger 
                        value="api" 
                        className={cn(
                           "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                           activeTab === 'api' ? "bg-[#FF2D85] text-white shadow-lg shadow-pink-200" : "text-slate-400 hover:text-slate-600"
                        )}
                     >
                        <Terminal className="w-4 h-4 mr-2" /> Developer API
                     </TabsTrigger>
                  </div>
               </div>

               {/* USER GUIDE CONTENT */}
               <TabsContent value="user" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="w-14 h-14 bg-pink-50 text-[#FF2D85] rounded-2xl flex items-center justify-center">
                           <Wallet className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">How to Top-up Wallet</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                           Follow these simple steps to add credit to your account:
                        </p>
                        <ul className="space-y-4">
                           {[
                              "Navigate to the 'Wallet' page from the top menu.",
                              "Enter the amount you wish to deposit (Min $1.00).",
                              "Click 'Top Up Now' to generate a secure KHQR node.",
                              "Open your mobile banking app (ABA, ACLEDA, etc.) and scan the QR.",
                              "Funds will be credited instantly once the transaction is verified."
                           ].map((step, idx) => (
                              <li key={idx} className="flex gap-4">
                                 <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                 <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{step}</span>
                              </li>
                           ))}
                        </ul>
                     </section>

                     <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                           <ShoppingCart className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight">Instant Game Load</h3>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                           Using your wallet balance for game top-ups:
                        </p>
                        <ul className="space-y-4">
                           {[
                              "Select your favorite game from the Home Lobby.",
                              "Choose the desired package and enter your Player ID.",
                              "During checkout, select 'Wallet' as your payment method.",
                              "Confirm the transaction to initiate the injection protocol.",
                              "Check your game account - your items will arrive instantly!"
                           ].map((step, idx) => (
                              <li key={idx} className="flex gap-4">
                                 <span className="flex-shrink-0 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                                 <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{step}</span>
                              </li>
                           ))}
                        </ul>
                     </section>
                  </div>

                  <div className="bg-[#FF2D85] rounded-[3rem] p-12 text-white relative overflow-hidden text-center shadow-2xl shadow-pink-200">
                     <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                     <h3 className="text-3xl font-black uppercase mb-4 relative z-10">Need Assistance?</h3>
                     <p className="text-white/80 font-bold uppercase tracking-widest text-xs mb-8 relative z-10">Our support operators are standing by 24/7 to assist with your transmissions.</p>
                     <Button className="bg-white text-[#FF2D85] hover:bg-slate-50 font-black uppercase text-[10px] tracking-[0.2em] px-10 h-14 rounded-xl relative z-10">
                        Contact Support Protocol
                     </Button>
                  </div>
               </TabsContent>

               {/* API CONTENT */}
               <TabsContent value="api" className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                        <Key className="w-8 h-8 text-[#FF2D85] mb-4" />
                        <h3 className="font-black uppercase tracking-tight mb-2">Authentication</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                           Include your unique API Key in the <code className="bg-slate-100 px-1 py-0.5 rounded text-[#FF2D85]">x-api-key</code> header.
                        </p>
                     </div>
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                        <Zap className="w-8 h-8 text-blue-500 mb-4" />
                        <h3 className="font-black uppercase tracking-tight mb-2">Reseller Rates</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                           Endpoints return prices with your negotiated global reseller discount automatically applied.
                        </p>
                     </div>
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center text-center">
                        <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
                        <h3 className="font-black uppercase tracking-tight mb-2">Atomic Balance</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                           Transactions are deducted from your Main Wallet. Fails securely if funds are insufficient.
                        </p>
                     </div>
                  </div>

                  <div className="space-y-12">
                     <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded tracking-widest">POST</span>
                              <span className="text-white font-mono text-sm">/reseller-api/get-games</span>
                           </div>
                        </div>
                        <div className="p-8">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Fetch all available game catalogs and their required player ID parameters.</p>
                           <div className="relative">
                              <pre className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-[10px] font-mono text-slate-700 overflow-x-auto leading-relaxed">
                                 {getGamesCode}
                              </pre>
                              <button onClick={() => copyCode(getGamesCode, 'games')} className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">
                                 {copiedSection === 'games' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                              </button>
                           </div>
                        </div>
                     </section>

                     <section className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
                        <div className="bg-slate-900 px-8 py-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-[10px] font-black uppercase rounded tracking-widest">POST</span>
                              <span className="text-white font-mono text-sm">/reseller-api/place-order</span>
                           </div>
                        </div>
                        <div className="p-8">
                           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Deduct from your wallet and place a top-up order into the system queue.</p>
                           <div className="relative">
                              <pre className="bg-slate-50 border border-slate-100 p-4 rounded-xl text-[10px] font-mono text-slate-700 overflow-x-auto leading-relaxed">
                                 {placeOrderCode}
                              </pre>
                              <button onClick={() => copyCode(placeOrderCode, 'order')} className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100">
                                 {copiedSection === 'order' ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                              </button>
                           </div>
                        </div>
                     </section>
                  </div>
               </TabsContent>
            </Tabs>

          </div>
        </main>
        
        <ModernFooter />
      </div>
    </>
  );
};

export default DocsPage;
