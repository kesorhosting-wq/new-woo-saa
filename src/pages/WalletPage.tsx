import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { motion } from 'framer-motion';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, Plus, ArrowUpRight, History, ShieldCheck, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const WalletPage: React.FC = () => {
  const { user } = useAuth();
  const { settings } = useSite();
  const [amount, setAmount] = useState('');

  const quickAmounts = ['5', '10', '25', '50', '100'];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader />
      
      <main className="flex-1 container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto space-y-12">
          
          {/* Hero Balance Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 border border-primary/20 rounded-[2.5rem] p-12 relative overflow-hidden text-center backdrop-blur-xl"
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6">
                <Wallet className="w-4 h-4" />
                <span>Available Balance</span>
             </div>
             <div className="text-7xl md:text-8xl font-black glow-text mb-4">$0.00</div>
             <p className="text-muted-foreground text-sm uppercase tracking-widest">Ready for instant game top-ups</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
             
             {/* Top Up Section */}
             <section className="bg-muted/30 border border-white/5 rounded-3xl p-10 backdrop-blur-sm">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                   <Plus className="w-6 h-6 text-primary" />
                   Add Funds
                </h3>
                
                <div className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Enter Amount (USD)</label>
                      <div className="relative">
                         <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-primary">$</span>
                         <Input 
                           value={amount}
                           onChange={(e) => setAmount(e.target.value)}
                           placeholder="0.00" 
                           className="bg-background/50 border-white/10 h-16 pl-10 text-2xl font-black rounded-2xl focus:ring-primary/20" 
                         />
                      </div>
                   </div>

                   <div className="flex flex-wrap gap-3">
                      {quickAmounts.map((amt) => (
                         <button 
                           key={amt}
                           onClick={() => setAmount(amt)}
                           className="px-6 py-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/50 hover:bg-primary/10 transition-all font-bold text-sm"
                         >
                            +${amt}
                         </button>
                      ))}
                   </div>

                   <Button className="w-full h-14 bg-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-xl shadow-primary/20">
                      Top Up Now
                   </Button>

                   <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Secure Payment via KHQR
                   </div>
                </div>
             </section>

             {/* Recent Transactions */}
             <section className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-2xl font-bold flex items-center gap-3">
                      <History className="w-6 h-6 text-primary" />
                      Recent History
                   </h3>
                   <Button variant="link" className="text-primary font-bold text-xs uppercase hover:no-underline p-0 h-auto">View All</Button>
                </div>

                <div className="space-y-4">
                   {[1, 2, 3].map((_, idx) => (
                      <div key={idx} className="flex items-center justify-between p-5 bg-muted/30 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                               <ArrowUpRight className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                               <div className="text-sm font-bold">Wallet Topup</div>
                               <div className="text-[10px] text-muted-foreground uppercase">Via KHQR Pay</div>
                            </div>
                         </div>
                         <div className="text-right">
                            <div className="text-sm font-black text-green-500">+$25.00</div>
                            <div className="text-[10px] text-muted-foreground uppercase">Oct 12, 2023</div>
                         </div>
                      </div>
                   ))}
                   
                   <div className="p-8 text-center bg-white/2 rounded-2xl border border-dashed border-white/5 opacity-40">
                      <p className="text-xs font-bold uppercase tracking-widest">End of recent activity</p>
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

export default WalletPage;
