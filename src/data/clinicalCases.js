export const clinicalCases = [
  {
    id: 'carpal-tunnel',
    name: 'Carpal tunnel syndrome',
    subtitle: 'Median nerve compression at the wrist',
    lesionKeys: ['medianNerve', 'flexorRetinaculum'],
    affectedKeys: ['abductorPollicisBrevis', 'opponensPollicis', 'flexorPollicisBrevis'],
    contextKeys: [
      'scaphoid', 'lunate', 'triquetral', 'pisiform', 'trapezium', 'trapezoid', 'capitate', 'hamate',
      'flexorDigitorumSuperficialis', 'flexorDigitorumProfundus', 'flexorPollicisLongus',
    ],
    mechanism: 'Compression of the median nerve beneath the flexor retinaculum as it passes through the carpal tunnel.',
    deficit: 'Thenar weakness can impair thumb opposition and abduction; sensory symptoms classically involve the lateral 3½ digits.',
    exam: 'Look for weak thumb opposition or abduction and reproduction of symptoms with provocative wrist testing.',
    pearl: 'Sensation over the thenar eminence can be spared because the palmar cutaneous branch of the median nerve arises proximal to the tunnel.',
    padding: 1.28,
  },
  {
    id: 'ulnar-cubital-tunnel',
    name: 'Ulnar neuropathy at the elbow',
    subtitle: 'Cubital tunnel / medial epicondyle',
    lesionKeys: ['ulnarNerve'],
    affectedKeys: [
      'flexorCarpiUlnaris', 'flexorDigitorumProfundus', 'adductorPollicis',
      'dorsalInterossei', 'palmarInterossei', 'abductorDigitiMinimi',
      'flexorDigitiMinimiBrevis', 'opponensDigitiMinimi',
    ],
    contextKeys: ['humerus', 'ulna', 'pisiform', 'hamate'],
    mechanism: 'The ulnar nerve is vulnerable posterior to the medial epicondyle and as it enters the cubital tunnel.',
    deficit: 'Weak finger abduction/adduction, impaired key pinch, and weakness of ulnar-innervated intrinsic hand muscles.',
    exam: 'Test interossei with finger abduction/adduction and look for Froment sign during key pinch.',
    pearl: 'More distal ulnar lesions can produce more obvious clawing because the long finger flexors are spared — the ulnar paradox.',
    padding: 1.3,
  },
  {
    id: 'radial-shaft',
    name: 'Radial nerve injury',
    subtitle: 'Humeral shaft / radial groove',
    lesionKeys: ['radialNerve', 'humerus'],
    affectedKeys: [
      'extensorCarpiRadialisLongus', 'extensorCarpiRadialisBrevis', 'extensorDigitorum',
      'extensorDigitiMinimi', 'extensorCarpiUlnaris', 'extensorPollicisLongus',
      'extensorPollicisBrevis', 'extensorIndicis',
    ],
    contextKeys: ['radius', 'ulna', 'tricepsBrachii'],
    mechanism: 'The radial nerve runs close to the posterior humeral shaft in the radial groove and may be injured with shaft fractures.',
    deficit: 'Weak wrist and finger extension can produce wrist drop; the exact pattern depends on the level of injury.',
    exam: 'Ask the patient to extend the wrist and metacarpophalangeal joints against resistance.',
    pearl: 'Triceps function is often relatively preserved in a mid-shaft lesion because major triceps branches arise proximally.',
    padding: 1.22,
  },
  {
    id: 'axillary-surgical-neck',
    name: 'Axillary nerve injury',
    subtitle: 'Surgical neck / shoulder dislocation',
    lesionKeys: ['axillaryNerve', 'humerus'],
    affectedKeys: ['deltoid', 'teresMinor'],
    contextKeys: ['scapula', 'clavicle', 'supraspinatus'],
    mechanism: 'The axillary nerve winds around the surgical neck of the humerus and is vulnerable in proximal humeral fractures and anterior shoulder dislocation.',
    deficit: 'Deltoid weakness impairs arm abduction after the initial phase; teres minor weakness can reduce external rotation.',
    exam: 'Test resisted abduction and check sensation over the lateral shoulder in the regimental-badge area.',
    pearl: 'Supraspinatus can still initiate the first part of abduction even when the deltoid is weak.',
    padding: 1.35,
  },
  {
    id: 'supraspinatus-tear',
    name: 'Supraspinatus tear',
    subtitle: 'Rotator-cuff injury / impingement',
    lesionKeys: ['supraspinatus'],
    affectedKeys: ['deltoid'],
    contextKeys: ['scapula', 'humerus', 'clavicle', 'infraspinatus', 'teresMinor', 'subscapularis'],
    mechanism: 'The supraspinatus tendon passes beneath the acromion and is commonly affected by degenerative cuff disease and impingement.',
    deficit: 'Pain and weakness are most apparent when initiating or sustaining shoulder abduction.',
    exam: 'Use resisted abduction in the scapular plane; pain or weakness can support supraspinatus pathology in the appropriate clinical context.',
    pearl: 'The rotator cuff stabilizes the humeral head while the deltoid generates elevation, so cuff failure can disturb normal glenohumeral mechanics.',
    padding: 1.35,
  },
  {
    id: 'scaphoid-fracture',
    name: 'Scaphoid fracture',
    subtitle: 'FOOSH / anatomical snuffbox',
    lesionKeys: ['scaphoid'],
    affectedKeys: ['radialArtery'],
    contextKeys: ['radius', 'trapezium', 'abductorPollicisLongus', 'extensorPollicisBrevis', 'extensorPollicisLongus'],
    mechanism: 'A fall on an outstretched hand can fracture the scaphoid, often producing tenderness in the anatomical snuffbox.',
    deficit: 'Pain with wrist or thumb loading may occur even when initial radiographs are unrevealing.',
    exam: 'Palpate the anatomical snuffbox and scaphoid tubercle and assess pain with axial thumb loading when clinically appropriate.',
    pearl: 'Retrograde blood supply places the proximal pole at risk of avascular necrosis after fracture.',
    padding: 1.32,
  },
];

export function clinicalCaseById(id) {
  return clinicalCases.find((caseItem) => caseItem.id === id) ?? clinicalCases[0];
}

export function clinicalCaseKeys(caseItem) {
  if (!caseItem) return [];
  return [...new Set([
    ...(caseItem.lesionKeys ?? []),
    ...(caseItem.affectedKeys ?? []),
    ...(caseItem.contextKeys ?? []),
  ])];
}
