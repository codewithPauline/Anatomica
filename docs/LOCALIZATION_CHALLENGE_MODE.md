# Clinical Localization Challenge Mode

Anatomica v0.3.4 adds a scored clinical-reasoning workflow that asks the learner to localize an upper-limb peripheral nerve lesion from a short vignette.

## Learning objective

The challenge mode is designed to move beyond structure recognition. Each case asks the learner to combine motor findings, sensory findings, spared functions, and mechanism to answer two questions:

1. Which peripheral nerve is involved?
2. At what lesion level is the nerve most likely affected?

The current bank contains 10 challenges, one for each lesion pattern represented in the v0.3.3 localization engine.

## Challenge flow

1. Anatomica displays a clinical stem and a compact set of key findings.
2. The 3D viewer remains neutral so the anatomy does not reveal the answer.
3. The learner chooses one of the currently modeled nerves.
4. Anatomica then presents only the lesion levels available for that nerve.
5. The learner submits the localization.
6. The challenge is scored once.
7. Anatomica reveals the correct nerve and lesion level, explains the discriminating clue, and focuses the relevant anatomy in 3D.
8. Affected motor targets are shown in amber, spared targets in green, and the involved nerve in red.

## Current challenge set

### Median nerve

- Proximal median lesion
- Anterior interosseous lesion
- Carpal tunnel syndrome

### Ulnar nerve

- Cubital tunnel lesion
- Guyon canal lesion

### Radial nerve

- Very proximal / axillary-level radial lesion
- Radial-groove lesion
- Posterior interosseous nerve lesion

### Axillary nerve

- Surgical-neck / anterior-dislocation pattern
- Quadrangular-space pattern

## Why the challenge viewer stays neutral before submission

The purpose of the exercise is localization from clinical evidence. Showing the affected nerve or muscles before submission would turn the task into visual recognition rather than clinical reasoning. The anatomical reveal therefore occurs only after an answer is submitted.

## Validation

The challenge bank is checked in CI. Every challenge must contain:

- a unique challenge ID;
- a title and clinical stem;
- at least two key findings;
- an explanation;
- a valid nerve profile ID; and
- a valid lesion-level ID belonging to that nerve.

If a challenge points to a missing nerve or lesion level, the clinical-content validation step fails.

## Scope and limitations

Challenge cases are educational simplifications. Real patients can have partial lesions, overlapping neuropathies, anatomical variation, pain-limited examination, or findings that do not fit a single textbook pattern.

The 3D reveal reflects structures represented in the current Anatomica model. Grouped meshes, such as flexor digitorum profundus, can contain components with mixed innervation and should not be interpreted as patient-specific electrophysiologic or diagnostic maps.

Anatomica is an educational application, not a diagnostic tool or medical device.
