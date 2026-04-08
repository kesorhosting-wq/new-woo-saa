import React from 'react';
import { PaymentMethod } from '@/contexts/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, Zap, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernPaymentCardProps {
  method: PaymentMethod;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ModernPaymentCard: React.FC<ModernPaymentCardProps> = ({ 
  method, 
  isSelected, 
  onSelect 
}) => {
  return (
    <motion.button
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(method.id)}
      className={cn(
        "relative flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 h-32 w-full group",
        isSelected 
          ? "bg-amber-50 border-amber-500 ring-1 ring-amber-500 shadow-xl" 
          : "bg-white border-slate-100 hover:border-amber-200 hover:shadow-lg"
      )}
    >
      {/* Icon/Logo Container */}
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 relative z-10",
        isSelected ? "bg-amber-500 shadow-lg shadow-amber-500/20 scale-110" : "bg-slate-50 group-hover:bg-amber-50"
      )}>
        {method.icon && method.icon.length > 2 ? (
          <img src={method.icon} alt={method.name} className="w-8 h-8 object-contain" />
        ) : (
          <span className={cn("text-2xl", isSelected ? "text-white" : "text-amber-500")}>{method.icon || '💳'}</span>
        )}
      </div>

      {/* Name */}
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors duration-300",
        isSelected ? "text-amber-700" : "text-slate-500 group-hover:text-slate-900"
      )}>
        {method.name}
      </span>

      {/* Check Indicator */}
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="absolute top-3 right-3 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg z-20"
          >
            <Check className="w-3 h-3 text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ModernPaymentCard;
