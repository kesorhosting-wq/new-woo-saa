import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  RefreshCw, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Activity,
  Zap
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';

interface DailyStats {
  date: string;
  completed: number;
  failed: number;
  pending: number;
  processing: number;
  total: number;
}

const G2BulkStatsDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [weekStats, setWeekStats] = useState<DailyStats | null>(null);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const sevenDaysAgo = subDays(now, 7);

      const { data: orders, error } = await supabase
        .from('topup_orders')
        .select('id, status, created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (error) throw error;

      const dailyMap = new Map<string, DailyStats>();
      for (let i = 0; i < 7; i++) {
        const date = format(subDays(now, i), 'yyyy-MM-dd');
        dailyMap.set(date, { date, completed: 0, failed: 0, pending: 0, processing: 0, total: 0 });
      }

      orders?.forEach(order => {
        const date = format(new Date(order.created_at), 'yyyy-MM-dd');
        const stats = dailyMap.get(date);
        if (stats) {
          stats.total++;
          if (order.status === 'completed') stats.completed++;
          else if (order.status === 'failed') stats.failed++;
          else stats.pending++;
        }
      });

      const dailyArray = Array.from(dailyMap.values()).reverse();
      setDailyStats(dailyArray);

      const weekTotals = dailyArray.reduce((acc, day) => ({
        date: 'week',
        completed: acc.completed + day.completed,
        failed: acc.failed + day.failed,
        pending: acc.pending + day.pending,
        processing: acc.processing + day.processing,
        total: acc.total + day.total
      }), { date: 'week', completed: 0, failed: 0, pending: 0, processing: 0, total: 0 });
      
      setWeekStats(weekTotals);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  if (isLoading) return null;

  return (
    <div className="space-y-8 text-black">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Week Velocity', value: weekStats?.total || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'text-[#FF2D85]', bg: 'bg-pink-50' },
           { label: 'Success Ratio', value: `${weekStats && weekStats.total > 0 ? Math.round((weekStats.completed / weekStats.total) * 100) : 0}%`, icon: <CheckCircle className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50' },
           { label: 'Error Nodes', value: weekStats?.failed || 0, icon: <XCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50' },
         ].map((s, i) => (
           <div key={i} className="bg-white border-2 border-slate-50 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                 <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border-2 border-white shadow-sm", s.bg, s.color)}>
                    {s.icon}
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{s.label}</span>
              </div>
              <div className={cn("text-4xl font-black", s.color)}>{s.value}</div>
           </div>
         ))}
      </div>

      <div className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-10 shadow-sm">
         <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF2D85] mb-10">Transmission Load Matrix</h4>
         <div className="flex items-end justify-between gap-4 h-48">
            {dailyStats.map((day, i) => {
               const max = Math.max(...dailyStats.map(d => d.total), 1);
               const height = (day.total / max) * 100;
               return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4">
                     <div className="w-full relative flex flex-col justify-end items-center h-32">
                        <div className="absolute -top-6 text-[10px] font-black text-slate-900">{day.total}</div>
                        <div 
                          className="w-full max-w-[40px] bg-slate-100 rounded-t-xl transition-all duration-500 relative overflow-hidden shadow-inner"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        >
                           <div className="absolute bottom-0 left-0 w-full bg-[#FF2D85] opacity-20" style={{ height: '100%' }} />
                           <div className="absolute bottom-0 left-0 w-full bg-green-500" style={{ height: day.total > 0 ? `${(day.completed / day.total) * 100}%` : '0%' }} />
                        </div>
                     </div>
                     <span className="text-[10px] font-black uppercase text-slate-400">{format(new Date(day.date), 'EEE')}</span>
                  </div>
               );
            })}
         </div>
      </div>
    </div>
  );
};

export default G2BulkStatsDashboard;
