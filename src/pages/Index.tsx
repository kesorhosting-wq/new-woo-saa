import React from 'react';
import { Helmet } from 'react-helmet-async';
import ModernHeader from '@/components/ModernHeader';
import ModernHero from '@/components/ModernHero';
import GameGrid from '@/components/GameGrid';
import ModernFooter from '@/components/ModernFooter';
import { useSite } from '@/contexts/SiteContext';
import { useFavicon } from '@/hooks/useFavicon';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Index: React.FC = () => {
  const { settings, games, isLoading } = useSite();
  
  // Update favicon dynamically
  useFavicon(settings.siteIcon);

  return (
    <>
      <Helmet>
        <title>{settings.browserTitle || `${settings.siteName} - Game Topup Cambodia`}</title>
        <meta name="description" content="Top up your favorite games instantly. Mobile Legends, Free Fire, PUBG, and more. Fast, secure, and affordable." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-pink-100 selection:text-[#FF2D85]">
        <ModernHeader />
        
        <main className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 bg-white">
               <Loader2 className="w-12 h-12 animate-spin text-[#FF2D85]" />
               <span className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Game Nodes...</span>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ModernHero />
              
              {/* Featured Games Section */}
              <div className="bg-slate-50/50 py-12">
                <GameGrid 
                  games={games} 
                  title="HOT TITLES" 
                  subtitle="ELITE SELECTIONS"
                  featuredOnly={true} 
                />
              </div>
              
              {/* All Games Section */}
              <div className="bg-white">
                <GameGrid 
                  games={games} 
                  title="ALL SYSTEMS" 
                  subtitle="BROWSE CATALOG"
                />
              </div>

              {/* Action section */}
              <section className="py-32 bg-[#FF2D85] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                <div className="container mx-auto px-4 text-center relative z-10">
                   <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter uppercase">Ready to Dominate?</h2>
                   <p className="text-white/80 max-w-2xl mx-auto mb-12 text-lg font-bold uppercase tracking-tight">
                     Join Cambodia's premier gaming top-up community. Instant delivery, lowest prices, and 24/7 operations.
                   </p>
                   <div className="flex flex-wrap justify-center gap-6">
                      <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                         <div className="text-white font-black text-xl mb-1">99.9%</div>
                         <div className="text-[10px] text-white/60 font-black uppercase tracking-widest">Uptime</div>
                      </div>
                      <div className="px-8 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                         <div className="text-white font-black text-xl mb-1">INSTANT</div>
                         <div className="text-[10px] text-white/60 font-black uppercase tracking-widest">Delivery</div>
                      </div>
                   </div>
                </div>
              </section>
            </motion.div>
          )}
        </main>
        
        <ModernFooter />
      </div>
    </>
  );
};

export default Index;
