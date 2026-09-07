export const brachialPlexus = {
  roots: ['C5', 'C6', 'C7', 'C8', 'T1'],
  trunks: [
    { name: 'Upper trunk', roots: ['C5', 'C6'] },
    { name: 'Middle trunk', roots: ['C7'] },
    { name: 'Lower trunk', roots: ['C8', 'T1'] },
  ],
  divisions: ['Anterior divisions', 'Posterior divisions'],
  cords: [
    { name: 'Lateral cord', contributions: ['C5', 'C6', 'C7'] },
    { name: 'Posterior cord', contributions: ['C5', 'C6', 'C7', 'C8', 'T1'] },
    { name: 'Medial cord', contributions: ['C8', 'T1'] },
  ],
  terminalBranches: [
    {
      structureKey: 'musculocutaneousNerve',
      name: 'Musculocutaneous nerve',
      cord: 'Lateral cord',
      roots: ['C5', 'C6', 'C7'],
      summary: 'Supplies the anterior compartment of the arm and continues as the lateral cutaneous nerve of the forearm.',
    },
    {
      structureKey: 'medianNerve',
      name: 'Median nerve',
      cord: 'Lateral + medial cords',
      roots: ['C5', 'C6', 'C7', 'C8', 'T1'],
      summary: 'Supplies most forearm flexor-pronator muscles and important thenar and digital functions.',
    },
    {
      structureKey: 'radialNerve',
      name: 'Radial nerve',
      cord: 'Posterior cord',
      roots: ['C5', 'C6', 'C7', 'C8', 'T1'],
      summary: 'Supplies the extensor compartments of the arm and forearm.',
    },
  ],
};
