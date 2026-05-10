import { describe, it, expect } from 'vitest';
import { formatDate } from './date.utils';

describe('formatDate', () => {
  it('formats a date to YYYY-MM-DD', () => {
    expect(formatDate(new Date('2024-03-15T00:00:00.000Z'))).toBe('2024-03-15');
  });

  it('pads single-digit month and day with zeros', () => {
    expect(formatDate(new Date('2024-01-05T00:00:00.000Z'))).toBe('2024-01-05');
  });

  it('handles end-of-year date', () => {
    expect(formatDate(new Date('2023-12-31T00:00:00.000Z'))).toBe('2023-12-31');
  });

  it('returns a string with exactly 10 characters', () => {
    expect(formatDate(new Date('2025-06-20T00:00:00.000Z'))).toHaveLength(10);
  });
});
