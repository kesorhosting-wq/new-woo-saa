import React from 'react';
import { useSite } from '@/contexts/SiteContext';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, Shield, Trophy } from 'lucide-react';

const ModernHero: React.FC = () => {
  const { settings } = useSite();

  return (
    <section className="relative min-h-[80vh] flex items-center pt-24 pb-12 bg-white overflow-hidden">
      {/* Dynamic Background Image from Settings */}
      {settings.backgroundImage && (
        <div className="absolute inset-0 z-0 opacity-10">
           <img src={settings.backgroundImage} className="w-full h-full object-cover" alt="Background" />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100 text-[#FF2D85] text-xs font-black uppercase tracking-widest mb-8">
              <Zap className="w-4 h-4 fill-[#FF2D85]" />
              <span>{settings.siteName || 'WOO SAA'} Security Protocol Active</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-black leading-tight mb-8 tracking-tighter">
              {settings.heroText || 'GET YOUR POWER LOAD'} <br />
              <span className="text-[#FF2D85]">INSTANTLY.</span>
            </h1>
            
            <p className="text-slate-600 text-lg md:text-2xl font-bold mb-12 max-w-2xl leading-relaxed uppercase">
              Safe, Secure, and Lightning Fast top-ups for all your favorite games in Cambodia.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Button 
                onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-16 px-12 bg-[#FF2D85] hover:bg-[#D81B60] text-white text-xl font-black rounded-2xl shadow-xl transition-all w-full sm:w-auto"
              >
                BROWSE GAMES <ArrowRight className="ml-3 w-6 h-6" />
              </Button>
            </div>
          </div>

          <div className="hidden lg:block relative">
             <div className="relative z-10 w-full aspect-square rounded-[4rem] overflow-hidden border-8 border-white shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700">
                <img 
                  src={settings.bannerImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80"} 
                  className="w-full h-full object-cover" 
                  alt="Banner" 
                />
             </div>
             {/* Decorative glows */}
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-pink-200/30 rounded-full blur-[100px] -z-10" />
             <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-100/20 rounded-full blur-[80px] -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModernHero;
