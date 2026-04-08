import React from 'react';
import { Bell, Search, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';

const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-pink-50 px-10 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300 group-focus-within:text-[#FF2D85] transition-colors" />
          <Input 
            placeholder="Search core systems..." 
            className="bg-pink-50/30 border-pink-100 pl-12 h-14 rounded-2xl focus:ring-[#FF2D85]/10 focus:border-[#FF2D85] transition-all font-bold text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#FF2D85] hover:bg-pink-50 rounded-xl h-12 w-12 transition-all">
             <Globe className="w-5 h-5" />
           </Button>
           <Button variant="ghost" size="icon" className="text-slate-400 hover:text-[#FF2D85] hover:bg-pink-50 rounded-xl h-12 w-12 transition-all relative">
             <Bell className="w-5 h-5" />
             <span className="absolute top-3 right-3 w-2 h-2 bg-[#FF2D85] rounded-full border-2 border-white" />
           </Button>
        </div>
        
        <div className="h-8 w-px bg-pink-100 mx-2" />
        
        <div className="flex items-center gap-4 bg-pink-50/50 p-1.5 pr-5 rounded-2xl border border-pink-100 group cursor-pointer hover:bg-pink-50 transition-all">
          <div className="w-10 h-10 bg-[#FF2D85] rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-pink-200">
            {user?.email?.slice(0, 2).toUpperCase() || 'AD'}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black text-[#3D001F] uppercase tracking-tighter truncate max-w-[120px]">
               {user?.email?.split('@')[0] || 'Administrator'}
            </span>
            <span className="text-[8px] font-black text-[#FF2D85] uppercase tracking-[0.2em]">Super User</span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-pink-300 group-hover:text-[#FF2D85] transition-colors ml-2" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
