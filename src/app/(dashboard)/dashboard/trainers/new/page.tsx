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
import { FileUpload } from '@/components/ui/FileUpload';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { Checkbox } from '@/components/ui/Checkbox';
import { useToast } from '@/components/ui/Toast';
import { SessionTimingPicker } from '@/components/ui/SessionTimingPicker';
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<TrainerInput>({
    resolver: zodResolver(trainerSchema),
    defaultValues: {
      certifications: [],
      images: [],
      documents: [],
      imageTitles: [],
      documentTitles: [],
      cancellationAvailable: false,
      kidsTraining: false,
      groupSessions: false,
      oneOnOneCoaching: false,
      sessionConfig: {},
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

      <form onSubmit={handleSubmit((d) => {
        const submitData = { ...d, photo: d.photo || (d.images && d.images.length > 0 ? d.images[0] : '') };
        createMutation.mutate(submitData);
      })} className="space-y-6 max-w-3xl">
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
          <div className="space-y-4">
            <Input label="Name" error={errors.name?.message} {...register('name')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Phone" type="tel" inputMode="numeric" placeholder="9876543210" maxLength={15} hint="10 digits starting with 6-9 (e.g. 9876543210)" error={errors.phone?.message} {...register('phone')} />
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Policies</h2>
          <div className="flex items-center gap-6">
            <Checkbox
              label="Cancellation Available"
              {...register('cancellationAvailable')}
            />
          </div>
        </Card>

        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Session Configuration</h2>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-6">
              <Checkbox label="Kids Training" {...register('kidsTraining')} />
              <Checkbox label="Group Sessions" {...register('groupSessions')} />
              <Checkbox label="1:1 Coaching" {...register('oneOnOneCoaching')} />
            </div>

            {watch('kidsTraining') && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Kids Training Details</h3>
                <Controller
                  name="sessionConfig.kids.startTime"
                  control={control}
                  render={({ field: startField }) => (
                    <Controller
                      name="sessionConfig.kids.endTime"
                      control={control}
                      render={({ field: endField }) => (
                        <Controller
                          name="sessionConfig.kids.days"
                          control={control}
                          render={({ field: daysField }) => (
                            <SessionTimingPicker
                              startTime={startField.value ?? ''}
                              endTime={endField.value ?? ''}
                              days={daysField.value ?? []}
                              onStartTimeChange={startField.onChange}
                              onEndTimeChange={endField.onChange}
                              onDaysChange={daysField.onChange}
                              startTimeError={errors.sessionConfig?.kids?.startTime?.message}
                              endTimeError={errors.sessionConfig?.kids?.endTime?.message}
                            />
                          )}
                        />
                      )}
                    />
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Fee (₹)" type="number" {...register('sessionConfig.kids.fee')} />
                  <Input label="Max Capacity" type="number" {...register('sessionConfig.kids.maxCapacity')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Min Age" type="number" {...register('sessionConfig.kids.ageMin')} />
                  <Input label="Max Age" type="number" {...register('sessionConfig.kids.ageMax')} />
                </div>
              </div>
            )}

            {watch('groupSessions') && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Group Session Details</h3>
                <Controller
                  name="sessionConfig.group.startTime"
                  control={control}
                  render={({ field: startField }) => (
                    <Controller
                      name="sessionConfig.group.endTime"
                      control={control}
                      render={({ field: endField }) => (
                        <Controller
                          name="sessionConfig.group.days"
                          control={control}
                          render={({ field: daysField }) => (
                            <SessionTimingPicker
                              startTime={startField.value ?? ''}
                              endTime={endField.value ?? ''}
                              days={daysField.value ?? []}
                              onStartTimeChange={startField.onChange}
                              onEndTimeChange={endField.onChange}
                              onDaysChange={daysField.onChange}
                              startTimeError={errors.sessionConfig?.group?.startTime?.message}
                              endTimeError={errors.sessionConfig?.group?.endTime?.message}
                            />
                          )}
                        />
                      )}
                    />
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Fee (₹)" type="number" {...register('sessionConfig.group.fee')} />
                  <Input label="Max Capacity" type="number" {...register('sessionConfig.group.maxCapacity')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Min Age" type="number" {...register('sessionConfig.group.ageMin')} />
                  <Input label="Max Age" type="number" {...register('sessionConfig.group.ageMax')} />
                </div>
              </div>
            )}

            {watch('oneOnOneCoaching') && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                <h3 className="text-sm font-medium text-gray-700">1:1 Coaching Details</h3>
                <Controller
                  name="sessionConfig.oneOnOne.startTime"
                  control={control}
                  render={({ field: startField }) => (
                    <Controller
                      name="sessionConfig.oneOnOne.endTime"
                      control={control}
                      render={({ field: endField }) => (
                        <Controller
                          name="sessionConfig.oneOnOne.days"
                          control={control}
                          render={({ field: daysField }) => (
                            <SessionTimingPicker
                              startTime={startField.value ?? ''}
                              endTime={endField.value ?? ''}
                              days={daysField.value ?? []}
                              onStartTimeChange={startField.onChange}
                              onEndTimeChange={endField.onChange}
                              onDaysChange={daysField.onChange}
                              startTimeError={errors.sessionConfig?.oneOnOne?.startTime?.message}
                              endTimeError={errors.sessionConfig?.oneOnOne?.endTime?.message}
                            />
                          )}
                        />
                      )}
                    />
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Fee (₹)" type="number" {...register('sessionConfig.oneOnOne.fee')} />
                  <Input label="Max Capacity" type="number" {...register('sessionConfig.oneOnOne.maxCapacity')} />
                </div>
              </div>
            )}
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
                      label="Trainer Images"
                      value={field.value ?? []}
                      onChange={field.onChange}
                      titles={titlesField.value ?? []}
                      onTitlesChange={titlesField.onChange}
                      type="image"
                      accept="image/*"
                      maxFiles={10}
                      hint="Upload photos of the trainer (max 10). First image becomes profile photo."
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
                      hint="Certificates, ID proofs, or other documents (max 5)"
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
          <Button type="submit" isLoading={createMutation.isPending}>
            Create Trainer
          </Button>
        </div>
      </form>
    </div>
  );
}
