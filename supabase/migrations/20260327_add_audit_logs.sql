-- ============================================================
-- Migration: Create audit_logs table for tracking entity changes
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID,
  "userEmail" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" UUID NOT NULL,
  action TEXT NOT NULL,
  changes JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups by entity
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs ("entityType", "entityId");
-- Index for recent activity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs ("createdAt" DESC);

COMMENT ON TABLE audit_logs IS 'Tracks all create/update/delete/status-change actions across entities';
