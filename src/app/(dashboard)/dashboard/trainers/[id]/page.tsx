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
import { SPORT_TYPE_LABELS, formatCurrency } from '@/lib/utils';
import {
  MapPin,
  Pencil,
  Mail,
  Phone,
  Dumbbell,
  Clock,
  IndianRupee,
  Award,
  User,
} from 'lucide-react';
import type { Trainer } from '@/types/database';

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

export default function TrainerDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, isLoading, error, refetch } = useQuery<{ trainer: Trainer }>({
    queryKey: ['trainer', id],
    queryFn: async () => {
      const res = await fetch(`/api/trainers/${id}`);
      if (!res.ok) throw new Error('Failed to load trainer');
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Trainer Details" backHref="/dashboard/trainers" />
        <div className="space-y-6 max-w-4xl">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  const trainer = data?.trainer;

  if (error || !trainer) {
    return (
      <div>
        <PageHeader title="Trainer Details" backHref="/dashboard/trainers" />
        <ErrorState message="Failed to load trainer" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={trainer.name}
        subtitle={SPORT_TYPE_LABELS[trainer.sportSpecialization] ?? trainer.sportSpecialization}
        backHref="/dashboard/trainers"
        action={
          <Button onClick={() => router.push(`/dashboard/trainers/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Trainer
          </Button>
        }
      />

      <div className="flex items-center gap-3 mb-6">
        <Badge variant={trainer.status === 'ACTIVE' ? 'success' : 'error'} size="md">
          {trainer.status}
        </Badge>
        <span className="text-sm text-gray-500">
          Created {new Date(trainer.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="space-y-6 max-w-4xl">
        {/* Photo & Profile */}
        <Card variant="bordered">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="shrink-0">
              {trainer.photo ? (
                <a
                  href={trainer.photo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-28 w-28 rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-brand-400 transition-colors"
                >
                  <img
                    src={trainer.photo}
                    alt={trainer.name}
                    className="h-full w-full object-cover"
                  />
                </a>
              ) : (
                <div className="flex items-center justify-center h-28 w-28 rounded-2xl bg-gray-100 border-2 border-gray-200">
                  <User className="h-10 w-10 text-gray-400" />
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900">{trainer.name}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {SPORT_TYPE_LABELS[trainer.sportSpecialization] ?? trainer.sportSpecialization} Specialist
              </p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {trainer.experience} {trainer.experience === 1 ? 'year' : 'years'} experience
                </span>
                <span className="flex items-center gap-1">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(trainer.hourlyRate)}/hr
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Bio */}
        {trainer.bio && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{trainer.bio}</p>
          </Card>
        )}

        {/* Professional Details */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Professional Details</h2>
          <InfoRow icon={Dumbbell} label="Specialization" value={SPORT_TYPE_LABELS[trainer.sportSpecialization] ?? trainer.sportSpecialization} />
          <InfoRow icon={Clock} label="Experience" value={`${trainer.experience} ${trainer.experience === 1 ? 'year' : 'years'}`} />
          <InfoRow icon={IndianRupee} label="Hourly Rate" value={formatCurrency(trainer.hourlyRate)} />
        </Card>

        {/* Certifications */}
        {trainer.certifications.length > 0 && (
          <Card variant="bordered">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Certifications</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {trainer.certifications.map((cert) => (
                <span
                  key={cert}
                  className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200"
                >
                  <Award className="h-3.5 w-3.5 mr-1.5" />
                  {cert}
                </span>
              ))}
            </div>
          </Card>
        )}

        {/* Contact & Location */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Contact & Location</h2>
          <InfoRow icon={Phone} label="Phone" value={trainer.phone} />
          <InfoRow icon={Mail} label="Email" value={trainer.email} />
          <InfoRow icon={MapPin} label="Location" value={[trainer.city, trainer.state].filter(Boolean).join(', ')} />
        </Card>
      </div>
    </div>
  );
}
