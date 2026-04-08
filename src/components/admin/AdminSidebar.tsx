import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gamepad2, 
  CreditCard, 
  Settings, 
  LogOut, 
  BarChart3, 
  History, 
  Users,
  Database,
  ShieldCheck,
  ChevronLeft,
  Shield,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const AdminSidebar: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Control Center', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin' },
    { name: 'Home Interface', icon: <Home className="w-5 h-5" />, path: '/admin/home' },
    { name: 'Product Grid', icon: <Gamepad2 className="w-5 h-5" />, path: '/admin/games' },
    { name: 'Sync Terminal', icon: <Database className="w-5 h-5" />, path: '/admin/sync' },
    { name: 'Order Logs', icon: <History className="w-5 h-5" />, path: '/admin/orders' },
    { name: 'Verification', icon: <Shield className="w-5 h-5" />, path: '/admin/verification' },
    { name: 'Gateway Config', icon: <CreditCard className="w-5 h-5" />, path: '/admin/payments' },
    { name: 'User Directory', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
  ];

  return (
    <aside className="w-80 bg-white border-r border-slate-100 h-screen sticky top-0 flex flex-col p-8 z-40 shadow-sm text-black">
      <div className="flex items-center gap-4 mb-12 px-2">
        <div className="w-12 h-12 bg-[#FF2D85] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>
        <div>
           <span className="font-display text-2xl font-black tracking-tighter text-[#3D001F]">ADMIN<span className="text-[#FF2D85]">CORE</span></span>
           <div className="text-[8px] font-black uppercase tracking-[0.4em] text-[#FF2D85] mt-0.5">Secure Session</div>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/admin'}
            className={({ isActive }) => cn(
              "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
              isActive 
                ? "bg-pink-50 text-[#FF2D85]" 
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <div className="transition-transform duration-500 group-hover:scale-110 z-10">
              {item.icon}
            </div>
            <span className="font-black text-[11px] uppercase tracking-widest z-10">{item.name}</span>
            
            {window.location.pathname === item.path && (
               <motion.div 
                 layoutId="admin-active-bar"
                 className="absolute left-0 w-1.5 h-8 bg-[#FF2D85] rounded-r-full"
               />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-8 border-t border-slate-100 mt-auto space-y-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="w-full justify-start gap-4 h-14 rounded-2xl text-slate-400 hover:text-black hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest"
        >
           <ChevronLeft className="w-5 h-5 text-[#FF2D85]" />
           Return to Site
        </Button>
        <button 
          onClick={() => signOut()}
          className="flex items-center gap-4 px-6 py-5 bg-red-50 text-red-600 hover:bg-red-100 rounded-2xl w-full transition-all duration-300 font-black text-[10px] uppercase tracking-widest shadow-sm shadow-red-100"
        >
          <LogOut className="w-5 h-5" />
          Terminate Session
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
