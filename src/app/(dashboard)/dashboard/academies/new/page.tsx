'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { academySchema, type AcademyInput } from '@/lib/validations/entities';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { useToast } from '@/components/ui/Toast';
import { SPORT_TYPE_LABELS } from '@/lib/utils';

const sportOptions = Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

function toggleSport(
  current: string[],
  sportValue: string,
  checked: boolean,
): string[] {
  if (checked) return [...current, sportValue];
  return current.filter((s: string) => s !== sportValue);
}

export default function NewAcademyPage(): React.ReactElement {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AcademyInput>({
    resolver: zodResolver(academySchema),
    defaultValues: {
      sportsOffered: [],
      images: [],
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AcademyInput) => {
      const res = await fetch('/api/academies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to create academy');
      }
      return res.json();
    },
    onSuccess: () => {
      toast('Academy created successfully', 'success');
      router.push('/dashboard/academies');
    },
    onError: (error: Error) => {
      toast(error.message, 'error');
    },
  });

  return (
    <div>
      <PageHeader title="Add New Academy" backHref="/dashboard/academies" />

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data))} className="space-y-6 max-w-3xl">
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
          <div className="space-y-4">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" error={errors.description?.message} {...register('description')} />
            <Controller
              name="sportsOffered"
              control={control}
              render={({ field }) => (
                <fieldset className="space-y-1">
                  <legend className="block text-sm font-medium text-gray-700">Sports Offered</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {sportOptions.map((sport) => (
                      <label key={sport.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(field.value ?? []).includes(sport.value as AcademyInput['sportsOffered'][number])}
                          onChange={(e) => field.onChange(
                            toggleSport(field.value ?? [], sport.value, e.target.checked)
                          )}
                          className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                        />
                        {sport.label}
                      </label>
                    ))}
                  </div>
                  {errors.sportsOffered && (
                    <p className="text-sm text-red-600" role="alert">{errors.sportsOffered.message}</p>
                  )}
                </fieldset>
              )}
            />
          </div>
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <div className="space-y-4">
            <Input label="Address" error={errors.address?.message} {...register('address')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" error={errors.city?.message} {...register('city')} />
              <Input label="State" error={errors.state?.message} {...register('state')} />
            </div>
            <Input label="Pincode" error={errors.pincode?.message} {...register('pincode')} />
          </div>
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Phone" error={errors.contactPhone?.message} {...register('contactPhone')} />
              <Input label="Contact Email" type="email" error={errors.contactEmail?.message} {...register('contactEmail')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Website" placeholder="https://" error={errors.website?.message} {...register('website')} />
              <Input label="Established Year" type="number" error={errors.establishedYear?.message} {...register('establishedYear')} />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Save Academy
          </Button>
        </div>
      </form>
    </div>
  );
}
