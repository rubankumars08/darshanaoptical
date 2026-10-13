import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './admin.css';
import AdminShell from './components/AdminShell';
import { AuthProvider } from '@/app/lib/admin/auth-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Darshana Optical — Admin',
    template: '%s | Admin',
  },
  description: 'Darshana Optical internal management system',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={inter.variable}
      data-lenis-prevent
      style={{
        fontFamily: 'var(--font-inter), sans-serif',
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        background: '#0f172a',
      }}
    >
      <AuthProvider>
        <AdminShell>{children}</AdminShell>
      </AuthProvider>
    </div>
  );
}
