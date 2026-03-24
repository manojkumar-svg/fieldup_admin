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
  DAY_LABELS,
  formatCurrency,
} from '@/lib/utils';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  IndianRupee,
  Users,
  Pencil,
  Image as ImageIcon,
  FileText,
  Dumbbell,
  Shield,
  CalendarDays,
} from 'lucide-react';
import type { VenueWithSports } from '@/types/database';

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

function ImageGallery({ images, title }: { images: string[]; title: string }): React.ReactElement | null {
  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <ImageIcon className="h-12 w-12 mb-3" />
        <p className="text-sm">No {title.toLowerCase()} uploaded</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {images.map((img, i) => (
        <a
          key={i}
          href={img}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-brand-400 transition-all hover:shadow-lg"
        >
          <img
            src={img}
            alt={`${title} ${i + 1}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
            <ImageIcon className="h-8 w-8 text-gray-400" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
      ))}
    </div>
  );
}

function DocumentList({ documents }: { documents: string[] }): React.ReactElement | null {
  if (!documents || documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <FileText className="h-12 w-12 mb-3" />
        <p className="text-sm">No documents uploaded</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc, i) => {
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
  );
}

export default function VenueDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error, refetch } = useQuery<{ venue: VenueWithSports }>({
    queryKey: ['venue', id],
    queryFn: async () => {
      const res = await fetch(`/api/venues/${id}`);
      if (!res.ok) throw new Error('Failed to load venue');
      return res.json();
    },
  });

  const venue = data?.venue;

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Venue Details" backHref="/dashboard/venues" />
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div>
        <PageHeader title="Venue Details" backHref="/dashboard/venues" />
        <ErrorState message="Failed to load venue" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={venue.name}
        backHref="/dashboard/venues"
        action={
          <Button onClick={() => router.push(`/dashboard/venues/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Venue
          </Button>
        }
      />

      <div className="space-y-6 max-w-4xl">
        {/* Profile Hero */}
        <Card variant="bordered">
          <div className="flex items-start gap-6">
            {/* Thumbnail */}
            <div className="shrink-0">
              {venue.images && venue.images.length > 0 ? (
                <a
                  href={venue.images[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-28 w-28 rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-brand-400 transition-colors"
                >
                  <img
                    src={venue.images[0]}
                    alt={venue.name}
                    className="h-full w-full object-cover"
                  />
                </a>
              ) : (
                <div className="flex items-center justify-center h-28 w-28 rounded-2xl bg-gray-100 border-2 border-gray-200">
                  <MapPin className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{venue.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {venue.address}, {venue.city}, {venue.state} - {venue.pincode}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant={venue.status === 'ACTIVE' ? 'success' : 'error'} size="md">
                  {venue.status}
                </Badge>
                {venue.venue_sports && venue.venue_sports.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {venue.venue_sports.length} sport{venue.venue_sports.length !== 1 ? 's' : ''}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Created {new Date(venue.createdAt).toLocaleDateString()}
                </span>
              </div>
              {venue.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{venue.description}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Contact Details */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Contact & Location</h2>
          <InfoRow icon={MapPin} label="Address" value={`${venue.address}, ${venue.city}, ${venue.state} - ${venue.pincode}`} />
          {venue.latitude && venue.longitude && (
            <InfoRow icon={MapPin} label="Coordinates" value={`${venue.latitude}, ${venue.longitude}`} />
          )}
          <InfoRow icon={Phone} label="Phone" value={venue.contactPhone} />
          <InfoRow icon={Mail} label="Email" value={venue.contactEmail} />
        </Card>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-200"
                >
                  <Shield className="h-3.5 w-3.5" />
                  {amenity}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Sports */}
        {venue.venue_sports && venue.venue_sports.length > 0 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sports Available ({venue.venue_sports.length})
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {venue.venue_sports.map((sport) => (
                <div
                  key={sport.id}
                  className="rounded-xl border border-gray-200 p-4 hover:border-brand-300 transition-colors bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-5 w-5 text-brand-600" />
                      <h3 className="font-semibold text-gray-900">
                        {SPORT_TYPE_LABELS[sport.sportType] ?? sport.sportType}
                      </h3>
                    </div>
                    <Badge variant="info" size="sm">
                      {sport.numberOfCourts} court{sport.numberOfCourts !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <IndianRupee className="h-4 w-4" />
                      <span>{formatCurrency(sport.pricePerHour)} / hour</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{sport.openTime} – {sport.closeTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CalendarDays className="h-4 w-4" />
                      <div className="flex flex-wrap gap-1">
                        {sport.availableDays.map((d) => (
                          <span key={d} className="px-1.5 py-0.5 rounded bg-gray-200 text-xs font-medium">
                            {DAY_LABELS[d] ?? d}
                          </span>
                        ))}
                      </div>
                    </div>
                    {sport.rules && (
                      <p className="text-gray-500 italic mt-2">Rules: {sport.rules}</p>
                    )}
                    {sport.amenities && sport.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {sport.amenities.map((a) => (
                          <span key={a} className="px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-xs">
                            {a}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Images */}
        <Card variant="bordered">
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Images {venue.images?.length > 0 && `(${venue.images.length})`}
            </h2>
          </div>
          <ImageGallery images={venue.images ?? []} title="Images" />
        </Card>

        {/* Documents */}
        <Card variant="bordered">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">
              Documents {venue.documents?.length > 0 && `(${venue.documents.length})`}
            </h2>
          </div>
          <DocumentList documents={venue.documents ?? []} />
        </Card>
      </div>
    </div>
  );
}
