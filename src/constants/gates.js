export const DECISION_GATES = {
  GATE_1: {
    name: 'FID 1: Proceed with Seismic Survey?',
    description: 'Decision to invest in seismic data acquisition',
    cost: 6500000,
    risks: [
      { name: 'Exploration Risk', level: 'high', impact: 'Project failure if no oil found' },
      { name: 'Capital Risk', level: 'medium', impact: '$6.5M non-recoverable investment' },
      { name: 'Regulatory Risk', level: 'low', impact: 'Permit delays possible' }
    ],
    requirements: [
      { item: 'Geological area selected', key: 'geologicalType' },
      { item: 'Budget allocation approved', key: 'budgetCheck', amount: 6500000 }
    ],
    keyQuestions: [
      'Does the geological assessment support potential hydrocarbon presence?',
      'Is the budget adequate for full exploration program?',
      'Are regulatory requirements understood and manageable?',
      'What is our risk tolerance for this investment?'
    ]
  },
  GATE_2: {
    name: 'FID 2: Drill Exploration Well?',
    description: 'Decision to drill first exploration well',
    cost: 15000000,
    risks: [
      { name: 'Dry Hole Risk', level: 'high', impact: 'Total loss of $15M investment' },
      { name: 'Technical Risk', level: 'medium', impact: 'Drilling complications or well control' },
      { name: 'Environmental Risk', level: 'medium', impact: 'Spill or environmental incident' }
    ],
    requirements: [
      { item: 'Seismic data acquired and interpreted', key: 'seismicComplete' },
      { item: 'Probability of success calculated', key: 'probabilityCalculated' },
      { item: 'Drilling permits secured', key: 'drillingPermit' },
      { item: 'Budget sufficient for drilling', key: 'budgetCheck', amount: 15000000 }
    ],
    keyQuestions: [
      'What is the probability of finding commercial oil?',
      'Is the seismic interpretation confidence level acceptable?',
      'Do we have contingency plans if the well is dry?',
      'Should we farm out to reduce risk?'
    ]
  },
  GATE_3: {
    name: 'FID 3: Proceed to Appraisal & Development Planning?',
    description: 'Select FEED study scope and proceed to appraisal',
    cost: 0,
    risks: [
      { name: 'Reservoir Risk', level: 'medium', impact: 'Lower reserves than estimated' },
      { name: 'Commercial Risk', level: 'medium', impact: 'Project economics marginal' },
      { name: 'Market Risk', level: 'high', impact: 'Oil price volatility affects NPV' }
    ],
    requirements: [
      { item: 'Oil discovered in exploration well', key: 'oilDiscovered' },
      { item: 'Initial reserve estimate completed', key: 'reservesEstimated' },
      { item: 'Preliminary economics positive', key: 'preliminaryNPV', threshold: 0 }
    ],
    keyQuestions: [
      'Are the reserves sufficient for commercial development?',
      'What is the oil quality and market value?',
      'What is the range of NPV outcomes under different scenarios?',
      'Should we drill appraisal wells to reduce uncertainty?'
    ]
  },
  GATE_4: {
    name: 'FID 4: Sanction Field Development?',
    description: 'Final Investment Decision - commit to field development',
    cost: 0,
    risks: [
      { name: 'Execution Risk', level: 'high', impact: 'Cost overruns or delays' },
      { name: 'Production Risk', level: 'medium', impact: 'Wells underperform expectations' },
      { name: 'Price Risk', level: 'high', impact: 'Oil price crash during development' },
      { name: 'Political Risk', level: 'low', impact: 'Regulatory changes or government intervention' }
    ],
    requirements: [
      { item: 'Appraisal program completed', key: 'appraisalComplete' },
      { item: 'Development plan finalized', key: 'developmentPlan' },
      { item: 'Detailed cost estimate approved', key: 'costEstimate' },
      { item: 'NPV exceeds hurdle rate', key: 'npvApproved', threshold: 50000000 }
    ],
    keyQuestions: [
      'Is the development NPV robust across price scenarios?',
      'Do we have the technical capability to execute?',
      'What is our exit strategy if the project underperforms?',
      'Should we phase the development to manage risk?'
    ]
  },
  GATE_5: {
    name: 'FID 5: Commence Production Operations?',
    description: 'Decision to start production operations',
    cost: 0,
    risks: [
      { name: 'Operational Risk', level: 'medium', impact: 'Early production issues' },
      { name: 'Safety Risk', level: 'high', impact: 'Incidents affect operations' },
      { name: 'Performance Risk', level: 'medium', impact: 'Production below forecast' }
    ],
    requirements: [
      { item: 'All wells drilled and completed', key: 'wellsComplete' },
      { item: 'Facilities constructed and tested', key: 'facilitiesComplete' },
      { item: 'Safety systems certified', key: 'safetyCertified' },
      { item: 'Operating procedures approved', key: 'proceduresApproved' }
    ],
    keyQuestions: [
      'Are all safety systems tested and operational?',
      'Is the operating team trained and ready?',
      'What is the production ramp-up plan?',
      'Are offtake agreements in place?'
    ]
  }
};

// Role requirements for each decision gate
export const GATE_ROLE_REQUIREMENTS = {
  GATE_1: {
    required: ['geologist', 'finance'],
    recommended: ['operations'],
    minimumSignatures: 2
  },
  GATE_2: {
    required: ['geologist', 'engineer', 'finance'],
    recommended: [],
    minimumSignatures: 2
  },
  GATE_3: {
    required: ['geologist', 'finance', 'operations'],
    recommended: ['engineer'],
    minimumSignatures: 3
  },
  GATE_4: {
    required: ['finance', 'operations', 'engineer'],
    recommended: ['geologist'],
    minimumSignatures: 3
  },
  GATE_5: {
    required: ['operations', 'engineer'],
    recommended: [],
    minimumSignatures: 2
  }
};
