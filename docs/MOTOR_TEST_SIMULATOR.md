# Motor Test Simulator

Anatomica v0.3.2 adds a functional examination layer to the Nerve Deficit Explorer.

The simulator is designed to help learners connect a named peripheral nerve with a focused motor examination, the muscles expected to activate, and the deficit pattern expected when that pathway is impaired.

## Current nerve profiles

### Median nerve
- Thumb opposition — opponens pollicis, abductor pollicis brevis, flexor pollicis brevis
- Forearm pronation — pronator teres, pronator quadratus
- OK sign — flexor pollicis longus and the modeled FDP target

### Ulnar nerve
- Finger abduction — dorsal interossei and abductor digiti minimi
- Finger adduction — palmar interossei
- Key pinch — adductor pollicis and the Froment-sign teaching pattern

### Radial nerve
- Wrist extension — ECRL, ECRB, ECU
- Finger extension — extensor digitorum, extensor indicis, extensor digiti minimi
- Thumb extension — EPL and EPB

### Axillary nerve
- Shoulder abduction — deltoid
- External rotation — teres minor

## Interaction model

Each motor test can be displayed in two states:

- **Normal activation** — the selected motor targets are highlighted in green and the expected normal response is shown.
- **Lesion pattern** — the involved nerve is highlighted in red, the selected motor targets in amber, and the expected deficit is shown.

The camera can focus on the nerve plus the structures used for the selected maneuver.

## Scope and limitations

This is an educational functional-anatomy visualization. The current imported anatomy is not rigged, so Anatomica does **not** rotate joints, deform muscles, or simulate patient motion. Doing so without a validated skeletal rig would imply a level of biomechanical accuracy the current model does not yet support.

Motor-test highlighting therefore represents **expected neural/muscular activation relationships**, not a biomechanical movement simulation.

Some structures are represented as grouped teaching targets rather than branch-specific compartments. For example, the current FDP mesh is not subdivided into separately modeled median- and ulnar-innervated portions. These simplifications should remain explicit until more granular validated geometry is available.

## Validation

Motor-test definitions are checked by `scripts/validate_clinical_cases.mjs`. CI verifies that:

- every nerve profile has at least one motor test;
- every motor test has an instruction, normal response, and lesion response;
- every target key exists in the anatomy knowledge layer; and
- every motor-test target is also listed among the parent nerve profile's motor structures.

This structural validation does not replace expert visual/anatomical sign-off of converted meshes.
