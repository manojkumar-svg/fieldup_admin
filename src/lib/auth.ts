import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { AuthUser } from '@/types';

export async function auth(): Promise<{ user: AuthUser } | null> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch user profile from the users table for role info
  const { data: profile } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('email', user.email!)
    .single();

  const p = profile as { id: string; email: string; name: string; role: string } | null;

  if (!p) {
    return {
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.name ?? user.email ?? '',
        role: 'SUPER_ADMIN',
      },
    };
  }

  return {
    user: {
      id: p.id,
      email: p.email,
      name: p.name,
      role: p.role,
    },
  };
}

export async function signInWithEmail(email: string, password: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signOutUser(): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.auth.signOut();
}

