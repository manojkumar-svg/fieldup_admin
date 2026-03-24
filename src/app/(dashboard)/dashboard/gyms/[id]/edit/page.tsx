'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { gymSchema, type GymInput } from '@/lib/validations/entities';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { TagInput } from '@/components/ui/TagInput';
import { FileUpload } from '@/components/ui/FileUpload';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { ErrorState } from '@/components/ui/ErrorState';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import type { Gym } from '@/types/database';

export default function EditGymPage(): React.ReactElement {
  const router = useRouter();
  const params = useParams();
  const gymId = params.id as string;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery<{ gym: Gym }>({
    queryKey: ['gym', gymId],
    queryFn: async () => {
      const res = await fetch(`/api/gyms/${gymId}`);
      if (!res.ok) throw new Error('Failed to fetch gym');
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
  } = useForm<GymInput>({
    resolver: zodResolver(gymSchema),
    values: data?.gym
      ? {
          name: data.gym.name,
          description: data.gym.description ?? '',
          address: data.gym.address,
          city: data.gym.city,
          state: data.gym.state,
          pincode: data.gym.pincode,
          latitude: data.gym.latitude,
          longitude: data.gym.longitude,
          contactPhone: data.gym.contactPhone,
          contactEmail: data.gym.contactEmail ?? '',
          website: data.gym.website ?? '',
          amenities: data.gym.amenities ?? [],
          images: data.gym.images ?? [],
          documents: data.gym.documents ?? [],
          imageTitles: data.gym.imageTitles ?? [],
          documentTitles: data.gym.documentTitles ?? [],
          openTime: data.gym.openTime ?? '',
          closeTime: data.gym.closeTime ?? '',
          monthlyFee: data.gym.monthlyFee,
        }
      : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: async (formData: GymInput) => {
      const res = await fetch(`/api/gyms/${gymId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to update gym');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gyms'] });
      queryClient.invalidateQueries({ queryKey: ['gym', gymId] });
      toast('Gym updated successfully', 'success');
      router.push('/dashboard/gyms');
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
      <PageHeader title="Edit Gym" backHref="/dashboard/gyms" />

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-6 max-w-3xl">
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" error={errors.description?.message} {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Phone" type="tel" inputMode="numeric" placeholder="9876543210" maxLength={15} hint="10 digits starting with 6-9 (e.g. 9876543210)" error={errors.contactPhone?.message} {...register('contactPhone')} />
              <Input label="Contact Email" type="email" error={errors.contactEmail?.message} {...register('contactEmail')} />
            </div>
            <Input label="Website" error={errors.website?.message} {...register('website')} />
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Operations</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Input label="Open Time (HH:MM)" error={errors.openTime?.message} {...register('openTime')} placeholder="06:00" />
              <Input label="Close Time (HH:MM)" error={errors.closeTime?.message} {...register('closeTime')} placeholder="22:00" />
              <Input label="Monthly Fee (₹)" type="number" error={errors.monthlyFee?.message} {...register('monthlyFee')} />
            </div>
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Amenities"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="Type and press Enter"
                  error={errors.amenities?.message}
                />
              )}
            />
          </div>
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images & Documents</h2>
          <div className="space-y-6">
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <Controller
                  name="imageTitles"
                  control={control}
                  render={({ field: titlesField }) => (
                    <FileUpload
                      label="Gym Images"
                      value={field.value ?? []}
                      onChange={field.onChange}
                      titles={titlesField.value ?? []}
                      onTitlesChange={titlesField.onChange}
                      type="image"
                      accept="image/*"
                      maxFiles={10}
                      hint="Upload photos of the gym (max 10)"
                    />
                  )}
                />
              )}
            />
            <Controller
              name="documents"
              control={control}
              render={({ field }) => (
                <Controller
                  name="documentTitles"
                  control={control}
                  render={({ field: titlesField }) => (
                    <FileUpload
                      label="Documents"
                      value={field.value ?? []}
                      onChange={field.onChange}
                      titles={titlesField.value ?? []}
                      onTitlesChange={titlesField.onChange}
                      type="document"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      maxFiles={5}
                      hint="Licenses, permits, or other documents (max 5)"
                    />
                  )}
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
            Update Gym
          </Button>
        </div>
      </form>
    </div>
  );
}
