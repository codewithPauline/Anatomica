# Adaptive Challenge Sessions

Anatomica v0.3.5 extends the Clinical Localization Challenge Mode with structured practice sessions and performance feedback.

## Session modes

The learner can start one of four modes:

- **Easy** — introductory cases with relatively distinctive localization clues.
- **Intermediate** — cases that require comparing motor and sensory findings across nearby lesion levels.
- **Advanced** — cases with broader or more overlapping patterns where mechanism and spared function matter more.
- **Adaptive** — the full challenge bank in shuffled order, with targeted reordering after a missed nerve localization.

Difficulty labels describe the intended learning challenge inside Anatomica. They are not validated measures of clinical competence.

## Shuffling

Every session is shuffled with a Fisher–Yates shuffle before the first vignette is shown. Difficulty-specific sessions draw only from their assigned challenge pool. Adaptive mode starts from the full bank.

## Adaptive follow-up rule

Adaptive mode uses a transparent rule-based strategy rather than a machine-learning model.

After an incorrect response, Anatomica checks the unanswered cases for another vignette involving the same peripheral nerve. If one is available later in the queue, that case is moved to the next position. This creates a near-term opportunity to apply the same nerve-localization framework to a different lesion level.

The algorithm does **not** infer knowledge state, predict examination performance, diagnose a learner, or alter medical content.

## Session performance

For each submitted vignette, Anatomica records:

- whether the nerve + lesion-level combination was correct,
- the peripheral nerve category,
- the lesion level that was missed when the answer was incorrect.

The session summary reports:

- overall accuracy,
- correct / attempted count,
- performance by peripheral nerve,
- the exact missed nerve + lesion-level combinations,
- a review focus based on the lowest observed nerve-category accuracy in that session.

The review focus is descriptive only. It is intended to help the learner choose what to revisit in the Nerve Deficit Explorer or Lesion-Level Localizer.

## Current challenge distribution

The v0.3.5 bank contains 10 localization vignettes:

- **Easy:** carpal tunnel syndrome, radial-groove injury, axillary injury after shoulder dislocation.
- **Intermediate:** anterior interosseous lesion, cubital tunnel, Guyon canal, posterior interosseous nerve lesion.
- **Advanced:** proximal median lesion, very proximal radial lesion, quadrangular-space axillary pattern.

These assignments can change as the question bank expands and is reviewed.

## Answer reveal

The 3D viewer remains neutral before submission. After the learner commits to an answer, Anatomica reveals the correct pattern using the existing localization semantics:

- **Red** — involved nerve pathway,
- **Amber** — expected impaired motor targets,
- **Green** — explicitly spared motor targets.

This prevents the 3D scene from giving away the localization before the learner reasons through the case.

## Validation

The clinical-content CI validator checks that every challenge:

- has a supported difficulty,
- references an existing nerve profile,
- references an existing lesion level for that nerve,
- contains a clinical stem, findings, and explanation,
- has a unique challenge identifier.

CI also confirms that every supported difficulty contains at least one challenge.

## Scope and limitations

The adaptive session engine is an educational practice system, not a diagnostic tool, assessment instrument, or medical device. Session accuracy should not be interpreted as a validated estimate of clinical competence.

The current bank is intentionally small and focused on upper-limb peripheral-nerve localization. The adaptive behavior is therefore simple and explainable by design. A larger future bank can support richer category balancing, spaced repetition, and longitudinal learning analytics without obscuring how case selection works.
