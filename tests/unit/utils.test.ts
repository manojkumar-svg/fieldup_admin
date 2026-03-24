import { describe, it, expect } from 'vitest';
import { cn, SPORT_TYPE_LABELS, STATUS_LABELS, ITEMS_PER_PAGE } from '@/lib/utils';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const shouldHide = false;
    expect(cn('base', shouldHide && 'hidden', 'visible')).toBe('base visible');
  });

  it('deduplicates Tailwind conflicts', () => {
    const result = cn('px-4', 'px-6');
    expect(result).toBe('px-6');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });
});

describe('Constants', () => {
  it('has all sport types', () => {
    expect(Object.keys(SPORT_TYPE_LABELS)).toHaveLength(18);
    expect(SPORT_TYPE_LABELS.CRICKET_NET).toBe('Cricket Net');
    expect(SPORT_TYPE_LABELS.FOOTBALL).toBe('Football');
    expect(SPORT_TYPE_LABELS.TABLE_TENNIS).toBe('Table Tennis');
    expect(SPORT_TYPE_LABELS.SNOOKER).toBe('Snooker');
  });

  it('has status labels', () => {
    expect(STATUS_LABELS.ACTIVE).toBe('Active');
    expect(STATUS_LABELS.INACTIVE).toBe('Inactive');
  });

  it('has ITEMS_PER_PAGE constant', () => {
    expect(ITEMS_PER_PAGE).toBe(10);
  });
});
