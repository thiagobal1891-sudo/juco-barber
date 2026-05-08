'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { 
  Scissors, 
  LogOut, 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Settings, 
  Menu, 
  X,
  UserCircle
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { token, logout, user } = useAuthStore();
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
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Agenda', href: '/admin/agenda', icon: Calendar },
    { label: 'Barberos', href: '/admin/barbers', icon: UserCircle },
    { label: 'Servicios', href: '/admin/services', icon: Scissors },
    { label: 'Clientes', href: '/admin/clients', icon: Users },
    { label: 'Ajustes', href: '/admin/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-6 bg-[#080808] border-b border-white/5 sticky top-0 z-[60]">
        <div className="flex items-center gap-3">
          <Scissors className="w-6 h-6 text-amber-500" />
          <span className="text-lg font-black uppercase tracking-tighter">Vaon Studio</span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-3 bg-white/5 rounded-2xl text-white"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

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
          <div className="hidden lg:flex items-center gap-3 mb-16 px-2">
            <Scissors className="w-8 h-8 text-amber-500" />
            <span className="text-xl font-black uppercase tracking-tighter">Vaon Studio</span>
          </div>

          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group",
                    isActive 
                      ? "bg-amber-500 text-black shadow-lg shadow-amber-500/10" 
                      : "text-white/40 hover:text-white hover:bg-white/5"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-bold uppercase tracking-widest">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-4">
            {user && (
              <div className="px-4 py-4 bg-white/5 rounded-2xl flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 font-black">
                  {user.email?.[0].toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Administrador</p>
                  <p className="text-xs font-bold text-white truncate">{user.email}</p>
                </div>
              </div>
            )}
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-white/20 hover:text-red-500 hover:bg-red-500/5 transition-all group"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">Salir</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
