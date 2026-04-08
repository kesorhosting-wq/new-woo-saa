import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  CheckCircle,
  Loader2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Timer,
  ArrowLeft,
  Info,
  ExternalLink,
  Download,
  Zap,
  Clock
} from "lucide-react";
import ModernHeader from "@/components/ModernHeader";
import ModernFooter from "@/components/ModernFooter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSite } from "@/contexts/SiteContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

const ModernCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSite();
  const { items, clearCart } = useCart();

  const [generatingQR, setGeneratingQR] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [timeLeft, setTimeLeft] = useState(600); 
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (items.length === 0 && paymentStatus !== 'success') {
       navigate('/');
       return;
    }
    if (!generatedQR && items.length > 0 && !generatingQR) {
       generatePayment();
    }
  }, [items, generatedQR]);

  useEffect(() => {
    if (timeLeft > 0 && paymentStatus === 'pending' && generatedQR) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, paymentStatus, generatedQR]);

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const generatePayment = async () => {
    if (generatingQR) return;
    setGeneratingQR(true);
    try {
      const item = items[0];
      
      // 1. Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke('process-topup', {
        body: {
          game_name: item.gameName,
          package_name: item.packageName,
          player_id: item.playerId,
          server_id: item.serverId || null,
          player_name: item.playerName,
          amount: item.price * item.quantity,
          currency: 'USD',
          payment_method: 'Woo Saa KHQR',
          g2bulk_product_id: item.g2bulkProductId || null,
          quantity: item.quantity || 1
        },
      });

      if (orderError || !orderData?.order_id) throw new Error(orderError?.message || 'Order creation failed');
      const newOrderId = orderData.order_id;
      setOrderId(newOrderId);

      // 2. Generate KHQR
      const { data, error } = await supabase.functions.invoke("ikhode-payment", {
        body: {
          action: 'generate-khqr',
          amount: item.price * item.quantity,
          orderId: newOrderId,
          playerName: item.playerName,
          gameName: item.gameName,
          email: item.email || "customer@kesor.com"
        },
      });

      if (error || !data.qrCodeData) {
        toast({ title: "Error", description: data?.error || "Failed to generate payment", variant: "destructive" });
      } else {
        setGeneratedQR(data.qrCodeData);
        setupWebSocket(data.wsUrl, newOrderId);
      }
    } catch (err: any) {
      console.error("Payment Generation Error:", err);
      toast({ title: "Error", description: err.message || "Failed to initiate transaction", variant: "destructive" });
    } finally {
      setGeneratingQR(false);
    }
  };

  const setupWebSocket = (url: string, id: string) => {
    if (!url) return;
    
    // Close existing connection if any
    if (wsRef.current) wsRef.current.close();

    const ws = new WebSocket(url);
    wsRef.current = ws;
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WS] Message received:", data);
        
        if (data.type === 'payment_success') {
          setPaymentStatus('success');
          clearCart();
          toast({ title: "Payment Successful", description: "Load protocol initiated! Redirecting..." });
          
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        }
      } catch (e) {
        console.error("[WS] Parse error", e);
      }
    };

    ws.onopen = () => console.log("[WS] Connected to Payment Stream");
    ws.onerror = (err) => console.error("[WS] Connection Error", err);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      <Helmet>
        <title>{`Secure Checkout - ${settings.siteName}`}</title>
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-white text-slate-900">
        <ModernHeader />
        
        <main className="flex-1 container mx-auto px-4 py-32">
          <div className="max-w-5xl mx-auto">
            
            <AnimatePresence mode="wait">
              {paymentStatus === 'success' ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border-2 border-green-100 rounded-[3rem] p-16 text-center shadow-2xl shadow-green-100/50"
                >
                   <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-200">
                      <CheckCircle className="w-12 h-12 text-white" />
                   </div>
                   <h2 className="text-5xl font-black mb-6 tracking-tighter uppercase">Payment Confirmed</h2>
                   <p className="text-slate-500 font-bold uppercase tracking-tight mb-12 max-w-md mx-auto">
                      Transaction verified. Your load is being injected into your game account.
                   </p>
                   <Button onClick={() => navigate('/')} className="bg-slate-900 text-white font-black uppercase text-xs tracking-widest px-12 h-16 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
                      Return to Lobby
                   </Button>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                   <motion.div 
                     initial={{ opacity: 0, x: -30 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="lg:col-span-7 bg-white border-2 border-pink-100 rounded-[3rem] p-12 flex flex-col items-center text-center shadow-xl relative overflow-hidden"
                   >
                      <div className="absolute top-0 left-0 w-full h-2 bg-[#FF2D85]" />
                      
                      <div className="mb-10">
                         <Badge className="bg-pink-50 text-[#FF2D85] border-pink-100 font-black text-[10px] uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
                            Bakong KHQR Protocol
                         </Badge>
                         <h3 className="text-3xl font-black uppercase tracking-tight text-black">Scan & Pay</h3>
                      </div>

                      <div className="relative p-8 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100 mb-10 group transition-all hover:bg-white hover:border-pink-500 shadow-inner">
                         {generatingQR ? (
                            <div className="w-64 h-64 flex flex-col items-center justify-center gap-4">
                               <Loader2 className="w-10 h-10 animate-spin text-[#FF2D85]" />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generating Node...</span>
                            </div>
                         ) : (
                            <div className="relative">
                               <img src={generatedQR || ''} alt="KHQR" className="w-64 h-64 mix-blend-multiply" />
                               <div className="absolute inset-0 border-4 border-dashed border-pink-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                            </div>
                         )}
                      </div>

                      <div className="flex items-center gap-6 text-sm font-black mb-10">
                         <div className="flex items-center gap-3 bg-pink-50 px-6 py-3 rounded-2xl border border-pink-100">
                            <Clock className="w-5 h-5 text-[#FF2D85]" />
                            <span className="text-slate-400 uppercase text-xs">Expires:</span>
                            <span className="text-[#FF2D85] font-mono text-lg">{formatTime(timeLeft)}</span>
                         </div>
                      </div>

                      <div className="w-full grid grid-cols-2 gap-4">
                         <Button variant="outline" className="h-14 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest gap-2">
                            <Download className="w-4 h-4" /> Save Node
                         </Button>
                         <Button variant="outline" className="h-14 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest gap-2">
                            <ExternalLink className="w-4 h-4" /> Open App
                         </Button>
                      </div>
                   </motion.div>

                   <motion.div 
                     initial={{ opacity: 0, x: 30 }}
                     animate={{ opacity: 1, x: 0 }}
                     className="lg:col-span-5 space-y-10"
                   >
                      <div className="bg-slate-50 border-2 border-slate-100 rounded-[3rem] p-10 relative overflow-hidden">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10">Transaction Receipt</h4>
                         
                         {items[0] && (
                            <div className="space-y-8">
                               <div className="flex justify-between items-center border-b border-white pb-6">
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Product Node</span>
                                  <span className="font-black text-black uppercase text-sm">{items[0].gameName}</span>
                               </div>
                               <div className="flex justify-between items-center border-b border-white pb-6">
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Load Value</span>
                                  <span className="font-black text-black uppercase text-sm">{items[0].packageName}</span>
                               </div>
                               <div className="flex justify-between items-center border-b border-white pb-6">
                                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Identity ID</span>
                                  <span className="font-black text-[#FF2D85] uppercase text-sm">{items[0].playerId}</span>
                               </div>
                               <div className="flex justify-between items-center pt-4">
                                  <span className="text-xl font-black text-black uppercase">Total</span>
                                  <span className="text-4xl font-black text-[#FF2D85]">${Number(items[0].price * items[0].quantity).toFixed(2)}</span>
                               </div>
                            </div>
                         )}
                      </div>

                      <div className="bg-[#FF2D85] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-pink-200">
                         <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                         <div className="flex items-start gap-5 relative z-10">
                            <ShieldCheck className="w-10 h-10 shrink-0" />
                            <div>
                               <h5 className="font-black uppercase text-xs mb-2 tracking-widest">Instant Injection</h5>
                               <p className="text-[10px] font-bold text-white/70 uppercase leading-relaxed">
                                  Stay on this page. Your load will be delivered immediately upon payment detection.
                               </p>
                            </div>
                         </div>
                      </div>

                      <Button 
                        variant="ghost" 
                        onClick={() => navigate(-1)}
                        className="text-slate-400 hover:text-[#FF2D85] font-black text-[10px] uppercase tracking-widest gap-2"
                      >
                         <ArrowLeft className="w-4 h-4" /> Cancel Transmission
                      </Button>
                   </motion.div>
                </div>
              )}
            </AnimatePresence>

          </div>
        </main>

        <ModernFooter />
      </div>
    </>
  );
};

export default ModernCheckoutPage;
