import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, CheckCircle2, Package, Clock, Database } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface G2BulkSyncWidgetProps {
  onSyncComplete?: () => void;
}

const G2BulkSyncWidget: React.FC<G2BulkSyncWidgetProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get product count
      const { count: totalProducts } = await supabase
        .from('g2bulk_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setProductCount(totalProducts || 0);

      // Get unique game count (categories)
      const { data: games } = await supabase
        .from('g2bulk_products')
        .select('game_name')
        .eq('is_active', true);

      if (games) {
        const uniqueGames = new Set(games.map(g => g.game_name));
        setCategoryCount(uniqueGames.size);
      }

      // Get last update time from most recent product
      const { data: lastProduct } = await supabase
        .from('g2bulk_products')
        .select('updated_at')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (lastProduct?.updated_at) {
        setLastSyncTime(new Date(lastProduct.updated_at));
      }
    } catch (error) {
      console.error('Error loading G2Bulk stats:', error);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      toast({ title: 'Syncing G2Bulk products...', description: 'This may take a minute.' });

      const { data, error } = await supabase.functions.invoke('g2bulk-api', {
        body: { action: 'sync_products' },
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        setProductCount(data.data.synced);
        setCategoryCount(data.data.categories);
        setLastSyncTime(new Date());

        toast({
          title: 'Sync complete!',
          description: `${data.data.synced} products from ${data.data.categories} games`,
        });

        onSyncComplete?.();
      } else {
        throw new Error(data?.error || 'Sync failed');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sync failed';
      toast({ title: 'Sync failed', description: errorMessage, variant: 'destructive' });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="border border-pink-100 bg-white rounded-2xl overflow-hidden">
      <div className="p-6">
        <div className="flex flex-wrap items-center gap-6">
          {/* Sync Button */}
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-[#FF2D85] hover:bg-[#D81B60] text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-xl shadow-lg shadow-pink-100"
          >
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isSyncing ? 'Syncing...' : 'Initiate Sync'}
          </Button>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                 <Package className="w-4 h-4 text-[#FF2D85]" />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-black text-slate-900">{productCount.toLocaleString()}</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Products</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                 <Database className="w-4 h-4 text-[#FF2D85]" />
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-black text-slate-900">{categoryCount}</span>
                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Games</span>
              </div>
            </div>

            {lastSyncTime && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                   <Clock className="w-4 h-4 text-[#FF2D85]" />
                </div>
                <div className="flex flex-col">
                   <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">{formatLastSync(lastSyncTime)}</span>
                   <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Transfer</span>
                </div>
              </div>
            )}
          </div>

          {productCount > 0 && (
            <Badge className="bg-green-50 text-green-600 border-green-100 font-black text-[9px] uppercase tracking-widest rounded-full px-3 py-1">
              <CheckCircle2 className="w-3 h-3 mr-1.5" />
              Synced
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default G2BulkSyncWidget;
