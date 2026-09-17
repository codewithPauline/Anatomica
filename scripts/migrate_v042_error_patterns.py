from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Missing migration anchor: {label}")
    return text.replace(old, new, 1)


path = Path('src/main.js')
text = path.read_text()

text = replace_once(
    text,
    "import { buildConfidenceRemediationPriorities, buildConfidenceRemediationSession, confidenceRemediationSummary } from './learning/confidenceRemediation.js';\n",
    "import { buildConfidenceRemediationPriorities, buildConfidenceRemediationSession, confidenceRemediationSummary } from './learning/confidenceRemediation.js';\nimport { buildConfusionDrill, buildErrorPatterns, errorPatternSummary } from './learning/errorPatterns.js';\n",
    'error pattern import',
)

text = replace_once(
    text,
    "import './confidenceRemediation.css';\n",
    "import './confidenceRemediation.css';\nimport './errorPatterns.css';\n",
    'error pattern stylesheet import',
)

text = replace_once(
    text,
    '<p class="eyebrow">ANATOMICA v0.4</p>',
    '<p class="eyebrow">ANATOMICA v0.4.2</p>',
    'version eyebrow',
)

text = replace_once(
    text,
    "let remediationFocus = null;\n",
    "let remediationFocus = null;\nlet confusionDrillChallengeIds = [];\n",
    'confusion drill state',
)

ui_anchor = '''          <button id="mastery-confidence-remediation-btn" class="tool full confidence-remediation-button" type="button" disabled>Priority queue clear</button>
        </div>

        <div class="mastery-section">
          <span class="section-label">Recent session accuracy</span>'''
ui_replacement = '''          <button id="mastery-confidence-remediation-btn" class="tool full confidence-remediation-button" type="button" disabled>Priority queue clear</button>
        </div>

        <div class="mastery-section error-pattern-panel">
          <div class="error-pattern-head">
            <div>
              <span class="section-label">Answer-confusion intelligence</span>
              <strong>Error patterns</strong>
            </div>
            <span class="status-pill">Choice-aware</span>
          </div>
          <p id="mastery-error-pattern-summary" class="error-pattern-summary">No answer-confusion patterns have been recorded yet.</p>
          <div id="mastery-error-pattern-list" class="error-pattern-list"></div>
          <button id="mastery-error-pattern-btn" class="tool full error-pattern-button" type="button" disabled>No confusion drill yet</button>
        </div>

        <div class="mastery-section">
          <span class="section-label">Recent session accuracy</span>'''
text = replace_once(text, ui_anchor, ui_replacement, 'error pattern dashboard panel')

render_anchor = '''function renderMasteryDashboard() {
  const summary = challengeProgressSummary();
  const dashboard = buildMasteryDashboard(learnerProgress, summary);
  const confidence = buildConfidenceCalibration(learnerProgress);
  const confidencePriorities = buildConfidenceRemediationPriorities(learnerProgress, localizationChallenges);
'''
render_replacement = '''function localizationConceptLabel(challenge) {
  if (!challenge) return 'Unknown localization';
  const nerve = nerveDeficitById(challenge.nerveId);
  const level = lesionLevelById(nerve, challenge.levelId);
  return `${nerve?.name ?? challenge.nerveId} · ${level?.label ?? challenge.levelId}`;
}

function renderMasteryDashboard() {
  const summary = challengeProgressSummary();
  const dashboard = buildMasteryDashboard(learnerProgress, summary);
  const confidence = buildConfidenceCalibration(learnerProgress);
  const confidencePriorities = buildConfidenceRemediationPriorities(learnerProgress, localizationChallenges);
  const errorPatterns = buildErrorPatterns(learnerProgress, localizationChallenges);
'''
text = replace_once(text, render_anchor, render_replacement, 'dashboard analytics setup')

pattern_render_anchor = '''  confidenceRemediationButton.textContent = confidencePriorities.length
    ? `Practice ${confidencePriorities.length} priority concept${confidencePriorities.length === 1 ? '' : 's'}`
    : 'Priority queue clear';

  const momentum = dashboard.momentum;'''
