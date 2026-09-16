from pathlib import Path

main_path = Path('src/main.js')
style_path = Path('src/style.css')

main = main_path.read_text()

old_import = "import { localizationChallenges, localizationChallengeById, localizationChallengesForDifficulty } from './data/localizationChallenges.js';\nimport { hydrateRealModels } from './engine/realModelSwap.js';"
new_import = "import { localizationChallenges, localizationChallengeById, localizationChallengesForDifficulty } from './data/localizationChallenges.js';\nimport { clearLearnerProgress, loadLearnerProgress, recordLocalizationSession, saveLearnerProgress, summarizeLearnerProgress } from './learning/progressStore.js';\nimport { hydrateRealModels } from './engine/realModelSwap.js';"
if old_import not in main:
    raise SystemExit('progress-store import anchor not found')
main = main.replace(old_import, new_import, 1)

old_grid = '''          <div class="challenge-difficulty-grid" role="group" aria-label="Challenge difficulty">
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="easy" type="button">Easy</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="intermediate" type="button">Intermediate</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="advanced" type="button">Advanced</button>
            <button class="tool challenge-difficulty-button active" data-challenge-difficulty="adaptive" type="button">Adaptive</button>
          </div>
          <p id="challenge-mode-note" class="challenge-mode-note">Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.</p>
        </div>
        <p id="challenge-progress" class="challenge-progress">Case 1 of ${localizationChallenges.length}</p>'''
new_grid = '''          <div class="challenge-difficulty-grid" role="group" aria-label="Challenge difficulty">
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="easy" type="button">Easy</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="intermediate" type="button">Intermediate</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="advanced" type="button">Advanced</button>
            <button class="tool challenge-difficulty-button active" data-challenge-difficulty="adaptive" type="button">Adaptive</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="review" type="button">Review due</button>
          </div>
          <p id="challenge-mode-note" class="challenge-mode-note">Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.</p>
        </div>
        <div class="challenge-persistent-progress" aria-live="polite">
          <div class="challenge-persistent-head">
            <span class="section-label">Progress on this browser</span>
            <button id="challenge-clear-progress" class="challenge-clear-progress" type="button">Clear</button>
          </div>
          <div class="challenge-persistent-stats">
            <div><span>Sessions</span><b id="challenge-lifetime-sessions">0</b></div>
            <div><span>Accuracy</span><b id="challenge-lifetime-accuracy">—</b></div>
            <div><span>Due review</span><b id="challenge-review-count">0</b></div>
          </div>
          <p id="challenge-persistent-focus">Complete a session to build a mastery profile.</p>
          <p class="challenge-storage-note">Stored only in this browser. No account or cloud sync.</p>
        </div>
        <p id="challenge-progress" class="challenge-progress">Case 1 of ${localizationChallenges.length}</p>'''
if old_grid not in main:
    raise SystemExit('difficulty-grid anchor not found')
main = main.replace(old_grid, new_grid, 1)

old_state = '''let localizationChallengePerformance = {};
let localizationChallengeMisses = [];
let selectedChallengeNerveId = null;
let selectedChallengeLevelId = null;'''
new_state = '''let localizationChallengePerformance = {};
let localizationChallengeMisses = [];
let localizationChallengeSessionResults = [];
let localizationChallengeSessionRecorded = false;
let learnerProgress = loadLearnerProgress();
let selectedChallengeNerveId = null;
let selectedChallengeLevelId = null;'''
if old_state not in main:
    raise SystemExit('challenge-state anchor not found')
main = main.replace(old_state, new_state, 1)

