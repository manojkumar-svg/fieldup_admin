import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  userEmail: string | null;
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, unknown>;
  createdAt: string;
}

export async function createAuditLog(params: {
  userId?: string | null;
  userEmail?: string | null;
  entityType: string;
  entityId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE';
  changes?: Record<string, unknown>;
}): Promise<void> {
  const supabase = createServerSupabaseClient();
  await supabase.from('audit_logs').insert({
    userId: params.userId ?? null,
    userEmail: params.userEmail ?? null,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
    changes: params.changes ?? {},
  });
}

export async function getRecentAuditLogs(limit = 20): Promise<AuditLogEntry[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as AuditLogEntry[];
}

export async function getEntityAuditLogs(entityType: string, entityId: string): Promise<AuditLogEntry[]> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('entityType', entityType)
    .eq('entityId', entityId)
    .order('createdAt', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data ?? []) as AuditLogEntry[];
}
