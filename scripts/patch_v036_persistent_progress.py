from pathlib import Path

main_path = Path('src/main.js')
style_path = Path('src/style.css')
package_path = Path('package.json')

main = main_path.read_text()

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
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="review" type="button">Review</button>
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
            <div><span>Review</span><b id="challenge-review-count">0</b></div>
          </div>
          <p id="challenge-persistent-focus">Complete a session to build a mastery profile.</p>
        </div>
        <p id="challenge-progress" class="challenge-progress">Case 1 of ${localizationChallenges.length}</p>'''
if old_grid not in main:
    raise SystemExit('difficulty-grid anchor not found')
main = main.replace(old_grid, new_grid, 1)

old_state = '''let localizationChallengeMode = false;
let localizationChallengeDifficulty = 'adaptive';
let localizationChallengeSessionIds = [];
let localizationChallengeSessionPosition = 0;
let localizationChallengeCorrect = 0;
let localizationChallengeAttempts = 0;
let localizationChallengeAnswered = false;
let localizationChallengePerformance = {};
let localizationChallengeMisses = [];
let selectedChallengeNerveId = null;
let selectedChallengeLevelId = null;'''
new_state = '''let localizationChallengeMode = false;
let localizationChallengeDifficulty = 'adaptive';
let localizationChallengeSessionIds = [];
let localizationChallengeSessionPosition = 0;
let localizationChallengeCorrect = 0;
let localizationChallengeAttempts = 0;
let localizationChallengeAnswered = false;
let localizationChallengePerformance = {};
let localizationChallengeMisses = [];
let localizationChallengeSessionRecorded = false;
let selectedChallengeNerveId = null;
let selectedChallengeLevelId = null;

const CHALLENGE_PROGRESS_KEY = 'anatomica.challengeProgress.v1';
const CHALLENGE_PROGRESS_MAX_SESSIONS = 30;

function emptyChallengeProgress() {
  return { version: 1, sessions: [], concepts: {} };
}

function loadChallengeProgress() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CHALLENGE_PROGRESS_KEY) ?? 'null');
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.sessions) || typeof parsed.concepts !== 'object') {
      return emptyChallengeProgress();
    }
    return parsed;
  } catch {
    return emptyChallengeProgress();
  }
}

function saveChallengeProgress() {
  try {
    localStorage.setItem(CHALLENGE_PROGRESS_KEY, JSON.stringify(localizationStoredProgress));
  } catch (error) {
    console.warn('[Anatomica] Browser progress could not be saved.', error);
  }
}

let localizationStoredProgress = loadChallengeProgress();'''
if old_state not in main:
    raise SystemExit('challenge-state anchor not found')
main = main.replace(old_state, new_state, 1)

old_helpers = '''function currentLocalizationChallenge() {
  const id = localizationChallengeSessionIds[localizationChallengeSessionPosition];
  return localizationChallengeById(id);
}

function resetChallengePerformance() {'''
new_helpers = '''function currentLocalizationChallenge() {
  const id = localizationChallengeSessionIds[localizationChallengeSessionPosition];
  return localizationChallengeById(id);
}

function challengeConceptKey(challenge) {
  return `${challenge.nerveId}:${challenge.levelId}`;
}

function reviewChallengePool() {
  const weakKeys = new Set(
    Object.entries(localizationStoredProgress.concepts ?? {})
      .filter(([, stats]) => (stats.attempts ?? 0) > 0 && (stats.correct ?? 0) < (stats.attempts ?? 0))
      .map(([key]) => key),
  );
  const targeted = localizationChallenges.filter((challenge) => weakKeys.has(challengeConceptKey(challenge)));
  return targeted.length ? targeted : localizationChallenges;
}

function persistentNerveStats() {
  const stats = Object.fromEntries(nerveDeficits.map((item) => [item.id, { attempts: 0, correct: 0 }]));
  for (const [key, concept] of Object.entries(localizationStoredProgress.concepts ?? {})) {
    const nerveId = key.split(':')[0];
    if (!stats[nerveId]) continue;
    stats[nerveId].attempts += concept.attempts ?? 0;
    stats[nerveId].correct += concept.correct ?? 0;
  }
  return stats;
}

function renderPersistentChallengeProgress() {
  const sessions = localizationStoredProgress.sessions ?? [];
  const concepts = Object.values(localizationStoredProgress.concepts ?? {});
  const attempts = concepts.reduce((sum, item) => sum + (item.attempts ?? 0), 0);
  const correct = concepts.reduce((sum, item) => sum + (item.correct ?? 0), 0);
  const accuracy = attempts ? Math.round((correct / attempts) * 100) : null;
  const reviewCount = reviewChallengePool().length === localizationChallenges.length && !concepts.some((item) => (item.correct ?? 0) < (item.attempts ?? 0))
    ? 0
    : reviewChallengePool().length;

  document.querySelector('#challenge-lifetime-sessions').textContent = String(sessions.length);
  document.querySelector('#challenge-lifetime-accuracy').textContent = accuracy == null ? '—' : `${accuracy}%`;
  document.querySelector('#challenge-review-count').textContent = String(reviewCount);

  const nerveStats = Object.entries(persistentNerveStats())
    .filter(([, item]) => item.attempts > 0)
    .map(([nerveId, item]) => ({ nerveId, ...item, accuracy: item.correct / item.attempts }))
    .sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts);
  const weakest = nerveStats[0];
  const weakestNerve = weakest ? nerveDeficitById(weakest.nerveId) : null;
  document.querySelector('#challenge-persistent-focus').textContent = weakest
    ? `Current review focus: ${weakestNerve?.name ?? weakest.nerveId} · ${Math.round(weakest.accuracy * 100)}% across ${weakest.attempts} attempt${weakest.attempts === 1 ? '' : 's'}.`
    : 'Complete a session to build a mastery profile.';
}

