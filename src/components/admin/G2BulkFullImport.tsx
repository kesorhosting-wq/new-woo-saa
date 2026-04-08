import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Download, RefreshCw, Check, AlertTriangle, Percent, Filter, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface G2BulkFullImportProps {
  onImportComplete: () => void;
}

interface ImportResult {
  games_created: number;
  games_skipped: number;
  packages_created: number;
  packages_skipped: number;
  packages_updated: number;
  price_markup_percent: number;
}

interface G2BulkGame {
  code: string;
  name: string;
  image: string;
}

const G2BulkFullImport: React.FC<G2BulkFullImportProps> = ({ onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [markup, setMarkup] = useState(10);
  const [updateExistingPrices, setUpdateExistingPrices] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [availableGames, setAvailableGames] = useState<G2BulkGame[]>([]);
  const [selectedGames, setSelectedGames] = useState<Set<string>>(new Set());
  const [showGameFilter, setShowGameFilter] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const loadAvailableGames = async () => {
    setIsLoadingGames(true);
    try {
      const { data, error } = await supabase.functions.invoke('g2bulk-api', {
        body: { action: 'get_g2bulk_games_list' },
      });
      if (error) throw error;
      if (data.success && data.data) setAvailableGames(data.data);
    } catch (error) {
      toast({ title: 'Fetch Failed', variant: 'destructive' });
    } finally {
      setIsLoadingGames(false);
    }
  };

  useEffect(() => {
    if (showGameFilter && availableGames.length === 0) {
      loadAvailableGames();
    }
  }, [showGameFilter]);

  const handleFullImport = async () => {
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('g2bulk-api', {
        body: { 
          action: 'bulk_import_all',
          price_markup_percent: markup,
          update_existing_prices: updateExistingPrices,
          selected_game_codes: selectedGames.size > 0 ? Array.from(selectedGames) : null,
        },
      });
      if (error || !data.success) throw new Error(data?.error || 'Import protocol failed');
      setResult(data.data);
      toast({ title: 'Import Protocol Success' });
      onImportComplete();
    } catch (error: any) {
      toast({ title: 'Import Failed', description: error.message, variant: 'destructive' });
    } finally {
      setIsImporting(false);
    }
  };

  const toggleGame = (code: string) => {
    const newSelected = new Set(selectedGames);
    if (newSelected.has(code)) newSelected.delete(code);
    else newSelected.add(code);
    setSelectedGames(newSelected);
  };

  const filteredGames = availableGames.filter(g => g.name.toLowerCase().includes(searchFilter.toLowerCase()));

  return (
    <div className="bg-white border-2 border-pink-100 rounded-[2.5rem] p-8 shadow-md text-black mb-10">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
               <Download className="w-6 h-6" />
            </div>
            <div>
               <h3 className="text-xl font-black uppercase text-black">Bulk Injection Node</h3>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">G2Bulk Catalog Protocol</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
         <div className="md:col-span-5 space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Profit Markup (%)</label>
               <Input 
                 type="number" 
                 value={markup} 
                 onChange={(e) => setMarkup(Number(e.target.value))} 
                 className="h-14 bg-slate-50 border-slate-200 text-black rounded-2xl font-black text-lg focus:border-pink-500"
               />
            </div>

            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
               <Checkbox checked={updateExistingPrices} onCheckedChange={(c) => setUpdateExistingPrices(c === true)} className="border-pink-500 data-[state=checked]:bg-pink-500" />
               <label className="text-xs font-black uppercase text-black">Update Linked Prices</label>
            </div>

            <Button 
              onClick={handleFullImport}
              disabled={isImporting}
              className="w-full h-16 bg-pink-500 hover:bg-pink-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all"
            >
               {isImporting ? <RefreshCw className="w-5 h-5 animate-spin mr-3" /> : <Zap className="w-5 h-5 mr-3" />}
               Inject Catalog
            </Button>
         </div>

         <div className="md:col-span-7 space-y-4">
            <Button 
              onClick={() => setShowGameFilter(!showGameFilter)}
              variant="outline" 
              className="w-full h-14 rounded-2xl border-slate-200 bg-white text-black font-black text-[10px] uppercase tracking-widest justify-between px-6 hover:border-pink-500 transition-all"
            >
               <span className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-pink-500" />
                  {selectedGames.size > 0 ? `${selectedGames.size} Nodes Selected` : 'Filter Target Nodes'}
               </span>
               {showGameFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>

            {showGameFilter && (
               <div className="bg-slate-50 border-2 border-slate-100 rounded-3xl p-6 space-y-4 shadow-inner">
                  <Input 
                    placeholder="Search Node Directory..." 
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="h-12 bg-white border-slate-200 rounded-xl px-4 font-black text-xs text-black"
                  />
                  <ScrollArea className="h-64 pr-4">
                     {isLoadingGames ? (
                        <div className="flex justify-center py-10"><RefreshCw className="w-6 h-6 animate-spin text-pink-500" /></div>
                     ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                           {filteredGames.map(game => (
                              <div key={game.code} onClick={() => toggleGame(game.code)} className={cn(
                                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer",
                                selectedGames.has(game.code) ? "bg-white border-pink-500 shadow-md scale-[1.02]" : "bg-white border-slate-100 opacity-50"
                              )}>
                                 <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100">
                                    <img src={game.image} className="w-full h-full object-cover" />
                                 </div>
                                 <span className="text-[10px] font-black uppercase text-black truncate">{game.name}</span>
                              </div>
                           ))}
                        </div>
                     )}
                  </ScrollArea>
               </div>
            )}
         </div>
      </div>

      {result && (
         <div className="mt-8 p-6 bg-green-50 border-2 border-green-100 rounded-[2rem] grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
               { l: 'New Clusters', v: result.games_created },
               { l: 'Stable Clusters', v: result.games_skipped },
               { l: 'New Loads', v: result.packages_created },
               { l: 'Stable Loads', v: result.packages_skipped },
               { l: 'Refactored', v: result.packages_updated },
            ].map((s, i) => (
               <div key={i} className="text-center">
                  <div className="text-xl font-black text-green-600">{s.v}</div>
                  <div className="text-[8px] font-black uppercase text-green-600/50 tracking-widest">{s.l}</div>
               </div>
            ))}
         </div>
      )}
    </div>
  );
};

export default G2BulkFullImport;
