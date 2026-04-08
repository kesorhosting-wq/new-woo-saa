import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { Check, ChevronsUpDown, Link2, Link2Off, RefreshCw, Package, DollarSign, X, ArrowUpDown } from 'lucide-react';
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

interface G2BulkProductSelectorProps {
  value?: string;
  onChange: (productId: string | undefined, typeId: string | undefined) => void;
  gameName?: string;
  g2bulkCategoryId?: string;
}

type SortOption = 'game' | 'price-asc' | 'price-desc' | 'name';

const G2BulkProductSelector: React.FC<G2BulkProductSelectorProps> = ({ 
  value, 
  onChange, 
  gameName,
  g2bulkCategoryId 
}) => {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState<G2BulkProduct[]>([]);
  const [allProducts, setAllProducts] = useState<G2BulkProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<G2BulkProduct | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('game');

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('g2bulk_products')
        .select('*')
        .eq('is_active', true)
        .order('game_name', { ascending: true })
        .range(0, 4999);

      if (error) throw error;
      const all = (data as G2BulkProduct[]) || [];
      setAllProducts(all);

      let filtered = [...all];
      if (g2bulkCategoryId) {
        const catId = g2bulkCategoryId.toLowerCase();
        filtered = filtered.filter(p => p.game_name.toLowerCase().includes(catId) || catId.includes(p.game_name.toLowerCase()));
      }
      setProducts(filtered.length > 0 ? filtered : all);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [g2bulkCategoryId]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  useEffect(() => {
    if (value && allProducts.length > 0) {
      const product = allProducts.find((p) => p.g2bulk_product_id === value);
      setSelectedProduct(product || null);
    } else { setSelectedProduct(null); }
  }, [value, allProducts]);

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    if (!isNaN(min)) result = result.filter(p => p.price >= min);
    if (!isNaN(max)) result = result.filter(p => p.price <= max);
    
    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'name': result.sort((a, b) => a.product_name.localeCompare(b.product_name)); break;
      default: result.sort((a, b) => a.game_name.localeCompare(b.game_name) || a.price - b.price);
    }
    return result;
  }, [products, minPrice, maxPrice, sortBy]);

  const handleSelect = (productId: string) => {
    if (productId === 'none') {
      onChange(undefined, undefined);
      setSelectedProduct(null);
    } else {
      const product = allProducts.find(p => p.g2bulk_product_id === productId);
      if (product) {
        onChange(product.g2bulk_product_id, product.g2bulk_type_id);
        setSelectedProduct(product);
      }
    }
    setOpen(false);
  };

  if (loading) return <div className="text-[10px] font-black uppercase text-slate-400 animate-pulse">Initializing Data Stream...</div>;

  return (
    <div className="space-y-2 text-black">
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-between text-left h-12 rounded-xl border-slate-100 bg-slate-50 font-bold text-xs"
            >
              {selectedProduct ? (
                <span className="flex items-center gap-2 truncate text-[#3D001F]">
                  <Link2 className="w-4 h-4 text-green-500 shrink-0" />
                  <span className="truncate">{selectedProduct.product_name}</span>
                  <Badge className="bg-pink-50 text-[#FF2D85] border-none text-[9px] px-2 font-black">${selectedProduct.price}</Badge>
                </span>
              ) : (
                <span className="flex items-center gap-2 text-slate-400">
                  <Package className="w-4 h-4" />
                  Link G2Bulk Protocol
                </span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-30" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[450px] p-0 z-50 bg-white border-2 border-pink-100 rounded-3xl shadow-2xl overflow-hidden" align="start">
            <Command className="bg-white">
              <CommandInput placeholder="Search global catalog..." className="h-14 font-bold border-b border-slate-50" />
              <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-b border-slate-100">
                 <div className="flex items-center gap-2 flex-1">
                    <Input placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="h-9 text-[10px] bg-white rounded-lg border-slate-200 font-bold" />
                    <Input placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="h-9 text-[10px] bg-white rounded-lg border-slate-200 font-bold" />
                 </div>
                 <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                    <SelectTrigger className="h-9 text-[10px] w-28 bg-white font-black uppercase">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-100 rounded-xl">
                       <SelectItem value="game">Game Hub</SelectItem>
                       <SelectItem value="price-asc">Price ↑</SelectItem>
                       <SelectItem value="price-desc">Price ↓</SelectItem>
                       <SelectItem value="name">Alpha</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <CommandList className="max-h-[350px] p-2">
                <CommandEmpty className="py-10 text-center text-slate-300 font-black uppercase text-[10px]">No matches detected</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={() => handleSelect('none')} className="rounded-xl py-3 px-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50">
                    <Link2Off className="w-4 h-4 text-slate-300" />
                    <span className="font-black text-[10px] uppercase text-slate-400">Disable Remote Link (Manual)</span>
                  </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Available Protocols">
                  {filteredAndSortedProducts.map((product) => (
                    <CommandItem
                      key={product.g2bulk_product_id}
                      onSelect={() => handleSelect(product.g2bulk_product_id)}
                      className="rounded-xl py-3 px-4 flex items-center justify-between cursor-pointer hover:bg-pink-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                         <div className={cn("w-2 h-2 rounded-full", value === product.g2bulk_product_id ? "bg-[#FF2D85] animate-pulse" : "bg-slate-200")} />
                         <div className="flex flex-col min-w-0">
                            <span className="font-black text-xs text-[#3D001F] truncate uppercase">{product.product_name}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{product.game_name}</span>
                         </div>
                      </div>
                      <Badge className="bg-white text-slate-900 border-slate-100 font-black text-[10px] shadow-sm ml-4">${product.price}</Badge>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-slate-100 bg-slate-50" onClick={loadProducts} disabled={loading}>
          <RefreshCw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
        </Button>
      </div>
    </div>
  );
};

export default G2BulkProductSelector;
