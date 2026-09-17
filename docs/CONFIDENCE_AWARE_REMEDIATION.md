# Confidence-Aware Remediation

Confidence-Aware Remediation was introduced in **Anatomica v0.4.1** to turn confidence-rated localization responses into a transparent review priority.

## Purpose

Accuracy and confidence answer different questions. A learner may be:

- incorrect and highly confident,
- incorrect but uncertain,
- correct but unsure, or
- correct with dependable confidence.

v0.4.1 uses those states to decide which lesion concepts deserve attention first without replacing the existing mastery, spaced-review, or targeted-remediation systems.

## Latest-response rule

The priority engine evaluates the **latest stored response for each localization concept**.

This is deliberate. Anatomica does not keep penalizing a learner for an old mistake after later evidence shows that the concept has been corrected.

The current rules are:

1. **Urgent — high-confidence miss**
   - latest response is incorrect,
   - confidence is High,
   - highest review priority.

2. **Review — other unresolved miss**
   - latest response is incorrect,
   - confidence is Unsure, Moderate, or unrated,
   - second priority.

3. **Reinforce — correct but unsure**
   - latest response is correct,
   - confidence is Unsure,
   - lower priority reinforcement.

4. **Resolved**
   - latest response is correct with Moderate or High confidence,
   - concept is omitted from the confidence-priority queue.

A later response can therefore move a concept into or out of the queue immediately.

## Priority queue

The Mastery Dashboard displays confidence-aware review items in this order:

1. urgent high-confidence misses,
2. other unresolved misses,
3. correct-but-unsure concepts.

Within the same priority class, more recent responses appear first.

The **Practice priority concepts** action builds a session from the highest-priority concepts across nerves. The current implementation limits the queue to a small focused set rather than replaying the entire challenge bank. Priority sessions preserve that ordering instead of shuffling the concepts at launch.

## Relationship to Targeted Remediation

Confidence-Aware Remediation and Targeted Remediation solve different problems.

- **Confidence-aware priority** answers: *What should I revisit first?*
- **Targeted Remediation** answers: *Which nearby same-nerve lesion levels should I compare to understand this distinction?*

Each priority card is therefore also clickable. Selecting one launches the existing same-nerve comparator session for that lesion concept.

## Interaction with alternate vignettes

Priority sessions reuse the standard Localization Challenge engine, including the alternate-vignette presentation layer introduced in v0.3.9.

The prioritized concept remains stable, but a new session may present a different valid clinical stem for the same lesion. This reduces the chance that remediation becomes simple wording recall.

## Persistence

No new account or backend storage is introduced.

The engine reads the same browser-local session history already used for:

- mastery summaries,
- spaced review,
- confidence calibration, and
- longitudinal analytics.

Older sessions without confidence remain valid. An incorrect legacy response can still be treated as an unresolved miss, while confidence-specific urgency requires a recorded confidence value.

## Validation

`src/learning/confidenceRemediation.js` contains the pure priority logic.

`scripts/validate_confidence_remediation.mjs` verifies that:

- high-confidence misses outrank other misses,
- other misses outrank correct-but-unsure responses,
- confident correct answers are not unnecessarily queued,
- a later confident correct response clears an earlier high-confidence miss,
- session construction preserves priority order,
- duplicate concepts are not introduced, and
- empty history fails safely.

CI runs the validator through `npm run validate:confidence-remediation`.

## Limitations

This is deterministic study guidance, not a model of learner cognition. A high-confidence miss may reflect a misconception, a careless response, ambiguous recall, or another ordinary error.

The priority labels therefore should not be interpreted as psychological diagnosis, examination readiness, clinical competence, or a validated educational risk score.

The current implementation also relies on the existing localization concept bank. As the item bank grows, future work should examine whether repeated patterns remain stable across multiple independent vignettes before stronger claims about misconception detection are considered.
