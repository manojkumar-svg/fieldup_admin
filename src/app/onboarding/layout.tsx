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
        <div className="mx-auto max-w-3xl px-4 py-4 flex items-center gap-3">
          <div className="h-9 overflow-hidden">
            <img src="/fulllogo.svg" alt="Field Up" className="h-9 w-auto object-contain" />
          </div>
          <div className="h-5 w-px bg-gray-300" />
          <span className="text-sm font-semibold text-gray-600">Partner Onboarding</span>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
