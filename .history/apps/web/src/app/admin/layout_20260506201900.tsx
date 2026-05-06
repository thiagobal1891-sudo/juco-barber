'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAuthStore } from '@/store/auth.store';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from 'classnames';
import { Scissors, LogOut } from '@/components/icons';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !token && !isLoginPage) {
      router.push('/admin/login');
    }
  }, [isMounted, token, isLoginPage, router]);

  if (!isMounted) return null;

  if (isLoginPage) {
    return <div className="min-h-screen bg-black">{children}</div>;
  }

  if (!token) return null;

  const menuItems = [
    // Add your menu items here
  ];

  const logout = () => {
    // Add your logout logic here
  };

  return (
    <div className="min-h-screen bg-[#050505] flex">
      {/* Sidebar Mobile Toggle Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-[#080808] border-r border-white/5 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-auto lg:z-auto",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-8">
          <div className="flex items-center gap-3 mb-16 px-2">
            <Scissors className="w-8 h-8 text-amber-500" />
            <span className="text-xl font-black uppercase tracking-tighter">Vaon Studio</span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                  pathname === item.href 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10" 
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            ))}
          </nav>

          <button 
            onClick={logout}
            className="mt-auto flex items-center gap-4 px-4 py-4 rounded-2xl text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all group"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Salir</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
