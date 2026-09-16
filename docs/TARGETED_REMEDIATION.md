# Targeted Remediation

Targeted Remediation was introduced in **Anatomica v0.3.8** to connect mastery analytics directly to focused practice.

## Purpose

The Mastery Dashboard can identify a lesion pattern that is weak, developing, or simply worth revisiting. Targeted Remediation turns that observation into an immediate practice session rather than forcing the learner to navigate back through the full challenge bank.

## Launch behavior

A remediation session can be launched from either:

- any lesion-pattern row in the Mastery Dashboard, or
- any item in the weakest-practiced-concepts panel.

The selected lesion becomes the first challenge in the session.

## Session construction

Remediation sessions are built from the current localization challenge bank using `src/learning/remediation.js`.

The rules are intentionally simple and auditable:

1. Find the challenge matching the selected peripheral nerve and lesion level.
2. Place that target challenge first.
3. Add other modeled lesion levels from the **same nerve** as comparators.
4. Limit the session to at most three cases.
5. Do not duplicate challenge IDs.

With the current bank this produces focused nerve-family sessions such as:

- median: proximal median lesion → AIN lesion → carpal tunnel
- radial: selected radial lesion → the other radial lesion levels
- ulnar: cubital tunnel ↔ Guyon canal
- axillary: surgical-neck/dislocation pattern ↔ quadrangular-space pattern

The goal is **discrimination between nearby localizations**, not repetition of one memorized vignette.

## Integration with the challenge engine

Targeted Remediation reuses the existing localization infrastructure:

- nerve + lesion-level answer selection
- scored responses
- immediate explanatory feedback
- 3D answer reveal
- session summary
- persistent browser-local progress recording
- mastery-dashboard updates

Remediation sessions are stored with `mode: "remediation"`, so they remain visible in longitudinal session history without being confused with Easy, Intermediate, Advanced, Adaptive, or spaced-review sessions.

## Dashboard semantics

The Mastery Dashboard remains descriptive. A learner can launch remediation from any lesion row, including an unseen or already-strong concept. Weak-concept cards simply provide a faster route to areas with poorer prior performance.

This means the dashboard does not prescribe a clinical diagnosis, certify competence, or claim an optimized curriculum. It provides transparent study guidance from the learner's own local challenge history.

## Validation

`scripts/validate_remediation.mjs` checks every modeled localization challenge to ensure that:

- a remediation session can be constructed,
- the selected target challenge appears first,
- every comparator belongs to the same peripheral nerve,
- sessions remain focused to three cases or fewer,
- challenge IDs are unique,
- unsupported nerve/lesion combinations fail safely.

The validator runs in CI through `npm run validate:remediation`.

## Limitations

The current challenge bank contains one vignette per modeled lesion pattern. Targeted Remediation therefore improves **within-nerve comparison**, but it does not yet provide multiple independent vignettes for the same lesion level.

Future expansion should add alternate stems and mechanisms for each localization before introducing stronger claims about adaptive difficulty or mastery estimation.

Targeted Remediation is an educational feature and is not a diagnostic system or validated competency assessment.