old_current = '''function currentLocalizationChallenge() {
  const id = localizationChallengeSessionIds[localizationChallengeSessionPosition];
  return localizationChallengeById(id);
}

function resetChallengePerformance() {'''
new_current = '''function currentLocalizationChallenge() {
  const id = localizationChallengeSessionIds[localizationChallengeSessionPosition];
  return localizationChallengeById(id);
}

function challengeProgressSummary() {
  return summarizeLearnerProgress(learnerProgress, nerveDeficits, localizationChallenges);
}

function reviewChallengePool() {
  const dueIds = challengeProgressSummary().reviewQueue.map((item) => item.id);
  const dueSet = new Set(dueIds);
  const due = localizationChallenges.filter((challenge) => dueSet.has(challenge.id));
  return due.length ? due : localizationChallenges;
}

function renderPersistentChallengeProgress() {
  const summary = challengeProgressSummary();
  document.querySelector('#challenge-lifetime-sessions').textContent = String(summary.sessions);
  document.querySelector('#challenge-lifetime-accuracy').textContent = summary.accuracy == null
    ? '—'
    : `${Math.round(summary.accuracy * 100)}%`;
  document.querySelector('#challenge-review-count').textContent = String(summary.reviewQueue.length);

  const attemptedNerves = summary.nerves
    .filter((item) => item.attempts > 0)
    .sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || b.attempts - a.attempts);
  const weakest = attemptedNerves[0];
  document.querySelector('#challenge-persistent-focus').textContent = weakest
    ? `Current focus: ${weakest.name} · ${weakest.mastery} · ${Math.round((weakest.accuracy ?? 0) * 100)}% across ${weakest.attempts} attempt${weakest.attempts === 1 ? '' : 's'}.`
    : 'Complete a session to build a mastery profile.';
}

function recordCompletedChallengeSession() {
  if (localizationChallengeSessionRecorded || localizationChallengeSessionResults.length === 0) return;
  learnerProgress = recordLocalizationSession(learnerProgress, {
    mode: localizationChallengeDifficulty,
    completedAt: new Date().toISOString(),
    results: localizationChallengeSessionResults,
  });
  learnerProgress = saveLearnerProgress(learnerProgress);
  localizationChallengeSessionRecorded = true;
  renderPersistentChallengeProgress();
}

function resetChallengePerformance() {'''
if old_current not in main:
    raise SystemExit('challenge-current anchor not found')
main = main.replace(old_current, new_current, 1)

old_note = '''function challengeModeNote(difficulty) {
  if (difficulty === 'adaptive') {
    return 'Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.';
  }
  const count = localizationChallengesForDifficulty(difficulty).length;
  return `${challengeDifficultyLabel(difficulty)} session · ${count} shuffled case${count === 1 ? '' : 's'}.`;
}'''
new_note = '''function challengeModeNote(difficulty) {
  if (difficulty === 'adaptive') {
    return 'Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.';
  }
  if (difficulty === 'review') {
    const due = challengeProgressSummary().reviewQueue.length;
    return due
      ? `Spaced review · ${due} challenge${due === 1 ? '' : 's'} due on this browser.`
      : 'No spaced-review items are due yet, so Review due will use the full challenge bank.';
  }
  const count = localizationChallengesForDifficulty(difficulty).length;
  return `${challengeDifficultyLabel(difficulty)} session · ${count} shuffled case${count === 1 ? '' : 's'}.`;
}'''
if old_note not in main:
    raise SystemExit('mode-note anchor not found')
main = main.replace(old_note, new_note, 1)

old_start = '''function startLocalizationChallengeSession(difficulty = localizationChallengeDifficulty) {
  localizationChallengeDifficulty = difficulty;
  const pool = localizationChallengesForDifficulty(difficulty);
  localizationChallengeSessionIds = shuffleChallenges(pool).map((challenge) => challenge.id);
  localizationChallengeSessionPosition = 0;
  localizationChallengeCorrect = 0;
  localizationChallengeAttempts = 0;
  localizationChallengeAnswered = false;
  selectedChallengeNerveId = null;
  selectedChallengeLevelId = null;
  resetChallengePerformance();
  syncChallengeDifficultyButtons();
  document.querySelector('#challenge-session-summary').hidden = true;
  renderLocalizationChallenge();
}'''
new_start = '''function startLocalizationChallengeSession(difficulty = localizationChallengeDifficulty) {
  localizationChallengeDifficulty = difficulty;
  const pool = difficulty === 'review' ? reviewChallengePool() : localizationChallengesForDifficulty(difficulty);
  localizationChallengeSessionIds = shuffleChallenges(pool).map((challenge) => challenge.id);
  localizationChallengeSessionPosition = 0;
  localizationChallengeCorrect = 0;
  localizationChallengeAttempts = 0;
  localizationChallengeAnswered = false;
  localizationChallengeSessionResults = [];
  localizationChallengeSessionRecorded = false;
  selectedChallengeNerveId = null;
  selectedChallengeLevelId = null;
  resetChallengePerformance();
  syncChallengeDifficultyButtons();
  renderPersistentChallengeProgress();
  document.querySelector('#challenge-session-summary').hidden = true;
  renderLocalizationChallenge();
}'''
if old_start not in main:
    raise SystemExit('start-session anchor not found')
