import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partner Onboarding | FieldUp',
  description: 'Register as a FieldUp partner — Venue, Coach, or Academy',
};

export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <span className="text-lg font-bold text-gray-900">FieldUp Partner Onboarding</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
