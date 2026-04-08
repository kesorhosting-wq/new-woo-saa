import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ModernAdminLayout from '@/components/admin/ModernAdminLayout';
import ModernAdminDashboard from './admin/ModernAdminDashboard';
import AdminGames from './admin/AdminGames';
import AdminSync from './admin/AdminSync';
import AdminOrders from './admin/AdminOrders';
import AdminPayments from './admin/AdminPayments';
import AdminVerify from './admin/AdminVerify';
import AdminHome from './admin/AdminHome';
import AdminResellersTab from './admin/AdminResellersTab';
import AdminWallet from './admin/AdminWallet';
import AdminUsers from './admin/AdminUsers';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

const AdminPage: React.FC = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 text-black">
        <div className="relative">
           <div className="w-20 h-20 border-4 border-pink-100 rounded-full animate-pulse" />
           <Loader2 className="w-10 h-10 animate-spin text-[#FF2D85] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <div className="flex flex-col items-center">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#FF2D85] mb-2">Security Protocol</span>
           <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Validating Credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center text-black">
        <div className="w-24 h-24 bg-red-50 rounded-[2rem] flex items-center justify-center mb-8 border border-red-100">
           <ShieldAlert className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Access Restricted</h1>
        <p className="text-slate-500 font-bold uppercase tracking-tight max-w-md mb-10 leading-relaxed">
           Your current clearance level is insufficient to access the System Core. This attempt has been logged.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="h-16 px-12 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl"
        >
           Return to Lobby
        </button>
      </div>
    );
  }

  return (
    <ModernAdminLayout>
      <Routes>
        <Route path="/" element={<ModernAdminDashboard />} />
        <Route path="/home" element={<AdminHome />} />
        <Route path="/games" element={<AdminGames />} />
        <Route path="/sync" element={<AdminSync />} />
        <Route path="/orders" element={<AdminOrders />} />
        <Route path="/payments" element={<AdminPayments />} />
        <Route path="/verification" element={<AdminVerify />} />
        <Route path="/resellers" element={<AdminResellersTab />} />
        <Route path="/wallet" element={<AdminWallet />} />
        <Route path="/users" element={<AdminUsers />} />
        <Route path="/analytics" element={<div className="flex items-center justify-center h-64 text-slate-300 font-black uppercase tracking-[0.3em] bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">Analytics Terminal Offline</div>} />
        <Route path="/settings" element={<div className="flex items-center justify-center h-64 text-slate-300 font-black uppercase tracking-[0.3em] bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">System Parameters Offline</div>} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </ModernAdminLayout>
  );
};

export default AdminPage;
