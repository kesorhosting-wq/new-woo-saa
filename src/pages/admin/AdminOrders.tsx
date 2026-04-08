import React from 'react';
import OrdersTab from '@/components/admin/OrdersTab';

const AdminOrders: React.FC = () => {
  return (
    <div className="space-y-10 text-black">
      <div>
        <h1 className="text-3xl font-black mb-1 uppercase tracking-tighter text-[#3D001F]">Order Transmission Logs</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">Monitor and manage all game load transactions</p>
      </div>

      <div className="bg-white border-2 border-pink-100 rounded-[3rem] p-8 md:p-10 shadow-md">
         <OrdersTab />
      </div>
    </div>
  );
};

export default AdminOrders;
