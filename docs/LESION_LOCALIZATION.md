# Lesion-Level Localization

Anatomica v0.3.3 adds lesion-level localization to the peripheral-nerve teaching workflow.

The goal is not only to answer **which nerve is involved?**, but also **where along that nerve is the lesion most consistent with the observed motor and sensory pattern?**

## Current localization profiles

### Median nerve

- **Proximal median lesion** — forearm pronation/flexor deficits, anterior-interosseous motor findings, and thenar involvement can coexist.
- **Anterior interosseous lesion** — motor-only pattern with impaired FPL/index-FDP function and an abnormal OK sign; no cutaneous sensory loss is expected.
- **Carpal tunnel** — thenar weakness and lateral-digit sensory symptoms with proximal median motor function and thenar-eminence sensation relatively spared.

### Ulnar nerve

- **Cubital tunnel** — intrinsic-hand weakness plus proximal ulnar forearm-muscle involvement; palmar and dorsal ulnar sensory territories can be affected.
- **Guyon canal** — intrinsic-hand weakness with FCU and FDP function preserved; dorsal ulnar-hand sensation is typically spared because the dorsal cutaneous branch arises proximally.

### Radial nerve

- **Radial nerve in the axilla** — very proximal injury can affect triceps in addition to wrist/finger/thumb extensors.
- **Radial groove** — wrist/finger extension weakness with relative preservation of triceps.
- **Posterior interosseous nerve** — predominantly motor weakness of finger/thumb extension with no cutaneous sensory loss; wrist extension is relatively preserved.

### Axillary nerve

- **Surgical neck / anterior dislocation pattern** — deltoid and teres-minor weakness with possible lateral-shoulder sensory loss.
- **Quadrangular-space pattern** — a similar motor/sensory profile whose localization depends heavily on mechanism and regional anatomy.

## Interaction model

Each lesion level stores:

- affected motor structures represented in the current build,
- explicitly spared motor structures,
- relevant regional context anatomy,
- a motor-pattern summary,
- a sensory-pattern summary,
- and a localization clue.

The Motor Test Simulator then compares the selected examination maneuver against the selected lesion level.

### Highlight semantics

- **Red** — involved nerve pathway
- **Amber** — tested motor target expected to be impaired at the selected level
- **Green** — tested motor target explicitly expected to be spared
- **Purple** — variable or branch-dependent involvement where a simple affected/spared claim would be misleading

The normal-activation state remains green for the active motor targets.

## Grouped-muscle limitation

Some current 3D assets represent a muscle as one grouped teaching mesh even when its innervation is anatomically subdivided. The clearest example is **flexor digitorum profundus (FDP)**, which has mixed median/anterior-interosseous and ulnar innervation.

When a grouped FDP mesh is highlighted in a nerve-localization scenario, the highlight represents the clinically relevant component conceptually. It should not be interpreted as a claim that the entire anatomical muscle is supplied by that nerve.

Future anatomy assets can subdivide these structures when validated geometry is available.

## Clinical scope

Localization patterns are intentionally high-yield educational models. Exact findings vary with:

- lesion severity,
- fascicular anatomy,
- branching variation,
- partial versus complete injury,
- and the precise site of compression or trauma.

Anatomica therefore presents these patterns as teaching aids rather than patient-specific diagnostic rules.