main = main.replace(old_start, new_start, 1)

old_submit = '''  if (correct) localizationChallengeCorrect += 1;
  recordChallengePerformance(challenge, correct);

  const answerNerve = nerveDeficitById(challenge.nerveId);'''
new_submit = '''  if (correct) localizationChallengeCorrect += 1;
  recordChallengePerformance(challenge, correct);
  localizationChallengeSessionResults.push({
    challengeId: challenge.id,
    nerveId: challenge.nerveId,
    levelId: challenge.levelId,
    correct,
  });

  const answerNerve = nerveDeficitById(challenge.nerveId);'''
if old_submit not in main:
    raise SystemExit('submit anchor not found')
main = main.replace(old_submit, new_submit, 1)

old_summary = '''function renderLocalizationChallengeSummary() {
  setChallengeCaseVisibility(false);
  const summary = document.querySelector('#challenge-session-summary');
  summary.hidden = false;

  const accuracy = localizationChallengeAttempts'''
new_summary = '''function renderLocalizationChallengeSummary() {
  setChallengeCaseVisibility(false);
  recordCompletedChallengeSession();
  const summary = document.querySelector('#challenge-session-summary');
  summary.hidden = false;

  const accuracy = localizationChallengeAttempts'''
if old_summary not in main:
    raise SystemExit('summary anchor not found')
main = main.replace(old_summary, new_summary, 1)

old_restart = '''document.querySelector('#challenge-restart').addEventListener('click', () => {
  startLocalizationChallengeSession(localizationChallengeDifficulty);
});

document.querySelector('#localization-challenge-btn').addEventListener('click', () => {'''
new_restart = '''document.querySelector('#challenge-restart').addEventListener('click', () => {
  startLocalizationChallengeSession(localizationChallengeDifficulty);
});
document.querySelector('#challenge-clear-progress').addEventListener('click', () => {
  if (!window.confirm('Clear all Anatomica localization progress stored in this browser?')) return;
  learnerProgress = clearLearnerProgress();
  renderPersistentChallengeProgress();
  syncChallengeDifficultyButtons();
});

document.querySelector('#localization-challenge-btn').addEventListener('click', () => {'''
if old_restart not in main:
    raise SystemExit('restart anchor not found')
main = main.replace(old_restart, new_restart, 1)

main_path.write_text(main)

style = style_path.read_text()
if '/* v0.3.6 persistent learner progress */' not in style:
    style += '''\n\n/* v0.3.6 persistent learner progress */
.challenge-difficulty-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.challenge-difficulty-button[data-challenge-difficulty="review"] { grid-column: 1 / -1; border-color: #665a7c; }
.challenge-difficulty-button[data-challenge-difficulty="review"].active { background: #302741; border-color: #8c78aa; color: #efe8f8; }
.challenge-persistent-progress {
  margin-top: 14px;
  padding: 12px;
  border: 1px solid #304052;
  border-radius: 12px;
  background: #101720;
}
.challenge-persistent-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.challenge-persistent-head .section-label { margin: 0; }
.challenge-clear-progress {
  border: 0;
  background: transparent;
  color: #7f8d9d;
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.challenge-clear-progress:hover { color: #d1d9e4; }
.challenge-persistent-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 10px; }
.challenge-persistent-stats div { padding: 9px; border: 1px solid #293746; border-radius: 10px; background: #0d131a; }
.challenge-persistent-stats span { display: block; color: #748294; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; }
.challenge-persistent-stats b { display: block; margin-top: 4px; color: #e1e8f0; font-size: 15px; }
.challenge-persistent-progress > p { margin: 10px 0 0; color: #91a0b1; font-size: 11px; line-height: 1.45; }
.challenge-persistent-progress > .challenge-storage-note { color: #687586; font-size: 10px; }
'''
style_path.write_text(style)
