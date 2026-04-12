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
  Image as ImageIcon,
  FileText,
  Users,
  Baby,
  CheckCircle2,
  XCircle,
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

  const profilePhoto = trainer.photo || (trainer.images && trainer.images.length > 0 ? trainer.images[0] : null);

  return (
    <div>
      <PageHeader
        title={trainer.name}
        backHref="/dashboard/trainers"
        action={
          <Button onClick={() => router.push(`/dashboard/trainers/${id}/edit`)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit Trainer
          </Button>
        }
      />

      <div className="space-y-6 max-w-4xl">
        {/* Photo & Profile */}
        <Card variant="bordered">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="shrink-0">
              {profilePhoto ? (
                <a
                  href={profilePhoto}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-28 w-28 rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-brand-400 transition-colors"
                >
                  <img
                    src={profilePhoto}
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
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <Badge variant={trainer.status === 'ACTIVE' ? 'success' : 'error'} size="md">
                  {trainer.status}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  {trainer.experience} {trainer.experience === 1 ? 'year' : 'years'} experience
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-500">
                  <IndianRupee className="h-4 w-4" />
                  {formatCurrency(trainer.hourlyRate)}/hr
                </span>
                <span className="text-sm text-gray-500">
                  Created {new Date(trainer.createdAt).toLocaleDateString()}
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

        {/* Images */}
        {trainer.images && trainer.images.length > 0 && (
          <Card variant="bordered">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Images ({trainer.images.length})</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {trainer.images.map((img, i) => {
                const imgTitle = trainer.imageTitles?.[i];
                return (
                  <a
                    key={i}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 hover:border-brand-400 transition-all hover:shadow-lg"
                  >
                    <img
                      src={img}
                      alt={imgTitle || `Trainer image ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {imgTitle && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                        <p className="text-[11px] text-white truncate">{imgTitle}</p>
                      </div>
                    )}
                  </a>
                );
              })}
            </div>
          </Card>
        )}

        {/* Policies */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Policies & Session Types</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Cancellation', value: trainer.cancellationAvailable },
              { label: 'Kids Training', value: trainer.kidsTraining },
              { label: 'Group Sessions', value: trainer.groupSessions },
              { label: '1:1 Coaching', value: trainer.oneOnOneCoaching },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-2 p-3 rounded-xl border border-gray-100 bg-gray-50">
                {value
                  ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                  : <XCircle className="h-4 w-4 text-gray-300 shrink-0" />}
                <span className={`text-sm font-medium ${value ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Session Configuration */}
        {(trainer.kidsTraining || trainer.groupSessions || trainer.oneOnOneCoaching) && trainer.sessionConfig && Object.keys(trainer.sessionConfig).length > 0 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Details</h2>
            <div className="space-y-4">
              {trainer.kidsTraining && trainer.sessionConfig.kids && (
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Baby className="h-4 w-4 text-brand-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Kids Training</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {trainer.sessionConfig.kids.timings && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Timings</p><p className="text-gray-900 mt-0.5">{trainer.sessionConfig.kids.timings}</p></div>}
                    {trainer.sessionConfig.kids.fee != null && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Fee</p><p className="text-gray-900 mt-0.5">{formatCurrency(trainer.sessionConfig.kids.fee)}</p></div>}
                    {trainer.sessionConfig.kids.maxCapacity != null && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Max Capacity</p><p className="text-gray-900 mt-0.5">{trainer.sessionConfig.kids.maxCapacity}</p></div>}
                    {(trainer.sessionConfig.kids.ageMin != null || trainer.sessionConfig.kids.ageMax != null) && (
                      <div><p className="text-xs text-gray-500 uppercase tracking-wide">Age Range</p><p className="text-gray-900 mt-0.5">{trainer.sessionConfig.kids.ageMin ?? '—'} – {trainer.sessionConfig.kids.ageMax ?? '—'} yrs</p></div>
                    )}
                  </div>
                </div>
              )}
              {trainer.groupSessions && trainer.sessionConfig.group && (
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-brand-600" />
                    <h3 className="text-sm font-semibold text-gray-900">Group Sessions</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {trainer.sessionConfig.group.timings && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Timings</p><p className="text-gray-900 mt-0.5">{trainer.sessionConfig.group.timings}</p></div>}
                    {trainer.sessionConfig.group.fee != null && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Fee</p><p className="text-gray-900 mt-0.5">{formatCurrency(trainer.sessionConfig.group.fee)}</p></div>}
                    {trainer.sessionConfig.group.maxCapacity != null && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Max Capacity</p><p className="text-gray-900 mt-0.5">{trainer.sessionConfig.group.maxCapacity}</p></div>}
                    {(trainer.sessionConfig.group.ageMin != null || trainer.sessionConfig.group.ageMax != null) && (
                      <div><p className="text-xs text-gray-500 uppercase tracking-wide">Age Range</p><p className="text-gray-900 mt-0.5">{trainer.sessionConfig.group.ageMin ?? '—'} – {trainer.sessionConfig.group.ageMax ?? '—'} yrs</p></div>
                    )}
                  </div>
                </div>
              )}
              {trainer.oneOnOneCoaching && trainer.sessionConfig.oneOnOne && (
                <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-brand-600" />
                    <h3 className="text-sm font-semibold text-gray-900">1:1 Coaching</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                    {trainer.sessionConfig.oneOnOne.timings && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Timings</p><p className="text-gray-900 mt-0.5">{trainer.sessionConfig.oneOnOne.timings}</p></div>}
                    {trainer.sessionConfig.oneOnOne.fee != null && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Fee</p><p className="text-gray-900 mt-0.5">{formatCurrency(trainer.sessionConfig.oneOnOne.fee)}</p></div>}
                    {trainer.sessionConfig.oneOnOne.maxCapacity != null && <div><p className="text-xs text-gray-500 uppercase tracking-wide">Max Capacity</p><p className="text-gray-900 mt-0.5">{trainer.sessionConfig.oneOnOne.maxCapacity}</p></div>}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Documents */}
        {trainer.documents && trainer.documents.length > 0 && (
          <Card variant="bordered">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-700" />
              <h2 className="text-lg font-semibold text-gray-900">Documents ({trainer.documents.length})</h2>
            </div>
            <div className="space-y-2">
              {trainer.documents.map((doc, i) => {
                const title = trainer.documentTitles?.[i];
                const isBase64 = doc.startsWith('data:');
                const urlFileName = isBase64 ? `Document ${i + 1}` : (doc.split('/').pop() ?? `Document ${i + 1}`);
                const fileName = title || urlFileName;
                const ext = (title || isBase64) ? 'FILE' : (doc.split('.').pop()?.toUpperCase() ?? 'FILE');
                const isImage = doc.startsWith('data:image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(doc);
                return (
                  <a
                    key={i}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-brand-400 hover:bg-brand-50 transition-all group"
                  >
                    {isImage ? (
                      <img src={doc} alt={fileName} className="h-10 w-10 rounded-lg object-cover shrink-0 border border-gray-200" />
                    ) : (
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-brand-100 text-brand-700 text-xs font-bold shrink-0">
                        {ext}
                      </div>
                    )}
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
