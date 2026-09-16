export const nerveDeficits = [
  {
    id: 'median',
    name: 'Median nerve',
    roots: 'C6–T1',
    nerveKey: 'medianNerve',
    subtitle: 'Forearm flexion · thenar function · lateral-hand sensation',
    motorKeys: [
      'pronatorTeres', 'flexorCarpiRadialis', 'flexorDigitorumSuperficialis',
      'flexorPollicisLongus', 'pronatorQuadratus', 'abductorPollicisBrevis',
      'opponensPollicis', 'flexorPollicisBrevis',
    ],
    contextKeys: ['humerus', 'radius', 'ulna', 'flexorRetinaculum', 'scaphoid', 'lunate', 'trapezium'],
    motorSummary: 'Weak pronation, selected wrist/finger flexion, thumb abduction, and opposition depending on lesion level.',
    sensorySummary: 'Palmar lateral 3½ digits; distal dorsal tips of those digits. Thenar-eminence sensation may be spared in carpal tunnel syndrome.',
    sensoryRegions: ['Thumb', 'Index', 'Middle', 'Radial ½ ring'],
    exam: 'Test thumb opposition/abduction, forearm pronation, and the “OK” sign when anterior interosseous involvement is suspected.',
    lesionSites: 'Supracondylar region · pronator area · carpal tunnel',
    pearl: 'A wrist-level lesion can spare forearm flexors and palmar-cutaneous sensation while weakening thenar function.',
    padding: 1.18,
  },
  {
    id: 'ulnar',
    name: 'Ulnar nerve',
    roots: 'C8–T1',
    nerveKey: 'ulnarNerve',
    subtitle: 'Intrinsic hand control · key pinch · ulnar-hand sensation',
    motorKeys: [
      'flexorCarpiUlnaris', 'flexorDigitorumProfundus', 'adductorPollicis',
      'dorsalInterossei', 'palmarInterossei', 'abductorDigitiMinimi',
      'flexorDigitiMinimiBrevis', 'opponensDigitiMinimi',
    ],
    contextKeys: ['humerus', 'ulna', 'pisiform', 'hamate', 'metacarpal5'],
    motorSummary: 'Weak finger abduction/adduction, key pinch, ulnar-sided wrist flexion, and selected DIP flexion depending on lesion level.',
    sensorySummary: 'Little finger and ulnar half of the ring finger, with adjacent ulnar palm/dorsum depending on branch level.',
    sensoryRegions: ['Ulnar ½ ring', 'Little finger', 'Ulnar palm'],
    exam: 'Test finger abduction/adduction and Froment sign during key pinch; compare proximal versus distal lesion patterns.',
    lesionSites: 'Cubital tunnel · medial epicondyle · Guyon canal',
    pearl: 'Distal lesions can show more obvious clawing because FDP remains intact — the classic ulnar paradox.',
    padding: 1.2,
  },
  {
    id: 'radial',
    name: 'Radial nerve',
    roots: 'C5–T1',
    nerveKey: 'radialNerve',
    subtitle: 'Elbow/wrist/finger extension · dorsal radial-hand sensation',
    motorKeys: [
      'tricepsBrachii', 'brachioradialis', 'extensorCarpiRadialisLongus',
      'extensorCarpiRadialisBrevis', 'extensorDigitorum', 'extensorDigitiMinimi',
      'extensorCarpiUlnaris', 'supinator', 'abductorPollicisLongus',
      'extensorPollicisBrevis', 'extensorPollicisLongus', 'extensorIndicis',
    ],
    contextKeys: ['humerus', 'radius', 'ulna'],
    motorSummary: 'Weak extension at the wrist and digits can produce wrist drop; triceps involvement depends on how proximal the lesion is.',
    sensorySummary: 'Posterior limb territories vary by level; a high-yield autonomous zone is the dorsal first web space.',
    sensoryRegions: ['Dorsal first web space', 'Dorsal radial hand'],
    exam: 'Test wrist extension, MCP extension, thumb extension, and sensation in the dorsal first web space.',
    lesionSites: 'Axilla · radial groove · posterior interosseous branch',
    pearl: 'Posterior interosseous neuropathy is predominantly motor because the deep branch is not a cutaneous sensory nerve.',
    padding: 1.18,
  },
  {
    id: 'axillary',
    name: 'Axillary nerve',
    roots: 'C5–C6',
    nerveKey: 'axillaryNerve',
    subtitle: 'Deltoid/teres minor · lateral-shoulder sensation',
    motorKeys: ['deltoid', 'teresMinor'],
    contextKeys: ['scapula', 'clavicle', 'humerus', 'supraspinatus'],
    motorSummary: 'Weak deltoid function impairs arm abduction after initiation; teres minor weakness can reduce external rotation.',
    sensorySummary: 'Small patch over the lateral shoulder supplied by the superior lateral cutaneous nerve of the arm.',
    sensoryRegions: ['Lateral shoulder'],
    exam: 'Test resisted abduction and compare sensation over the regimental-badge area.',
    lesionSites: 'Surgical neck · anterior shoulder dislocation · quadrangular space',
    pearl: 'Supraspinatus may still initiate abduction even when axillary-innervated deltoid function is impaired.',
    padding: 1.35,
  },
];

export function nerveDeficitById(id) {
  return nerveDeficits.find((item) => item.id === id) ?? nerveDeficits[0];
}

export function nerveDeficitKeys(item) {
  if (!item) return [];
  return [...new Set([
    item.nerveKey,
    ...(item.motorKeys ?? []),
    ...(item.contextKeys ?? []),
  ])];
}
