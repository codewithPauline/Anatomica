from pathlib import Path

main_path = Path('src/main.js')
text = main_path.read_text()

replacements = [
    (
        "import { buildRemediationSession, remediationFocusLabel } from './learning/remediation.js';\n",
        "import { buildRemediationSession, remediationFocusLabel } from './learning/remediation.js';\nimport { buildConfidenceCalibration, confidenceFeedback, confidenceLabel } from './learning/confidenceCalibration.js';\n",
    ),
    (
        '<p class="eyebrow">ANATOMICA v0.3</p>',
        '<p class="eyebrow">ANATOMICA v0.4</p>',
    ),
    (
        '''        <div class="challenge-answer-block">\n          <span class="section-label">2 · Choose the lesion level</span>\n          <div id="challenge-level-options" class="branch-list"></div>\n        </div>\n\n        <button id="challenge-submit" class="tool full challenge-submit" type="button" disabled>Submit localization</button>\n''',
        '''        <div class="challenge-answer-block">\n          <span class="section-label">2 · Choose the lesion level</span>\n          <div id="challenge-level-options" class="branch-list"></div>\n        </div>\n        <div class="challenge-answer-block confidence-answer-block">\n          <span class="section-label">3 · Rate your confidence</span>\n          <div id="challenge-confidence-options" class="challenge-confidence-grid" role="group" aria-label="Confidence in localization answer">\n            <button class="tool challenge-confidence-button" data-confidence="low" type="button"><b>Unsure</b><span>I am not confident</span></button>\n            <button class="tool challenge-confidence-button" data-confidence="medium" type="button"><b>Moderate</b><span>I think this fits</span></button>\n            <button class="tool challenge-confidence-button" data-confidence="high" type="button"><b>High</b><span>I would commit to this</span></button>\n          </div>\n          <p class="challenge-confidence-note">Self-rating only. Confidence is stored locally with this response and does not change whether an answer is marked correct.</p>\n        </div>\n\n        <button id="challenge-submit" class="tool full challenge-submit" type="button" disabled>Submit localization</button>\n''',
    ),
    (
        '''          <p id="challenge-feedback-answer"></p>\n          <p id="challenge-feedback-explanation"></p>\n''',
        '''          <p id="challenge-feedback-answer"></p>\n          <p id="challenge-feedback-explanation"></p>\n          <p id="challenge-feedback-confidence" class="challenge-feedback-confidence"></p>\n''',
    ),
    (
        '''        <div class="mastery-momentum">\n          <span class="section-label">Recent momentum</span>\n          <b id="mastery-momentum-text">Complete at least two sessions to establish a trend.</b>\n        </div>\n\n        <div class="mastery-section">\n          <span class="section-label">Recent session accuracy</span>\n''',
        '''        <div class="mastery-momentum">\n          <span class="section-label">Recent momentum</span>\n          <b id="mastery-momentum-text">Complete at least two sessions to establish a trend.</b>\n        </div>\n\n        <div class="mastery-section mastery-confidence-section">\n          <span class="section-label">Confidence calibration</span>\n          <div class="mastery-confidence-stats">\n            <div><span>Rated</span><b id="mastery-confidence-rated">0</b></div>\n            <div><span>High-conf accuracy</span><b id="mastery-confidence-high-accuracy">—</b></div>\n            <div><span>High-conf misses</span><b id="mastery-confidence-misses">0</b></div>\n            <div><span>Correct while unsure</span><b id="mastery-confidence-unsure-correct">0</b></div>\n          </div>\n          <p id="mastery-confidence-summary" class="mastery-confidence-summary">Rate confidence on localization challenges to build a confidence profile.</p>\n          <div id="mastery-confidence-bands" class="mastery-confidence-bands"></div>\n        </div>\n\n        <div class="mastery-section">\n          <span class="section-label">Recent session accuracy</span>\n''',
    ),
    (
        "let selectedChallengeLevelId = null;\nlet quizMode = false;\n",
        "let selectedChallengeLevelId = null;\nlet selectedChallengeConfidence = null;\nlet quizMode = false;\n",
    ),
    (
        '''function renderMasteryDashboard() {\n  const summary = challengeProgressSummary();\n  const dashboard = buildMasteryDashboard(learnerProgress, summary);\n\n  document.querySelector('#mastery-total-sessions').textContent = String(dashboard.totalSessions);\n''',
        '''function renderMasteryDashboard() {\n  const summary = challengeProgressSummary();\n  const dashboard = buildMasteryDashboard(learnerProgress, summary);\n  const confidence = buildConfidenceCalibration(learnerProgress);\n\n  document.querySelector('#mastery-total-sessions').textContent = String(dashboard.totalSessions);\n''',
    ),
    (
        '''  document.querySelector('#mastery-due-review').textContent = String(dashboard.dueReviewCount);\n\n  const momentum = dashboard.momentum;\n''',
        '''  document.querySelector('#mastery-due-review').textContent = String(dashboard.dueReviewCount);\n  document.querySelector('#mastery-confidence-rated').textContent = String(confidence.ratedResponses);\n  document.querySelector('#mastery-confidence-high-accuracy').textContent = confidence.highConfidenceAccuracy == null\n    ? '—'\n    : `${Math.round(confidence.highConfidenceAccuracy * 100)}%`;\n  document.querySelector('#mastery-confidence-misses').textContent = String(confidence.highConfidenceMisses);\n  document.querySelector('#mastery-confidence-unsure-correct').textContent = String(confidence.lowConfidenceCorrect);\n  document.querySelector('#mastery-confidence-summary').textContent = confidence.summary;\n  document.querySelector('#mastery-confidence-bands').innerHTML = confidence.bands.map((band) => {\n    const percent = band.accuracy == null ? null : Math.round(band.accuracy * 100);\n    return `<div><span>${band.label}</span><b>${band.attempts ? `${band.correct}/${band.attempts}` : 'No data'}</b><em>${percent == null ? '—' : `${percent}%`}</em></div>`;\n  }).join('');\n\n  const momentum = dashboard.momentum;\n''',
    ),
    (
        '''  selectedChallengeNerveId = null;\n  selectedChallengeLevelId = null;\n  resetChallengePerformance();\n''',
        '''  selectedChallengeNerveId = null;\n  selectedChallengeLevelId = null;\n  selectedChallengeConfidence = null;\n  resetChallengePerformance();\n''',
    ),
    (
        '''function syncChallengeSubmit() {\n  const submit = document.querySelector('#challenge-submit');\n  submit.disabled = localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId;\n}\n''',
        '''function syncChallengeSubmit() {\n  const submit = document.querySelector('#challenge-submit');\n  submit.disabled = localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId || !selectedChallengeConfidence;\n}\n''',
    ),
    (
        '''  document.querySelector('#challenge-nerve-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);\n  document.querySelector('#challenge-level-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);\n}\n''',
        '''  document.querySelector('#challenge-nerve-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);\n  document.querySelector('#challenge-level-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);\n  document.querySelector('#challenge-confidence-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);\n}\n''',
    ),
    (
        '''  localizationChallengeAnswered = false;\n  selectedChallengeNerveId = null;\n  selectedChallengeLevelId = null;\n  const total = localizationChallengeSessionIds.length;\n''',
        '''  localizationChallengeAnswered = false;\n  selectedChallengeNerveId = null;\n  selectedChallengeLevelId = null;\n  selectedChallengeConfidence = null;\n  document.querySelectorAll('.challenge-confidence-button').forEach((button) => {\n    button.classList.remove('active');\n    button.setAttribute('aria-pressed', 'false');\n  });\n  const total = localizationChallengeSessionIds.length;\n''',
    ),
    (
        "function submitLocalizationChallenge() {\n  if (localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId) return;\n",
        "function submitLocalizationChallenge() {\n  if (localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId || !selectedChallengeConfidence) return;\n",
    ),
    (
        '''    levelId: challenge.levelId,\n    correct,\n  });\n''',
        '''    levelId: challenge.levelId,\n    correct,\n    confidence: selectedChallengeConfidence,\n  });\n''',
    ),
    (
        '''  document.querySelector('#challenge-feedback-explanation').textContent = challenge.explanation;\n  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;\n''',
        '''  document.querySelector('#challenge-feedback-explanation').textContent = challenge.explanation;\n  document.querySelector('#challenge-feedback-confidence').textContent = `${confidenceLabel(selectedChallengeConfidence)} confidence · ${confidenceFeedback(correct, selectedChallengeConfidence)}`;\n  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;\n''',
    ),
    (
        '''document.querySelector('#challenge-submit').addEventListener('click', submitLocalizationChallenge);\n''',
        '''document.querySelectorAll('.challenge-confidence-button').forEach((button) => {\n  button.setAttribute('aria-pressed', 'false');\n  button.addEventListener('click', () => {\n    if (localizationChallengeAnswered) return;\n    selectedChallengeConfidence = button.dataset.confidence;\n    document.querySelectorAll('.challenge-confidence-button').forEach((node) => {\n      const active = node.dataset.confidence === selectedChallengeConfidence;\n      node.classList.toggle('active', active);\n      node.setAttribute('aria-pressed', active ? 'true' : 'false');\n    });\n    syncChallengeSubmit();\n  });\n});\n\ndocument.querySelector('#challenge-submit').addEventListener('click', submitLocalizationChallenge);\n''',
    ),
]

