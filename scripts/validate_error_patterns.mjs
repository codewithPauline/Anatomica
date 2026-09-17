import assert from 'node:assert/strict';
import { localizationChallenges } from '../src/data/localizationChallenges.js';
import { buildConfusionDrill, buildErrorPatterns, errorPatternSummary } from '../src/learning/errorPatterns.js';

const groove = localizationChallenges.find((item) => item.id === 'radial-groove-fracture');
const pin = localizationChallenges.find((item) => item.id === 'radial-pin-finger-drop');
const cubital = localizationChallenges.find((item) => item.id === 'ulnar-cubital-tunnel');
const guyon = localizationChallenges.find((item) => item.id === 'ulnar-guyon-canal');
assert.ok(groove && pin && cubital && guyon, 'Expected localization concepts for confusion testing.');

const progress = {
  sessions: [
    {
      completedAt: '2026-09-15T12:00:00.000Z',
      results: [
        {
          challengeId: groove.id,
          nerveId: groove.nerveId,
          levelId: groove.levelId,
          correct: false,
          confidence: 'high',
          selectedNerveId: pin.nerveId,
          selectedLevelId: pin.levelId,
        },
        {
          challengeId: cubital.id,
          nerveId: cubital.nerveId,
          levelId: cubital.levelId,
          correct: false,
          confidence: 'medium',
          selectedNerveId: guyon.nerveId,
          selectedLevelId: guyon.levelId,
        },
      ],
    },
    {
      completedAt: '2026-09-16T12:00:00.000Z',
      results: [
        {
          challengeId: pin.id,
          nerveId: pin.nerveId,
          levelId: pin.levelId,
          correct: false,
          confidence: 'medium',
          selectedNerveId: groove.nerveId,
          selectedLevelId: groove.levelId,
        },
        {
          challengeId: guyon.id,
          nerveId: guyon.nerveId,
          levelId: guyon.levelId,
          correct: true,
          confidence: 'high',
          selectedNerveId: guyon.nerveId,
          selectedLevelId: guyon.levelId,
        },
        {
          challengeId: groove.id,
          nerveId: groove.nerveId,
          levelId: groove.levelId,
          correct: false,
          confidence: 'low',
        },
      ],
    },
  ],
};

const patterns = buildErrorPatterns(progress, localizationChallenges);
assert.equal(patterns.length, 2, 'Expected two valid confusion pairs.');

const radialPair = patterns.find((pattern) => pattern.challengeIds.includes(groove.id) && pattern.challengeIds.includes(pin.id));
assert.ok(radialPair, 'Expected radial groove/PIN confusion pair.');
assert.equal(radialPair.count, 2, 'Reverse-direction errors should aggregate into one pair.');
assert.equal(radialPair.highConfidenceMisses, 1);
assert.equal(radialPair.recurrent, true);
assert.equal(Object.keys(radialPair.directions).length, 2, 'Both confusion directions should be retained.');

const ulnarPair = patterns.find((pattern) => pattern.challengeIds.includes(cubital.id) && pattern.challengeIds.includes(guyon.id));
assert.ok(ulnarPair);
assert.equal(ulnarPair.count, 1);
assert.equal(ulnarPair.recurrent, false);

const drill = buildConfusionDrill(localizationChallenges, radialPair);
assert.equal(drill.length, 2);
assert.deepEqual(new Set(drill.map((item) => item.id)), new Set([groove.id, pin.id]));
assert.match(errorPatternSummary(patterns), /recurring confusion pair/);
assert.equal(buildErrorPatterns({ sessions: [] }, localizationChallenges).length, 0);
assert.equal(buildConfusionDrill(localizationChallenges, null).length, 0);

console.log('Validated answer-confusion aggregation, reverse-direction pairing, recurrence detection, and confusion-drill construction.');
