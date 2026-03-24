'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Search, Dumbbell, Filter, ToggleLeft, Trash2, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatusBadge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TableSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { ITEMS_PER_PAGE, formatCurrency } from '@/lib/utils';
import type { Gym } from '@/types/database';

const statusOptions = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

interface GymsResponse {
  gyms: Gym[];
  total: number;
  page: number;
  totalPages: number;
}

export default function GymsPage(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (status) queryParams.set('status', status);
  queryParams.set('page', String(page));

  const { data, isLoading, error, refetch } = useQuery<GymsResponse>({
    queryKey: ['gyms', search, status, page],
    queryFn: async () => {
      const res = await fetch(`/api/gyms?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch gyms');
      return res.json();
    },
  });

  const toggleStatus = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await fetch(`/api/gyms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      toast('Status updated', 'success');
    },
    onError: () => {
      toast('Failed to update status', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/gyms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete gym');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      toast('Gym deleted', 'success');
      setDeleteId(null);
    },
    onError: () => {
      toast('Failed to delete gym', 'error');
    },
  });

  const bulkStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await fetch('/api/bulk/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityType: 'gyms', ids: Array.from(selectedIds), status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to bulk update');
      return res.json();
    },
    onSuccess: (_, newStatus) => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      toast(`${selectedIds.size} gyms ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}`, 'success');
      setSelectedIds(new Set());
    },
    onError: () => {
      toast('Failed to update gyms', 'error');
    },
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedIds.size === data.gyms.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.gyms.map((g) => g.id)));
    }
  };

  const activeFilters = [status].filter(Boolean).length;

  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Gyms"
        subtitle={data ? `${data.total} total gyms` : undefined}
        action={
          <Link href="/dashboard/gyms/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Gym
            </Button>
          </Link>
        }
      />

      {/* Search & Filters */}
      <div className="space-y-3 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search gyms..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent hover:border-gray-300 placeholder:text-gray-400"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
              showFilters || activeFilters > 0
                ? 'border-brand-200 bg-brand-50 text-brand-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && (
              <span className="rounded-full bg-brand-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            <Select
              options={statusOptions}
              placeholder="All Status"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full sm:w-36"
            />
            {activeFilters > 0 && (
              <Button variant="ghost" size="sm" onClick={() => { setStatus(''); setPage(1); }}>
                Clear all
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <>
          <div className="hidden md:block"><TableSkeleton rows={5} /></div>
          <div className="md:hidden grid gap-3">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        </>
      )}

      {/* Empty */}
      {!isLoading && (!data || data.gyms.length === 0) && (
        <EmptyState
          icon={<Dumbbell className="h-10 w-10" />}
          title="No gyms found"
          message="Get started by adding your first gym."
          actionLabel="Add Gym"
          onAction={() => router.push('/dashboard/gyms/new')}
        />
      )}

      {data && data.gyms.length > 0 && (
        <>
          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3 rounded-xl bg-brand-50 border border-brand-200 px-4 py-2.5 mb-4 animate-fade-in">
              <CheckSquare className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium text-brand-700">{selectedIds.size} selected</span>
              <div className="flex items-center gap-2 ml-auto">
                <Button size="sm" variant="secondary" onClick={() => bulkStatusMutation.mutate('ACTIVE')} disabled={bulkStatusMutation.isPending}>
                  Activate All
                </Button>
                <Button size="sm" variant="secondary" onClick={() => bulkStatusMutation.mutate('INACTIVE')} disabled={bulkStatusMutation.isPending}>
                  Deactivate All
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          )}

          {/* Desktop Table */}
          <div className="hidden md:block rounded-2xl border border-gray-200/80 bg-white overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="px-3 py-3.5 text-left">
                    <input
                      type="checkbox"
                      checked={data.gyms.length > 0 && selectedIds.size === data.gyms.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-2 focus:ring-brand-500"
                      aria-label="Select all"
                    />
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">City</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Monthly Fee</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.gyms.map((gym) => (
                  <tr
                    key={gym.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 cursor-pointer transition-colors"
                    onClick={() => router.push(`/dashboard/gyms/${gym.id}`)}
                  >
                    <td className="px-3 py-3.5" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(gym.id)}
                        onChange={() => toggleSelect(gym.id)}
                        className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-2 focus:ring-brand-500"
                        aria-label={`Select ${gym.name}`}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {gym.images && gym.images.length > 0 ? (
                          <img
                            src={gym.images[0]}
                            alt={gym.name}
                            className="h-9 w-9 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 shrink-0">
                            <Dumbbell className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span className="text-sm font-medium text-gray-900">{gym.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{gym.city}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{gym.contactPhone}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-700">
                      {gym.monthlyFee != null ? `${formatCurrency(gym.monthlyFee)}/mo` : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={gym.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                      <span className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleStatus.mutate({
                              id: gym.id,
                              newStatus: gym.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
                            })
                          }
                        >
                          {gym.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteId(gym.id)}
                        >
                          Delete
                        </Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.totalPages > 1 && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setPage}
              />
            )}
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {data.gyms.map((gym) => (
              <div
                key={gym.id}
                className="rounded-2xl border border-gray-200/80 bg-white p-4 active:bg-gray-50 transition-colors"
                onClick={() => router.push(`/dashboard/gyms/${gym.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {gym.images && gym.images.length > 0 ? (
                      <img
                        src={gym.images[0]}
                        alt={gym.name}
                        className="h-10 w-10 rounded-lg object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 border border-gray-200 shrink-0">
                        <Dumbbell className="h-5 w-5 text-gray-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">{gym.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{gym.city}</p>
                    </div>
                  </div>
                  <StatusBadge status={gym.status} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{gym.contactPhone}</span>
                    {gym.monthlyFee != null && (
                      <span className="font-medium text-gray-700">{formatCurrency(gym.monthlyFee)}/mo</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <button
                      className="rounded-lg p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                      onClick={() => toggleStatus.mutate({ id: gym.id, newStatus: gym.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                      aria-label="Toggle status"
                    >
                      <ToggleLeft className="h-4 w-4" />
                    </button>
                    <button
                      className="rounded-lg p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      onClick={() => setDeleteId(gym.id)}
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {data.totalPages > 1 && (
              <Pagination
                page={data.page}
                totalPages={data.totalPages}
                total={data.total}
                pageSize={ITEMS_PER_PAGE}
                onPageChange={setPage}
              />
            )}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        title="Delete Gym"
        message="Are you sure you want to delete this gym? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
