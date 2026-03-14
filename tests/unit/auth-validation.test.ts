import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/lib/validations/auth';

const TEST_PASSWORD = 'ChangeMe123!';
const TEST_SHORT_PASSWORD = '1';

describe('Login Validation', () => {
  it('accepts valid login', () => {
    const result = loginSchema.safeParse({
      email: 'admin@fieldup.com',
      password: TEST_PASSWORD,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = loginSchema.safeParse({
      email: '',
      password: TEST_PASSWORD,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: TEST_PASSWORD,
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@fieldup.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('accepts any non-empty password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@fieldup.com',
      password: TEST_SHORT_PASSWORD,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@fieldup.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});
