function sessions(progress) {
  return Array.isArray(progress?.sessions) ? progress.sessions : [];
}

function challengeIndex(challenges = []) {
  const byId = new Map();
  const byConcept = new Map();
  for (const challenge of challenges) {
    if (!challenge?.id || !challenge?.nerveId || !challenge?.levelId) continue;
    byId.set(challenge.id, challenge);
    byConcept.set(`${challenge.nerveId}:${challenge.levelId}`, challenge);
  }
  return { byId, byConcept };
}

function pairKey(a, b) {
  return [a, b].sort().join('::');
}

export function buildErrorPatterns(progress, challenges = []) {
  const { byId, byConcept } = challengeIndex(challenges);
  const groups = new Map();

  for (const session of sessions(progress)) {
    const completedAt = typeof session?.completedAt === 'string' ? session.completedAt : null;
    const results = Array.isArray(session?.results) ? session.results : [];

    for (const result of results) {
      if (result?.correct) continue;
      const expected = byId.get(result?.challengeId);
      const selectedKey = result?.selectedNerveId && result?.selectedLevelId
        ? `${result.selectedNerveId}:${result.selectedLevelId}`
        : null;
      const selected = selectedKey ? byConcept.get(selectedKey) : null;
      if (!expected || !selected || expected.id === selected.id) continue;

      const key = pairKey(expected.id, selected.id);
      const existing = groups.get(key) ?? {
        key,
        challengeIds: [expected.id, selected.id].sort(),
        count: 0,
        highConfidenceMisses: 0,
        lastSeenAt: null,
        directions: {},
      };

      existing.count += 1;
      if (result.confidence === 'high') existing.highConfidenceMisses += 1;
      if (!existing.lastSeenAt || (completedAt && completedAt > existing.lastSeenAt)) existing.lastSeenAt = completedAt;
      const directionKey = `${expected.id}->${selected.id}`;
      existing.directions[directionKey] = (existing.directions[directionKey] ?? 0) + 1;
      groups.set(key, existing);
    }
  }

  return [...groups.values()]
    .map((group) => {
      const [firstId, secondId] = group.challengeIds;
      const first = byId.get(firstId);
      const second = byId.get(secondId);
      const primaryDirection = Object.entries(group.directions)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] ?? '';
      const primaryExpectedId = primaryDirection.split('->')[0] || firstId;
      return {
        ...group,
        first,
        second,
        primaryExpectedId,
        recurrent: group.count >= 2,
      };
    })
    .sort((a, b) =>
      Number(b.recurrent) - Number(a.recurrent)
      || b.count - a.count
      || b.highConfidenceMisses - a.highConfidenceMisses
      || String(b.lastSeenAt ?? '').localeCompare(String(a.lastSeenAt ?? ''))
      || a.key.localeCompare(b.key));
}

export function buildConfusionDrill(challenges = [], pattern, options = {}) {
  if (!pattern?.challengeIds?.length) return [];
  const maxCases = Math.max(2, Number(options.maxCases ?? 2));
  const byId = new Map(challenges.map((challenge) => [challenge.id, challenge]));
  const orderedIds = [
    pattern.primaryExpectedId,
    ...pattern.challengeIds.filter((id) => id !== pattern.primaryExpectedId),
  ];
  return orderedIds.map((id) => byId.get(id)).filter(Boolean).slice(0, maxCases);
}

export function errorPatternSummary(patterns = []) {
  if (!patterns.length) return 'No answer-confusion patterns have been recorded yet.';
  const recurrent = patterns.filter((pattern) => pattern.recurrent);
  if (recurrent.length) {
    const top = recurrent[0];
    return `${recurrent.length} recurring confusion pair${recurrent.length === 1 ? '' : 's'} detected. The leading pair has occurred ${top.count} times.`;
  }
  return `${patterns.length} single confusion pair${patterns.length === 1 ? '' : 's'} recorded. Repetition is needed before Anatomica labels a pattern recurring.`;
}
