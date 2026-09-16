from pathlib import Path

main_path = Path('src/main.js')
style_path = Path('src/style.css')
main = main_path.read_text()


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'{label} anchor not found')
    return text.replace(old, new, 1)

main = replace_once(
    main,
    "import { buildMasteryDashboard } from './learning/masteryDashboard.js';\n",
    "import { buildMasteryDashboard } from './learning/masteryDashboard.js';\nimport { buildRemediationSession, remediationFocusLabel } from './learning/remediation.js';\n",
    'remediation import',
)

main = replace_once(
    main,
    "let masteryDashboardMode = false;\nlet localizationChallengeDifficulty = 'adaptive';",
    "let masteryDashboardMode = false;\nlet remediationFocus = null;\nlet localizationChallengeDifficulty = 'adaptive';",
    'remediation state',
)

old_lesion = """    return `<div class=\"mastery-lesion-row ${statusClass}\"><div class=\"mastery-lesion-copy\"><span>${lesion.nerveName}</span><b>${lesion.label}</b></div><div class=\"mastery-lesion-score\"><em>${lesion.mastery}</em><span>${accuracyLabel}</span></div><div class=\"mastery-meter\"><span style=\"width:${lesion.attempts ? Math.max(4, percent) : 0}%\"></span></div></div>`;"""
new_lesion = """    return `<button type=\"button\" class=\"mastery-lesion-row ${statusClass}\" data-remediate-nerve=\"${lesion.nerveId}\" data-remediate-level=\"${lesion.levelId}\" title=\"Practice ${lesion.nerveName} · ${lesion.label}\"><div class=\"mastery-lesion-copy\"><span>${lesion.nerveName}</span><b>${lesion.label}</b></div><div class=\"mastery-lesion-score\"><em>${lesion.mastery}</em><span>${accuracyLabel}</span><strong class=\"mastery-practice-cue\">Practice</strong></div><div class=\"mastery-meter\"><span style=\"width:${lesion.attempts ? Math.max(4, percent) : 0}%\"></span></div></button>`;"""
main = replace_once(main, old_lesion, new_lesion, 'mastery lesion row')

old_weak = """        return `<div><b>${lesion.nerveName} · ${lesion.label}</b><span>${percent}% across ${lesion.attempts} attempt${lesion.attempts === 1 ? '' : 's'} · ${lesion.mastery}</span></div>`;"""
new_weak = """        return `<button type=\"button\" class=\"mastery-weak-item\" data-remediate-nerve=\"${lesion.nerveId}\" data-remediate-level=\"${lesion.levelId}\"><b>${lesion.nerveName} · ${lesion.label}</b><span>${percent}% across ${lesion.attempts} attempt${lesion.attempts === 1 ? '' : 's'} · ${lesion.mastery}</span><em>Practice nerve family →</em></button>`;"""
main = replace_once(main, old_weak, new_weak, 'weak concept card')

old_review_end = """  reviewButton.textContent = dashboard.dueReviewCount
    ? `Practice ${dashboard.dueReviewCount} due review${dashboard.dueReviewCount === 1 ? '' : 's'}`
    : 'No review due';
}"""
new_review_end = """  reviewButton.textContent = dashboard.dueReviewCount
    ? `Practice ${dashboard.dueReviewCount} due review${dashboard.dueReviewCount === 1 ? '' : 's'}`
    : 'No review due';

  document.querySelectorAll('[data-remediate-nerve][data-remediate-level]').forEach((button) => {
    button.addEventListener('click', () => {
      launchTargetedRemediation(button.dataset.remediateNerve, button.dataset.remediateLevel);
    });
  });
}"""
main = replace_once(main, old_review_end, new_review_end, 'mastery remediation listeners')

record_anchor = "\nfunction recordCompletedChallengeSession() {"
remediation_fn = """
function launchTargetedRemediation(nerveId, levelId) {
  const pool = buildRemediationSession(localizationChallenges, nerveId, levelId);
  if (!pool.length) return;

  remediationFocus = { nerveId, levelId };
  deactivateStudyModes('localization-challenge');
  masteryDashboardMode = false;
  document.querySelector('#mastery-dashboard-btn').classList.remove('active');
  document.querySelector('#mastery-dashboard-card').hidden = true;
  localizationChallengeMode = true;
  document.querySelector('#localization-challenge-btn').classList.add('active');
  document.querySelector('#localization-challenge-card').hidden = false;
  startLocalizationChallengeSession('remediation');
}

function recordCompletedChallengeSession() {"""
main = replace_once(main, record_anchor, '\n' + remediation_fn, 'remediation launch function')

old_mode = """  if (difficulty === 'review') {
    const due = challengeProgressSummary().reviewQueue.length;
    return due
      ? `Spaced review · ${due} challenge${due === 1 ? '' : 's'} due on this browser.`
      : 'No spaced-review items are due yet, so Review due will use the full challenge bank.';
  }
  const count = localizationChallengesForDifficulty(difficulty).length;"""
new_mode = """  if (difficulty === 'review') {
    const due = challengeProgressSummary().reviewQueue.length;
    return due
      ? `Spaced review · ${due} challenge${due === 1 ? '' : 's'} due on this browser.`
      : 'No spaced-review items are due yet, so Review due will use the full challenge bank.';
  }
  if (difficulty === 'remediation' && remediationFocus) {
    const focus = remediationFocusLabel(nerveDeficits, remediationFocus.nerveId, remediationFocus.levelId);
    const count = buildRemediationSession(localizationChallenges, remediationFocus.nerveId, remediationFocus.levelId).length;
    return `Targeted remediation · ${focus.nerveName} · ${focus.levelLabel} first, then ${Math.max(0, count - 1)} same-nerve comparator${count - 1 === 1 ? '' : 's'}.`;
  }
  const count = localizationChallengesForDifficulty(difficulty).length;"""
