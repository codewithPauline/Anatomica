export const ANATOMY_COLORS = {
  systems: {
    skeleton: 0xe8dcc4,
    muscles: 0xc95a5a,
    nerves: 0xe3c64b,
    artery: 0xd63b3b,
    vein: 0x3f6ed8,
    ligaments: 0xd9ccb2,
    cartilage: 0x8dcfe6,
    lymphatics: 0x5cbf7a,
  },
  structures: {
    humerus: 0xe7dbc0,
    radius: 0xf0e5cf,
    ulna: 0xd9ccb4,
    scapula: 0xeadfc8,
    clavicle: 0xf3e8d5,

    scaphoid: 0xf1e5c8,
    lunate: 0xe7d8b6,
    triquetral: 0xdccda9,
    pisiform: 0xf0d8b0,
    trapezium: 0xeadfc3,
    trapezoid: 0xded1b5,
    capitate: 0xeee2ca,
    hamate: 0xd8c8aa,
    metacarpal1: 0xf0e4ce,
    metacarpal2: 0xe9ddc5,
    metacarpal3: 0xe4d7be,
    metacarpal4: 0xdfd1b8,
    metacarpal5: 0xd9cab1,

    bicepsBrachii: 0xd8666d,
    tricepsBrachii: 0xb84e58,
    deltoid: 0xd06a78,
    supraspinatus: 0xe88472,
    infraspinatus: 0xb95d6a,
    teresMinor: 0xc97562,
    subscapularis: 0xa94f5f,
    brachialis: 0xc95f4f,
    coracobrachialis: 0xdf7665,
    teresMajor: 0x9f4657,

    pronatorTeres: 0xd86c54,
    flexorCarpiRadialis: 0xce604e,
    palmarisLongus: 0xe07a62,
    flexorCarpiUlnaris: 0xb94f46,
    flexorDigitorumSuperficialis: 0xd36a57,
    flexorDigitorumProfundus: 0xa94b4b,
    flexorPollicisLongus: 0xc45555,
    pronatorQuadratus: 0x994744,

    brachioradialis: 0xd97a69,
    extensorCarpiRadialisLongus: 0xb65b72,
    extensorCarpiRadialisBrevis: 0xa95068,
    extensorDigitorum: 0x98445f,
    extensorCarpiUlnaris: 0x873d57,
    extensorDigitiMinimi: 0xa35573,
    supinator: 0xc26a7f,
    abductorPollicisLongus: 0xb96182,
    extensorPollicisBrevis: 0x9e5478,
    extensorPollicisLongus: 0x874868,
    extensorIndicis: 0x74405e,

    abductorPollicisBrevis: 0xd76f73,
    flexorPollicisBrevis: 0xca626a,
    opponensPollicis: 0xb95662,
    adductorPollicis: 0xa84d5a,
    abductorDigitiMinimi: 0xcf7064,
    flexorDigitiMinimiBrevis: 0xb95e58,
    opponensDigitiMinimi: 0xa24f52,
    lumbricals: 0xd98277,
    palmarInterossei: 0xb96471,
    dorsalInterossei: 0xa45369,

    flexorRetinaculum: 0xd7c7a8,

    brachialArtery: 0xd9343a,
    radialArtery: 0xe04343,
    ulnarArtery: 0xc92f38,
    superficialPalmarArch: 0xe34a4a,
    deepPalmarArch: 0xb92532,
    cephalicVein: 0x4779df,

    medianNerve: 0xf0cf4f,
    musculocutaneousNerve: 0xf4d965,
    radialNerve: 0xe6c244,
    ulnarNerve: 0xdab43d,
    axillaryNerve: 0xf2ce57,
  },
};

export const ANATOMY_LEGEND = [
  { label: 'Bone', color: '#e8dcc4' },
  { label: 'Muscle', color: '#c95a5a' },
  { label: 'Artery', color: '#d63b3b' },
  { label: 'Vein', color: '#3f6ed8' },
  { label: 'Nerve', color: '#e3c64b' },
  { label: 'Ligament', color: '#d9ccb2' },
];

const ARTERIAL_STRUCTURES = new Set([
  'brachialArtery',
  'radialArtery',
  'ulnarArtery',
  'superficialPalmarArch',
  'deepPalmarArch',
]);

export function colorForStructure(structureKey, system) {
  if (ANATOMY_COLORS.structures[structureKey] != null) {
    return ANATOMY_COLORS.structures[structureKey];
  }

  if (system === 'vessels') {
    return ARTERIAL_STRUCTURES.has(structureKey)
      ? ANATOMY_COLORS.systems.artery
      : ANATOMY_COLORS.systems.vein;
  }
  return ANATOMY_COLORS.systems[system] ?? 0xb7bec9;
}
