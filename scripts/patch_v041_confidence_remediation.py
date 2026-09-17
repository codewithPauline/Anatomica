from pathlib import Path

path = Path('src/main.js')
text = path.read_text()

replacements = []

replacements.append((
"import { buildConfidenceCalibration, confidenceFeedback, confidenceLabel } from './learning/confidenceCalibration.js';\n",
"import { buildConfidenceCalibration, confidenceFeedback, confidenceLabel } from './learning/confidenceCalibration.js';\nimport { buildConfidenceRemediationPriorities, buildConfidenceRemediationSession, confidenceRemediationSummary } from './learning/confidenceRemediation.js';\n",
))

replacements.append((
"import './style.css';\n",
"import './style.css';\nimport './confidenceRemediation.css';\n",
))

replacements.append((
"          <div id=\"mastery-confidence-bands\" class=\"mastery-confidence-bands\"></div>\n        </div>\n\n        <div class=\"mastery-section\">\n          <span class=\"section-label\">Recent session accuracy</span>",
"          <div id=\"mastery-confidence-bands\" class=\"mastery-confidence-bands\"></div>\n        </div>\n\n        <div class=\"mastery-section confidence-remediation-panel\">\n          <div class=\"confidence-remediation-head\">\n            <div>\n              <span class=\"section-label\">Confidence-aware remediation</span>\n              <strong>Priority review queue</strong>\n            </div>\n            <span class=\"status-pill\">Latest response</span>\n          </div>\n          <p id=\"mastery-confidence-remediation-summary\" class=\"confidence-remediation-summary\">No confidence-aware remediation is currently needed.</p>\n          <div id=\"mastery-confidence-remediation-list\" class=\"confidence-remediation-list\"></div>\n          <button id=\"mastery-confidence-remediation-btn\" class=\"tool full confidence-remediation-button\" type=\"button\" disabled>Priority queue clear</button>\n        </div>\n\n        <div class=\"mastery-section\">\n          <span class=\"section-label\">Recent session accuracy</span>",
))

replacements.append((
"  const confidence = buildConfidenceCalibration(learnerProgress);\n\n  document.querySelector('#mastery-total-sessions')",
"  const confidence = buildConfidenceCalibration(learnerProgress);\n  const confidencePriorities = buildConfidenceRemediationPriorities(learnerProgress, localizationChallenges);\n\n  document.querySelector('#mastery-total-sessions')",
))

replacements.append((
"  document.querySelector('#mastery-confidence-bands').innerHTML = confidence.bands.map((band) => {\n    const percent = band.accuracy == null ? null : Math.round(band.accuracy * 100);\n    return `<div><span>${band.label}</span><b>${band.attempts ? `${band.correct}/${band.attempts}` : 'No data'}</b><em>${percent == null ? '—' : `${percent}%`}</em></div>`;\n  }).join('');\n\n  const momentum = dashboard.momentum;",
"  document.querySelector('#mastery-confidence-bands').innerHTML = confidence.bands.map((band) => {\n    const percent = band.accuracy == null ? null : Math.round(band.accuracy * 100);\n    return `<div><span>${band.label}</span><b>${band.attempts ? `${band.correct}/${band.attempts}` : 'No data'}</b><em>${percent == null ? '—' : `${percent}%`}</em></div>`;\n  }).join('');\n  document.querySelector('#mastery-confidence-remediation-summary').textContent = confidenceRemediationSummary(confidencePriorities);\n  document.querySelector('#mastery-confidence-remediation-list').innerHTML = confidencePriorities.length\n    ? confidencePriorities.map((item) => {\n        const nerve = nerveDeficitById(item.nerveId);\n        const level = lesionLevelById(nerve, item.levelId);\n        return `<button type=\"button\" class=\"confidence-remediation-item ${item.priority}\" data-remediate-nerve=\"${item.nerveId}\" data-remediate-level=\"${item.levelId}\"><b>${nerve?.name ?? item.nerveId} · ${level?.label ?? item.levelId}</b><em>${item.label}</em><span>${item.reason}</span></button>`;\n      }).join('')\n    : '<p class=\"mastery-empty\">Nothing is currently flagged by the learner\'s latest confidence-rated responses.</p>';\n  const confidenceRemediationButton = document.querySelector('#mastery-confidence-remediation-btn');\n  confidenceRemediationButton.disabled = confidencePriorities.length === 0;\n  confidenceRemediationButton.textContent = confidencePriorities.length\n    ? `Practice ${confidencePriorities.length} priority concept${confidencePriorities.length === 1 ? '' : 's'}`\n    : 'Priority queue clear';\n\n  const momentum = dashboard.momentum;",
))

