import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Bug, ChevronDown, ChevronUp, Trash2, Zap, Terminal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  action: string;
  request?: any;
  response?: any;
  success: boolean;
  duration?: number;
}

const G2BulkDebugLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
  const [isVisible, setIsVisible] = useState(false);

  const fetchRecentOrders = async () => {
    setIsLoading(true);
    try {
      const { data: orders, error } = await supabase
        .from('topup_orders')
        .select('id, updated_at, game_name, package_name, player_id, g2bulk_product_id, g2bulk_order_id, status, status_message')
        .not('g2bulk_product_id', 'is', null)
        .order('updated_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const logEntries: LogEntry[] = (orders || []).map(order => ({
        id: order.id,
        timestamp: order.updated_at,
        action: order.g2bulk_order_id ? 'TRANSMISSION_OK' : 'LINK_PENDING',
        request: { game: order.game_name, package: order.package_name, player: order.player_id },
        response: { status: order.status, msg: order.status_message, remote_id: order.g2bulk_order_id },
        success: ['completed', 'processing', 'paid'].includes(order.status || ''),
      }));

      setLogs(logEntries);
    } catch (error) {
      toast({ title: 'Buffer Load Error', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const testG2BulkConnection = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('g2bulk-api', {
        body: { action: 'get_account_balance' }
      });
      if (data?.success) toast({ title: 'Bridge Active', description: `Terminal Balance: $${data.data?.balance}` });
      else throw new Error();
    } catch (err) {
      toast({ title: 'Bridge Offline', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      fetchRecentOrders();
    }
  };

  const toggleExpand = (id: string) => {
    const next = new Set(expandedLogs);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setExpandedLogs(next);
  };

  useEffect(() => { if (isVisible) fetchRecentOrders(); }, [isVisible]);

  return (
    <div className="bg-white border-2 border-pink-100 rounded-[2.5rem] overflow-hidden shadow-sm text-black">
      <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsVisible(!isVisible)}>
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border-2 border-slate-100 group-hover:border-[#FF2D85] transition-all">
             <Terminal className="w-5 h-5 text-[#FF2D85]" />
          </div>
          <div>
             <h3 className="text-sm font-black text-[#3D001F] uppercase tracking-[0.2em]">Transmission Protocol</h3>
             <div className="text-[8px] font-black text-[#FF2D85] uppercase tracking-widest mt-1 flex items-center gap-2">
                <div className="w-1 h-1 bg-[#FF2D85] rounded-full animate-pulse" />
                Live Node Terminal
             </div>
          </div>
          {isVisible ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
        </div>
        
        {isVisible && (
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={testG2BulkConnection} disabled={isLoading} variant="outline" className="border-pink-100 text-[#FF2D85] text-[9px] font-black uppercase tracking-widest h-9 px-4 rounded-xl">
              Test Connection
            </Button>
            <Button size="sm" onClick={fetchRecentOrders} disabled={isLoading} className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest h-9 px-4 rounded-xl">
              <RefreshCw className={cn("w-3 h-3 mr-2", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button size="sm" onClick={() => setLogs([])} variant="ghost" className="text-red-500 text-[9px] font-black uppercase tracking-widest h-9 px-4 rounded-xl">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
      
      <AnimatePresence>
        {isVisible && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="p-6">
              {logs.length === 0 ? (
                <div className="text-center py-16 opacity-20">
                  <Zap className="w-10 h-10 mx-auto mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Buffer Empty</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-3">
                    {logs.map(log => (
                      <div key={log.id} className={cn(
                        "p-4 rounded-2xl border-2 transition-all",
                        log.success ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'
                      )}>
                        <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleExpand(log.id)}>
                          <div className="flex items-center gap-4">
                            <Badge className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border-none", log.success ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
                              {log.success ? 'OK' : 'ERR'}
                            </Badge>
                            <span className="font-mono text-[10px] font-black uppercase text-[#3D001F] tracking-tighter">{log.action}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-bold text-slate-300 uppercase">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            {expandedLogs.has(log.id) ? <ChevronUp className="w-3.5 h-3.5 text-slate-300" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-300" />}
                          </div>
                        </div>
                        
                        {expandedLogs.has(log.id) && (
                          <div className="mt-4 space-y-4 pt-4 border-t border-slate-100">
                            <div>
                              <p className="text-[8px] font-black text-[#FF2D85] uppercase tracking-widest mb-2">Data Stream</p>
                              <pre className="text-[10px] bg-slate-900 text-green-400 p-4 rounded-xl overflow-x-auto font-mono">
                                {JSON.stringify(log.request, null, 2)}
                              </pre>
                            </div>
                            <pre className="text-[10px] bg-slate-900 text-blue-400 p-4 rounded-xl overflow-x-auto font-mono">
                              {JSON.stringify(log.response, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default G2BulkDebugLogs;