pattern_render_replacement = '''  confidenceRemediationButton.textContent = confidencePriorities.length
    ? `Practice ${confidencePriorities.length} priority concept${confidencePriorities.length === 1 ? '' : 's'}`
    : 'Priority queue clear';

  document.querySelector('#mastery-error-pattern-summary').textContent = errorPatternSummary(errorPatterns);
  document.querySelector('#mastery-error-pattern-list').innerHTML = errorPatterns.length
    ? errorPatterns.slice(0, 4).map((pattern) => {
        const firstLabel = localizationConceptLabel(pattern.first);
        const secondLabel = localizationConceptLabel(pattern.second);
        const occurrenceLabel = `${pattern.count} confusion${pattern.count === 1 ? '' : 's'}`;
        const confidenceLabel = pattern.highConfidenceMisses
          ? ` · ${pattern.highConfidenceMisses} high-confidence`
          : '';
        return `<button type="button" class="error-pattern-item ${pattern.recurrent ? 'recurrent' : ''}" data-confusion-key="${pattern.key}"><b>${firstLabel} ↔ ${secondLabel}</b><span>${occurrenceLabel}${confidenceLabel}</span><em>${pattern.recurrent ? 'Recurring · drill this distinction' : 'Single event · practice pair'}</em></button>`;
      }).join('')
    : '<p class="mastery-empty">Wrong-answer choices recorded in v0.4.2 will appear here when they map to another modeled lesion concept.</p>';
  const errorPatternButton = document.querySelector('#mastery-error-pattern-btn');
  errorPatternButton.disabled = errorPatterns.length === 0;
  errorPatternButton.textContent = errorPatterns.length
    ? `Practice top confusion · ${errorPatterns[0].count} event${errorPatterns[0].count === 1 ? '' : 's'}`
    : 'No confusion drill yet';

  const momentum = dashboard.momentum;'''
text = replace_once(text, pattern_render_anchor, pattern_render_replacement, 'error pattern dashboard rendering')

listener_anchor = '''  document.querySelectorAll('[data-remediate-nerve][data-remediate-level]').forEach((button) => {
    button.addEventListener('click', () => {
      launchTargetedRemediation(button.dataset.remediateNerve, button.dataset.remediateLevel);
    });
  });
}


function launchConfidenceRemediation() {'''
listener_replacement = '''  document.querySelectorAll('[data-remediate-nerve][data-remediate-level]').forEach((button) => {
    button.addEventListener('click', () => {
      launchTargetedRemediation(button.dataset.remediateNerve, button.dataset.remediateLevel);
    });
  });
  document.querySelectorAll('[data-confusion-key]').forEach((button) => {
    button.addEventListener('click', () => {
      const pattern = errorPatterns.find((item) => item.key === button.dataset.confusionKey);
      if (pattern) launchConfusionDrill(pattern);
    });
  });
}


function launchConfusionDrill(pattern) {
  const pool = buildConfusionDrill(localizationChallenges, pattern);
  if (!pool.length) return;

  confusionDrillChallengeIds = pool.map((challenge) => challenge.id);
  remediationFocus = null;
  deactivateStudyModes('localization-challenge');
  masteryDashboardMode = false;
  document.querySelector('#mastery-dashboard-btn').classList.remove('active');
  document.querySelector('#mastery-dashboard-card').hidden = true;
  localizationChallengeMode = true;
  document.querySelector('#localization-challenge-btn').classList.add('active');
  document.querySelector('#localization-challenge-card').hidden = false;
  startLocalizationChallengeSession('confusion-drill');
}

function launchConfidenceRemediation() {'''
text = replace_once(text, listener_anchor, listener_replacement, 'confusion drill launcher')

label_anchor = '''function challengeDifficultyLabel(value) {
  if (value === 'confidence-review') return 'Priority remediation';
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';
}'''
label_replacement = '''function challengeDifficultyLabel(value) {
  if (value === 'confidence-review') return 'Priority remediation';
  if (value === 'confusion-drill') return 'Confusion drill';
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';
}'''
text = replace_once(text, label_anchor, label_replacement, 'confusion drill label')

note_anchor = '''  if (difficulty === 'confidence-review') {
    const count = buildConfidenceRemediationSession(learnerProgress, localizationChallenges).length;
    return count
      ? `Confidence-aware remediation · ${count} concept${count === 1 ? '' : 's'} ordered by the latest unresolved confidence signal.`
      : 'No confidence-aware remediation is currently needed.';
  }
  if (difficulty === 'review') {'''
