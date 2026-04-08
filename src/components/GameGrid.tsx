import React from 'react';
import { Game } from '@/contexts/SiteContext';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, ArrowRight, Zap, Star } from 'lucide-react';

interface GameGridProps {
  games: Game[];
  title?: string;
  subtitle?: string;
  featuredOnly?: boolean;
}

const GameGrid: React.FC<GameGridProps> = ({ games, title, subtitle, featuredOnly }) => {
  const navigate = useNavigate();
  const displayGames = featuredOnly ? games.filter(g => g.featured) : games;

  if (displayGames.length === 0) return null;

  return (
    <section className="py-24 bg-white" id="games">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl text-left">
            {subtitle && (
              <Badge variant="outline" className="mb-4 text-amber-600 border-amber-200 px-3 py-0.5 text-[10px] font-black uppercase tracking-widest bg-amber-50">
                {subtitle}
              </Badge>
            )}
            <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight text-slate-900 uppercase">
              {title || 'Trending Titles'}
            </h2>
          </div>
          <div className="h-px flex-1 bg-slate-100 hidden md:block mx-8 mb-4" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-10">
          {displayGames.map((game) => (
            <motion.div 
              key={game.id} 
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group cursor-pointer"
              onClick={() => navigate(`/game/${game.slug || game.id}`)}
            >
              <div className="relative aspect-[3/4.2] rounded-3xl overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-slate-100">
                {/* Image */}
                <img 
                  src={game.image} 
                  alt={game.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                
                {/* Floating Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {game.featured && (
                    <div className="bg-amber-500 text-white p-2 rounded-xl shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                     <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Verified</span>
                  </div>
                  <h3 className="font-display text-lg md:text-xl font-black text-white leading-tight mb-3">
                    {game.name}
                  </h3>
                  <div className="h-0.5 w-0 bg-amber-500 group-hover:w-full transition-all duration-500" />
                </div>
              </div>

              {/* Bottom Label */}
              <div className="mt-4 flex items-center justify-between px-2">
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-amber-600 transition-colors">Instant Load</span>
                 <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 transform group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GameGrid;
