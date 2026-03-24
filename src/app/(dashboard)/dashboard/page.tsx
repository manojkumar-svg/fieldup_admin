'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { MapPin, GraduationCap, Users, Plus, ClipboardList, TrendingUp, ArrowUpRight, User, Dumbbell, AlertTriangle, Activity, Map, Copy, Flower2, Music } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import MapView from '@/components/MapView';
import type { DashboardStats } from '@/types';
import type { AuditLogEntry } from '@/lib/services/audit';

async function fetchStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

async function fetchRecentActivity(): Promise<AuditLogEntry[]> {
  const res = await fetch('/api/audit?limit=10');
  if (!res.ok) return [];
  const data = await res.json();
  return data.logs ?? [];
}

interface DuplicateGroup {
  name: string;
  city: string;
  entityType: string;
  ids: string[];
  count: number;
}

async function fetchDuplicates(): Promise<DuplicateGroup[]> {
  const res = await fetch('/api/dashboard/duplicates');
  if (!res.ok) return [];
  const data = await res.json();
  return data.duplicates ?? [];
}

const STAT_COLORS = [
  { bg: 'bg-violet-50', icon: 'text-violet-600', ring: 'ring-violet-100' },
  { bg: 'bg-brand-50', icon: 'text-brand-600', ring: 'ring-brand-100' },
  { bg: 'bg-sky-50', icon: 'text-sky-600', ring: 'ring-sky-100' },
  { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
  { bg: 'bg-rose-50', icon: 'text-rose-600', ring: 'ring-rose-100' },
  { bg: 'bg-orange-50', icon: 'text-orange-600', ring: 'ring-orange-100' },
  { bg: 'bg-purple-50', icon: 'text-purple-600', ring: 'ring-purple-100' },
  { bg: 'bg-pink-50', icon: 'text-pink-600', ring: 'ring-pink-100' },
] as const;

export default function DashboardPage(): React.ReactElement {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchStats,
  });

  const { data: activityLogs } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: fetchRecentActivity,
  });

  const { data: duplicates } = useQuery({
    queryKey: ['duplicates'],
    queryFn: fetchDuplicates,
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
              title="Trainers"
              total={data.totalTrainers}
              active={data.activeTrainers}
              icon={<Users className="h-5 w-5" />}
              href="/dashboard/trainers"
              color={STAT_COLORS[4]}
            />
            <StatCard
              title="Gyms"
              total={data.totalGyms}
              active={data.activeGyms}
              icon={<Dumbbell className="h-5 w-5" />}
              href="/dashboard/gyms"
              color={STAT_COLORS[5]}
            />
            <StatCard
              title="Yoga Studios"
              total={data.totalYogaStudios}
              active={data.activeYogaStudios}
              icon={<Flower2 className="h-5 w-5" />}
              href="/dashboard/yoga-studios"
              color={STAT_COLORS[6]}
            />
            <StatCard
              title="Zumba Studios"
              total={data.totalZumbaStudios}
              active={data.activeZumbaStudios}
              icon={<Music className="h-5 w-5" />}
              href="/dashboard/zumba-studios"
              color={STAT_COLORS[7]}
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
                      <td className="px-5 sm:px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          {item.photo ? (
                            <img
                              src={item.photo}
                              alt={item.name}
                              className="h-8 w-8 rounded-full object-cover border border-gray-200 shrink-0"
                            />
                          ) : item.type === 'Trainer' ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 border border-gray-200 shrink-0">
                              <User className="h-4 w-4 text-gray-400" />
                            </div>
                          ) : null}
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                      </td>
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
                    <div className="flex items-center gap-2">
                      {item.photo ? (
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="h-7 w-7 rounded-full object-cover border border-gray-200 shrink-0"
                        />
                      ) : item.type === 'Trainer' ? (
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 border border-gray-200 shrink-0">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                        </div>
                      ) : null}
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
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
            <QuickActionLink href="/dashboard/trainers/new" icon={<Users className="h-4 w-4" />} label="Add New Trainer" />
            <QuickActionLink href="/dashboard/gyms/new" icon={<Dumbbell className="h-4 w-4" />} label="Add New Gym" />
          </div>
        </Card>
      </div>

      {/* Onboarding Queue, Incomplete Profiles & Duplicates */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mt-6">
          {/* Pending Onboarding Queue */}
          {(data.onboarding.pending > 0 || data.onboarding.underReview > 0) && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-xl bg-amber-50 p-2">
                  <ClipboardList className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Onboarding Queue</h2>
              </div>
              <div className="space-y-3">
                {data.onboarding.pending > 0 && (
                  <Link href="/dashboard/onboarding?status=PENDING" className="flex items-center justify-between rounded-xl bg-red-50 p-3.5 hover:bg-red-100 transition-colors group">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">{data.onboarding.pending}</span>
                      <span className="text-sm font-medium text-red-800">Pending Review</span>
                    </div>
                    <span className="text-xs text-red-600 font-medium group-hover:underline">Review now &rarr;</span>
                  </Link>
                )}
                {data.onboarding.underReview > 0 && (
                  <Link href="/dashboard/onboarding?status=UNDER_REVIEW" className="flex items-center justify-between rounded-xl bg-amber-50 p-3.5 hover:bg-amber-100 transition-colors group">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">{data.onboarding.underReview}</span>
                      <span className="text-sm font-medium text-amber-800">Under Review</span>
                    </div>
                    <span className="text-xs text-amber-600 font-medium group-hover:underline">Continue &rarr;</span>
                  </Link>
                )}
                <div className="flex items-center gap-4 pt-2 text-xs text-gray-500">
                  <span><span className="font-medium text-green-600">{data.onboarding.approved}</span> approved</span>
                  <span><span className="font-medium text-red-500">{data.onboarding.rejected}</span> rejected</span>
                  <span><span className="font-medium text-gray-700">{data.onboarding.total}</span> total</span>
                </div>
              </div>
            </Card>
          )}

          {/* Incomplete Profiles */}
          {data.incompleteProfiles && data.incompleteProfiles.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-xl bg-amber-50 p-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Incomplete Profiles</h2>
                <Badge variant="warning" size="sm">{data.incompleteProfiles.length}</Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {data.incompleteProfiles.map((profile) => {
                  const editHref =
                    profile.type === 'Venue' ? `/dashboard/venues/${profile.id}/edit` :
                    profile.type === 'Academy' ? `/dashboard/academies/${profile.id}/edit` :
                    profile.type === 'Trainer' ? `/dashboard/trainers/${profile.id}/edit` :
                    `/dashboard/gyms/${profile.id}/edit`;
                  return (
                    <Link
                      key={profile.id}
                      href={editHref}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5 hover:bg-gray-100 transition-colors group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 truncate">{profile.name}</span>
                          <Badge variant="info" size="sm">{profile.type}</Badge>
                        </div>
                        <p className="text-xs text-amber-600 mt-0.5">
                          Missing: {profile.missingFields.join(', ')}
                        </p>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-300 group-hover:text-brand-500 transition-colors shrink-0 ml-2" />
                    </Link>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Potential Duplicates */}
          {duplicates && duplicates.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-xl bg-red-50 p-2">
                  <Copy className="h-4 w-4 text-red-600" />
                </div>
                <h2 className="text-base font-semibold text-gray-900">Potential Duplicates</h2>
                <Badge variant="warning" size="sm">{duplicates.length}</Badge>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {duplicates.map((dup) => (
                  <div key={`${dup.entityType}-${dup.name}-${dup.city}`} className="rounded-xl bg-red-50/50 px-3.5 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">{dup.name}</span>
                      <Badge variant="info" size="sm">{dup.entityType}</Badge>
                      <span className="text-xs text-red-600 font-medium">{dup.count} entries</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">City: {dup.city || 'Not set'}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Recent Activity Feed */}
      {activityLogs && activityLogs.length > 0 && (
        <div className="mt-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl bg-indigo-50 p-2">
                <Activity className="h-4 w-4 text-indigo-600" />
              </div>
              <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3 rounded-xl bg-gray-50 px-3.5 py-2.5">
                  <div className={`mt-0.5 shrink-0 rounded-full p-1.5 ${
                    log.action === 'CREATE' ? 'bg-green-100 text-green-600' :
                    log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                    log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    <Activity className="h-3 w-3" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{log.userEmail ?? 'System'}</span>
                      {' '}
                      <span className="text-gray-500">
                        {log.action === 'CREATE' ? 'created' :
                         log.action === 'UPDATE' ? 'updated' :
                         log.action === 'DELETE' ? 'deleted' :
                         'changed status of'}
                      </span>
                      {' '}
                      <span className="font-medium lowercase">{log.entityType}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Map View */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="rounded-xl bg-emerald-50 p-2">
              <Map className="h-4 w-4 text-emerald-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-900">Entity Map</h2>
          </div>
          <MapView />
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
