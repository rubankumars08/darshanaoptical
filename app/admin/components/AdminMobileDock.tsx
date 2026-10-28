'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarCheck, LayoutDashboard, Menu, ShoppingCart, Users } from 'lucide-react';

const ITEMS = [
  { href: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/admin/counter', label: 'Sale', icon: ShoppingCart },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarCheck },
  { href: '/admin/customers', label: 'Customers', icon: Users },
] as const;

export default function AdminMobileDock({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="adm-mobile-dock" aria-label="Daily admin actions">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === '/admin/dashboard' ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={active ? 'is-active' : ''}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
      <button type="button" onClick={onOpenNav} aria-label="Open all admin sections">
        <Menu aria-hidden="true" />
        <span>More</span>
      </button>
    </nav>
  );
}
