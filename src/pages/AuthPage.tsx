import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Mail, Lock, ArrowRight, Github, Chrome, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast({ title: "Welcome back!", description: "Successfully logged in." });
      } else {
        await signUp(email, password);
        toast({ title: "Account created!", description: "Please check your email to verify." });
      }
      navigate('/');
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden p-4">
      {/* Decorative background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-muted/30 border border-white/5 rounded-[2.5rem] p-10 backdrop-blur-xl shadow-2xl relative"
      >
        <div className="text-center mb-10">
           <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                 <Gamepad2 className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="font-display text-2xl font-bold tracking-tighter">Woo<span className="text-primary">Saa</span></span>
           </Link>
           <h1 className="text-3xl font-black mb-2">{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
           <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">
              {isLogin ? 'Login to your gaming account' : 'Join our gaming community'}
           </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input 
                   type="email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   placeholder="name@example.com" 
                   className="bg-background/50 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary/20" 
                   required
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                 <Input 
                   type="password" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   placeholder="••••••••" 
                   className="bg-background/50 border-white/10 h-14 pl-12 rounded-2xl focus:ring-primary/20" 
                   required
                 />
              </div>
              {isLogin && (
                 <div className="text-right">
                    <button type="button" className="text-[10px] text-primary font-bold uppercase tracking-widest hover:underline">Forgot password?</button>
                 </div>
              )}
           </div>

           <Button 
             disabled={isLoading}
             className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-lg rounded-2xl shadow-xl shadow-primary/30 group"
           >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
           </Button>
        </form>

        <div className="mt-8 relative">
           <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
           </div>
           <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
              <span className="bg-[#111] px-4 text-muted-foreground">Or continue with</span>
           </div>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
           <Button variant="outline" className="h-12 rounded-xl border-white/5 bg-white/5 gap-2">
              <Chrome className="w-4 h-4" /> Google
           </Button>
           <Button variant="outline" className="h-12 rounded-xl border-white/5 bg-white/5 gap-2">
              <Github className="w-4 h-4" /> GitHub
           </Button>
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
           {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
           <button 
             onClick={() => setIsLogin(!isLogin)}
             className="text-primary font-bold hover:underline"
           >
              {isLogin ? 'Sign Up' : 'Sign In'}
           </button>
        </p>

        <div className="mt-10 flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase tracking-widest">
           <ShieldCheck className="w-4 h-4 text-primary" />
           Secured by Supabase Auth
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
