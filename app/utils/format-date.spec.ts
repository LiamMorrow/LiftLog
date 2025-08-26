import { describe, it, expect } from 'vitest';
import { DayOfWeek, Duration, LocalDate } from '@js-joda/core';
import { formatDate, getDateOnDay, parseDuration } from './format-date';
import { formatDuration } from './format-date';

describe('format-date utilities', () => {
  describe('formatDate', () => {
    it('should format a date with basic options', () => {
      const date = LocalDate.of(2025, 7, 16);
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };

      const result = formatDate(date, opts);
      expect(result).toContain('2025');
      expect(result).toContain('16');
    });

    it('should format a date with weekday option', () => {
      const date = LocalDate.of(2025, 7, 16);
      const opts: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      };

      const result = formatDate(date, opts);
      expect(result).toContain('2025');
      expect(result).toContain('16');
    });

    it('should handle different months correctly', () => {
      const date = LocalDate.of(2025, 1, 1); // January 1st
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      };

      const result = formatDate(date, opts);
      expect(result).toContain('2025');
      expect(result).toContain('1');
    });

    it('should handle leap year dates', () => {
      const date = LocalDate.of(2024, 2, 29); // Leap year
      const opts: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      };

      const result = formatDate(date, opts);
      expect(result).toContain('2024');
      expect(result).toContain('29');
    });
  });

  describe('getDateOnDay', () => {
    it('should return Sunday for DayOfWeek.SUNDAY', () => {
      const result = getDateOnDay(DayOfWeek.SUNDAY);
      expect(result.dayOfWeek()).toBe(DayOfWeek.SUNDAY);
    });

    it('should return Monday for DayOfWeek.MONDAY', () => {
      const result = getDateOnDay(DayOfWeek.MONDAY);
      expect(result.dayOfWeek()).toBe(DayOfWeek.MONDAY);
    });

    it('should return Tuesday for DayOfWeek.TUESDAY', () => {
      const result = getDateOnDay(DayOfWeek.TUESDAY);
      expect(result.dayOfWeek()).toBe(DayOfWeek.TUESDAY);
    });

    it('should return Wednesday for DayOfWeek.WEDNESDAY', () => {
      const result = getDateOnDay(DayOfWeek.WEDNESDAY);
      expect(result.dayOfWeek()).toBe(DayOfWeek.WEDNESDAY);
    });

    it('should return Thursday for DayOfWeek.THURSDAY', () => {
      const result = getDateOnDay(DayOfWeek.THURSDAY);
      expect(result.dayOfWeek()).toBe(DayOfWeek.THURSDAY);
    });

    it('should return Friday for DayOfWeek.FRIDAY', () => {
      const result = getDateOnDay(DayOfWeek.FRIDAY);
      expect(result.dayOfWeek()).toBe(DayOfWeek.FRIDAY);
    });

    it('should return Saturday for DayOfWeek.SATURDAY', () => {
      const result = getDateOnDay(DayOfWeek.SATURDAY);
      expect(result.dayOfWeek()).toBe(DayOfWeek.SATURDAY);
    });
  });

  describe('formatDuration', () => {
    describe('when truncateToMins is true', () => {
      it('should format short durations in minutes', () => {
        const duration = Duration.ofSeconds(30);
        const result = formatDuration(duration, true);
        expect(result).toBe('0 mins');
      });

      it('should format 1 minute duration', () => {
        const duration = Duration.ofMinutes(1);
        const result = formatDuration(duration, true);
        expect(result).toBe('1 mins');
      });

      it('should format 90 minutes duration', () => {
        const duration = Duration.ofMinutes(90);
        const result = formatDuration(duration, true);
        expect(result).toBe('90 mins');
      });

      it('should format hours as minutes when truncateToMins is true', () => {
        const duration = Duration.ofHours(2);
        const result = formatDuration(duration, true);
        expect(result).toBe('120 mins');
      });
    });

    describe('when truncateToMins is false', () => {
      it('should format durations >= 1 hour in hours', () => {
        const duration = Duration.ofHours(2);
        const result = formatDuration(duration, false);
        expect(result).toBe('2 hrs');
      });

      it('should format exactly 1 hour in hours', () => {
        const duration = Duration.ofHours(1);
        const result = formatDuration(duration, false);
        expect(result).toBe('1 hrs');
      });

      it('should format durations >= 1 minute but < 1 hour in minutes', () => {
        const duration = Duration.ofMinutes(45);
        const result = formatDuration(duration, false);
        expect(result).toBe('45 mins');
      });

      it('should format exactly 1 minute in minutes', () => {
        const duration = Duration.ofMinutes(1);
        const result = formatDuration(duration, false);
        expect(result).toBe('1 mins');
      });

      it('should format durations < 1 minute in seconds', () => {
        const duration = Duration.ofSeconds(30);
        const result = formatDuration(duration, false);
        expect(result).toBe('30 secs');
      });

      it('should format sub-second durations in decimal seconds', () => {
        const duration = Duration.ofMillis(500);
        const result = formatDuration(duration, false);
        expect(result).toBe('0.5 secs');
      });

      it('should format very small durations', () => {
        const duration = Duration.ofMillis(100);
        const result = formatDuration(duration, false);
        expect(result).toBe('0.1 secs');
      });
    });

    describe('edge cases', () => {
      it('should handle zero duration', () => {
        const duration = Duration.ofMillis(0);
        const result = formatDuration(duration, false);
        expect(result).toBe('0 secs');
      });

      it('should handle zero duration with truncateToMins', () => {
        const duration = Duration.ofMillis(0);
        const result = formatDuration(duration, true);
        expect(result).toBe('0 mins');
      });
    });
  });

  describe('parseDuration', () => {
    it('should parse a simple duration string', () => {
      const input = '1.02:30:45:123';
      const result = parseDuration(input);

      const expected = Duration.ofDays(1)
        .plusHours(2)
        .plusMinutes(30)
        .plusSeconds(45)
        .plusMillis(123);

      expect(result.equals(expected)).toBe(true);
    });

    it('should parse zero values', () => {
      const input = '0.00:00:00:000';
      const result = parseDuration(input);

      const expected = Duration.ofMillis(0);
      expect(result.equals(expected)).toBe(true);
    });

    it('should parse maximum hours, minutes, seconds', () => {
      const input = '5.23:59:59:999';
      const result = parseDuration(input);

      const expected = Duration.ofDays(5)
        .plusHours(23)
        .plusMinutes(59)
        .plusSeconds(59)
        .plusMillis(999);

      expect(result.equals(expected)).toBe(true);
    });

    it('should parse large day values', () => {
      const input = '365.12:30:45:500';
      const result = parseDuration(input);

      const expected = Duration.ofDays(365)
        .plusHours(12)
        .plusMinutes(30)
        .plusSeconds(45)
        .plusMillis(500);

      expect(result.equals(expected)).toBe(true);
    });

    it('should parse single digit components with leading zeros', () => {
      const input = '7.01:05:09:007';
      const result = parseDuration(input);

      const expected = Duration.ofDays(7)
        .plusHours(1)
        .plusMinutes(5)
        .plusSeconds(9)
        .plusMillis(7);

      expect(result.equals(expected)).toBe(true);
    });

    it('should parse duration without days', () => {
      const input = '02:30:45:123';
      const result = parseDuration(input);

      const expected = Duration.ofHours(2)
        .plusMinutes(30)
        .plusSeconds(45)
        .plusMillis(123);

      expect(result.equals(expected)).toBe(true);
    });

    it('should parse duration without milliseconds', () => {
      const input = '1.02:30:45';
      const result = parseDuration(input);

      const expected = Duration.ofDays(1)
        .plusHours(2)
        .plusMinutes(30)
        .plusSeconds(45);

      expect(result.equals(expected)).toBe(true);
    });

    it('should parse duration without days or milliseconds', () => {
      const input = '02:30:45';
      const result = parseDuration(input);

      const expected = Duration.ofHours(2).plusMinutes(30).plusSeconds(45);

      expect(result.equals(expected)).toBe(true);
    });

    it('should parse duration with zero hours, minutes, seconds (no days/millis)', () => {
      const input = '00:00:00';
      const result = parseDuration(input);

      const expected = Duration.ofMillis(0);
      expect(result.equals(expected)).toBe(true);
    });

    describe('error cases', () => {
      it('should throw error for invalid format - missing required parts', () => {
        const input = '02:30'; // Missing seconds
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: 02:30',
        );
      });

      it('should throw error for invalid format - wrong separators', () => {
        const input = '1-02-30-45-123';
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: 1-02-30-45-123',
        );
      });

      it('should throw error for invalid format - non-numeric values', () => {
        const input = 'a.bb:cc:dd:eee';
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: a.bb:cc:dd:eee',
        );
      });

      it('should throw error for invalid format - wrong number of digits', () => {
        const input = '1.2:30:45:123'; // Hours should be 2 digits
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: 1.2:30:45:123',
        );
      });

      it('should throw error for invalid format - milliseconds not 3 digits', () => {
        const input = '1.02:30:45:12'; // Milliseconds should be 3 digits
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: 1.02:30:45:12',
        );
      });

      it('should throw error for empty string', () => {
        const input = '';
        expect(() => parseDuration(input)).toThrow('Invalid duration format: ');
      });

      it('should throw error for completely wrong format', () => {
        const input = 'not a duration';
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: not a duration',
        );
      });

      it('should throw error for negative values', () => {
        const input = '-1.02:30:45:123';
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: -1.02:30:45:123',
        );
      });

      it('should throw error for single digit hours', () => {
        const input = '2:30:45'; // Hours should be 2 digits
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: 2:30:45',
        );
      });

      it('should throw error for single digit minutes', () => {
        const input = '02:3:45'; // Minutes should be 2 digits
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: 02:3:45',
        );
      });

      it('should throw error for single digit seconds', () => {
        const input = '02:30:5'; // Seconds should be 2 digits
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: 02:30:5',
        );
      });

      it('should throw error for milliseconds with wrong digit count', () => {
        const input = '02:30:45:12'; // Milliseconds should be 3 digits if present
        expect(() => parseDuration(input)).toThrow(
          'Invalid duration format: 02:30:45:12',
        );
      });
    });
  });
});
