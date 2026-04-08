import React from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { motion, AnimatePresence } from 'framer-motion';

interface ModernAdminLayoutProps {
  children: React.ReactNode;
}

const ModernAdminLayout: React.FC<ModernAdminLayoutProps> = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-white text-black overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-10 relative">
           <AnimatePresence mode="wait">
             <motion.div
               key={window.location.pathname}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
               {children}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ModernAdminLayout;
