import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  Search, 
  Gamepad2, 
  ChevronDown, 
  Loader2,
  Clock,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-amber-600', bg: 'bg-amber-50' },
  paid: { label: 'Paid', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  processing: { label: 'Processing', color: 'text-blue-600', bg: 'bg-blue-50' },
  completed: { label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
  failed: { label: 'Failed', color: 'text-red-600', bg: 'bg-red-50' },
};

const OrdersTab: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('topup_orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      toast({ title: "Load Error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('topup_orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      toast({ title: "Status Updated" });
      loadOrders();
    } catch (err) {
      toast({ title: "Update Failed", variant: "destructive" });
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filter === 'all' || o.status === filter;
    const matchesSearch = o.player_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         o.game_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#FF2D85] mb-4" />
        <p className="text-xs font-black uppercase text-slate-400">Syncing Transmissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-black">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
         <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'paid', 'processing', 'completed', 'failed'].map(s => (
               <Button 
                 key={s} 
                 onClick={() => setFilter(s)}
                 className={cn(
                   "h-10 px-6 rounded-full text-[10px] font-black uppercase tracking-widest",
                   filter === s ? "bg-[#FF2D85] text-white shadow-lg shadow-pink-100" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                 )}
               >
                  {s}
               </Button>
            ))}
         </div>
         <div className="relative w-full md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <Input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ID..." 
              className="h-12 bg-slate-50 border-slate-100 pl-10 rounded-xl font-bold"
            />
         </div>
      </div>

      <div className="bg-white border border-pink-100 rounded-[2.5rem] overflow-hidden shadow-sm">
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-pink-50/30 text-[10px] font-black uppercase tracking-widest text-pink-300">
                     <th className="px-8 py-6">Reference</th>
                     <th className="px-8 py-6">Identity / Load</th>
                     <th className="px-8 py-6 text-center">Status</th>
                     <th className="px-8 py-6 text-right">Valuation</th>
                     <th className="px-8 py-6 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredOrders.map((order) => {
                    const status = statusConfig[order.status] || statusConfig.pending;
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                         <td className="px-8 py-6">
                            <div className="flex flex-col">
                               <span className="text-[10px] font-black text-[#FF2D85] uppercase font-mono">{order.id.slice(0, 8)}</span>
                               <span className="text-[9px] font-bold text-slate-300">{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-[#FF2D85]">
                                  <Gamepad2 className="w-5 h-5" />
                               </div>
                               <div>
                                  <div className="text-xs font-black text-[#3D001F] uppercase">{order.game_name}</div>
                                  <div className="text-[10px] font-bold text-slate-400">ID: {order.player_id}</div>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6 text-center">
                            <Badge className={cn("rounded-lg px-3 py-1 font-black text-[8px] uppercase border-none", status.bg, status.color)}>
                               {status.label}
                            </Badge>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <div className="text-sm font-black text-slate-900">${Number(order.amount).toFixed(2)}</div>
                         </td>
                         <td className="px-8 py-6 text-right">
                            <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-slate-300 hover:text-[#FF2D85]">
                                     <ChevronDown className="w-4 h-4" />
                                  </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="w-48 bg-white border-slate-100 rounded-2xl p-2 shadow-2xl">
                                  {['pending', 'processing', 'completed', 'failed'].map(s => (
                                    <DropdownMenuItem key={s} onClick={() => updateStatus(order.id, s)} className="rounded-xl py-3 gap-3 focus:bg-pink-50 focus:text-[#FF2D85] cursor-pointer font-black text-[9px] uppercase tracking-widest">
                                       {s}
                                    </DropdownMenuItem>
                                  ))}
                               </DropdownMenuContent>
                            </DropdownMenu>
                         </td>
                      </tr>
                    );
                  })}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default OrdersTab;
