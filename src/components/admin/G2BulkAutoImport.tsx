import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Zap, 
  Settings, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle,
  Database
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const G2BulkAutoImport: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastUpdate] = useState<string | null>(null);

  const handleManualRun = async () => {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('g2bulk-api', {
        body: { action: 'auto_import_sync' }
      });
      if (error || !data.success) throw new Error(data?.error || 'Manual trigger failed');
      toast({ title: 'Auto-Import Protocol Success' });
      setLastUpdate(new Date().toISOString());
    } catch (error: any) {
      toast({ title: 'Trigger Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white border border-pink-100 rounded-[2rem] p-8 shadow-sm text-black">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF2D85] border border-pink-100 shadow-sm">
          <Database className="w-6 h-6" />
        </div>
        <div>
           <h3 className="text-lg font-black uppercase tracking-tight text-[#3D001F]">Auto-Injection Node</h3>
           <div className="flex items-center gap-2 text-[9px] font-black text-green-600 uppercase tracking-widest mt-1">
              <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
              Operational State
           </div>
        </div>
      </div>

      <div className="space-y-6">
         <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
               <span>Protocol Interval</span>
               <span className="text-[#FF2D85]">60 Minutes</span>
            </div>
            <div className="h-1.5 w-full bg-white rounded-full overflow-hidden border border-slate-100">
               <div className="h-full bg-pink-200 w-2/3" />
            </div>
         </div>

         <Button 
           onClick={handleManualRun}
           disabled={isRunning}
           className="w-full h-14 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
         >
            {isRunning ? <RefreshCw className="w-4 h-4 mr-3 animate-spin" /> : <Play className="w-4 h-4 mr-3" />}
            Execute Manual Injection
         </Button>

         <div className="flex items-center justify-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">
            <Zap className="w-3 h-3" />
            Background Sync Protocol Active
         </div>
      </div>
    </div>
  );
};

export default G2BulkAutoImport;
