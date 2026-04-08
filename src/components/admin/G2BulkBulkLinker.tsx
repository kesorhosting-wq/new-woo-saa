import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { 
  Link2, Wand2, CheckCircle2, XCircle, RefreshCw, 
  ChevronDown, ChevronUp, Sparkles, AlertTriangle 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Game, Package } from '@/contexts/SiteContext';
import { cn } from '@/lib/utils';

interface G2BulkProduct {
  id: string;
  g2bulk_product_id: string;
  g2bulk_type_id: string;
  game_name: string;
  product_name: string;
  denomination: string;
  price: number;
  currency: string;
}

interface MatchSuggestion {
  package: Package;
  gameId: string;
  gameName: string;
  suggestedProduct: G2BulkProduct | null;
  matchType: 'exact' | 'amount' | 'name' | 'price' | 'none';
  confidence: number;
  isSpecialPackage?: boolean;
}

interface G2BulkBulkLinkerProps {
  games: Game[];
  onLinkComplete: () => void;
}

const G2BulkBulkLinker: React.FC<G2BulkBulkLinkerProps> = ({ games, onLinkComplete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState<G2BulkProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [isQuickLinking, setIsQuickLinking] = useState(false);

  useEffect(() => {
    if (isOpen) loadProductsAndGenerateSuggestions();
  }, [isOpen, games]);

  const loadProductsAndGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('g2bulk_products')
        .select('*')
        .eq('is_active', true)
        .order('game_name')
        .order('price');

      if (error) throw error;
      const allProducts = data as G2BulkProduct[] || [];
      setProducts(allProducts);
      
      const allSuggestions: MatchSuggestion[] = [];
      for (const game of games) {
        const gameProducts = allProducts.filter(p => {
          const gameName = game.name.toLowerCase();
          const prodGameName = p.game_name.toLowerCase();
          return prodGameName.includes(gameName) || gameName.includes(prodGameName);
        });

        const processPkgs = (pkgs: Package[], isSpecial: boolean) => {
          for (const pkg of pkgs) {
            if (pkg.g2bulkProductId) continue;
            const match = findBestMatch(pkg, gameProducts);
            allSuggestions.push({ package: pkg, gameId: game.id, gameName: game.name, ...match, isSpecialPackage: isSpecial });
          }
        };

        processPkgs(game.packages, false);
        processPkgs(game.specialPackages || [], true);
      }

      allSuggestions.sort((a, b) => b.confidence - a.confidence);
      setSuggestions(allSuggestions);
      
      const autoSelected = new Set<string>();
      allSuggestions.forEach(s => { if (s.confidence >= 80 && s.suggestedProduct) autoSelected.add(s.package.id); });
      setSelectedSuggestions(autoSelected);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const findBestMatch = (pkg: Package, products: G2BulkProduct[]) => {
    if (products.length === 0) return { suggestedProduct: null, matchType: 'none' as const, confidence: 0 };
    const pkgAmount = pkg.amount.replace(/[^\d.]/g, '');
    
    for (const p of products) {
      const prodDenom = p.denomination.replace(/[^\d.]/g, '');
      if (pkgAmount && prodDenom && pkgAmount === prodDenom) return { suggestedProduct: p, matchType: 'exact' as const, confidence: 95 };
    }
    return { suggestedProduct: products[0], matchType: 'none' as const, confidence: 20 };
  };

  const applySelectedLinks = async () => {
    const toApply = suggestions.filter(s => selectedSuggestions.has(s.package.id) && s.suggestedProduct);
    if (toApply.length === 0) return;
    setIsApplying(true);
    try {
      for (const match of toApply) {
        const table = match.isSpecialPackage ? 'special_packages' : 'packages';
        await supabase.from(table).update({ 
          g2bulk_product_id: match.suggestedProduct!.g2bulk_product_id,
          g2bulk_type_id: match.suggestedProduct!.g2bulk_type_id 
        }).eq('id', match.package.id);
      }
      toast({ title: 'Bulk Linking Complete' });
      onLinkComplete();
      setIsOpen(false);
    } catch (error) {
      toast({ title: 'Linking Failed', variant: 'destructive' });
    } finally {
      setIsApplying(true);
    }
  };

  return (
    <div className="bg-white border border-pink-100 rounded-[2rem] p-6 shadow-sm text-black">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsOpen(!isOpen)}>
          <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-[#FF2D85]">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
             <h3 className="text-sm font-black uppercase tracking-widest text-[#3D001F]">Auto-Match Protocol</h3>
             <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Heuristic Linking Engine</p>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-300" /> : <ChevronDown className="w-4 h-4 text-slate-300" />}
        </div>
        
        {!isOpen && (
           <Button onClick={() => setIsOpen(true)} variant="outline" className="h-10 px-6 rounded-xl border-pink-100 text-[#FF2D85] font-black text-[9px] uppercase tracking-widest">Open Linker</Button>
        )}
      </div>

      {isOpen && (
        <div className="space-y-6 pt-4 border-t border-slate-50">
          {loading ? (
            <div className="py-10 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-pink-500" /></div>
          ) : suggestions.length === 0 ? (
            <div className="py-10 text-center text-slate-300 font-black uppercase text-[10px]">All nodes are currently linked</div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Found {suggestions.length} Potential Links</span>
                 <Button onClick={applySelectedLinks} disabled={selectedSuggestions.size === 0} className="bg-[#FF2D85] text-white font-black text-[10px] uppercase h-10 px-6 rounded-xl">Link {selectedSuggestions.size} Nodes</Button>
              </div>

              <ScrollArea className="h-[350px] pr-4">
                <div className="space-y-3">
                  {suggestions.map((s) => (
                    <div key={s.package.id} className={cn(
                      "p-4 rounded-2xl border transition-all flex items-center gap-4",
                      selectedSuggestions.has(s.package.id) ? "bg-pink-50 border-pink-200" : "bg-white border-slate-100"
                    )}>
                      <Checkbox checked={selectedSuggestions.has(s.package.id)} onCheckedChange={() => {
                        const next = new Set(selectedSuggestions);
                        if (next.has(s.package.id)) next.delete(s.package.id);
                        else next.add(s.package.id);
                        setSelectedSuggestions(next);
                      }} className="border-pink-200 data-[state=checked]:bg-[#FF2D85]" />
                      <div className="min-w-0 flex-1">
                         <div className="flex items-center gap-2 mb-1">
                            <span className="font-black text-[10px] text-[#3D001F] uppercase truncate">{s.package.name}</span>
                            <Badge className="bg-slate-100 text-slate-400 border-none font-black text-[7px] uppercase">{s.gameName}</Badge>
                         </div>
                         <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase">
                            <span>${s.package.price}</span>
                            <ArrowRightLeft className="w-2.5 h-2.5 opacity-30" />
                            <span className="text-green-600">{s.suggestedProduct?.product_name || 'No Match'}</span>
                         </div>
                      </div>
                      <Badge className={cn("rounded-lg text-[7px] font-black uppercase px-2 py-0.5 border-none", s.confidence >= 80 ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600")}>
                         {s.confidence}% Match
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default G2BulkBulkLinker;
