import React from 'react';
import { Package } from '@/contexts/SiteContext';
import { motion } from 'framer-motion';
import { Check, Sparkles, TrendingUp, Zap, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernPackageCardProps {
  pkg: Package;
  isSelected: boolean;
  onSelect: (id: string) => void;
  gameIcon?: string;
  isSpecial?: boolean;
}

const ModernPackageCard: React.FC<ModernPackageCardProps> = ({ 
  pkg, 
  isSelected, 
  onSelect, 
  gameIcon,
  isSpecial 
}) => {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(pkg.id)}
      className={cn(
        "relative w-full text-left p-6 rounded-3xl border transition-all duration-300 overflow-hidden group",
        isSelected 
          ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500 shadow-xl" 
          : "bg-white border-slate-100 hover:border-amber-200 hover:shadow-lg"
      )}
    >
      {/* Label / Badge */}
      {pkg.label && (
        <div 
          className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 z-10"
          style={{ 
            backgroundColor: pkg.labelBgColor || '#f59e0b',
            color: pkg.labelTextColor || 'white'
          }}
        >
          <Sparkles className="w-3 h-3" />
          {pkg.label}
        </div>
      )}

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-start justify-between mb-4">
           <div className={cn(
             "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
             isSelected ? "bg-amber-500 shadow-lg shadow-amber-500/20" : "bg-slate-50 group-hover:bg-amber-50"
           )}>
             {pkg.icon || gameIcon ? (
               <img src={pkg.icon || gameIcon} alt={pkg.name} className="w-full h-full object-cover rounded-2xl" />
             ) : (
               <Zap className={cn("w-6 h-6", isSelected ? "text-white" : "text-amber-500")} />
             )}
           </div>

           <div className="text-right">
              <div className={cn(
                "text-xl font-black transition-colors duration-300",
                isSelected ? "text-amber-600" : "text-slate-900"
              )}>
                ${Number(pkg.price).toFixed(2)}
              </div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">USD</div>
           </div>
        </div>

        <div className="flex-1">
          <h4 className={cn(
            "text-sm font-black uppercase tracking-tight mb-1",
            isSelected ? "text-amber-700" : "text-slate-800"
          )}>
            {pkg.name}
          </h4>
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-bold text-slate-500">{pkg.amount}</span>
             {isSpecial && <TrendingUp className="w-3 h-3 text-amber-500" />}
          </div>
        </div>

        {isSelected && (
           <div className="mt-4 flex items-center justify-end">
              <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center shadow-lg">
                 <Check className="w-3.5 h-3.5 text-white" />
              </div>
           </div>
        )}
      </div>
    </motion.button>
  );
};

export default ModernPackageCard;
