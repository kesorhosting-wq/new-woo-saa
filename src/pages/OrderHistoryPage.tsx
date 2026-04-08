import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { motion } from 'framer-motion';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, Search, Gamepad2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const OrderHistoryPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSite();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      let query = supabase
        .from('topup_orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        const guestEmail = localStorage.getItem('guest_email');
        if (guestEmail) query = query.eq('email', guestEmail);
        else {
          setOrders([]);
          setIsLoading(false);
          return;
        }
      }
      
      const { data } = await query;
      if (data) setOrders(data);
      setIsLoading(false);
    };
    fetchOrders();
  }, [user]);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.game_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    if (s === 'completed' || s === 'success') return <Badge className="bg-green-100 text-green-700 border-none font-black text-[10px] uppercase px-3 py-1">Success</Badge>;
    if (s === 'pending') return <Badge className="bg-amber-100 text-amber-700 border-none font-black text-[10px] uppercase px-3 py-1">Pending</Badge>;
    if (s === 'processing') return <Badge className="bg-blue-100 text-blue-700 border-none font-black text-[10px] uppercase px-3 py-1">Processing</Badge>;
    return <Badge className="bg-red-100 text-red-700 border-none font-black text-[10px] uppercase px-3 py-1">Failed</Badge>;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ModernHeader />
      
      <main className="flex-1 container mx-auto px-4 py-32">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row items-end justify-between gap-8">
             <div>
                <h1 className="text-5xl font-black mb-3 tracking-tighter uppercase text-black">History Node</h1>
                <div className="flex items-center gap-3">
                   <div className="w-2 h-2 bg-[#FF2D85] rounded-full animate-ping" />
                   <p className="text-[#FF2D85] text-[10px] font-black uppercase tracking-[0.4em]">Transmission Archives Active</p>
                </div>
             </div>
             <div className="relative w-full md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300 group-focus-within:text-[#FF2D85] transition-colors" />
                <Input 
                  placeholder="Filter transmissions..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-14 bg-slate-50 border-2 border-slate-100 pl-12 rounded-2xl font-black text-black text-xs" 
                />
             </div>
          </div>

          <div className="bg-white border-2 border-slate-50 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-100">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                         <th className="px-10 py-8">ID NODE</th>
                         <th className="px-10 py-8">LOAD PROFILE</th>
                         <th className="px-10 py-8 text-center">PROTOCOL</th>
                         <th className="px-10 py-8 text-right">VALUATION</th>
                         <th className="px-10 py-8 text-right">TIMESTAMP</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {isLoading ? (
                        <tr>
                          <td colSpan={5} className="py-24 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-[#FF2D85]" /></td>
                        </tr>
                      ) : filteredOrders.length > 0 ? (
                        filteredOrders.map((order) => (
                           <tr key={order.id} className="hover:bg-slate-50/50 transition-all group">
                              <td className="px-10 py-8 font-mono text-[11px] font-black text-[#FF2D85] uppercase tracking-tighter">{order.id.slice(0, 8)}</td>
                              <td className="px-10 py-8">
                                 <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#FF2D85] border-2 border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                       <Gamepad2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                       <div className="text-sm font-black text-black uppercase">{order.game_name}</div>
                                       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{order.package_name}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-10 py-8 text-center">
                                 {getStatusBadge(order.status)}
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <div className="text-base font-black text-black">${Number(order.amount).toFixed(2)}</div>
                                 <div className="text-[9px] font-bold text-slate-300 uppercase mt-1">Paid via {order.payment_method || 'Link'}</div>
                              </td>
                              <td className="px-10 py-8 text-right">
                                 <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</div>
                                 <div className="text-[9px] font-bold text-slate-300 uppercase mt-1">{new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                              </td>
                           </tr>
                        ))
                      ) : (
                         <tr>
                            <td colSpan={5} className="py-32 text-center text-slate-200 font-black uppercase tracking-[0.5em] text-xs">Zero transmissions found</td>
                         </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </main>

      <ModernFooter />
    </div>
  );
};

export default OrderHistoryPage;
