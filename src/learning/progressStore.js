const STORAGE_KEY = 'anatomica.localizationProgress.v1';
const SCHEMA_VERSION = 1;
const MAX_SESSIONS = 40;
const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30];
const CONFIDENCE_LEVELS = new Set(['low', 'medium', 'high']);

export function createEmptyProgress() {
  return {
    version: SCHEMA_VERSION,
    sessions: [],
    nerveStats: {},
    lesionStats: {},
    challengeStats: {},
  };
}

function safeNumber(value, fallback = 0) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function cleanConfidence(value) {
  return CONFIDENCE_LEVELS.has(value) ? value : null;
}

function cleanStat(stat = {}) {
  return {
    attempts: Math.max(0, safeNumber(stat.attempts)),
    correct: Math.max(0, safeNumber(stat.correct)),
    correctStreak: Math.max(0, safeNumber(stat.correctStreak)),
    reviewStage: Math.max(0, Math.min(REVIEW_INTERVALS_DAYS.length - 1, safeNumber(stat.reviewStage))),
    lastAttemptAt: typeof stat.lastAttemptAt === 'string' ? stat.lastAttemptAt : null,
    lastCorrectAt: typeof stat.lastCorrectAt === 'string' ? stat.lastCorrectAt : null,
    dueAt: typeof stat.dueAt === 'string' ? stat.dueAt : null,
  };
}

export function sanitizeProgress(value) {
  if (!value || typeof value !== 'object' || value.version !== SCHEMA_VERSION) {
    return createEmptyProgress();
  }

  const progress = createEmptyProgress();
  progress.sessions = Array.isArray(value.sessions)
    ? value.sessions.slice(-MAX_SESSIONS).filter((session) => session && typeof session === 'object')
    : [];

  for (const [key, stat] of Object.entries(value.nerveStats ?? {})) progress.nerveStats[key] = cleanStat(stat);
  for (const [key, stat] of Object.entries(value.lesionStats ?? {})) progress.lesionStats[key] = cleanStat(stat);
  for (const [key, stat] of Object.entries(value.challengeStats ?? {})) progress.challengeStats[key] = cleanStat(stat);
  return progress;
}

export function loadLearnerProgress(storage = globalThis?.localStorage) {
  if (!storage?.getItem) return createEmptyProgress();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? sanitizeProgress(JSON.parse(raw)) : createEmptyProgress();
  } catch {
    return createEmptyProgress();
  }
}

export function saveLearnerProgress(progress, storage = globalThis?.localStorage) {
  const clean = sanitizeProgress(progress);
  if (!storage?.setItem) return clean;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch {
    // Storage can be unavailable in private/restricted contexts. The session still works in memory.
  }
  return clean;
}

export function clearLearnerProgress(storage = globalThis?.localStorage) {
  if (storage?.removeItem) {
    try { storage.removeItem(STORAGE_KEY); } catch { /* no-op */ }
  }
  return createEmptyProgress();
}

