# Persistent progress and spaced review

Anatomica v0.3.6 adds browser-local learner progress for the Clinical Localization Challenge.

## Scope

Progress is stored with the browser's `localStorage` API. Anatomica does not require an account for this feature, does not send challenge history to a server, and does not synchronize learner progress between browsers or devices.

The learner can clear the saved progress from the Localization Challenge panel at any time.

## What is stored

The progress store keeps a bounded history of completed localization sessions plus aggregate statistics for:

- peripheral nerve
- lesion level
- individual localization challenge

For each tracked concept, the store records attempts, correct responses, current correct streak, review stage, last-attempt time, last-correct time, and the next scheduled review time.

Session history is capped so browser storage does not grow indefinitely.

## Mastery summaries

The challenge panel reports:

- completed sessions on the current browser
- cumulative localization accuracy
- number of review items currently due
- the weakest practiced nerve category based on recorded accuracy

Mastery labels are intentionally descriptive:

- **Unseen** — no attempts yet
- **Developing** — accuracy below 60%
- **Practicing** — accuracy at or above 60%
- **Strong** — at least three attempts with accuracy at or above 80%

These labels are learning aids, not validated educational-performance scores.

## Spaced review

The current review schedule uses transparent fixed intervals:

1. 1 day
2. 3 days
3. 7 days
4. 14 days
5. 30 days

A correct response advances the review stage, while an incorrect response resets the challenge to the earliest stage. The next review date is calculated from the completion time of the session.

The **Review due** session uses challenges whose scheduled review time has arrived. If no item is currently due, the mode falls back to the full localization challenge bank rather than presenting an empty session.

## Adaptive mode versus spaced review

These are separate mechanisms.

**Adaptive mode** works within the current session. After a missed localization, it moves another unanswered case involving the same nerve earlier in the queue when possible.

**Spaced review** works across completed sessions. It uses saved browser-local history to decide when a previously practiced challenge is due again.

Neither mechanism uses machine learning.

## Validation

The learner-progress store has a dedicated automated test in `scripts/validate_progress_store.mjs`. CI verifies:

- schema initialization and sanitization
- browser-storage save/load behavior
- session recording
- nerve and lesion aggregate updates
- review-stage changes after correct and incorrect responses
- due-review scheduling
- progress-summary generation
- learner-controlled clearing of browser progress

Run locally with:

```bash
npm run validate:progress
```

or run all validation checks with:

```bash
npm run validate
```

## Limitations

Browser-local progress is intentionally lightweight. Clearing site data, using another browser/device, or using some private-browsing configurations can remove or prevent persistence. There is currently no cloud backup, user account, classroom dashboard, or cross-device synchronization.

The mastery and review logic should be treated as a transparent educational workflow rather than evidence of validated learning efficacy.