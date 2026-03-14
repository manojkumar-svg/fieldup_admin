'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
import { useToast } from '@/components/ui/Toast';
import { SPORT_TYPE_LABELS } from '@/lib/utils';

const sportOptions = Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export default function NewTrainerPage(): React.ReactElement {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TrainerInput>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      certifications: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: TrainerInput) => {
      const res = await fetch('/api/trainers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to create trainer');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainers'] });
      toast('Trainer created successfully', 'success');
      router.push('/dashboard/trainers');
    },
    onError: (err: Error) => {
      toast(err.message, 'error');
    },
  });

  return (
    <div>
      <PageHeader title="Add Trainer" backHref="/dashboard/trainers" />

      <form onSubmit={handleSubmit((d) => createMutation.mutate(d))} className="space-y-6 max-w-3xl">
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
          <Button type="submit" isLoading={createMutation.isPending}>
            Create Trainer
          </Button>
        </div>
      </form>
    </div>
  );
}