for old, new in replacements:
    if old not in text:
        raise SystemExit(f'Expected main.js anchor not found:\n{old[:240]}')
    text = text.replace(old, new, 1)

main_path.write_text(text)

style_path = Path('src/style.css')
style = style_path.read_text()
marker = '/* v0.4.0 confidence-calibrated reasoning */'
if marker not in style:
    style += '''\n\n/* v0.4.0 confidence-calibrated reasoning */\n.challenge-confidence-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; margin-top: 10px; }\n.challenge-confidence-button { min-height: 58px; display: grid; gap: 3px; padding: 9px 7px; }\n.challenge-confidence-button b { font-size: 11px; }\n.challenge-confidence-button span { color: #8190a1; font-size: 9.5px; line-height: 1.25; }\n.challenge-confidence-button.active { background: #263347; border-color: #7896bd; color: #f2f7ff; }\n.challenge-confidence-button.active span { color: #b9cbe1; }\n.challenge-confidence-note { margin: 8px 0 0; color: #6f7d8d; font-size: 10px; line-height: 1.4; }\n.challenge-feedback-confidence { margin-top: 10px !important; padding-top: 9px; border-top: 1px solid #2f3d4b; color: #a9bbcf !important; }\n.mastery-confidence-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }\n.mastery-confidence-stats div { padding: 10px; border: 1px solid #344151; border-radius: 10px; background: #0e151d; }\n.mastery-confidence-stats span { display: block; color: #78899b; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; }\n.mastery-confidence-stats b { display: block; margin-top: 4px; color: #e2ebf4; font-size: 16px; }\n.mastery-confidence-summary { margin: 10px 0 0; color: #9babbc; font-size: 11px; line-height: 1.45; }\n.mastery-confidence-bands { display: grid; gap: 7px; margin-top: 11px; }\n.mastery-confidence-bands div { display: grid; grid-template-columns: 1fr auto auto; gap: 8px; align-items: center; padding: 8px 10px; border: 1px solid #2d3946; border-radius: 9px; background: #10171f; }\n.mastery-confidence-bands span { color: #b8c5d2; font-size: 10.5px; font-weight: 700; }\n.mastery-confidence-bands b { color: #d9e3ec; font-size: 10.5px; }\n.mastery-confidence-bands em { color: #8296aa; font-size: 10px; font-style: normal; }\n@media (max-width: 560px) {\n  .challenge-confidence-grid { grid-template-columns: 1fr; }\n}\n'''
style_path.write_text(style)

print('Patched Anatomica for v0.4.0 confidence-calibrated clinical reasoning.')
