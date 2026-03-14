'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trophy } from 'lucide-react';

export default function LoginPage(): React.ReactElement {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput): Promise<void> => {
    setIsLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError('Invalid email or password');
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-gradient-to-br from-brand-50 via-white to-emerald-50 px-4">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="rounded-2xl bg-white/80 backdrop-blur-sm p-7 sm:p-8 shadow-xl shadow-brand-900/5 border border-white/60">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-500/30">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Field Up Admin</h1>
            <p className="mt-1.5 text-sm text-gray-500">Sign in to your account</p>
          </div>

          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-200/80 p-3.5 text-sm text-red-700 flex items-center gap-2 animate-fade-in" role="alert">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm-.75 4a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 6.25a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="admin@fieldup.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign In
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">Powered by Field Up</p>
      </div>
    </div>
  );
}
