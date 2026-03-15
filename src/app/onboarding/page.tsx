'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingSchema, type OnboardingInput } from '@/lib/validations/onboarding';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TagInput } from '@/components/ui/TagInput';
import { FileUpload } from '@/components/ui/FileUpload';
import { CheckboxGroup } from '@/components/ui/Checkbox';
import {
  SPORT_TYPE_LABELS,
  PARTNER_TYPE_LABELS,
  SURFACE_TYPE_LABELS,
  SLOT_DURATION_LABELS,
  CITY_OPTIONS,
  FACILITY_OPTIONS,
  SESSION_TYPE_OPTIONS,
  DAY_LABELS,
} from '@/lib/utils';

const STEPS = [
  'Basic Details',
  'Sports & Services',
  'Facility / Training',
  'Availability',
  'Pricing',
  'Payment & Legal',
  'Agreement',
];

const STEP_FIELDS: Record<number, (keyof OnboardingInput)[]> = {
  0: ['partnerType', 'businessName', 'contactPerson', 'phone', 'email', 'city', 'fullAddress', 'googleMapsLink'],
  1: ['sportsOffered', 'experienceYears', 'certifications', 'shortBio'],
  2: ['numberOfCourts', 'surfaceType', 'facilities', 'sessionTypes', 'maxStudents'],
  3: ['availableDays', 'operatingHours', 'slotDuration'],
  4: ['pricePerSlot', 'weekendPricingDiff', 'cancellationAllowed'],
  5: ['acceptsCash', 'bankAccountName', 'bankAccountNumber', 'ifscCode', 'gstNumber', 'idProofUrls', 'profilePhotoUrls'],
  6: ['termsAccepted'],
};

