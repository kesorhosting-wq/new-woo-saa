import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSite } from '@/contexts/SiteContext';
import { motion, AnimatePresence } from 'framer-motion';
import ModernHeader from '@/components/ModernHeader';
import ModernFooter from '@/components/ModernFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Wallet, Plus, ArrowUpRight, History, ShieldCheck, CreditCard, Loader2, ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

const WalletPage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Topup states
  const [showQR, setShowQR] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const quickAmounts = ['5', '10', '25', '50', '100'];

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      fetchWalletData();
    }
  }, [user, authLoading]);

  useEffect(() => {
    let timer: any;
    if (showQR && timeLeft > 0 && paymentStatus === 'pending') {
      timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && paymentStatus === 'pending') {
      setPaymentStatus('failed');
    }
    return () => clearTimeout(timer);
  }, [showQR, timeLeft, paymentStatus]);

  const fetchWalletData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Fetch Balance
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('wallet_balance')
        .eq('id', user.id)
        .single();
      
      if (profileError) throw profileError;
      setBalance(profile?.wallet_balance || 0);

      // Fetch Transactions
      const { data: txs, error: txError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (txError) throw txError;
      setTransactions(txs || []);

    } catch (error: any) {
      console.error('Wallet Data Fetch Error:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopup = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      toast.error('Minimum top-up is $1.00');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create a Wallet Deposit Order
      const { data: orderData, error: orderError } = await supabase
        .from('topup_orders')
        .insert({
          user_id: user?.id,
          game_name: 'Wallet Deposit',
          package_name: `Credit Add - $${numAmount}`,
          amount: numAmount,
          currency: 'USD',
          status: 'pending',
          payment_method: 'KHQR',
          player_id: user?.email || 'N/A'
        })
        .select()
        .single();

      if (orderError) throw orderError;
      setOrderId(orderData.id);

      // 2. Generate KHQR
      const { data, error } = await supabase.functions.invoke("ikhode-payment", {
        body: {
          action: 'generate-khqr',
          amount: numAmount,
          orderId: orderData.id,
          playerName: user?.email?.split('@')[0],
          gameName: 'Wallet Deposit',
          email: user?.email
        },
      });

      if (error || !data.qrCodeData) throw new Error(data?.error || 'QR generation failed');

      setGeneratedQR(data.qrCodeData);
      setShowQR(true);
      setTimeLeft(600);
      setPaymentStatus('pending');

      // 3. Setup polling or WebSocket for payment status
      // For now, let's use a simple polling as a fallback if WebSocket is not easily exposed
      const pollPayment = setInterval(async () => {
         const { data: updatedOrder } = await supabase
            .from('topup_orders')
            .select('status')
            .eq('id', orderData.id)
            .single();
         
         if (updatedOrder?.status === 'completed' || updatedOrder?.status === 'success') {
            clearInterval(pollPayment);
            setPaymentStatus('success');
            fetchWalletData();
            toast.success('Wallet Top-up Successful!');
         }
      }, 5000);

      // Auto-clear interval on unmount or success
      setTimeout(() => clearInterval(pollPayment), 600000);

    } catch (error: any) {
      console.error('Topup Error:', error);
      toast.error(error.message || 'Failed to initiate top-up');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (authLoading || (isLoading && !showQR)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
         <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ModernHeader />
      
      <main className="flex-1 container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <AnimatePresence mode="wait">
             {!showQR ? (
                <motion.div
                  key="main"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  {/* Hero Balance Card */}
                  <div className="bg-primary/10 border border-primary/20 rounded-[2.5rem] p-12 relative overflow-hidden text-center backdrop-blur-xl">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-10" />
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-[0.2em] mb-6">
                        <Wallet className="w-4 h-4" />
                        <span>Available Balance</span>
                    </div>
                    <div className="text-7xl md:text-8xl font-black glow-text mb-4">${balance.toFixed(2)}</div>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest">Ready for instant game top-ups</p>
                  </div>

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
                                  type="number"
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

                          <Button 
                            onClick={handleTopup}
                            disabled={isProcessing || !amount}
                            className="w-full h-14 bg-primary text-primary-foreground font-bold text-lg rounded-2xl shadow-xl shadow-primary/20"
                          >
                             {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Top Up Now'}
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
                        </div>

                        <div className="space-y-4">
                          {transactions.length > 0 ? (
                            transactions.map((tx) => (
                              <div key={tx.id} className="flex items-center justify-between p-5 bg-muted/30 border border-white/5 rounded-2xl group hover:border-white/10 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center \${tx.amount > 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                      <ArrowUpRight className={`w-5 h-5 \${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`} />
                                    </div>
                                    <div>
                                      <div className="text-sm font-bold">{tx.description || tx.type}</div>
                                      <div className="text-[10px] text-muted-foreground uppercase">{new Date(tx.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-sm font-black \${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {tx.amount > 0 ? '+' : ''}{tx.amount.toFixed(2)}
                                    </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-12 text-center bg-white/2 rounded-2xl border border-dashed border-white/10 opacity-40">
                              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No recent transmissions</p>
                            </div>
                          )}
                        </div>
                    </section>
                  </div>
                </motion.div>
             ) : (
                <motion.div
                   key="qr"
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.9 }}
                   className="max-w-md mx-auto"
                >
                   <div className="bg-white rounded-[3rem] p-12 flex flex-col items-center text-center shadow-2xl relative overflow-hidden border border-primary/20">
                      <div className="absolute top-0 left-0 w-full h-2 bg-primary" />
                      
                      {paymentStatus === 'success' ? (
                         <div className="py-12 text-black">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-8">
                               <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-3xl font-black uppercase mb-4 tracking-tighter">Top-up Successful!</h2>
                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-10">Assets have been injected.</p>
                            <Button onClick={() => setShowQR(false)} className="bg-black text-white px-12 h-14 rounded-xl font-black uppercase text-xs tracking-widest">
                               Back to Wallet
                            </Button>
                         </div>
                      ) : (
                         <>
                            <div className="mb-10 text-black">
                               <Badge className="bg-primary/10 text-primary border-primary/20 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
                                  Bakong KHQR Protocol
                               </Badge>
                               <h3 className="text-2xl font-black uppercase tracking-tight">Scan & Pay $ {parseFloat(amount).toFixed(2)}</h3>
                            </div>

                            <div className="relative p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 mb-10 shadow-inner">
                               <img src={generatedQR || ''} alt="KHQR" className="w-64 h-64 mix-blend-multiply" />
                            </div>

                            <div className="flex items-center gap-6 text-sm font-black mb-10 text-black">
                               <div className="flex items-center gap-3 bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100">
                                  <Clock className="w-5 h-5 text-primary" />
                                  <span className="text-slate-400 uppercase text-xs">Expires:</span>
                                  <span className="text-primary font-mono text-lg">{formatTime(timeLeft)}</span>
                               </div>
                            </div>

                            <Button 
                              variant="ghost" 
                              onClick={() => setShowQR(false)}
                              className="text-slate-400 hover:text-primary font-black text-[10px] uppercase tracking-widest gap-2"
                            >
                               <ArrowLeft className="w-4 h-4" /> Cancel Deposit
                            </Button>
                         </>
                      )}
                   </div>
                </motion.div>
             )}
          </AnimatePresence>

        </div>
      </main>

      <ModernFooter />
    </div>
  );
};

export default WalletPage;

