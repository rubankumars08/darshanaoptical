'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/lib/admin/auth-context';
import {
  LayoutDashboard, Users, Eye, ShoppingCart, CreditCard, Package, Boxes, Truck, ShoppingBag, DollarSign, Settings, Users2, ClipboardList, BarChart2, LogOut, ChevronRight, CalendarCheck, ScrollText,
} from 'lucide-react';
import type { Role } from '@/app/lib/admin/types';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Role[];
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const iconSize = { width: 15, height: 15 };

const NAV: NavSection[] = [
  {
    title: 'Daily Counter',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
      { label: 'Billing / POS', href: '/admin/pos', icon: <ShoppingCart {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
      { label: 'Website Bookings', href: '/admin/bookings', icon: <CalendarCheck {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
      { label: 'Customers', href: '/admin/customers', icon: <Users {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
      { label: 'Eye Tests', href: '/admin/eye-tests', icon: <Eye {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
      { label: 'Orders & Fitting', href: '/admin/orders', icon: <ClipboardList {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
      { label: 'Pending Payments', href: '/admin/payments', icon: <CreditCard {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
      { label: 'Products & Stock', href: '/admin/products', icon: <Package {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
      // The stock screen existed but was never linked, so nobody could reach it.
      { label: 'Stock In / Out', href: '/admin/inventory', icon: <Boxes {...iconSize} />, roles: ['admin', 'manager', 'staff'] },
    ],
  },
  {
    title: 'Shop Management',
    items: [
      { label: 'Purchases & Suppliers', href: '/admin/purchases', icon: <ShoppingBag {...iconSize} />, roles: ['admin', 'manager'] },
      { label: 'Suppliers', href: '/admin/suppliers', icon: <Truck {...iconSize} />, roles: ['admin', 'manager'] },
      { label: 'Expenses', href: '/admin/expenses', icon: <DollarSign {...iconSize} />, roles: ['admin', 'manager'] },
      { label: 'Daily Reports', href: '/admin/reports', icon: <BarChart2 {...iconSize} />, roles: ['admin', 'manager'] },
      { label: 'Staff Team', href: '/admin/staff', icon: <Users2 {...iconSize} />, roles: ['admin'] },
      { label: 'Audit Log', href: '/admin/audit', icon: <ScrollText {...iconSize} />, roles: ['admin', 'manager'] },
      { label: 'Shop Settings', href: '/admin/settings', icon: <Settings {...iconSize} />, roles: ['admin'] },
    ],
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <nav id="admin-navigation" className={`adm-sidebar${isOpen ? ' is-open' : ''}`} aria-label="Admin navigation">
      {/* Logo */}
      <Link href="/admin/dashboard" className="adm-sidebar-logo" style={{ textDecoration: 'none' }} onClick={onClose}>
        <div className="adm-sidebar-logo-icon">D</div>
        <div className="adm-sidebar-logo-text">
          <span className="adm-sidebar-logo-name">Darshana Optical</span>
          <span className="adm-sidebar-logo-sub">Admin Panel</span>
        </div>
      </Link>

      {/* Nav */}
      <div className="adm-sidebar-nav">
        {NAV.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(user.role));
          if (!visibleItems.length) return null;
          return (
            <div key={section.title} className="adm-nav-section">
              <div className="adm-nav-section-label">{section.title}</div>
              {visibleItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`adm-nav-item${isActive(item.href) ? ' active' : ''}`}
                  onClick={onClose}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && <span className="adm-nav-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          );
        })}

        {/* Logout */}
        <div className="adm-nav-section" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={logout}
            className="adm-nav-item"
            style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}
          >
            <LogOut {...iconSize} />
            Logout
          </button>
        </div>
      </div>

      {/* User Info */}
      <div className="adm-sidebar-user">
        <div className="adm-sidebar-avatar">{initials}</div>
        <div className="adm-sidebar-user-info">
          <div className="adm-sidebar-user-name">{user.name}</div>
          <div className="adm-sidebar-user-role">{user.role}</div>
        </div>
        <ChevronRight width={14} height={14} style={{ color: 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
      </div>
    </nav>
  );
}
