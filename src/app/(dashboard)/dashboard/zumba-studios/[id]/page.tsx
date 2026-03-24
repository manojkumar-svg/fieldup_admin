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
import { formatCurrency } from '@/lib/utils';
import {
  MapPin,
  Pencil,
  Mail,
  Phone,
  Clock,
  IndianRupee,
  Globe,
  Image as ImageIcon,
  FileText,
  Music,
} from 'lucide-react';
import type { ZumbaStudio } from '@/types/database';

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

export default function ZumbaStudioDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error, refetch } = useQuery<{ zumbaStudio: ZumbaStudio }>({
    queryKey: ['zumba-studio', id],
    queryFn: async () => {
      const res = await fetch(`/api/zumba-studios/${id}`);
      if (!res.ok) throw new Error('Failed to load zumba studio');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Zumba Studio Details" backHref="/dashboard/zumba-studios" />
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  const zumbaStudio = data?.zumbaStudio;

  if (error || !zumbaStudio) {
    return (
      <div>
        <PageHeader title="Zumba Studio Details" backHref="/dashboard/zumba-studios" />
        <ErrorState message="Failed to load zumba studio" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={zumbaStudio.name}
        backHref="/dashboard/zumba-studios"
        action={
          <Button onClick={() => router.push(`/dashboard/zumba-studios/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Zumba Studio
          </Button>
        }
      />

      <div className="space-y-6 max-w-4xl">
        <Card variant="bordered">
          <div className="flex items-start gap-6">
            <div className="shrink-0">
              {zumbaStudio.images && zumbaStudio.images.length > 0 ? (
                <a
                  href={zumbaStudio.images[0]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-28 w-28 rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-brand-400 transition-colors"
                >
                  <img
                    src={zumbaStudio.images[0]}
                    alt={zumbaStudio.name}
                    className="h-full w-full object-cover"
                  />
                </a>
              ) : (
                <div className="flex items-center justify-center h-28 w-28 rounded-2xl bg-gray-100 border-2 border-gray-200">
                  <Music className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{zumbaStudio.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {[zumbaStudio.address, zumbaStudio.city, zumbaStudio.state].filter(Boolean).join(', ')}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant={zumbaStudio.status === 'ACTIVE' ? 'success' : 'error'} size="md">
                  {zumbaStudio.status}
                </Badge>
                {zumbaStudio.monthlyFee != null && (
                  <span className="text-sm text-gray-500">
                    {formatCurrency(zumbaStudio.monthlyFee)}/month
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  Created {new Date(zumbaStudio.createdAt).toLocaleDateString()}
                </span>
              </div>
              {zumbaStudio.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">{zumbaStudio.description}</p>
              )}
            </div>
          </div>
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Details</h2>
          <InfoRow icon={Clock} label="Operating Hours" value={zumbaStudio.openTime && zumbaStudio.closeTime ? `${zumbaStudio.openTime} — ${zumbaStudio.closeTime}` : null} />
          <InfoRow icon={IndianRupee} label="Monthly Fee" value={zumbaStudio.monthlyFee != null ? formatCurrency(zumbaStudio.monthlyFee) : null} />
        </Card>

        {zumbaStudio.amenities.length > 0 && (
          <Card variant="bordered">
            <div className="flex items-center gap-2 mb-4">
              <Music className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Amenities</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {zumbaStudio.amenities.map((a) => (
                <span key={a} className="inline-flex items-center px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium border border-brand-200">
                  {a}
                </span>
              ))}
            </div>
          </Card>
        )}

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Contact & Location</h2>
          <InfoRow icon={Phone} label="Phone" value={zumbaStudio.contactPhone} />
          <InfoRow icon={Mail} label="Email" value={zumbaStudio.contactEmail} />
          <InfoRow icon={Globe} label="Website" value={zumbaStudio.website} />
          <InfoRow icon={MapPin} label="Address" value={[zumbaStudio.address, zumbaStudio.city, zumbaStudio.state, zumbaStudio.pincode].filter(Boolean).join(', ')} />
        </Card>

        {zumbaStudio.images && zumbaStudio.images.length > 0 && (
          <Card variant="bordered">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Images ({zumbaStudio.images.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {zumbaStudio.images.map((img, i) => (
                <a
                  key={i}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-brand-400 transition-all hover:shadow-lg"
                >
                  <img src={img} alt={`Zumba studio image ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </a>
              ))}
            </div>
          </Card>
        )}

        {zumbaStudio.documents && zumbaStudio.documents.length > 0 && (
          <Card variant="bordered">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Documents ({zumbaStudio.documents.length})</h2>
            </div>
            <div className="space-y-2">
              {zumbaStudio.documents.map((doc, i) => {
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
