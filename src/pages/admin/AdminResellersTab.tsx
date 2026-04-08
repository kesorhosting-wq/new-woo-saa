import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  Users, Key, Percent, Search, Plus, Trash2, Copy, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Reseller {
  user_id: string;
  display_name: string;
  email: string;
  wallet_balance: number;
  api_key?: string;
  is_active?: boolean;
}

const AdminResellersTab: React.FC = () => {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [discount, setDiscount] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load Discount
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'reseller_discount_percentage')
        .single();
      
      if (settingsData && settingsData.value) {
        setDiscount(settingsData.value as string);
      }

      // Load Resellers
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'reseller');

      if (rolesError) throw rolesError;

      if (rolesData && rolesData.length > 0) {
        const userIds = rolesData.map(r => r.user_id);
        
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email, wallet_balance')
          .in('id', userIds);

        if (profilesError) throw profilesError;

        const { data: keysData, error: keysError } = await supabase
          .from('reseller_api_keys')
          .select('user_id, api_key, is_active')
          .in('user_id', userIds);

        if (keysError) throw keysError;

        const combinedData: Reseller[] = (profilesData || []).map(profile => {
          const keyInfo = (keysData || []).find(k => k.user_id === profile.id);
          return {
            user_id: profile.id,
            display_name: profile.display_name || 'Unknown',
            email: profile.email || 'Unknown',
            wallet_balance: profile.wallet_balance || 0,
            api_key: keyInfo?.api_key,
            is_active: keyInfo?.is_active
          };
        });

        setResellers(combinedData);
      } else {
        setResellers([]);
      }
    } catch (error: any) {
      toast({ title: 'Error loading data', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDiscount = async () => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'reseller_discount_percentage', value: discount }, { onConflict: 'key' });

      if (error) throw error;
      toast({ title: 'Discount Updated' });
    } catch (error: any) {
      toast({ title: 'Error updating discount', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddReseller = async () => {
    if (!searchEmail) return;
    setIsSearching(true);
    try {
      // Find user by email in profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', searchEmail)
        .single();

      if (profileError || !profileData) {
         toast({ title: 'User not found', description: 'Make sure the user has logged in at least once.', variant: 'destructive' });
         return;
      }

      // Add to user_roles
      // First check if already has the role to avoid duplicate errors
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', profileData.id)
        .eq('role', 'reseller')
        .maybeSingle();

      if (!existingRole) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: profileData.id, role: 'reseller' });

        if (roleError) throw roleError;
      }

      toast({ title: 'Reseller Added Successfully' });
      setSearchEmail('');
      loadData();
    } catch (error: any) {
      toast({ title: 'Error adding reseller', description: error.message, variant: 'destructive' });
    } finally {
      setIsSearching(false);
    }
  };

  const generateApiKey = async (userId: string) => {
    try {
      const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Check if exists first to avoid constraint errors
      const { data: existing } = await supabase
        .from('reseller_api_keys')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from('reseller_api_keys')
          .update({ api_key: newKey, is_active: true })
          .eq('user_id', userId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('reseller_api_keys')
          .insert({ 
            user_id: userId, 
            api_key: newKey,
            is_active: true
          });
        error = insertError;
      }

      if (error) throw error;
      
      toast({ title: 'API Key Generated' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Error generating key', description: error.message, variant: 'destructive' });
    }
  };

  const toggleKeyStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('reseller_api_keys')
        .update({ is_active: !currentStatus })
        .eq('user_id', userId);

      if (error) throw error;
      toast({ title: `Key ${!currentStatus ? 'Activated' : 'Deactivated'}` });
      loadData();
    } catch (error: any) {
      toast({ title: 'Error updating key', description: error.message, variant: 'destructive' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight text-[#3D001F]">Reseller Network</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Manage API access and global pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Global Settings */}
         <section className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Percent className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-black uppercase tracking-tight">Global Discount</h3>
            </div>
            <div className="flex items-end gap-4">
               <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Percentage Off All Packages (%)</Label>
                  <Input 
                     type="number" 
                     value={discount} 
                     onChange={(e) => setDiscount(e.target.value)}
                     className="bg-slate-50 border-slate-100 font-bold"
                  />
               </div>
               <Button onClick={handleSaveDiscount} className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs px-8">
                  Save
               </Button>
            </div>
            <p className="text-[10px] text-slate-400 mt-4 leading-relaxed font-bold uppercase tracking-tighter">
               This discount is applied dynamically via the Reseller API endpoints. It does not affect prices on the main storefront.
            </p>
         </section>

         {/* Add Reseller */}
         <section className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
               <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-black uppercase tracking-tight">Onboard Reseller</h3>
            </div>
            <div className="flex items-end gap-4">
               <div className="flex-1 space-y-2">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User Email Address</Label>
                  <Input 
                     type="email" 
                     placeholder="reseller@example.com"
                     value={searchEmail} 
                     onChange={(e) => setSearchEmail(e.target.value)}
                     className="bg-slate-50 border-slate-100 font-bold"
                  />
               </div>
               <Button 
                  onClick={handleAddReseller} 
                  disabled={isSearching || !searchEmail}
                  className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-xs px-8"
               >
                  {isSearching ? '...' : 'Upgrade'}
               </Button>
            </div>
         </section>
      </div>

      {/* Reseller List */}
      <section className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm">
         <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-[#FF2D85]/10 text-[#FF2D85] rounded-xl flex items-center justify-center">
               <Key className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tight">Active Resellers & Keys</h3>
         </div>

         {isLoading ? (
            <div className="text-center py-8 text-slate-400 text-xs font-black uppercase tracking-widest">Loading Network...</div>
         ) : resellers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
               <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-3" />
               <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No Resellers Found</p>
               <p className="text-[10px] text-slate-400 uppercase mt-1">Upgrade a user to begin.</p>
            </div>
         ) : (
            <div className="space-y-4">
               {resellers.map((reseller) => (
                  <div key={reseller.user_id} className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-slate-50 border border-slate-100">
                     <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                           <span className="font-black text-sm uppercase">{reseller.display_name}</span>
                           {reseller.is_active && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase rounded-full tracking-widest">API Active</span>
                           )}
                        </div>
                        <div className="text-xs text-slate-500 font-bold">{reseller.email}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">
                           Wallet Balance: <span className="text-[#FF2D85]">${reseller.wallet_balance.toFixed(2)}</span>
                        </div>
                     </div>

                     <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        {reseller.api_key ? (
                           <>
                              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 w-full sm:w-auto">
                                 <code className="text-xs font-mono text-slate-600 truncate max-w-[150px]">
                                    {reseller.api_key.substring(0, 12)}...
                                 </code>
                                 <button onClick={() => copyToClipboard(reseller.api_key!)} className="p-1.5 hover:bg-slate-100 rounded-md text-slate-400 transition-colors">
                                    <Copy className="w-3.5 h-3.5" />
                                 </button>
                              </div>
                              <Button 
                                 variant="outline" 
                                 onClick={() => toggleKeyStatus(reseller.user_id, reseller.is_active!)}
                                 className="w-full sm:w-auto text-xs font-black uppercase tracking-widest"
                              >
                                 {reseller.is_active ? 'Revoke Access' : 'Enable Access'}
                              </Button>
                           </>
                        ) : (
                           <Button 
                              onClick={() => generateApiKey(reseller.user_id)}
                              className="w-full sm:w-auto bg-[#FF2D85] hover:bg-[#D81B60] text-white text-xs font-black uppercase tracking-widest"
                           >
                              <Plus className="w-4 h-4 mr-2" /> Generate Key
                           </Button>
                        )}
                     </div>
                  </div>
               ))}
            </div>
         )}
      </section>

    </div>
  );
};

export default AdminResellersTab;
