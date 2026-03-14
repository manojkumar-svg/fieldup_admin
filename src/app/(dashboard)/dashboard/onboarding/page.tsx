'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Search, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { PARTNER_TYPE_LABELS, ONBOARDING_STATUS_LABELS, ITEMS_PER_PAGE } from '@/lib/utils';
import type { OnboardingApplication } from '@/types/database';

const statusOptions = Object.entries(ONBOARDING_STATUS_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const partnerTypeOptions = Object.entries(PARTNER_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
};

interface OnboardingResponse {
  applications: OnboardingApplication[];
  total: number;
  page: number;
  totalPages: number;
}

export default function OnboardingListPage(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [partnerType, setPartnerType] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = new URLSearchParams();
  if (search) queryParams.set('search', search);
  if (status) queryParams.set('status', status);
  if (partnerType) queryParams.set('partnerType', partnerType);
  queryParams.set('page', String(page));

  const { data, isLoading, error, refetch } = useQuery<OnboardingResponse>({
    queryKey: ['onboarding', search, status, partnerType, page],
    queryFn: async () => {
      const res = await fetch(`/api/onboarding?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch applications');
      return res.json();
    },
  });

  const quickStatusUpdate = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      toast('Status updated', 'success');
    },
    onError: () => {
      toast('Failed to update status', 'error');
    },
  });

  if (error) return <ErrorState onRetry={() => refetch()} />;

  return (
    <div>
      <PageHeader title="Partner Onboarding" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
        <Select
          options={partnerTypeOptions}
          placeholder="All Types"
          value={partnerType}
          onChange={(e) => { setPartnerType(e.target.value); setPage(1); }}
          className="w-40"
        />
        <Select
          options={statusOptions}
          placeholder="All Status"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="w-40"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={5} />
      ) : !data || data.applications.length === 0 ? (
        <EmptyState
          title="No applications found"
          message="No partner onboarding applications match your filters."
          icon={<ClipboardList className="h-12 w-12" />}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Business Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Contact</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">City</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.applications.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/onboarding/${app.id}`)}
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.businessName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {PARTNER_TYPE_LABELS[app.partnerType]}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    <div>{app.contactPerson}</div>
                    <div className="text-xs text-gray-400">{app.email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{app.city}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_BADGE_VARIANT[app.status] ?? 'info'}>
                      {ONBOARDING_STATUS_LABELS[app.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      {app.status === 'PENDING' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            quickStatusUpdate.mutate({ id: app.id, newStatus: 'UNDER_REVIEW' })
                          }
                        >
                          Review
                        </Button>
                      )}
                      {(app.status === 'PENDING' || app.status === 'UNDER_REVIEW') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() =>
                            quickStatusUpdate.mutate({ id: app.id, newStatus: 'APPROVED' })
                          }
                        >
                          Approve
                        </Button>
                      )}
                    </div>
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
      )}
    </div>
  );
}
