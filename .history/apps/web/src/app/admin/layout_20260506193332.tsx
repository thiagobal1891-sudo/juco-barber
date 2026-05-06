'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useAuthStore } from '@/store/auth.store';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { token } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

