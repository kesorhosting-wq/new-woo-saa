import React, { useState, useEffect } from 'react';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import { useSite } from '@/contexts/SiteContext';
import { Helmet } from 'react-helmet-async';
import { 
  Terminal, Key, ShieldCheck, Zap, Copy, CheckCircle2, BookOpen, 
  Wallet, CreditCard, ShoppingCart, ChevronRight, Menu, X, 
  Globe, Layout, Activity, Database, AlertTriangle, Info, Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";
import { useLocation, useNavigate } from 'react-router-dom';

const DocsPage: React.FC = () => {
  const { settings } = useSite();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  // Determine current section from URL
  const path = location.pathname.split('/').pop() || 'docs';
  const activeSection = path === 'docs' ? 'user' : path;

  const copyCode = (code: string, section: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSection(section);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const menuItems = [
    { id: 'user', name: 'User Guide', icon: <BookOpen className="w-4 h-4" />, path: '/docs' },
    { id: 'api', name: 'General API', icon: <Terminal className="w-4 h-4" />, path: '/docs/api' },
    { id: 'smm', name: 'SMM Protocol', icon: <Zap className="w-4 h-4" />, path: '/docs/smm' },
  ];

  const sidebarLinks = {
    user: [
      { id: 'intro', name: 'Introduction' },
      { id: 'wallet', name: 'Wallet Deposits' },
      { id: 'orders', name: 'Placing Orders' },
    ],
    api: [
      { id: 'auth', name: 'Authentication' },
      { id: 'games', name: 'Get Games' },
      { id: 'packages', name: 'Get Packages' },
      { id: 'purchase', name: 'Place Order' },
    ],
    smm: [
      { id: 'smm-intro', name: 'SMM Integration' },
      { id: 'smm-balance', name: 'Check Balance' },
      { id: 'smm-services', name: 'SMM Services' },
    ]
  };

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Developer Docs | {settings.siteName}</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#FF2D85] selection:text-white">
        <ModernHeader />
        
        <div className="flex-1 flex pt-24">
          
          {/* Sidebar */}
          <aside className={cn(
            "fixed inset-y-0 left-0 z-40 w-72 bg-slate-50 border-r border-slate-100 pt-24 transition-transform lg:translate-x-0 lg:static lg:block",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}>
            <div className="h-full overflow-y-auto px-6 py-8">
              
              <div className="mb-10">
                 <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 px-3">Protocol Selection</h5>
                 <div className="space-y-1">
                    {menuItems.map((item) => (
                       <button
                         key={item.id}
                         onClick={() => navigate(item.path)}
                         className={cn(
                           "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                           activeSection === item.id 
                             ? "bg-[#FF2D85] text-white shadow-lg shadow-pink-200" 
                             : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                         )}
                       >
                          {item.icon}
                          {item.name}
                       </button>
                    ))}
                 </div>
              </div>

              <div>
                 <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 px-3">Current Section</h5>
                 <div className="space-y-1 border-l-2 border-slate-100 ml-3">
                    {sidebarLinks[activeSection as keyof typeof sidebarLinks]?.map((link) => (
                       <button
                         key={link.id}
                         onClick={() => scrollToId(link.id)}
                         className="w-full flex items-center gap-3 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#FF2D85] transition-all text-left"
                       >
                          {link.name}
                       </button>
                    ))}
                 </div>
              </div>

            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 bg-white">
             <div className="max-w-5xl mx-auto px-8 md:px-16 py-12">
                
                {/* Mobile Sidebar Toggle */}
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#FF2D85] text-white rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-90"
                >
                   {isSidebarOpen ? <X /> : <Menu />}
                </button>

                {activeSection === 'user' && (
                   <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <section id="intro" className="space-y-6">
                         <Badge className="bg-pink-50 text-[#FF2D85] border-pink-100 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4">
                            Operational Guide v1.0
                         </Badge>
                         <h2 className="text-5xl font-black tracking-tighter uppercase text-[#3D001F] leading-none">The Lobby Protocol</h2>
                         <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">
                            Welcome to the {settings.siteName} ecosystem. This guide details how to navigate our infrastructure, manage your digital assets, and execute game load transmissions.
                         </p>
                      </section>

                      <section id="wallet" className="space-y-10">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#FF2D85] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-pink-200">
                               <Wallet className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Asset Accumulation</h3>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-4 hover:border-pink-200 transition-colors">
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400">01</div>
                               <h4 className="font-black uppercase text-sm tracking-widest">Generate Node</h4>
                               <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed tracking-tight">Navigate to Wallet Terminal and enter deposit amount. Minimum protocol requirement is $1.00.</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-4 hover:border-pink-200 transition-colors">
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400">02</div>
                               <h4 className="font-black uppercase text-sm tracking-widest">Execute Payment</h4>
                               <p className="text-xs text-slate-500 font-bold uppercase leading-relaxed tracking-tight">Scan the generated KHQR with any verified Bakong application. Verification is real-time.</p>
                            </div>
                         </div>
                      </section>

                      <section id="orders" className="space-y-10">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                               <ShoppingCart className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Transmission Log</h3>
                         </div>
                         <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5">
                               <Activity className="w-64 h-64" />
                            </div>
                            <div className="relative z-10 space-y-6">
                               <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">Step-by-Step Execution</p>
                               <div className="space-y-4">
                                  {[
                                     "Identify target game node in the primary lobby",
                                     "Select load package and specify Identity ID",
                                     "Select 'Wallet' as the funding gateway",
                                     "Confirm and wait for injection status code"
                                  ].map((step, i) => (
                                     <div key={i} className="flex items-center gap-4">
                                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black">{i+1}</div>
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-300">{step}</span>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         </div>
                      </section>
                   </div>
                )}

                {activeSection === 'api' && (
                   <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <section id="auth" className="space-y-8">
                         <h2 className="text-5xl font-black tracking-tighter uppercase text-[#3D001F] leading-none">Core Authentication</h2>
                         <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">
                            The Reseller API uses specialized security headers to authorize your transmissions. Protect your API keys as you would your main assets.
                         </p>
                         
                         <div className="bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] p-10 space-y-6">
                            <div className="flex items-center gap-4">
                               <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black uppercase rounded tracking-widest">Header</div>
                               <code className="text-sm font-black text-[#FF2D85]">x-api-key</code>
                            </div>
                            <div className="p-6 bg-white rounded-2xl border border-slate-200">
                               <pre className="text-xs font-mono text-slate-600">x-api-key: sk_live_4f8e...2a1b</pre>
                            </div>
                            <div className="flex items-start gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                               <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                               <span>Never expose your API key in client-side code. All transmissions must be executed server-to-server.</span>
                            </div>
                         </div>
                      </section>

                      <section id="games" className="space-y-8">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                               <div className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase rounded-lg tracking-widest shadow-lg shadow-green-100">POST</div>
                               <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 font-mono">/get-games</h3>
                            </div>
                         </div>
                         <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Fetch the full catalog of available gaming nodes and their required identity parameters.</p>
                         
                         <div className="bg-slate-900 rounded-[2rem] overflow-hidden group">
                            <div className="px-6 py-3 bg-slate-800 flex items-center justify-between">
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request Example</span>
                               <button onClick={() => copyCode('curl -X POST...', 'get-games')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                                  {copiedSection === 'get-games' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                               </button>
                            </div>
                            <pre className="p-8 text-[10px] font-mono text-blue-400 overflow-x-auto leading-relaxed">
{`curl -X POST https://api.woosaa.com/functions/v1/reseller-api/get-games \\
  -H "x-api-key: your_api_key_here" \\
  -H "Content-Type: application/json"`}
                            </pre>
                         </div>
                      </section>

                      <section id="purchase" className="space-y-8">
                         <div className="flex items-center gap-4">
                            <div className="px-3 py-1.5 bg-green-500 text-white text-[10px] font-black uppercase rounded-lg tracking-widest shadow-lg shadow-green-100">POST</div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 font-mono">/place-order</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-6">
                               <p className="text-sm text-slate-500 font-bold uppercase tracking-widest leading-relaxed">Execute an atomic injection of game assets. This deducts instantly from your wallet balance.</p>
                               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Body Parameters</h5>
                                  <div className="space-y-3">
                                     <div className="flex justify-between items-center"><code className="text-[10px] font-black text-[#FF2D85]">game_id</code><span className="text-[8px] font-bold text-slate-400">UUID</span></div>
                                     <div className="flex justify-between items-center"><code className="text-[10px] font-black text-[#FF2D85]">package_id</code><span className="text-[8px] font-bold text-slate-400">UUID</span></div>
                                     <div className="flex justify-between items-center"><code className="text-[10px] font-black text-[#FF2D85]">player_id</code><span className="text-[8px] font-bold text-slate-400">STRING</span></div>
                                  </div>
                               </div>
                            </div>
                            <div className="bg-slate-900 rounded-[2rem] overflow-hidden">
                               <div className="px-6 py-3 bg-slate-800 flex items-center justify-between">
                                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">JSON Schema</span>
                               </div>
                               <pre className="p-8 text-[10px] font-mono text-green-400 overflow-x-auto leading-relaxed">
{`{
  "game_id": "8f2b...",
  "package_id": "c1a9...",
  "player_id": "12345678",
  "zone_id": "optional"
}`}
                               </pre>
                            </div>
                         </div>
                      </section>
                   </div>
                )}

                {activeSection === 'smm' && (
                   <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <section id="smm-intro" className="space-y-8">
                         <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl">
                               <Globe className="w-8 h-8" />
                            </div>
                            <div>
                               <h2 className="text-4xl font-black tracking-tighter uppercase text-[#3D001F] leading-tight">SMM Gateway</h2>
                               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Social Media Marketing Logic</p>
                            </div>
                         </div>
                         <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-2xl">
                            Integrate our high-speed social signals and marketing protocols. Our SMM API allows for massive parallel execution of social transmissions.
                         </p>
                         <div className="p-8 bg-blue-50 border border-blue-100 rounded-[2.5rem] flex items-start gap-5">
                            <Info className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                            <div>
                               <h5 className="text-xs font-black uppercase tracking-widest text-blue-900 mb-2">Unified Protocol</h5>
                               <p className="text-xs text-blue-700 font-bold uppercase tracking-tight leading-relaxed">
                                  SMM services use the same <code className="bg-blue-200 px-1 rounded">x-api-key</code> used for game top-ups. One wallet, one key, multiple services.
                                </p>
                            </div>
                         </div>
                      </section>

                      <section id="smm-balance" className="space-y-8">
                         <div className="flex items-center gap-4">
                            <div className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase rounded-lg tracking-widest">GET</div>
                            <h3 className="text-xl font-black uppercase tracking-tight text-slate-900 font-mono">/smm/balance</h3>
                         </div>
                         <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-8">Response Signature</h4>
                            <pre className="text-xs font-mono text-[#FF2D85] leading-loose">
{`{
  "status": "success",
  "data": {
    "balance": 1450.75,
    "currency": "USD"
  }
}`}
                            </pre>
                         </div>
                      </section>

                      <section id="smm-services" className="space-y-10">
                         <h3 className="text-2xl font-black uppercase tracking-tight flex items-center gap-4">
                            <Database className="w-6 h-6 text-slate-400" />
                            Service Matrix
                         </h3>
                         <div className="grid grid-cols-1 gap-4">
                            {[
                               { name: 'Instagram Broadcast', id: '101', rate: '$0.05/k' },
                               { name: 'TikTok Pulse', id: '205', rate: '$0.12/k' },
                               { name: 'Facebook Echo', id: '308', rate: '$0.08/k' }
                            ].map((service) => (
                               <div key={service.id} className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl hover:border-pink-200 transition-all group">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:bg-pink-50 group-hover:text-[#FF2D85] transition-all">
                                        <Layout className="w-5 h-5" />
                                     </div>
                                     <div>
                                        <div className="text-xs font-black uppercase text-slate-900">{service.name}</div>
                                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Service ID: {service.id}</div>
                                     </div>
                                  </div>
                                  <div className="text-right">
                                     <div className="text-xs font-black text-[#FF2D85]">{service.rate}</div>
                                     <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Protocol Standard</div>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </section>
                   </div>
                )}

             </div>
          </main>
        </div>
        
        <ModernFooter />
      </div>
    </>
  );
};

export default DocsPage;
