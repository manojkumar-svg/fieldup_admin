'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import {
  PARTNER_TYPE_LABELS,
  ONBOARDING_STATUS_LABELS,
  SPORT_TYPE_LABELS,
  SURFACE_TYPE_LABELS,
  SLOT_DURATION_LABELS,
  DAY_LABELS,
} from '@/lib/utils';
import type { OnboardingApplication } from '@/types/database';

const STATUS_BADGE_VARIANT: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
  PENDING: 'warning',
  UNDER_REVIEW: 'info',
  APPROVED: 'success',
  REJECTED: 'error',
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }): React.ReactElement | null {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500 sm:w-48 shrink-0">{label}</span>
      <span className="text-sm text-gray-900">{value}</span>
    </div>
  );
}

function TagList({ items }: { items: string[] }): React.ReactElement | null {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function OnboardingDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const id = params.id as string;

  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<{ application: OnboardingApplication }>({
    queryKey: ['onboarding', id],
    queryFn: async () => {
      const res = await fetch(`/api/onboarding/${id}`);
      if (!res.ok) throw new Error('Failed to fetch application');
      return res.json();
    },
  });

  const statusMutation = useMutation({
    mutationFn: async (payload: { status: string; rejectionReason?: string; notes?: string }) => {
      const res = await fetch(`/api/onboarding/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding'] });
      toast('Application updated', 'success');
      setShowRejectDialog(false);
    },
    onError: () => {
      toast('Failed to update application', 'error');
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Application Details" backHref="/dashboard/onboarding" />
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  const app = data.application;
  const canReview = app.status === 'PENDING' || app.status === 'UNDER_REVIEW';

  return (
    <div>
      <PageHeader
        title={app.businessName}
        backHref="/dashboard/onboarding"
        action={
          canReview ? (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowRejectDialog(true)}
              >
                Reject
              </Button>
              <Button
                onClick={() =>
                  statusMutation.mutate({ status: 'APPROVED', notes: adminNotes })
                }
                isLoading={statusMutation.isPending}
              >
                Approve
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <Badge variant={STATUS_BADGE_VARIANT[app.status] ?? 'info'} size="md">
          {ONBOARDING_STATUS_LABELS[app.status]}
        </Badge>
        <span className="text-sm text-gray-500">
          Submitted {new Date(app.createdAt).toLocaleDateString()}
        </span>
        {app.reviewedAt && (
          <span className="text-sm text-gray-500">
            · Reviewed {new Date(app.reviewedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Section 1: Basic Details */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Basic Details</h2>
          <DetailRow label="Partner Type" value={PARTNER_TYPE_LABELS[app.partnerType]} />
          <DetailRow label="Business Name" value={app.businessName} />
          <DetailRow label="Contact Person" value={app.contactPerson} />
          <DetailRow label="Phone" value={app.phone} />
          <DetailRow label="Email" value={app.email} />
          <DetailRow label="City" value={app.city} />
          <DetailRow label="Full Address" value={app.fullAddress} />
          {app.googleMapsLink && (
            <DetailRow
              label="Google Maps"
              value={
                <a
                  href={app.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  View on Maps
                </a>
              }
            />
          )}
        </Card>

        {/* Section 2: Sports & Services */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Sports & Services</h2>
          <DetailRow
            label="Sports Offered"
            value={
              <TagList
                items={app.sportsOffered.map(
                  (s: string) => SPORT_TYPE_LABELS[s] ?? s
                )}
              />
            }
          />
          {app.experienceYears !== null && (
            <DetailRow label="Experience" value={`${app.experienceYears} years`} />
          )}
          {app.certifications.length > 0 && (
            <DetailRow label="Certifications" value={<TagList items={app.certifications} />} />
          )}
          {app.shortBio && <DetailRow label="Bio" value={app.shortBio} />}
        </Card>

        {/* Section 3: Facility / Training */}
        {(app.partnerType === 'VENUE' || app.partnerType === 'ACADEMY') && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Facility Details</h2>
            {app.numberOfCourts !== null && (
              <DetailRow label="Number of Courts" value={String(app.numberOfCourts)} />
            )}
            {app.surfaceType && (
              <DetailRow label="Surface Type" value={SURFACE_TYPE_LABELS[app.surfaceType]} />
            )}
            {app.facilities.length > 0 && (
              <DetailRow label="Facilities" value={<TagList items={app.facilities} />} />
            )}
          </Card>
        )}

        {(app.partnerType === 'COACH' || app.partnerType === 'ACADEMY') && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Training Details</h2>
            {app.sessionTypes.length > 0 && (
              <DetailRow label="Session Types" value={<TagList items={app.sessionTypes} />} />
            )}
            {app.maxStudents !== null && (
              <DetailRow label="Max Students" value={String(app.maxStudents)} />
            )}
          </Card>
        )}

        {/* Section 4: Availability */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Availability</h2>
          <DetailRow
            label="Available Days"
            value={
              <TagList
                items={app.availableDays.map((d: string) => DAY_LABELS[d] ?? d)}
              />
            }
          />
          {app.operatingHours && (
            <DetailRow label="Operating Hours" value={app.operatingHours} />
          )}
          {app.slotDuration && (
            <DetailRow label="Slot Duration" value={SLOT_DURATION_LABELS[app.slotDuration]} />
          )}
        </Card>

        {/* Section 5: Pricing */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h2>
          {app.pricePerSlot !== null && (
            <DetailRow label="Price per Slot" value={`₹${app.pricePerSlot}`} />
          )}
          <DetailRow label="Weekend Pricing Different" value={app.weekendPricingDiff ? 'Yes' : 'No'} />
          <DetailRow label="Cancellation Allowed" value={app.cancellationAllowed ? 'Yes' : 'No'} />
        </Card>

        {/* Section 6: Payment & Legal */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Payment & Legal</h2>
          <DetailRow label="Accepts Cash" value={app.acceptsCash ? 'Yes' : 'No'} />
          {app.bankAccountName && <DetailRow label="Bank Account Name" value={app.bankAccountName} />}
          {app.bankAccountNumber && <DetailRow label="Account Number" value={app.bankAccountNumber} />}
          {app.ifscCode && <DetailRow label="IFSC Code" value={app.ifscCode} />}
          {app.gstNumber && <DetailRow label="GST Number" value={app.gstNumber} />}
          {app.idProofUrls.length > 0 && (
            <DetailRow label="ID Proof" value={<TagList items={app.idProofUrls} />} />
          )}
          {app.profilePhotoUrls.length > 0 && (
            <DetailRow label="Profile Photos" value={<TagList items={app.profilePhotoUrls} />} />
          )}
        </Card>

        {/* Admin Notes */}
        {canReview && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h2>
            <Textarea
              placeholder="Add internal notes about this application..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
          </Card>
        )}

        {/* Rejection reason (if rejected) */}
        {app.status === 'REJECTED' && app.rejectionReason && (
          <Card variant="bordered" className="border-red-200 bg-red-50">
            <h2 className="text-lg font-semibold text-red-800 mb-2">Rejection Reason</h2>
            <p className="text-sm text-red-700">{app.rejectionReason}</p>
          </Card>
        )}

        {app.notes && (
          <Card variant="bordered" className="border-blue-200 bg-blue-50">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Admin Notes</h2>
            <p className="text-sm text-blue-700">{app.notes}</p>
          </Card>
        )}
      </div>

      {/* Reject dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Application</h3>
            <Textarea
              label="Rejection Reason"
              placeholder="Provide a reason for rejection..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowRejectDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                isLoading={statusMutation.isPending}
                onClick={() =>
                  statusMutation.mutate({
                    status: 'REJECTED',
                    rejectionReason,
                    notes: adminNotes,
                  })
                }
              >
                Confirm Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
