export const confidenceLevels = [
  { id: 'low', label: 'Unsure' },
  { id: 'medium', label: 'Moderate' },
  { id: 'high', label: 'High' },
];

export function normalizeConfidence(value) {
  return confidenceLevels.some((item) => item.id === value) ? value : null;
}

export function confidenceLabel(value) {
  return confidenceLevels.find((item) => item.id === value)?.label ?? 'Unrated';
}

function sessionResults(progress) {
  return (Array.isArray(progress?.sessions) ? progress.sessions : [])
    .flatMap((session) => (Array.isArray(session?.results) ? session.results : []));
}

export function confidenceFeedback(correct, confidence) {
  const level = normalizeConfidence(confidence);
  if (!level) return 'Confidence was not recorded for this response.';
  if (correct && level === 'high') return 'Correct with high confidence. Keep testing the same distinction with alternate presentations.';
  if (!correct && level === 'high') return 'High-confidence miss. Revisit the distinguishing localization clue before the next attempt.';
  if (correct && level === 'low') return 'Correct, but you were unsure. Reinforce the clue so the knowledge becomes more dependable.';
  if (!correct && level === 'low') return 'An uncertain miss. Review the explanation, then compare this lesion with its nearest same-nerve alternative.';
  return correct
    ? 'Correct with moderate confidence. Continued retrieval practice can strengthen certainty.'
    : 'Incorrect with moderate confidence. Use the explanation and 3D reveal to refine the localization rule.';
}

export function buildConfidenceCalibration(progress) {
  const rated = sessionResults(progress)
    .map((result) => ({ ...result, confidence: normalizeConfidence(result?.confidence) }))
    .filter((result) => result.confidence);

  const bands = confidenceLevels.map((level) => {
    const responses = rated.filter((result) => result.confidence === level.id);
    const correct = responses.filter((result) => result.correct).length;
    return {
      id: level.id,
      label: level.label,
      attempts: responses.length,
      correct,
      accuracy: responses.length ? correct / responses.length : null,
    };
  });

  const highConfidenceMisses = rated.filter((result) => result.confidence === 'high' && !result.correct);
  const lowConfidenceCorrect = rated.filter((result) => result.confidence === 'low' && result.correct);
  const highBand = bands.find((band) => band.id === 'high');

  let summary = 'Rate confidence on localization challenges to build a confidence profile.';
  if (rated.length) {
    if (highConfidenceMisses.length) {
      summary = `${highConfidenceMisses.length} high-confidence miss${highConfidenceMisses.length === 1 ? '' : 'es'} recorded. Prioritize those concepts for review.`;
    } else if ((highBand?.attempts ?? 0) >= 3) {
      summary = `No high-confidence misses across ${highBand.attempts} high-confidence response${highBand.attempts === 1 ? '' : 's'}.`;
    } else {
      summary = 'Confidence data are accumulating. More rated responses are needed for a useful pattern.';
    }
  }

  return {
    ratedResponses: rated.length,
    bands,
    highConfidenceMisses: highConfidenceMisses.length,
    lowConfidenceCorrect: lowConfidenceCorrect.length,
    highConfidenceAccuracy: highBand?.accuracy ?? null,
    summary,
  };
}