function recordPersistentChallengeAnswer(challenge, correct) {
  const key = challengeConceptKey(challenge);
  const current = localizationStoredProgress.concepts[key] ?? {
    nerveId: challenge.nerveId,
    levelId: challenge.levelId,
    attempts: 0,
    correct: 0,
    misses: 0,
    lastAttemptAt: null,
    lastMissedAt: null,
  };
  current.attempts += 1;
  if (correct) current.correct += 1;
  else {
    current.misses += 1;
    current.lastMissedAt = new Date().toISOString();
  }
  current.lastAttemptAt = new Date().toISOString();
  localizationStoredProgress.concepts[key] = current;
  saveChallengeProgress();
  renderPersistentChallengeProgress();
}

function recordPersistentChallengeSession() {
  if (localizationChallengeSessionRecorded || localizationChallengeAttempts === 0) return;
  localizationChallengeSessionRecorded = true;
  localizationStoredProgress.sessions.unshift({
    completedAt: new Date().toISOString(),
    mode: localizationChallengeDifficulty,
    correct: localizationChallengeCorrect,
    attempts: localizationChallengeAttempts,
    accuracy: Math.round((localizationChallengeCorrect / localizationChallengeAttempts) * 100),
    missedConcepts: localizationChallengeMisses.map((miss) => `${miss.nerveId}:${miss.levelId}`),
  });
  localizationStoredProgress.sessions = localizationStoredProgress.sessions.slice(0, CHALLENGE_PROGRESS_MAX_SESSIONS);
  saveChallengeProgress();
  renderPersistentChallengeProgress();
}

function resetChallengePerformance() {'''
if old_helpers not in main:
    raise SystemExit('challenge-helper anchor not found')
main = main.replace(old_helpers, new_helpers, 1)

old_mode_note = '''function challengeModeNote(difficulty) {
  if (difficulty === 'adaptive') {
    return 'Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.';
  }
  const count = localizationChallengesForDifficulty(difficulty).length;
  return `${challengeDifficultyLabel(difficulty)} session · ${count} shuffled case${count === 1 ? '' : 's'}.`;
}'''
new_mode_note = '''function challengeModeNote(difficulty) {
  if (difficulty === 'adaptive') {
    return 'Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.';
  }
  if (difficulty === 'review') {
    const pool = reviewChallengePool();
    const targeted = pool.length !== localizationChallenges.length || Object.values(localizationStoredProgress.concepts ?? {}).some((item) => (item.correct ?? 0) < (item.attempts ?? 0));
    return targeted
      ? `Review mode · ${pool.length} previously missed concept${pool.length === 1 ? '' : 's'} on this browser.`
      : 'Review mode has no saved misses yet, so it will use the full challenge bank.';
  }
  const count = localizationChallengesForDifficulty(difficulty).length;
  return `${challengeDifficultyLabel(difficulty)} session · ${count} shuffled case${count === 1 ? '' : 's'}.`;
}'''
if old_mode_note not in main:
    raise SystemExit('mode-note anchor not found')
main = main.replace(old_mode_note, new_mode_note, 1)

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

old_record = '''  recordChallengePerformance(challenge, correct);

  const answerNerve = nerveDeficitById(challenge.nerveId);'''
new_record = '''  recordChallengePerformance(challenge, correct);
  recordPersistentChallengeAnswer(challenge, correct);

  const answerNerve = nerveDeficitById(challenge.nerveId);'''
if old_record not in main:
    raise SystemExit('submit-record anchor not found')
main = main.replace(old_record, new_record, 1)

old_summary = '''function renderLocalizationChallengeSummary() {
  setChallengeCaseVisibility(false);
  const summary = document.querySelector('#challenge-session-summary');
  summary.hidden = false;

  const accuracy = localizationChallengeAttempts'''
new_summary = '''function renderLocalizationChallengeSummary() {
  setChallengeCaseVisibility(false);
  recordPersistentChallengeSession();
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
  localizationStoredProgress = emptyChallengeProgress();
  saveChallengeProgress();
  renderPersistentChallengeProgress();
  syncChallengeDifficultyButtons();
});

document.querySelector('#localization-challenge-btn').addEventListener('click', () => {'''
if old_restart not in main:
    raise SystemExit('restart anchor not found')
main = main.replace(old_restart, new_restart, 1)

main_path.write_text(main)

style = style_path.read_text()
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
'''
style_path.write_text(style)

package = package_path.read_text()
if '"version": "0.3.5"' not in package:
    raise SystemExit('package version anchor not found')
package_path.write_text(package.replace('"version": "0.3.5"', '"version": "0.3.6"', 1))
