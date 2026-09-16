from pathlib import Path


def replace_exact(text, old, new, label):
    if old not in text:
        raise SystemExit(f'Missing patch anchor: {label}')
    return text.replace(old, new, 1)


main_path = Path('src/main.js')
text = main_path.read_text()

text = replace_exact(
    text,
    "import { nerveDeficits, nerveDeficitById, nerveDeficitKeys, lesionLevelById } from './data/nerveDeficits.js';\n",
    "import { nerveDeficits, nerveDeficitById, nerveDeficitKeys, lesionLevelById } from './data/nerveDeficits.js';\nimport { localizationChallenges, localizationChallengeByIndex } from './data/localizationChallenges.js';\n",
    'challenge import',
)

text = replace_exact(
    text,
    '''        <button id="nerve-deficit-btn" class="tool nerve-accent">Nerve deficits</button>\n        <button id="plexus-btn" class="tool">Brachial plexus</button>''',
    '''        <button id="nerve-deficit-btn" class="tool nerve-accent">Nerve deficits</button>\n        <button id="localization-challenge-btn" class="tool challenge-accent">Localization challenge</button>\n        <button id="plexus-btn" class="tool">Brachial plexus</button>''',
    'challenge tool button',
)

challenge_card = '''      <section id="localization-challenge-card" class="learning-card" hidden>
        <div class="card-head">
          <div>
            <span class="label">Clinical reasoning</span>
            <strong>Localization Challenge</strong>
          </div>
          <span id="challenge-score" class="status-pill">0 / 0</span>
        </div>
        <p id="challenge-progress" class="challenge-progress">Case 1 of ${localizationChallenges.length}</p>
        <strong id="challenge-title" class="challenge-title"></strong>
        <p id="challenge-stem" class="quiz-prompt"></p>
        <div id="challenge-findings" class="challenge-finding-chips"></div>

        <div class="challenge-answer-block">
          <span class="section-label">1 · Choose the nerve</span>
          <div id="challenge-nerve-options" class="branch-list study-grid"></div>
        </div>
        <div class="challenge-answer-block">
          <span class="section-label">2 · Choose the lesion level</span>
          <div id="challenge-level-options" class="branch-list"></div>
        </div>

        <button id="challenge-submit" class="tool full challenge-submit" type="button" disabled>Submit localization</button>
        <div id="challenge-feedback" class="challenge-feedback" hidden aria-live="polite">
          <strong id="challenge-feedback-title"></strong>
          <p id="challenge-feedback-answer"></p>
          <p id="challenge-feedback-explanation"></p>
        </div>
        <button id="challenge-next" class="tool full" type="button" hidden>Next case</button>
        <p class="simulator-note">Educational reasoning exercise only. The 3D answer reveal uses the current modeled anatomy and does not represent patient-specific diagnosis.</p>
      </section>

'''
text = replace_exact(
    text,
    '''      <section id="plexus-card" class="learning-card" hidden>''',
    challenge_card + '''      <section id="plexus-card" class="learning-card" hidden>''',
    'challenge card',
)

text = replace_exact(
    text,
    "let motorSimulationState = 'lesion';\nlet quizMode = false;",
    "let motorSimulationState = 'lesion';\nlet localizationChallengeMode = false;\nlet localizationChallengeIndex = 0;\nlet localizationChallengeCorrect = 0;\nlet localizationChallengeAttempts = 0;\nlet localizationChallengeAnswered = false;\nlet selectedChallengeNerveId = null;\nlet selectedChallengeLevelId = null;\nlet quizMode = false;",
    'challenge state',
)

text = replace_exact(
    text,
    '''  if (except !== 'plexus') {
    plexusMode = false;
    document.querySelector('#plexus-btn').classList.remove('active');
    document.querySelector('#plexus-card').hidden = true;
  }''',
    '''  if (except !== 'localization-challenge') {
    localizationChallengeMode = false;
    document.querySelector('#localization-challenge-btn').classList.remove('active');
    document.querySelector('#localization-challenge-card').hidden = true;
  }
  if (except !== 'plexus') {
    plexusMode = false;
    document.querySelector('#plexus-btn').classList.remove('active');
    document.querySelector('#plexus-card').hidden = true;
  }''',
    'challenge deactivation',
)

text = replace_exact(
    text,
    '''  if (quizMode) return answerQuiz(hit.userData.structureKey);
  setSelected(hit);''',
    '''  if (quizMode) return answerQuiz(hit.userData.structureKey);
  if (localizationChallengeMode) return;
  setSelected(hit);''',
    'challenge pointer lock',
)