const partnerOptions = Object.entries(PARTNER_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const sportOptions = Object.entries(SPORT_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const surfaceOptions = Object.entries(SURFACE_TYPE_LABELS).map(([value, label]) => ({ value, label }));
const slotDurationOptions = Object.entries(SLOT_DURATION_LABELS).map(([value, label]) => ({ value, label }));
const cityOptions = CITY_OPTIONS.map((c) => ({ value: c, label: c }));
const dayOptions = Object.entries(DAY_LABELS).map(([value, label]) => ({ value, label }));

function getStepIndicatorClass(i: number, currentStep: number): string {
  if (i < currentStep) return 'bg-brand-600 text-white';
  if (i === currentStep) return 'bg-brand-100 text-brand-700 border-2 border-brand-600';
  return 'bg-gray-100 text-gray-400';
}

function toggleArrayValue<T>(arr: T[], value: T, add: boolean): T[] {
  if (add) return [...arr, value];
  return arr.filter((v) => v !== value);
}
export default function OnboardingPage(): React.ReactElement {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      sportsOffered: [],
      certifications: [],
      facilities: [],
      sessionTypes: [],
      availableDays: [],
      idProofUrls: [],
      profilePhotoUrls: [],
      weekendPricingDiff: false,
      cancellationAllowed: false,
      acceptsCash: false,
      termsAccepted: false as unknown as true,
    },
  });

  const partnerType = watch('partnerType');

  const goNext = async (): Promise<void> => {
    const fields = STEP_FIELDS[step];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = (): void => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = async (data: OnboardingInput): Promise<void> => {
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? 'Failed to submit application');
      }
      const result = await res.json();
      router.push(`/onboarding/success?id=${encodeURIComponent(result.application.id)}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {/* Step indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepIndicatorClass(i, step)}`}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs text-gray-500 mt-1 text-center hidden sm:block">{label}</span>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-brand-600 h-1.5 rounded-full transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 0: Basic Details */}
        {step === 0 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Details</h2>
            <div className="space-y-4">
              <Select
                label="Partner Type"
                options={partnerOptions}
                placeholder="Select partner type"
                error={errors.partnerType?.message}
                {...register('partnerType')}
              />
              <Input
                label="Business / Individual Name"
                error={errors.businessName?.message}
                {...register('businessName')}
              />
              <Input
                label="Contact Person"
                error={errors.contactPerson?.message}
                {...register('contactPerson')}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  error={errors.phone?.message}
                  {...register('phone')}
                />
                <Input
                  label="Email ID"
                  type="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
              </div>
              <Select
                label="City"
                options={cityOptions}
                placeholder="Select city"
                error={errors.city?.message}
                {...register('city')}
              />
              <Textarea
                label="Full Address"
                error={errors.fullAddress?.message}
                {...register('fullAddress')}
              />
              <Input
                label="Google Maps Link"
                hint="Optional — paste the link to your location on Google Maps"
                error={errors.googleMapsLink?.message}
                {...register('googleMapsLink')}
              />
            </div>
          </Card>
        )}

        {/* Step 1: Sports & Services */}
        {step === 1 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sports & Services</h2>
            <div className="space-y-4">
              <Controller
                name="sportsOffered"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup label="Sports Offered" error={errors.sportsOffered?.message}>
                    {sportOptions.map((sport) => (
                      <label
                        key={sport.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          checked={field.value?.includes(sport.value as OnboardingInput['sportsOffered'][number]) ?? false}
                          onChange={(e) => {
                            const val = sport.value as OnboardingInput['sportsOffered'][number];
                            field.onChange(toggleArrayValue(field.value ?? [], val, e.target.checked));
                          }}
                        />
                        <span className="text-sm text-gray-700">{sport.label}</span>
                      </label>
                    ))}
                  </CheckboxGroup>
                )}
              />
              <Input
                label="Experience in Years"
                type="number"
                error={errors.experienceYears?.message}
                {...register('experienceYears')}
              />
              <Controller
                name="certifications"
                control={control}
                render={({ field }) => (
                  <TagInput
                    label="Certifications (add file URLs)"
                    value={field.value ?? []}
                    onChange={field.onChange}
                    placeholder="Paste URL and press Enter"
                  />
                )}
              />
              <Textarea
                label="Short Bio"
                placeholder="Describe achievements or USP"
                error={errors.shortBio?.message}
                {...register('shortBio')}
              />
            </div>
          </Card>
        )}

        {/* Step 2: Facility / Training Details */}
        {step === 2 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {partnerType === 'COACH' ? 'Training Details' : 'Facility Details'}
            </h2>
            <div className="space-y-4">
              {partnerType !== 'COACH' && (
                <>
                  <Input
                    label="Number of Courts"
                    type="number"
                    error={errors.numberOfCourts?.message}
                    {...register('numberOfCourts')}
                  />
                  <Select
                    label="Surface Type"
                    options={surfaceOptions}
                    placeholder="Select surface type"
                    error={errors.surfaceType?.message}
                    {...register('surfaceType')}
                  />
                  <Controller
                    name="facilities"
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup label="Available Facilities">
                        {FACILITY_OPTIONS.map((facility) => (
                          <label
                            key={facility}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                              checked={field.value?.includes(facility) ?? false}
                              onChange={(e) => {
                                field.onChange(toggleArrayValue(field.value ?? [], facility, e.target.checked));
                              }}
                            />
                            <span className="text-sm text-gray-700">{facility}</span>
                          </label>
                        ))}
                      </CheckboxGroup>
                    )}
                  />
                </>
              )}

              {partnerType === 'COACH' && (
                <>
                  <Controller
                    name="sessionTypes"
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup label="Session Types">
                        {SESSION_TYPE_OPTIONS.map((sessionType) => (
                          <label
                            key={sessionType}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                              checked={field.value?.includes(sessionType) ?? false}
                              onChange={(e) => {
                                field.onChange(toggleArrayValue(field.value ?? [], sessionType, e.target.checked));
                              }}
                            />
                            <span className="text-sm text-gray-700">{sessionType}</span>
                          </label>
                        ))}
                      </CheckboxGroup>
                    )}
                  />
                  <Input
                    label="Max Students per Session"
                    type="number"
                    error={errors.maxStudents?.message}
                    {...register('maxStudents')}
                  />
                </>
              )}

              {partnerType === 'ACADEMY' && (
                <>
                  <Input
                    label="Number of Courts"
                    type="number"
                    error={errors.numberOfCourts?.message}
                    {...register('numberOfCourts')}
                  />
                  <Controller
                    name="sessionTypes"
                    control={control}
                    render={({ field }) => (
                      <CheckboxGroup label="Session Types Offered">
                        {SESSION_TYPE_OPTIONS.map((sessionType) => (
                          <label
                            key={sessionType}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                              checked={field.value?.includes(sessionType) ?? false}
                              onChange={(e) => {
                                field.onChange(toggleArrayValue(field.value ?? [], sessionType, e.target.checked));
                              }}
                            />
                            <span className="text-sm text-gray-700">{sessionType}</span>
                          </label>
                        ))}
                      </CheckboxGroup>
                    )}
                  />
                  <Input
                    label="Max Students per Session"
                    type="number"
                    error={errors.maxStudents?.message}
                    {...register('maxStudents')}
                  />
                </>
              )}
            </div>
          </Card>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
            <div className="space-y-4">
              <Controller
                name="availableDays"
                control={control}
                render={({ field }) => (
                  <CheckboxGroup label="Available Days" error={errors.availableDays?.message}>
                    {dayOptions.map((day) => (
                      <label
                        key={day.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                          checked={field.value?.includes(day.value as OnboardingInput['availableDays'][number]) ?? false}
                          onChange={(e) => {
                            const val = day.value as OnboardingInput['availableDays'][number];
                            field.onChange(toggleArrayValue(field.value ?? [], val, e.target.checked));
                          }}
                        />
                        <span className="text-sm text-gray-700">{day.label}</span>
                      </label>
                    ))}
                  </CheckboxGroup>
                )}
              />
              <Input
                label="Operating Hours"
                placeholder="e.g. 6 AM - 10 PM"
                error={errors.operatingHours?.message}
                {...register('operatingHours')}
              />
              <Select
                label="Slot Duration"
                options={slotDurationOptions}
                placeholder="Select slot duration"
                error={errors.slotDuration?.message}
                {...register('slotDuration')}
              />
            </div>
          </Card>
        )}

        {/* Step 4: Pricing */}
        {step === 4 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
            <div className="space-y-4">
              <Input
                label="Price per Session / Slot (INR)"
                type="number"
                step="0.01"
                error={errors.pricePerSlot?.message}
                {...register('pricePerSlot')}
              />
              <fieldset className="space-y-3">
                <legend className="block text-sm font-medium text-gray-700">
                  Weekend Pricing Different?
                </legend>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                      value="true"
                      {...register('weekendPricingDiff', {
                        setValueAs: (v: string) => v === 'true',
                      })}
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                      value="false"
                      defaultChecked
                      {...register('weekendPricingDiff', {
                        setValueAs: (v: string) => v === 'true',
                      })}
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </fieldset>
              <fieldset className="space-y-3">
                <legend className="block text-sm font-medium text-gray-700">
                  Cancellation Allowed?
                </legend>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                      value="true"
                      {...register('cancellationAllowed', {
                        setValueAs: (v: string) => v === 'true',
                      })}
                    />
                    <span className="text-sm text-gray-700">Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                      value="false"
                      defaultChecked
                      {...register('cancellationAllowed', {
                        setValueAs: (v: string) => v === 'true',
                      })}
                    />
                    <span className="text-sm text-gray-700">No</span>
                  </label>
                </div>
              </fieldset>
            </div>
          </Card>
        )}

        {/* Step 5: Payment & Legal */}
        {step === 5 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment & Legal</h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  {...register('acceptsCash')}
                />
                <span className="text-sm text-gray-700">Accepts Cash Payments</span>
              </label>
              <Input
                label="Bank Account Name"
                error={errors.bankAccountName?.message}
                {...register('bankAccountName')}
              />
              <Input
                label="Account Number"
                error={errors.bankAccountNumber?.message}
                {...register('bankAccountNumber')}
              />
              <Input
                label="IFSC Code"
                error={errors.ifscCode?.message}
                {...register('ifscCode')}
              />
              <Input
                label="GST Number (Optional)"
                error={errors.gstNumber?.message}
                {...register('gstNumber')}
              />
              <Controller
                name="idProofUrls"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    label="Upload ID Proof"
                    value={field.value ?? []}
                    onChange={field.onChange}
                    type="document"
                    accept=".pdf,.jpg,.jpeg,.png,image/*"
                    maxFiles={3}
                    hint="Upload ID proof documents. Use 'Scan Document' for scanner-quality capture."
                    enableCamera
                  />
                )}
              />
              <Controller
                name="profilePhotoUrls"
                control={control}
                render={({ field }) => (
                  <FileUpload
                    label="Venue / Profile Photos"
                    value={field.value ?? []}
                    onChange={field.onChange}
                    type="image"
                    accept="image/*"
                    maxFiles={5}
                    hint="Upload photos of your venue or profile (max 5)"
                    enableCamera
                  />
                )}
              />
            </div>
          </Card>
        )}

        {/* Step 6: Agreement */}
        {step === 6 && (
          <Card variant="bordered">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Agreement</h2>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600 leading-relaxed">
                By checking the box below, you confirm that you have read and agree to partner with
                FieldUp and follow the platform&apos;s booking and commission policies. All information
                provided in this application is accurate and complete to the best of your knowledge.
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  {...register('termsAccepted')}
                />
                <span className="text-sm text-gray-700">
                  I agree to partner with FieldUp and follow platform booking and commission policies.
                </span>
              </label>
              {errors.termsAccepted && (
                <p className="text-sm text-red-600" role="alert">
                  {errors.termsAccepted.message}
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Navigation buttons */}
        {submitError && (
          <p className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg p-3" role="alert">
            {submitError}
          </p>
        )}
        <div className="flex justify-between mt-6">
          <Button
            type="button"
            variant="secondary"
            onClick={goBack}
            disabled={step === 0}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={goNext}>
              Next
            </Button>
          ) : (
            <Button type="submit" isLoading={isSubmitting}>
              Submit Application
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
