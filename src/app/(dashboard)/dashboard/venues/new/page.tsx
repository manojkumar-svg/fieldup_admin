'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { venueSchema, type VenueInput } from '@/lib/validations/entities';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { TagInput } from '@/components/ui/TagInput';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { FileUpload } from '@/components/ui/FileUpload';
import { useToast } from '@/components/ui/Toast';
import { SPORT_TYPE_LABELS, SURFACE_TYPE_LABELS, DAY_LABELS, getSportUnitLabel } from '@/lib/utils';
import { Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/Checkbox';
import type { DayOfWeek } from '@/types/database';

const VENUE_AMENITY_SUGGESTIONS = [
  'Washrooms', 'Drinking Water', 'Refreshments', 'Lockers', 'Shower Areas',
  'Parking', 'First Aid', 'Wi-Fi', 'Seating Area', 'Floodlights',
  'CCTV', 'Cafeteria', 'Changing Rooms', 'AC', 'Pro Shop',
];

const SPORT_AMENITY_SUGGESTIONS = [
  'Equipment Rental', 'Coaching', 'Ball Machine', 'Scoreboards',
  'Jerseys', 'Bibs', 'Night Lights', 'Sound System', 'Umpire',
  'Practice Nets', 'Bowling Machine', 'Goals',
];

const sportOptions = Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const surfaceOptions = Object.entries(SURFACE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const ALL_DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const DEFAULT_SPORT = {
  sportType: '' as never,
  numberOfCourts: 1,
  pricePerHour: 0,
  openTime: '06:00',
  closeTime: '22:00',
  availableDays: ALL_DAYS,
  rules: '',
  amenities: [] as string[],
  courts: [] as Array<{ name: string; surfaceType: 'SYNTHETIC' | 'WOODEN' | 'CLAY' | 'TURF' | 'CONCRETE'; indoor: boolean }>,
};

export default function NewVenuePage(): React.ReactElement {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VenueInput>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      amenities: [],
      images: [],
      documents: [],
      sports: [DEFAULT_SPORT],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'sports',
  });

  const createMutation = useMutation({
    mutationFn: async (data: VenueInput) => {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to create venue');
      }
      return res.json();
    },
    onSuccess: () => {
      toast('Venue created successfully', 'success');
      router.push('/dashboard/venues');
    },
    onError: (error: Error) => {
      toast(error.message, 'error');
    },
  });

  const watchedLat = watch('latitude');
  const watchedLng = watch('longitude');

  return (
    <div>
      <PageHeader title="Add New Venue" backHref="/dashboard/venues" />

      <form onSubmit={handleSubmit((data) => createMutation.mutate(data as VenueInput))} className="space-y-6 max-w-3xl">
        {/* General Info */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General Information</h2>
          <div className="space-y-4">
            <Input label="Venue Name" error={errors.name?.message} {...register('name')} />
            <Textarea label="Description" error={errors.description?.message} {...register('description')} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Contact Phone" type="tel" inputMode="numeric" placeholder="9876543210" maxLength={15} hint="10 digits starting with 6-9 (e.g. 9876543210)" error={errors.contactPhone?.message} {...register('contactPhone')} />
              <Input label="Contact Email" type="email" error={errors.contactEmail?.message} {...register('contactEmail')} />
            </div>
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <TagInput
                  label="Venue Amenities"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  placeholder="e.g. Parking, Washroom, Canteen — press Enter"
                  suggestions={VENUE_AMENITY_SUGGESTIONS}
                />
              )}
            />
          </div>
        </Card>

        {/* Location */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
          <LocationPicker
            latitude={watchedLat}
            longitude={watchedLng}
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

        {/* Sports & Courts (clubbed) */}
        <Card variant="bordered">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Sports & Courts</h2>
              <p className="text-xs text-gray-500 mt-0.5">Add sports offered at this venue with their courts/units</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => append(DEFAULT_SPORT)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Sport
            </Button>
          </div>

          {errors.sports?.message && (
            <p className="text-sm text-red-600 mb-3">{errors.sports.message}</p>
          )}

          <div className="space-y-6">
            {fields.map((field, index) => (
              <SportCourtBlock
                key={field.id}
                index={index}
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </Card>

        {/* Images & Documents */}
        <Card variant="bordered">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Images & Documents</h2>
          <div className="space-y-6">
            <Controller
              name="images"
              control={control}
              render={({ field }) => (
                <FileUpload
                  label="Venue Images"
                  value={field.value ?? []}
                  onChange={field.onChange}
                  type="image"
                  accept="image/*"
                  maxFiles={10}
                  hint="Upload photos of your venue (max 10)"
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
                  hint="Venue registration, licenses, or other documents (max 5)"
                />
              )}
            />
          </div>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" isLoading={createMutation.isPending}>
            Save Venue
          </Button>
        </div>
      </form>
    </div>
  );
}

/** A single sport block with auto-generated court sub-entries */
function SportCourtBlock({
  index,
  control,
  register,
  errors,
  watch,
  setValue,
  canRemove,
  onRemove,
}: {
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  canRemove: boolean;
  onRemove: () => void;
}): React.ReactElement {
  const sportType = watch(`sports.${index}.sportType`) as string;
  const numberOfCourts = watch(`sports.${index}.numberOfCourts`);
  const courts = (watch(`sports.${index}.courts`) ?? []) as Array<{ name: string; surfaceType: string; indoor: boolean }>;
  const unitLabel = getSportUnitLabel(sportType ?? '');
  const sportLabel = SPORT_TYPE_LABELS[sportType] ?? '';

  // Auto-sync courts array when numberOfCourts changes
  const prevNumRef = React.useRef<number>(courts.length);
  React.useEffect(() => {
    const num = Number(numberOfCourts) || 0;
    if (num < 0 || num > 100 || num === prevNumRef.current) return;
    prevNumRef.current = num;

    const uLabel = getSportUnitLabel(sportType ?? '');
    const sLabel = SPORT_TYPE_LABELS[sportType] ?? uLabel.singular;
    const updated = Array.from({ length: num }, (_, i) => ({
      name: courts[i]?.name ?? `${sLabel} ${uLabel.singular} ${i + 1}`,
      surfaceType: courts[i]?.surfaceType ?? ('' as never),
      indoor: courts[i]?.indoor ?? false,
    }));
    setValue(`sports.${index}.courts`, updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberOfCourts]);

  // Re-generate default names when sport type changes
  React.useEffect(() => {
    if (!sportType) return;
    const num = Number(numberOfCourts) || 0;
    if (num === 0) return;
    const uLabel = getSportUnitLabel(sportType);
    const sLabel = SPORT_TYPE_LABELS[sportType] ?? uLabel.singular;
    const updated = Array.from({ length: num }, (_, i) => ({
      name: `${sLabel} ${uLabel.singular} ${i + 1}`,
      surfaceType: courts[i]?.surfaceType ?? ('' as never),
      indoor: courts[i]?.indoor ?? false,
    }));
    setValue(`sports.${index}.courts`, updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sportType]);

  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">
          Sport #{index + 1}{sportLabel ? ` — ${sportLabel}` : ''}
        </h3>
        {canRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <Select
          label="Sport Type"
          options={sportOptions}
          placeholder="Select a sport"
          error={errors.sports?.[index]?.sportType?.message}
          {...register(`sports.${index}.sportType`)}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={`Number of ${unitLabel.plural}`}
            type="number"
            min={1}
            error={errors.sports?.[index]?.numberOfCourts?.message}
            {...register(`sports.${index}.numberOfCourts`)}
          />
          <Input
            label="Price per Hour (₹)"
            type="number"
            step="0.01"
            error={errors.sports?.[index]?.pricePerHour?.message}
            {...register(`sports.${index}.pricePerHour`)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Open Time"
            placeholder="06:00"
            error={errors.sports?.[index]?.openTime?.message}
            {...register(`sports.${index}.openTime`)}
          />
          <Input
            label="Close Time"
            placeholder="22:00"
            error={errors.sports?.[index]?.closeTime?.message}
            {...register(`sports.${index}.closeTime`)}
          />
        </div>

        {/* Days of availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Available Days
          </label>
          {errors.sports?.[index]?.availableDays?.message && (
            <p className="text-sm text-red-600 mb-1">{errors.sports[index]?.availableDays?.message}</p>
          )}
          <Controller
            name={`sports.${index}.availableDays`}
            control={control}
            render={({ field: dayField }) => (
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map((day) => {
                  const isChecked = (dayField.value ?? []).includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const current = dayField.value ?? [];
                        const updated = isChecked
                          ? current.filter((d: string) => d !== day)
                          : [...current, day];
                        dayField.onChange(updated);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isChecked
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {DAY_LABELS[day]}
                    </button>
                  );
                })}
              </div>
            )}
          />
        </div>

        <Textarea
          label="Rules & Regulations"
          placeholder="Enter rules for this sport..."
          error={errors.sports?.[index]?.rules?.message}
          {...register(`sports.${index}.rules`)}
        />

        <Controller
          name={`sports.${index}.amenities`}
          control={control}
          render={({ field: amenField }) => (
            <TagInput
              label="Sport-specific Amenities"
              value={amenField.value ?? []}
              onChange={amenField.onChange}
              placeholder="e.g. Equipment rental, Coaching — press Enter"
              suggestions={SPORT_AMENITY_SUGGESTIONS}
            />
          )}
        />

        {/* Auto-generated Court/Unit entries */}
        {courts.length > 0 && (
          <div className="mt-2 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              {unitLabel.plural} ({courts.length})
            </h4>
            <div className="space-y-3">
              {courts.map((_court, courtIdx) => (
                <div key={courtIdx} className="rounded-lg border border-gray-200 bg-white p-3">
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label={`${unitLabel.singular} Name`}
                      error={errors.sports?.[index]?.courts?.[courtIdx]?.name?.message}
                      {...register(`sports.${index}.courts.${courtIdx}.name`)}
                    />
                    <Select
                      label="Surface Type"
                      options={surfaceOptions}
                      placeholder="Select"
                      error={errors.sports?.[index]?.courts?.[courtIdx]?.surfaceType?.message}
                      {...register(`sports.${index}.courts.${courtIdx}.surfaceType`)}
                    />
                    <div className="flex items-end pb-1">
                      <Checkbox
                        label="Indoor"
                        {...register(`sports.${index}.courts.${courtIdx}.indoor`)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
