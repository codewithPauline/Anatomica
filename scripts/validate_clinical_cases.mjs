import { clinicalCases, clinicalCaseKeys } from '../src/data/clinicalCases.js';
import { upperLimbStructures } from '../src/data/upperLimb.js';

const errors = [];
const seenIds = new Set();

for (const caseItem of clinicalCases) {
  if (!caseItem.id) errors.push('Clinical case is missing an id.');
  if (!caseItem.name) errors.push(`${caseItem.id ?? 'unknown'} is missing a name.`);
  if (!caseItem.subtitle) errors.push(`${caseItem.id ?? 'unknown'} is missing a subtitle.`);
  if (!caseItem.mechanism) errors.push(`${caseItem.id ?? 'unknown'} is missing a mechanism.`);
  if (!caseItem.deficit) errors.push(`${caseItem.id ?? 'unknown'} is missing an expected deficit.`);
  if (!caseItem.exam) errors.push(`${caseItem.id ?? 'unknown'} is missing an exam clue.`);
  if (!caseItem.pearl) errors.push(`${caseItem.id ?? 'unknown'} is missing a clinical pearl.`);

  if (seenIds.has(caseItem.id)) errors.push(`Duplicate clinical case id: ${caseItem.id}`);
  seenIds.add(caseItem.id);

  if (!Array.isArray(caseItem.lesionKeys) || caseItem.lesionKeys.length === 0) {
    errors.push(`${caseItem.id} must define at least one lesion/focus key.`);
  }

  for (const key of clinicalCaseKeys(caseItem)) {
    if (!upperLimbStructures[key]) {
      errors.push(`${caseItem.id} references missing upperLimbStructures key: ${key}`);
    }
  }
}

if (errors.length) {
  console.error('Clinical case validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Validated ${clinicalCases.length} clinical cases and all referenced anatomy keys.`);