replacements.append((
"function launchTargetedRemediation(nerveId, levelId) {",
"function launchConfidenceRemediation() {\n  const pool = buildConfidenceRemediationSession(learnerProgress, localizationChallenges);\n  if (!pool.length) return;\n\n  remediationFocus = null;\n  deactivateStudyModes('localization-challenge');\n  masteryDashboardMode = false;\n  document.querySelector('#mastery-dashboard-btn').classList.remove('active');\n  document.querySelector('#mastery-dashboard-card').hidden = true;\n  localizationChallengeMode = true;\n  document.querySelector('#localization-challenge-btn').classList.add('active');\n  document.querySelector('#localization-challenge-card').hidden = false;\n  startLocalizationChallengeSession('confidence-review');\n}\n\nfunction launchTargetedRemediation(nerveId, levelId) {",
))

replacements.append((
"function challengeDifficultyLabel(value) {\n  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';\n}",
"function challengeDifficultyLabel(value) {\n  if (value === 'confidence-review') return 'Priority remediation';\n  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';\n}",
))

replacements.append((
"  if (difficulty === 'review') {\n    const due = challengeProgressSummary().reviewQueue.length;",
"  if (difficulty === 'confidence-review') {\n    const count = buildConfidenceRemediationSession(learnerProgress, localizationChallenges).length;\n    return count\n      ? `Confidence-aware remediation · ${count} concept${count === 1 ? '' : 's'} ordered by the latest unresolved confidence signal.`\n      : 'No confidence-aware remediation is currently needed.';\n  }\n  if (difficulty === 'review') {\n    const due = challengeProgressSummary().reviewQueue.length;",
))

replacements.append((
"  if (difficulty === 'review') pool = reviewChallengePool();\n  else if (difficulty === 'remediation' && remediationFocus) {",
"  if (difficulty === 'review') pool = reviewChallengePool();\n  else if (difficulty === 'confidence-review') pool = buildConfidenceRemediationSession(learnerProgress, localizationChallenges);\n  else if (difficulty === 'remediation' && remediationFocus) {",
))

replacements.append((
"  localizationChallengeSessionIds = difficulty === 'remediation'\n    ? pool.map((challenge) => challenge.id)\n    : shuffleChallenges(pool).map((challenge) => challenge.id);",
"  localizationChallengeSessionIds = ['remediation', 'confidence-review'].includes(difficulty)\n    ? pool.map((challenge) => challenge.id)\n    : shuffleChallenges(pool).map((challenge) => challenge.id);",
))

replacements.append((
"    if (localizationChallengeDifficulty === 'remediation') {\n      remediationFocus = null;\n      localizationChallengeDifficulty = 'adaptive';\n    }",
"    if (['remediation', 'confidence-review'].includes(localizationChallengeDifficulty)) {\n      remediationFocus = null;\n      localizationChallengeDifficulty = 'adaptive';\n    }",
))

replacements.append((
"document.querySelector('#mastery-review-btn').addEventListener('click', () => {",
"document.querySelector('#mastery-confidence-remediation-btn').addEventListener('click', launchConfidenceRemediation);\n\ndocument.querySelector('#mastery-review-btn').addEventListener('click', () => {",
))

replacements.append((
"document.querySelector('#challenge-restart').addEventListener('click', () => {\n  startLocalizationChallengeSession(localizationChallengeDifficulty);\n});",
"document.querySelector('#challenge-restart').addEventListener('click', () => {\n  if (localizationChallengeDifficulty === 'confidence-review' && buildConfidenceRemediationSession(learnerProgress, localizationChallenges).length === 0) {\n    startLocalizationChallengeSession('adaptive');\n    return;\n  }\n  startLocalizationChallengeSession(localizationChallengeDifficulty);\n});",
))

for old, new in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Expected exactly one anchor, found {count}: {old[:90]!r}')
    text = text.replace(old, new, 1)

path.write_text(text)
