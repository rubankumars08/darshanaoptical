'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/lib/admin/auth-context';
import { Menu, Plus, Zap } from 'lucide-react';

const PAGE_TITLES: Record<string, string> = {
  '/admin/counter': 'Express Walk-in Counter',
  '/admin/dashboard': 'Dashboard',
  '/admin/customers': 'Customers',
  '/admin/customers/new': 'New Customer',
  '/admin/eye-tests': 'Eye Tests',
  '/admin/eye-tests/new': 'New Eye Test',
  '/admin/prescriptions': 'Prescription',
  '/admin/orders': 'Orders',
  '/admin/pos': 'POS / Billing',
  '/admin/invoices': 'Invoices',
  '/admin/payments': 'Payments',
  '/admin/products': 'Products',
  '/admin/products/frames': 'Frames',
  '/admin/products/lenses': 'Lenses',
  '/admin/products/sunglasses': 'Sunglasses',
  '/admin/inventory': 'Inventory',
  '/admin/suppliers': 'Suppliers',
  '/admin/purchases': 'Purchases',
  '/admin/expenses': 'Expenses',
  '/admin/reports': 'Reports',
  '/admin/staff': 'Staff Management',
  '/admin/audit': 'Audit Logs',
  '/admin/settings': 'Settings',
};

const PAGE_ACTIONS: Record<string, { label: string; href: string }> = {
  '/admin/customers': { label: 'New Customer', href: '/admin/customers/new' },
  '/admin/eye-tests': { label: 'New Eye Test', href: '/admin/eye-tests/new' },
  '/admin/pos': { label: 'New Sale', href: '/admin/pos' },
};

function getTitle(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  for (const [key, val] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(key + '/')) return val;
  }
  return 'Admin';
}

export default function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const { user } = useAuth();
  const pathname = usePathname();

  const title = getTitle(pathname);
  const action = PAGE_ACTIONS[pathname];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (!user) return null;

  return (
    <header className="adm-topbar">
      <button
        type="button"
        className="adm-mobile-menu"
        onClick={onOpenNav}
        aria-label="Open navigation"
        aria-controls="admin-navigation"
      >
        <Menu width={20} height={20} />
      </button>
      <div className="adm-topbar-title">
        {title}
        <div className="adm-topbar-date">{today}</div>
      </div>

      <div className="adm-topbar-actions">
        {pathname !== '/admin/counter' && (
          <Link
            href="/admin/counter"
            className="adm-btn adm-btn-secondary"
            style={{ height: 36, fontSize: 12.5, fontWeight: 700, borderColor: '#fc5a06', color: '#fc5a06' }}
          >
            <Zap width={14} height={14} /> <span className="adm-action-label">Express Counter</span>
          </Link>
        )}

        {action && (
          <Link href={action.href} className="adm-btn adm-btn-primary" style={{ height: 36, fontSize: 13 }}>
            <Plus width={14} height={14} />
            <span className="adm-action-label">{action.label}</span>
          </Link>
        )}

        <div className="adm-topbar-user" aria-label={`Signed in as ${user.name}, ${user.role}`}>
          <div className="adm-topbar-user-copy">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>
          <div className="adm-topbar-avatar" aria-hidden="true">
            {user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
          </div>
        </div>
      </div>
    </header>
  );
}
