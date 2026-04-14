const diacriticRegex = /[\u0300-\u036f]/g;

export function normalizeFuzzyText(value: string) {
  return value
    .normalize('NFD')
    .replace(diacriticRegex, '')
    .toLowerCase()
    .trim();
}

export function fuzzyMatchScore(query: string, candidate: string) {
  const normalizedQuery = normalizeFuzzyText(query);
  const normalizedCandidate = normalizeFuzzyText(candidate);

  if (!normalizedQuery) {
    return null;
  }

  let queryIndex = 0;
  let firstMatch = -1;
  let lastMatch = -1;
  let gapCount = 0;

  for (
    let candidateIndex = 0;
    candidateIndex < normalizedCandidate.length &&
    queryIndex < normalizedQuery.length;
    candidateIndex++
  ) {
    if (normalizedCandidate[candidateIndex] !== normalizedQuery[queryIndex]) {
      continue;
    }

    if (firstMatch === -1) {
      firstMatch = candidateIndex;
    }
    if (lastMatch !== -1) {
      gapCount += candidateIndex - lastMatch - 1;
    }
    lastMatch = candidateIndex;
    queryIndex++;
  }

  if (queryIndex !== normalizedQuery.length || firstMatch === -1 || lastMatch === -1) {
    return null;
  }

  const span = lastMatch - firstMatch + 1;
  const compactness = normalizedQuery.length / span;
  const coverage = normalizedQuery.length / normalizedCandidate.length;
  const exactBonus = normalizedCandidate === normalizedQuery ? 3 : 0;
  const prefixBonus = normalizedCandidate.startsWith(normalizedQuery) ? 1.5 : 0;

  return exactBonus + prefixBonus + compactness * 5 + coverage * 2 - gapCount * 0.1;
}

