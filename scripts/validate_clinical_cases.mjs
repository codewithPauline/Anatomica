import { clinicalCases, clinicalCaseKeys } from '../src/data/clinicalCases.js';
import { nerveDeficits, nerveDeficitKeys } from '../src/data/nerveDeficits.js';
import { upperLimbStructures } from '../src/data/upperLimb.js';

const errors = [];
const seenCaseIds = new Set();
const seenNerveIds = new Set();

for (const caseItem of clinicalCases) {
  if (!caseItem.id) errors.push('Clinical case is missing an id.');
  if (!caseItem.name) errors.push(`${caseItem.id ?? 'unknown'} is missing a name.`);
  if (!caseItem.subtitle) errors.push(`${caseItem.id ?? 'unknown'} is missing a subtitle.`);
  if (!caseItem.mechanism) errors.push(`${caseItem.id ?? 'unknown'} is missing a mechanism.`);
  if (!caseItem.deficit) errors.push(`${caseItem.id ?? 'unknown'} is missing an expected deficit.`);
  if (!caseItem.exam) errors.push(`${caseItem.id ?? 'unknown'} is missing an exam clue.`);
  if (!caseItem.pearl) errors.push(`${caseItem.id ?? 'unknown'} is missing a clinical pearl.`);

  if (seenCaseIds.has(caseItem.id)) errors.push(`Duplicate clinical case id: ${caseItem.id}`);
  seenCaseIds.add(caseItem.id);

  if (!Array.isArray(caseItem.lesionKeys) || caseItem.lesionKeys.length === 0) {
    errors.push(`${caseItem.id} must define at least one lesion/focus key.`);
  }

  for (const key of clinicalCaseKeys(caseItem)) {
    if (!upperLimbStructures[key]) {
      errors.push(`${caseItem.id} references missing upperLimbStructures key: ${key}`);
    }
  }
}

for (const item of nerveDeficits) {
  if (!item.id) errors.push('Nerve deficit profile is missing an id.');
  if (!item.name) errors.push(`${item.id ?? 'unknown'} is missing a name.`);
  if (!item.nerveKey) errors.push(`${item.id ?? 'unknown'} is missing a nerve key.`);
  if (!item.roots) errors.push(`${item.id ?? 'unknown'} is missing roots.`);
  if (!item.motorSummary) errors.push(`${item.id ?? 'unknown'} is missing a motor summary.`);
  if (!item.sensorySummary) errors.push(`${item.id ?? 'unknown'} is missing a sensory summary.`);
  if (!item.exam) errors.push(`${item.id ?? 'unknown'} is missing an exam description.`);
  if (!item.lesionSites) errors.push(`${item.id ?? 'unknown'} is missing lesion sites.`);
  if (!item.pearl) errors.push(`${item.id ?? 'unknown'} is missing a clinical pearl.`);
  if (!Array.isArray(item.sensoryRegions) || item.sensoryRegions.length === 0) {
    errors.push(`${item.id ?? 'unknown'} must define at least one schematic sensory region.`);
  }
  if (!Array.isArray(item.motorTests) || item.motorTests.length === 0) {
    errors.push(`${item.id ?? 'unknown'} must define at least one motor test.`);
  }

  if (seenNerveIds.has(item.id)) errors.push(`Duplicate nerve deficit id: ${item.id}`);
  seenNerveIds.add(item.id);

  for (const key of nerveDeficitKeys(item)) {
    if (!upperLimbStructures[key]) {
      errors.push(`${item.id} nerve deficit references missing upperLimbStructures key: ${key}`);
    }
  }

  const seenTestIds = new Set();
  for (const test of item.motorTests ?? []) {
    if (!test.id) errors.push(`${item.id} has a motor test without an id.`);
    if (!test.label) errors.push(`${item.id}/${test.id ?? 'unknown'} is missing a label.`);
    if (!test.instruction) errors.push(`${item.id}/${test.id ?? 'unknown'} is missing an instruction.`);
    if (!test.normal) errors.push(`${item.id}/${test.id ?? 'unknown'} is missing a normal response.`);
    if (!test.deficit) errors.push(`${item.id}/${test.id ?? 'unknown'} is missing a deficit response.`);
    if (!Array.isArray(test.targetKeys) || test.targetKeys.length === 0) {
      errors.push(`${item.id}/${test.id ?? 'unknown'} must define at least one target key.`);
    }
    if (seenTestIds.has(test.id)) errors.push(`Duplicate motor test id in ${item.id}: ${test.id}`);
    seenTestIds.add(test.id);

    for (const key of test.targetKeys ?? []) {
      if (!upperLimbStructures[key]) {
        errors.push(`${item.id}/${test.id ?? 'unknown'} references missing upperLimbStructures key: ${key}`);
      }
      if (!(item.motorKeys ?? []).includes(key)) {
        errors.push(`${item.id}/${test.id ?? 'unknown'} target ${key} is not listed in ${item.id}.motorKeys.`);
      }
    }
  }
}

if (errors.length) {
  console.error('Clinical content validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

const motorTestCount = nerveDeficits.reduce((sum, item) => sum + (item.motorTests?.length ?? 0), 0);
console.log(`Validated ${clinicalCases.length} clinical cases, ${nerveDeficits.length} nerve deficit profiles, ${motorTestCount} motor tests, and all referenced anatomy keys.`);
