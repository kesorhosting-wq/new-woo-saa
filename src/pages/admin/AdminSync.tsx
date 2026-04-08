import React from 'react';
import G2BulkBalanceDisplay from '@/components/admin/G2BulkBalanceDisplay';
import G2BulkSyncWidget from '@/components/admin/G2BulkSyncWidget';
import G2BulkAutoImport from '@/components/admin/G2BulkAutoImport';
import G2BulkBulkLinker from '@/components/admin/G2BulkBulkLinker';
import G2BulkFullImport from '@/components/admin/G2BulkFullImport';
import G2BulkDebugLogs from '@/components/admin/G2BulkDebugLogs';

const AdminSync: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl font-black mb-3 tracking-tighter uppercase text-[#3D001F]">Bridge Terminal</h1>
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#FF2D85] rounded-full animate-ping" />
             <p className="text-[#FF2D85] text-[10px] font-black uppercase tracking-[0.4em]">Active G2Bulk Data Link</p>
          </div>
        </div>
        <div className="bg-white p-2 rounded-2xl border border-pink-100 shadow-sm">
           <G2BulkBalanceDisplay />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
         <div className="bg-white border border-pink-100 rounded-[3rem] p-8 md:p-12 shadow-sm space-y-16">
            
            {/* Synchronization Engine */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-[#FF2D85] rounded-full" />
                  <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F]">Synchronization Engine</h3>
               </div>
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <G2BulkSyncWidget />
               </div>
            </section>

            {/* Nodes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
               <section className="space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#3D001F] flex items-center gap-3">
                     <span className="text-[#FF2D85]">01.</span> Auto Import Node
                  </h3>
                  <div className="bg-white p-6 rounded-3xl border border-pink-50 shadow-sm">
                     <G2BulkAutoImport />
                  </div>
               </section>
               <section className="space-y-6">
                  <h3 className="text-lg font-black uppercase tracking-tight text-[#3D001F] flex items-center gap-3">
                     <span className="text-[#FF2D85]">02.</span> Bulk Linker Protocol
                  </h3>
                  <div className="bg-white p-6 rounded-3xl border border-pink-50 shadow-sm">
                     <G2BulkBulkLinker />
                  </div>
               </section>
            </div>

            {/* Catalog Import */}
            <section className="space-y-6 pt-8 border-t border-slate-50">
               <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F] flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-[#FF2D85] rounded-full" />
                  Full Catalog Import
               </h3>
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <G2BulkFullImport />
               </div>
            </section>

            {/* Debug Logs */}
            <section className="space-y-6 pt-8 border-t border-slate-100">
               <h3 className="text-xl font-black uppercase tracking-tight text-[#3D001F] flex items-center gap-4">
                  <div className="w-1.5 h-8 bg-[#FF2D85] rounded-full" />
                  System Debug Logs
               </h3>
               <div className="bg-white border border-pink-50 rounded-3xl overflow-hidden shadow-sm">
                  <G2BulkDebugLogs />
               </div>
            </section>
         </div>
      </div>
    </div>
  );
};

export default AdminSync;
