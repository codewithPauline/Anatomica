from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if old not in text:
        raise SystemExit(f"Missing README migration anchor: {label}")
    return text.replace(old, new, 1)


path = Path('README.md')
text = path.read_text()

text = replace_once(
    text,
    '''## Current milestone — v0.4.1 Confidence-Aware Remediation

Anatomica now connects upper-limb anatomy to lesion-level clinical reasoning, alternate vignette presentations, adaptive practice, spaced review, longitudinal mastery analytics, self-rated confidence calibration, and **confidence-aware remediation**. The platform now turns the learner's latest confidence-rated response into an actionable priority queue: high-confidence misses are reviewed first, other unresolved misses next, and correct-but-unsure concepts receive reinforcement without being treated as equivalent to errors.''',
    '''## Current milestone — v0.4.2 Error-Pattern Intelligence

Anatomica now connects upper-limb anatomy to lesion-level clinical reasoning, alternate vignette presentations, adaptive practice, spaced review, longitudinal mastery analytics, confidence-aware remediation, and **choice-aware error-pattern intelligence**. New localization responses preserve the modeled lesion concept the learner actually selected, allowing the Mastery Dashboard to identify repeated confusion pairs and launch focused two-concept drills around distinctions such as radial groove versus PIN or cubital tunnel versus Guyon canal.''',
    'milestone',
)

text = replace_once(
    text,
    '- **Confidence-Aware Remediation with an urgency-ordered priority queue based on each lesion concept\'s latest response, plus direct same-nerve remediation from every priority card**\n',
    '- **Confidence-Aware Remediation with an urgency-ordered priority queue based on each lesion concept\'s latest response, plus direct same-nerve remediation from every priority card**\n- **Error-Pattern Intelligence that records the wrong modeled lesion selected, aggregates reverse-direction errors into one confusion pair, flags recurring pairs, and launches two-concept Confusion Drills**\n',
    'working feature bullet',
)

text = replace_once(
    text,
    '- Clinical-content, learner-progress, mastery-dashboard, targeted-remediation, challenge-variant, confidence-calibration, and confidence-remediation validation in CI so anatomy references, review scheduling, analytics summaries, focused-practice pools, vignette invariants, confidence summaries, and priority-queue behavior are checked automatically\n',
    '- Clinical-content, learner-progress, mastery-dashboard, targeted-remediation, challenge-variant, confidence-calibration, confidence-remediation, and error-pattern validation in CI so anatomy references, review scheduling, analytics summaries, focused-practice pools, vignette invariants, confidence summaries, priority queues, selected-answer persistence, and confusion-pair construction are checked automatically\n',
    'validation summary',
)

section_anchor = '''See [`docs/CONFIDENCE_AWARE_REMEDIATION.md`](docs/CONFIDENCE_AWARE_REMEDIATION.md) for priority rules, resolution behavior, session construction, validation, and limitations.

## Motor Test Simulator'''
section_replacement = '''See [`docs/CONFIDENCE_AWARE_REMEDIATION.md`](docs/CONFIDENCE_AWARE_REMEDIATION.md) for priority rules, resolution behavior, session construction, validation, and limitations.

### Error-pattern intelligence

v0.4.2 records the **modeled localization the learner actually chose** when answering a clinical-localization challenge. If an incorrect answer maps cleanly to another lesion concept in the current bank, Anatomica stores that choice and uses it to build answer-confusion pairs.

Reverse-direction errors are combined. For example, choosing PIN when the correct answer is radial groove and later choosing radial groove when the correct answer is PIN are treated as one **Radial groove ↔ PIN** confusion pair. A single event remains a historical confusion event; two or more events are labeled **Recurring** in the dashboard. The panel also reports how many events were high-confidence misses.

Each pair can launch a two-concept **Confusion Drill** using the existing alternate-vignette, confidence-rating, feedback, 3D-reveal, persistence, and mastery infrastructure. Error patterns are historical learning signals rather than claims that a learner currently holds a stable misconception, and older browser sessions without selected-answer metadata remain valid but do not contribute to these pair counts.

See [`docs/ERROR_PATTERN_INTELLIGENCE.md`](docs/ERROR_PATTERN_INTELLIGENCE.md) for aggregation rules, drill construction, persistence behavior, validation, and limitations.

## Motor Test Simulator'''
text = replace_once(text, section_anchor, section_replacement, 'error pattern section')

text = replace_once(
    text,
    'Confidence remediation  → src/learning/confidenceRemediation.js\nRendering / modes       → src/main.js + src/engine/',
    'Confidence remediation  → src/learning/confidenceRemediation.js\nError-pattern analytics → src/learning/errorPatterns.js\nRendering / modes       → src/main.js + src/engine/',
    'architecture map',
)

text = replace_once(
    text,
    '│   │   ├── confidenceCalibration.js    # Confidence-band summaries + feedback\n│   │   └── confidenceRemediation.js    # Latest-response priority remediation engine',
    '│   │   ├── confidenceCalibration.js    # Confidence-band summaries + feedback\n│   │   ├── confidenceRemediation.js    # Latest-response priority remediation engine\n│   │   └── errorPatterns.js            # Choice-aware confusion-pair analytics + drills',
    'learning tree',
)

text = replace_once(
    text,
    '│   ├── main.js\n│   └── style.css',
    '│   ├── main.js\n│   ├── style.css\n│   ├── confidenceRemediation.css\n│   └── errorPatterns.css',
    'style tree',
)

text = replace_once(
    text,
    '│   ├── validate_confidence_calibration.mjs # Confidence analytics validation\n│   └── validate_confidence_remediation.mjs # Confidence-priority validation',
    '│   ├── validate_confidence_calibration.mjs # Confidence analytics validation\n│   ├── validate_confidence_remediation.mjs # Confidence-priority validation\n│   └── validate_error_patterns.mjs     # Answer-confusion + drill validation',
    'scripts tree',
)

text = replace_once(
    text,
    '│   ├── CONFIDENCE_AWARE_REMEDIATION.md # Confidence-priority review model\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations',
    '│   ├── CONFIDENCE_AWARE_REMEDIATION.md # Confidence-priority review model\n│   ├── ERROR_PATTERN_INTELLIGENCE.md   # Choice-aware confusion analytics + drills\n│   └── MOTOR_TEST_SIMULATOR.md         # Functional-exam model and limitations',
    'docs tree',
)

text = replace_once(
    text,
    '- [x] Confidence-aware remediation with latest-response priority review and resolution behavior\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, remediation-session construction, challenge-variant invariants, confidence calibration, and confidence-remediation priorities',
    '- [x] Confidence-aware remediation with latest-response priority review and resolution behavior\n- [x] Error-Pattern Intelligence with selected-answer persistence, recurring confusion-pair detection, and focused two-concept drills\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, remediation-session construction, challenge-variant invariants, confidence calibration, confidence-remediation priorities, and error-pattern aggregation',
    'roadmap',
)

path.write_text(text)
print('Updated README for Anatomica v0.4.2 Error-Pattern Intelligence.')
