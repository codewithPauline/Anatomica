# Longitudinal Mastery Dashboard

Anatomica v0.3.7 adds a browser-local dashboard for reviewing clinical-localization performance across multiple sessions.

The dashboard is designed to answer four practical learning questions:

1. Am I improving across recent sessions?
2. Which lesion patterns have I practiced enough to feel relatively strong on?
3. Which practiced concepts remain weak?
4. Is any spaced review currently due?

## Data source

The dashboard reads only from the learner-progress record managed by `src/learning/progressStore.js`.

That record is stored in the current browser with `localStorage`. Anatomica does not require an account, send learner-performance data to a backend, or synchronize progress across devices.

Clearing site storage or using the in-app **Clear saved progress** control removes the local learning history.

## Dashboard outputs

### Overall progress

The top summary reports:

- completed localization sessions,
- cumulative localization accuracy,
- number of spaced-review challenges currently due.

### Recent-session trend

Up to the six most recent completed localization sessions are rendered as compact accuracy bars.

The bars are descriptive. They are not a learning curve model and do not estimate future performance.

### Recent momentum

When enough history exists, Anatomica compares the mean accuracy of the most recent session window with the immediately preceding window.

The current implementation uses windows of up to three sessions. A change smaller than 2.5 percentage points is treated as approximately steady. Larger changes are shown as upward or downward recent momentum.

This is intentionally simple and transparent. It is not a statistical significance test and should not be interpreted as evidence of durable learning by itself.

### Lesion mastery states

Every modeled lesion level is assigned one of four descriptive states using the existing progress summary:

- **Unseen** — no recorded attempts.
- **Developing** — practiced, with accuracy below 60%.
- **Practicing** — accuracy at or above 60% but not yet meeting the Strong rule.
- **Strong** — at least three attempts with accuracy at or above 80%.

The dashboard displays all 10 currently modeled lesion patterns so unpracticed concepts remain visible rather than disappearing from the learner's view.

These labels summarize practice history only. They are not validated measures of clinical competence, examination readiness, or diagnostic ability.

### Weakest practiced concepts

The dashboard surfaces up to three practiced lesion patterns with the lowest cumulative accuracy. Ties are broken by number of attempts and then by label.

This list is intended to make review selection easier; it does not claim that the lowest-scoring concept is the learner's most important clinical weakness.

### Due review

If spaced-review items are currently due, the dashboard enables **Practice due review**. This opens the existing localization challenge in Review mode using the due-item queue from the browser-local progress store.

If nothing is due, the dashboard button remains disabled rather than silently substituting unrelated questions.

## Analytics implementation

Pure dashboard calculations live in:

```text
src/learning/masteryDashboard.js
```

The module provides:

- `recentSessionTrend()`
- `masteryCounts()`
- `weakestPracticedConcepts()`
- `sessionMomentum()`
- `buildMasteryDashboard()`

Keeping these calculations separate from the Three.js viewer makes them testable without browser rendering.

The corresponding automated validator is:

```text
scripts/validate_mastery_dashboard.mjs
```

CI checks recent-session selection, mastery-state counts, weakest-concept ordering, momentum calculation, and the final dashboard summary object before the production build runs.

## Limitations

The current dashboard is intentionally small-scale and local-first.

- It summarizes only the localization challenge bank currently represented in Anatomica.
- The challenge bank is small, so percentages can change substantially after a single case.
- Repeated exposure can improve score through familiarity as well as conceptual learning.
- Session accuracy does not measure retention outside Anatomica.
- Mastery labels are heuristic study aids, not validated educational outcomes.
- Progress does not synchronize between browsers or devices.

The dashboard should therefore be read as a transparent practice-history tool, not a psychometric assessment system.
