from pathlib import Path

path = Path('README.md')
text = path.read_text()

text = text.replace('## Current milestone — v0.3.5 Adaptive Clinical Reasoning', '## Current milestone — v0.3.6 Persistent Mastery + Spaced Review', 1)
text = text.replace(
    'Anatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, and adaptive clinical-localization sessions. Learners can choose a difficulty, work through shuffled vignettes, receive a 3D answer reveal, and finish with performance feedback that identifies missed nerve and lesion-level patterns.',
    'Anatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, adaptive clinical-localization sessions, and browser-local mastery tracking. Learners can choose a difficulty, work through shuffled vignettes, receive a 3D answer reveal, review performance across sessions, and return to concepts when spaced review is due.',
    1,
)
text = text.replace(
    '- **Adaptive Localization Challenge Mode with Easy / Intermediate / Advanced / Adaptive sessions, shuffled cases, per-nerve performance tracking, and post-answer 3D reveal**',
    '- **Adaptive Localization Challenge Mode with Easy / Intermediate / Advanced / Adaptive sessions, shuffled cases, per-nerve performance tracking, and post-answer 3D reveal**\n- **Persistent browser-local mastery tracking with spaced review, due-review sessions, per-nerve summaries, and learner-controlled data clearing**',
    1,
)
anchor = 'This adaptation is deterministic rule-based tutoring logic, not a machine-learning model.\n\nSee [`docs/LOCALIZATION_CHALLENGE_MODE.md`](docs/LOCALIZATION_CHALLENGE_MODE.md) for the assessment design, validation rules, and limitations, and [`docs/ADAPTIVE_CHALLENGE_SESSIONS.md`](docs/ADAPTIVE_CHALLENGE_SESSIONS.md) for the session engine and performance-summary behavior.'
replacement = '''This adaptation is deterministic rule-based tutoring logic, not a machine-learning model.

### Persistent progress and spaced review

v0.3.6 stores completed localization-session history **only in the learner's current browser** using `localStorage`. There is no account, server-side learner profile, or cloud synchronization.

The progress engine tracks performance by peripheral nerve, lesion level, and individual challenge. Correct responses advance a transparent spaced-review schedule and missed responses reset that challenge to the earliest review stage. Review intervals are currently **1, 3, 7, 14, and 30 days**.

The challenge panel shows completed-session count, cumulative accuracy, due-review count, and the current weakest practiced nerve. A **Review due** session pulls challenges whose review date has arrived; if nothing is due yet, the mode falls back to the full challenge bank. Learners can clear all saved progress at any time from the challenge panel.

See [`docs/LOCALIZATION_CHALLENGE_MODE.md`](docs/LOCALIZATION_CHALLENGE_MODE.md) for the assessment design, [`docs/ADAPTIVE_CHALLENGE_SESSIONS.md`](docs/ADAPTIVE_CHALLENGE_SESSIONS.md) for the session engine, and [`docs/PERSISTENT_PROGRESS.md`](docs/PERSISTENT_PROGRESS.md) for browser storage, mastery summaries, and spaced-review behavior.'''
if anchor not in text:
    raise SystemExit('challenge-section anchor not found')
text = text.replace(anchor, replacement, 1)

text = text.replace(
    '│   ├── engine/\n│   │   ├── modelLoader.js',
    '│   ├── learning/\n│   │   └── progressStore.js          # Browser-local mastery + spaced review\n│   ├── engine/\n│   │   ├── modelLoader.js',
    1,
)
text = text.replace(
    '│   ├── ADAPTIVE_CHALLENGE_SESSIONS.md  # Difficulty, shuffling + session feedback\n│   └── MOTOR_TEST_SIMULATOR.md',
    '│   ├── ADAPTIVE_CHALLENGE_SESSIONS.md  # Difficulty, shuffling + session feedback\n│   ├── PERSISTENT_PROGRESS.md            # Browser-local mastery + spaced review\n│   └── MOTOR_TEST_SIMULATOR.md',
    1,
)
text = text.replace(
    '- [x] Adaptive challenge sessions with difficulty modes, shuffling, targeted follow-up, and performance summaries',
    '- [x] Adaptive challenge sessions with difficulty modes, shuffling, targeted follow-up, and performance summaries\n- [x] Persistent browser-local learner progress with mastery summaries and spaced-review scheduling',
    1,
)
text = text.replace(
    '- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, and localization challenges',
    '- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, and learner-progress storage',
    1,
)

path.write_text(text)
