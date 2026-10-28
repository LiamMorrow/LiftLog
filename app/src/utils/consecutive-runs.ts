export function consecutiveRuns<T>(items: readonly T[], sameRun: (previous: T, next: T) => boolean): T[][] {
  const runs: T[][] = [];
  for (const item of items) {
    const current = runs.at(-1);
    if (current && sameRun(current.at(-1)!, item)) {
      current.push(item);
    } else {
      runs.push([item]);
    }
  }
  return runs;
}
