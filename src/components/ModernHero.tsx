import React, { useEffect, useState } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const ModernHero: React.FC = () => {
  const { settings } = useSite();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);

  const banners = settings.bannerImages && settings.bannerImages.length > 0 
    ? settings.bannerImages 
    : [settings.bannerImage || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80"];

  useEffect(() => {
    if (!api) return;
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section className="relative min-h-[85vh] flex items-center pt-24 pb-12 bg-white overflow-hidden">
      {/* Background Decor */}
      {settings.backgroundImage && (
        <div className="absolute inset-0 z-0 opacity-10">
           <img src={settings.backgroundImage} className="w-full h-full object-cover" alt="Background" />
        </div>
      )}

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-5 max-w-2xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 border border-pink-100 text-[#FF2D85] text-[10px] font-black uppercase tracking-[0.2em] mb-8"
            >
              <Zap className="w-3.5 h-3.5 fill-[#FF2D85]" />
              <span>{settings.siteName || 'WOO SAA'} Elite Protocol</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-black leading-[0.9] mb-8 tracking-tighter uppercase"
            >
              {settings.heroText || 'GET YOUR POWER LOAD'} <br />
              <span className="text-[#FF2D85]">INSTANTLY.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-500 text-lg font-bold mb-12 max-w-md leading-relaxed uppercase tracking-tight"
            >
              Experience the gold standard of game top-ups in Cambodia. Safe, secure, and ready when you are.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button 
                onClick={() => document.getElementById('games')?.scrollIntoView({ behavior: 'smooth' })}
                className="h-16 px-12 bg-[#FF2D85] hover:bg-[#D81B60] text-white text-lg font-black rounded-2xl shadow-2xl shadow-pink-200 group transition-all"
              >
                INITIATE SCAN <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />
              </Button>
            </motion.div>
          </div>

          {/* Slider Content */}
          <div className="lg:col-span-7 relative h-full">
             <motion.div
               initial={{ opacity: 0, scale: 0.9 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1 }}
               className="relative z-10 w-full rounded-[3.5rem] overflow-hidden border-[12px] border-white shadow-[0_50px_100px_rgba(0,0,0,0.15)]"
             >
                <Carousel 
                  setApi={setApi}
                  plugins={[Autoplay({ delay: 4000 })]}
                  className="w-full"
                >
                  <CarouselContent>
                    {banners.map((url, idx) => (
                      <CarouselItem key={idx}>
                        <div className="aspect-[16/10] w-full overflow-hidden">
                           <img 
                             src={url} 
                             className="w-full h-full object-cover transition-transform duration-[4000ms] hover:scale-110" 
                             alt={`Banner ${idx + 1}`} 
                           />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>

                {/* Progress Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                   {banners.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => api?.scrollTo(idx)}
                        className={cn(
                          "h-1.5 transition-all duration-500 rounded-full",
                          current === idx ? "w-8 bg-[#FF2D85]" : "w-3 bg-white/40 hover:bg-white/60"
                        )}
                      />
                   ))}
                </div>
             </motion.div>

             {/* Dynamic background glow based on current slide */}
             <div className="absolute -top-20 -right-20 w-96 h-96 bg-[#FF2D85]/10 rounded-full blur-[120px] -z-10 animate-pulse" />
             <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-200/20 rounded-full blur-[100px] -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
};

export default ModernHero;
