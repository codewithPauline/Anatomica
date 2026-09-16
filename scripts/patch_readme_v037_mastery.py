from pathlib import Path

path = Path('README.md')
text = path.read_text()

text = text.replace(
    '## Current milestone — v0.3.6 Persistent Mastery + Spaced Review',
    '## Current milestone — v0.3.7 Longitudinal Mastery Dashboard',
    1,
)
text = text.replace(
    'Anatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, adaptive clinical-localization sessions, and browser-local mastery tracking. Learners can choose a difficulty, work through shuffled vignettes, receive a 3D answer reveal, review performance across sessions, and return to concepts when spaced review is due.',
    'Anatomica now connects upper-limb, wrist, and hand anatomy to interactive clinical cases, peripheral-nerve localization, lesion-level reasoning, focused motor examination, adaptive clinical-localization sessions, browser-local mastery tracking, and longitudinal learning analytics. Learners can choose a difficulty, work through shuffled vignettes, receive a 3D answer reveal, return for spaced review, and inspect progress across all 10 modeled lesion patterns in a dedicated mastery dashboard.',
    1,
)

old_bullet = '- **Persistent browser-local mastery tracking with spaced review, due-review sessions, per-nerve summaries, and learner-controlled data clearing**\n'
new_bullet = old_bullet + '- **Longitudinal Mastery Dashboard with recent-session accuracy, mastery states across all 10 lesion patterns, weakest-practiced concepts, momentum summaries, and direct due-review access**\n'
if old_bullet not in text:
    raise SystemExit('working-now persistent bullet anchor not found')
text = text.replace(old_bullet, new_bullet, 1)

old_ci = '- Clinical-content integrity validation in CI so cases, nerve profiles, lesion levels, motor tests, and localization challenges cannot silently reference missing content\n'
new_ci = '- Clinical-content, learner-progress, and mastery-dashboard validation in CI so anatomy references, review scheduling, and learning-analytics summaries are checked automatically\n'
if old_ci not in text:
    raise SystemExit('CI bullet anchor not found')
text = text.replace(old_ci, new_ci, 1)

old_progress_link = "See [`docs/LOCALIZATION_CHALLENGE_MODE.md`](docs/LOCALIZATION_CHALLENGE_MODE.md) for the assessment design, [`docs/ADAPTIVE_CHALLENGE_SESSIONS.md`](docs/ADAPTIVE_CHALLENGE_SESSIONS.md) for the session engine, and [`docs/PERSISTENT_PROGRESS.md`](docs/PERSISTENT_PROGRESS.md) for browser storage, mastery summaries, and spaced-review behavior."
new_progress_link = old_progress_link + '''\n\n### Longitudinal mastery dashboard\n\nv0.3.7 adds a dedicated **Mastery dashboard** that turns the browser-local progress record into a compact longitudinal view. It shows cumulative sessions and accuracy, spaced-review load, recent-session accuracy bars, recent momentum, mastery counts, all 10 lesion-pattern summaries, and the weakest practiced concepts.\n\nThe four mastery labels are intentionally descriptive: **Unseen**, **Developing**, **Practicing**, and **Strong**. They are derived from the learner's own challenge history and are not validated measures of clinical competence. Recent momentum compares short windows of session accuracy and is shown only when enough completed sessions exist.\n\nA due-review action links the dashboard back into the existing spaced-review session, keeping the workflow connected: **measure → identify weakness → review → reassess**.\n\nSee [`docs/MASTERY_DASHBOARD.md`](docs/MASTERY_DASHBOARD.md) for the analytics model, display rules, and limitations.'''
if old_progress_link not in text:
    raise SystemExit('persistent-progress documentation anchor not found')
text = text.replace(old_progress_link, new_progress_link, 1)

old_arch = '''Localization challenges → src/data/localizationChallenges.js\nLearning questions      → src/data/quizQuestions.js\nRendering / modes       → src/main.js + src/engine/'''
new_arch = '''Localization challenges → src/data/localizationChallenges.js\nLearning questions      → src/data/quizQuestions.js\nLearner progress        → src/learning/progressStore.js\nMastery analytics       → src/learning/masteryDashboard.js\nRendering / modes       → src/main.js + src/engine/'''
if old_arch not in text:
    raise SystemExit('asset-architecture anchor not found')
text = text.replace(old_arch, new_arch, 1)

old_learning = '''│   ├── learning/\n│   │   └── progressStore.js          # Browser-local mastery + spaced review'''
new_learning = '''│   ├── learning/\n│   │   ├── progressStore.js            # Browser-local mastery + spaced review\n│   │   └── masteryDashboard.js         # Longitudinal learning-analytics summaries'''
if old_learning not in text:
    raise SystemExit('project-structure learning anchor not found')
text = text.replace(old_learning, new_learning, 1)

old_scripts = '''├── scripts/\n│   └── validate_clinical_cases.mjs     # Clinical-content integrity check'''
new_scripts = '''├── scripts/\n│   ├── validate_clinical_cases.mjs     # Clinical-content integrity check\n│   ├── validate_progress_store.mjs     # Persistence + spaced-review validation\n│   └── validate_mastery_dashboard.mjs  # Dashboard analytics validation'''
if old_scripts not in text:
    raise SystemExit('project-structure scripts anchor not found')
text = text.replace(old_scripts, new_scripts, 1)

old_docs = '''│   ├── PERSISTENT_PROGRESS.md            # Browser-local mastery + spaced review\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations'''
new_docs = '''│   ├── PERSISTENT_PROGRESS.md          # Browser-local mastery + spaced review\n│   ├── MASTERY_DASHBOARD.md            # Longitudinal learning analytics\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations'''
if old_docs not in text:
    raise SystemExit('project-structure docs anchor not found')
text = text.replace(old_docs, new_docs, 1)

old_roadmap = '- [x] Persistent browser-local learner progress with mastery summaries and spaced-review scheduling\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, and learner-progress storage\n'
new_roadmap = '- [x] Persistent browser-local learner progress with mastery summaries and spaced-review scheduling\n- [x] Longitudinal Mastery Dashboard with recent-session trend, lesion-level mastery states, weakest concepts, and due-review access\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, and dashboard analytics\n'
if old_roadmap not in text:
    raise SystemExit('roadmap anchor not found')
text = text.replace(old_roadmap, new_roadmap, 1)

path.write_text(text)
print('Updated README for Anatomica v0.3.7 longitudinal mastery dashboard.')
