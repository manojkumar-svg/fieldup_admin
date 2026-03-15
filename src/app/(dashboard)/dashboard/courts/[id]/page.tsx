'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  SPORT_TYPE_LABELS,
  SURFACE_TYPE_LABELS,
  formatCurrency,
} from '@/lib/utils';
import {
  MapPin,
  Pencil,
  Dumbbell,
  IndianRupee,
  Users,
  Clock,
  Home,
  Layers,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import type { CourtWithVenue } from '@/types/database';

interface CourtDetail extends CourtWithVenue {
  description?: string | null;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  amenities?: string[];
  openTime?: string;
  closeTime?: string;
  capacity?: number;
}

function InfoRow({ icon: Icon, label, value }: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}): React.ReactElement | null {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <Icon className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function CourtDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error, refetch } = useQuery<{ court: CourtDetail }>({
    queryKey: ['court', id],
    queryFn: async () => {
      const res = await fetch(`/api/courts/${id}`);
      if (!res.ok) throw new Error('Failed to load court');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Court Details" backHref="/dashboard/courts" />
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  const court = data?.court;

  if (error || !court) {
    return (
      <div>
        <PageHeader title="Court Details" backHref="/dashboard/courts" />
        <ErrorState message="Failed to load court" onRetry={() => refetch()} />
      </div>
    );
  }

  const venueName = court.venues?.name ?? 'Unknown Venue';
  const venueCity = court.venues?.city ?? '';

  return (
    <div>
      <PageHeader
        title={court.name}
        subtitle={venueName + (venueCity ? `, ${venueCity}` : '')}
        backHref="/dashboard/courts"
        action={
          <Button onClick={() => router.push(`/dashboard/courts/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Court
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <Badge variant={court.status === 'ACTIVE' ? 'success' : 'error'} size="md">
          {court.status}
        </Badge>
        <Badge variant={court.indoor ? 'info' : 'warning'} size="md">
          {court.indoor ? 'Indoor' : 'Outdoor'}
        </Badge>
        <span className="text-sm text-gray-500">
          Created {new Date(court.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Court Info */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Court Information</h2>
          {court.description && (
            <p className="text-sm text-gray-600 mb-4">{court.description}</p>
          )}
          <InfoRow icon={Dumbbell} label="Sport" value={SPORT_TYPE_LABELS[court.sportType] ?? court.sportType} />
          <InfoRow icon={Layers} label="Surface" value={SURFACE_TYPE_LABELS[court.surfaceType] ?? court.surfaceType} />
          <InfoRow icon={Home} label="Type" value={court.indoor ? 'Indoor' : 'Outdoor'} />
          <InfoRow icon={IndianRupee} label="Price per Hour" value={formatCurrency(court.pricePerHour)} />
          <InfoRow icon={Users} label="Max Players" value={String(court.maxPlayers)} />
          {court.capacity && (
            <InfoRow icon={Users} label="Capacity" value={String(court.capacity)} />
          )}
          {court.openTime && court.closeTime && (
            <InfoRow icon={Clock} label="Operating Hours" value={`${court.openTime} – ${court.closeTime}`} />
          )}
        </Card>

        {/* Location */}
        {court.address && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
            <InfoRow
              icon={MapPin}
              label="Address"
              value={[court.address, court.city, court.state, court.pincode].filter(Boolean).join(', ')}
            />
          </Card>
        )}

        {/* Venue Link */}
        {court.venues && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parent Venue</h2>
            <button
              onClick={() => router.push(`/dashboard/venues/${court.venues!.id}`)}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-all w-full text-left group"
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-brand-100 text-brand-700 shrink-0">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-brand-700">{court.venues.name}</p>
                <p className="text-sm text-gray-500">{court.venues.city}</p>
              </div>
            </button>
          </Card>
        )}

        {/* Amenities */}
        {court.amenities && court.amenities.length > 0 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {court.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-200"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Images */}
        {court.images && court.images.length > 0 && (
          <Card variant="bordered">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Images ({court.images.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {court.images.map((img, i) => (
                <a
                  key={i}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-brand-400 transition-all hover:shadow-lg"
                >
                  <img
                    src={img}
                    alt={`Court image ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </a>
              ))}
            </div>
          </Card>
        )}

        {/* Documents */}
        {court.documents && court.documents.length > 0 && (
          <Card variant="bordered">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Documents ({court.documents.length})</h2>
            </div>
            <div className="space-y-2">
              {court.documents.map((doc, i) => {
                const fileName = doc.split('/').pop() ?? `Document ${i + 1}`;
                const ext = fileName.split('.').pop()?.toUpperCase() ?? 'FILE';
                return (
                  <a
                    key={i}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-all group"
                  >
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand-100 text-brand-700 text-xs font-bold shrink-0">
                      {ext}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-700">{fileName}</p>
                      <p className="text-xs text-gray-500">Click to open</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
