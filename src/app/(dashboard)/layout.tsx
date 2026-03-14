'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  MapPin,
  GraduationCap,
  Users,
  LogOut,
  Trophy,
  ClipboardList,
  Layers,
  Settings,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { href: '/dashboard/onboarding', label: 'Onboarding', icon: ClipboardList, color: 'text-amber-500' },
  { href: '/dashboard/venues', label: 'Venues', icon: MapPin, color: 'text-emerald-500' },
  { href: '/dashboard/courts', label: 'Courts', icon: Layers, color: 'text-violet-500' },
  { href: '/dashboard/academies', label: 'Academies', icon: GraduationCap, color: 'text-cyan-500' },
  { href: '/dashboard/trainers', label: 'Trainers', icon: Users, color: 'text-rose-500' },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, color: 'text-gray-500' },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string): boolean => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Close sidebar on escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setSidebarOpen(false);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const handleSignOut = async (): Promise<void> => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const currentPage = navItems.find((item) => isActive(item.href));

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-gray-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-md shadow-brand-500/20">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Field Up
        </span>
        {/* Close button - mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="ml-auto rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          Navigation
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-500/5'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                active
                  ? 'bg-brand-100'
                  : 'bg-gray-100 group-hover:bg-gray-200'
              )}>
                <Icon className={cn('h-[18px] w-[18px]', active ? 'text-brand-600' : item.color)} />
              </div>
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="h-4 w-4 text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-gray-100 p-3 safe-bottom">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
            <LogOut className="h-[18px] w-[18px]" />
          </div>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-[100dvh] bg-gray-50/80">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] flex-col border-r border-gray-200/80 bg-white/80 backdrop-blur-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col bg-white shadow-2xl animate-slide-in-left">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-3 border-b border-gray-200/80 bg-white/80 backdrop-blur-xl px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
              <Trophy className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">{currentPage?.label ?? 'Dashboard'}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
