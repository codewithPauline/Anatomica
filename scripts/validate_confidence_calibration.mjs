import assert from 'node:assert/strict';
import {
  buildConfidenceCalibration,
  confidenceFeedback,
  confidenceLabel,
  confidenceLevels,
  normalizeConfidence,
} from '../src/learning/confidenceCalibration.js';

assert.deepEqual(confidenceLevels.map((item) => item.id), ['low', 'medium', 'high']);
assert.equal(normalizeConfidence('high'), 'high');
assert.equal(normalizeConfidence('unknown'), null);
assert.equal(confidenceLabel('low'), 'Unsure');
assert.equal(confidenceLabel('missing'), 'Unrated');

const progress = {
  sessions: [
    {
      results: [
        { challengeId: 'a', nerveId: 'median', levelId: 'proximal', correct: true, confidence: 'high' },
        { challengeId: 'b', nerveId: 'radial', levelId: 'pin', correct: false, confidence: 'high' },
        { challengeId: 'c', nerveId: 'ulnar', levelId: 'guyon-canal', correct: true, confidence: 'low' },
        { challengeId: 'd', nerveId: 'axillary', levelId: 'surgical-neck', correct: true, confidence: 'medium' },
        { challengeId: 'e', nerveId: 'median', levelId: 'ain', correct: false },
      ],
    },
  ],
};

const summary = buildConfidenceCalibration(progress);
assert.equal(summary.ratedResponses, 4);
assert.equal(summary.highConfidenceMisses, 1);
assert.equal(summary.lowConfidenceCorrect, 1);
assert.equal(summary.highConfidenceAccuracy, 0.5);
assert.match(summary.summary, /high-confidence miss/i);

const low = summary.bands.find((band) => band.id === 'low');
const medium = summary.bands.find((band) => band.id === 'medium');
const high = summary.bands.find((band) => band.id === 'high');
assert.deepEqual({ attempts: low.attempts, correct: low.correct, accuracy: low.accuracy }, { attempts: 1, correct: 1, accuracy: 1 });
assert.deepEqual({ attempts: medium.attempts, correct: medium.correct, accuracy: medium.accuracy }, { attempts: 1, correct: 1, accuracy: 1 });
assert.deepEqual({ attempts: high.attempts, correct: high.correct, accuracy: high.accuracy }, { attempts: 2, correct: 1, accuracy: 0.5 });

assert.match(confidenceFeedback(false, 'high'), /High-confidence miss/);
assert.match(confidenceFeedback(true, 'low'), /Correct, but you were unsure/);
assert.match(confidenceFeedback(true, 'medium'), /moderate confidence/);
assert.match(confidenceFeedback(false, null), /not recorded/);

const empty = buildConfidenceCalibration({ sessions: [] });
assert.equal(empty.ratedResponses, 0);
assert.equal(empty.highConfidenceAccuracy, null);
assert.equal(empty.bands.every((band) => band.attempts === 0), true);

console.log('Validated confidence calibration summaries and feedback semantics.');
