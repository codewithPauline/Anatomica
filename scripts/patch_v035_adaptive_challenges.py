from pathlib import Path


def replace_exact(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing patch anchor: {label}')
    return text.replace(old, new, 1)


main_path = Path('src/main.js')
text = main_path.read_text()

text = replace_exact(
    text,
    "import { localizationChallenges, localizationChallengeByIndex } from './data/localizationChallenges.js';",
    "import { localizationChallenges, localizationChallengeById, localizationChallengesForDifficulty } from './data/localizationChallenges.js';",
    'localization challenge import',
)

old_controls = '''        <p id="challenge-progress" class="challenge-progress">Case 1 of ${localizationChallenges.length}</p>'''
new_controls = '''        <div class="challenge-session-controls">
          <span class="section-label">Session mode</span>
          <div class="challenge-difficulty-grid" role="group" aria-label="Challenge difficulty">
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="easy" type="button">Easy</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="intermediate" type="button">Intermediate</button>
            <button class="tool challenge-difficulty-button" data-challenge-difficulty="advanced" type="button">Advanced</button>
            <button class="tool challenge-difficulty-button active" data-challenge-difficulty="adaptive" type="button">Adaptive</button>
          </div>
          <p id="challenge-mode-note" class="challenge-mode-note">Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.</p>
        </div>
        <p id="challenge-progress" class="challenge-progress">Case 1 of ${localizationChallenges.length}</p>'''
text = replace_exact(text, old_controls, new_controls, 'challenge difficulty controls')

old_summary_anchor = '''        <button id="challenge-next" class="tool full" type="button" hidden>Next case</button>
        <p class="simulator-note">Educational reasoning exercise only. The 3D answer reveal uses the current modeled anatomy and does not represent patient-specific diagnosis.</p>'''
new_summary_anchor = '''        <button id="challenge-next" class="tool full" type="button" hidden>Next case</button>
        <div id="challenge-session-summary" class="challenge-session-summary" hidden aria-live="polite">
          <span class="section-label">Session complete</span>
          <strong id="challenge-summary-score"></strong>
          <p id="challenge-summary-focus"></p>
          <div id="challenge-nerve-summary" class="challenge-nerve-summary"></div>
          <div class="challenge-missed-block">
            <span class="section-label">Missed localizations</span>
            <div id="challenge-missed-list" class="challenge-missed-list"></div>
          </div>
          <button id="challenge-restart" class="tool full" type="button">Start another session</button>
        </div>
        <p class="simulator-note">Educational reasoning exercise only. The 3D answer reveal uses the current modeled anatomy and does not represent patient-specific diagnosis.</p>'''
text = replace_exact(text, old_summary_anchor, new_summary_anchor, 'challenge session summary')

old_state = '''let localizationChallengeMode = false;
let localizationChallengeIndex = 0;
let localizationChallengeCorrect = 0;
let localizationChallengeAttempts = 0;
let localizationChallengeAnswered = false;
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
let selectedChallengeNerveId = null;
let selectedChallengeLevelId = null;'''
text = replace_exact(text, old_state, new_state, 'adaptive challenge state')

start = text.index('function currentLocalizationChallenge() {')
end = text.index("\nconst branchContainer = document.querySelector('#plexus-branches');", start)

new_block = r'''function shuffleChallenges(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function currentLocalizationChallenge() {
  const id = localizationChallengeSessionIds[localizationChallengeSessionPosition];
  return localizationChallengeById(id);
}

function resetChallengePerformance() {
  localizationChallengePerformance = Object.fromEntries(
    nerveDeficits.map((item) => [item.id, { attempts: 0, correct: 0 }]),
  );
  localizationChallengeMisses = [];
}

function challengeDifficultyLabel(value) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : '';
}

function challengeModeNote(difficulty) {
  if (difficulty === 'adaptive') {
    return 'Adaptive mode uses all cases and brings another case from a missed nerve forward when possible.';
  }
  const count = localizationChallengesForDifficulty(difficulty).length;
  return `${challengeDifficultyLabel(difficulty)} session · ${count} shuffled case${count === 1 ? '' : 's'}.`;
}

function syncChallengeDifficultyButtons() {
  document.querySelectorAll('.challenge-difficulty-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.challengeDifficulty === localizationChallengeDifficulty);
  });
  document.querySelector('#challenge-mode-note').textContent = challengeModeNote(localizationChallengeDifficulty);
}

function startLocalizationChallengeSession(difficulty = localizationChallengeDifficulty) {
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
}

function localizationChallengeVisibleKeys(challenge) {
  const item = nerveDeficitById(challenge?.nerveId);
  const level = lesionLevelById(item, challenge?.levelId);
  if (!item || !level) return new Set();
  return new Set([
    item.nerveKey,
    ...(level.affectedMotorKeys ?? []),
    ...(level.sparedMotorKeys ?? []),
    ...(level.contextKeys ?? []),
  ]);
}

function syncChallengeSubmit() {
  const submit = document.querySelector('#challenge-submit');
  submit.disabled = localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId;
}

function renderChallengeLevelOptions() {
  const container = document.querySelector('#challenge-level-options');
  container.innerHTML = '';
  if (!selectedChallengeNerveId) {
    container.innerHTML = '<p class="challenge-empty">Choose a nerve first.</p>';
    syncChallengeSubmit();
    return;
  }

  const item = nerveDeficitById(selectedChallengeNerveId);
  (item?.lesionLevels ?? []).forEach((level) => {
    const button = document.createElement('button');
    button.className = 'branch-button challenge-level-button';
    button.type = 'button';
    button.dataset.levelId = level.id;
    button.innerHTML = `<b>${level.label}</b><span>${level.subtitle}</span>`;
    button.addEventListener('click', () => {
      if (localizationChallengeAnswered) return;
      selectedChallengeLevelId = level.id;
      document.querySelectorAll('.challenge-level-button').forEach((node) => {
        node.classList.toggle('active', node.dataset.levelId === level.id);
      });
      syncChallengeSubmit();
    });
    container.appendChild(button);
  });
  syncChallengeSubmit();
}

function renderChallengeNerveOptions() {
  const container = document.querySelector('#challenge-nerve-options');
  container.innerHTML = '';
  nerveDeficits.forEach((item) => {
    const button = document.createElement('button');
    button.className = 'branch-button challenge-nerve-button';
    button.type = 'button';
    button.dataset.nerveId = item.id;
    button.innerHTML = `<b>${item.name}</b><span>${item.roots}</span>`;
    button.addEventListener('click', () => {
      if (localizationChallengeAnswered) return;
      selectedChallengeNerveId = item.id;
      selectedChallengeLevelId = null;
      document.querySelectorAll('.challenge-nerve-button').forEach((node) => {
        node.classList.toggle('active', node.dataset.nerveId === item.id);
      });
      renderChallengeLevelOptions();
    });
    container.appendChild(button);
  });
}

function setChallengeCaseVisibility(visible) {
  const ids = [
    'challenge-progress', 'challenge-title', 'challenge-stem', 'challenge-findings',
    'challenge-submit', 'challenge-feedback', 'challenge-next',
  ];
  ids.forEach((id) => {
    const node = document.querySelector(`#${id}`);
    if (node) node.hidden = !visible;
  });
  document.querySelector('#challenge-nerve-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);
  document.querySelector('#challenge-level-options')?.closest('.challenge-answer-block')?.toggleAttribute('hidden', !visible);
}

function setChallengeNeutralViewer() {
  restoreAll();
  Object.keys(anatomicalGroups).forEach((system) => setSystemVisibility(system, system === 'skeleton', false));
  allMeshes().forEach((mesh) => {
    mesh.visible = mesh.userData.system === 'skeleton' && (mesh.userData.isRealAnatomy || !replacedStructures.has(mesh.userData.structureKey));
  });
  clearHighlight();
  fitCameraToMeshes(allMeshes().filter((mesh) => mesh.visible), 1.2);
}

function renderLocalizationChallenge() {
  const challenge = currentLocalizationChallenge();
  if (!challenge) {
    renderLocalizationChallengeSummary();
    return;
  }

  setChallengeCaseVisibility(true);
  document.querySelector('#challenge-session-summary').hidden = true;
  localizationChallengeAnswered = false;
  selectedChallengeNerveId = null;
  selectedChallengeLevelId = null;
  const total = localizationChallengeSessionIds.length;
  document.querySelector('#challenge-progress').textContent = `Case ${localizationChallengeSessionPosition + 1} of ${total} · ${challengeDifficultyLabel(challenge.difficulty)}`;
  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;
  document.querySelector('#challenge-title').textContent = challenge.title;
  document.querySelector('#challenge-stem').textContent = challenge.stem;
  document.querySelector('#challenge-findings').innerHTML = challenge.findings.map((finding) => `<span>${finding}</span>`).join('');
  document.querySelector('#challenge-feedback').hidden = true;
  document.querySelector('#challenge-feedback').className = 'challenge-feedback';
  document.querySelector('#challenge-next').hidden = true;
  document.querySelector('#challenge-next').textContent = localizationChallengeSessionPosition === total - 1 ? 'View session summary' : 'Next case';
  document.querySelector('#challenge-submit').hidden = false;
  document.querySelector('#challenge-submit').disabled = true;

  renderChallengeNerveOptions();
  renderChallengeLevelOptions();
  setChallengeNeutralViewer();
  setModeBadge(`Localization Challenge · ${challengeDifficultyLabel(localizationChallengeDifficulty)} · ${localizationChallengeSessionPosition + 1}/${total}`);
}

function revealLocalizationChallenge(challenge) {
  const item = nerveDeficitById(challenge?.nerveId);
  const level = lesionLevelById(item, challenge?.levelId);
  if (!item || !level) return;

  const visibleKeys = localizationChallengeVisibleKeys(challenge);
  const enabledSystems = { skeleton: false, muscles: false, nerves: false, vessels: false, ligaments: false };
  allMeshes().forEach((mesh) => {
    if (visibleKeys.has(mesh.userData.structureKey) && enabledSystems[mesh.userData.system] != null) {
      enabledSystems[mesh.userData.system] = true;
    }
  });
  Object.entries(enabledSystems).forEach(([system, visible]) => setSystemVisibility(system, visible, false));
  allMeshes().forEach((mesh) => { mesh.visible = visibleKeys.has(mesh.userData.structureKey); });

  clearHighlight();
  highlightStructure(item.nerveKey, 0x9e3346, 1.0);
  (level.affectedMotorKeys ?? []).forEach((key) => highlightStructure(key, 0xa66d2e, 0.92));
  (level.sparedMotorKeys ?? []).forEach((key) => highlightStructure(key, 0x2d7c52, 0.82));

  const nerveMesh = allMeshes().find((mesh) => mesh.userData.structureKey === item.nerveKey && mesh.visible);
  if (nerveMesh) {
    selectedMesh = nerveMesh;
    renderInfo(item.nerveKey);
  }

  setModeBadge(`Challenge Reveal · ${item.name} · ${level.label}`);
  fitCameraToMeshes(allMeshes().filter((mesh) => visibleKeys.has(mesh.userData.structureKey)), item.padding ?? 1.24);
}

function promoteAdaptiveFollowUp(nerveId) {
  if (localizationChallengeDifficulty !== 'adaptive') return;
  const targetPosition = localizationChallengeSessionPosition + 1;
  const followUpPosition = localizationChallengeSessionIds.findIndex((id, index) => {
    if (index <= localizationChallengeSessionPosition) return false;
    return localizationChallengeById(id)?.nerveId === nerveId;
  });
  if (followUpPosition > targetPosition) {
    [localizationChallengeSessionIds[targetPosition], localizationChallengeSessionIds[followUpPosition]] = [
      localizationChallengeSessionIds[followUpPosition],
      localizationChallengeSessionIds[targetPosition],
    ];
  }
}

function recordChallengePerformance(challenge, correct) {
  const stats = localizationChallengePerformance[challenge.nerveId] ?? { attempts: 0, correct: 0 };
  stats.attempts += 1;
  if (correct) stats.correct += 1;
  localizationChallengePerformance[challenge.nerveId] = stats;

  if (!correct) {
    localizationChallengeMisses.push({
      challengeId: challenge.id,
      nerveId: challenge.nerveId,
      levelId: challenge.levelId,
      title: challenge.title,
    });
    promoteAdaptiveFollowUp(challenge.nerveId);
  }
}

function submitLocalizationChallenge() {
  if (localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId) return;
  const challenge = currentLocalizationChallenge();
  if (!challenge) return;

  localizationChallengeAnswered = true;
  localizationChallengeAttempts += 1;
  const correct = selectedChallengeNerveId === challenge.nerveId && selectedChallengeLevelId === challenge.levelId;
  if (correct) localizationChallengeCorrect += 1;
  recordChallengePerformance(challenge, correct);

  const answerNerve = nerveDeficitById(challenge.nerveId);
  const answerLevel = lesionLevelById(answerNerve, challenge.levelId);
  const feedback = document.querySelector('#challenge-feedback');
  feedback.hidden = false;
  feedback.className = `challenge-feedback ${correct ? 'correct' : 'incorrect'}`;
  document.querySelector('#challenge-feedback-title').textContent = correct ? 'Correct localization.' : 'Not quite.';
  document.querySelector('#challenge-feedback-answer').textContent = `Answer: ${answerNerve?.name ?? challenge.nerveId} · ${answerLevel?.label ?? challenge.levelId}`;
  document.querySelector('#challenge-feedback-explanation').textContent = challenge.explanation;
  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;
  document.querySelector('#challenge-next').hidden = false;
  syncChallengeSubmit();
  revealLocalizationChallenge(challenge);
}

function renderLocalizationChallengeSummary() {
  setChallengeCaseVisibility(false);
  const summary = document.querySelector('#challenge-session-summary');
  summary.hidden = false;

  const accuracy = localizationChallengeAttempts
    ? Math.round((localizationChallengeCorrect / localizationChallengeAttempts) * 100)
    : 0;
  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;
  document.querySelector('#challenge-summary-score').textContent = `${accuracy}% accuracy · ${localizationChallengeCorrect}/${localizationChallengeAttempts} correct`;

  const attemptedStats = Object.entries(localizationChallengePerformance)
    .filter(([, stats]) => stats.attempts > 0)
    .map(([nerveId, stats]) => ({ nerveId, ...stats, accuracy: stats.correct / stats.attempts }));
  const weakest = attemptedStats.length
    ? [...attemptedStats].sort((a, b) => a.accuracy - b.accuracy || b.attempts - a.attempts)[0]
    : null;
  const weakestNerve = weakest ? nerveDeficitById(weakest.nerveId) : null;
  document.querySelector('#challenge-summary-focus').textContent = localizationChallengeMisses.length
    ? `Review focus: ${weakestNerve?.name ?? weakest?.nerveId}. Revisit the missed lesion-level clues below, then run another adaptive session.`
    : 'No missed localizations in this session. Try a harder or adaptive session to keep testing discrimination between lesion levels.';

  document.querySelector('#challenge-nerve-summary').innerHTML = attemptedStats.map((stats) => {
    const item = nerveDeficitById(stats.nerveId);
    const percent = Math.round(stats.accuracy * 100);
    return `<div><span>${item?.name ?? stats.nerveId}</span><b>${stats.correct}/${stats.attempts}</b><em>${percent}%</em></div>`;
  }).join('');

  document.querySelector('#challenge-missed-list').innerHTML = localizationChallengeMisses.length
    ? localizationChallengeMisses.map((miss) => {
        const item = nerveDeficitById(miss.nerveId);
        const level = lesionLevelById(item, miss.levelId);
        return `<div><b>${item?.name ?? miss.nerveId} · ${level?.label ?? miss.levelId}</b><span>${miss.title}</span></div>`;
      }).join('')
    : '<p class="challenge-empty">No missed localizations.</p>';

  setChallengeNeutralViewer();
  setModeBadge(`Localization Summary · ${challengeDifficultyLabel(localizationChallengeDifficulty)} · ${accuracy}%`);
}

document.querySelectorAll('.challenge-difficulty-button').forEach((button) => {
  button.addEventListener('click', () => {
    if (!localizationChallengeMode) return;
    startLocalizationChallengeSession(button.dataset.challengeDifficulty);
  });
});

document.querySelector('#challenge-submit').addEventListener('click', submitLocalizationChallenge);
document.querySelector('#challenge-next').addEventListener('click', () => {
  if (localizationChallengeSessionPosition >= localizationChallengeSessionIds.length - 1) {
    renderLocalizationChallengeSummary();
    return;
  }
  localizationChallengeSessionPosition += 1;
  renderLocalizationChallenge();
});
document.querySelector('#challenge-restart').addEventListener('click', () => {
  startLocalizationChallengeSession(localizationChallengeDifficulty);
});

document.querySelector('#localization-challenge-btn').addEventListener('click', () => {
  const nextState = !localizationChallengeMode;
  deactivateStudyModes('localization-challenge');
  localizationChallengeMode = nextState;
  document.querySelector('#localization-challenge-btn').classList.toggle('active', localizationChallengeMode);
  document.querySelector('#localization-challenge-card').hidden = !localizationChallengeMode;
  if (localizationChallengeMode) {
    startLocalizationChallengeSession(localizationChallengeDifficulty);
  } else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});
'''

text = text[:start] + new_block + text[end:]
main_path.write_text(text)

style_path = Path('src/style.css')
style = style_path.read_text()
marker = '/* v0.3.5 adaptive localization sessions */'
if marker not in style:
    style += r'''

/* v0.3.5 adaptive localization sessions */
.challenge-session-controls {
  margin-top: 15px;
  padding: 13px;
  border: 1px solid #33413f;
  border-radius: 12px;
  background: #111a18;
}
.challenge-difficulty-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 7px;
}
.challenge-difficulty-button {
  min-height: 38px;
  font-size: 11px;
}
.challenge-difficulty-button.active {
  background: #26423a;
  border-color: #6b998a;
  color: #e5f5ef;
}
.challenge-mode-note {
  margin: 9px 0 0;
  color: #83928e;
  font-size: 10.5px;
  line-height: 1.45;
}
.challenge-session-summary {
  margin-top: 16px;
  padding: 15px;
  border: 1px solid #3a4f49;
  border-radius: 14px;
  background: linear-gradient(180deg, #13211d, #101917);
}
.challenge-session-summary > strong {
  display: block;
  margin-top: 8px;
  color: #e7f2ee;
  font-size: 19px;
}
.challenge-session-summary > p {
  margin: 9px 0 0;
  color: #a8b7b2;
  font-size: 12px;
  line-height: 1.5;
}
.challenge-nerve-summary {
  display: grid;
  gap: 7px;
  margin-top: 14px;
}
.challenge-nerve-summary div {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  padding: 9px 10px;
  border: 1px solid #2e3d3a;
  border-radius: 10px;
  background: #101816;
}
.challenge-nerve-summary span { color: #c8d5d1; font-size: 12px; }
.challenge-nerve-summary b { color: #edf4f2; font-size: 12px; }
.challenge-nerve-summary em { color: #86a79c; font-size: 11px; font-style: normal; }
.challenge-missed-block {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #2b3936;
}
.challenge-missed-list { display: grid; gap: 7px; }
.challenge-missed-list div {
  display: grid;
  gap: 3px;
  padding: 9px 10px;
  border-left: 3px solid #8d5f65;
  background: #191518;
}
.challenge-missed-list b { color: #e3cdd0; font-size: 11.5px; }
.challenge-missed-list span { color: #9f8e91; font-size: 10.5px; line-height: 1.4; }
'''
style_path.write_text(style)

package_path = Path('package.json')
package_text = package_path.read_text()
package_text = replace_exact(package_text, '"version": "0.3.4"', '"version": "0.3.5"', 'package version')
package_path.write_text(package_text)
