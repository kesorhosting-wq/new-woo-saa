import React from 'react';
import GameVerificationConfigsTab from '@/components/admin/GameVerificationConfigsTab';

const AdminVerify: React.FC = () => {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black mb-1 uppercase tracking-tighter text-[#3D001F]">Verification Hub</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Configure game ID and server validation logic</p>
      </div>

      <div className="bg-white border border-pink-100 rounded-[3rem] p-10 shadow-sm">
         <GameVerificationConfigsTab />
      </div>
    </div>
  );
};

export default AdminVerify;
