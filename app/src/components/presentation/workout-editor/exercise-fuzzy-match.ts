const diacriticRegex = /[\u0300-\u036f]/g;

function normalizeFuzzyText(value: string) {
  return value
    .normalize('NFD')
    .replace(diacriticRegex, '')
    .toLowerCase()
    .trim();
}

/**
 * Walks the query through the candidate in order, starting at `from`. Returns
 * the first and last matched index and the letters skipped in between.
 */
function matchFrom(query: string, candidate: string, from: number) {
  let queryIndex = 0;
  let lastMatch = -1;
  let gapCount = 0;

  for (
    let candidateIndex = from;
    candidateIndex < candidate.length && queryIndex < query.length;
    candidateIndex++
  ) {
    if (candidate[candidateIndex] !== query[queryIndex]) {
      continue;
    }
    if (lastMatch !== -1) {
      gapCount += candidateIndex - lastMatch - 1;
    }
    lastMatch = candidateIndex;
    queryIndex++;
  }

  return queryIndex === query.length
    ? { firstMatch: from, lastMatch, gapCount }
    : null;
}

export function fuzzyMatchScore(query: string, candidate: string) {
  const normalizedQuery = normalizeFuzzyText(query);
  const normalizedCandidate = normalizeFuzzyText(candidate);

  if (!normalizedQuery) {
    return null;
  }

  // Try every place the first letter appears, not just the first one, so
  // "bench p" scores Barbell Bench Press on "bench", not on the B of "barbell".
  const firstLetter = normalizedQuery.charAt(0);
  let best: number | null = null;
  for (
    let from = normalizedCandidate.indexOf(firstLetter);
    from !== -1;
    from = normalizedCandidate.indexOf(firstLetter, from + 1)
  ) {
    const match = matchFrom(normalizedQuery, normalizedCandidate, from);
    if (!match) {
      break;
    }
    const span = match.lastMatch - match.firstMatch + 1;
    const compactness = normalizedQuery.length / span;
    const coverage = normalizedQuery.length / normalizedCandidate.length;
    const exactBonus = normalizedCandidate === normalizedQuery ? 3 : 0;
    const prefixBonus = match.firstMatch === 0 ? 1.5 : 0;
    const wordStartBonus =
      match.firstMatch === 0 ||
      !/[a-z0-9]/.test(normalizedCandidate.charAt(match.firstMatch - 1))
        ? 1
        : 0;
    // The query typed as one unbroken run ("bench p" in "Bench Press") beats
    // the same letters spread out ("bench p" in "Bench Sprint").
    const contiguousBonus = span === normalizedQuery.length ? 2 : 0;
    const score =
      exactBonus +
      prefixBonus +
      wordStartBonus +
      contiguousBonus +
      compactness * 5 +
      coverage * 2 -
      match.gapCount * 0.1;
    if (best === null || score > best) {
      best = score;
    }
  }

  return best;
}
