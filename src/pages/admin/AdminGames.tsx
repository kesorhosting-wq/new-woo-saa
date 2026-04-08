import React, { useState } from 'react';
import { useSite, Game, Package as PackageType } from '@/contexts/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Gamepad2, Edit2, Trash2, MoreVertical, 
  Star, Package, ArrowRightLeft, X, Save, ChevronDown, 
  ChevronUp, Zap, Sparkles, TrendingUp, MoveUp, MoveDown, 
  RefreshCcw, Loader2, Download, Copy 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import ImageUpload from '@/components/ImageUpload';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import G2BulkProductSelector from '@/components/admin/G2BulkProductSelector';
import { supabase } from '@/integrations/supabase/client';
import G2BulkFullImport from '@/components/admin/G2BulkFullImport';

const AdminGames: React.FC = () => {
  const site = useSite();
  if (!site) return <div className="p-20 text-center text-black bg-white font-black uppercase tracking-widest">Initialising Node System...</div>;

  const { 
    games = [], 
    addGame, updateGame, deleteGame,
    addPackage, updatePackage, deletePackage, movePackage,
    addSpecialPackage, updateSpecialPackage, deleteSpecialPackage
  } = site;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [isGameDialogOpen, setIsGameDialogOpen] = useState(false);
  const [isPackageDialogOpen, setIsPackageDialogOpen] = useState(false);
  const [isFetchingG2Bulk, setIsFetchingG2Bulk] = useState(false);
  
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [gameData, setGameData] = useState({ name: '', image: '', coverImage: '', g2bulkCategoryId: '', featured: false });
  
  const [editingPackage, setEditingPackage] = useState<{pkg: PackageType, isSpecial: boolean} | null>(null);
  const [isSpecialMode, setIsSpecialMode] = useState(false);
  const [targetGameId, setTargetGameId] = useState<string>('');
  const [packageData, setPackageData] = useState({ 
    name: '', amount: '', price: 0, currency: 'USD', icon: '', 
    label: '', labelBgColor: '#FF2D85', labelTextColor: '#ffffff', 
    g2bulkProductId: '', g2bulkTypeId: '', quantity: 1 
  });

  const filteredGames = Array.isArray(games) ? games.filter(game => 
    game?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const handleAutoFetchG2Bulk = async () => {
    if (!gameData.g2bulkCategoryId) return toast({ title: "ID Required", variant: "destructive" });
    setIsFetchingG2Bulk(true);
    try {
      const { data, error } = await supabase.functions.invoke('g2bulk-api', {
        body: { action: 'get_g2bulk_game_details', game_code: gameData.g2bulkCategoryId }
      });
      if (error || !data.success) throw new Error(data?.error || 'Node fetch failed');
      setGameData({ ...gameData, name: data.data.game.name, image: data.data.game.image, g2bulkCategoryId: data.data.game.code });
      toast({ title: "Identity Synchronized" });
    } catch (err: any) { toast({ title: "Fetch Error", description: err.message, variant: "destructive" }); }
    finally { setIsFetchingG2Bulk(false); }
  };

  const handleSaveGame = async () => {
    if (!gameData.name || !gameData.image) return toast({ title: "Data Incomplete", variant: "destructive" });
    try {
      if (editingGame) await updateGame(editingGame.id, gameData);
      else await addGame(gameData);
      setIsGameDialogOpen(false);
      toast({ title: "Node Updated" });
    } catch (err: any) { toast({ title: "Save Failed", variant: "destructive" }); }
  };

  const handleOpenPackageDialog = (gameId: string, pkg: PackageType | null = null, isSpecial = false) => {
    setTargetGameId(gameId);
    setIsSpecialMode(isSpecial);
    if (pkg) {
      setEditingPackage({ pkg, isSpecial });
      setPackageData({
        name: pkg.name, amount: pkg.amount, price: pkg.price, currency: pkg.currency || 'USD',
        icon: pkg.icon || '', label: pkg.label || '', labelBgColor: pkg.labelBgColor || '#FF2D85',
        labelTextColor: pkg.labelTextColor || '#ffffff', g2bulkProductId: pkg.g2bulkProductId || '',
        g2bulkTypeId: pkg.g2bulkTypeId || '', quantity: pkg.quantity || 1
      });
    } else {
      setEditingPackage(null);
      setPackageData({ 
        name: '', amount: '', price: 0, currency: 'USD', icon: '', 
        label: isSpecial ? 'ELITE' : '', labelBgColor: '#FF2D85', labelTextColor: '#ffffff', 
        g2bulkProductId: '', g2bulkTypeId: '', quantity: 1 
      });
    }
    setIsPackageDialogOpen(true);
  };

  const handleCopyFromStandard = (standardPkgId: string) => {
    const game = games.find(g => g.id === targetGameId);
    const pkg = game?.packages?.find(p => p.id === standardPkgId);
    if (pkg) {
      setPackageData({
        ...packageData, name: pkg.name, amount: pkg.amount, price: pkg.price,
        quantity: pkg.quantity || 1, g2bulkProductId: pkg.g2bulkProductId || '',
        g2bulkTypeId: pkg.g2bulkTypeId || '', icon: pkg.icon || ''
      });
      toast({ title: "Parameters Copied" });
    }
  };

  const handleSavePackage = async () => {
    if (!packageData.name || packageData.price < 0) return toast({ title: "Invalid Data", variant: "destructive" });
    try {
      if (editingPackage) {
        if (editingPackage.isSpecial) await updateSpecialPackage(targetGameId, editingPackage.pkg.id, packageData);
        else await updatePackage(targetGameId, editingPackage.pkg.id, packageData);
      } else {
        if (isSpecialMode) await addSpecialPackage(targetGameId, packageData);
        else await addPackage(targetGameId, packageData);
      }
      setIsPackageDialogOpen(false);
      toast({ title: "Saved" });
    } catch (err: any) { toast({ title: "Save Error", description: err.message, variant: "destructive" }); }
  };

  const currentTargetGame = targetGameId ? games.find(g => g.id === targetGameId) : null;

  return (
    <div className="space-y-10 text-black bg-white min-h-screen p-4 md:p-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tighter uppercase text-[#3D001F]">Product Grid</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Core Hub Management</p>
        </div>
        <Button onClick={() => { setEditingGame(null); setGameData({ name: '', image: '', coverImage: '', g2bulkCategoryId: '', featured: false }); setIsGameDialogOpen(true); }} className="bg-[#FF2D85] text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl">
          <Plus className="w-5 h-5 mr-3" /> Register Game Node
        </Button>
      </div>

      <div className="px-4"><G2BulkFullImport onImportComplete={() => site.refreshGames()} /></div>

      <div className="relative group px-4">
        <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300" />
        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Filter Node Clusters..." className="bg-slate-50 border-slate-100 pl-14 h-16 rounded-[2rem] font-black text-black" />
      </div>

      <div className="space-y-6 pb-32 px-4 text-black">
        {filteredGames.map((game) => (
          <div key={game.id} className="bg-white border-2 border-slate-50 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500">
            <div className="p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-black">
               <div className="flex items-center gap-8">
                  <div className="w-24 h-24 rounded-[2.5rem] overflow-hidden border-2 border-slate-100 bg-slate-50">
                     <img src={game.image} alt={game.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')} />
                  </div>
                  <div>
                     <h3 className="text-2xl font-black text-[#3D001F] uppercase tracking-tighter mb-2">{game.name}</h3>
                     <div className="flex items-center gap-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-pink-500" /> {game.packages?.length || 0} Loads</span>
                        <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-pink-500" /> {game.specialPackages?.length || 0} Elite</span>
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Button onClick={() => setExpandedGameId(expandedGameId === game.id ? null : game.id)} variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 font-black text-[10px] uppercase text-[#3D001F]">
                     {expandedGameId === game.id ? 'Hide Loads' : 'Manage Loads'}
                  </Button>
                  <Button onClick={() => { setEditingGame(game); setGameData({ name: game.name, image: game.image, coverImage: game.coverImage || '', g2bulkCategoryId: game.g2bulkCategoryId || '', featured: !!game.featured }); setIsGameDialogOpen(true); }} variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 p-0 text-slate-400 hover:text-pink-500"><Edit2 className="w-5 h-5" /></Button>
                  <Button onClick={() => deleteGame(game.id)} variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 p-0 text-slate-400 hover:text-red-500"><Trash2 className="w-5 h-5" /></Button>
               </div>
            </div>

            <AnimatePresence>
               {expandedGameId === game.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t-2 border-slate-50 bg-slate-50/20 p-10 space-y-12">
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-pink-500 uppercase tracking-[0.4em]">Elite Load Configurations</h4>
                          <Button onClick={() => handleOpenPackageDialog(game.id, null, true)} size="sm" className="bg-pink-500 text-white font-black text-[9px] uppercase px-6 rounded-xl h-10">Add Elite</Button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {game.specialPackages?.map((pkg) => (
                            <div key={pkg.id} className="bg-white border-2 border-pink-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between group hover:border-pink-500 transition-all">
                               <div className="flex justify-between mb-4">
                                  <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all"><Zap className="w-5 h-5" /></div>
                                  <div className="flex gap-1">
                                     <button onClick={() => handleOpenPackageDialog(game.id, pkg, true)} className="p-2 text-slate-300 hover:text-pink-500"><Edit2 className="w-4 h-4" /></button>
                                     <button onClick={() => deleteSpecialPackage(game.id, pkg.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                               </div>
                               <div className="font-black text-xs text-black uppercase mb-4">{pkg.name}</div>
                               <div className="flex justify-between items-center"><div className="text-xl font-black text-pink-500">${Number(pkg.price).toFixed(2)}</div><Badge className="bg-slate-50 text-slate-400 font-black text-[8px] uppercase">{pkg.amount}</Badge></div>
                            </div>
                          ))}
                       </div>
                    </div>
                    <div className="space-y-6">
                       <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Standard Load Configurations</h4>
                          <Button onClick={() => handleOpenPackageDialog(game.id, null, false)} size="sm" className="bg-slate-900 text-white font-black text-[9px] uppercase px-6 rounded-xl h-10">Add Load</Button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          {game.packages?.map((pkg) => (
                            <div key={pkg.id} className="bg-white border-2 border-slate-50 rounded-3xl p-6 shadow-sm hover:border-slate-300 transition-all">
                               <div className="flex justify-between mb-4">
                                  <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Package className="w-4 h-4" /></div>
                                  <div className="flex gap-1">
                                     <button onClick={() => handleOpenPackageDialog(game.id, pkg, false)} className="p-2 text-slate-200 hover:text-pink-500"><Edit2 className="w-4 h-4" /></button>
                                     <button onClick={() => deletePackage(game.id, pkg.id)} className="p-2 text-slate-200 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                               </div>
                               <div className="font-black text-[10px] text-slate-900 uppercase mb-4 truncate">{pkg.name}</div>
                               <div className="text-lg font-black text-black">${Number(pkg.price).toFixed(2)}</div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      <Dialog open={isGameDialogOpen} onOpenChange={setIsGameDialogOpen}>
         <DialogContent className="bg-white border-pink-100 rounded-[3rem] p-10 max-w-2xl text-black">
            <DialogHeader><DialogTitle className="text-2xl font-black uppercase text-[#3D001F]">Config Node</DialogTitle></DialogHeader>
            <div className="space-y-8 py-6">
               <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-slate-100 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                     <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">Protocol Sync</span>
                     <Badge className="bg-pink-500 text-white font-black text-[8px] uppercase">Auto Node</Badge>
                  </div>
                  <div className="flex gap-3">
                     <Input value={gameData.g2bulkCategoryId} onChange={e => setGameData({...gameData, g2bulkCategoryId: e.target.value})} placeholder="G2Bulk Node ID" className="h-14 bg-white border-slate-200 rounded-xl font-black text-black" />
                     <Button onClick={handleAutoFetchG2Bulk} disabled={isFetchingG2Bulk} className="bg-slate-900 text-white h-14 px-6 rounded-xl font-black uppercase text-[10px]">
                        {isFetchingG2Bulk ? <Loader2 className="animate-spin" /> : 'Fetch Node'}
                     </Button>
                  </div>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 text-black">Identity Name</label>
                        <Input value={gameData.name} onChange={e => setGameData({...gameData, name: e.target.value})} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black text-black" />
                     </div>
                     <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border-2 border-slate-100"><input type="checkbox" checked={gameData.featured} onChange={e => setGameData({...gameData, featured: e.target.checked})} className="w-5 h-5 accent-pink-500" /><label className="text-xs font-black uppercase text-slate-600">Hot Status</label></div>
                  </div>
                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 text-black">Icon Node</label>
                        <ImageUpload value={gameData.image} onChange={u => setGameData({...gameData, image: u})} folder="games" />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 text-black">Cover Identity</label>
                        <ImageUpload value={gameData.coverImage} onChange={u => setGameData({...gameData, coverImage: u})} folder="games" />
                     </div>
                  </div>
               </div>
            </div>
            <Button onClick={handleSaveGame} className="w-full bg-[#FF2D85] text-white h-16 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">Commit Node Data</Button>
         </DialogContent>
      </Dialog>

      <Dialog open={isPackageDialogOpen} onOpenChange={setIsPackageDialogOpen}>
         <DialogContent className="bg-white border-pink-100 rounded-[3rem] p-10 max-w-4xl max-h-[90vh] overflow-y-auto text-black">
            <DialogHeader><DialogTitle className="text-2xl font-black uppercase text-[#3D001F]">Load Configuration</DialogTitle></DialogHeader>
            {editingPackage === null && isSpecialMode && (
               <div className="p-6 bg-pink-50/30 border-2 border-pink-100 rounded-[2rem] mb-6 space-y-3">
                  <Label className="text-[10px] font-black text-pink-500 uppercase tracking-widest flex items-center gap-2"><Copy className="w-3 h-3" /> Clone Parameters from Standard</Label>
                  {currentTargetGame ? (
                    <Select onValueChange={handleCopyFromStandard}>
                       <SelectTrigger className="h-14 bg-white border-pink-100 rounded-xl font-black text-black"><SelectValue placeholder="Target Node to Clone" /></SelectTrigger>
                       <SelectContent className="bg-white border-slate-100">
                          {currentTargetGame.packages?.map(p => <SelectItem key={p.id} value={p.id} className="font-black py-3 uppercase text-xs">{p.name} - ${p.price}</SelectItem>)}
                       </SelectContent>
                    </Select>
                  ) : <div className="text-[10px] font-bold text-slate-400 uppercase">Awaiting Context...</div>}
               </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 py-4">
               <div className="space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Load Identity</label><Input value={packageData.name} onChange={e => setPackageData({...packageData, name: e.target.value})} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Valuation (USD)</label><Input type="number" value={packageData.price} onChange={e => setPackageData({...packageData, price: parseFloat(e.target.value) || 0})} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Load Scale (Quantity)</label><Input type="number" value={packageData.quantity} onChange={e => setPackageData({...packageData, quantity: parseInt(e.target.value) || 1})} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black" /></div>
                  <div className="space-y-4 pt-4 border-t-2 border-slate-50">
                     <h5 className="text-[10px] font-black uppercase tracking-widest text-pink-500">G2Bulk Link Protocol</h5>
                     <G2BulkProductSelector value={packageData.g2bulkProductId} onChange={(productId, typeId) => setPackageData({...packageData, g2bulkProductId: productId || '', g2bulkTypeId: typeId || ''})} g2bulkCategoryId={currentTargetGame?.g2bulkCategoryId} />
                  </div>
               </div>
               <div className="space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Amount Label</label><Input value={packageData.amount} onChange={e => setPackageData({...packageData, amount: e.target.value})} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Badge Protocol</label><Input value={packageData.label} onChange={e => setPackageData({...packageData, label: e.target.value})} className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-black" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">Load Icon Node</label><ImageUpload value={packageData.icon} onChange={u => setPackageData({...packageData, icon: u})} folder="packages" /></div>
               </div>
            </div>
            <Button onClick={handleSavePackage} className="w-full bg-[#FF2D85] text-white h-16 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl">Commit Node Stream</Button>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGames;
