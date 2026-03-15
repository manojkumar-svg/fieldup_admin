'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courtSchema, type CourtInput } from '@/lib/validations/entities';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileUpload } from '@/components/ui/FileUpload';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { SPORT_TYPE_LABELS, SURFACE_TYPE_LABELS } from '@/lib/utils';
import type { CourtWithVenue } from '@/types/database';

const sportOptions = Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const surfaceOptions = Object.entries(SURFACE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface VenueOption {
  id: string;
  name: string;
  city: string;
}

export default function EditCourtPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const courtId = params.id as string;

  const { data: courtData, isLoading, error, refetch } = useQuery<{ court: CourtWithVenue }>({
    queryKey: ['court', courtId],
    queryFn: async () => {
      const res = await fetch(`/api/courts/${courtId}`);
      if (!res.ok) throw new Error('Failed to fetch court');
      return res.json();
    },
  });

  const { data: venuesData } = useQuery<{ venues: VenueOption[] }>({
    queryKey: ['venues-list'],
    queryFn: async () => {
      const res = await fetch('/api/venues?limit=200');
      if (!res.ok) throw new Error('Failed to fetch venues');
      return res.json();
    },
  });

  const venueOptions = (venuesData?.venues ?? []).map((v) => ({
    value: v.id,
    label: `${v.name} (${v.city})`,
  }));

  const court = courtData?.court;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CourtInput>({
    resolver: zodResolver(courtSchema),
    values: court
      ? {
          venueId: court.venueId,
          name: court.name,
          sportType: court.sportType,
          surfaceType: court.surfaceType,
          indoor: court.indoor,
          pricePerHour: court.pricePerHour,
          maxPlayers: court.maxPlayers,
          images: court.images ?? [],
          documents: court.documents ?? [],
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CourtInput) => {
      const res = await fetch(`/api/courts/${courtId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to update court');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courts'] });
      queryClient.invalidateQueries({ queryKey: ['court', courtId] });
      toast('Court updated successfully', 'success');
      router.push('/dashboard/courts');
    },
    onError: (err: Error) => {
      toast(err.message, 'error');
    },
  });

  if (error) return <ErrorState onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Edit Court" backHref="/dashboard/courts" />
        <div className="max-w-3xl space-y-6">
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (!court) {
    return (
      <div>
        <PageHeader title="Edit Court" backHref="/dashboard/courts" />
        <ErrorState message="Court not found" onRetry={() => refetch()} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Edit: ${court.name}`} backHref="/dashboard/courts" />

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6 max-w-3xl">
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Court Details</h2>
          <div className="space-y-4">
            <Input
              label="Court Name"
              placeholder="e.g. Court 1, Main Arena"
              error={errors.name?.message}
              {...register('name')}
            />

            <Select
              label="Venue"
              options={venueOptions}
              placeholder="Select venue"
              error={errors.venueId?.message}
              {...register('venueId')}
            />

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Sport Type"
                options={sportOptions}
                placeholder="Select sport"
                error={errors.sportType?.message}
                {...register('sportType')}
              />
              <Select
                label="Surface Type"
                options={surfaceOptions}
                placeholder="Select surface"
                error={errors.surfaceType?.message}
                {...register('surfaceType')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price per Hour (₹)"
                type="number"
                error={errors.pricePerHour?.message}
                {...register('pricePerHour')}
              />
              <Input
                label="Max Players"
                type="number"
                error={errors.maxPlayers?.message}
                {...register('maxPlayers')}
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Checkbox
                label="Indoor Court"
                {...register('indoor')}
              />
            </div>
          </div>
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images & Documents</h2>
          <div className="space-y-6">
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Court Images"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  type="image"
                  accept="image/*"
                  maxFiles={10}
                  hint="Upload photos of the court (max 10)"
                />
              )}
            />
            <Controller
              name="documents"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Documents"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  type="document"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  maxFiles={5}
                  hint="Court-related documents (max 5)"
                />
              )}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" isLoading={updateMutation.isPending}>
            Update Court
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
