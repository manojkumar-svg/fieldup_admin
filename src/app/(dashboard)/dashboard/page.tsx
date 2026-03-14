'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MapPin, GraduationCap, Users, Plus, ClipboardList, Layers, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import type { DashboardStats } from '@/types';

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

const STAT_COLORS = [
  { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-100' },
  { bg: 'bg-brand-50', icon: 'text-brand-600', ring: 'ring-brand-100' },
  { bg: 'bg-sky-50', icon: 'text-sky-600', ring: 'ring-sky-100' },
  { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-100' },
] as const;

export default function DashboardPage(): React.ReactElement {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
  });

  if (error) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="animate-fade-in">
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening across your venues</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 mb-8">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : null}
        {data && (
          <>
            <StatCard
              title="Onboarding"
              total={data.onboarding.total}
              active={data.onboarding.pending}
              activeLabel="pending"
              icon={<ClipboardList className="h-5 w-5" />}
              href="/dashboard/onboarding"
              color={STAT_COLORS[0]}
            />
            <StatCard
              title="Venues"
              total={data.totalVenues}
              active={data.activeVenues}
              icon={<MapPin className="h-5 w-5" />}
              href="/dashboard/venues"
              color={STAT_COLORS[1]}
            />
            <StatCard
              title="Academies"
              total={data.totalAcademies}
              active={data.activeAcademies}
              icon={<GraduationCap className="h-5 w-5" />}
              href="/dashboard/academies"
              color={STAT_COLORS[2]}
            />
            <StatCard
              title="Courts"
              total={data.totalCourts}
              active={data.activeCourts}
              icon={<Layers className="h-5 w-5" />}
              href="/dashboard/courts"
              color={STAT_COLORS[3]}
            />
            <StatCard
              title="Trainers"
              total={data.totalTrainers}
              active={data.activeTrainers}
              icon={<Users className="h-5 w-5" />}
              href="/dashboard/trainers"
              color={STAT_COLORS[4]}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recently Added */}
        {data && data.recentlyAdded.length > 0 && (
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-gray-50 p-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Recently Added</h2>
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto -mx-5 sm:-mx-6">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-5 sm:px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentlyAdded.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                      <td className="px-5 sm:px-6 py-3.5 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-5 sm:px-6 py-3.5">
                        <Badge variant="info" size="sm">{item.type}</Badge>
                      </td>
                      <td className="px-5 sm:px-6 py-3.5 text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 sm:px-6 py-3.5">
                        <StatusBadge status={item.status as 'ACTIVE' | 'INACTIVE'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {data.recentlyAdded.map((item) => (
                <div key={item.id} className="rounded-xl bg-gray-50 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    <StatusBadge status={item.status as 'ACTIVE' | 'INACTIVE'} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <Badge variant="info" size="sm">{item.type}</Badge>
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <div className="rounded-xl bg-brand-50 p-2">
              <Plus className="h-4 w-4 text-brand-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="space-y-2">
            <QuickActionLink href="/dashboard/venues/new" icon={<MapPin className="h-4 w-4" />} label="Add New Venue" />
            <QuickActionLink href="/dashboard/academies/new" icon={<GraduationCap className="h-4 w-4" />} label="Add New Academy" />
            <QuickActionLink href="/dashboard/courts/new" icon={<Layers className="h-4 w-4" />} label="Add New Court" />
            <QuickActionLink href="/dashboard/trainers/new" icon={<Users className="h-4 w-4" />} label="Add New Trainer" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickActionLink({ href, icon, label }: Readonly<{ href: string; icon: React.ReactNode; label: string }>): React.ReactElement {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
    >
      <span className="rounded-lg bg-gray-100 p-2 text-gray-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-brand-500 transition-colors" />
    </Link>
  );
}

function StatCard({
  title,
  total,
  active,
  activeLabel = 'active',
  icon,
  href,
  color,
}: Readonly<{
  title: string;
  total: number;
  active: number;
  activeLabel?: string;
  icon: React.ReactNode;
  href: string;
  color: { bg: string; icon: string; ring: string };
}>): React.ReactElement {
  return (
    <Link href={href} className="group">
      <Card className="hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer h-full">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
          <div className={`rounded-xl ${color.bg} p-2 ring-1 ${color.ring}`}>
            <span className={color.icon}>{icon}</span>
          </div>
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">{total}</p>
        <p className="text-xs text-gray-500 mt-1.5">
          <span className="font-medium text-gray-700">{active}</span> {activeLabel}
        </p>
      </Card>
    </Link>
  );
}
