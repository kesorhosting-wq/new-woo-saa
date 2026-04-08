import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldCheck, 
  User as UserIcon, 
  Key, 
  Mail, 
  MoreHorizontal,
  RefreshCw,
  Wallet,
  Plus,
  Trash2,
  Database,
  AlertCircle,
  Code2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface UserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  wallet_balance: number;
  roles: string[];
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email, wallet_balance');

      if (profilesError) throw profilesError;

      // 2. Fetch Roles (Safe fetch)
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Combine data
      const userProfiles: UserProfile[] = (profiles || []).map(profile => ({
        ...profile,
        roles: (roles || []).filter(r => r.user_id === profile.id).map(r => r.role as string)
      }));

      setUsers(userProfiles);
      setFilteredUsers(userProfiles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Access Denied: Check Database Policies');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      users.filter(u => 
        (u.email?.toLowerCase().includes(query)) || 
        (u.display_name?.toLowerCase().includes(query))
      )
    );
  }, [searchQuery, users]);

  const toggleRole = async (userId: string, role: string, hasRole: boolean) => {
    try {
      if (hasRole) {
        await supabase.from('user_roles').delete().eq('user_id', userId).eq('role', role);
        toast.success(`Removed ${role} role`);
      } else {
        await supabase.from('user_roles').insert({ user_id: userId, role: role as any });
        toast.success(`Added ${role} role`);
      }
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleManualRefresh = async () => {
    setIsOnboarding(true);
    try {
      await fetchUsers();
      toast.success('Registry Sync Attempted');
    } finally {
      setIsOnboarding(false);
    }
  };

  return (
    <div className="space-y-12 text-black pb-24">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase text-[#3D001F]">User Registry</h1>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
             <p className="text-green-600 text-[10px] font-black uppercase tracking-[0.4em]">Database Sync Active</p>
          </div>
        </div>
        <Button onClick={fetchUsers} disabled={isLoading} variant="outline" className="rounded-2xl h-14 px-8 border-pink-100 font-black text-[10px] uppercase tracking-widest shadow-sm">
           <RefreshCw className={cn("w-4 h-4 mr-3", isLoading && "animate-spin")} />
           Reload Directory
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border-2 border-pink-100 rounded-[3rem] p-10 shadow-sm space-y-8">
               <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input 
                    placeholder="Search operators..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 pl-16 bg-slate-50 border-slate-100 rounded-2xl font-bold text-black"
                  />
               </div>

               {isLoading ? (
                  <div className="flex items-center justify-center py-24">
                     <RefreshCw className="w-12 h-12 animate-spin text-[#FF2D85]/20" />
                  </div>
               ) : users.length === 0 ? (
                  <div className="py-20 text-center space-y-6">
                     <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto border border-slate-100">
                        <AlertCircle className="w-10 h-10 text-slate-300" />
                     </div>
                     <div>
                        <h3 className="text-xl font-black uppercase text-slate-900">Registry Is Empty</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2 max-w-sm mx-auto leading-relaxed">
                           Users exist in Auth, but have not been linked to the Profiles table yet.
                        </p>
                     </div>
                     <div className="p-6 bg-amber-50 border border-amber-100 rounded-3xl text-left">
                        <div className="flex items-center gap-3 mb-4">
                           <Code2 className="w-4 h-4 text-amber-600" />
                           <span className="text-[10px] font-black uppercase text-amber-900">Emergency Repair Script</span>
                        </div>
                        <p className="text-[9px] text-amber-700 font-bold uppercase leading-relaxed mb-4">
                           Run this in your Supabase SQL Editor to instantly move all users into this list:
                        </p>
                        <pre className="bg-white p-3 rounded-lg text-[8px] font-mono text-slate-600 overflow-x-auto border border-amber-200">
{`INSERT INTO public.profiles (id, user_id, email, display_name, wallet_balance)
SELECT id, id, email, split_part(email, '@', 1), 0
FROM auth.users ON CONFLICT (user_id) DO NOTHING;`}
                        </pre>
                     </div>
                  </div>
               ) : (
                  <div className="overflow-x-auto">
                     <table className="w-full">
                        <thead>
                           <tr className="text-left border-b border-slate-50">
                              <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                              <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorization</th>
                              <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Available Assets</th>
                              <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {filteredUsers.map((user) => (
                              <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                                 <td className="py-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FF2D85] border border-pink-100">
                                          <UserIcon className="w-6 h-6" />
                                       </div>
                                       <div>
                                          <div className="font-black text-sm text-[#3D001F] uppercase">{user.display_name || 'Anonymous'}</div>
                                          <div className="text-[10px] font-bold text-slate-400">{user.email}</div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="py-6">
                                    <div className="flex flex-wrap gap-1.5">
                                       {user.roles.length === 0 && <Badge variant="outline" className="text-[8px] font-black uppercase px-2 py-0.5 border-slate-200 text-slate-400">User</Badge>}
                                       {user.roles.includes('admin') && <Badge className="text-[8px] font-black uppercase px-2 py-0.5 bg-red-50 text-red-600 border-red-100 shadow-none hover:bg-red-50">Admin</Badge>}
                                       {user.roles.includes('reseller') && <Badge className="text-[8px] font-black uppercase px-2 py-0.5 bg-blue-50 text-blue-600 border-blue-100 shadow-none hover:bg-blue-50">Reseller</Badge>}
                                    </div>
                                 </td>
                                 <td className="py-6 text-right">
                                    <div className="font-black text-sm text-[#FF2D85]">${user.wallet_balance.toFixed(2)}</div>
                                    <div className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">Credit Node</div>
                                 </td>
                                 <td className="py-6 text-right">
                                    <DropdownMenu>
                                       <DropdownMenuTrigger asChild><Button variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-pink-50"><MoreHorizontal className="w-5 h-5 text-slate-400" /></Button></DropdownMenuTrigger>
                                       <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-pink-50">
                                          <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Authorization</DropdownMenuLabel>
                                          <DropdownMenuSeparator className="bg-slate-50" />
                                          <DropdownMenuItem onClick={() => toggleRole(user.id, 'admin', user.roles.includes('admin'))} className="rounded-xl px-3 py-3 cursor-pointer group">
                                             <Shield className={cn("w-4 h-4 mr-3", user.roles.includes('admin') ? "text-red-500" : "text-slate-400")} />
                                             <span className="text-xs font-black uppercase tracking-tight">{user.roles.includes('admin') ? 'Revoke Admin' : 'Grant Admin'}</span>
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => toggleRole(user.id, 'reseller', user.roles.includes('reseller'))} className="rounded-xl px-3 py-3 cursor-pointer group">
                                             <Key className={cn("w-4 h-4 mr-3", user.roles.includes('reseller') ? "text-blue-500" : "text-slate-400")} />
                                             <span className="text-xs font-black uppercase tracking-tight">{user.roles.includes('reseller') ? 'Revoke Reseller' : 'Grant Reseller'}</span>
                                          </DropdownMenuItem>
                                       </DropdownMenuContent>
                                    </DropdownMenu>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               )}
            </div>
         </div>

         <div className="space-y-8">
            <section className="bg-white border-2 border-slate-100 rounded-[3rem] p-8 shadow-sm">
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                     <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight">System Sync</h3>
               </div>
               <div className="space-y-4">
                  <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                     <div className="flex items-center gap-3">
                        <Database className="w-4 h-4 text-slate-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Auto-Index Engine</span>
                     </div>
                     <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed">
                        If new registrations are not appearing, use the refresh button below to force a frontend update.
                     </p>
                  </div>
                  <Button 
                     onClick={handleManualRefresh}
                     disabled={isOnboarding}
                     className="w-full bg-black hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] h-14 rounded-xl shadow-lg"
                  >
                     {isOnboarding ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Refresh Operator List'}
                  </Button>
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

export default AdminUsers;
