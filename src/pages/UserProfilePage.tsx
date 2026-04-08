import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { motion } from 'framer-motion';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Shield, Wallet, History, Settings, LogOut } from 'lucide-react';

const UserProfilePage: React.FC = () => {
  const { user, signOut } = useAuth();
  const { settings } = useSite();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader />
      
      <main className="flex-1 container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-muted/30 border border-white/5 rounded-3xl p-8 text-center backdrop-blur-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
               <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-primary-foreground text-3xl font-black mx-auto mb-6 shadow-xl shadow-primary/20">
                  {user?.email?.slice(0, 2).toUpperCase() || 'U'}
               </div>
               <h2 className="text-xl font-bold truncate mb-1">{user?.email?.split('@')[0]}</h2>
               <p className="text-xs text-muted-foreground uppercase tracking-widest mb-8">{user?.email}</p>
               
               <div className="flex flex-col gap-2">
                  <Button variant="outline" className="justify-start gap-3 rounded-xl border-white/5 bg-white/5 h-12">
                     <Wallet className="w-4 h-4 text-primary" />
                     <span className="font-bold text-sm">Wallet: $0.00</span>
                  </Button>
                  <Button variant="outline" className="justify-start gap-3 rounded-xl border-white/5 bg-white/5 h-12">
                     <History className="w-4 h-4 text-primary" />
                     <span className="font-bold text-sm">Order History</span>
                  </Button>
               </div>
            </div>

            <Button 
              onClick={signOut}
              variant="ghost" 
              className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10 h-12 rounded-xl"
            >
               <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
             <section className="bg-muted/30 border border-white/5 rounded-3xl p-10 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                   <User className="w-6 h-6 text-primary" />
                   Account Information
                </h3>
                
                <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Display Name</label>
                         <Input defaultValue={user?.email?.split('@')[0]} className="bg-background/50 border-white/10 h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                         <Input disabled defaultValue={user?.email || ''} className="bg-background/50 border-white/10 h-12 rounded-xl opacity-50 cursor-not-allowed" />
                      </div>
                   </div>

                   <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                      <Shield className="w-6 h-6 text-primary mt-1" />
                      <div>
                         <h4 className="font-bold text-sm mb-1">Security Status</h4>
                         <p className="text-xs text-muted-foreground leading-relaxed">
                            Your account is protected by industry-standard encryption. Enable Two-Factor Authentication (2FA) for extra security.
                         </p>
                      </div>
                   </div>

                   <Button className="bg-primary text-primary-foreground font-bold px-8 h-12 rounded-xl shadow-lg shadow-primary/20">
                      Save Changes
                   </Button>
                </div>
             </section>

             <section className="bg-muted/30 border border-white/5 rounded-3xl p-10 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                   <Settings className="w-6 h-6 text-primary" />
                   Preferences
                </h3>
                <div className="flex items-center justify-between p-4 bg-background/50 rounded-2xl border border-white/5">
                   <div>
                      <h4 className="font-bold text-sm">Order Notifications</h4>
                      <p className="text-[10px] text-muted-foreground">Receive email updates about your orders</p>
                   </div>
                   <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full ml-auto" />
                   </div>
                </div>
             </section>
          </div>

        </div>
      </main>

      <ModernFooter />
    </div>
  );
};

export default UserProfilePage;
