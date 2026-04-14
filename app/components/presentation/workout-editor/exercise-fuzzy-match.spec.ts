import { describe, expect, it } from 'vitest';
import { fuzzyMatchScore } from './exercise-fuzzy-match';

describe('fuzzyMatchScore', () => {
  it('matches subsequences even when the letters are not contiguous', () => {
    expect(fuzzyMatchScore('bpr', 'Bench Press Rows')).not.toBeNull();
  });

  it('prefers exact matches over fuzzy ones', () => {
    const exact = fuzzyMatchScore('press', 'press');
    const fuzzy = fuzzyMatchScore('press', 'Bench Press');

    expect(exact).not.toBeNull();
    expect(fuzzy).not.toBeNull();
    expect(exact!).toBeGreaterThan(fuzzy!);
  });

  it('rejects strings that do not contain the query letters in order', () => {
    expect(fuzzyMatchScore('abc', 'cab')).toBeNull();
  });

  it('ignores accents when matching', () => {
    expect(fuzzyMatchScore('epee', 'Épée')).not.toBeNull();
  });
});

