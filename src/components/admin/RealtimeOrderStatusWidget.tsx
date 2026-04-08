import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, CheckCircle2, XCircle, Clock, Loader2, RefreshCw, Zap, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface OrderStatus {
  id: string;
  game_name: string;
  package_name: string;
  player_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const RealtimeOrderStatusWidget: React.FC = () => {
  const [orders, setOrders] = useState<OrderStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchRecentOrders = async () => {
    const { data, error } = await supabase
      .from('topup_orders')
      .select('id, game_name, package_name, player_id, amount, currency, status, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setOrders(data);
      setLastUpdate(new Date());
    }
  };

  useEffect(() => {
    fetchRecentOrders();
    const channel = supabase
      .channel('admin-orders-realtime-widget')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topup_orders' }, (payload) => {
          setLastUpdate(new Date());
          if (payload.eventType === 'INSERT') {
            const newOrder = payload.new as OrderStatus;
            setOrders(prev => [newOrder, ...prev.slice(0, 9)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedOrder = payload.new as OrderStatus;
            setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
          }
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'paid': return <Zap className="w-4 h-4 text-[#FF2D85]" />;
      default: return <Clock className="w-4 h-4 text-slate-300" />;
    }
  };

  return (
    <div className="bg-white border border-pink-100 rounded-[2.5rem] p-8 shadow-sm text-black">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-[#FF2D85] border border-pink-100">
            <Activity className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-sm font-black uppercase tracking-widest text-[#3D001F]">Transmission Stream</h3>
             <div className={cn("text-[8px] font-black uppercase tracking-widest flex items-center gap-2", isConnected ? "text-green-500" : "text-amber-500")}>
                <div className={cn("w-1 h-1 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-amber-500")} />
                {isConnected ? 'Link Active' : 'Connecting'}
             </div>
          </div>
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-100" onClick={fetchRecentOrders}>
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
        </Button>
      </div>

      <ScrollArea className="h-[320px] pr-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-10 opacity-20">
            <Activity className="w-10 h-10 mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">No transmissions detected</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-[#FF2D85] transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="shrink-0">
                     {getStatusIcon(order.status)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-black text-xs uppercase text-[#3D001F] truncate">
                        {order.game_name}
                      </span>
                      <span className="text-[8px] font-bold text-slate-300 font-mono">
                        #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                      <span className="text-[#FF2D85]">{order.package_name}</span>
                      <span className="opacity-30">•</span>
                      <span>ID: {order.player_id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="font-black text-xs text-slate-900">
                      ${Number(order.amount).toFixed(2)}
                    </div>
                    <div className="text-[8px] font-bold text-slate-300 uppercase">
                      {new Date(order.updated_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {lastUpdate && (
        <div className="text-[8px] font-black text-slate-200 text-center mt-6 uppercase tracking-[0.3em]">
          Buffer Update: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default RealtimeOrderStatusWidget;
