export const SEISMIC_PACKAGES = {
  basic_2d: {
    name: 'Basic 2D Seismic',
    description: 'Legacy 2D lines, minimal processing',
    cost: 2000000,
    processingCost: 300000,
    quality: 'poor',
    qualityScore: 0.08,
    interpretation: {
      structuralClarity: 0.3,
      amplitudeConfidence: 0.2,
      faultResolution: 0.2,
      depthAccuracy: 0.4
    },
    dataProducts: ['Basic structure map', 'Regional cross-sections'],
    limitations: ['Poor fault imaging', 'No direct hydrocarbon indicators', 'High depth uncertainty']
  },

  standard_3d: {
    name: 'Standard 3D Seismic',
    description: 'Modern 3D survey, standard processing',
    cost: 5000000,
    processingCost: 1000000,
    quality: 'moderate',
    qualityScore: 0.15,
    interpretation: {
      structuralClarity: 0.6,
      amplitudeConfidence: 0.5,
      faultResolution: 0.5,
      depthAccuracy: 0.7
    },
    dataProducts: ['3D structure maps', 'Amplitude maps', 'Fault framework', 'Time-depth curves'],
    limitations: ['Some amplitude ambiguity', 'Moderate fault complexity']
  },

  high_resolution_3d: {
    name: 'High-Resolution 3D',
    description: 'Dense acquisition, advanced processing (pre-stack depth migration)',
    cost: 8000000,
    processingCost: 2000000,
    quality: 'good',
    qualityScore: 0.25,
    interpretation: {
      structuralClarity: 0.8,
      amplitudeConfidence: 0.7,
      faultResolution: 0.8,
      depthAccuracy: 0.85
    },
    dataProducts: ['High-res structure maps', 'AVO analysis', 'Detailed fault network', 'Depth-converted volumes'],
    limitations: ['Some deep imaging challenges']
  },

  premium_3d: {
    name: 'Premium 3D + Attributes',
    description: 'Ultra-dense acquisition, full pre-stack, seismic attributes, AVO/AVA',
    cost: 12000000,
    processingCost: 3000000,
    quality: 'excellent',
    qualityScore: 0.35,
    interpretation: {
      structuralClarity: 0.95,
      amplitudeConfidence: 0.90,
      faultResolution: 0.95,
      depthAccuracy: 0.95
    },
    dataProducts: [
      'Ultra-high-res structure maps',
      'Full AVO/AVA analysis',
      'Seismic inversion',
      'Multi-attribute analysis',
      'Direct hydrocarbon indicators (DHI)',
      'Reservoir property prediction'
    ],
    limitations: ['Minimal - highest confidence']
  }
};

export const SEISMIC_ACQUISITION_MESSAGES = {
  basic_2d: [
    'Deploying geophone lines...',
    'Vibroseis trucks in position...',
    'Recording 2D seismic lines...',
    'Shot points 1-50 acquired...',
    'Shot points 51-100 acquired...',
    'Rolling receivers to next line...',
    'Recording cross-lines...',
    'Field QC checks in progress...',
    'Final shots recorded...',
    'Demobilizing equipment...'
  ],
  standard_3d: [
    'Deploying 3D receiver grid...',
    'Source lines positioned...',
    'Acquiring first swath...',
    'Swath 2 of 8 complete...',
    'Midpoint fold building up...',
    'Swath 5 of 8 — good data quality...',
    'Infill shots for coverage gaps...',
    'Final swath recording...',
    'Field brute stack QC passed...',
    'Acquisition complete — demobilizing...'
  ],
  high_resolution_3d: [
    'Deploying dense receiver arrays...',
    'High-density source grid active...',
    'Multi-component recording started...',
    'Continuous recording — swath 1...',
    'Real-time noise monitoring active...',
    'Swath 4 of 10 — excellent S/N ratio...',
    'Acquiring high-fold coverage zones...',
    'Infill acquisition for imaging gaps...',
    'Final swath — full fold achieved...',
    'Dense 3D acquisition complete...'
  ],
  premium_3d: [
    'Deploying ultra-dense nodal array...',
    'Broadband source activation...',
    'Simultaneous source recording...',
    'Multi-azimuth acquisition swath 1...',
    'Continuous recording — all nodes active...',
    'Real-time processing QC ongoing...',
    'Acquiring far-offset data for AVO...',
    'Broadband frequency sweep complete...',
    'Full-azimuth coverage achieved...',
    'Premium acquisition complete — all nodes recovered...'
  ]
};

