'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { academySchema, type AcademyInput } from '@/lib/validations/entities';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { FileUpload } from '@/components/ui/FileUpload';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { SPORT_TYPE_LABELS } from '@/lib/utils';
import type { Academy } from '@/types/database';

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

export default function EditAcademyPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const academyId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<{ academy: Academy }>({
    queryKey: ['academy', academyId],
    queryFn: async () => {
      const res = await fetch(`/api/academies/${academyId}`);
      if (!res.ok) throw new Error('Failed to fetch academy');
      return res.json();
    },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AcademyInput>({
    resolver: zodResolver(academySchema),
    values: data?.academy
      ? {
          name: data.academy.name,
          description: data.academy.description ?? '',
          sportsOffered: data.academy.sportsOffered,
          address: data.academy.address,
          city: data.academy.city,
          state: data.academy.state,
          pincode: data.academy.pincode,
          latitude: data.academy.latitude,
          longitude: data.academy.longitude,
          contactPhone: data.academy.contactPhone,
          contactEmail: data.academy.contactEmail ?? '',
          website: data.academy.website ?? '',
          images: data.academy.images,
          documents: data.academy.documents ?? [],
          imageTitles: data.academy.imageTitles ?? [],
          documentTitles: data.academy.documentTitles ?? [],
          establishedYear: data.academy.establishedYear,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: AcademyInput) => {
      const res = await fetch(`/api/academies/${academyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to update academy');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academies'] });
      queryClient.invalidateQueries({ queryKey: ['academy', academyId] });
      toast('Academy updated successfully', 'success');
      router.push('/dashboard/academies');
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
      <PageHeader title="Edit Academy" backHref="/dashboard/academies" />

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6 max-w-3xl">
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
          <LocationPicker
            latitude={watch('latitude')}
            longitude={watch('longitude')}
            address={watch('address') ?? ''}
            city={watch('city') ?? ''}
            state={watch('state') ?? ''}
            pincode={watch('pincode') ?? ''}
            onLocationChange={(loc) => {
              setValue('latitude', loc.latitude, { shouldValidate: true });
              setValue('longitude', loc.longitude, { shouldValidate: true });
              setValue('address', loc.address, { shouldValidate: true });
              setValue('city', loc.city, { shouldValidate: true });
              setValue('state', loc.state, { shouldValidate: true });
              setValue('pincode', loc.pincode, { shouldValidate: true });
            }}
            errors={{
              address: errors.address?.message,
              city: errors.city?.message,
              state: errors.state?.message,
              pincode: errors.pincode?.message,
            }}
            registerAddress={register('address')}
            registerCity={register('city')}
            registerState={register('state')}
            registerPincode={register('pincode')}
          />
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Details</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Phone" type="tel" inputMode="numeric" placeholder="9876543210" maxLength={15} hint="10 digits starting with 6-9 (e.g. 9876543210)" error={errors.contactPhone?.message} {...register('contactPhone')} />
              <Input label="Contact Email" type="email" error={errors.contactEmail?.message} {...register('contactEmail')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Website" placeholder="https://" error={errors.website?.message} {...register('website')} />
              <Input label="Established Year" type="number" error={errors.establishedYear?.message} {...register('establishedYear')} />
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
                  label="Academy Images"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  type="image"
                  accept="image/*"
                  maxFiles={10}
                  hint="Upload photos of your academy (max 10)"
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
                  hint="Registration, licenses, or other documents (max 5)"
                />
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={updateMutation.isPending}>
            Update Academy
          </Button>
        </div>
      </form>
    </div>
  );
}
