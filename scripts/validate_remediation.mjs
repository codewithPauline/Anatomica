import assert from 'node:assert/strict';
import { localizationChallenges } from '../src/data/localizationChallenges.js';
import { nerveDeficits } from '../src/data/nerveDeficits.js';
import { buildRemediationSession, remediationFocusLabel } from '../src/learning/remediation.js';

for (const challenge of localizationChallenges) {
  const session = buildRemediationSession(localizationChallenges, challenge.nerveId, challenge.levelId);
  assert.ok(session.length >= 1, `Expected remediation session for ${challenge.id}`);
  assert.equal(session[0].id, challenge.id, `Target challenge should lead remediation for ${challenge.id}`);
  assert.ok(session.length <= 3, `Remediation session should remain focused for ${challenge.id}`);
  assert.ok(session.every((item) => item.nerveId === challenge.nerveId), `Remediation should stay within ${challenge.nerveId}`);
  assert.equal(new Set(session.map((item) => item.id)).size, session.length, `Remediation session should not duplicate cases for ${challenge.id}`);
}

assert.deepEqual(buildRemediationSession(localizationChallenges, 'missing', 'missing'), []);

const label = remediationFocusLabel(nerveDeficits, 'radial', 'pin');
assert.match(label.nerveName, /radial/i);
assert.ok(label.levelLabel.length > 0);

console.log('Validated targeted remediation sessions across all localization challenge concepts.');