challenge_logic = r'''
function currentLocalizationChallenge() {
  return localizationChallengeByIndex(localizationChallengeIndex);
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
  if (!challenge) return;

  localizationChallengeAnswered = false;
  selectedChallengeNerveId = null;
  selectedChallengeLevelId = null;
  document.querySelector('#challenge-progress').textContent = `Case ${localizationChallengeIndex + 1} of ${localizationChallenges.length}`;
  document.querySelector('#challenge-score').textContent = `${localizationChallengeCorrect} / ${localizationChallengeAttempts}`;
  document.querySelector('#challenge-title').textContent = challenge.title;
  document.querySelector('#challenge-stem').textContent = challenge.stem;
  document.querySelector('#challenge-findings').innerHTML = challenge.findings.map((finding) => `<span>${finding}</span>`).join('');
  document.querySelector('#challenge-feedback').hidden = true;
  document.querySelector('#challenge-feedback').className = 'challenge-feedback';
  document.querySelector('#challenge-next').hidden = true;
  document.querySelector('#challenge-submit').disabled = true;

  renderChallengeNerveOptions();
  renderChallengeLevelOptions();
  setChallengeNeutralViewer();
  setModeBadge(`Localization Challenge · ${localizationChallengeIndex + 1}/${localizationChallenges.length}`);
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

function submitLocalizationChallenge() {
  if (localizationChallengeAnswered || !selectedChallengeNerveId || !selectedChallengeLevelId) return;
  const challenge = currentLocalizationChallenge();
  if (!challenge) return;

  localizationChallengeAnswered = true;
  localizationChallengeAttempts += 1;
  const correct = selectedChallengeNerveId === challenge.nerveId && selectedChallengeLevelId === challenge.levelId;
  if (correct) localizationChallengeCorrect += 1;

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

document.querySelector('#challenge-submit').addEventListener('click', submitLocalizationChallenge);
document.querySelector('#challenge-next').addEventListener('click', () => {
  localizationChallengeIndex = (localizationChallengeIndex + 1) % localizationChallenges.length;
  renderLocalizationChallenge();
});

document.querySelector('#localization-challenge-btn').addEventListener('click', () => {
  const nextState = !localizationChallengeMode;
  deactivateStudyModes('localization-challenge');
  localizationChallengeMode = nextState;
  document.querySelector('#localization-challenge-btn').classList.toggle('active', localizationChallengeMode);
  document.querySelector('#localization-challenge-card').hidden = !localizationChallengeMode;
  if (localizationChallengeMode) {
    renderLocalizationChallenge();
  } else {
    restoreAll();
    setModeBadge('');
    fitCameraToAnatomy();
  }
});

'''
text = replace_exact(
    text,
    "const branchContainer = document.querySelector('#plexus-branches');",
    challenge_logic + "const branchContainer = document.querySelector('#plexus-branches');",
    'challenge logic',
)

text = replace_exact(
    text,
    '''      } else if (nerveDeficitMode) {
        mesh.visible = new Set(nerveDeficitKeys(nerveDeficitById(activeNerveDeficitId))).has(structureKey);
      } else {''',
    '''      } else if (nerveDeficitMode) {
        mesh.visible = new Set(nerveDeficitKeys(nerveDeficitById(activeNerveDeficitId))).has(structureKey);
      } else if (localizationChallengeMode) {
        mesh.visible = localizationChallengeAnswered
          ? localizationChallengeVisibleKeys(currentLocalizationChallenge()).has(structureKey)
          : item.system === 'skeleton';
      } else {''',
    'challenge hydration visibility',
)

text = replace_exact(
    text,
    '''}).then(() => {
  if (nerveDeficitMode) renderNerveDeficit(activeNerveDeficitId);''',
    '''}).then(() => {
  if (localizationChallengeMode) {
    if (localizationChallengeAnswered) revealLocalizationChallenge(currentLocalizationChallenge());
    else renderLocalizationChallenge();
  }
  else if (nerveDeficitMode) renderNerveDeficit(activeNerveDeficitId);''',
    'challenge hydration completion',
)

main_path.write_text(text)

style_path = Path('src/style.css')
style = style_path.read_text()
challenge_styles = r'''

/* v0.3.4 clinical localization challenge */
.challenge-accent {
  border-color: #4a655e;
  background: linear-gradient(180deg, #1c2c29, #172320);
}
.challenge-progress {
  margin: 14px 0 6px;
  color: #7f8b9a;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.challenge-title {
  display: block;
  color: #edf2f7;
  font-size: 17px;
  line-height: 1.35;
}
.challenge-finding-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 12px 0 4px;
}
.challenge-finding-chips span {
  padding: 7px 9px;
  border: 1px solid #3e5060;
  border-radius: 999px;
  background: #16202a;
  color: #c9d5df;
  font-size: 11px;
  font-weight: 700;
}
.challenge-answer-block {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #28313c;
}
.challenge-answer-block .section-label { margin-bottom: 8px; }
.challenge-empty {
  margin: 8px 0 0;
  color: #778391;
  font-size: 12px;
}
.challenge-submit { margin-top: 16px; }
.challenge-submit:not(:disabled) {
  border-color: #587b70;
  background: #20342e;
  color: #e2f2ec;
}
.challenge-feedback {
  margin-top: 14px;
  padding: 14px;
  border: 1px solid #3a4450;
  border-radius: 12px;
  background: #10161d;
}
.challenge-feedback > strong {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
}
.challenge-feedback p {
  margin: 6px 0 0;
  color: #b9c4d0;
  font-size: 12px;
  line-height: 1.5;
}
.challenge-feedback.correct {
  border-color: #315e45;
  background: #112018;
}
.challenge-feedback.correct > strong { color: #cfe9d9; }
.challenge-feedback.incorrect {
  border-color: #68434a;
  background: #211519;
}
.challenge-feedback.incorrect > strong { color: #ebccd1; }
'''
if '/* v0.3.4 clinical localization challenge */' not in style:
    style += challenge_styles
style_path.write_text(style)

package_path = Path('package.json')
package_text = package_path.read_text()
package_text = replace_exact(package_text, '"version": "0.3.3"', '"version": "0.3.4"', 'package version')
package_path.write_text(package_text)
