import React from 'react';
import { useSite } from '@/contexts/SiteContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, MessageCircle, Send, Globe, Mail, Phone, ShieldCheck, Zap, ArrowUp, ChevronRight, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ModernFooter: React.FC = () => {
  const { settings } = useSite();
  const navigate = useNavigate();

  const socialLinks = [
    { icon: <Facebook className="w-5 h-5" />, url: settings.footerFacebookUrl, name: 'Facebook' },
    { icon: <Send className="w-5 h-5" />, url: settings.footerTelegramUrl, name: 'Telegram' },
    { icon: <Zap className="w-5 h-5" />, url: settings.footerTiktokUrl, name: 'TikTok' },
  ];

  const quickLinks = [
    { name: 'Home Lobby', path: '/' },
    { name: 'Order History', path: '/history' },
    { name: 'Wallet Assets', path: '/wallet' },
    { name: 'User Profile', path: '/profile' },
    { name: 'Privacy Policy', path: '/privacy' },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-white pt-24 pb-12 overflow-hidden border-t border-slate-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Engine */}
          <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#FF2D85] rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200">
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo" className="h-7 w-auto object-contain" />
                ) : (
                  <Gamepad2 className="w-7 h-7 text-white" />
                )}
              </div>
              <span className="font-display text-3xl font-black tracking-tighter text-black uppercase">{settings.siteName || 'WOO SAA STORE'}</span>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed font-bold uppercase tracking-tight max-w-sm">
              {settings.footerText || 'The premier gaming ecosystem in Cambodia. Providing institutional-grade top-up infrastructure for the next generation of gamers.'}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.filter(s => s.url).map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-[#FF2D85] hover:text-white hover:border-[#FF2D85] transition-all duration-500 shadow-sm"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Nav */}
          <div className="lg:col-span-2 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF2D85]">Operations</h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-slate-500 hover:text-[#FF2D85] transition-all duration-300 flex items-center gap-2 group text-[11px] font-black uppercase tracking-widest"
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all text-[#FF2D85]" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Node */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF2D85]">Support Node</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                   <Phone className="w-4 h-4 text-[#FF2D85]" />
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Direct Line</div>
                   <span className="text-sm font-black text-black">+855 00 000 000</span>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                   <Mail className="w-4 h-4 text-[#FF2D85]" />
                </div>
                <div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Terminal</div>
                   <span className="text-sm font-black text-black">ops@woosaatopup.com</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Security Protocol */}
          <div className="lg:col-span-3 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FF2D85]">Security Protocol</h4>
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[2.5rem] relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-6 h-6 text-green-600" />
                <span className="font-black text-xs uppercase tracking-widest text-black">KHQR Certified</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tighter mb-6">
                Institutional-grade encryption for all financial movements. Verified by National Bank of Cambodia.
              </p>
              <div className="flex gap-3 flex-wrap">
                {settings.footerPaymentIcons?.slice(0, 3).map((icon, idx) => (
                  <img key={idx} src={icon} alt="Payment" className="h-5 grayscale opacity-50 hover:grayscale-0 transition-all duration-500" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
            © {new Date().getFullYear()} {settings.siteName || 'WOO SAA STORE'}. All Systems Operational.
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="text-slate-400">Powered by</span>
              <span className="text-black">WOO SAA KERNEL</span>
            </div>
            <button 
              onClick={scrollToTop}
              className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-white hover:bg-[#FF2D85] transition-all shadow-xl active:scale-90"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default ModernFooter;
