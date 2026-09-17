import assert from 'node:assert/strict';
import { localizationChallenges } from '../src/data/localizationChallenges.js';
import { nerveDeficits } from '../src/data/nerveDeficits.js';
import {
  clearLearnerProgress,
  createEmptyProgress,
  dueChallengeIds,
  loadLearnerProgress,
  recordLocalizationSession,
  saveLearnerProgress,
  summarizeLearnerProgress,
} from '../src/learning/progressStore.js';

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
}

const storage = new MemoryStorage();
let progress = createEmptyProgress();
assert.equal(progress.version, 1);
assert.equal(progress.sessions.length, 0);

const medianCarpal = localizationChallenges.find((item) => item.nerveId === 'median' && item.levelId === 'carpal-tunnel');
const radialPin = localizationChallenges.find((item) => item.nerveId === 'radial' && item.levelId === 'pin');
assert.ok(medianCarpal, 'Expected a median carpal-tunnel challenge.');
assert.ok(radialPin, 'Expected a radial PIN challenge.');

const completedAt = '2026-09-16T12:00:00.000Z';
progress = recordLocalizationSession(progress, {
  completedAt,
  mode: 'adaptive',
  results: [
    { challengeId: medianCarpal.id, nerveId: medianCarpal.nerveId, levelId: medianCarpal.levelId, correct: false, confidence: 'high' },
    { challengeId: radialPin.id, nerveId: radialPin.nerveId, levelId: radialPin.levelId, correct: true, confidence: 'low' },
  ],
});

assert.equal(progress.sessions.length, 1);
assert.equal(progress.nerveStats.median.attempts, 1);
assert.equal(progress.nerveStats.median.correct, 0);
assert.equal(progress.nerveStats.radial.correct, 1);
assert.equal(progress.lesionStats['median:carpal-tunnel'].attempts, 1);
assert.equal(progress.challengeStats[medianCarpal.id].reviewStage, 0);
assert.equal(progress.challengeStats[radialPin.id].reviewStage, 1);
assert.equal(progress.sessions[0].results[0].confidence, 'high');
assert.equal(progress.sessions[0].results[1].confidence, 'low');

saveLearnerProgress(progress, storage);
const loaded = loadLearnerProgress(storage);
assert.equal(loaded.sessions.length, 1);
assert.equal(loaded.challengeStats[medianCarpal.id].attempts, 1);
assert.equal(loaded.sessions[0].results[0].confidence, 'high');

const nextDay = new Date('2026-09-17T12:00:01.000Z');
const due = dueChallengeIds(loaded, nextDay);
assert.ok(due.includes(medianCarpal.id), 'Missed challenge should be due after one day.');
assert.ok(!due.includes(radialPin.id), 'Correct challenge at stage 1 should not be due after one day.');

const summary = summarizeLearnerProgress(loaded, nerveDeficits, localizationChallenges, nextDay);
assert.equal(summary.sessions, 1);
assert.equal(summary.attempts, 2);
assert.equal(summary.correct, 1);
assert.equal(summary.reviewQueue.length, 1);
assert.equal(summary.reviewQueue[0].id, medianCarpal.id);

const invalidConfidence = recordLocalizationSession(createEmptyProgress(), {
  completedAt,
  results: [
    { challengeId: medianCarpal.id, nerveId: medianCarpal.nerveId, levelId: medianCarpal.levelId, correct: true, confidence: 'certain-ish' },
  ],
});
assert.equal(invalidConfidence.sessions[0].results[0].confidence, null);

const cleared = clearLearnerProgress(storage);
assert.equal(cleared.sessions.length, 0);
assert.equal(loadLearnerProgress(storage).sessions.length, 0);

console.log('Validated browser-local learner progress, confidence persistence, mastery summaries, and spaced-review scheduling.');
