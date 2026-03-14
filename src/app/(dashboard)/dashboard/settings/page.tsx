'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { Shield, Database, Bell, Palette, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function SettingsPage(): React.ReactElement {
  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/me');
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    retry: false,
  });

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" subtitle="Manage your account and application" />

      <div className="max-w-3xl space-y-5">
        {/* Profile */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 ring-1 ring-brand-100">
              <Shield className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Admin Profile</h2>
              <p className="text-xs text-gray-500">Your account details</p>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Skeleton className="h-12" /><Skeleton className="h-12" />
              <Skeleton className="h-12" /><Skeleton className="h-12" />
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoField label="Name" value={user.name} />
              <InfoField label="Email" value={user.email} />
              <InfoField label="Role" value={user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Operations Manager'} />
              <InfoField label="User ID" value={user.id} mono />
            </div>
          ) : (
            <p className="text-sm text-gray-500">Unable to load profile</p>
          )}
        </Card>

        {/* System Info */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 ring-1 ring-sky-100">
              <Database className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">System Information</h2>
              <p className="text-xs text-gray-500">Application configuration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Framework" value="Next.js 14 (App Router)" />
            <InfoField label="Database" value="Supabase PostgreSQL" />
            <InfoField label="Authentication" value="Supabase Auth" />
            <InfoField label="Storage" value="Supabase Storage" />
          </div>
        </Card>

        {/* Modules */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 ring-1 ring-amber-100">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Modules</h2>
              <p className="text-xs text-gray-500">Active system modules</p>
            </div>
          </div>

          <div className="space-y-1">
            {[
              'Venue Management',
              'Court Management',
              'Trainer Management',
              'Academy Management',
              'Partner Onboarding',
              'Image Upload (Supabase Storage)',
            ].map((name) => (
              <div key={name} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{name}</span>
                <Badge variant="success">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Theme */}
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 ring-1 ring-violet-100">
              <Palette className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Appearance</h2>
              <p className="text-xs text-gray-500">Application theme settings</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 ring-2 ring-brand-500/30 ring-offset-2" />
              <span className="text-sm font-medium text-gray-700">Brand Green</span>
            </div>
            <Badge variant="info">Default</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}

function InfoField({ label, value, mono }: Readonly<{ label: string; value: string; mono?: boolean }>): React.ReactElement {
  return (
    <div className="rounded-xl bg-gray-50 px-4 py-3">
      <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</label>
      <p className={`text-sm text-gray-900 ${mono ? 'font-mono text-xs break-all' : ''}`}>{value}</p>
    </div>
  );
}
