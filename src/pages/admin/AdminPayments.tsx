import React from 'react';
import ApiSettingsTab from '@/components/admin/ApiSettingsTab';
import KesorSettingsTab from '@/components/admin/KesorSettingsTab';

const AdminPayments: React.FC = () => {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-black mb-1 uppercase tracking-tighter text-[#3D001F]">Gateway Terminal</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Configure financial nodes and API endpoints</p>
      </div>

      <div className="grid grid-cols-1 gap-12">
         <div className="bg-white border border-pink-100 rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F] mb-8">Node API Configuration</h3>
            <ApiSettingsTab />
         </div>

         <div className="bg-white border border-pink-100 rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F] mb-8">Merchant Parameters</h3>
            <KesorSettingsTab />
         </div>
      </div>
    </div>
  );
};

export default AdminPayments;
