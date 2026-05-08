'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  User, 
  Settings,
  Scissors as LogoIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: 'Resumen', href: '/admin' },
  { icon: Calendar, label: 'Agenda', href: '/admin/agenda' },
  { icon: Users, label: 'Barberos', href: '/admin/barbers' },
  { icon: Scissors, label: 'Servicios', href: '/admin/services' },
  { icon: User, label: 'Clientes', href: '/admin/clients' },
  { icon: Settings, label: 'Configuración', href: '/admin/settings' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-black border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
          <LogoIcon className="text-black w-6 h-6" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">Vaon</span>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                isActive 
                  ? "bg-white text-black" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "text-gray-400 group-hover:text-white")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
        >
          Ver Sitio Público
        </Link>
      </div>
    </aside>
  );
}
