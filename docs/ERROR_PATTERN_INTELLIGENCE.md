# Error-Pattern Intelligence

Error-Pattern Intelligence was introduced in **Anatomica v0.4.2** to distinguish *which wrong localization a learner selected* from the correct lesion concept.

## Purpose

A simple incorrect score does not reveal whether two concepts are being repeatedly confused.

For example, a learner might repeatedly mix up:

- radial-groove and posterior-interosseous-nerve lesions,
- cubital-tunnel and Guyon-canal lesions,
- proximal median and anterior-interosseous lesions, or
- two lesion patterns from different peripheral nerves.

v0.4.2 records the modeled localization that the learner actually selected and uses those choices to identify repeated confusion pairs.

## Stored response metadata

New localization responses can include:

- `challengeId` — the correct lesion concept,
- `nerveId` — the correct peripheral nerve,
- `levelId` — the correct lesion level,
- `correct`,
- `confidence`,
- `selectedNerveId` — the nerve chosen by the learner, and
- `selectedLevelId` — the lesion level chosen by the learner.

The selected-answer fields are optional and browser-local. Historical sessions created before v0.4.2 remain valid but do not contribute confusion-pair data unless a selected answer was stored.

## What counts as a confusion pair

A pair is recorded only when:

1. the response is incorrect,
2. the correct concept exists in the current localization bank,
3. the learner's selected nerve + lesion level maps to another modeled localization concept, and
4. the chosen concept is different from the correct concept.

Correct responses never create confusion pairs.

## Direction handling

Confusions are grouped as concept pairs regardless of direction.

For example:

- correct = radial groove, chosen = PIN, and
- correct = PIN, chosen = radial groove

are combined into one **Radial groove ↔ PIN** pattern.

The engine still retains directional counts internally so future versions can examine whether one direction is more common than the reverse.

## Recurrence

The current rule is intentionally simple:

- **1 event** — single confusion event,
- **2 or more events** — recurring confusion pair.

This threshold is a study-interface rule, not a psychometrically validated misconception detector.

The dashboard also reports how many events in a pair were high-confidence misses.

## Confusion Drill

Each Error Pattern card can launch a focused **Confusion Drill**.

The drill contains the two lesion concepts in the selected pair. The concept most often expected when the confusion occurred is presented first, followed by the paired comparator. The dashboard's **Practice top confusion** action launches the highest-ranked historical pair using the same two-concept drill.

The standard Anatomica challenge infrastructure is reused, including:

- alternate vignette presentations,
- confidence rating,
- immediate reasoning feedback,
- 3D answer reveal,
- browser-local progress recording, and
- mastery / spaced-review updates.

The goal is discrimination between the two concepts, not repeated memorization of one fixed stem.

## Relationship to other learning systems

Error-Pattern Intelligence complements rather than replaces existing systems:

- **Mastery Dashboard** — summarizes performance over time.
- **Spaced review** — schedules previously practiced concepts by review interval.
- **Targeted Remediation** — compares lesion levels within one nerve family.
- **Confidence-Aware Remediation** — prioritizes the latest unresolved confidence signal.
- **Error-Pattern Intelligence** — identifies concepts that have historically been confused with each other.

Because error patterns are historical, a pair can remain visible after later correct responses. This is deliberate: the panel describes a repeated learning history pattern, not a claim that the confusion is still active.

## Validation

`src/learning/errorPatterns.js` contains the pure aggregation and drill-building logic.

`scripts/validate_error_patterns.mjs` verifies that:

- incorrect modeled choices create confusion pairs,
- correct responses do not create pairs,
- reverse-direction errors collapse into one pair,
- directional counts are retained,
- recurrence begins at two events,
- high-confidence confusion counts are preserved,
- incomplete historical responses are ignored safely, and
- a two-concept drill is constructed without duplicates.

CI runs this validator through `npm run validate:error-patterns`.

## Limitations

The current system uses a small upper-limb localization bank. A repeated confusion pair can be educationally useful, but it is not proof of a stable misconception.

Counts can be influenced by repeated exposure, a small number of available concepts, ordinary slips, or ambiguous recall. Anatomica therefore presents these patterns as **study guidance**, not diagnostic, psychological, or clinical-competency judgments.