main = replace_once(main, old_mode, new_mode, 'remediation mode note')

old_start = """function startLocalizationChallengeSession(difficulty = localizationChallengeDifficulty) {
  localizationChallengeDifficulty = difficulty;
  const pool = difficulty === 'review' ? reviewChallengePool() : localizationChallengesForDifficulty(difficulty);
  localizationChallengeSessionIds = shuffleChallenges(pool).map((challenge) => challenge.id);"""
new_start = """function startLocalizationChallengeSession(difficulty = localizationChallengeDifficulty) {
  localizationChallengeDifficulty = difficulty;
  let pool;
  if (difficulty === 'review') pool = reviewChallengePool();
  else if (difficulty === 'remediation' && remediationFocus) {
    pool = buildRemediationSession(localizationChallenges, remediationFocus.nerveId, remediationFocus.levelId);
  } else pool = localizationChallengesForDifficulty(difficulty);
  localizationChallengeSessionIds = difficulty === 'remediation'
    ? pool.map((challenge) => challenge.id)
    : shuffleChallenges(pool).map((challenge) => challenge.id);"""
main = replace_once(main, old_start, new_start, 'remediation session pool')

old_diff_listener = """document.querySelectorAll('.challenge-difficulty-button').forEach((button) => {
  button.addEventListener('click', () => {
    if (!localizationChallengeMode) return;
    startLocalizationChallengeSession(button.dataset.challengeDifficulty);
  });
});"""
new_diff_listener = """document.querySelectorAll('.challenge-difficulty-button').forEach((button) => {
  button.addEventListener('click', () => {
    if (!localizationChallengeMode) return;
    remediationFocus = null;
    startLocalizationChallengeSession(button.dataset.challengeDifficulty);
  });
});"""
main = replace_once(main, old_diff_listener, new_diff_listener, 'difficulty listener reset')

old_main_entry = """  if (localizationChallengeMode) {
    startLocalizationChallengeSession(localizationChallengeDifficulty);
  } else {"""
new_main_entry = """  if (localizationChallengeMode) {
    if (localizationChallengeDifficulty === 'remediation') {
      remediationFocus = null;
      localizationChallengeDifficulty = 'adaptive';
    }
    startLocalizationChallengeSession(localizationChallengeDifficulty);
  } else {"""
main = replace_once(main, old_main_entry, new_main_entry, 'main challenge entry')

old_summary = """  document.querySelector('#challenge-summary-focus').textContent = localizationChallengeMisses.length
    ? `Review focus: ${weakestNerve?.name ?? weakest?.nerveId}. Revisit the missed lesion-level clues below, then run another adaptive session.`
    : 'No missed localizations in this session. Try a harder or adaptive session to keep testing discrimination between lesion levels.';"""
new_summary = """  const remediationSummary = localizationChallengeDifficulty === 'remediation' && remediationFocus;
  const remediationLabel = remediationSummary
    ? remediationFocusLabel(nerveDeficits, remediationFocus.nerveId, remediationFocus.levelId)
    : null;
  document.querySelector('#challenge-summary-focus').textContent = localizationChallengeMisses.length
    ? remediationSummary
      ? `Remediation focus remains ${remediationLabel.nerveName} · ${remediationLabel.levelLabel}. Repeat the family if the distinguishing clues are not secure yet.`
      : `Review focus: ${weakestNerve?.name ?? weakest?.nerveId}. Revisit the missed lesion-level clues below, then run another adaptive session.`
    : remediationSummary
      ? `Targeted family complete without misses. Return to the Mastery Dashboard or repeat the family later for retention.`
      : 'No missed localizations in this session. Try a harder or adaptive session to keep testing discrimination between lesion levels.';"""
main = replace_once(main, old_summary, new_summary, 'remediation summary')

main_path.write_text(main)

style = style_path.read_text()
style += """

/* v0.3.8 targeted remediation */
button.mastery-lesion-row {
  width: 100%;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  appearance: none;
}
button.mastery-lesion-row:hover {
  transform: translateY(-1px);
  border-color: #6b7890;
  box-shadow: 0 8px 20px rgba(0, 0, 0, .14);
}
.mastery-practice-cue {
  display: block;
  margin-top: 4px;
  color: #90a9c9;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: .08em;
  text-transform: uppercase;
}
.mastery-weak-item {
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 10px 11px;
  border: 1px solid #463b47;
  border-radius: 10px;
  background: #171318;
  color: inherit;
  cursor: pointer;
  text-align: left;
}
.mastery-weak-item:hover { border-color: #765d78; background: #1d171f; }
.mastery-weak-item b { color: #e5d5e7; font-size: 11.5px; }
.mastery-weak-item span { color: #9d8d9f; font-size: 10.5px; line-height: 1.4; }
.mastery-weak-item em { color: #b49fc0; font-size: 10px; font-style: normal; font-weight: 700; }
.mastery-weak-item:focus-visible,
button.mastery-lesion-row:focus-visible { outline: 3px solid #8096b8; outline-offset: 2px; }
"""
style_path.write_text(style)

print('Applied Anatomica v0.3.8 targeted remediation UI patch.')
