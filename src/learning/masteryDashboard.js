function clamp01(value) {
  if (!Number.isFinite(Number(value))) return null;
  return Math.max(0, Math.min(1, Number(value)));
}

function sessionAccuracy(session) {
  const explicit = clamp01(session?.accuracy);
  if (explicit != null) return explicit;
  const attempts = Number(session?.attempts ?? 0);
  const correct = Number(session?.correct ?? 0);
  return attempts > 0 ? clamp01(correct / attempts) : null;
}

export function recentSessionTrend(progress, limit = 6) {
  const sessions = Array.isArray(progress?.sessions) ? progress.sessions : [];
  return sessions
    .slice(-Math.max(1, limit))
    .map((session) => ({
      id: session.id ?? session.completedAt ?? Math.random().toString(36).slice(2),
      completedAt: session.completedAt ?? null,
      mode: session.mode ?? 'session',
      attempts: Number(session.attempts ?? 0),
      correct: Number(session.correct ?? 0),
      accuracy: sessionAccuracy(session),
    }));
}

export function masteryCounts(lesions = []) {
  const counts = { Strong: 0, Practicing: 0, Developing: 0, Unseen: 0 };
  for (const lesion of lesions) {
    const label = counts[lesion?.mastery] == null ? 'Unseen' : lesion.mastery;
    counts[label] += 1;
  }
  return counts;
}

export function weakestPracticedConcepts(lesions = [], limit = 3) {
  return lesions
    .filter((lesion) => Number(lesion?.attempts ?? 0) > 0)
    .map((lesion) => ({
      ...lesion,
      accuracy: clamp01(lesion.accuracy) ?? 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts || a.label.localeCompare(b.label))
    .slice(0, Math.max(1, limit));
}

function averageAccuracy(sessions) {
  const values = sessions.map((session) => session.accuracy).filter((value) => value != null);
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function sessionMomentum(progress, windowSize = 3) {
  const sessions = recentSessionTrend(progress, Math.max(2, windowSize * 2));
  if (sessions.length < 2) return { direction: 'insufficient', delta: null };

  const recent = sessions.slice(-windowSize);
  const previous = sessions.slice(Math.max(0, sessions.length - windowSize * 2), -windowSize);
  const recentMean = averageAccuracy(recent);
  const previousMean = averageAccuracy(previous);

  if (recentMean == null || previousMean == null) return { direction: 'insufficient', delta: null };
  const delta = recentMean - previousMean;
  if (Math.abs(delta) < 0.025) return { direction: 'steady', delta };
  return { direction: delta > 0 ? 'up' : 'down', delta };
}

export function buildMasteryDashboard(progress, summary, options = {}) {
  const recentLimit = options.recentLimit ?? 6;
  const weakLimit = options.weakLimit ?? 3;
  const trend = recentSessionTrend(progress, recentLimit);
  const counts = masteryCounts(summary?.lesions ?? []);
  const weakest = weakestPracticedConcepts(summary?.lesions ?? [], weakLimit);
  const momentum = sessionMomentum(progress, 3);

  return {
    totalSessions: Number(summary?.sessions ?? 0),
    totalAttempts: Number(summary?.attempts ?? 0),
    overallAccuracy: clamp01(summary?.accuracy),
    dueReviewCount: Array.isArray(summary?.reviewQueue) ? summary.reviewQueue.length : 0,
    masteryCounts: counts,
    weakest,
    recentSessions: trend,
    momentum,
    lesions: Array.isArray(summary?.lesions) ? summary.lesions : [],
  };
}
