'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';

function SuccessContent(): React.ReactElement {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get('id');

  return (
    <Card className="text-center py-12">
      <div className="flex justify-center mb-4">
        <CheckCircle2 className="h-16 w-16 text-brand-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Application Submitted!
      </h1>
      <p className="text-gray-600 mb-2">
        Thank you for applying to partner with FieldUp. Our team will review
        your application and get back to you shortly.
      </p>
      {applicationId && (
        <p className="text-sm text-gray-500 mb-6">
          Application ID: <span className="font-mono font-medium">{applicationId}</span>
        </p>
      )}
      <Link href="/onboarding">
        <Button variant="secondary">Submit Another Application</Button>
      </Link>
    </Card>
  );
}

export default function OnboardingSuccessPage(): React.ReactElement {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-500">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
