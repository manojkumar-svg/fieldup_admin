'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trainerSchema, type TrainerInput } from '@/lib/validations/entities';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { TagInput } from '@/components/ui/TagInput';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { SPORT_TYPE_LABELS } from '@/lib/utils';
import type { Trainer } from '@/types/database';

const sportOptions = Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function EditTrainerPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const trainerId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<{ trainer: Trainer }>({
    queryKey: ['trainer', trainerId],
    queryFn: async () => {
      const res = await fetch(`/api/trainers/${trainerId}`);
      if (!res.ok) throw new Error('Failed to fetch trainer');
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TrainerInput>({
    resolver: zodResolver(trainerSchema),
    values: data?.trainer
      ? {
          name: data.trainer.name,
          email: data.trainer.email ?? '',
          phone: data.trainer.phone,
          sportSpecialization: data.trainer.sportSpecialization,
          experience: data.trainer.experience,
          certifications: data.trainer.certifications,
          hourlyRate: data.trainer.hourlyRate,
          bio: data.trainer.bio ?? '',
          photo: data.trainer.photo ?? '',
          city: data.trainer.city,
          state: data.trainer.state,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: TrainerInput) => {
      const res = await fetch(`/api/trainers/${trainerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to update trainer');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      queryClient.invalidateQueries({ queryKey: ['trainer', trainerId] });
      toast('Trainer updated successfully', 'success');
      router.push('/dashboard/trainers');
    },
    onError: (err: Error) => {
      toast(err.message, 'error');
    },
  });

  if (error) return <ErrorState onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit Trainer" backHref="/dashboard/trainers" />

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6 max-w-3xl">
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Phone" error={errors.phone?.message} {...register('phone')} />
            </div>
            <Textarea label="Bio" error={errors.bio?.message} {...register('bio')} />
          </div>
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h2>
          <div className="space-y-4">
            <Select
              label="Sport Specialization"
              options={sportOptions}
              placeholder="Select sport"
              error={errors.sportSpecialization?.message}
              {...register('sportSpecialization')}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Experience (years)"
                type="number"
                error={errors.experience?.message}
                {...register('experience')}
              />
              <Input
                label="Hourly Rate (₹)"
                type="number"
                error={errors.hourlyRate?.message}
                {...register('hourlyRate')}
              />
            </div>
            <Controller
              name="certifications"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Certifications"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Type and press Enter"
                  error={errors.certifications?.message}
                />
              )}
            />
          </div>
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" error={errors.city?.message} {...register('city')} />
              <Input label="State" error={errors.state?.message} {...register('state')} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateMutation.isPending}>
            Update Trainer
          </Button>
        </div>
      </form>
    </div>
  );
}
