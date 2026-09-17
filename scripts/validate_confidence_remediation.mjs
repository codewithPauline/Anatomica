import assert from 'node:assert/strict';
import { localizationChallenges } from '../src/data/localizationChallenges.js';
import {
  buildConfidenceRemediationPriorities,
  buildConfidenceRemediationSession,
  confidenceRemediationSummary,
} from '../src/learning/confidenceRemediation.js';

const byId = Object.fromEntries(localizationChallenges.map((item) => [item.id, item]));
const ids = localizationChallenges.slice(0, 4).map((item) => item.id);
assert.equal(ids.length, 4, 'Expected at least four localization challenges.');

const progress = {
  version: 1,
  sessions: [
    {
      completedAt: '2026-09-16T12:00:00.000Z',
      results: [
        { challengeId: ids[0], nerveId: byId[ids[0]].nerveId, levelId: byId[ids[0]].levelId, correct: false, confidence: 'high' },
        { challengeId: ids[1], nerveId: byId[ids[1]].nerveId, levelId: byId[ids[1]].levelId, correct: false, confidence: 'medium' },
        { challengeId: ids[2], nerveId: byId[ids[2]].nerveId, levelId: byId[ids[2]].levelId, correct: true, confidence: 'low' },
        { challengeId: ids[3], nerveId: byId[ids[3]].nerveId, levelId: byId[ids[3]].levelId, correct: true, confidence: 'high' },
      ],
    },
  ],
};

let priorities = buildConfidenceRemediationPriorities(progress, localizationChallenges);
assert.equal(priorities.length, 3);
assert.equal(priorities[0].challengeId, ids[0]);
assert.equal(priorities[0].priority, 'urgent');
assert.equal(priorities[1].challengeId, ids[1]);
assert.equal(priorities[1].priority, 'review');
assert.equal(priorities[2].challengeId, ids[2]);
assert.equal(priorities[2].priority, 'reinforce');
assert.ok(confidenceRemediationSummary(priorities).includes('high-confidence'));

const resolved = structuredClone(progress);
resolved.sessions.push({
  completedAt: '2026-09-17T12:00:00.000Z',
  results: [
    { challengeId: ids[0], nerveId: byId[ids[0]].nerveId, levelId: byId[ids[0]].levelId, correct: true, confidence: 'high' },
  ],
});
priorities = buildConfidenceRemediationPriorities(resolved, localizationChallenges);
assert.ok(!priorities.some((item) => item.challengeId === ids[0]), 'A later confident correct answer should clear the prior high-confidence miss.');

const session = buildConfidenceRemediationSession(progress, localizationChallenges, { maxCases: 2 });
assert.equal(session.length, 2);
assert.equal(session[0].id, ids[0]);
assert.equal(session[1].id, ids[1]);
assert.equal(new Set(session.map((item) => item.id)).size, session.length);

assert.equal(buildConfidenceRemediationPriorities({ sessions: [] }, localizationChallenges).length, 0);
assert.ok(confidenceRemediationSummary([]).includes('No confidence-aware remediation'));

console.log('Validated confidence-aware remediation priorities, resolution behavior, and session construction.');
