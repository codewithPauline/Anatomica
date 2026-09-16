import assert from 'node:assert/strict';
import { buildMasteryDashboard, masteryCounts, recentSessionTrend, sessionMomentum, weakestPracticedConcepts } from '../src/learning/masteryDashboard.js';

const progress = {
  sessions: [
    { id: 's1', completedAt: '2026-09-10T12:00:00.000Z', mode: 'easy', attempts: 3, correct: 1, accuracy: 1 / 3 },
    { id: 's2', completedAt: '2026-09-11T12:00:00.000Z', mode: 'intermediate', attempts: 4, correct: 2, accuracy: 0.5 },
    { id: 's3', completedAt: '2026-09-12T12:00:00.000Z', mode: 'adaptive', attempts: 5, correct: 3, accuracy: 0.6 },
    { id: 's4', completedAt: '2026-09-13T12:00:00.000Z', mode: 'adaptive', attempts: 5, correct: 4, accuracy: 0.8 },
    { id: 's5', completedAt: '2026-09-14T12:00:00.000Z', mode: 'review', attempts: 3, correct: 3, accuracy: 1 },
    { id: 's6', completedAt: '2026-09-15T12:00:00.000Z', mode: 'advanced', attempts: 3, correct: 3, accuracy: 1 },
  ],
};

const lesions = [
  { key: 'median:carpal-tunnel', nerveName: 'Median nerve', label: 'Carpal tunnel', attempts: 4, correct: 3, accuracy: 0.75, mastery: 'Practicing' },
  { key: 'radial:pin', nerveName: 'Radial nerve', label: 'Posterior interosseous nerve', attempts: 3, correct: 1, accuracy: 1 / 3, mastery: 'Developing' },
  { key: 'ulnar:guyon-canal', nerveName: 'Ulnar nerve', label: 'Guyon canal', attempts: 3, correct: 3, accuracy: 1, mastery: 'Strong' },
  { key: 'axillary:quadrangular-space', nerveName: 'Axillary nerve', label: 'Quadrangular space', attempts: 0, correct: 0, accuracy: null, mastery: 'Unseen' },
];

const summary = {
  sessions: 6,
  attempts: 23,
  correct: 16,
  accuracy: 16 / 23,
  lesions,
  reviewQueue: [{ id: 'radial-pin-finger-drop' }],
};

const trend = recentSessionTrend(progress, 4);
assert.equal(trend.length, 4);
assert.equal(trend[0].id, 's3');
assert.equal(trend.at(-1).accuracy, 1);

assert.deepEqual(masteryCounts(lesions), { Strong: 1, Practicing: 1, Developing: 1, Unseen: 1 });

const weak = weakestPracticedConcepts(lesions, 2);
assert.equal(weak.length, 2);
assert.equal(weak[0].key, 'radial:pin');
assert.equal(weak[1].key, 'median:carpal-tunnel');

const momentum = sessionMomentum(progress, 3);
assert.equal(momentum.direction, 'up');
assert.ok(momentum.delta > 0);

const dashboard = buildMasteryDashboard(progress, summary);
assert.equal(dashboard.totalSessions, 6);
assert.equal(dashboard.dueReviewCount, 1);
assert.equal(dashboard.recentSessions.length, 6);
assert.equal(dashboard.masteryCounts.Strong, 1);
assert.equal(dashboard.weakest[0].key, 'radial:pin');
assert.equal(dashboard.momentum.direction, 'up');

console.log('Validated mastery dashboard trend, mastery counts, weakest concepts, and momentum summaries.');
