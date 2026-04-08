import React, { useState } from 'react';
import { useSite, SiteSettings } from '@/contexts/SiteContext';
import { 
  Home, 
  Type, 
  Image as ImageIcon, 
  Palette, 
  Save, 
  Globe, 
  Facebook, 
  Send, 
  Zap,
  Layout,
  Plus,
  Trash2,
  Loader2,
  Phone,
  Mail,
  Headset,
  Images,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ImageUpload from '@/components/ImageUpload';
import { toast } from '@/hooks/use-toast';

const AdminHome: React.FC = () => {
  const { settings, updateSettings } = useSite();
  const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(localSettings);
      toast({ title: 'Home Parameters Synchronized' });
    } catch (error) {
      toast({ title: 'Commit Failed', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key: keyof SiteSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const addBannerImage = (url: string) => {
    const currentBanners = localSettings.bannerImages || [];
    if (currentBanners.length >= 10) {
      toast({ title: "Limit Reached", description: "Maximum of 10 banners allowed.", variant: "destructive" });
      return;
    }
    updateField('bannerImages', [...currentBanners, url]);
  };

  const removeBannerImage = (index: number) => {
    const currentBanners = localSettings.bannerImages || [];
    const nextBanners = currentBanners.filter((_, i) => i !== index);
    updateField('bannerImages', nextBanners);
  };

  return (
    <div className="space-y-12 text-black pb-24">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase text-[#3D001F]">Home Interface</h1>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#FF2D85] rounded-full animate-ping" />
             <p className="text-[#FF2D85] text-[10px] font-black uppercase tracking-[0.4em]">Visual Node Configuration</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#FF2D85] text-white font-black text-[10px] uppercase tracking-widest h-14 px-10 rounded-2xl shadow-xl shadow-pink-200">
          {isSaving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
          Commit All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
         
         <div className="lg:col-span-7 space-y-10">
            {/* Brand & Identity */}
            <section className="bg-white border-2 border-pink-100 rounded-[3rem] p-10 shadow-sm space-y-10">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF2D85]">
                     <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F]">Core Identity</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Store Identity Name</Label>
                     <Input 
                        value={localSettings.siteName}
                        onChange={(e) => updateField('siteName', e.target.value)}
                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold" 
                     />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Browser Title Node</Label>
                     <Input 
                        value={localSettings.browserTitle}
                        onChange={(e) => updateField('browserTitle', e.target.value)}
                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 font-bold" 
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Main Logo Asset</Label>
                     <ImageUpload value={localSettings.logoUrl} onChange={(url) => updateField('logoUrl', url)} folder="settings" />
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site Favicon Node</Label>
                     <ImageUpload value={localSettings.siteIcon} onChange={(url) => updateField('siteIcon', url)} folder="settings" />
                  </div>
               </div>
            </section>

            {/* Banner Slider System */}
            <section className="bg-white border-2 border-pink-100 rounded-[3rem] p-10 shadow-sm space-y-10">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF2D85]">
                        <Images className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F]">Hero Slider Node</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-image injection protocol ({localSettings.bannerImages?.length || 0}/10)</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                     {localSettings.bannerImages?.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                           <img src={url} className="w-full h-full object-cover" />
                           <button 
                              onClick={() => removeBannerImage(idx)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                           >
                              <X className="w-3.5 h-3.5" />
                           </button>
                           <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-black text-center py-1 uppercase">Node 0{idx+1}</div>
                        </div>
                     ))}
                     {(localSettings.bannerImages?.length || 0) < 10 && (
                        <div className="aspect-square">
                           <ImageUpload 
                              value="" 
                              onChange={(url) => addBannerImage(url)} 
                              folder="banners"
                              placeholder="Add Node"
                              icon={Plus}
                              className="h-full"
                           />
                        </div>
                     )}
                  </div>
                  
                  <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-100 space-y-4">
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                        <Type className="w-3 h-3 text-[#FF2D85]" /> Hero Primary Text
                     </Label>
                     <Input 
                        value={localSettings.heroText}
                        onChange={(e) => updateField('heroText', e.target.value)}
                        className="h-14 bg-white border-slate-200 rounded-xl font-black text-black px-6" 
                     />
                  </div>
               </div>
            </section>
         </div>

         <div className="lg:col-span-5 space-y-10">
            {/* Support Node */}
            <section className="bg-white border-2 border-pink-100 rounded-[3rem] p-10 shadow-sm space-y-10">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF2D85]">
                     <Headset className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F]">Support Node</h3>
               </div>

               <div className="space-y-6">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Support Line</Label>
                     <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Phone className="w-5 h-5 text-[#FF2D85]" />
                        <Input 
                           value={localSettings.supportPhone}
                           onChange={(e) => updateField('supportPhone', e.target.value)}
                           className="bg-transparent border-none shadow-none font-bold text-black"
                        />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Terminal</Label>
                     <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <Mail className="w-5 h-5 text-[#FF2D85]" />
                        <Input 
                           value={localSettings.supportEmail}
                           onChange={(e) => updateField('supportEmail', e.target.value)}
                           className="bg-transparent border-none shadow-none font-bold text-black"
                        />
                     </div>
                  </div>
               </div>
            </section>

            {/* Visual Settings */}
            <section className="bg-white border-2 border-pink-100 rounded-[3rem] p-10 shadow-sm space-y-10">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF2D85]">
                     <Layout className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F]">Site Skin</h3>
               </div>

               <div className="space-y-8">
                  <div className="space-y-3">
                     <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Global Background Node</Label>
                     <ImageUpload value={localSettings.backgroundImage} onChange={(url) => updateField('backgroundImage', url)} folder="settings" />
                  </div>
               </div>
            </section>
         </div>

      </div>
    </div>
  );
};

export default AdminHome;
