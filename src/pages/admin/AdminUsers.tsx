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
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, email, wallet_balance');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const userProfiles: UserProfile[] = profiles.map(profile => ({
        ...profile,
        roles: roles.filter(r => r.user_id === profile.id).map(r => r.role as string)
      }));

      setUsers(userProfiles);
      setFilteredUsers(userProfiles);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load user directory');
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
        // Remove role (only if it's not the last admin maybe? but let's keep it simple)
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (error) throw error;
        toast.success(`Removed ${role} role`);
      } else {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: role as any });
        
        if (error) throw error;
        toast.success(`Added ${role} role`);
      }
      fetchUsers();
    } catch (error: any) {
      console.error('Error toggling role:', error);
      toast.error(error.message || 'Operation failed');
    }
  };

  return (
    <div className="space-y-12 text-black pb-24">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase text-[#3D001F]">User Registry</h1>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#FF2D85] rounded-full animate-ping" />
             <p className="text-[#FF2D85] text-[10px] font-black uppercase tracking-[0.4em]">Clearance & ID Management</p>
          </div>
        </div>
        <Button onClick={fetchUsers} disabled={isLoading} variant="outline" className="rounded-2xl h-14 px-8 border-pink-100 font-black text-[10px] uppercase tracking-widest shadow-sm">
           <RefreshCw className={cn("w-4 h-4 mr-3", isLoading && "animate-spin")} />
           Reload Directory
        </Button>
      </div>

      <div className="bg-white border-2 border-pink-100 rounded-[3rem] p-10 shadow-sm space-y-8">
        <div className="relative">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
           <Input 
             placeholder="Search by ID, email or designation..." 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="h-16 pl-16 bg-slate-50 border-slate-100 rounded-2xl font-bold text-black"
           />
        </div>

        {isLoading ? (
           <div className="flex items-center justify-center py-24">
              <RefreshCw className="w-12 h-12 animate-spin text-[#FF2D85]/20" />
           </div>
        ) : (
           <div className="overflow-x-auto">
              <table className="w-full">
                 <thead>
                    <tr className="text-left border-b border-slate-50">
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operator</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorization</th>
                       <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Credit Node</th>
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
                             <div className="flex gap-2">
                                {user.roles.length === 0 && <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-100 text-[8px] font-black uppercase">User</Badge>}
                                {user.roles.map(role => (
                                   <Badge key={role} className={cn(
                                      "text-[8px] font-black uppercase px-2 py-0.5",
                                      role === 'admin' ? "bg-red-50 text-red-600 border-red-100" : 
                                      role === 'reseller' ? "bg-blue-50 text-blue-600 border-blue-100" : 
                                      "bg-slate-50 text-slate-500 border-slate-100"
                                   )}>
                                      {role}
                                   </Badge>
                                ))}
                             </div>
                          </td>
                          <td className="py-6 text-right">
                             <div className="font-black text-sm text-black">${user.wallet_balance.toFixed(2)}</div>
                             <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Available Assets</div>
                          </td>
                          <td className="py-6 text-right">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                   <Button variant="ghost" className="w-10 h-10 p-0 rounded-xl hover:bg-pink-50">
                                      <MoreHorizontal className="w-5 h-5 text-slate-400" />
                                   </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-pink-50">
                                   <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-3 py-2">Security Clearance</DropdownMenuLabel>
                                   <DropdownMenuSeparator className="bg-slate-50" />
                                   <DropdownMenuItem onClick={() => toggleRole(user.id, 'admin', user.roles.includes('admin'))} className="rounded-xl px-3 py-3 cursor-pointer group">
                                      <Shield className={cn("w-4 h-4 mr-3 transition-colors", user.roles.includes('admin') ? "text-red-500" : "text-slate-400 group-hover:text-red-500")} />
                                      <span className="text-xs font-black uppercase tracking-tight">{user.roles.includes('admin') ? 'Revoke Admin' : 'Grant Admin'}</span>
                                   </DropdownMenuItem>
                                   <DropdownMenuItem onClick={() => toggleRole(user.id, 'reseller', user.roles.includes('reseller'))} className="rounded-xl px-3 py-3 cursor-pointer group">
                                      <Key className={cn("w-4 h-4 mr-3 transition-colors", user.roles.includes('reseller') ? "text-blue-500" : "text-slate-400 group-hover:text-blue-500")} />
                                      <span className="text-xs font-black uppercase tracking-tight">{user.roles.includes('reseller') ? 'Revoke Reseller' : 'Grant Reseller'}</span>
                                   </DropdownMenuItem>
                                   <DropdownMenuSeparator className="bg-slate-50" />
                                   <DropdownMenuItem className="rounded-xl px-3 py-3 cursor-pointer group text-red-500">
                                      <Trash2 className="w-4 h-4 mr-3" />
                                      <span className="text-xs font-black uppercase tracking-tight">Purge Operator</span>
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
  );
};

import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';

export default AdminUsers;
