export function buildRemediationSession(challenges = [], nerveId, levelId, options = {}) {
  const maxCases = Math.max(1, Number(options.maxCases ?? 3));
  const sameNerve = challenges.filter((challenge) => challenge?.nerveId === nerveId);
  const target = sameNerve.find((challenge) => challenge?.levelId === levelId);
  if (!target) return [];

  const siblings = sameNerve.filter((challenge) => challenge.id !== target.id);
  return [target, ...siblings].slice(0, maxCases);
}

export function remediationFocusLabel(nerveProfiles = [], nerveId, levelId) {
  const nerve = nerveProfiles.find((item) => item?.id === nerveId);
  const level = nerve?.lesionLevels?.find((item) => item?.id === levelId);
  return {
    nerveName: nerve?.name ?? nerveId ?? 'Nerve',
    levelLabel: level?.label ?? levelId ?? 'lesion level',
  };
}
