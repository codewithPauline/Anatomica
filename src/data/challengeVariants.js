export const challengeVariants = {
  'median-proximal-trauma': [
    {
      variantId: 'median-proximal-elbow-laceration',
      title: 'Median-pattern weakness after an elbow-region laceration',
      stem: 'After a deep laceration near the anterior elbow, a patient has weak pronation, weak thumb opposition, difficulty flexing the thumb IP joint and index DIP joint, and numbness involving the lateral palm and lateral digits.',
      findings: ['Weak pronation', 'Thenar weakness', 'Abnormal pinch', 'Lateral palm + digit sensory loss'],
      explanation: 'The combination of proximal median motor loss, AIN-pattern weakness, thenar dysfunction, and palmar sensory involvement requires a lesion proximal to the wrist and proximal to the anterior interosseous branch.',
    },
  ],
  'median-ain-ok-sign': [
    {
      variantId: 'median-ain-deep-forearm-compression',
      title: 'Pinch weakness after deep forearm compression',
      stem: 'Following deep proximal-forearm compression, a patient cannot make a normal tip-to-tip pinch. Flexion at the thumb IP joint and index DIP joint is weak, but thenar function and cutaneous sensation are normal.',
      findings: ['Weak FPL-pattern function', 'Weak index FDP-pattern function', 'Thenar function preserved', 'No cutaneous sensory loss'],
      explanation: 'A motor-only deficit affecting the FPL and index-side FDP pattern with preserved thenar function and normal cutaneous sensation localizes to the anterior interosseous nerve.',
    },
  ],
  'median-carpal-tunnel': [
    {
      variantId: 'median-carpal-tunnel-repetitive-use',
      title: 'Nighttime paresthesia with preserved proximal median function',
      stem: 'A patient with repetitive hand use develops nighttime tingling in the thumb, index, and middle fingers and progressive thumb-opposition weakness. Pronator strength and the OK sign are normal, and sensation over the thenar eminence remains intact.',
      findings: ['Nocturnal lateral-digit symptoms', 'Weak thumb opposition', 'Normal pronation + OK sign', 'Thenar-eminence sensation spared'],
      explanation: 'Distal median sensory symptoms and thenar weakness with preserved proximal motor function and spared palmar-cutaneous sensation support compression within the carpal tunnel.',
    },
  ],
  'ulnar-cubital-tunnel': [
    {
      variantId: 'ulnar-cubital-prolonged-flexion',
      title: 'Ulnar symptoms after prolonged elbow flexion',
      stem: 'A patient who frequently rests with the elbow flexed develops weak finger abduction and key pinch, weakness of proximal ulnar-innervated forearm function, and numbness affecting the little finger and dorsal ulnar hand.',
      findings: ['Weak interossei', 'Weak key pinch', 'Proximal ulnar motor involvement', 'Dorsal ulnar sensory loss'],
      explanation: 'Dorsal ulnar sensory involvement plus proximal ulnar motor weakness places the lesion proximal to the wrist, consistent with an ulnar neuropathy around the cubital tunnel.',
    },
  ],
  'ulnar-guyon-canal': [
    {
      variantId: 'ulnar-guyon-hamate-pressure',
      title: 'Intrinsic weakness after hypothenar-side wrist trauma',
      stem: 'After trauma and pressure over the hypothenar side of the wrist, a patient has weak finger abduction and a positive Froment pattern. FCU and ulnar FDP function are preserved, and sensation over the dorsal ulnar hand is normal.',
      findings: ['Weak interossei', 'Positive Froment pattern', 'FCU/FDP preserved', 'Dorsal ulnar sensation spared'],
      explanation: 'Intrinsic hand weakness with preserved proximal ulnar motor function and spared dorsal cutaneous territory points to a distal ulnar lesion at or near Guyon canal.',
    },
  ],
  'radial-axilla-crutch': [
    {
      variantId: 'radial-axilla-shoulder-compression',
      title: 'Diffuse radial deficit after proximal arm compression',
      stem: 'After prolonged compression high in the axilla, a patient has weak elbow extension, wrist drop, inability to extend the fingers and thumb, and sensory loss over the radial side of the dorsal hand.',
      findings: ['Weak triceps', 'Wrist drop', 'Finger/thumb extension loss', 'Dorsal radial sensory loss'],
      explanation: 'Triceps involvement means the lesion is proximal to the radial groove branches, supporting a very proximal radial neuropathy in the axilla.',
    },
  ],
  'radial-groove-fracture': [
    {
      variantId: 'radial-groove-compression',
      title: 'Wrist drop after prolonged posterior-arm compression',
      stem: 'After prolonged pressure against the posterior mid-arm, a patient develops wrist and finger extension weakness and numbness in the dorsal first web space. Elbow extension remains strong.',
      findings: ['Wrist extension weak', 'Finger extension weak', 'First-web-space sensory loss', 'Triceps preserved'],
      explanation: 'Preserved triceps with distal radial motor and sensory deficits localizes the injury distal to the triceps branches, classically around the radial groove.',
    },
  ],
  'radial-pin-finger-drop': [
    {
      variantId: 'radial-pin-supinator-entrapment',
      title: 'Motor-only finger drop near the supinator',
      stem: 'A patient develops progressive finger and thumb extension weakness after repetitive forearm rotation. Wrist extension remains possible with radial deviation, and there is no numbness anywhere in the hand.',
      findings: ['Finger drop', 'Thumb extension weak', 'Radially deviated wrist extension', 'No sensory loss'],
      explanation: 'A motor-only extensor deficit with preserved radial-sided wrist extension and no cutaneous sensory loss is characteristic of posterior interosseous nerve involvement.',
    },
  ],
  'axillary-dislocation': [
    {
      variantId: 'axillary-surgical-neck-fracture',
      title: 'Deltoid weakness after a surgical-neck fracture',
      stem: 'After a fracture through the surgical neck of the humerus, a patient has difficulty abducting the arm beyond initiation, reduced deltoid bulk, and numbness over the lateral shoulder.',
      findings: ['Weak abduction after initiation', 'Deltoid weakness', 'Lateral-shoulder sensory loss', 'Surgical-neck fracture'],
      explanation: 'The axillary nerve courses around the surgical neck, so deltoid weakness and lateral-shoulder sensory loss after this fracture fit the surgical-neck axillary pattern.',
    },
  ],
  'axillary-quadrangular-overhead': [
    {
      variantId: 'axillary-quadrangular-throwing',
      title: 'Posterior shoulder pain in a throwing athlete',
      stem: 'A throwing athlete develops activity-related posterior shoulder pain, weakness of deltoid and teres minor function, and intermittent paresthesia over the lateral shoulder without a history of fracture or dislocation.',
      findings: ['Overhead throwing', 'Posterior shoulder pain', 'Deltoid + teres minor weakness', 'No acute bony trauma'],
      explanation: 'An atraumatic overhead-use pattern with posterior shoulder symptoms and axillary motor/sensory findings supports compression in the quadrangular-space region.',
    },
  ],
};

export function challengeVariantPresentations(challenge) {
  if (!challenge) return [];
  const base = {
    ...challenge,
    variantId: 'base',
    baseChallengeId: challenge.id,
  };
  const alternates = (challengeVariants[challenge.id] ?? []).map((variant) => ({
    ...challenge,
    ...variant,
    id: challenge.id,
    baseChallengeId: challenge.id,
  }));
  return [base, ...alternates];
}

export function challengeVariantCount(challenge) {
  return challengeVariantPresentations(challenge).length;
}

export function localizationChallengePresentation(challenge, variantIndex = 0) {
  const variants = challengeVariantPresentations(challenge);
  if (!variants.length) return null;
  const index = Math.max(0, Math.min(variants.length - 1, Number(variantIndex) || 0));
  return variants[index];
}

export function randomChallengeVariantIndex(challenge, random = Math.random) {
  const count = challengeVariantCount(challenge);
  if (count <= 1) return 0;
  const value = Math.max(0, Math.min(0.999999999, Number(random()) || 0));
  return Math.floor(value * count);
}
