# Localization Challenge Variants

Challenge variants were introduced in **Anatomica v0.3.9** to reduce memorization of fixed vignette wording while preserving a stable lesion-level learning model.

## Why variants exist

Before v0.3.9, each of the 10 modeled lesion patterns had one clinical vignette. Repeated practice could therefore become a wording-recognition exercise rather than a localization exercise.

The variant layer separates the **concept being assessed** from the **clinical presentation shown to the learner**.

The current build keeps 10 lesion concepts but provides two possible vignette presentations for each concept: the original case plus one alternate presentation. That produces **20 total vignette presentations across 10 scored localization concepts**.

## Stable concept identity

A variant never changes:

- the base challenge ID,
- peripheral nerve,
- lesion level,
- challenge difficulty, or
- mastery / spaced-review concept being updated.

Only presentation fields change:

- title,
- stem,
- findings, and
- explanatory wording.

This matters because learner progress should answer the question “how well does this learner localize a radial-groove lesion?” rather than create separate mastery records for two differently worded radial-groove cases.

## Session behavior

When a localization session begins, Anatomica chooses one presentation for every challenge in that session.

The selected variant is then held stable for the remainder of that session. The vignette does not change between:

1. initial display,
2. answer submission,
3. explanatory feedback,
4. 3D answer reveal, or
5. session-summary accounting.

A future session can choose a different presentation for the same lesion concept.

## Current coverage

Every modeled lesion concept has an alternate vignette:

- **Median nerve:** proximal median lesion, anterior interosseous lesion, carpal tunnel
- **Ulnar nerve:** cubital tunnel, Guyon canal
- **Radial nerve:** axilla, radial groove, posterior interosseous nerve
- **Axillary nerve:** surgical-neck/dislocation pattern, quadrangular-space pattern

The alternates vary mechanism or framing where clinically appropriate while preserving the localization-defining findings.

## Interaction with other learning modes

Variants are used by the existing challenge engine, including:

- Easy / Intermediate / Advanced sessions,
- Adaptive sessions,
- spaced-review sessions, and
- Targeted Remediation.

Targeted Remediation still selects a lesion concept first and same-nerve comparators afterward. The presentation layer then chooses a vignette for each selected concept.

## Progress semantics

Persistent progress remains concept-based. The progress store records the original `challengeId`, `nerveId`, and `levelId`; it does not create separate mastery records for each wording variant.

This preserves continuity with progress saved before v0.3.9.

## Validation

`scripts/validate_challenge_variants.mjs` checks that:

- every modeled localization concept has at least one alternate vignette,
- every variant has a unique ID within its concept,
- title, stem, explanation, and findings are present,
- a variant cannot change the base challenge ID,
- nerve, lesion level, and difficulty remain invariant,
- base and alternate presentations resolve correctly, and
- random variant selection remains within valid bounds.

The validator runs in CI through `npm run validate:variants`.

## Limitations

Two presentations per lesion reduce simple wording memorization, but they do not create a large validated item bank. The current challenge system remains an educational reasoning tool rather than a psychometrically validated examination.

Future expansion should add additional independent presentations per lesion, broader mechanisms, and item-quality review before stronger claims about assessment reliability are made.
