import React, { useState, useEffect } from 'react';
import { useSite } from '@/contexts/SiteContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Gamepad2, User, Search, Bell, History, Wallet, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ModernHeader: React.FC = () => {
  const { settings } = useSite();
  const { user, signOut, isAdmin } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Games', path: '/#games' },
    ...(user ? [
      { name: 'History', path: '/history' },
      { name: 'Wallet', path: '/wallet' },
    ] : []),
    { name: 'Docs', path: '/api-docs' },
  ];

  const handleNavClick = (path: string) => {
    if (path.startsWith('/#')) {
      const id = path.substring(2);
      if (location.pathname === '/') {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      navigate(path);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200 py-3 shadow-md' 
          : 'bg-white/50 backdrop-blur-md border-b border-white/10 py-6'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#FF2D85] rounded-xl flex items-center justify-center shadow-lg shadow-pink-200 transform group-hover:rotate-12 transition-transform duration-500">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName} className="h-6 w-auto object-contain" />
            ) : (
              <Gamepad2 className="h-6 w-6 text-white" />
            )}
          </div>
          <div className="flex flex-col">
             <span className="font-display text-xl font-black tracking-tight text-black group-hover:text-[#FF2D85] transition-colors leading-none">
               {settings.siteName || 'WOO SAA'}
             </span>
             <span className="text-[8px] font-black uppercase tracking-[0.3em] text-[#FF2D85] mt-1">Marketplace</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => handleNavClick(link.path)}
              className={`text-[11px] font-black uppercase tracking-widest transition-all hover:text-[#FF2D85] relative group ${
                location.pathname === link.path ? 'text-[#FF2D85]' : 'text-slate-500'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1.5 left-0 h-[2px] bg-[#FF2D85] transition-all duration-500 group-hover:w-full ${
                location.pathname === link.path ? 'w-full' : 'w-0'
              }`} />
            </button>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 p-1 pr-4 rounded-xl transition-all group">
                  <div className="w-8 h-8 bg-[#FF2D85] rounded-lg flex items-center justify-center text-white font-black text-xs shadow-md">
                    {user.email?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-black text-black group-hover:text-[#FF2D85] transition-colors">{user.email?.split('@')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 rounded-2xl p-2 shadow-2xl">
                <DropdownMenuLabel className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl py-3 px-4 gap-3 focus:bg-pink-50 focus:text-[#FF2D85] cursor-pointer">
                  <User className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/wallet')} className="rounded-xl py-3 px-4 gap-3 focus:bg-pink-50 focus:text-[#FF2D85] cursor-pointer">
                  <Wallet className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">Wallet</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/history')} className="rounded-xl py-3 px-4 gap-3 focus:bg-pink-50 focus:text-[#FF2D85] cursor-pointer">
                  <History className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">History</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-xl py-3 px-4 gap-3 focus:bg-pink-50 focus:text-[#FF2D85] cursor-pointer">
                    <Gamepad2 className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">Admin</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="rounded-xl py-3 px-4 gap-3 text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="w-4 h-4" /> <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-black hover:bg-slate-800 text-white font-black uppercase text-[10px] tracking-widest px-8 h-11 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              Sign In
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-black p-2 bg-slate-100 rounded-xl border border-slate-200"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-2xl overflow-hidden"
          >
            <div className="container mx-auto px-6 py-10 flex flex-col gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.path)}
                  className="text-2xl font-black uppercase tracking-tighter text-black hover:text-[#FF2D85] transition-colors text-left"
                >
                  {link.name}
                </button>
              ))}
              <div className="h-px bg-slate-100 my-4" />
              {user ? (
                <Button onClick={() => handleNavClick('/profile')} className="w-full h-16 rounded-2xl bg-slate-50 border border-slate-200 text-black justify-start px-6 gap-4 font-black uppercase tracking-widest">
                   <User className="text-[#FF2D85]" /> My Account
                </Button>
              ) : (
                <div className="flex flex-col gap-3">
                  <Button onClick={() => handleNavClick('/auth')} className="w-full h-16 rounded-2xl bg-[#FF2D85] text-white font-black text-lg uppercase tracking-widest">Sign In</Button>
                  <Button variant="outline" className="w-full h-16 rounded-2xl border-slate-200 font-black text-lg uppercase tracking-widest">Register</Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default ModernHeader;
