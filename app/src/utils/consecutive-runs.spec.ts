import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { consecutiveRuns } from './consecutive-runs';

const same = (a: number, b: number) => a === b;

describe('consecutiveRuns', () => {
  it('returns no runs for no items', () => {
    expect(consecutiveRuns([], same)).toEqual([]);
  });

  it('keeps straight sets as a single run', () => {
    expect(consecutiveRuns([120, 120, 120], same)).toEqual([[120, 120, 120]]);
  });

  it('starts a new run whenever the value changes', () => {
    expect(consecutiveRuns([140, 120, 120, 120], same)).toEqual([[140], [120, 120, 120]]);
  });

  it('does not merge a value that comes back later', () => {
    expect(consecutiveRuns([100, 110, 120, 110, 100], same)).toEqual([[100], [110], [120], [110], [100]]);
  });

  it('flattens back to the original items', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 3 })), (items) => {
        expect(consecutiveRuns(items, same).flat()).toEqual(items);
      }),
    );
  });

  it('never leaves two neighbouring runs that belong together', () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 0, max: 3 })), (items) => {
        const runs = consecutiveRuns(items, same);
        runs.slice(1).forEach((run, index) => {
          expect(same(runs[index]!.at(-1)!, run[0]!)).toBe(false);
        });
      }),
    );
  });
});
