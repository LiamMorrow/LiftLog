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

  it('prefers prefix matches over fuzzy ones', () => {
    const inner = fuzzyMatchScore('press', 'Bench press');
    const prefix = fuzzyMatchScore('bench', 'Bench Press');

    expect(prefix!).toBeGreaterThan(inner!);
  });

  it('rejects strings that do not contain the query letters in order', () => {
    expect(fuzzyMatchScore('abc', 'cab')).toBeNull();
  });

  it('ignores accents when matching', () => {
    expect(fuzzyMatchScore('epee', 'Épée')).not.toBeNull();
  });

  it('scores a lift on the word the query names, not an earlier stray letter', () => {
    const library = [
      'Barbell Bench Press - Medium Grip',
      'Bench Sprint',
      'Bench Dips',
      'Bench Jump',
      'Flat Bench Leg Pull-In',
    ];
    const ranked = library
      .map((name) => ({ name, score: fuzzyMatchScore('bench p', name)! }))
      .sort((a, b) => b.score - a.score);

    expect(ranked[0]?.name).toBe('Barbell Bench Press - Medium Grip');
  });

  it('ranks a whole-word match above the same letters inside a word', () => {
    expect(fuzzyMatchScore('row', 'Barbell Row')!).toBeGreaterThan(
      fuzzyMatchScore('row', 'Arrows')!,
    );
  });
});
