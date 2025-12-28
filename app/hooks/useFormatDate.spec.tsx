import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { LocalDate } from '@js-joda/core';
import { useFormatDate } from './useFormatDate';
import { useAppSelector } from '@/store';

// Mock the Redux store
vi.mock('@/store', () => ({
  useAppSelector: vi.fn(),
}));

describe('useFormatDate', () => {
  it('should format a date with basic options using default locale', () => {
    vi.mocked(useAppSelector).mockReturnValue('en-US');

    const { result } = renderHook(() => useFormatDate());
    const formatDate = result.current;

    const date = LocalDate.of(2025, 7, 16);
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const formatted = formatDate(date, opts);
    expect(formatted).toContain('2025');
    expect(formatted).toContain('16');
  });

  it('should format a date with weekday option', () => {
    vi.mocked(useAppSelector).mockReturnValue('en-US');

    const { result } = renderHook(() => useFormatDate());
    const formatDate = result.current;

    const date = LocalDate.of(2025, 7, 16);
    const opts: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };

    const formatted = formatDate(date, opts);
    expect(formatted).toContain('2025');
    expect(formatted).toContain('16');
  });

  it('should handle different months correctly', () => {
    vi.mocked(useAppSelector).mockReturnValue('en-US');

    const { result } = renderHook(() => useFormatDate());
    const formatDate = result.current;

    const date = LocalDate.of(2025, 1, 1); // January 1st
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };

    const formatted = formatDate(date, opts);
    expect(formatted).toContain('2025');
    expect(formatted).toContain('1');
  });

  it('should handle leap year dates', () => {
    vi.mocked(useAppSelector).mockReturnValue('en-US');

    const { result } = renderHook(() => useFormatDate());
    const formatDate = result.current;

    const date = LocalDate.of(2024, 2, 29); // Leap year
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };

    const formatted = formatDate(date, opts);
    expect(formatted).toContain('2024');
    expect(formatted).toContain('29');
  });

  it('should respect the locale from Redux state', () => {
    vi.mocked(useAppSelector).mockReturnValue('fr-FR');

    const { result } = renderHook(() => useFormatDate());
    const formatDate = result.current;

    const date = LocalDate.of(2025, 7, 16);
    const opts: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };

    const formatted = formatDate(date, opts);
    // French locale should format differently
    expect(formatted).toContain('2025');
    expect(formatted).toContain('16');
  });

  it('should update when locale changes', () => {
    const mockSelector = vi.mocked(useAppSelector);
    mockSelector.mockReturnValue('en-US');

    const { result, rerender } = renderHook(() => useFormatDate());

    const date = LocalDate.of(2025, 1, 1);
    const opts: Intl.DateTimeFormatOptions = {
      month: 'long',
    };

    const formattedEn = result.current(date, opts);
    expect(formattedEn).toContain('January');

    // Change locale
    mockSelector.mockReturnValue('es-ES');
    rerender();

    const formattedEs = result.current(date, opts);
    expect(formattedEs).toContain('enero');
  });

  it('should format dates with different format options', () => {
    vi.mocked(useAppSelector).mockReturnValue('en-US');

    const { result } = renderHook(() => useFormatDate());
    const formatDate = result.current;

    const date = LocalDate.of(2025, 12, 25);

    // Short format
    const shortFormat = formatDate(date, {
      month: 'short',
      day: 'numeric',
    });
    expect(shortFormat).toContain('Dec');
    expect(shortFormat).toContain('25');

    // Long format
    const longFormat = formatDate(date, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(longFormat).toContain('December');
    expect(longFormat).toContain('25');
    expect(longFormat).toContain('2025');
  });

  it('should handle edge case dates', () => {
    vi.mocked(useAppSelector).mockReturnValue('en-US');

    const { result } = renderHook(() => useFormatDate());
    const formatDate = result.current;

    // First day of year
    const newYear = LocalDate.of(2025, 1, 1);
    const formattedNewYear = formatDate(newYear, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    expect(formattedNewYear).toContain('2025');
    expect(formattedNewYear).toContain('1');

    // Last day of year
    const newYearsEve = LocalDate.of(2025, 12, 31);
    const formattedNewYearsEve = formatDate(newYearsEve, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    expect(formattedNewYearsEve).toContain('2025');
    expect(formattedNewYearsEve).toContain('31');
  });
});
