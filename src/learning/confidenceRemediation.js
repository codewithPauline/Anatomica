import { normalizeConfidence } from './confidenceCalibration.js';

const PRIORITY_RANK = {
  urgent: 3,
  review: 2,
  reinforce: 1,
};

function latestResults(progress = {}) {
  const sessions = Array.isArray(progress?.sessions) ? progress.sessions : [];
  const latest = new Map();

  sessions.forEach((session, sessionIndex) => {
    const completedAt = typeof session?.completedAt === 'string' ? session.completedAt : null;
    const results = Array.isArray(session?.results) ? session.results : [];
    results.forEach((result, resultIndex) => {
      if (!result?.challengeId) return;
      latest.set(result.challengeId, {
        ...result,
        confidence: normalizeConfidence(result.confidence),
        completedAt,
        order: sessionIndex * 1000 + resultIndex,
      });
    });
  });

  return latest;
}

function priorityFor(result) {
  if (!result) return null;
  if (!result.correct && result.confidence === 'high') {
    return {
      priority: 'urgent',
      label: 'High-confidence miss',
      reason: 'Recheck the distinguishing clue before confidence hardens around the wrong localization.',
    };
  }
  if (!result.correct) {
    return {
      priority: 'review',
      label: 'Missed localization',
      reason: 'Review the lesion-level distinction and compare it with nearby same-nerve alternatives.',
    };
  }
  if (result.correct && result.confidence === 'low') {
    return {
      priority: 'reinforce',
      label: 'Correct but unsure',
      reason: 'The answer was correct, but another retrieval attempt can strengthen confidence in the rule.',
    };
  }
  return null;
}

export function buildConfidenceRemediationPriorities(progress = {}, challenges = [], options = {}) {
  const limit = Math.max(1, Number(options.limit ?? 5));
  const challengeById = Object.fromEntries(challenges.map((challenge) => [challenge.id, challenge]));
  const latest = latestResults(progress);

  return [...latest.values()]
    .map((result) => {
      const challenge = challengeById[result.challengeId];
      const priority = priorityFor(result);
      if (!challenge || !priority) return null;
      return {
        challengeId: challenge.id,
        nerveId: challenge.nerveId,
        levelId: challenge.levelId,
        title: challenge.title,
        difficulty: challenge.difficulty,
        confidence: result.confidence,
        correct: Boolean(result.correct),
        completedAt: result.completedAt,
        order: result.order,
        ...priority,
        rank: PRIORITY_RANK[priority.priority],
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.rank - a.rank || b.order - a.order)
    .slice(0, limit);
}

export function buildConfidenceRemediationSession(progress = {}, challenges = [], options = {}) {
  const maxCases = Math.max(1, Number(options.maxCases ?? 5));
  const priorities = buildConfidenceRemediationPriorities(progress, challenges, { limit: maxCases });
  const challengeById = Object.fromEntries(challenges.map((challenge) => [challenge.id, challenge]));
  return priorities.map((item) => challengeById[item.challengeId]).filter(Boolean);
}

export function confidenceRemediationSummary(priorities = []) {
  if (!priorities.length) {
    return 'No confidence-aware remediation is currently needed. New misses or unsure correct answers will appear here.';
  }
  const urgent = priorities.filter((item) => item.priority === 'urgent').length;
  const review = priorities.filter((item) => item.priority === 'review').length;
  const reinforce = priorities.filter((item) => item.priority === 'reinforce').length;
  const parts = [];
  if (urgent) parts.push(`${urgent} high-confidence miss${urgent === 1 ? '' : 'es'}`);
  if (review) parts.push(`${review} other miss${review === 1 ? '' : 'es'}`);
  if (reinforce) parts.push(`${reinforce} unsure correct response${reinforce === 1 ? '' : 's'}`);
  return `Priority queue: ${parts.join(' · ')}.`;
}
