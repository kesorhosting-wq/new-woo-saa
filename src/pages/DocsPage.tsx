import React, { useState, useEffect } from 'react';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import { useSite } from '@/contexts/SiteContext';
import { Helmet } from 'react-helmet-async';
import { 
  Terminal, Key, ShieldCheck, Zap, Copy, CheckCircle2, BookOpen, 
  Wallet, CreditCard, ShoppingCart, ChevronRight, Menu, X, 
  Globe, Layout, Activity, Database, AlertTriangle, Info, Server,
  User, Box, List, History, Search, RefreshCw, Lock, ShieldAlert, Clock, Code2,
  AlertCircle, ChevronDown, Cpu, Network
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
    { id: 'api', name: 'Main API v1', icon: <Terminal className="w-4 h-4" />, path: '/docs/api' },
    { id: 'smm', name: 'SMM Panel v2', icon: <Zap className="w-4 h-4" />, path: '/docs/smm' },
  ];

  const sidebarLinks = {
    user: [
      { id: 'user-intro', name: 'Introduction' },
      { id: 'user-wallet', name: 'Wallet Deposits' },
      { id: 'user-orders', name: 'Buying Items' },
    ],
    api: [
      { id: 'api-auth', name: 'Authentication' },
      { id: 'api-user', name: 'User Endpoints' },
      { id: 'api-products', name: 'Products & Category' },
      { id: 'api-orders', name: 'Order History' },
      { id: 'api-games', name: 'Games & Top-ups' },
      { id: 'api-eta', name: 'ETA Estimates' },
      { id: 'api-callbacks', name: 'Webhooks/Callbacks' },
      { id: 'api-legacy', name: 'Legacy Routes' },
      { id: 'api-transactions', name: 'Transactions' },
      { id: 'api-errors', name: 'Error Handling' },
    ],
    smm: [
      { id: 'smm-auth', name: 'Body Authentication' },
      { id: 'smm-services', name: 'Get Services' },
      { id: 'smm-add', name: 'Add Order' },
      { id: 'smm-status', name: 'Order Status' },
      { id: 'smm-multi', name: 'Multiple Status' },
      { id: 'smm-balance', name: 'Check Balance' },
      { id: 'smm-php', name: 'PHP Integration' },
    ]
  };

  const scrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      window.scrollTo({ top: elementRect - bodyRect - offset, behavior: 'smooth' });
      setIsSidebarOpen(false);
    }
  };

  const Endpoint = ({ method, path, auth = true, description, headers, body, response, id, note, badges = [] }: any) => (
    <section id={id} className="space-y-6 pt-16 first:pt-0 border-t border-slate-50 first:border-0">
      <div className="flex flex-wrap items-center gap-3">
        <Badge className={cn("px-2 py-0.5 text-[9px] font-black uppercase rounded shadow-sm", method === 'POST' ? "bg-green-500" : "bg-blue-500")}>{method}</Badge>
        <code className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-1 rounded">{path}</code>
        {auth && <Badge variant="outline" className="text-[8px] font-black uppercase border-amber-200 text-amber-600 bg-amber-50">Auth Required</Badge>}
        {!auth && <Badge variant="outline" className="text-[8px] font-black uppercase border-green-200 text-green-600 bg-green-50">Public</Badge>}
        {badges.map((b: string, i: number) => <Badge key={i} className="bg-slate-900 text-white text-[8px] font-black uppercase rounded px-2 py-0.5">{b}</Badge>)}
      </div>
      
      <p className="text-sm text-slate-500 font-bold uppercase tracking-tight leading-relaxed">{description}</p>
      {note && <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 text-[10px] text-blue-700 font-bold uppercase leading-relaxed"><Info className="w-4 h-4 shrink-0" />{note}</div>}
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          {headers && (
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Headers</span></div>
              <pre className="p-4 text-[10px] font-mono text-pink-400 overflow-x-auto">{headers}</pre>
            </div>
          )}
          {body && (
            <div className="bg-slate-900 rounded-2xl overflow-hidden">
              <div className="px-4 py-2 bg-slate-800 border-b border-slate-700 flex items-center justify-between">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Payload</span>
                <button onClick={() => copyCode(body, id + '-body')} className="p-1 hover:bg-slate-700 rounded text-slate-400">{copiedSection === id + '-body' ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}</button>
              </div>
              <pre className="p-4 text-[10px] font-mono text-blue-400 overflow-x-auto leading-relaxed">{body}</pre>
            </div>
          )}
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden">
          <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">JSON Response</span>
            <button onClick={() => copyCode(response, id + '-res')} className="p-1 hover:bg-slate-100 rounded text-slate-400">{copiedSection === id + '-res' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}</button>
          </div>
          <pre className="p-4 text-[10px] font-mono text-slate-600 overflow-x-auto leading-relaxed">{response}</pre>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <Helmet><title>API & Developer Docs | {settings.siteName}</title></Helmet>
      <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#FF2D85] selection:text-white">
        <ModernHeader />
        <div className="flex-1 flex pt-24">
          <aside className={cn("fixed inset-y-0 left-0 z-40 w-72 bg-slate-50 border-r border-slate-100 pt-24 transition-transform lg:translate-x-0 lg:fixed lg:h-screen", isSidebarOpen ? "translate-x-0" : "-translate-x-full")}>
            <div className="h-full overflow-y-auto px-6 py-8 pb-32">
              <div className="mb-10">
                 <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 px-3">Protocol Gateway</h5>
                 <div className="space-y-1">{menuItems.map((item) => (<button key={item.id} onClick={() => navigate(item.path)} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeSection === item.id ? "bg-[#FF2D85] text-white shadow-lg shadow-pink-200" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900")}>{item.icon}{item.name}</button>))}</div>
              </div>
              <div>
                 <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 px-3">Documentation Index</h5>
                 <div className="space-y-1 border-l-2 border-slate-100 ml-3">{sidebarLinks[activeSection as keyof typeof sidebarLinks]?.map((link) => (<button key={link.id} onClick={() => scrollToId(link.id)} className="w-full flex items-center gap-3 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#FF2D85] transition-all text-left">{link.name}</button>))}</div>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0 bg-white lg:ml-72">
             <div className="max-w-6xl mx-auto px-6 md:px-12 py-12">
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-6 right-6 z-50 w-12 h-12 bg-[#FF2D85] text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90"><Menu className="w-5 h-5" /></button>

                {activeSection === 'user' && (
                   <div className="space-y-24 animate-in fade-in duration-700">
                      <section id="user-intro" className="space-y-6">
                         <h1 className="text-5xl font-black tracking-tighter uppercase text-[#3D001F] leading-none">Marketplace Guide</h1>
                         <p className="text-slate-500 text-lg font-medium max-w-2xl leading-relaxed">Instructions for manual asset management and game top-up execution via our primary user interface.</p>
                      </section>
                      <section id="user-wallet" className="space-y-10">
                         <div className="flex items-center gap-4"><div className="w-12 h-12 bg-[#FF2D85] rounded-2xl flex items-center justify-center text-white shadow-lg"><Wallet className="w-6 h-6" /></div><h3 className="text-3xl font-black uppercase tracking-tight">Wallet Funding</h3></div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-4 hover:border-pink-200 transition-colors"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-[10px] text-slate-400">01</div><h4 className="font-black uppercase text-sm tracking-widest">Node Request</h4><p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Enter deposit amount. System generates a secure KHQR funding node instantly.</p></div>
                            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 space-y-4 hover:border-pink-200 transition-colors"><div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-black text-[10px] text-slate-400">02</div><h4 className="font-black uppercase text-sm tracking-widest">Instant Verification</h4><p className="text-[10px] text-slate-500 font-bold uppercase leading-relaxed">Assets are credited instantly upon payment confirmation from the banking network.</p></div>
                         </div>
                      </section>
                   </div>
                )}

                {activeSection === 'api' && (
                   <div className="space-y-32 animate-in fade-in duration-700">
                      <section id="api-auth" className="space-y-8">
                         <h1 className="text-5xl font-black tracking-tighter uppercase text-[#3D001F] leading-none">Authentication</h1>
                         <div className="p-10 bg-slate-900 rounded-[3rem] text-white space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-12 opacity-5"><Lock className="w-64 h-64" /></div>
                            <div className="space-y-4">
                               <h3 className="text-2xl font-black uppercase tracking-tight">API Key Authentication</h3>
                               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-2xl">Protected endpoints require authentication using an API key. Include your API key in the request header for all authenticated requests.</p>
                            </div>
                            <div className="space-y-6">
                               <div className="space-y-3">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Required Header</span>
                                  <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between group">
                                     <code className="text-sm font-black font-mono text-[#FF2D85]">X-API-Key: your_api_key_here</code>
                                     <button onClick={() => copyCode('X-API-Key: your_api_key_here', 'h-key')} className="opacity-0 group-hover:opacity-100 transition-opacity"><Copy className="w-4 h-4 text-slate-500" /></button>
                                  </div>
                               </div>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4">
                                     <Network className="w-6 h-6 text-blue-400 shrink-0" />
                                     <div><h5 className="text-[10px] font-black uppercase mb-1">Get Your Key</h5><p className="text-[9px] font-bold text-blue-300 uppercase leading-relaxed">Obtain an API key instantly from our Telegram Bot or Admin Panel.</p></div>
                                  </div>
                                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-4">
                                     <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />
                                     <div><h5 className="text-[10px] font-black uppercase mb-1">Security Warning</h5><p className="text-[9px] font-bold text-red-300 uppercase leading-relaxed">Multiple failed auth attempts trigger a permanent IP ban. Keep keys secure.</p></div>
                                  </div>
                               </div>
                            </div>
                         </div>
                      </section>

                      <section id="api-user" className="space-y-12"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">User Endpoints</h2>
                         <Endpoint id="get-me" method="GET" path="/v1/getMe" description="Retrieve authenticated user details including balance, username, and user ID." response={`{\n    "success": true,\n    "user_id": 123456789,\n    "username": "johndoe",\n    "first_name": "John Doe",\n    "balance": 8.74\n}`} />
                      </section>

                      <section id="api-products" className="space-y-20"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Products & Categories</h2>
                         <Endpoint id="category" method="GET" path="/v1/category" auth={false} description="Retrieve all available product categories with product counts." response={`{\n    "success": true,\n    "categories": [\n        {\n            "id": 1,\n            "title": "PUBG Mobile UC Vouchers",\n            "product_count": 11\n        }\n    ]\n}`} />
                         <Endpoint id="products" method="GET" path="/v1/products" auth={false} description="Retrieve all available products with pricing and stock information." response={`{\n    "success": true,\n    "products": [\n        {\n            "id": 1,\n            "title": "60 UC Voucher",\n            "unit_price": 0.84,\n            "stock": 1006\n        }\n    ]\n}`} />
                         <Endpoint id="purchase" method="POST" path="/v1/products/:id/purchase" description="Purchase a product with specified quantity. Balance is automatically deducted. Idempotency protection recommended." headers={`X-API-Key: your_key\nX-Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000`} body={`{ "quantity": 5 }`} response={`{\n    "success": true,\n    "order_id": 123,\n    "transaction_id": 456,\n    "product_title": "60 UC Voucher",\n    "delivery_items": ["KEY1", "KEY2", "KEY3"]\n}`} />
                      </section>

                      <section id="api-orders" className="space-y-16"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Order Management</h2>
                         <Endpoint id="orders-list" method="GET" path="/v1/orders" description="Retrieve paginated order history for the authenticated user, sorted by most recent." response={`{\n    "success": true,\n    "orders": [\n        { "id": 1, "status": "COMPLETED", "total_price": "0.840", "created_at": "2025-10-19T..." }\n    ],\n    "pagination": { "page": 1, "limit": 50, "total": 120 }\n}`} />
                      </section>

                      <section id="api-games" className="space-y-20"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Games & Top-up Services</h2>
                         <Endpoint id="games-list" method="GET" path="/v1/games" auth={false} description="Retrieve all supported games for top-up services." response={`{\n    "success": true,\n    "games": [\n        { "id": 1, "code": "pubg_mobile", "name": "PUBG Mobile" }\n    ]\n}`} />
                         <Endpoint id="game-fields" method="POST" path="/v1/games/fields" auth={false} description="Get required input fields for a specific game (e.g., user ID, server ID)." body={`{ "game": "mlbb" }`} response={`{ "code": "200", "info": { "fields": ["userid", "serverid"] } }`} />
                         <Endpoint id="game-servers" method="POST" path="/v1/games/servers" auth={false} description="Get available server list for a specific game. Returns 403 if no servers required." body={`{ "game": "mlbb" }`} response={`{ "code": "200", "servers": { "America": "America", "Europe": "Europe" } }`} />
                         <Endpoint id="game-catalogue" method="GET" path="/v1/games/:code/catalogue" auth={false} description="Get all denominations for a game. Updated every 5 minutes." response={`{ "success": true, "catalogues": [{ "id": 1, "name": "60 UC", "amount": 0.88 }] }`} />
                         <Endpoint id="place-game-order" method="POST" path="/v1/games/:code/order" description="Place a game top-up order. Idempotency Key is recommended." headers={`X-API-Key: your_key\nX-Idempotency-Key: UUID`} body={`{\n    "catalogue_name": "60 UC",\n    "player_id": "5679523421",\n    "server_id": "2001",\n    "callback_url": "https://your-domain.com/webhook"\n}`} response={`{ "success": true, "order": { "order_id": 42, "status": "PENDING" } }`} />
                      </section>

                      <section id="api-verify" className="space-y-12">
                         <h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">ID Verification</h2>
                         <Endpoint id="check-player" method="POST" path="/v1/games/checkPlayerId" auth={false} description="Validate a player ID before placing an order. Returns player name if valid." body={`{ "game": "mlbb", "user_id": "123456789", "server_id": "2001" }`} response={`{ "valid": "valid", "name": "John Doe", "openid": "41581795..." }`} />
                      </section>

                      <section id="api-eta" className="space-y-12 pt-16 border-t border-slate-50">
                         <div className="flex items-center gap-4"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">ETA Estimates</h2><Badge className="bg-blue-500 text-white text-[8px] font-black px-2 py-1 rounded">NEW</Badge></div>
                         <p className="text-sm text-slate-500 font-bold uppercase tracking-tight leading-relaxed max-w-3xl">Obtain estimated completion times for specific denominations based on real-time system performance.</p>
                         <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
                            <table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr className="text-[10px] font-black uppercase text-slate-400"><th className="p-6">Label</th><th className="p-6">Display Text</th><th className="p-6">Time Range</th></tr></thead>
                               <tbody className="divide-y divide-slate-50 text-[10px] font-bold uppercase text-slate-600">
                                  <tr><td className="p-6 font-mono text-pink-500">instant</td><td className="p-6">Instant</td><td className="p-6">Less than 30 seconds</td></tr>
                                  <tr><td className="p-6 font-mono text-pink-500">less_than_5_minutes</td><td className="p-6">Less than 5 minutes</td><td className="p-6">2 – 5 minutes</td></tr>
                                  <tr><td className="p-6 font-mono text-pink-500">more_than_30_minutes</td><td className="p-6">Over 30 minutes</td><td className="p-6">Heavy Load</td></tr>
                               </tbody>
                            </table>
                         </div>
                         <Endpoint id="get-eta" method="POST" path="/v1/games/eta" auth={false} description="Get completion estimate for a denomination." body={`{ "game_code": "pubgm", "denom_id": "60" }`} response={`{ "success": true, "estimated_time": { "label": "less_than_5_minutes", "median_seconds": 187 } }`} />
                      </section>

                      <section id="api-callbacks" className="space-y-10 pt-16 border-t border-slate-50">
                         <h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Webhooks / Callbacks</h2>
                         <div className="p-8 bg-slate-50 border border-slate-100 rounded-[2.5rem] space-y-6">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">System executes a POST request to your `callback_url` whenever an order status transition occurs (PENDING → PROCESSING → COMPLETED/FAILED).</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-2"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Retry Policy</span><p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Single retry on failure. Timeout: 10s.</p></div>
                               <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-2"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Success Code</span><p className="text-[10px] font-bold uppercase tracking-widest text-slate-900">Target must return HTTP 200-299.</p></div>
                            </div>
                         </div>
                         <div className="bg-slate-900 rounded-[2rem] overflow-hidden"><div className="px-6 py-3 bg-slate-800 border-b border-slate-700 flex items-center justify-between"><span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Callback Payload (POST)</span></div><pre className="p-8 text-[10px] font-mono text-green-400 overflow-x-auto leading-relaxed">{`{\n    "order_id": 42,\n    "status": "COMPLETED",\n    "message": "Order completed successfully",\n    "timestamp": "2024-01-15T10:30:00Z"\n}`}</pre></div>
                      </section>

                      <section id="api-legacy" className="space-y-8">
                         <div className="p-8 border-2 border-dashed border-red-100 rounded-[3rem] bg-red-50 flex gap-6 items-start">
                            <AlertCircle className="w-8 h-8 text-red-500 shrink-0 mt-1" />
                            <div><h3 className="text-xl font-black uppercase tracking-tight text-red-600 mb-2">Legacy Endpoints</h3><p className="text-xs font-bold text-red-400 uppercase tracking-widest leading-relaxed">The following routes have been DISABLED. Please migrate to unified /v1/games/* endpoints immediately.</p></div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{["/v1/topup/freeFire/offers", "/v1/topup/pubgMobile/purchase", "/v1/topups", "/v1/topup/pubgMobile/status"].map(route => (<div key={route} className="px-6 py-4 bg-white border border-slate-100 rounded-xl flex items-center justify-between"><code className="text-[10px] font-mono text-slate-400">{route}</code><Badge className="bg-red-100 text-red-600 text-[8px] font-black">DISABLED</Badge></div>))}</div>
                      </section>

                      <section id="api-transactions" className="space-y-12 pt-16 border-t border-slate-50"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Transactions</h2>
                         <Endpoint id="tx-log" method="GET" path="/v1/transactions" description="Retrieve transaction history including balance additions (refunds) and charges." response={`{\n    "success": true,\n    "data": [\n        { "id": 45, "transaction_type": "charge_balance", "amount": "1.126", "balance_after": "8.874" }\n    ]\n}`} />
                      </section>

                      <section id="api-errors" className="space-y-12">
                         <h2 className="text-3xl font-black uppercase tracking-tight text-red-500 flex items-center gap-4"><ShieldAlert className="w-6 h-6" /> Error Handling</h2>
                         <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
                            <table className="w-full text-left"><thead className="bg-slate-50 border-b border-slate-100"><tr className="text-[10px] font-black uppercase text-slate-400"><th className="p-6">Status</th><th className="p-6">Meaning</th><th className="p-6">Description</th></tr></thead>
                               <tbody className="divide-y divide-slate-50 text-[10px] font-bold uppercase text-slate-600">
                                  <tr><td className="p-6 font-mono text-pink-500">400</td><td className="p-6">Bad Request</td><td className="p-6">Invalid request format or missing parameters.</td></tr>
                                  <tr><td className="p-6 font-mono text-pink-500">401</td><td className="p-6">Unauthorized</td><td className="p-6">Authentication failed or API key invalid.</td></tr>
                                  <tr><td className="p-6 font-mono text-pink-500">429</td><td className="p-6">Too Many Requests</td><td className="p-6">Rate limit (1000/10s) exceeded.</td></tr>
                               </tbody>
                            </table>
                         </div>
                      </section>
                   </div>
                )}

                {activeSection === 'smm' && (
                   <div className="space-y-32 animate-in fade-in duration-700">
                      <section id="smm-auth" className="space-y-8">
                         <h1 className="text-5xl font-black tracking-tighter uppercase text-[#3D001F] leading-none">SMM Authentication</h1>
                         <div className="p-10 bg-blue-600 rounded-[3rem] text-white space-y-8 relative overflow-hidden shadow-2xl shadow-blue-200">
                            <div className="absolute top-0 right-0 p-12 opacity-10"><Database className="w-64 h-64" /></div>
                            <div className="space-y-4"><h3 className="text-2xl font-black uppercase tracking-tight">API Key in Request Body</h3><p className="text-sm font-bold text-blue-100 uppercase tracking-widest leading-relaxed">Unlike the main API, SMM panel authentication uses the API key inside the JSON payload.</p></div>
                            <div className="space-y-4"><div className="flex items-center gap-4"><Badge className="bg-white text-blue-600 text-[8px] font-black uppercase rounded px-2 py-1">Parameter</Badge><code className="text-white font-black font-mono">key: your_api_key</code></div><div className="p-6 bg-white/10 rounded-2xl border border-white/20 font-mono text-xs">{`{ "key": "your_api_key_here", "action": "services" }`}</div></div>
                         </div>
                      </section>

                      <section id="smm-services" className="space-y-12 pt-16 border-t border-slate-50"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Get Services</h2>
                         <Endpoint id="smm-svcs" method="POST" path="/api/v2" description="Returns all game top-up services. Supports category filtering." body={`{ "key": "your_key", "action": "services", "category": "PUBG Mobile" }`} response={`[\n    { "service": 1, "name": "PUBG - 60 UC", "rate": "0.85", "min": "1", "max": "1" }\n]`} />
                      </section>

                      <section id="smm-add" className="space-y-12"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Add Order</h2>
                         <Endpoint id="smm-new" method="POST" path="/api/v2" description="Creates a top-up order. Link format: player_id|server_id" body={`{ "key": "your_key", "action": "add", "service": 1, "link": "5123456789|2001", "quantity": 1 }`} response={`{ "order": 12345 }`} />
                      </section>

                      <section id="smm-multi" className="space-y-12"><h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">Multi-Status Monitoring</h2>
                         <Endpoint id="smm-batch" method="POST" path="/api/v2" description="Returns status of multiple order IDs (up to 100, comma-separated)." body={`{ "key": "your_key", "action": "status", "orders": "12345,12346,12347" }`} response={`{\n    "12345": { "charge": "0.850", "status": "Completed" },\n    "12346": { "charge": "4.250", "status": "In progress" }\n}`} />
                      </section>

                      <section id="smm-php" className="space-y-10 pt-16 border-t border-slate-50">
                         <h2 className="text-3xl font-black uppercase tracking-tight text-[#3D001F]">PHP Integration Script</h2>
                         <div className="bg-slate-900 rounded-[3rem] p-10 overflow-hidden relative"><div className="absolute top-0 left-0 w-full h-1 bg-[#FF2D85]" /><div className="flex items-center justify-between mb-8"><Badge className="bg-white/10 text-white text-[8px] font-black uppercase px-2 py-1">Ready-to-use Script</Badge><button onClick={() => copyCode('<?php...', 'php-script')} className="text-slate-500 hover:text-white"><Copy className="w-5 h-5" /></button></div><pre className="text-[10px] font-mono text-blue-400 overflow-x-auto leading-relaxed">{`<?php
$api_url = 'https://api.woosaa.com/api/v2';
$api_key = 'your_key_here';

function smmRequest($action, $params = []) {
    global $api_url, $api_key;
    $post_data = array_merge(['key' => $api_key, 'action' => $action], $params);
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($post_data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $response = curl_exec($ch);
    curl_close($ch);
    return json_decode($response, true);
}

// Check Balance Example
$balance = smmRequest('balance');
print_r($balance);
?>`}</pre></div>
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
