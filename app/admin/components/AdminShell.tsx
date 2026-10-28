'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import AdminMobileDock from './AdminMobileDock';
import AdminLoader from './AdminLoader';

const PUBLIC_PATHS = ['/admin/login'];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isPublic) router.replace('/admin/login');
    if (user && isPublic) router.replace('/admin/dashboard');
  }, [user, isLoading, isPublic, router]);

  if (isLoading) return <AdminLoader label="Opening admin workspace" fullScreen />;
  if (isPublic || !user) return <>{children}</>;

  return (
    <div className="admin-root">
      <Sidebar isOpen={isNavOpen} onClose={() => setIsNavOpen(false)} />
      <button
        type="button"
        className={`adm-sidebar-backdrop${isNavOpen ? ' is-open' : ''}`}
        aria-label="Close navigation"
        aria-hidden={!isNavOpen}
        tabIndex={isNavOpen ? 0 : -1}
        onClick={() => setIsNavOpen(false)}
      />
      <div className="adm-main">
        <TopBar onOpenNav={() => setIsNavOpen(true)} />
        <main className="adm-content">{children}</main>
        <AdminMobileDock onOpenNav={() => setIsNavOpen(true)} />
      </div>
    </div>
  );
}
