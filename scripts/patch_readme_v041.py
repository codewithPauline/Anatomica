from pathlib import Path

path = Path('README.md')
text = path.read_text()

replacements = [
(
"## Current milestone — v0.4.0 Confidence-Calibrated Clinical Reasoning\n\nAnatomica now connects upper-limb anatomy to lesion-level clinical reasoning, alternate vignette presentations, adaptive practice, spaced review, targeted remediation, longitudinal mastery analytics, and **self-rated confidence calibration**. A localization response now captures not only whether the learner was correct, but whether that answer was made with low, moderate, or high confidence—allowing the platform to surface high-confidence misses and correct-but-uncertain responses without inventing a proprietary competence score.",
"## Current milestone — v0.4.1 Confidence-Aware Remediation\n\nAnatomica now connects upper-limb anatomy to lesion-level clinical reasoning, alternate vignette presentations, adaptive practice, spaced review, longitudinal mastery analytics, self-rated confidence calibration, and **confidence-aware remediation**. The platform now turns the learner's latest confidence-rated response into an actionable priority queue: high-confidence misses are reviewed first, other unresolved misses next, and correct-but-unsure concepts receive reinforcement without being treated as equivalent to errors."
),
(
"- **Confidence-Calibrated Clinical Reasoning with required Unsure / Moderate / High self-rating, confidence-aware feedback, browser-local persistence, and dashboard summaries by confidence band**\n- Expanded Quiz Mode",
"- **Confidence-Calibrated Clinical Reasoning with required Unsure / Moderate / High self-rating, confidence-aware feedback, browser-local persistence, and dashboard summaries by confidence band**\n- **Confidence-Aware Remediation with an urgency-ordered priority queue based on each lesion concept's latest response, plus direct same-nerve remediation from every priority card**\n- Expanded Quiz Mode"
),
(
"- Clinical-content, learner-progress, mastery-dashboard, targeted-remediation, challenge-variant, and confidence-calibration validation in CI so anatomy references, review scheduling, analytics summaries, focused-practice pools, vignette invariants, and confidence summaries are checked automatically",
"- Clinical-content, learner-progress, mastery-dashboard, targeted-remediation, challenge-variant, confidence-calibration, and confidence-remediation validation in CI so anatomy references, review scheduling, analytics summaries, focused-practice pools, vignette invariants, confidence summaries, and priority-queue behavior are checked automatically"
),
(
"See [`docs/CONFIDENCE_CALIBRATION.md`](docs/CONFIDENCE_CALIBRATION.md) for persistence behavior, feedback semantics, dashboard analytics, validation, and limitations.\n\n## Motor Test Simulator",
"See [`docs/CONFIDENCE_CALIBRATION.md`](docs/CONFIDENCE_CALIBRATION.md) for persistence behavior, feedback semantics, dashboard analytics, validation, and limitations.\n\n### Confidence-aware remediation\n\nv0.4.1 converts confidence data into a transparent remediation priority. Anatomica evaluates the **latest stored response for each lesion concept** rather than accumulating permanent penalties from old mistakes. A high-confidence miss is marked **urgent**, another unresolved miss is marked **review**, and a correct answer made while unsure is marked **reinforce**. A later correct response with moderate or high confidence clears that concept from the confidence-priority queue.\n\nThe Mastery Dashboard shows these concepts in priority order. Learners can either launch the full cross-nerve priority queue or click an individual concept to open the existing same-nerve comparator remediation session. The two workflows are complementary: the priority queue decides **what to revisit first**, while targeted remediation teaches **how to distinguish nearby lesion levels**.\n\nThis is deterministic rule-based study guidance. It does not diagnose misconceptions, predict examination performance, or certify clinical competence.\n\nSee [`docs/CONFIDENCE_AWARE_REMEDIATION.md`](docs/CONFIDENCE_AWARE_REMEDIATION.md) for priority rules, resolution behavior, session construction, validation, and limitations.\n\n## Motor Test Simulator"
),
(
"Confidence analytics    → src/learning/confidenceCalibration.js\nRendering / modes",
"Confidence analytics    → src/learning/confidenceCalibration.js\nConfidence remediation  → src/learning/confidenceRemediation.js\nRendering / modes"
),
(
"│   │   ├── remediation.js              # Same-nerve targeted-practice session builder\n│   │   └── confidenceCalibration.js    # Confidence-band summaries + feedback",
"│   │   ├── remediation.js              # Same-nerve targeted-practice session builder\n│   │   ├── confidenceCalibration.js    # Confidence-band summaries + feedback\n│   │   └── confidenceRemediation.js    # Latest-response priority remediation engine"
),
(
"│   ├── validate_challenge_variants.mjs # Vignette-variant invariant validation\n│   └── validate_confidence_calibration.mjs # Confidence analytics validation",
"│   ├── validate_challenge_variants.mjs # Vignette-variant invariant validation\n│   ├── validate_confidence_calibration.mjs # Confidence analytics validation\n│   └── validate_confidence_remediation.mjs # Confidence-priority validation"
),
(
"│   ├── CONFIDENCE_CALIBRATION.md       # Self-rated confidence analytics + limits\n│   └── MOTOR_TEST_SIMULATOR.md",
"│   ├── CONFIDENCE_CALIBRATION.md       # Self-rated confidence analytics + limits\n│   ├── CONFIDENCE_AWARE_REMEDIATION.md # Confidence-priority review model\n│   └── MOTOR_TEST_SIMULATOR.md"
),
(
"- [x] Confidence-Calibrated Clinical Reasoning with confidence-aware feedback and dashboard analytics\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, remediation-session construction, challenge-variant invariants, and confidence calibration",
"- [x] Confidence-Calibrated Clinical Reasoning with confidence-aware feedback and dashboard analytics\n- [x] Confidence-aware remediation with latest-response priority review and resolution behavior\n- [x] Automated validation for cases, nerve profiles, lesion levels, motor tests, challenge difficulty metadata, localization challenges, learner-progress storage, dashboard analytics, remediation-session construction, challenge-variant invariants, confidence calibration, and confidence-remediation priorities"
),
]

for old, new in replacements:
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'Expected exactly one README anchor, found {count}: {old[:100]!r}')
    text = text.replace(old, new, 1)

path.write_text(text)
