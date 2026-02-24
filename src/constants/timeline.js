// Timeline structure
export const QUARTERS = [
  { id: 'Q1_Y1', name: 'Q1 Year 1', phase: 'exploration', gate: 'GATE_1' },
  { id: 'Q2_Y1', name: 'Q2 Year 1', phase: 'exploration', gate: null },
  { id: 'Q3_Y1', name: 'Q3 Year 1', phase: 'exploration', gate: null },
  { id: 'Q4_Y1', name: 'Q4 Year 1', phase: 'exploration', gate: 'GATE_2' },
  { id: 'H1_Y2', name: 'H1 Year 2', phase: 'appraisal', gate: 'GATE_3', duration: 180 },
  { id: 'H2_Y2', name: 'H2 Year 2', phase: 'development', gate: 'GATE_4', duration: 180 },
  { id: 'H1_Y3', name: 'H1 Year 3', phase: 'construction', gate: null, duration: 180 },
  { id: 'H2_Y3', name: 'H2 Year 3', phase: 'startup', gate: 'GATE_5', duration: 180 },
  { id: 'PROD', name: 'Production Phase', phase: 'production', gate: null, duration: null }
];
