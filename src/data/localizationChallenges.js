export const localizationChallenges = [
  {
    id: 'median-proximal-trauma',
    difficulty: 'advanced',
    title: 'Forearm + hand deficits after distal-arm trauma',
    stem: 'After trauma near the distal arm, a patient has weak forearm pronation, difficulty making a normal OK sign, weak thumb opposition, and sensory loss involving the lateral palm and digits.',
    findings: ['Weak pronation', 'Abnormal OK sign', 'Thenar weakness', 'Lateral palmar sensory loss'],
    nerveId: 'median',
    levelId: 'proximal',
    explanation: 'The combination of proximal median motor deficits, AIN-pattern pinch weakness, thenar weakness, and palmar sensory involvement localizes proximal to the wrist branches rather than to the carpal tunnel or AIN alone.',
  },
  {
    id: 'median-ain-ok-sign',
    difficulty: 'intermediate',
    title: 'Abnormal OK sign without numbness',
    stem: 'A patient cannot form a round tip-to-tip OK sign. Thumb IP and index DIP flexion are weak, but thumb opposition is preserved and there is no cutaneous sensory loss.',
    findings: ['Abnormal OK sign', 'Weak thumb IP flexion', 'Weak index DIP flexion', 'No sensory loss'],
    nerveId: 'median',
    levelId: 'ain',
    explanation: 'A pure motor pinch deficit involving FPL and the index-side FDP with no cutaneous sensory loss is the classic anterior interosseous pattern.',
  },
  {
    id: 'median-carpal-tunnel',
    difficulty: 'easy',
    title: 'Nocturnal hand paresthesia with thenar weakness',
    stem: 'A patient reports nocturnal tingling in the thumb, index, and middle fingers with weak thumb opposition. Forearm pronation and the OK sign are preserved, and sensation over the thenar eminence is spared.',
    findings: ['Nocturnal lateral-digit paresthesia', 'Weak opposition', 'Normal pronation', 'Thenar-eminence sensation spared'],
    nerveId: 'median',
    levelId: 'carpal-tunnel',
    explanation: 'Thenar weakness and lateral-digit symptoms with preserved proximal median motor function and spared palmar-cutaneous territory support median-nerve compression at the carpal tunnel.',
  },
  {
    id: 'ulnar-cubital-tunnel',
    difficulty: 'intermediate',
    title: 'Intrinsic hand weakness plus proximal ulnar findings',
    stem: 'A patient has weak finger abduction and key pinch together with weakness of ulnar-sided forearm function. Sensory symptoms involve the little finger and extend onto the dorsal ulnar hand.',
    findings: ['Weak finger abduction', 'Weak key pinch', 'Proximal ulnar motor involvement', 'Dorsal ulnar sensory symptoms'],
    nerveId: 'ulnar',
    levelId: 'cubital-tunnel',
    explanation: 'Intrinsic hand weakness plus proximal ulnar forearm involvement and dorsal cutaneous symptoms localizes proximal to Guyon canal, classically around the cubital tunnel.',
  },
  {
    id: 'ulnar-guyon-canal',
    difficulty: 'intermediate',
    title: 'Cyclist with intrinsic hand weakness',
    stem: 'After prolonged pressure on the heel of the hand, a cyclist develops weak finger abduction and a positive Froment pattern. FCU and ulnar FDP function are preserved, and dorsal ulnar-hand sensation is intact.',
    findings: ['Weak interossei', 'Weak key pinch', 'FCU/FDP preserved', 'Dorsal ulnar sensation spared'],
    nerveId: 'ulnar',
    levelId: 'guyon-canal',
    explanation: 'Preserved proximal ulnar motor function and spared dorsal cutaneous sensation with intrinsic hand weakness point to a distal ulnar lesion near Guyon canal.',
  },
  {
    id: 'radial-axilla-crutch',
    difficulty: 'advanced',
    title: 'Crutch palsy with proximal radial weakness',
    stem: 'After prolonged axillary crutch pressure, a patient has weak elbow extension together with wrist, finger, and thumb extension deficits and sensory loss over radial dorsal-hand territory.',
    findings: ['Weak triceps', 'Wrist/finger extension weakness', 'Thumb extension weakness', 'Dorsal radial sensory loss'],
    nerveId: 'radial',
    levelId: 'axilla',
    explanation: 'Triceps weakness means the lesion lies proximal to the radial groove branches supplying triceps, consistent with a very proximal radial lesion in the axilla.',
  },
  {
    id: 'radial-groove-fracture',
    difficulty: 'easy',
    title: 'Wrist drop after midshaft humeral fracture',
    stem: 'Following a midshaft humeral fracture, a patient develops wrist and finger extension weakness with reduced sensation in the dorsal first web space. Elbow extension is preserved.',
    findings: ['Wrist drop', 'Finger extension weakness', 'First-web-space sensory loss', 'Triceps preserved'],
    nerveId: 'radial',
    levelId: 'radial-groove',
    explanation: 'Preserved triceps with distal radial motor and sensory deficits is the classic localization around the radial groove of the humerus.',
  },
  {
    id: 'radial-pin-finger-drop',
    difficulty: 'intermediate',
    title: 'Finger drop with preserved sensation',
    stem: 'A patient cannot extend the MCP joints or thumb normally. Wrist extension is still present but tends to deviate radially, and there is no cutaneous sensory loss.',
    findings: ['Finger extension lost', 'Thumb extension weak', 'Wrist extension relatively preserved', 'No sensory loss'],
    nerveId: 'radial',
    levelId: 'pin',
    explanation: 'A motor-only pattern with finger/thumb extension weakness, preserved ECRL-driven wrist extension, and no cutaneous sensory deficit localizes to the posterior interosseous nerve.',
  },
  {
    id: 'axillary-dislocation',
    difficulty: 'easy',
    title: 'Weak abduction after anterior shoulder dislocation',
    stem: 'After an anterior shoulder dislocation, a patient has weak arm abduction after initiation, reduced sensation over the lateral shoulder, and decreased deltoid contour.',
    findings: ['Weak abduction after initiation', 'Lateral-shoulder sensory loss', 'Deltoid weakness', 'Recent shoulder dislocation'],
    nerveId: 'axillary',
    levelId: 'surgical-neck',
    explanation: 'Anterior shoulder dislocation places the axillary nerve at risk near the surgical neck, producing deltoid weakness and lateral-shoulder sensory loss.',
  },
  {
    id: 'axillary-quadrangular-overhead',
    difficulty: 'advanced',
    title: 'Overhead athlete with posterior shoulder symptoms',
    stem: 'An overhead athlete develops activity-related posterior shoulder pain with weakness of deltoid and teres minor and intermittent lateral-shoulder paresthesia. There is no fracture or dislocation history.',
    findings: ['Overhead activity', 'Posterior shoulder pain', 'Deltoid/teres minor weakness', 'No acute trauma'],
    nerveId: 'axillary',
    levelId: 'quadrangular-space',
    explanation: 'The motor and sensory pattern overlaps other axillary lesions, but an atraumatic overhead-activity mechanism with posterior shoulder symptoms supports localization around the quadrangular space.',
  },
];

export const challengeDifficulties = ['easy', 'intermediate', 'advanced'];

export function localizationChallengeById(id) {
  return localizationChallenges.find((challenge) => challenge.id === id) ?? null;
}

export function localizationChallengeByIndex(index) {
  if (!localizationChallenges.length) return null;
  return localizationChallenges[index % localizationChallenges.length];
}

export function localizationChallengesForDifficulty(difficulty) {
  if (!difficulty || difficulty === 'adaptive' || difficulty === 'all') return [...localizationChallenges];
  return localizationChallenges.filter((challenge) => challenge.difficulty === difficulty);
}