note_replacement = '''  if (difficulty === 'confidence-review') {
    const count = buildConfidenceRemediationSession(learnerProgress, localizationChallenges).length;
    return count
      ? `Confidence-aware remediation · ${count} concept${count === 1 ? '' : 's'} ordered by the latest unresolved confidence signal.`
      : 'No confidence-aware remediation is currently needed.';
  }
  if (difficulty === 'confusion-drill') {
    return confusionDrillChallengeIds.length
      ? `Error-pattern drill · compare ${confusionDrillChallengeIds.length} lesion concepts that have been confused in prior answers.`
      : 'No answer-confusion drill is currently available.';
  }
  if (difficulty === 'review') {'''
text = replace_once(text, note_anchor, note_replacement, 'confusion drill mode note')

pool_anchor = '''  let pool;
  if (difficulty === 'review') pool = reviewChallengePool();
  else if (difficulty === 'confidence-review') pool = buildConfidenceRemediationSession(learnerProgress, localizationChallenges);
  else if (difficulty === 'remediation' && remediationFocus) {
    pool = buildRemediationSession(localizationChallenges, remediationFocus.nerveId, remediationFocus.levelId);
  } else pool = localizationChallengesForDifficulty(difficulty);
  localizationChallengeSessionIds = ['remediation', 'confidence-review'].includes(difficulty)
    ? pool.map((challenge) => challenge.id)
    : shuffleChallenges(pool).map((challenge) => challenge.id);'''
pool_replacement = '''  let pool;
  if (difficulty === 'review') pool = reviewChallengePool();
  else if (difficulty === 'confidence-review') pool = buildConfidenceRemediationSession(learnerProgress, localizationChallenges);
  else if (difficulty === 'confusion-drill') {
    pool = confusionDrillChallengeIds.map((id) => localizationChallengeById(id)).filter(Boolean);
  } else if (difficulty === 'remediation' && remediationFocus) {
    pool = buildRemediationSession(localizationChallenges, remediationFocus.nerveId, remediationFocus.levelId);
  } else pool = localizationChallengesForDifficulty(difficulty);
  localizationChallengeSessionIds = ['remediation', 'confidence-review', 'confusion-drill'].includes(difficulty)
    ? pool.map((challenge) => challenge.id)
    : shuffleChallenges(pool).map((challenge) => challenge.id);'''
text = replace_once(text, pool_anchor, pool_replacement, 'confusion drill session pool')

result_anchor = '''  localizationChallengeSessionResults.push({
    challengeId: challenge.id,
    nerveId: challenge.nerveId,
    levelId: challenge.levelId,
    correct,
    confidence: selectedChallengeConfidence,
  });'''
result_replacement = '''  localizationChallengeSessionResults.push({
    challengeId: challenge.id,
    nerveId: challenge.nerveId,
    levelId: challenge.levelId,
    correct,
    confidence: selectedChallengeConfidence,
    selectedNerveId: selectedChallengeNerveId,
    selectedLevelId: selectedChallengeLevelId,
  });'''
text = replace_once(text, result_anchor, result_replacement, 'selected answer capture')

reset_anchor = '''    if (['remediation', 'confidence-review'].includes(localizationChallengeDifficulty)) {
      remediationFocus = null;
      localizationChallengeDifficulty = 'adaptive';
    }'''
reset_replacement = '''    if (['remediation', 'confidence-review', 'confusion-drill'].includes(localizationChallengeDifficulty)) {
      remediationFocus = null;
      confusionDrillChallengeIds = [];
      localizationChallengeDifficulty = 'adaptive';
    }'''
text = replace_once(text, reset_anchor, reset_replacement, 'direct challenge reset')

event_anchor = "document.querySelector('#mastery-confidence-remediation-btn').addEventListener('click', launchConfidenceRemediation);\n\n"
event_replacement = "document.querySelector('#mastery-confidence-remediation-btn').addEventListener('click', launchConfidenceRemediation);\ndocument.querySelector('#mastery-error-pattern-btn').addEventListener('click', () => {\n  const pattern = buildErrorPatterns(learnerProgress, localizationChallenges)[0];\n  if (pattern) launchConfusionDrill(pattern);\n});\n\n"
text = replace_once(text, event_anchor, event_replacement, 'top confusion drill event')

path.write_text(text)
print('Applied Anatomica v0.4.2 error-pattern intelligence migration.')
