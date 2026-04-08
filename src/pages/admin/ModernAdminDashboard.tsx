import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  CreditCard,
  Gamepad2,
  Clock,
  Database,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import G2BulkBalanceDisplay from '@/components/admin/G2BulkBalanceDisplay';
import G2BulkSyncWidget from '@/components/admin/G2BulkSyncWidget';

const ModernAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ games: 0, orders: 0, users: 0 });

  useEffect(() => {
    const fetchCounts = async () => {
      const { count: gamesCount } = await supabase.from('games').select('*', { count: 'exact', head: true });
      const { count: ordersCount } = await supabase.from('topup_orders').select('*', { count: 'exact', head: true });
      const { count: profilesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      setCounts({
        games: gamesCount || 0,
        orders: ordersCount || 0,
        users: profilesCount || 0
      });
    };
    fetchCounts();
  }, []);

  const stats = [
    { name: 'Game Clusters', value: counts.games.toString(), icon: <Gamepad2 className="w-5 h-5" />, change: 'Active', isPositive: true },
    { name: 'Total Transmissions', value: counts.orders.toString(), icon: <ShoppingCart className="w-5 h-5" />, change: 'Live', isPositive: true },
    { name: 'Registered Users', value: counts.users.toString(), icon: <Users className="w-5 h-5" />, change: 'Verified', isPositive: true },
    { name: 'System Core', value: 'Optimal', icon: <Activity className="w-5 h-5" />, change: '100%', isPositive: true },
  ];

  return (
    <div className="space-y-12">
      {/* Welcome Terminal */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
         <div>
            <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase text-[#3D001F]">Admin Console</h1>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 bg-[#FF2D85] rounded-full animate-ping" />
               <p className="text-[#FF2D85] text-[10px] font-black uppercase tracking-[0.4em]">Operational Authority: Level 01</p>
            </div>
         </div>
         <G2BulkBalanceDisplay />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <div className="bg-white border border-pink-50 rounded-[2.5rem] p-8 hover:border-[#FF2D85] transition-all duration-500 group shadow-sm hover:shadow-2xl hover:shadow-pink-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50/50 rounded-bl-[3rem] -z-10 transition-all group-hover:scale-110" />
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF2D85] border border-pink-100 group-hover:bg-[#FF2D85] group-hover:text-white transition-all duration-500">
                  {stat.icon}
                </div>
                <div className="font-black text-[9px] uppercase tracking-tighter text-green-500">
                  {stat.change}
                </div>
              </div>
              <div className="text-4xl font-black text-[#3D001F] mb-1">{stat.value}</div>
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.name}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sync Widget */}
        <div className="lg:col-span-7 space-y-8">
           <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4 text-[#3D001F]">
              <div className="w-1.5 h-8 bg-[#FF2D85] rounded-full" />
              Real-time Bridge
           </h3>
           <div className="bg-white border border-pink-100 rounded-[3rem] p-10 shadow-sm">
              <G2BulkSyncWidget />
           </div>
        </div>

        {/* Shortcuts */}
        <div className="lg:col-span-5 space-y-10">
           <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-4 text-[#3D001F]">
              <div className="w-1.5 h-8 bg-[#FF2D85] rounded-full" />
              Command Shortcuts
           </h3>
           
           <div className="grid grid-cols-1 gap-5">
              <Button onClick={() => navigate('/admin/sync')} variant="outline" className="h-24 bg-white border-pink-100 rounded-[2.5rem] justify-start px-8 group hover:border-[#FF2D85] transition-all shadow-sm hover:shadow-xl hover:shadow-pink-100/30">
                 <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mr-6 group-hover:bg-[#FF2D85] transition-all">
                    <Database className="w-6 h-6 text-[#FF2D85] group-hover:text-white" />
                 </div>
                 <div className="text-left">
                    <div className="text-sm font-black uppercase tracking-tighter text-[#3D001F]">Sync Terminal</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">G2Bulk Master Control</div>
                 </div>
                 <ChevronRight className="ml-auto w-5 h-5 text-pink-200 group-hover:text-[#FF2D85] transition-colors" />
              </Button>

              <Button onClick={() => navigate('/admin/verification')} variant="outline" className="h-24 bg-white border-pink-100 rounded-[2.5rem] justify-start px-8 group hover:border-[#FF2D85] transition-all shadow-sm hover:shadow-xl hover:shadow-pink-100/30">
                 <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mr-6 group-hover:bg-[#FF2D85] transition-all">
                    <ShieldCheck className="w-6 h-6 text-[#FF2D85] group-hover:text-white" />
                 </div>
                 <div className="text-left">
                    <div className="text-sm font-black uppercase tracking-tighter text-[#3D001F]">Verify Hub</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ID Validation Logic</div>
                 </div>
                 <ChevronRight className="ml-auto w-5 h-5 text-pink-200 group-hover:text-[#FF2D85] transition-colors" />
              </Button>

              <Button onClick={() => navigate('/admin/orders')} variant="outline" className="h-24 bg-white border-pink-100 rounded-[2.5rem] justify-start px-8 group hover:border-[#FF2D85] transition-all shadow-sm hover:shadow-xl hover:shadow-pink-100/30">
                 <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center mr-6 group-hover:bg-[#FF2D85] transition-all">
                    <ShoppingCart className="w-6 h-6 text-[#FF2D85] group-hover:text-white" />
                 </div>
                 <div className="text-left">
                    <div className="text-sm font-black uppercase tracking-tighter text-[#3D001F]">Transmissions</div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Order Stream</div>
                 </div>
                 <ChevronRight className="ml-auto w-5 h-5 text-pink-200 group-hover:text-[#FF2D85] transition-colors" />
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ModernAdminDashboard;
