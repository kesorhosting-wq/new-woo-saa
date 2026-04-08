import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  UserCheck,
  XCircle,
  Zap,
  ShoppingCart,
  CreditCard,
  User,
  ShieldCheck,
  Info,
  ChevronRight,
  Gamepad2
} from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import ModernFooter from "@/components/ModernFooter";
import ModernPackageCard from "@/components/ModernPackageCard";
import ModernPaymentCard from "@/components/ModernPaymentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useSite } from "@/contexts/SiteContext";
import { useCart } from "@/contexts/CartContext";
import { useFavicon } from "@/hooks/useFavicon";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

const ModernTopupPage: React.FC = () => {
  const { gameSlug } = useParams();
  const navigate = useNavigate();
  const { games, paymentMethods, settings, isLoading } = useSite();
  const { addToCart } = useCart();

  const game = games.find((g) => g.slug === gameSlug || g.id === gameSlug);
  useFavicon(settings.siteIcon);

  const [userId, setUserId] = useState("");
  const [serverId, setServerId] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<{ username: string } | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gameVerificationConfig, setGameVerificationConfig] = useState<any>(null);

  // Fetch game verification config
  useEffect(() => {
    const fetchVerificationConfig = async () => {
      if (!game?.name) return;
      try {
        const { data } = await supabase
          .from("game_verification_configs")
          .select("*")
          .eq("is_active", true)
          .ilike("game_name", game.name)
          .maybeSingle();
        
        if (data) {
          setGameVerificationConfig(data);
        }
      } catch (err) {
        console.error("Error fetching verification config:", err);
      }
    };
    fetchVerificationConfig();
  }, [game?.name]);

  const heartopiaServers = [
    { label: 'Asia', value: 'asia' },
    { label: 'Europe', value: 'europe' },
    { label: 'NA', value: 'na' },
    { label: 'SA', value: 'sa' },
  ];

  const handleVerify = async () => {
    if (!userId) {
       toast({ title: "ID Required", description: "Please enter your Player ID.", variant: "destructive" });
       return;
    }
    setIsVerifying(true);
    setVerificationError(null);
    setVerifiedUser(null);

    try {
      const { data, error } = await supabase.functions.invoke("verify-game-id", {
        body: { gameId: game?.id, userId, serverId: serverId || undefined, gameName: game?.name },
      });

      if (error || !data.success) {
        setVerificationError(data?.error || "Failed to verify user ID");
        toast({ title: "Error", description: data?.error || "User not found", variant: "destructive" });
      } else {
        setVerifiedUser({ username: data.username });
        toast({ title: "Success", description: `Account: ${data.username}` });
      }
    } catch (err) {
      setVerificationError("Verification error occurred");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCheckout = async () => {
    if (!selectedPackage || !selectedPayment || !userId) {
       toast({ title: "Incomplete", description: "Complete all steps to proceed.", variant: "destructive" });
       return;
    }

    const pkg = [...(game?.packages || []), ...(game?.specialPackages || [])].find(p => p.id === selectedPackage);
    const payment = paymentMethods.find(p => p.id === selectedPayment);
    if (!pkg || !payment) return;

    setIsSubmitting(true);
    addToCart({
      id: `${game!.id}-${pkg.id}-${Date.now()}`,
      gameId: game!.id,
      packageId: pkg.id,
      playerId: userId,
      serverId: serverId || undefined,
      playerName: verifiedUser?.username || userId,
      gameName: game!.name,
      gameIcon: game!.image,
      packageName: pkg.name,
      amount: pkg.amount,
      price: pkg.price,
      paymentMethodId: payment.id,
      paymentMethodName: payment.name,
      g2bulkProductId: pkg.g2bulkProductId,
      g2bulkTypeId: pkg.g2bulkTypeId,
      quantity: pkg.quantity || 1
    });

    setTimeout(() => {
      navigate('/checkout');
      setIsSubmitting(false);
    }, 500);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-amber-500" /></div>;
  if (!game) return <div className="min-h-screen flex items-center justify-center bg-white text-slate-900">Game not found</div>;

  const pkgObj = [...(game.packages || []), ...(game.specialPackages || [])].find(p => p.id === selectedPackage);

  return (
    <>
      <Helmet>
        <title>{`Topup ${game.name} - ${settings.siteName}`}</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <ModernHeader />
        
        {/* Simplified Header for Light Theme */}
        <div className="relative pt-32 pb-12 bg-white border-b border-slate-100">
           <div className="container mx-auto px-4">
              <Link to="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-600 transition-colors mb-6 text-[10px] font-black uppercase tracking-widest group">
                 <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                 Back to Store
              </Link>
              <div className="flex flex-col md:flex-row items-center gap-8">
                 <div className="w-32 h-32 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white">
                    <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="text-center md:text-left">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4">{game.name}</h1>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                       <Badge className="bg-amber-500 text-white border-none rounded-full px-4 font-black text-[10px] uppercase tracking-widest">Instant Load</Badge>
                       <Badge variant="outline" className="text-slate-400 border-slate-200 rounded-full px-4 font-black text-[10px] uppercase tracking-widest">Verified Merchant</Badge>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <main className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className="lg:col-span-8 space-y-12">
              
              {/* Step 1 */}
              <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">01. Account Details</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Player ID</label>
                    <div className="relative">
                       <Input 
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter ID" 
                        className="bg-slate-50 border-slate-100 h-14 pl-6 rounded-2xl focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold text-lg"
                      />
                      {verifiedUser && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">
                           <CheckCircle className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(gameVerificationConfig?.requires_zone || game?.name?.toLowerCase().includes('heartopia')) && (
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Server / Zone</label>
                      {game?.name?.toLowerCase().includes('heartopia') ? (
                        <Select onValueChange={setServerId} value={serverId}>
                          <SelectTrigger className="bg-slate-50 border-slate-100 h-14 px-6 rounded-2xl focus:ring-amber-500/20 transition-all font-bold text-lg text-slate-900">
                            <SelectValue placeholder="Select Server" />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-slate-100 rounded-2xl shadow-xl">
                            {heartopiaServers.map(s => (
                              <SelectItem key={s.value} value={s.value} className="font-bold py-3">{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input 
                          value={serverId}
                          onChange={(e) => setServerId(e.target.value)}
                          placeholder="Zone Code" 
                          className="bg-slate-50 border-slate-100 h-14 px-6 rounded-2xl focus:ring-amber-500/20 transition-all font-bold text-lg"
                        />
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button 
                    onClick={handleVerify} 
                    disabled={isVerifying || !userId}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-xl transition-all"
                  >
                    {isVerifying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                    Verify Identity
                  </Button>
                  
                  {verifiedUser && (
                    <div className="flex items-center gap-3 bg-green-50 px-5 py-3 rounded-2xl border border-green-100">
                       <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">Active:</div>
                       <div className="font-black text-slate-900">{verifiedUser.username}</div>
                    </div>
                  )}
                </div>
              </section>

              {/* Step 2 */}
              <section className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">02. Choose Load</h3>
                </div>

                {game.specialPackages && game.specialPackages.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-3">
                       Elite Offers <div className="h-px flex-1 bg-amber-100" />
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {game.specialPackages.map((pkg) => (
                        <ModernPackageCard 
                          key={pkg.id} 
                          pkg={pkg} 
                          isSelected={selectedPackage === pkg.id}
                          onSelect={setSelectedPackage}
                          gameIcon={game.image}
                          isSpecial={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                     Standard <div className="h-px flex-1 bg-slate-100" />
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {game.packages.map((pkg) => (
                      <ModernPackageCard 
                        key={pkg.id} 
                        pkg={pkg} 
                        isSelected={selectedPackage === pkg.id}
                        onSelect={setSelectedPackage}
                        gameIcon={game.image}
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Step 3 */}
              <section className="space-y-8">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-slate-900">03. Gateway</h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {paymentMethods.map((method) => (
                    <ModernPaymentCard 
                      key={method.id} 
                      method={method} 
                      isSelected={selectedPayment === method.id}
                      onSelect={setSelectedPayment}
                    />
                  ))}
                </div>
              </section>

            </div>

            <div className="lg:col-span-4">
              <div className="sticky top-32">
                 <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl">
                    <h3 className="text-xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-slate-900">
                       <ShoppingCart className="w-5 h-5 text-amber-500" />
                       Receipt
                    </h3>

                    <div className="space-y-5 mb-10">
                       <div className="flex justify-between items-center py-3 border-b border-slate-50">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Product</span>
                          <span className="font-black text-sm text-slate-900">{game.name}</span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-slate-50">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">ID</span>
                          <span className={cn("font-black text-sm", userId ? "text-slate-900" : "text-slate-200")}>
                             {userId || 'None'}
                          </span>
                       </div>
                       <div className="flex justify-between items-center py-3 border-b border-slate-50">
                          <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Package</span>
                          <span className={cn("font-black text-sm", pkgObj ? "text-amber-600" : "text-slate-200")}>
                             {pkgObj?.name || 'None'}
                          </span>
                       </div>
                    </div>

                    <div className="text-center mb-8">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Payable Total</div>
                       <div className="text-5xl font-black text-slate-900 leading-none">
                          ${Number(pkgObj?.price || 0).toFixed(2)}
                       </div>
                    </div>

                    <Button 
                      onClick={handleCheckout}
                      disabled={!selectedPackage || !selectedPayment || !userId || isSubmitting}
                      className="w-full h-16 bg-amber-500 hover:bg-amber-600 text-white text-lg font-black rounded-2xl shadow-lg shadow-amber-500/20 group transition-all"
                    >
                       {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                          <>CONFIRM LOAD <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" /></>
                       )}
                    </Button>

                    <div className="mt-8 flex items-center justify-center gap-2 text-[9px] text-slate-300 uppercase font-black tracking-widest">
                       <ShieldCheck className="w-4 h-4 text-amber-500/50" />
                       Secured Terminal
                    </div>
                 </div>
              </div>
            </div>

          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default ModernTopupPage;
