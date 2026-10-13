'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const PUBLIC_PATHS = ['/admin/login'];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isNavOpen, setIsNavOpen] = useState(false);

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (isLoading) return;
    if (!user && !isPublic) {
      router.replace('/admin/login');
    }
    if (user && isPublic) {
      router.replace('/admin/dashboard');
    }
  }, [user, isLoading, isPublic, router]);

  // Loading state
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          background: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            background: '#fc5a06',
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 18,
          }}
        >
          D
        </div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Loading…</div>
      </div>
    );
  }

  // Login page — full screen, no sidebar
  if (isPublic || !user) {
    return <>{children}</>;
  }

  // Authenticated — show sidebar + content
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
      </div>
    </div>
  );
}
