import React from 'react';
import { AdminWalletTab } from '@/components/admin/AdminWalletTab';

const AdminWallet: React.FC = () => {
  return (
    <div className="space-y-12 text-black pb-24">
      <div>
        <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase text-[#3D001F]">Wallet Control</h1>
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 bg-[#FF2D85] rounded-full animate-ping" />
           <p className="text-[#FF2D85] text-[10px] font-black uppercase tracking-[0.4em]">Financial Node Management</p>
        </div>
      </div>

      <div className="bg-white border-2 border-pink-100 rounded-[3rem] p-10 shadow-sm">
        <AdminWalletTab />
      </div>
    </div>
  );
};

export default AdminWallet;