function addDays(isoDate, days) {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function updateStat(stat, correct, completedAt) {
  const next = cleanStat(stat);
  next.attempts += 1;
  next.correct += correct ? 1 : 0;
  next.lastAttemptAt = completedAt;

  if (correct) {
    next.correctStreak += 1;
    next.lastCorrectAt = completedAt;
    next.reviewStage = Math.min(next.reviewStage + 1, REVIEW_INTERVALS_DAYS.length - 1);
  } else {
    next.correctStreak = 0;
    next.reviewStage = 0;
  }

  next.dueAt = addDays(completedAt, REVIEW_INTERVALS_DAYS[next.reviewStage]);
  return next;
}

export function recordLocalizationSession(progress, session) {
  const base = sanitizeProgress(progress);
  const completedAt = session?.completedAt ?? new Date().toISOString();
  const results = Array.isArray(session?.results) ? session.results : [];

  for (const result of results) {
    if (!result?.challengeId || !result?.nerveId || !result?.levelId) continue;
    const correct = Boolean(result.correct);
    const lesionKey = `${result.nerveId}:${result.levelId}`;
    base.nerveStats[result.nerveId] = updateStat(base.nerveStats[result.nerveId], correct, completedAt);
    base.lesionStats[lesionKey] = updateStat(base.lesionStats[lesionKey], correct, completedAt);
    base.challengeStats[result.challengeId] = updateStat(base.challengeStats[result.challengeId], correct, completedAt);
  }

  const correctCount = results.filter((result) => result?.correct).length;
  base.sessions.push({
    id: session?.id ?? `${completedAt}-${Math.random().toString(36).slice(2, 8)}`,
    completedAt,
    mode: session?.mode ?? 'adaptive',
    attempts: results.length,
    correct: correctCount,
    accuracy: results.length ? correctCount / results.length : 0,
    results: results.map((result) => ({
      challengeId: result.challengeId,
      nerveId: result.nerveId,
      levelId: result.levelId,
      correct: Boolean(result.correct),
      confidence: cleanConfidence(result.confidence),
    })),
  });
  base.sessions = base.sessions.slice(-MAX_SESSIONS);
  return base;
}

function statAccuracy(stat) {
  return stat?.attempts ? stat.correct / stat.attempts : null;
}

export function masteryLabel(stat) {
  if (!stat?.attempts) return 'Unseen';
  const accuracy = statAccuracy(stat) ?? 0;
  if (stat.attempts >= 3 && accuracy >= 0.8) return 'Strong';
  if (accuracy >= 0.6) return 'Practicing';
  return 'Developing';
}

export function dueChallengeIds(progress, now = new Date()) {
  const time = now.getTime();
  return Object.entries(sanitizeProgress(progress).challengeStats)
    .filter(([, stat]) => stat.dueAt && new Date(stat.dueAt).getTime() <= time)
    .sort(([, a], [, b]) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
    .map(([challengeId]) => challengeId);
}

export function summarizeLearnerProgress(progress, nerveProfiles = [], challenges = [], now = new Date()) {
  const clean = sanitizeProgress(progress);
  const totalAttempts = clean.sessions.reduce((sum, session) => sum + safeNumber(session.attempts), 0);
  const totalCorrect = clean.sessions.reduce((sum, session) => sum + safeNumber(session.correct), 0);
  const dueIds = dueChallengeIds(clean, now);

  const nerves = nerveProfiles.map((item) => {
    const stat = clean.nerveStats[item.id] ?? cleanStat();
    return {
      id: item.id,
      name: item.name,
      attempts: stat.attempts,
      correct: stat.correct,
      accuracy: statAccuracy(stat),
      mastery: masteryLabel(stat),
    };
  });

  const lesions = [];
  for (const item of nerveProfiles) {
    for (const level of item.lesionLevels ?? []) {
      const key = `${item.id}:${level.id}`;
      const stat = clean.lesionStats[key] ?? cleanStat();
      lesions.push({
        key,
        nerveId: item.id,
        nerveName: item.name,
        levelId: level.id,
        label: level.label,
        attempts: stat.attempts,
        correct: stat.correct,
        accuracy: statAccuracy(stat),
        mastery: masteryLabel(stat),
        dueAt: stat.dueAt,
      });
    }
  }

  const challengeById = Object.fromEntries(challenges.map((challenge) => [challenge.id, challenge]));
  const reviewQueue = dueIds
    .map((id) => challengeById[id])
    .filter(Boolean)
    .map((challenge) => ({
      id: challenge.id,
      title: challenge.title,
      nerveId: challenge.nerveId,
      levelId: challenge.levelId,
    }));

  return {
    sessions: clean.sessions.length,
    attempts: totalAttempts,
    correct: totalCorrect,
    accuracy: totalAttempts ? totalCorrect / totalAttempts : null,
    nerves,
    lesions,
    reviewQueue,
  };
}

export const progressStorageKey = STORAGE_KEY;