export const PROCESSING_WORKFLOWS = {
  standard: {
    name: 'Standard Processing',
    description: 'Basic velocity analysis, NMO correction, and post-stack migration',
    cost: 500_000,
    timeCost: 'Fast',
    qualityMultiplier: 1.0,
    messages: [
      'Applying geometry and trace headers...',
      'Noise attenuation and filtering...',
      'Velocity analysis (every 500m)...',
      'NMO correction and stack...',
      'Post-stack time migration...',
      'Generating final stack volume...'
    ]
  },
  advanced: {
    name: 'Advanced Processing',
    description: 'Dense velocity analysis, surface-consistent processing, pre-stack time migration',
    cost: 1_500_000,
    timeCost: 'Moderate',
    qualityMultiplier: 1.1,
    messages: [
      'Surface-consistent amplitude correction...',
      'Multi-channel noise attenuation...',
      'Dense velocity analysis (every 250m)...',
      'Residual statics computation...',
      'Pre-stack time migration (PSTM)...',
      'Gather conditioning and AVO-friendly output...'
    ]
  },
  psdm: {
    name: 'Pre-Stack Depth Migration (PSDM)',
    description: 'Full velocity model building, anisotropic PSDM. Best imaging for complex geology.',
    cost: 3_500_000,
    timeCost: 'Slow',
    qualityMultiplier: 1.2,
    messages: [
      'Building initial velocity model...',
      'Tomographic velocity updates (iteration 1)...',
      'Tomographic velocity updates (iteration 2)...',
      'Anisotropy parameter estimation...',
      'Full pre-stack depth migration...',
      'Residual moveout analysis and final model...',
      'Depth-converted output volumes...'
    ]
  }
};

export const SEISMIC_CONTRACTORS = {
  geoscan: {
    name: 'GeoScan Ltd',
    type: 'Budget',
    badge: 'Economy',
    badgeColor: 'bg-yellow-700 text-yellow-200',
    description: 'Regional contractor, basic equipment. May cut corners on acquisition parameters.',
    dailyRate: 15000,
    mobilization: 200000,
    qualityMod: -0.05,
    schedule: '6 weeks',
    risk: 'Data gaps possible, weather delays likely',
    experience: '5 years',
  },
  petroserv: {
    name: 'PetroServ International',
    type: 'Standard',
    badge: 'Recommended',
    badgeColor: 'bg-blue-700 text-blue-200',
    description: 'Established international company. Reliable data quality, good track record.',
    dailyRate: 28000,
    mobilization: 500000,
    qualityMod: 0.0,
    schedule: '5 weeks',
    risk: 'Minor weather delays possible',
    experience: '15 years',
  },
  seismictech: {
    name: 'SeismicTech Elite',
    type: 'Premium',
    badge: 'Top Tier',
    badgeColor: 'bg-purple-700 text-purple-200',
    description: 'Industry leader. State-of-the-art vessels and processing. Highest data quality guaranteed.',
    dailyRate: 45000,
    mobilization: 800000,
    qualityMod: 0.08,
    schedule: '4 weeks',
    risk: 'Minimal — dedicated standby equipment',
    experience: '25+ years',
  },
};

// Risk effects from seismic interpretation — each risk has a drilling penalty,
// optional downstream effects, and a mitigation path
export const RISK_EFFECTS = {
  'High depth uncertainty': {
    probPenalty: -0.03,
    mitigatedBy: 'additionalStudy',
    desc: 'Depth error may cause missed target',
  },
  'Incomplete closure mapping': {
    probPenalty: -0.05,
    reserveModifier: -0.10,
    mitigatedBy: 'additionalStudy',
    desc: 'Trap may not hold expected volumes',
  },
  'Fault seal uncertainty': {
    probPenalty: -0.04,
    declineRateBonus: 0.02,
    mitigatedBy: 'riskAssessmentFavorable',
    desc: 'Hydrocarbons may leak through faults',
  },
  'No amplitude support': {
    probPenalty: -0.03,
    mitigatedBy: 'additionalStudy',
    desc: 'No direct indicator of hydrocarbons',
  },
  'Reservoir compartmentalization possible': {
    probPenalty: -0.02,
    opexModifier: 0.15,
    productionModifier: -0.10,
    mitigatedBy: null,
    desc: 'Reservoir may need more wells to drain',
  },
};
