import assert from 'node:assert/strict';
import { localizationChallenges } from '../src/data/localizationChallenges.js';
import {
  challengeVariants,
  challengeVariantPresentations,
  localizationChallengePresentation,
  randomChallengeVariantIndex,
} from '../src/data/challengeVariants.js';

const requiredText = ['title', 'stem', 'explanation'];
const challengeIds = new Set(localizationChallenges.map((challenge) => challenge.id));

for (const [challengeId, variants] of Object.entries(challengeVariants)) {
  assert.ok(challengeIds.has(challengeId), `Variant group references unknown challenge: ${challengeId}`);
  assert.ok(Array.isArray(variants) && variants.length >= 1, `${challengeId} needs at least one alternate variant`);

  const seenVariantIds = new Set();
  for (const variant of variants) {
    assert.equal(typeof variant.variantId, 'string', `${challengeId} variant needs a variantId`);
    assert.ok(variant.variantId.trim(), `${challengeId} has an empty variantId`);
    assert.ok(!seenVariantIds.has(variant.variantId), `${challengeId} duplicates variantId ${variant.variantId}`);
    seenVariantIds.add(variant.variantId);

    for (const field of requiredText) {
      assert.equal(typeof variant[field], 'string', `${challengeId}/${variant.variantId} missing ${field}`);
      assert.ok(variant[field].trim(), `${challengeId}/${variant.variantId} has empty ${field}`);
    }
    assert.ok(Array.isArray(variant.findings) && variant.findings.length >= 3, `${challengeId}/${variant.variantId} needs at least 3 findings`);
    assert.ok(variant.findings.every((finding) => typeof finding === 'string' && finding.trim()), `${challengeId}/${variant.variantId} has an invalid finding`);
  }
}

for (const challenge of localizationChallenges) {
  assert.ok(challengeVariants[challenge.id]?.length >= 1, `${challenge.id} has no alternate vignette`);

  const presentations = challengeVariantPresentations(challenge);
  assert.ok(presentations.length >= 2, `${challenge.id} should have base + alternate presentations`);
  for (const presentation of presentations) {
    assert.equal(presentation.id, challenge.id, `${challenge.id} presentation changed the base challenge ID`);
    assert.equal(presentation.baseChallengeId, challenge.id, `${challenge.id} presentation lost baseChallengeId`);
    assert.equal(presentation.nerveId, challenge.nerveId, `${challenge.id} presentation changed nerveId`);
    assert.equal(presentation.levelId, challenge.levelId, `${challenge.id} presentation changed levelId`);
    assert.equal(presentation.difficulty, challenge.difficulty, `${challenge.id} presentation changed difficulty`);
  }

  assert.equal(localizationChallengePresentation(challenge, 0)?.variantId, 'base');
  assert.equal(localizationChallengePresentation(challenge, 999)?.variantId, presentations.at(-1)?.variantId);
  assert.equal(randomChallengeVariantIndex(challenge, () => 0), 0);
  assert.equal(randomChallengeVariantIndex(challenge, () => 0.999999), presentations.length - 1);
}

console.log(`Validated ${localizationChallenges.length} localization concepts with ${localizationChallenges.reduce((sum, challenge) => sum + challengeVariantPresentations(challenge).length, 0)} total vignette presentations.`);
