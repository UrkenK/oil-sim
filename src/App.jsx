import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Droplet, DollarSign, Users, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap, ArrowRight, FileText, Target, Calendar, XCircle, PauseCircle, RefreshCw, MapPin } from 'lucide-react';

// Timeline structure
const QUARTERS = [
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

const DECISION_GATES = {
  GATE_1: {
    name: 'FID 1: Proceed with Seismic Survey?',
    description: 'Decision to invest in seismic data acquisition',
    cost: 6500000, // Lease + Survey + Assessment
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
    description: 'Decision to appraise discovery and plan development',
    cost: 20000000, // Appraisal wells + studies
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
    cost: 0, // Cost determined by development plan
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

const ROLES = [
  { 
    id: 'geologist', 
    name: 'Geologist', 
    color: '#10b981', 
    icon: '🔬', 
    description: 'Analyzes geological data and recommends drilling locations',
    authorityAreas: ['geological_selection', 'seismic_interpretation', 'reserve_estimation'],
    skillBonuses: {
      probabilityBoost: 0.05, // +5% success probability if geologist on team
      seismicQualityBoost: 0.10, // Better seismic interpretation
      reserveAccuracy: 0.15 // More accurate reserve estimates
    },
    insights: {
      Q1: 'Recommends geological areas based on basin maturity and hydrocarbon potential',
      Q2: 'Interprets seismic data quality and identifies drilling targets',
      Q3: 'Provides confidence levels on prospect viability',
      Q4: 'Calculates risk-adjusted success probability'
    }
  },
  { 
    id: 'engineer', 
    name: 'Drilling Engineer', 
    color: '#f59e0b', 
    icon: '⚙️', 
    description: 'Manages drilling operations and technical decisions',
    authorityAreas: ['drilling_operations', 'well_design', 'completion_strategy'],
    skillBonuses: {
      drillingCostReduction: 0.10, // -10% drilling costs if engineer on team
      technicalRiskReduction: 0.15, // Lower chance of drilling complications
      wellPerformanceBoost: 0.12 // +12% production per well
    },
    insights: {
      Q4: 'Provides drilling cost estimates and technical risk assessment',
      H1_Y2: 'Recommends optimal appraisal well locations',
      H2_Y2: 'Designs production well completion strategy',
      H1_Y3: 'Manages construction execution and quality'
    }
  },
  { 
    id: 'finance', 
    name: 'Finance Manager', 
    color: '#3b82f6', 
    icon: '💰', 
    description: 'Handles budget allocation and financial analysis',
    authorityAreas: ['budget_approval', 'npv_analysis', 'risk_assessment'],
    skillBonuses: {
      costOverrunProtection: 0.20, // -20% chance of cost overruns
      betterFinancing: 0.05, // 5% better terms on financing
      budgetEfficiency: 0.08 // -8% on all operating costs
    },
    insights: {
      all: 'Provides NPV sensitivity analysis and break-even calculations',
      GATE_1: 'Analyzes exploration risk vs. expected value',
      GATE_3: 'Recommends optimal development scenario based on economics',
      GATE_4: 'Final investment decision modeling with price scenarios'
    }
  },
  { 
    id: 'operations', 
    name: 'Operations Director', 
    color: '#8b5cf6', 
    icon: '📊', 
    description: 'Oversees production and strategic planning',
    authorityAreas: ['production_strategy', 'facility_design', 'operational_excellence'],
    skillBonuses: {
      productionOptimization: 0.15, // +15% production efficiency
      operatingCostReduction: 0.12, // -12% daily operating costs
      uptimeImprovement: 0.10 // Better facility reliability (95% → 98%+)
    },
    insights: {
      H2_Y2: 'Optimizes field development plan for maximum NPV',
      H1_Y3: 'Ensures facilities are designed for operational efficiency',
      H2_Y3: 'Production startup and ramp-up planning',
      PROD: 'Continuous production optimization and cost management'
    }
  }
];

// Role requirements for each decision gate
const GATE_ROLE_REQUIREMENTS = {
  GATE_1: {
    required: ['geologist', 'finance'], // Must have both
    recommended: ['operations'], // Nice to have
    minimumSignatures: 2 // At least 2 team members must approve
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
    minimumSignatures: 3 // Major investment needs broad consensus
  },
  GATE_5: {
    required: ['operations', 'engineer'],
    recommended: [],
    minimumSignatures: 2
  }
};

const GEOLOGICAL_CHARACTERISTICS = {
  proven_basin: {
    name: 'Proven Basin',
    description: 'Mature area with established production (e.g., Permian Basin, North Sea)',
    probability: 0.40,
    // Costs
    leaseCostMultiplier: 1.5,      // Higher lease prices due to competition
    seismicCostMultiplier: 1.0,    // Standard costs
    explorationWellMultiplier: 1.0, // Standard onshore/shallow costs
    developmentWellMultiplier: 1.0,
    facilityMultiplier: 1.0,
    dailyOPEXMultiplier: 1.0,
    // Reserves
    reserveRangeMin: 5000000,      // Smaller prospects (already picked over)
    reserveRangeMax: 30000000,     // 5-30M barrels
    // Production
    wellProductivityMultiplier: 1.0, // Standard
    declineRateAnnual: 0.08,        // 8% annual decline (mature fields)
    // Quality
    oilQualityWeights: { light: 0.6, medium: 0.3, heavy: 0.1 }, // Good quality oil
    // Timeline
    timeToFirstOil: 18,             // Months - faster (infrastructure exists)
    // Risk factors
    regulatoryRisk: 'low',
    infrastructureAccess: 'excellent',
    marketAccess: 'excellent',
    // Economic
    oilPriceDiscount: 0,            // No discount, premium markets
    abandonmentCost: 3000000        // Lower cleanup costs
  },
  
  frontier_basin: {
    name: 'Frontier Basin',
    description: 'Underexplored region with theoretical potential (e.g., East Africa, Guyana)',
    probability: 0.15,
    // Costs
    leaseCostMultiplier: 0.3,       // Cheap leases (unproven)
    seismicCostMultiplier: 1.5,     // More expensive (remote, need more data)
    explorationWellMultiplier: 2.0, // 2x cost (remote location, logistics)
    developmentWellMultiplier: 1.8,
    facilityMultiplier: 2.5,        // Must build all infrastructure from scratch
    dailyOPEXMultiplier: 1.5,       // Higher due to remoteness
    // Reserves
    reserveRangeMin: 50000000,      // Large prospects if successful
    reserveRangeMax: 200000000,     // 50-200M barrels - elephant hunting
    // Production
    wellProductivityMultiplier: 1.3, // Virgin pressure, better flow
    declineRateAnnual: 0.05,        // 5% decline (new fields produce longer)
    // Quality
    oilQualityWeights: { light: 0.4, medium: 0.4, heavy: 0.2 },
    // Timeline
    timeToFirstOil: 48,             // 4 years - very slow (build everything)
    // Risk factors
    regulatoryRisk: 'high',         // Political uncertainty
    infrastructureAccess: 'poor',
    marketAccess: 'limited',
    // Economic
    oilPriceDiscount: -5,           // $5/bbl discount for transportation
    abandonmentCost: 15000000       // High cost to clean up remote sites
  },
  
  deepwater: {
    name: 'Deepwater',
    description: 'Offshore exploration >500m depth (e.g., Gulf of Mexico, Brazil pre-salt)',
    probability: 0.20,
    // Costs
    leaseCostMultiplier: 2.0,       // Expensive offshore leases
    seismicCostMultiplier: 3.0,     // Expensive ocean-bottom seismic
    explorationWellMultiplier: 8.0, // $120M+ wells (deepwater rigs very expensive)
    developmentWellMultiplier: 6.0,
    facilityMultiplier: 5.0,        // Subsea systems + FPSO/platform
    dailyOPEXMultiplier: 3.0,       // High offshore operating costs
    // Reserves
    reserveRangeMin: 100000000,     // Must be huge to justify costs
    reserveRangeMax: 500000000,     // 100-500M barrels
    // Production
    wellProductivityMultiplier: 2.5, // Excellent productivity (high pressure)
    declineRateAnnual: 0.04,        // 4% decline (good reservoir management)
    // Quality
    oilQualityWeights: { light: 0.7, medium: 0.25, heavy: 0.05 }, // Usually light oil
    // Timeline
    timeToFirstOil: 60,             // 5 years - very complex
    // Risk factors
    regulatoryRisk: 'medium',
    infrastructureAccess: 'limited',
    marketAccess: 'good',           // Near shipping lanes
    // Economic
    oilPriceDiscount: 0,            // Premium oil quality
    abandonmentCost: 50000000       // Extremely expensive subsea abandonment
  },
  
  unconventional: {
    name: 'Unconventional',
    description: 'Shale oil, tight oil, or heavy oil (e.g., Bakken, Oil Sands)',
    probability: 0.10,
    // Costs
    leaseCostMultiplier: 0.8,       // Moderate lease costs
    seismicCostMultiplier: 1.2,     // More seismic needed
    explorationWellMultiplier: 1.5, // Horizontal wells more expensive
    developmentWellMultiplier: 1.3, // Many wells needed (shale)
    facilityMultiplier: 1.5,        // Processing for heavy oil
    dailyOPEXMultiplier: 2.0,       // Steam injection, processing
    // Reserves
    reserveRangeMin: 10000000,      // Wide range
    reserveRangeMax: 100000000,     // 10-100M barrels
    // Production
    wellProductivityMultiplier: 0.6, // Lower per-well production
    declineRateAnnual: 0.15,        // 15% decline (shale declines fast)
    // Quality
    oilQualityWeights: { light: 0.2, medium: 0.3, heavy: 0.5 }, // Often heavy
    // Timeline
    timeToFirstOil: 24,             // 2 years - moderate
    // Risk factors
    regulatoryRisk: 'medium',       // Environmental concerns (fracking, oil sands)
    infrastructureAccess: 'good',   // Usually onshore in developed areas
    marketAccess: 'good',
    // Economic
    oilPriceDiscount: -10,          // $10/bbl discount for heavy oil
    abandonmentCost: 8000000        // Moderate cleanup costs
  }
};

const SEISMIC_PACKAGES = {
  basic_2d: {
    name: 'Basic 2D Seismic',
    description: 'Legacy 2D lines, minimal processing',
    cost: 2000000,
    processingCost: 300000,
    quality: 'poor',
    qualityScore: 0.08,
    interpretation: {
      structuralClarity: 0.3,  // Can you see the structure?
      amplitudeConfidence: 0.2, // Can you see hydrocarbon indicators?
      faultResolution: 0.2,     // Can you map faults?
      depthAccuracy: 0.4        // How accurate is depth?
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

// Seismic interpretation results that will be shown to team
const generateSeismicInterpretation = (packageType, geologicalType) => {
  const pkg = SEISMIC_PACKAGES[packageType];
  const geo = GEOLOGICAL_CHARACTERISTICS[geologicalType];
  
  // Generate realistic interpretation metrics
  const baseProspectQuality = geo.probability;
  const dataQuality = pkg.interpretation;
  
  // Simulate what the seismic shows
  const interpretation = {
    // Structural elements
    closureIdentified: Math.random() < dataQuality.structuralClarity,
    closureArea: Math.floor(Math.random() * 2000 + 500), // acres
    structuralType: ['anticline', 'fault trap', 'stratigraphic trap'][Math.floor(Math.random() * 3)],
    fourWayDipClosure: Math.random() < (dataQuality.structuralClarity * 0.8),
    
    // Reservoir indicators
    amplitudeAnomaly: Math.random() < (baseProspectQuality * dataQuality.amplitudeConfidence),
    amplitudeStrength: Math.random() < 0.5 ? 'strong' : Math.random() < 0.5 ? 'moderate' : 'weak',
    flatSpot: Math.random() < (baseProspectQuality * dataQuality.amplitudeConfidence * 0.6), // fluid contact
    brightSpot: Math.random() < (baseProspectQuality * dataQuality.amplitudeConfidence * 0.5), // gas indicator
    
    // Depth and thickness
    reservoirDepth: Math.floor(Math.random() * 3000 + 1000), // meters
    reservoirThickness: Math.floor(Math.random() * 100 + 20), // meters
    depthUncertainty: Math.floor((1 - dataQuality.depthAccuracy) * 200), // ± meters
    
    // Fault risk
    faultsIdentified: Math.floor(Math.random() * 10),
    faultSealing: dataQuality.faultResolution > 0.7 ? 'likely' : 'uncertain',
    compartmentalization: dataQuality.faultResolution > 0.6 ? (Math.random() < 0.3 ? 'yes' : 'no') : 'unknown',
    
    // Hydrocarbon indicators (DHI)
    dhiPresent: pkg.dataProducts.includes('Direct hydrocarbon indicators (DHI)') && Math.random() < baseProspectQuality,
    dhiTypes: [],
    
    // Confidence levels
    structuralConfidence: dataQuality.structuralClarity,
    volumetricConfidence: (dataQuality.structuralClarity + dataQuality.depthAccuracy) / 2,
    fluidConfidence: dataQuality.amplitudeConfidence,
    
    // Risk factors
    risks: []
  };
  
  // Add DHI types if present
  if (interpretation.dhiPresent) {
    if (interpretation.flatSpot) interpretation.dhiTypes.push('Flat spot (fluid contact)');
    if (interpretation.brightSpot) interpretation.dhiTypes.push('Bright spot (gas accumulation)');
    if (interpretation.amplitudeAnomaly) interpretation.dhiTypes.push('Amplitude anomaly');
  }
  
  // Identify risks
  if (interpretation.depthUncertainty > 100) {
    interpretation.risks.push(`High depth uncertainty (±${interpretation.depthUncertainty}m)`);
  }
  if (!interpretation.fourWayDipClosure) {
    interpretation.risks.push('Incomplete closure mapping');
  }
  if (interpretation.faultSealing === 'uncertain') {
    interpretation.risks.push('Fault seal uncertainty');
  }
  if (!interpretation.amplitudeAnomaly && pkg.quality !== 'poor') {
    interpretation.risks.push('No amplitude support');
  }
  if (interpretation.compartmentalization === 'yes') {
    interpretation.risks.push('Reservoir compartmentalization possible');
  }
  
  return interpretation;
};

const PROBABILITIES = {
  seismic: { excellent: 0.35, good: 0.25, moderate: 0.15, poor: 0.08 },
  geological: { 
    proven_basin: 0.40, 
    frontier_basin: 0.15, 
    deepwater: 0.20, 
    unconventional: 0.10 
  }
};

const COSTS = {
  lease: 2000000,
  environmental: 500000,
  permits: 1000000,
  seismic: 5000000,
  dataProcessing: 1000000,
  explorationWell: 15000000,
  appraisalWell: 10000000,
  developmentWell: 8000000,
  facility: 50000000,
  dailyOPEX: 25000,
  oilPrice: 75,
  discountRate: 0.10
};

const SEISMIC_CONTRACTORS = {
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

const DRILL_SITES = {
  A: { x: 50, y: 35, label: 'Site A — Crest of Anticline', desc: 'Top of the structure. Best trap position, highest probability.', probMod: 0.08, risk: 'Low', color: '#10b981' },
  B: { x: 35, y: 50, label: 'Site B — Western Flank', desc: 'Good structural position but near a fault. Moderate risk.', probMod: 0.02, risk: 'Medium', color: '#f59e0b' },
  C: { x: 65, y: 55, label: 'Site C — Eastern Flank', desc: 'Amplitude anomaly detected. Promising but uncertain seal.', probMod: 0.0, risk: 'Medium-High', color: '#f97316' },
  D: { x: 50, y: 70, label: 'Site D — Downdip Position', desc: 'Below the main closure. Low probability but possible stratigraphic trap.', probMod: -0.08, risk: 'High', color: '#ef4444' },
};

const DrillSiteMap = ({ geoType, selected, onSelect }) => {
  if (!geoType) return null;
  const contourColors = { proven_basin: '#4ade80', frontier_basin: '#facc15', deepwater: '#38bdf8', unconventional: '#fb923c' };
  const cc = contourColors[geoType] || '#4ade80';
  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mb-4">
      <h4 className="font-bold text-sm mb-1 text-center text-blue-400">Structure Map — Top View</h4>
      <p className="text-xs text-slate-400 text-center mb-3">Select a drilling location. Contour lines show depth to reservoir (closer spacing = steeper).</p>
      <div className="flex gap-4">
        <svg viewBox="0 0 100 100" className="flex-1 rounded-lg border border-slate-700" style={{ maxHeight: '300px', background: '#0f172a' }}>
          {[20,40,60,80].map(v => (<g key={v}><line x1={v} y1="0" x2={v} y2="100" stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" /><line x1="0" y1={v} x2="100" y2={v} stroke="rgba(255,255,255,0.05)" strokeWidth="0.3" /></g>))}
          <ellipse cx="50" cy="45" rx="40" ry="35" fill="none" stroke={cc} strokeWidth="0.3" opacity="0.25" />
          <ellipse cx="50" cy="43" rx="33" ry="28" fill="none" stroke={cc} strokeWidth="0.4" opacity="0.35" />
          <ellipse cx="50" cy="41" rx="26" ry="22" fill="none" stroke={cc} strokeWidth="0.4" opacity="0.45" />
          <ellipse cx="50" cy="39" rx="19" ry="16" fill="none" stroke={cc} strokeWidth="0.5" opacity="0.55" />
          <ellipse cx="50" cy="37" rx="12" ry="10" fill="none" stroke={cc} strokeWidth="0.5" opacity="0.7" />
          <ellipse cx="50" cy="36" rx="6" ry="5" fill="none" stroke={cc} strokeWidth="0.6" opacity="0.85" />
          <ellipse cx="50" cy="38" rx="15" ry="12" fill={cc} opacity="0.08" />
          <text x="85" y="46" fill={cc} fontSize="2.5" opacity="0.5">-2000m</text>
          <text x="78" y="38" fill={cc} fontSize="2.5" opacity="0.5">-1800m</text>
          <text x="70" y="30" fill={cc} fontSize="2.5" opacity="0.5">-1600m</text>
          <text x="58" y="25" fill={cc} fontSize="2.5" opacity="0.5">-1400m</text>
          <line x1="25" y1="15" x2="30" y2="85" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1.5,1" opacity="0.6" />
          <text x="22" y="13" fill="#ef4444" fontSize="2" opacity="0.6">Fault</text>
          {geoType === 'frontier_basin' && <line x1="70" y1="20" x2="75" y2="90" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="1.5,1" opacity="0.6" />}
          <polygon points="93,3 95,8 91,8" fill="white" opacity="0.6" />
          <text x="91" y="11" fill="white" fontSize="2.5" opacity="0.6">N</text>
          <line x1="5" y1="95" x2="25" y2="95" stroke="white" strokeWidth="0.4" opacity="0.5" />
          <text x="5" y="93" fill="white" fontSize="2" opacity="0.5">2 km</text>
          {Object.entries(DRILL_SITES).map(([key, site]) => {
            const isSel = selected === key;
            return (
              <g key={key} onClick={() => onSelect(key)} style={{ cursor: 'pointer' }}>
                <circle cx={site.x} cy={site.y} r={isSel ? 4 : 3} fill={isSel ? site.color : 'transparent'} stroke={site.color} strokeWidth={isSel ? 1 : 0.6} opacity={isSel ? 1 : 0.7} />
                <circle cx={site.x} cy={site.y} r="1" fill={site.color} />
                <text x={site.x + 4} y={site.y + 1} fill={site.color} fontSize="3" fontWeight={isSel ? 'bold' : 'normal'}>{key}</text>
                {isSel && <circle cx={site.x} cy={site.y} r="5.5" fill="none" stroke={site.color} strokeWidth="0.3" strokeDasharray="1,1" opacity="0.5" />}
              </g>
            );
          })}
        </svg>
        <div className="w-48 space-y-2">
          {Object.entries(DRILL_SITES).map(([key, site]) => (
            <div key={key} onClick={() => onSelect(key)} className={'p-2 rounded-lg border cursor-pointer transition-all text-xs ' + (selected === key ? 'border-blue-400 bg-blue-900/30' : 'border-slate-700 bg-slate-800/50 hover:border-slate-500')}>
              <div className="font-bold" style={{ color: site.color }}>{key}: {site.label.split(' — ')[1]}</div>
              <div className="text-slate-400 mt-0.5">{site.desc}</div>
              <div className="flex justify-between mt-1"><span className="text-slate-500">Risk:</span><span style={{ color: site.color }}>{site.risk}</span></div>
            </div>
          ))}
        </div>
      </div>
      {selected && (
        <div className="mt-3 bg-blue-900/20 border border-blue-600/50 rounded-lg p-3 text-sm">
          <span className="font-bold text-blue-400">Selected: </span>
          <span className="text-slate-300">{DRILL_SITES[selected].label}</span>
          <span className="text-slate-400"> — {DRILL_SITES[selected].desc}</span>
        </div>
      )}
    </div>
  );
};

const GeologicalMap = ({ geoType }) => {
  if (!geoType) return null;
  const configs = {
    proven_basin: {
      label: 'Proven Basin — Cross Section',
      bgGradient: ['#1a2332', '#1e3a2f'],
      layers: [
        { y: 20, h: 25, color: '#4a6741', label: 'Sedimentary Cover', opacity: 0.7 },
        { y: 45, h: 20, color: '#8B7355', label: 'Reservoir Rock (Sandstone)', opacity: 0.8 },
        { y: 65, h: 15, color: '#6B5B4F', label: 'Source Rock (Shale)', opacity: 0.7 },
        { y: 80, h: 20, color: '#555555', label: 'Basement Rock', opacity: 0.6 },
      ],
      trap: { type: 'anticline', x: 50, y: 42, rx: 28, ry: 12 },
      oilPocket: { x: 50, y: 46, rx: 18, ry: 6, color: '#2d5a1e' },
      faults: [],
      wells: [{ x: 50, depth: 52, label: 'Target', status: 'proposed' }],
      notes: ['Anticline trap clearly visible', 'Mature source rock confirmed', 'Existing wells nearby — low risk'],
    },
    frontier_basin: {
      label: 'Frontier Basin — Cross Section',
      bgGradient: ['#1a2332', '#2a1a1a'],
      layers: [
        { y: 15, h: 30, color: '#5a6b55', label: 'Thick Sedimentary Sequence', opacity: 0.6 },
        { y: 45, h: 18, color: '#7a6b50', label: 'Potential Reservoir', opacity: 0.5 },
        { y: 63, h: 17, color: '#5a4a3a', label: 'Possible Source Rock', opacity: 0.4 },
        { y: 80, h: 20, color: '#444444', label: 'Crystalline Basement', opacity: 0.6 },
      ],
      trap: { type: 'fault', x: 55, y: 44, rx: 20, ry: 10 },
      oilPocket: null,
      faults: [
        { x1: 38, y1: 20, x2: 45, y2: 85 },
        { x1: 68, y1: 25, x2: 72, y2: 80 },
      ],
      wells: [{ x: 55, depth: 55, label: 'Target', status: 'proposed' }],
      notes: ['Fault trap — seal uncertain', 'No nearby wells — unproven area', 'High reward if successful'],
    },
    deepwater: {
      label: 'Deepwater — Cross Section',
      bgGradient: ['#0a1628', '#0a2035'],
      layers: [
        { y: 5, h: 20, color: '#1a3a5a', label: 'Ocean Water (>500m)', opacity: 0.8 },
        { y: 25, h: 15, color: '#3a5a4a', label: 'Seabed Sediment', opacity: 0.6 },
        { y: 40, h: 22, color: '#6a5a3a', label: 'Turbidite Reservoir', opacity: 0.7 },
        { y: 62, h: 15, color: '#5a4a3a', label: 'Pre-Salt Source Rock', opacity: 0.6 },
        { y: 77, h: 23, color: '#888888', label: 'Salt Layer', opacity: 0.5 },
      ],
      trap: { type: 'stratigraphic', x: 50, y: 40, rx: 25, ry: 14 },
      oilPocket: { x: 50, y: 48, rx: 15, ry: 5, color: '#1a4a2a' },
      faults: [{ x1: 30, y1: 25, x2: 35, y2: 90 }],
      wells: [{ x: 50, depth: 58, label: 'Subsea Target', status: 'proposed' }],
      notes: ['Sub-salt reservoir — complex imaging', 'High pressure, high productivity', 'Requires FPSO or platform'],
    },
    unconventional: {
      label: 'Unconventional — Cross Section',
      bgGradient: ['#1a2332', '#2a2020'],
      layers: [
        { y: 20, h: 20, color: '#5a6050', label: 'Overburden', opacity: 0.6 },
        { y: 40, h: 12, color: '#8a7a5a', label: 'Tight Sandstone', opacity: 0.7 },
        { y: 52, h: 18, color: '#6a5540', label: 'Shale (Source + Reservoir)', opacity: 0.8 },
        { y: 70, h: 10, color: '#7a6a4a', label: 'Tight Limestone', opacity: 0.5 },
        { y: 80, h: 20, color: '#555555', label: 'Basement', opacity: 0.6 },
      ],
      trap: null,
      oilPocket: null,
      faults: [
        { x1: 25, y1: 35, x2: 28, y2: 75 },
        { x1: 50, y1: 30, x2: 53, y2: 70 },
        { x1: 75, y1: 35, x2: 78, y2: 75 },
      ],
      wells: [
        { x: 35, depth: 60, label: 'Horizontal', status: 'proposed', horizontal: true },
      ],
      notes: ['Oil trapped in shale pores — needs fracking', 'Many wells required for production', 'Fast decline rates'],
    },
  };

  const cfg = configs[geoType];
  if (!cfg) return null;

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
      <h4 className="font-bold text-sm mb-3 text-center text-blue-400">{cfg.label}</h4>
      <svg viewBox="0 0 100 100" className="w-full rounded-lg" style={{ maxHeight: '280px', background: 'linear-gradient(180deg, ' + cfg.bgGradient[0] + ', ' + cfg.bgGradient[1] + ')' }}>
        {/* Surface line */}
        <line x1="0" y1={cfg.layers[0].y} x2="100" y2={cfg.layers[0].y} stroke="#5a7a5a" strokeWidth="0.5" />
        {geoType === 'deepwater' && <text x="50" y={cfg.layers[0].y + 10} textAnchor="middle" fill="#4a8aaa" fontSize="3" opacity="0.6">~ ~ ~ ~ ~ ~</text>}

        {/* Geological layers */}
        {cfg.layers.map((layer, i) => (
          <g key={i}>
            <rect x="0" y={layer.y} width="100" height={layer.h} fill={layer.color} opacity={layer.opacity} />
            <text x="3" y={layer.y + layer.h / 2 + 1} fill="white" fontSize="2.5" opacity="0.8">{layer.label}</text>
            {i > 0 && <line x1="0" y1={layer.y} x2="100" y2={layer.y} stroke="rgba(255,255,255,0.15)" strokeWidth="0.3" strokeDasharray="2,1" />}
          </g>
        ))}

        {/* Anticline trap */}
        {cfg.trap && cfg.trap.type === 'anticline' && (
          <ellipse cx={cfg.trap.x} cy={cfg.trap.y} rx={cfg.trap.rx} ry={cfg.trap.ry} fill="none" stroke="#fbbf24" strokeWidth="0.6" strokeDasharray="1.5,1" opacity="0.8" />
        )}

        {/* Oil pocket */}
        {cfg.oilPocket && (
          <ellipse cx={cfg.oilPocket.x} cy={cfg.oilPocket.y} rx={cfg.oilPocket.rx} ry={cfg.oilPocket.ry} fill={cfg.oilPocket.color} opacity="0.6" />
        )}

        {/* Faults */}
        {cfg.faults.map((f, i) => (
          <line key={i} x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} stroke="#ef4444" strokeWidth="0.6" strokeDasharray="1,0.5" opacity="0.7" />
        ))}

        {/* Wells */}
        {cfg.wells.map((w, i) => (
          <g key={i}>
            <line x1={w.x} y1={cfg.layers[0].y - 2} x2={w.x} y2={w.depth} stroke="#22d3ee" strokeWidth="0.5" />
            {w.horizontal && <line x1={w.x} y1={w.depth} x2={w.x + 20} y2={w.depth} stroke="#22d3ee" strokeWidth="0.5" />}
            <circle cx={w.x} cy={cfg.layers[0].y - 2} r="1.2" fill="#22d3ee" />
            <text x={w.x + 2} y={cfg.layers[0].y - 3} fill="#22d3ee" fontSize="2.5">{w.label}</text>
          </g>
        ))}

        {/* Legend markers */}
        {cfg.trap && (
          <text x={cfg.trap.x} y={cfg.trap.y - cfg.trap.ry - 2} textAnchor="middle" fill="#fbbf24" fontSize="2.5" fontWeight="bold">Trap Structure</text>
        )}
      </svg>

      {/* Notes */}
      <div className="mt-3 space-y-1">
        {cfg.notes.map((note, i) => (
          <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
            <span className={i === 0 ? 'text-emerald-400' : i === cfg.notes.length - 1 ? 'text-orange-400' : 'text-blue-400'}>&#x2022;</span>
            <span>{note}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const OilExplorationSimulation = () => {
  // Game state
  const [gameState, setGameState] = useState('setup');
  const [currentQuarterIndex, setCurrentQuarterIndex] = useState(0);
  const [teamComposition, setTeamComposition] = useState([]);
  const [showDecisionGate, setShowDecisionGate] = useState(false);
  const [gateDecision, setGateDecision] = useState(null);
  const [activeRole, setActiveRole] = useState(null); // Which role is currently making decisions
  const [roleApprovals, setRoleApprovals] = useState({}); // Track gate approvals by role
  const [selectedDrillSite, setSelectedDrillSite] = useState(null);
  const [selectedSeismicPkg, setSelectedSeismicPkg] = useState(null);
  const [selectedContractor, setSelectedContractor] = useState(null);
  const [riskAssessment, setRiskAssessment] = useState(null); // participant risk assessment on Q3
  const [additionalStudy, setAdditionalStudy] = useState(false); // additional seismic processing
  
  // Financial
  const [budget, setBudget] = useState(100000000);
  const [totalSpent, setTotalSpent] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [quarterlyFinancials, setQuarterlyFinancials] = useState([]);
  
  // Project data
  const [projectData, setProjectData] = useState({
    geologicalType: null,
    leaseSecured: false,
    seismicPackage: null,
    seismicQuality: null,
    seismicComplete: false,
    seismicInterpretation: null, // NEW: stores interpretation results
    probabilityOfSuccess: 0,
    drillingPermit: false,
    oilDiscovered: false,
    reserveEstimate: 0,
    oilQuality: null,
    appraisalComplete: false,
    developmentPlan: null,
    facilitiesComplete: false,
    wellsComplete: false,
    safetyCertified: false,
    proceduresApproved: false
  });
  
  // Wells
  const [wells, setWells] = useState({
    exploration: 0,
    appraisal: 0,
    production: 0,
    successful: 0,
    dry: 0
  });
  
  // Production
  const [production, setProduction] = useState({
    daily: 0,
    cumulative: 0,
    days: 0
  });
  
  // Decisions & notifications
  const [decisions, setDecisions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [justification, setJustification] = useState('');

  const currentQuarter = QUARTERS[currentQuarterIndex];
  const currentGate = currentQuarter?.gate ? DECISION_GATES[currentQuarter.gate] : null;

  // Helper to get geological characteristics
  const getGeoCharacteristics = () => {
    return projectData.geologicalType 
      ? GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]
      : null;
  };

  // Apply geological cost multiplier
  const applyGeoCost = (baseCost, costType) => {
    const geo = getGeoCharacteristics();
    if (!geo) return baseCost;
    
    const multiplierMap = {
      lease: geo.leaseCostMultiplier,
      seismic: geo.seismicCostMultiplier,
      explorationWell: geo.explorationWellMultiplier,
      appraisalWell: geo.explorationWellMultiplier, // Use same as exploration
      developmentWell: geo.developmentWellMultiplier,
      facility: geo.facilityMultiplier,
      dailyOPEX: geo.dailyOPEXMultiplier
    };
    
    return baseCost * (multiplierMap[costType] || 1.0);
  };

  // Role-based helper functions
  const hasRole = (roleId) => teamComposition.includes(roleId);
  
  const getRoleBonus = (bonusType) => {
    let bonus = 0;
    teamComposition.forEach(roleId => {
      const role = ROLES.find(r => r.id === roleId);
      if (role?.skillBonuses?.[bonusType]) {
        bonus += role.skillBonuses[bonusType];
      }
    });
    return bonus;
  };
  
  const applyRoleBonuses = (baseValue, bonusType) => {
    const bonus = getRoleBonus(bonusType);
    return baseValue * (1 + bonus);
  };
  
  const getRoleInsight = (roleId, contextKey) => {
    const role = ROLES.find(r => r.id === roleId);
    if (!role?.insights) return null;
    return role.insights[contextKey] || role.insights.all || null;
  };
  
  const checkGateRoleRequirements = () => {
    if (!currentGate) return { met: true, missing: [], recommended: [] };
    
    const gateReqs = GATE_ROLE_REQUIREMENTS[currentQuarter.gate];
    if (!gateReqs) return { met: true, missing: [], recommended: [] };
    
    const missing = gateReqs.required.filter(roleId => !hasRole(roleId));
    const missingRecommended = gateReqs.recommended.filter(roleId => !hasRole(roleId));
    
    return {
      met: missing.length === 0,
      missing,
      recommended: missingRecommended,
      requiresSignatures: Math.min(gateReqs.minimumSignatures, teamComposition.length)
    };
  };
  
  const getRoleApprovalCount = () => {
    const currentGateId = currentQuarter?.gate;
    if (!currentGateId) return 0;
    return Object.keys(roleApprovals[currentGateId] || {}).filter(
      roleId => roleApprovals[currentGateId][roleId] === true
    ).length;
  };
  
  const toggleRoleApproval = (roleId) => {
    const currentGateId = currentQuarter?.gate;
    if (!currentGateId) return;
    
    setRoleApprovals(prev => ({
      ...prev,
      [currentGateId]: {
        ...(prev[currentGateId] || {}),
        [roleId]: !(prev[currentGateId]?.[roleId] || false)
      }
    }));
  };

  // Helper functions
  const addNotification = (message, type = 'info') => {
    setNotifications(prev => [{
      id: Date.now(),
      message,
      type,
      quarter: currentQuarter.name,
      timestamp: new Date().toLocaleTimeString()
    }, ...prev].slice(0, 15));
  };

  const logDecision = (action, cost, outcome, risks) => {
    setDecisions(prev => [{
      id: Date.now(),
      quarter: currentQuarter.name,
      action,
      cost,
      outcome,
      risks,
      budget: budget - cost,
      timestamp: new Date().toLocaleString(),
      justification
    }, ...prev]);
    setJustification('');
  };

  const calculateProbability = () => {
    const seismicQuality = projectData.seismicQuality;
    const geologicalType = projectData.geologicalType;
    
    if (!seismicQuality || !geologicalType) return 0;
    
    const seismicProb = PROBABILITIES.seismic[seismicQuality] || 0;
    const geoProb = PROBABILITIES.geological[geologicalType] || 0;
    return Math.min(0.95, (seismicProb + geoProb) / 2 + (Math.random() * 0.1 - 0.05));
  };

  const calculateNPV = (reserves, wellCount, dailyProd) => {
    const years = 20;
    const geo = getGeoCharacteristics();
    
    const annualProd = dailyProd * 365;
    const oilPrice = COSTS.oilPrice + (geo ? geo.oilPriceDiscount : 0);
    const annualRevenue = annualProd * oilPrice;
    
    let baseOPEX = COSTS.dailyOPEX * 365;
    if (geo) {
      baseOPEX *= geo.dailyOPEXMultiplier;
    }
    
    // Apply role bonuses to OPEX
    if (hasRole('operations')) {
      baseOPEX *= (1 - getRoleBonus('operatingCostReduction'));
    }
    if (hasRole('finance')) {
      baseOPEX *= (1 - getRoleBonus('budgetEfficiency'));
    }
    
    let devCost = wellCount * COSTS.developmentWell + COSTS.facility;
    if (geo) {
      devCost = wellCount * applyGeoCost(COSTS.developmentWell, 'developmentWell') + 
                applyGeoCost(COSTS.facility, 'facility');
    }
    
    // Apply engineer cost reduction
    if (hasRole('engineer')) {
      devCost *= (1 - getRoleBonus('drillingCostReduction'));
    }
    
    const declineRate = geo ? geo.declineRateAnnual : 0.05;
    
    let npv = -totalSpent - devCost;
    for (let year = 1; year <= years; year++) {
      const decline = Math.pow(1 - declineRate, year);
      const netCash = (annualRevenue - baseOPEX) * decline;
      npv += netCash / Math.pow(1 + COSTS.discountRate, year);
    }
    
    // Subtract abandonment cost at end
    if (geo) {
      npv -= geo.abandonmentCost / Math.pow(1 + COSTS.discountRate, years);
    }
    
    return npv;
  };

  // Start game
  const startGame = () => {
    if (teamComposition.length === 0) {
      addNotification('Please select at least one team role!', 'error');
      return;
    }
    setGameState('playing');
    setShowDecisionGate(false); // Changed: Don't show gate immediately
    addNotification(`Project launched! Current period: ${currentQuarter.name}`, 'success');
    addNotification('Complete Q1 activities, then proceed to Decision Gate 1', 'info');
  };

  const toggleRole = (roleId) => {
    setTeamComposition(prev => 
      prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]
    );
  };

  // Quarter actions
  const selectGeological = (type) => {
    setProjectData(prev => ({ ...prev, geologicalType: type }));
    addNotification(`Geological area selected: ${type.replace('_', ' ')}`, 'info');
  };

  const secureLease = () => {
    const baseCost = COSTS.lease + COSTS.environmental + COSTS.permits;
    const cost = applyGeoCost(baseCost, 'lease');
    
    if (budget < cost) {
      addNotification('Insufficient budget!', 'error');
      return;
    }
    setBudget(prev => prev - cost);
    setTotalSpent(prev => prev + cost);
    setProjectData(prev => ({ ...prev, leaseSecured: true }));
    
    const geo = getGeoCharacteristics();
    const costNote = geo && geo.leaseCostMultiplier !== 1.0 
      ? ` (${geo.leaseCostMultiplier}x for ${geo.name})`
      : '';
    
    addNotification(`Lease secured and permits obtained (${(cost/1e6).toFixed(1)}M${costNote})`, 'success');
  };

  const revokeLease = () => {
    if (!projectData.leaseSecured) return;
    const baseCost = COSTS.lease + COSTS.environmental + COSTS.permits;
    const cost = applyGeoCost(baseCost, 'lease');
    setBudget(prev => prev + cost);
    setTotalSpent(prev => prev - cost);
    setProjectData(prev => ({ ...prev, leaseSecured: false, geologicalType: null }));
    addNotification('Lease revoked. Budget refunded. You can select a different area.', 'info');
  };

  const conductSeismic = (packageType) => {
    // Check if we already paid at Gate 1
    const alreadyPaid = decisions.some(d => d.action.includes('FID 1'));
    
    const pkg = SEISMIC_PACKAGES[packageType];
    const baseCost = pkg.cost + pkg.processingCost;
    const cost = alreadyPaid ? 0 : applyGeoCost(baseCost, 'seismic');
    
    if (!alreadyPaid && budget < cost) {
      addNotification('Insufficient budget for seismic survey!', 'error');
      return;
    }
    
    if (!alreadyPaid) {
      setBudget(prev => prev - cost);
      setTotalSpent(prev => prev + cost);
    }
    
    // Calculate probability with both geological type and seismic quality
    const geoType = projectData.geologicalType;
    if (!geoType) {
      addNotification('Error: Geological type not selected!', 'error');
      return;
    }
    
    let seismicProb = pkg.qualityScore;
    // Apply contractor quality modifier if selected
    if (selectedContractor && SEISMIC_CONTRACTORS[selectedContractor]) {
      seismicProb += SEISMIC_CONTRACTORS[selectedContractor].qualityMod;
    }
    const geoProb = PROBABILITIES.geological[geoType] || 0;
    
    // Apply geologist bonus if on team
    if (hasRole('geologist')) {
      seismicProb += getRoleBonus('seismicQualityBoost');
      addNotification('🔬 Geologist expertise: Enhanced seismic interpretation (+10%)', 'success');
    }
    
    const combinedProb = Math.min(0.95, (seismicProb + geoProb) / 2 + (Math.random() * 0.1 - 0.05));
    
    // Generate seismic interpretation results
    const interpretation = generateSeismicInterpretation(packageType, geoType);
    
    setProjectData(prev => ({ 
      ...prev,
      seismicPackage: packageType,
      seismicQuality: pkg.quality,
      seismicComplete: true,
      seismicInterpretation: interpretation,
      probabilityOfSuccess: combinedProb
    }));
    
    const geo = getGeoCharacteristics();
    const costMsg = alreadyPaid 
      ? '(already funded at Gate 1)' 
      : geo && geo.seismicCostMultiplier !== 1.0
        ? `($${(cost/1e6).toFixed(1)}M - ${geo.seismicCostMultiplier}x for ${geo.name})`
        : `($${(cost/1e6).toFixed(1)}M)`;
    
    addNotification(`Seismic ${pkg.name} acquired ${costMsg}`, 'success');
    addNotification(`Interpretation complete. Combined probability: ${(combinedProb * 100).toFixed(1)}%`, 'info');
    
    // Notify about key findings
    if (interpretation.dhiPresent) {
      addNotification(`🎯 Direct Hydrocarbon Indicators detected!`, 'success');
    }
    if (interpretation.amplitudeAnomaly) {
      addNotification(`📊 Amplitude anomaly identified - ${interpretation.amplitudeStrength}`, 'info');
    }
    if (interpretation.risks.length > 0) {
      addNotification(`⚠️ ${interpretation.risks.length} risk factors identified`, 'error');
    }
  };

  // Additional seismic processing to improve confidence
  const runAdditionalStudy = () => {
    const cost = 2000000; // $2M for reprocessing
    if (budget < cost) {
      addNotification('Insufficient budget for additional study!', 'error');
      return;
    }
    setBudget(prev => prev - cost);
    setTotalSpent(prev => prev + cost);
    setAdditionalStudy(true);

    // Improve confidence levels and probability
    setProjectData(prev => {
      const interp = { ...prev.seismicInterpretation };
      interp.structuralConfidence = Math.min(0.95, interp.structuralConfidence + 0.15);
      interp.volumetricConfidence = Math.min(0.95, interp.volumetricConfidence + 0.12);
      interp.fluidConfidence = Math.min(0.95, interp.fluidConfidence + 0.10);
      // May reveal new DHI
      if (!interp.dhiPresent && Math.random() < 0.3) {
        interp.dhiPresent = true;
        interp.dhiTypes = ['Amplitude anomaly (reprocessed)'];
      }
      // Remove one risk factor if any
      if (interp.risks.length > 0) {
        interp.risks = interp.risks.slice(1);
      }
      const newProb = Math.min(0.95, prev.probabilityOfSuccess + 0.05);
      return { ...prev, seismicInterpretation: interp, probabilityOfSuccess: newProb };
    });

    addNotification('Additional seismic reprocessing complete. Confidence levels improved (+5% probability).', 'success');
    logDecision('Additional Seismic Study', cost, 'Confidence improved', 'Reduced uncertainty');
  };

    const obtainDrillingPermit = () => {
    setProjectData(prev => ({ ...prev, drillingPermit: true }));
    addNotification('Drilling permit approved', 'success');
  };

  const drillExplorationWell = (alreadyPaid = false) => {
    const baseCost = COSTS.explorationWell;
    let cost = applyGeoCost(baseCost, 'explorationWell');
    
    // Apply engineer cost reduction if on team (but gate already used base cost)
    if (hasRole('engineer') && !alreadyPaid) {
      const reduction = getRoleBonus('drillingCostReduction');
      cost = cost * (1 - reduction);
      addNotification(`⚙️ Engineer expertise: Drilling cost optimized (-${(reduction*100).toFixed(0)}%)`, 'success');
    }
    
    if (!alreadyPaid) {
      if (budget < cost) {
        addNotification('Insufficient budget!', 'error');
        return false;
      }
      
      setBudget(prev => prev - cost);
      setTotalSpent(prev => prev + cost);
    }
    
    let prob = projectData.probabilityOfSuccess || calculateProbability();

    // Apply drill site location modifier
    if (selectedDrillSite && typeof DRILL_SITES !== 'undefined') {
      const siteData = DRILL_SITES[selectedDrillSite];
      if (siteData) {
        prob += siteData.probMod;
        addNotification('Drilling at ' + siteData.label + ' (probability: ' + (siteData.probMod >= 0 ? '+' : '') + (siteData.probMod * 100).toFixed(0) + '%)', 'info');
      }
    }
    
    // Apply geologist probability boost if on team
    if (hasRole('geologist')) {
      prob += getRoleBonus('probabilityBoost');
      prob = Math.min(0.95, prob);
    }
    
    const success = Math.random() < prob;
    
    if (success) {
      const geo = getGeoCharacteristics();
      
      // Use geological reserve range
      const minReserves = geo ? geo.reserveRangeMin : 10000000;
      const maxReserves = geo ? geo.reserveRangeMax : 60000000;
      let reserves = Math.floor(Math.random() * (maxReserves - minReserves) + minReserves);
      
      // Apply geologist reserve accuracy bonus
      if (hasRole('geologist')) {
        const accuracyBonus = getRoleBonus('reserveAccuracy');
        const variation = (1 - accuracyBonus) * 0.3;
        reserves = reserves * (1 + (Math.random() * variation * 2 - variation));
        addNotification('🔬 Geologist: Reserve estimate refined with higher confidence', 'info');
      }
      
      // Determine oil quality based on geological weights
      let quality = 'medium';
      if (geo && geo.oilQualityWeights) {
        const rand = Math.random();
        const weights = geo.oilQualityWeights;
        if (rand < weights.heavy) quality = 'heavy';
        else if (rand < weights.heavy + weights.medium) quality = 'medium';
        else quality = 'light';
      } else {
        quality = Math.random() > 0.5 ? 'light' : Math.random() > 0.5 ? 'medium' : 'heavy';
      }
      
      setProjectData(prev => ({
        ...prev,
        oilDiscovered: true,
        reserveEstimate: Math.floor(reserves),
        oilQuality: quality
      }));
      setWells(prev => ({ ...prev, exploration: prev.exploration + 1, successful: prev.successful + 1 }));
      
      const geoNote = geo ? ` (${geo.name} typical range)` : '';
      addNotification(`🎉 OIL DISCOVERED! Estimated ${(reserves/1e6).toFixed(1)}M barrels of ${quality} crude${geoNote}`, 'success');
      return true;
    } else {
      setWells(prev => ({ ...prev, exploration: prev.exploration + 1, dry: prev.dry + 1 }));
      setProjectData(prev => ({ ...prev, oilDiscovered: false }));
      addNotification('Dry hole - no commercial oil found. Consider your options.', 'warning');
      setGameState('dry_hole');
      return false;
    }
  };

  const drillAppraisalWells = (count) => {
    const cost = count * COSTS.appraisalWell;
    if (budget < cost) {
      addNotification('Insufficient budget!', 'error');
      return;
    }
    
    setBudget(prev => prev - cost);
    setTotalSpent(prev => prev + cost);
    setWells(prev => ({ ...prev, appraisal: count }));
    
    // Refine reserve estimate
    const refinement = 1 + (Math.random() * 0.4 - 0.2);
    setProjectData(prev => ({
      ...prev,
      reserveEstimate: Math.floor(prev.reserveEstimate * refinement),
      appraisalComplete: true
    }));
    
    addNotification(`${count} appraisal wells completed. Reserve estimate refined.`, 'success');
  };

  const approveDevelopmentPlan = (wellCount) => {
    const devCost = wellCount * COSTS.developmentWell + COSTS.facility;
    const estimatedProd = wellCount * 2000;
    const npv = calculateNPV(projectData.reserveEstimate, wellCount, estimatedProd);
    
    setProjectData(prev => ({
      ...prev,
      costEstimate: true,
      developmentPlan: {
        wellCount,
        estimatedCost: devCost,
        estimatedProduction: estimatedProd,
        npv
      }
    }));
    
    addNotification(`Development plan approved: ${wellCount} wells, NPV: $${(npv/1e6).toFixed(1)}M`, 'success');
  };


  // Project Finance — secure a loan for development
  const secureLoan = () => {
    const plan = projectData.developmentPlan;
    if (!plan) return;

    let cost = plan.estimatedCost;
    if (hasRole('engineer')) {
      cost = cost * (1 - getRoleBonus('drillingCostReduction'));
    }

    const shortfall = cost - budget;
    if (shortfall <= 0) {
      addNotification('Budget is sufficient — no loan needed.', 'info');
      return;
    }

    // Loan covers the shortfall + 20% buffer, at 12% interest
    const loanAmount = Math.ceil(shortfall * 1.2);
    let interestRate = 0.12;

    // Finance manager gets better terms
    if (hasRole('finance')) {
      interestRate -= getRoleBonus('betterFinancing');
      addNotification(`Finance Manager: Negotiated better loan terms (${(interestRate * 100).toFixed(1)}% vs 12%)`, 'success');
    }

    const totalRepayment = Math.floor(loanAmount * (1 + interestRate));

    setBudget(prev => prev + loanAmount);
    // Repayment will reduce future revenue
    setTotalSpent(prev => prev + totalRepayment - loanAmount); // Interest is a cost

    addNotification(
      `Project finance secured: $${(loanAmount/1e6).toFixed(1)}M loan at ${(interestRate*100).toFixed(1)}% interest. Repayment: $${(totalRepayment/1e6).toFixed(1)}M`,
      'success'
    );
    logDecision(
      'Secure Project Finance Loan',
      totalRepayment - loanAmount,
      `Loan: $${(loanAmount/1e6).toFixed(1)}M, Interest: $${((totalRepayment - loanAmount)/1e6).toFixed(1)}M`,
      'Debt increases project risk, reduces NPV'
    );
  };
  const executeDevelopment = () => {
    const plan = projectData.developmentPlan;
    if (!plan) return;
    
    let cost = plan.estimatedCost;
    
    // Apply engineer cost reduction
    if (hasRole('engineer')) {
      const reduction = getRoleBonus('drillingCostReduction');
      cost = cost * (1 - reduction);
      addNotification(`⚙️ Engineer: Development costs optimized (-${(reduction*100).toFixed(0)}%)`, 'success');
    }
    
    if (budget < cost) {
      addNotification('Insufficient budget for development!', 'error');
      return;
    }
    
    setBudget(prev => prev - cost);
    setTotalSpent(prev => prev + cost);
    setWells(prev => ({ ...prev, production: plan.wellCount }));
    
    let dailyProd = plan.estimatedProduction;
    
    // Apply operations production boost
    if (hasRole('operations')) {
      const boost = getRoleBonus('productionOptimization');
      dailyProd = Math.floor(dailyProd * (1 + boost));
      addNotification(`📊 Operations: Production optimized (+${(boost*100).toFixed(0)}%)`, 'success');
    }
    
    // Apply engineer well performance boost
    if (hasRole('engineer')) {
      const boost = getRoleBonus('wellPerformanceBoost');
      dailyProd = Math.floor(dailyProd * (1 + boost));
      addNotification(`⚙️ Engineer: Well productivity enhanced (+${(boost*100).toFixed(0)}%)`, 'success');
    }
    
    setProduction(prev => ({ ...prev, daily: dailyProd }));
    setProjectData(prev => ({
      ...prev,
      facilitiesComplete: true,
      wellsComplete: true,
      safetyCertified: true,
      proceduresApproved: true
    }));
    
    addNotification(`Field development complete! Production capacity: ${dailyProd.toLocaleString()} bpd`, 'success');
  };

  // Decision gate handling
  const evaluateGate = () => {
    if (!currentGate) return { canProceed: true, missing: [] };
    
    const missing = [];
    for (const req of currentGate.requirements) {
      if (req.key === 'budgetCheck') {
        if (budget < req.amount) missing.push(`Budget insufficient (need $${(req.amount/1e6).toFixed(1)}M)`);
      } else if (req.key === 'probabilityCalculated') {
        if (projectData.probabilityOfSuccess === 0) missing.push('Probability not calculated');
      } else if (req.key === 'preliminaryNPV') {
        const npv = calculateNPV(projectData.reserveEstimate || 0, 5, 10000);
        if (npv < req.threshold) missing.push('NPV does not meet threshold');
      } else if (req.key === 'reservesEstimated') {
        if (!projectData.reserveEstimate || projectData.reserveEstimate === 0) missing.push('Reserves not estimated');
      } else if (req.key === 'npvApproved') {
        if (!projectData.developmentPlan || projectData.developmentPlan.npv < req.threshold) {
          missing.push(`NPV below hurdle rate (need $${(req.threshold/1e6).toFixed(0)}M)`);
        }
      } else if (!projectData[req.key]) {
        missing.push(req.item);
      }
    }
    
    // Require seismic package and contractor for GATE_1
    if (currentQuarter.gate === 'GATE_1') {
      if (!selectedSeismicPkg) {
        missing.push('Seismic package not selected');
      }
      if (!selectedContractor) {
        missing.push('Seismic contractor not selected');
      }
    }

    // Require drill site selection for GATE_2
    if (currentQuarter.gate === 'GATE_2' && !selectedDrillSite) {
      missing.push('Drill site location not selected (use the map above)');
    }

    return { canProceed: missing.length === 0, missing };
  };

  // === Dry Hole Recovery Options ===

  // Option 1: Drill another well on the same lease (different location)
  const drillAnotherWell = () => {
    const baseCost = COSTS.explorationWell;
    let cost = applyGeoCost(baseCost, 'explorationWell');

    if (hasRole('engineer')) {
      const reduction = getRoleBonus('drillingCostReduction');
      cost = cost * (1 - reduction);
    }

    if (budget < cost) {
      addNotification('Insufficient budget for another exploration well!', 'error');
      return;
    }

    setBudget(prev => prev - cost);
    setTotalSpent(prev => prev + cost);

    // Slightly lower probability — already missed once on this lease
    let prob = (projectData.probabilityOfSuccess || 0.20) * 0.85;
    if (hasRole('geologist')) {
      prob += getRoleBonus('probabilityBoost');
      prob = Math.min(0.95, prob);
    }

    const success = Math.random() < prob;

    if (success) {
      const geo = getGeoCharacteristics();
      const minReserves = geo ? geo.reserveRangeMin : 10000000;
      const maxReserves = geo ? geo.reserveRangeMax : 60000000;
      let reserves = Math.floor(Math.random() * (maxReserves - minReserves) + minReserves);

      if (hasRole('geologist')) {
        const accuracyBonus = getRoleBonus('reserveAccuracy');
        const variation = (1 - accuracyBonus) * 0.3;
        reserves = reserves * (1 + (Math.random() * variation * 2 - variation));
      }

      let quality = 'medium';
      if (geo && geo.oilQualityWeights) {
        const rand = Math.random();
        const weights = geo.oilQualityWeights;
        if (rand < weights.heavy) quality = 'heavy';
        else if (rand < weights.heavy + weights.medium) quality = 'medium';
        else quality = 'light';
      }

      setProjectData(prev => ({
        ...prev,
        oilDiscovered: true,
        reserveEstimate: Math.floor(reserves),
        oilQuality: quality
      }));
      setWells(prev => ({ ...prev, exploration: prev.exploration + 1, successful: prev.successful + 1 }));

      addNotification(`OIL DISCOVERED on second attempt! Estimated ${(reserves/1e6).toFixed(1)}M barrels of ${quality} crude`, 'success');
      setGameState('playing');
      // Move to appraisal phase activities
      setCurrentQuarterIndex(4); // H1_Y2 — appraisal activities
      setShowDecisionGate(false);
    } else {
      setWells(prev => ({ ...prev, exploration: prev.exploration + 1, dry: prev.dry + 1 }));
      addNotification('Second well also dry. Consider changing strategy.', 'warning');
      // Stay in dry_hole state — can try again or give up
    }

    logDecision(
      'Drill Another Well (Same Lease)',
      cost,
      success ? 'Oil Discovered!' : 'Dry Hole',
      'Re-drill risk on existing lease'
    );
  };

  // Option 2: Move to a new geological area
  const relocateExploration = (newGeoType) => {
    const geo = GEOLOGICAL_CHARACTERISTICS[newGeoType];
    const relocationCost = applyGeoCost(COSTS.lease + COSTS.environmental + COSTS.permits, 'lease') * 0.7;
    const seismicCost = applyGeoCost(COSTS.seismic + COSTS.dataProcessing, 'seismic') * 0.5;
    const totalCost = relocationCost + seismicCost;

    if (budget < totalCost) {
      addNotification('Insufficient budget for relocation!', 'error');
      return;
    }

    setBudget(prev => prev - totalCost);
    setTotalSpent(prev => prev + totalCost);

    // Reset project data for new area but keep team and wells history
    setProjectData(prev => ({
      ...prev,
      geologicalType: newGeoType,
      leaseSecured: true,
      seismicComplete: true,
      seismicPackage: prev.seismicPackage,
      seismicQuality: prev.seismicQuality,
      oilDiscovered: false,
      probabilityOfSuccess: geo.probability + (PROBABILITIES.seismic[prev.seismicQuality] || 0.10),
      reserveEstimate: 0,
      oilQuality: null,
      appraisalComplete: false,
      developmentPlan: null
    }));

    addNotification(`Relocated to ${geo.name}. New lease and fast-track seismic complete ($${(totalCost/1e6).toFixed(1)}M)`, 'success');
    logDecision(
      `Relocate to ${geo.name}`,
      totalCost,
      'New exploration area secured',
      'Fresh geological risk, prior investment lost'
    );

    // Go back to Gate 2 — drill decision
    setGameState('playing');
    setCurrentQuarterIndex(3); // Q4_Y1 — GATE_2
    setShowDecisionGate(false);
  };

  // Option 3: Farm-out — bring a partner to share risk
  const farmOut = () => {
    const partnerContribution = budget * 0.5; // Partner doubles your remaining budget
    const drillingCost = applyGeoCost(COSTS.explorationWell, 'explorationWell');

    setBudget(prev => prev + partnerContribution);

    // Partner brings expertise — probability bonus
    let prob = (projectData.probabilityOfSuccess || 0.20) * 0.9;
    prob += 0.08; // Partner's technical expertise
    if (hasRole('geologist')) {
      prob += getRoleBonus('probabilityBoost');
    }
    prob = Math.min(0.95, prob);

    // Partner pays half the well cost
    const ourCost = drillingCost * 0.5;
    if (budget < ourCost) {
      addNotification('Insufficient budget even with partner!', 'error');
      return;
    }

    setBudget(prev => prev - ourCost);
    setTotalSpent(prev => prev + ourCost);

    const success = Math.random() < prob;

    if (success) {
      const geo = getGeoCharacteristics();
      const minReserves = geo ? geo.reserveRangeMin : 10000000;
      const maxReserves = geo ? geo.reserveRangeMax : 60000000;
      // Partner takes 40% of reserves
      let reserves = Math.floor(Math.random() * (maxReserves - minReserves) + minReserves) * 0.6;

      let quality = 'medium';
      if (geo && geo.oilQualityWeights) {
        const rand = Math.random();
        const weights = geo.oilQualityWeights;
        if (rand < weights.heavy) quality = 'heavy';
        else if (rand < weights.heavy + weights.medium) quality = 'medium';
        else quality = 'light';
      }

      setProjectData(prev => ({
        ...prev,
        oilDiscovered: true,
        reserveEstimate: Math.floor(reserves),
        oilQuality: quality
      }));
      setWells(prev => ({ ...prev, exploration: prev.exploration + 1, successful: prev.successful + 1 }));

      addNotification(`OIL DISCOVERED with partner! Your share: ${(reserves/1e6).toFixed(1)}M barrels (60/40 split)`, 'success');
      setGameState('playing');
      setCurrentQuarterIndex(4);
      setShowDecisionGate(false);
    } else {
      setWells(prev => ({ ...prev, exploration: prev.exploration + 1, dry: prev.dry + 1 }));
      addNotification('Joint venture well was dry. Partner absorbs shared losses.', 'warning');
    }

    logDecision(
      'Farm-Out: Joint Venture Well',
      ourCost,
      success ? 'Oil Discovered (60/40 split)' : 'Dry Hole (shared loss)',
      'Shared risk with partner, reduced upside'
    );
  };

  // Option 4: Abandon project entirely
  const abandonProject = () => {
    logDecision('Abandon Project', 0, 'Project Abandoned after dry hole', 'Cut losses');
    addNotification('Project abandoned. All exploration costs are sunk.', 'error');
    setGameState('ended');
  };

  const makeGateDecision = (proceed) => {
    if (proceed) {
      const evaluation = evaluateGate();
      if (!evaluation.canProceed) {
        addNotification(`Cannot proceed: ${evaluation.missing.join(', ')}`, 'error');
        return;
      }
      
      // Check role approvals
      const approvalCount = getRoleApprovalCount();
      const roleReqs = checkGateRoleRequirements();
      
      if (approvalCount < roleReqs.requiresSignatures) {
        addNotification(
          `Insufficient approvals: Need ${roleReqs.requiresSignatures}, have ${approvalCount}`,
          'error'
        );
        return;
      }
      
      // Check for required roles on team
      if (!roleReqs.met) {
        const proceed = window.confirm(
          `WARNING: You are missing required roles (${roleReqs.missing.map(rid => ROLES.find(r => r.id === rid)?.name).join(', ')}). This increases project risk. Proceed anyway?`
        );
        if (!proceed) return;
      }
      
      // Execute the gate's investment/action
      if (currentGate.cost > 0) {
        if (budget < currentGate.cost) {
          addNotification('Insufficient budget for this decision!', 'error');
          return;
        }
        setBudget(prev => prev - currentGate.cost);
        setTotalSpent(prev => prev + currentGate.cost);
      }
      
      // Gate-specific actions
      if (currentQuarter.gate === 'GATE_1') {
        if (selectedSeismicPkg) {
          setProjectData(prev => ({ ...prev, seismicPackage: selectedSeismicPkg }));
        }
        const ctr = selectedContractor ? SEISMIC_CONTRACTORS[selectedContractor] : null;
        const ctrName = ctr ? ctr.name : 'Default';
        addNotification('Seismic survey contract awarded to ' + ctrName, 'success');
      } else if (currentQuarter.gate === 'GATE_2') {
        // Drill exploration well - cost already deducted at gate
        const drillSuccess = drillExplorationWell(true);
        if (!drillSuccess) {
          // Dry hole - don't advance, game will end
          setTimeout(() => {
            setShowDecisionGate(false);
          }, 2000);
          return; // Exit early, don't advance quarter
        }
      }
      
      logDecision(
        currentGate.name,
        currentGate.cost,
        `Approved - Proceed (${approvalCount} team approvals)`,
        currentGate.risks.map(r => r.name).join(', ')
      );
      addNotification(`${currentGate.name} - APPROVED by ${approvalCount} team members`, 'success');
      setGateDecision('approved');
      
      setTimeout(() => {
        setShowDecisionGate(false);
        setGateDecision(null);
        // Advance quarter
        if (currentQuarterIndex < QUARTERS.length - 1) {
          setCurrentQuarterIndex(prev => prev + 1);
          setTimeout(() => {
            if (QUARTERS[currentQuarterIndex + 1].gate && !["GATE_3", "GATE_4", "GATE_5"].includes(QUARTERS[currentQuarterIndex + 1].gate)) {
              setShowDecisionGate(true);
            }
          }, 1000);
        }
      }, 2000);
      
    } else {
      logDecision(
        currentGate.name,
        0,
        'Rejected - Project Terminated',
        'Risk mitigation: Exit before further investment'
      );
      addNotification(`${currentGate.name} - REJECTED. Project terminated.`, 'error');
      setGameState('ended');
    }
  };

  const advanceWithoutGate = () => {
    if (currentQuarterIndex < QUARTERS.length - 1) {
      setCurrentQuarterIndex(prev => prev + 1);
      addNotification(`Advanced to ${QUARTERS[currentQuarterIndex + 1].name}`, 'info');
      if (QUARTERS[currentQuarterIndex + 1].gate) {
        setTimeout(() => setShowDecisionGate(true), 500);
      }
    }
  };

  // Production simulation
  useEffect(() => {
    if (gameState === 'playing' && currentQuarter.phase === 'production' && production.daily > 0) {
      const interval = setInterval(() => {
        setProduction(prev => {
          const newDay = prev.days + 1;
          const dailyRev = prev.daily * COSTS.oilPrice;
          
          let dailyCost = COSTS.dailyOPEX;
          
          // Apply operations cost reduction
          if (hasRole('operations')) {
            const reduction = getRoleBonus('operatingCostReduction');
            dailyCost = dailyCost * (1 - reduction);
          }
          
          // Apply finance budget efficiency
          if (hasRole('finance')) {
            const reduction = getRoleBonus('budgetEfficiency');
            dailyCost = dailyCost * (1 - reduction);
          }
          
          const net = dailyRev - dailyCost;
          
          setRevenue(r => r + dailyRev);
          setBudget(b => b + net);
          
          return {
            ...prev,
            days: newDay,
            cumulative: prev.cumulative + prev.daily
          };
        });
      }, 50);
      
      return () => clearInterval(interval);
    }
  }, [gameState, currentQuarter.phase, production.daily]);

  const gateEvaluation = evaluateGate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Droplet size={40} className="text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Oil Exploration Simulator
            </h1>
          </div>
          <p className="text-slate-300">Phase-Gated Project Management | Quarterly Decision Points</p>
        </div>

        {/* Setup Phase */}
        {gameState === 'setup' && (
          <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
            <h2 className="text-3xl font-bold mb-6 text-center">Build Your Exploration Team</h2>

            {/* Educational Introduction */}
            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-lg text-blue-400 mb-3">Welcome to Oil Exploration Simulator</h3>
              <p className="text-sm text-slate-300 mb-4">You are the project manager of an oil exploration company. Your goal is to find and develop an oil field from initial geological survey to full-scale production. Every decision carries risk, and your budget of 100M dollars is limited.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-800/80 rounded-lg p-3 border border-emerald-600/50"><div className="text-emerald-400 font-bold mb-1">1. Exploration</div><div className="text-slate-400">Find a promising area and drill a test well</div></div>
                <div className="bg-slate-800/80 rounded-lg p-3 border border-blue-600/50"><div className="text-blue-400 font-bold mb-1">2. Appraisal</div><div className="text-slate-400">Confirm the discovery and estimate reserves</div></div>
                <div className="bg-slate-800/80 rounded-lg p-3 border border-orange-600/50"><div className="text-orange-400 font-bold mb-1">3. Development</div><div className="text-slate-400">Build wells and infrastructure</div></div>
                <div className="bg-slate-800/80 rounded-lg p-3 border border-purple-600/50"><div className="text-purple-400 font-bold mb-1">4. Production</div><div className="text-slate-400">Extract oil and generate revenue</div></div>
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">At each stage you will face Decision Gates (FID) — critical go/no-go decisions that determine the project future.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {ROLES.map(role => (
                <div
                  key={role.id}
                  onClick={() => toggleRole(role.id)}
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    teamComposition.includes(role.id)
                      ? 'border-emerald-400 bg-emerald-900/30 shadow-lg'
                      : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                  }`}
                >
                  <div className="text-4xl mb-3 text-center">{role.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-center" style={{ color: role.color }}>
                    {role.name}
                  </h3>
                  <p className="text-sm text-slate-300 text-center mb-3">{role.description}</p>
                  
                  {/* Skill Bonuses */}
                  <div className="bg-slate-900/50 rounded p-2 text-xs space-y-1">
                    <div className="font-semibold text-center mb-1" style={{ color: role.color }}>
                      Key Benefits:
                    </div>
                    {Object.entries(role.skillBonuses).slice(0, 2).map(([key, value]) => (
                      <div key={key} className="text-slate-400 text-center">
                        +{(value * 100).toFixed(0)}% {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-lg mb-6">
              <div className="bg-emerald-900/20 border border-emerald-600/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-emerald-300"><span className="font-bold">Tip for beginners:</span> Select all 4 roles for maximum bonuses and the best chance of success. Advanced players can limit the team for a greater challenge.</p>
            </div>

            <h3 className="text-xl font-bold mb-3">Project Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div><span className="text-slate-400">Initial Budget:</span> <span className="font-bold text-emerald-400">$100M</span></div>
                <div><span className="text-slate-400">Timeline:</span> <span className="font-bold text-blue-400">4+ Years</span></div>
                <div><span className="text-slate-400">Decision Gates:</span> <span className="font-bold text-purple-400">5 Critical FIDs</span></div>
                <div><span className="text-slate-400">Oil Price:</span> <span className="font-bold text-orange-400">$75/bbl</span></div>
                <div><span className="text-slate-400">Hurdle Rate:</span> <span className="font-bold text-red-400">10% NPV</span></div>
                <div><span className="text-slate-400">Team Size:</span> <span className="font-bold text-yellow-400">{teamComposition.length} roles</span></div>
              </div>
            </div>
            
            <button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg"
            >
              Launch Exploration Project →
            </button>
          </div>
        )}

        {/* Game Interface */}
        {gameState === 'playing' && (
          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-blue-400" size={24} />
                  <div>
                    <div className="font-bold text-lg">{currentQuarter.name}</div>
                    <div className="text-sm text-slate-400">Phase: {currentQuarter.phase}</div>
                  </div>
                </div>
                {currentQuarter.gate && (
                  <div className="flex items-center gap-2 text-orange-400">
                    <AlertTriangle size={20} />
                    <span className="font-semibold">Decision Gate Ahead</span>
                  </div>
                )}
              </div>
              
              {/* Progress bar */}
              <div className="flex gap-2">
                {QUARTERS.slice(0, -1).map((q, idx) => (
                  <div
                    key={q.id}
                    className={`flex-1 h-2 rounded ${
                      idx < currentQuarterIndex ? 'bg-emerald-500' :
                      idx === currentQuarterIndex ? 'bg-blue-500 animate-pulse' :
                      'bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Status Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-emerald-100 text-sm">Budget</div>
                    <div className="text-2xl font-bold">${(budget/1e6).toFixed(1)}M</div>
                  </div>
                  <DollarSign size={28} className="text-emerald-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-orange-100 text-sm">Total Spent</div>
                    <div className="text-2xl font-bold">${(totalSpent/1e6).toFixed(1)}M</div>
                  </div>
                  <TrendingUp size={28} className="text-orange-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-blue-100 text-sm">Revenue</div>
                    <div className="text-2xl font-bold">${(revenue/1e6).toFixed(1)}M</div>
                  </div>
                  <Droplet size={28} className="text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-purple-100 text-sm">Production</div>
                    <div className="text-2xl font-bold">{production.daily.toLocaleString()} bpd</div>
                  </div>
                  <Zap size={28} className="text-purple-200" />
                </div>
              </div>
            </div>

            {/* Decision Gate Modal */}
            {showDecisionGate && currentGate && (
              <div className="bg-slate-800 rounded-xl p-6 border-4 border-orange-500 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <Target size={32} className="text-orange-400" />
                  <div>
                    <h2 className="text-2xl font-bold text-orange-400">{currentGate.name}</h2>
                    <p className="text-slate-300">{currentGate.description}</p>
                  </div>
                </div>

                {/* Selected Area Info */}
                {projectData.geologicalType && (
                  <div className="bg-slate-900/50 rounded-lg p-4 mb-6 flex items-center gap-4">
                    <MapPin size={24} className="text-emerald-400 shrink-0" />
                    <div className="flex-1">
                      <div className="text-xs text-slate-400 mb-1">Selected Geological Area</div>
                      <div className="font-bold text-lg text-emerald-400">{GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.name}</div>
                      <div className="text-xs text-slate-400">{GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.description}</div>
                    </div>
                    <div className="text-right text-xs space-y-1">
                      <div><span className="text-slate-400">Success Rate: </span><span className="text-emerald-400 font-semibold">{(GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.probability * 100).toFixed(0)}%</span></div>
                      <div><span className="text-slate-400">Reserves: </span><span className="text-blue-400 font-semibold">{(GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.reserveRangeMin/1e6).toFixed(0)}-{(GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.reserveRangeMax/1e6).toFixed(0)}M bbl</span></div>
                      <div><span className="text-slate-400">Well Cost: </span><span className="text-orange-400 font-semibold">${(15 * GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]?.explorationWellMultiplier).toFixed(0)}M</span></div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Requirements */}
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <CheckCircle size={20} className="text-emerald-400" />
                      Requirements
                    </h3>
                    <div className="space-y-2">
                      {currentGate.requirements.map((req, idx) => {
                        let met = false;
                        if (req.key === 'budgetCheck') met = budget >= req.amount;
                        else if (req.key === 'probabilityCalculated') met = projectData.probabilityOfSuccess > 0;
                        else if (req.key === 'reservesEstimated') met = projectData.reserveEstimate > 0;
                        else if (req.key === 'preliminaryNPV') met = calculateNPV(projectData.reserveEstimate || 0, 5, 10000) > 0;
                        else if (req.key === 'npvApproved') met = projectData.developmentPlan?.npv > (req.threshold || 0);
                        else met = projectData[req.key];
                        
                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {met ? 
                              <CheckCircle size={16} className="text-emerald-400" /> :
                              <XCircle size={16} className="text-red-400" />
                            }
                            <span className={met ? 'text-slate-300' : 'text-red-400'}>{req.item}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Risks */}
                  <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <AlertTriangle size={20} className="text-orange-400" />
                      Key Risks
                    </h3>
                    <div className="space-y-2">
                      {currentGate.risks.map((risk, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              risk.level === 'high' ? 'bg-red-500/20 text-red-300' :
                              risk.level === 'medium' ? 'bg-orange-500/20 text-orange-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>{risk.level.toUpperCase()}</span>
                            <span className="font-semibold">{risk.name}</span>
                          </div>
                          <div className="text-slate-400 ml-2 mt-1">{risk.impact}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Key Questions */}
                <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4 mb-6">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <FileText size={20} className="text-blue-400" />
                    Key Questions for Decision
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {currentGate.keyQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span className="text-slate-300">{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Decision Justification */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Decision Justification (Required)</label>
                  <textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Explain your decision rationale, risk assessment, and expected outcomes..."
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-sm h-24 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Decision Status */}
                {!gateEvaluation.canProceed && (
                  <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="text-red-400" />
                      <span className="font-bold">Cannot Proceed - Missing Requirements:</span>
                    </div>
                    <ul className="text-sm space-y-1 ml-6">
                      {gateEvaluation.missing.map((m, idx) => (
                        <li key={idx} className="text-red-300">• {m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Role Requirements & Approvals */}
                {(() => {
                  const roleReqs = checkGateRoleRequirements();
                  const approvalCount = getRoleApprovalCount();
                  const currentGateId = currentQuarter?.gate;
                  
                  return (
                    <div className="bg-purple-900/20 border border-purple-600 rounded-lg p-4 mb-4">
                      <h3 className="font-bold mb-3 flex items-center gap-2">
                        <Users size={20} className="text-purple-400" />
                        Team Approvals {approvalCount > 0 && `(${approvalCount}/${roleReqs.requiresSignatures} required)`}
                      </h3>
                      
                      {/* Missing required roles warning */}
                      {!roleReqs.met && (
                        <div className="bg-red-900/30 border border-red-500 rounded p-3 mb-3">
                          <div className="font-semibold text-red-300 mb-1">⚠️ Missing Required Roles:</div>
                          <div className="text-sm text-red-200">
                            {roleReqs.missing.map(roleId => ROLES.find(r => r.id === roleId)?.name).join(', ')}
                          </div>
                          <div className="text-xs text-red-300 mt-1">
                            Add these roles to your team or proceed with higher risk
                          </div>
                        </div>
                      )}
                      
                      {/* Role approvals for team members */}
                      <div className="space-y-2">
                        {teamComposition.map(roleId => {
                          const role = ROLES.find(r => r.id === roleId);
                          const isApproved = roleApprovals[currentGateId]?.[roleId] || false;
                          const isRequired = roleReqs.missing.length === 0 || !roleReqs.missing.includes(roleId);
                          const insight = getRoleInsight(roleId, currentQuarter.id) || getRoleInsight(roleId, currentGateId);
                          
                          return (
                            <div key={roleId} className="bg-slate-900/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{role.icon}</span>
                                  <div>
                                    <div className="font-semibold" style={{ color: role.color }}>
                                      {role.name}
                                      {roleReqs.required && roleReqs.required.includes(roleId) && (
                                        <span className="ml-2 text-xs px-2 py-1 bg-orange-500/20 text-orange-300 rounded">REQUIRED</span>
                                      )}
                                    </div>
                                    {insight && (
                                      <div className="text-xs text-slate-400 mt-1">{insight}</div>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => toggleRoleApproval(roleId)}
                                  className={`px-4 py-2 rounded font-semibold transition-all ${
                                    isApproved
                                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                                  }`}
                                >
                                  {isApproved ? '✓ Approved' : 'Click to Approve'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Approval count status */}
                      <div className="mt-3 text-sm">
                        {approvalCount >= roleReqs.requiresSignatures ? (
                          <div className="text-emerald-400 flex items-center gap-2">
                            <CheckCircle size={16} />
                            Minimum signatures met ({approvalCount}/{roleReqs.requiresSignatures})
                          </div>
                        ) : (
                          <div className="text-orange-400 flex items-center gap-2">
                            <AlertTriangle size={16} />
                            Need {roleReqs.requiresSignatures - approvalCount} more approval(s)
                          </div>
                        )}
                      </div>
                      
                      {/* Recommended roles */}
                      {roleReqs.recommended && roleReqs.recommended.length > 0 && (
                        <div className="mt-3 text-xs text-slate-400">
                          💡 Recommended: {roleReqs.recommended.map(rid => ROLES.find(r => r.id === rid)?.name).join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Investment Summary */}
                {currentGate.cost > 0 && (
                  <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Investment Required:</span>
                      <span className="text-2xl font-bold text-orange-400">${(currentGate.cost/1e6).toFixed(1)}M</span>
                    </div>
                  </div>
                )}

                {/* Seismic Package & Contractor Selection for GATE_1 */}
                {currentQuarter.gate === "GATE_1" && (
                  <div className="space-y-4 mb-4">
                    {/* Seismic Package Selection */}
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600">
                      <h4 className="font-bold text-blue-400 mb-1">1. Select Seismic Survey Package</h4>
                      <p className="text-xs text-slate-400 mb-3">Better data quality increases the chance of finding oil, but costs more.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(SEISMIC_PACKAGES).map(([pkgId, pkg]) => {
                          const totalCost = applyGeoCost(pkg.cost + pkg.processingCost, "seismic");
                          const isSelected = selectedSeismicPkg === pkgId;
                          return (
                            <button key={pkgId} onClick={() => setSelectedSeismicPkg(pkgId)}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? "border-emerald-400 bg-emerald-900/30" : "border-slate-600 bg-slate-700/50 hover:border-blue-500"}`}>
                              <div className="flex justify-between items-start">
                                <div className="font-bold text-sm">{pkg.name}</div>
                                <div className={`text-sm font-bold ${totalCost > 10e6 ? "text-red-400" : totalCost > 6e6 ? "text-orange-400" : "text-emerald-400"}`}>
                                  ${(totalCost/1e6).toFixed(1)}M</div>
                              </div>
                              <div className="text-xs text-slate-400 mt-1">{pkg.description}</div>
                              <div className="flex gap-2 mt-2">
                                <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">Quality: {Math.round(pkg.qualityScore*100)}%</span>
                                <span className="text-xs bg-slate-600 px-2 py-0.5 rounded">{pkg.quality}</span>
                              </div>
                              {isSelected && <div className="text-xs text-emerald-400 mt-1 font-bold">Selected</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Contractor Selection */}
                    <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-600">
                      <h4 className="font-bold text-blue-400 mb-1">2. Select Seismic Contractor</h4>
                      <p className="text-xs text-slate-400 mb-3">Contractor quality affects data reliability and project timeline.</p>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(SEISMIC_CONTRACTORS).map(([cId, ctr]) => {
                          const isSelected = selectedContractor === cId;
                          const totalCtrCost = ctr.mobilization + ctr.dailyRate * 35;
                          return (
                            <button key={cId} onClick={() => setSelectedContractor(cId)}
                              className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? "border-emerald-400 bg-emerald-900/30" : "border-slate-600 bg-slate-700/50 hover:border-blue-500"}`}>
                              <div className="flex justify-between items-start mb-1">
                                <div className="font-bold text-sm">{ctr.name}</div>
                                <span className={`text-xs px-2 py-0.5 rounded ${ctr.badgeColor}`}>{ctr.badge}</span>
                              </div>
                              <div className="text-xs text-slate-400 mb-2">{ctr.description}</div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between"><span className="text-slate-500">Daily rate:</span><span>${(ctr.dailyRate/1000).toFixed(0)}K/day</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Mobilization:</span><span>${(ctr.mobilization/1e6).toFixed(1)}M</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Est. total:</span><span className="font-bold">${(totalCtrCost/1e6).toFixed(1)}M</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Schedule:</span><span>{ctr.schedule}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Experience:</span><span>{ctr.experience}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Quality mod:</span><span className={`${ctr.qualityMod > 0 ? "text-emerald-400" : ctr.qualityMod < 0 ? "text-red-400" : "text-slate-300"}`}>{ctr.qualityMod > 0 ? "+" : ""}{(ctr.qualityMod*100).toFixed(0)}%</span></div>
                              </div>
                              <div className="text-xs text-orange-400/80 mt-2">Risk: {ctr.risk}</div>
                              {isSelected && <div className="text-xs text-emerald-400 mt-1 font-bold">Selected</div>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Budget Impact Analysis */}
                    {selectedSeismicPkg && selectedContractor && (
                      <div className="bg-slate-800/80 rounded-xl p-4 border border-amber-600/50">
                        <h4 className="font-bold text-amber-400 mb-2">3. Budget Impact Analysis</h4>
                        {(() => {
                          const pkg = SEISMIC_PACKAGES[selectedSeismicPkg];
                          const ctr = SEISMIC_CONTRACTORS[selectedContractor];
                          const seismicCost = applyGeoCost(pkg.cost + pkg.processingCost, "seismic");
                          const contractorCost = ctr.mobilization + ctr.dailyRate * 35;
                          const totalGateCost = seismicCost + contractorCost;
                          const drillCost = applyGeoCost(15000000, "explorationWell");
                          const remaining = budget - totalGateCost;
                          const canAffordDrill = remaining >= drillCost;
                          return (
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span className="text-slate-400">Current budget:</span><span className="font-bold">${(budget/1e6).toFixed(1)}M</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">Seismic ({pkg.name}):</span><span className="text-red-400">-${(seismicCost/1e6).toFixed(1)}M</span></div>
                              <div className="flex justify-between"><span className="text-slate-400">Contractor ({ctr.name}):</span><span className="text-red-400">-${(contractorCost/1e6).toFixed(1)}M</span></div>
                              <div className="border-t border-slate-600 my-1"></div>
                              <div className="flex justify-between font-bold"><span>After FID 1:</span><span className={`${remaining > 0 ? "text-emerald-400" : "text-red-400"}`}>${(remaining/1e6).toFixed(1)}M</span></div>
                              <div className="flex justify-between text-xs"><span className="text-slate-500">Est. drilling cost (next):</span><span className="text-slate-400">~${(drillCost/1e6).toFixed(1)}M</span></div>
                              {!canAffordDrill && (
                                <div className="bg-red-900/30 border border-red-600 rounded p-2 text-xs text-red-300 mt-1">
                                  Warning: Remaining budget may be insufficient for exploration drilling.
                                </div>
                              )}
                              {canAffordDrill && (
                                <div className="bg-emerald-900/30 border border-emerald-600 rounded p-2 text-xs text-emerald-300 mt-1">
                                  Budget sufficient to proceed to exploration drilling.
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Drill Site Selection for GATE_2 */}
                {currentQuarter.gate === 'GATE_2' && (
                  <DrillSiteMap geoType={projectData.geologicalType} selected={selectedDrillSite} onSelect={setSelectedDrillSite} />
                )}

                {/* Decision Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => makeGateDecision(false)}
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={20} />
                    REJECT - Terminate Project
                  </button>
                  <button
                    onClick={() => makeGateDecision(true)}
                    disabled={!gateEvaluation.canProceed || !justification.trim()}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    APPROVE - Proceed
                  </button>
                </div>
              </div>
            )}

            {/* Quarter Activities */}
            {!showDecisionGate && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Q1 Activities */}
                  {currentQuarter.id === 'Q1_Y1' && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">Q1 Activities: Lease & Planning</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
                          <p className="text-sm text-slate-300 mb-2"><span className="font-bold text-blue-400">Your first strategic decision.</span> Each geological area has a unique risk/reward profile. High probability areas have smaller reserves, while risky areas can yield massive discoveries.</p>
                          <div className="flex items-center gap-2 text-xs mt-2">
                            <span className="bg-emerald-600/30 text-emerald-400 px-2 py-1 rounded">Low Risk</span>
                            <span className="text-slate-500">Proven Basin</span>
                            <span className="text-slate-600 mx-1">&rarr;</span>
                            <span className="text-slate-500">Frontier</span>
                            <span className="text-slate-600 mx-1">&rarr;</span>
                            <span className="text-slate-500">Deepwater</span>
                            <span className="text-slate-600 mx-1">&rarr;</span>
                            <span className="text-slate-500">Unconventional</span>
                            <span className="bg-red-600/30 text-red-400 px-2 py-1 rounded">High Risk</span>
                          </div>
                          <p className="text-xs text-emerald-400 mt-2">Recommendation: Start with <span className="font-bold">Proven Basin</span> — highest success rate (40%).</p>
                        </div>

                        <label className="block text-sm font-semibold mb-2">1. Select Geological Area</label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(PROBABILITIES.geological).map(type => {
                              const geo = GEOLOGICAL_CHARACTERISTICS[type];
                              return (
                                <button
                                  key={type}
                                  onClick={() => selectGeological(type)}
                                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                                    projectData.geologicalType === type
                                      ? 'border-emerald-400 bg-emerald-900/30'
                                      : 'border-slate-600 bg-slate-700 hover:border-slate-500'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1"><div className="font-bold text-lg">{geo.name}</div><span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${geo.probability >= 0.30 ? 'bg-emerald-600/30 text-emerald-400' : geo.probability >= 0.15 ? 'bg-yellow-600/30 text-yellow-400' : geo.probability >= 0.12 ? 'bg-orange-600/30 text-orange-400' : 'bg-red-600/30 text-red-400'}`}>{geo.probability >= 0.30 ? 'Beginner' : geo.probability >= 0.15 ? 'Moderate' : geo.probability >= 0.12 ? 'Advanced' : 'Expert'}</span></div>
                                  <div className="text-xs text-slate-400 mb-3">{geo.description}</div>
                                  
                                  <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Success Probability <span className="text-slate-500">(chance of finding oil)</span>:</span>
                                      <span className={`font-semibold ${
                                        geo.probability >= 0.30 ? 'text-emerald-400' :
                                        geo.probability >= 0.15 ? 'text-yellow-400' :
                                        'text-orange-400'
                                      }`}>{(geo.probability * 100).toFixed(0)}%</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Reserve Size <span className="text-slate-500">(potential volume)</span>:</span>
                                      <span className="font-semibold text-blue-400">
                                        {(geo.reserveRangeMin/1e6).toFixed(0)}-{(geo.reserveRangeMax/1e6).toFixed(0)}M bbl
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Exploration Well:</span>
                                      <span className={`font-semibold ${
                                        geo.explorationWellMultiplier > 2 ? 'text-red-400' :
                                        geo.explorationWellMultiplier > 1 ? 'text-orange-400' :
                                        'text-emerald-400'
                                      }`}>
                                        ${(COSTS.explorationWell * geo.explorationWellMultiplier / 1e6).toFixed(0)}M
                                        {geo.explorationWellMultiplier !== 1.0 && ` (${geo.explorationWellMultiplier}x)`}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Typical Oil Quality:</span>
                                      <span className="font-semibold text-purple-400">
                                        {geo.oilQualityWeights.light > 0.5 ? 'Light' :
                                         geo.oilQualityWeights.heavy > 0.4 ? 'Heavy' : 'Mixed'}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Time to First Oil:</span>
                                      <span className="font-semibold text-slate-300">
                                        {Math.floor(geo.timeToFirstOil / 12)}y {geo.timeToFirstOil % 12}m
                                      </span>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          {projectData.geologicalType && (
                        <GeologicalMap geoType={projectData.geologicalType} />
                      )}

                        <label className="block text-sm font-semibold mb-2">
                            2. Secure Lease & Permits <span className="text-slate-400 font-normal text-xs">(right to explore and produce in the selected area)</span>
                            {projectData.geologicalType && (
                              <span className="ml-2 text-slate-400">
                                (Est. ${(applyGeoCost(COSTS.lease + COSTS.environmental + COSTS.permits, 'lease')/1e6).toFixed(1)}M)
                              </span>
                            )}
                          </label>
                          <button
                            onClick={secureLease}
                            disabled={!projectData.geologicalType || projectData.leaseSecured}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
                          >
                            {projectData.leaseSecured ? '✓ Lease Secured' : 'Secure Lease & Environmental Permits'}
                          </button>
                          {projectData.leaseSecured && (
                            <button
                              onClick={revokeLease}
                              className="w-full mt-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm py-2 rounded-lg transition-all border border-slate-600"
                            >
                              Cancel Lease & Change Area
                            </button>
                          )}
                        </div>

                        <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-orange-400" />
                            <span className="font-bold">Decision Gate 1 Ahead</span>
                          </div>
                          <p className="text-sm text-slate-300">
                            After completing Q1 activities, you'll face your first major decision: 
                            whether to invest $6.5M in seismic surveys.
                          </p>
                        </div>

                        <button
                          onClick={() => setShowDecisionGate(true)}
                          disabled={!projectData.leaseSecured || !projectData.geologicalType}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                          <Target size={20} />
                          Proceed to Decision Gate 1
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Q2 Activities */}
                  {currentQuarter.id === 'Q2_Y1' && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">Q2 Activities: Seismic Acquisition & Processing</h3>
                      
                      {selectedSeismicPkg && !projectData.seismicComplete && (
                        <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4 mb-4">
                          <p className="text-sm text-emerald-300 mb-2">Seismic package <strong>{SEISMIC_PACKAGES[selectedSeismicPkg]?.name}</strong> was selected at FID 1. Contractor: <strong>{selectedContractor ? SEISMIC_CONTRACTORS[selectedContractor]?.name : 'N/A'}</strong></p>
                          <button onClick={() => conductSeismic(selectedSeismicPkg)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-sm">
                            Execute Seismic Survey
                          </button>
                        </div>
                      )}

                      {!selectedSeismicPkg && (
                      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2">
                          <FileText className="text-blue-400" />
                          <span className="font-bold">Investment Decision: Seismic Package Selection</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-1">
                          Better seismic data costs more but provides higher confidence in drilling decisions.
                          This data will be presented to your team for analysis before drilling.
                        </p>
                      </div>
                      )}
                      
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold mb-2">
                          Select Seismic Package (Higher cost = Better data quality)
                        </label>
                        
                        {Object.entries(SEISMIC_PACKAGES).map(([packageId, pkg]) => {
                          const geo = getGeoCharacteristics();
                          const totalCost = applyGeoCost(pkg.cost + pkg.processingCost, 'seismic');
                          
                          return (
                            <button
                              key={packageId}
                              onClick={() => conductSeismic(packageId)}
                              disabled={projectData.seismicComplete}
                              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                                projectData.seismicPackage === packageId
                                  ? 'border-emerald-400 bg-emerald-900/30'
                                  : 'border-slate-600 bg-slate-700 hover:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-bold text-lg">{pkg.name}</div>
                                  <div className="text-xs text-slate-400">{pkg.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className={`text-xl font-bold ${
                                    totalCost > 10000000 ? 'text-red-400' :
                                    totalCost > 6000000 ? 'text-orange-400' :
                                    'text-emerald-400'
                                  }`}>
                                    ${(totalCost/1e6).toFixed(1)}M
                                  </div>
                                  <div className="text-xs text-slate-400">Total cost</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Structural Clarity:</span>
                                  <span className="font-semibold text-blue-300">
                                    {(pkg.interpretation.structuralClarity * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Amplitude Confidence:</span>
                                  <span className="font-semibold text-purple-300">
                                    {(pkg.interpretation.amplitudeConfidence * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Fault Resolution:</span>
                                  <span className="font-semibold text-emerald-300">
                                    {(pkg.interpretation.faultResolution * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Depth Accuracy:</span>
                                  <span className="font-semibold text-orange-300">
                                    {(pkg.interpretation.depthAccuracy * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                              
                              <div className="text-xs text-slate-400 mt-2">
                                <span className="font-semibold">Deliverables:</span> {pkg.dataProducts.slice(0, 3).join(', ')}
                                {pkg.dataProducts.length > 3 && ` +${pkg.dataProducts.length - 3} more`}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={advanceWithoutGate}
                        disabled={!projectData.seismicComplete}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all mt-4"
                      >
                        Complete Q2 → Advance to Q3 (Data Interpretation)
                      </button>
                    </div>
                  )}

                  {/* Q3 Activities */}
                  {currentQuarter.id === 'Q3_Y1' && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">Q3 Activities: Seismic Interpretation & Analysis</h3>
                      
                      <div className="space-y-4">
                        {projectData.seismicComplete && projectData.seismicInterpretation && (
                          <>
                            <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                              <h4 className="font-bold mb-3 flex items-center gap-2">
                                <FileText className="text-blue-400" />
                                Seismic Interpretation Report
                              </h4>
                              
                              {/* Summary */}
                              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                                <div>
                                  <div className="text-slate-400">Package Selected:</div>
                                  <div className="font-bold">{SEISMIC_PACKAGES[projectData.seismicPackage]?.name}</div>
                                </div>
                                <div>
                                  <div className="text-slate-400">Combined Probability:</div>
                                  <div className="font-bold text-emerald-400 text-xl">
                                    {(projectData.probabilityOfSuccess * 100).toFixed(1)}%
                                  </div>
                                </div>
                              </div>
                              
                              {/* Structural Analysis */}
                              <div className="bg-slate-900/50 rounded p-3 mb-3">
                                <div className="font-semibold text-purple-400 mb-2">📐 Structural Analysis</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Closure Identified:</span>
                                    <span className={projectData.seismicInterpretation.closureIdentified ? 'text-emerald-400' : 'text-red-400'}>
                                      {projectData.seismicInterpretation.closureIdentified ? '✓ Yes' : '✗ No'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Closure Area:</span>
                                    <span className="text-blue-300">
                                      {projectData.seismicInterpretation.closureArea} acres
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Trap Type:</span>
                                    <span className="text-emerald-300 capitalize">
                                      {projectData.seismicInterpretation.structuralType}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">4-Way Closure:</span>
                                    <span className={projectData.seismicInterpretation.fourWayDipClosure ? 'text-emerald-400' : 'text-yellow-400'}>
                                      {projectData.seismicInterpretation.fourWayDipClosure ? '✓ Confirmed' : '~ Partial'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Hydrocarbon Indicators */}
                              <div className="bg-slate-900/50 rounded p-3 mb-3">
                                <div className="font-semibold text-orange-400 mb-2">🔍 Hydrocarbon Indicators (DHI)</div>
                                {projectData.seismicInterpretation.dhiPresent ? (
                                  <div>
                                    <div className="text-emerald-400 text-sm mb-2 font-semibold">
                                      ✓ Direct Hydrocarbon Indicators Detected
                                    </div>
                                    <div className="space-y-1 text-xs">
                                      {projectData.seismicInterpretation.dhiTypes.map((dhi, idx) => (
                                        <div key={idx} className="text-slate-300">• {dhi}</div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-yellow-400 text-sm">
                                    No direct hydrocarbon indicators observed
                                  </div>
                                )}
                                
                                <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Amplitude Anomaly:</span>
                                    <span className={projectData.seismicInterpretation.amplitudeAnomaly ? 'text-emerald-400' : 'text-slate-500'}>
                                      {projectData.seismicInterpretation.amplitudeAnomaly ? 
                                        `${projectData.seismicInterpretation.amplitudeStrength}` : 'None'}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Flat Spot:</span>
                                    <span className={projectData.seismicInterpretation.flatSpot ? 'text-emerald-400' : 'text-slate-500'}>
                                      {projectData.seismicInterpretation.flatSpot ? '✓ Detected' : 'Not seen'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Reservoir Parameters */}
                              <div className="bg-slate-900/50 rounded p-3 mb-3">
                                <div className="font-semibold text-blue-400 mb-2">📏 Reservoir Parameters</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Depth (TVDSS):</span>
                                    <span className="text-blue-300">
                                      {projectData.seismicInterpretation.reservoirDepth}m ± {projectData.seismicInterpretation.depthUncertainty}m
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Thickness:</span>
                                    <span className="text-emerald-300">
                                      {projectData.seismicInterpretation.reservoirThickness}m (gross)
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Fault Count:</span>
                                    <span className="text-purple-300">
                                      {projectData.seismicInterpretation.faultsIdentified} identified
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-400">Fault Sealing:</span>
                                    <span className={
                                      projectData.seismicInterpretation.faultSealing === 'likely' ? 'text-emerald-400' : 'text-yellow-400'
                                    }>
                                      {projectData.seismicInterpretation.faultSealing}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Confidence Levels */}
                              <div className="bg-slate-900/50 rounded p-3 mb-3">
                                <div className="font-semibold text-emerald-400 mb-2">📊 Confidence Assessment</div>
                                <div className="space-y-2">
                                  {[
                                    { label: 'Structural', value: projectData.seismicInterpretation.structuralConfidence },
                                    { label: 'Volumetric', value: projectData.seismicInterpretation.volumetricConfidence },
                                    { label: 'Fluid', value: projectData.seismicInterpretation.fluidConfidence }
                                  ].map((conf, idx) => (
                                    <div key={idx}>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-slate-400">{conf.label}:</span>
                                        <span className="font-semibold">{(conf.value * 100).toFixed(0)}%</span>
                                      </div>
                                      <div className="w-full bg-slate-700 rounded-full h-2">
                                        <div 
                                          className={`h-2 rounded-full ${
                                            conf.value > 0.7 ? 'bg-emerald-500' :
                                            conf.value > 0.4 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                          }`}
                                          style={{ width: `${conf.value * 100}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Risk Factors */}
                              {projectData.seismicInterpretation.risks.length > 0 && (
                                <div className="bg-red-900/20 border border-red-600 rounded p-3">
                                  <div className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                                    <AlertTriangle size={16} />
                                    Risk Factors ({projectData.seismicInterpretation.risks.length})
                                  </div>
                                  <ul className="space-y-1 text-xs">
                                    {projectData.seismicInterpretation.risks.map((risk, idx) => (
                                      <li key={idx} className="text-red-300">• {risk}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </>
                        )}

                        {/* Participant Decisions */}
                        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                          <h4 className="font-bold text-sm mb-3 text-purple-400">Your Analysis & Decisions</h4>

                          {/* Risk Assessment */}
                          <div className="mb-4">
                            <div className="text-xs text-slate-400 mb-2">1. Based on the seismic report above, what is your risk assessment?</div>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'favorable', label: 'Favorable', desc: 'Data supports drilling', color: 'emerald' },
                                { id: 'marginal', label: 'Marginal', desc: 'Mixed signals, proceed with caution', color: 'yellow' },
                                { id: 'unfavorable', label: 'Unfavorable', desc: 'High risk, reconsider', color: 'red' },
                              ].map(opt => (
                                <button
                                  key={opt.id}
                                  onClick={() => setRiskAssessment(opt.id)}
                                  className={'p-3 rounded-lg border text-xs text-left transition-all ' + (riskAssessment === opt.id ? 'border-' + opt.color + '-400 bg-' + opt.color + '-900/30' : 'border-slate-600 hover:border-slate-500')}
                                >
                                  <div className={'font-bold text-' + opt.color + '-400'}>{opt.label}</div>
                                  <div className="text-slate-400 mt-1">{opt.desc}</div>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Additional Study Option */}
                          <div className="mb-4">
                            <div className="text-xs text-slate-400 mb-2">2. Request additional seismic reprocessing? ($2M — improves confidence levels)</div>
                            <button
                              onClick={runAdditionalStudy}
                              disabled={additionalStudy}
                              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg transition-all"
                            >
                              {additionalStudy ? '✓ Additional Study Complete — Confidence Improved' : 'Run Additional Seismic Reprocessing ($2M)'}
                            </button>
                          </div>

                          {/* Geologist recommendation if on team */}
                          {hasRole('geologist') && riskAssessment && (
                            <div className="bg-emerald-900/20 border border-emerald-600/50 rounded-lg p-3 mb-4">
                              <div className="text-xs font-bold text-emerald-400 mb-1">Geologist Recommendation:</div>
                              <div className="text-xs text-slate-300">
                                {projectData.probabilityOfSuccess > 0.25
                                  ? 'The structural closure and reservoir indicators are promising. I recommend proceeding to drill.'
                                  : projectData.probabilityOfSuccess > 0.15
                                  ? 'Data is marginal. Consider additional studies or accept higher risk. The trap geometry needs further evaluation.'
                                  : 'Significant uncertainties remain. The probability of success is low. Consider whether the potential upside justifies the drilling cost.'}
                              </div>
                            </div>
                          )}

                          <div className="text-xs text-slate-500 text-center">Complete your assessment, then apply for the drilling permit below.</div>
                        </div>

                        <button
                          onClick={obtainDrillingPermit}
                          disabled={projectData.drillingPermit || !riskAssessment}
                          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
                        >
                          {projectData.drillingPermit ? '✓ Drilling Permit Approved' : 'Apply for Drilling Permit'}
                        </button>

                        <button
                          onClick={advanceWithoutGate}
                          disabled={!projectData.drillingPermit}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
                        >
                          Complete Q3 → Advance to Q4
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Q4 Activities */}
                  {currentQuarter.id === 'Q4_Y1' && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">Q4 Activities: Ready to Drill</h3>
                      
                      <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="text-orange-400" />
                          <span className="font-bold">Approaching Decision Gate 2</span>
                        </div>
                        <p className="text-sm text-slate-300">
                          Complete all preparations before proceeding to the drilling decision.
                          The next gate will determine if you drill the exploration well.
                        </p>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded">
                          <span>Exploration well cost:</span>
                          <span className="font-bold text-orange-400">${(COSTS.explorationWell/1e6).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded">
                          <span>Success probability:</span>
                          <span className="font-bold text-emerald-400">{(projectData.probabilityOfSuccess * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded">
                          <span>Expected value:</span>
                          <span className="font-bold text-blue-400">
                            ${((projectData.probabilityOfSuccess * 200 - COSTS.explorationWell) / 1e6).toFixed(1)}M
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowDecisionGate(true)}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Target size={20} />
                        Proceed to Decision Gate 2
                      </button>
                    </div>
                  )}

                  {/* H1 Y2 - Appraisal */}
                  {currentQuarter.id === 'H1_Y2' && projectData.oilDiscovered && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">H1 Year 2: Appraisal Program</h3>
                      
                      <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4 mb-4">
                        <h4 className="font-bold mb-2">Discovery Summary</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-400">Reserve Estimate:</span>
                            <div className="font-bold text-lg">{(projectData.reserveEstimate/1e6).toFixed(1)}M bbl</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Oil Quality:</span>
                            <div className="font-bold text-lg capitalize">{projectData.oilQuality}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">
                          Drill Appraisal Wells to Refine Estimate (${(COSTS.appraisalWell/1e6).toFixed(1)}M each)
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {[1, 2, 3].map(count => (
                            <button
                              key={count}
                              onClick={() => drillAppraisalWells(count)}
                              disabled={projectData.appraisalComplete}
                              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded-lg font-bold transition-all"
                            >
                              {count} {count === 1 ? 'Well' : 'Wells'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {projectData.appraisalComplete && (
                        <button
                          onClick={() => setShowDecisionGate(true)}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all mt-4"
                        >
                          Proceed to Decision Gate 3
                        </button>
                      )}
                    </div>
                  )}

                  {/* H2 Y2 - Development Planning */}
                  {currentQuarter.id === 'H2_Y2' && projectData.appraisalComplete && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">H2 Year 2: Development Planning</h3>
                      
                      <div>
                        <label className="block text-sm font-semibold mb-2">Select Development Scenario</label>
                        <div className="space-y-3">
                          {[
                            { wells: 4, name: 'Conservative', desc: 'Lower risk, lower return' },
                            { wells: 8, name: 'Base Case', desc: 'Balanced approach' },
                            { wells: 12, name: 'Aggressive', desc: 'Maximum production' }
                          ].map(scenario => {
                            const npv = calculateNPV(projectData.reserveEstimate, scenario.wells, scenario.wells * 2000);
                            const cost = scenario.wells * COSTS.developmentWell + COSTS.facility;
                            return (
                              <button
                                key={scenario.wells}
                                onClick={() => approveDevelopmentPlan(scenario.wells)}
                                disabled={projectData.developmentPlan !== null}
                                className="w-full p-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 rounded-lg transition-all text-left"
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-bold">{scenario.name} - {scenario.wells} Wells</div>
                                    <div className="text-sm text-slate-400">{scenario.desc}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      Production: ~{(scenario.wells * 2000).toLocaleString()} bpd
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-slate-400">CAPEX</div>
                                    <div className="font-bold text-orange-400">${(cost/1e6).toFixed(1)}M</div>
                                    <div className="text-sm text-slate-400 mt-1">NPV</div>
                                    <div className={`font-bold ${npv > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      ${(npv/1e6).toFixed(1)}M
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {projectData.developmentPlan && (
                        <button
                          onClick={() => setShowDecisionGate(true)}
                          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all mt-4"
                        >
                          Proceed to Decision Gate 4 - Final Investment Decision
                        </button>
                      )}
                    </div>
                  )}

                  {/* H1 Y3 - Construction */}
                  {currentQuarter.id === 'H1_Y3' && projectData.developmentPlan && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">H1 Year 3: Field Construction</h3>
                      
                      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
                        <h4 className="font-bold mb-2">Development Plan Sanctioned</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-slate-400">Production Wells:</span>
                            <div className="font-bold">{projectData.developmentPlan.wellCount}</div>
                          </div>
                          <div>
                            <span className="text-slate-400">Target Production:</span>
                            <div className="font-bold">{projectData.developmentPlan.estimatedProduction.toLocaleString()} bpd</div>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={executeDevelopment}
                        disabled={projectData.facilitiesComplete}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-bold py-4 rounded-lg transition-all"
                      >
                        {projectData.facilitiesComplete ? '✓ Construction Complete' : 
                         `Execute Development ($${(projectData.developmentPlan.estimatedCost/1e6).toFixed(1)}M)`}
                      </button>


                      {!projectData.facilitiesComplete && budget < projectData.developmentPlan.estimatedCost && (
                        <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-orange-400" size={20} />
                            <span className="font-bold text-orange-400">Insufficient Budget</span>
                          </div>
                          <p className="text-sm text-slate-300 mb-3">
                            Development costs exceed your remaining budget. In real projects, companies secure project finance (bank loans backed by future oil revenue).
                          </p>
                          <div className="text-xs text-slate-400 mb-3 space-y-1">
                            <div className="flex justify-between">
                              <span>Development cost:</span>
                              <span className="text-red-400 font-semibold">${(projectData.developmentPlan.estimatedCost/1e6).toFixed(1)}M</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Current budget:</span>
                              <span className="text-emerald-400 font-semibold">${(budget/1e6).toFixed(1)}M</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shortfall:</span>
                              <span className="text-orange-400 font-semibold">${((projectData.developmentPlan.estimatedCost - budget)/1e6).toFixed(1)}M</span>
                            </div>
                          </div>
                          <button
                            onClick={secureLoan}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                          >
                            <DollarSign size={18} />
                            Secure Project Finance Loan
                          </button>
                        </div>
                      )}
                      {projectData.facilitiesComplete && (
                        <button
                          onClick={advanceWithoutGate}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all mt-3"
                        >
                          Advance to H2 Year 3
                        </button>
                      )}
                    </div>
                  )}

                  {/* H2 Y3 - Startup */}
                  {currentQuarter.id === 'H2_Y3' && projectData.facilitiesComplete && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">H2 Year 3: Production Startup</h3>
                      
                      <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4 mb-4">
                        <h4 className="font-bold mb-2">Pre-Startup Checklist Complete ✓</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-400" />
                            <span>All wells drilled and completed</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-400" />
                            <span>Production facilities commissioned</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-400" />
                            <span>Safety systems certified</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="text-emerald-400" />
                            <span>Operating procedures approved</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setShowDecisionGate(true)}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all"
                      >
                        Proceed to Decision Gate 5 - Start Production
                      </button>
                    </div>
                  )}

                  {/* Production Phase */}
                  {currentQuarter.id === 'PROD' && production.daily > 0 && (
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                      <h3 className="text-xl font-bold mb-4">🎉 Full Production Operations</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4">
                          <div className="text-sm text-emerald-200">Daily Production</div>
                          <div className="text-3xl font-bold">{production.daily.toLocaleString()} bpd</div>
                        </div>
                        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4">
                          <div className="text-sm text-blue-200">Cumulative Production</div>
                          <div className="text-3xl font-bold">{(production.cumulative/1e6).toFixed(2)}M bbl</div>
                        </div>
                        <div className="bg-purple-900/30 border border-purple-600 rounded-lg p-4">
                          <div className="text-sm text-purple-200">Production Days</div>
                          <div className="text-3xl font-bold">{production.days}</div>
                        </div>
                        <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4">
                          <div className="text-sm text-orange-200">Project NPV</div>
                          <div className={`text-3xl font-bold ${
                            calculateNPV(projectData.reserveEstimate, wells.production, production.daily) > 0 
                              ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            ${(calculateNPV(projectData.reserveEstimate, wells.production, production.daily)/1e6).toFixed(1)}M
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-4 rounded-lg">
                        <h4 className="font-bold mb-2">Project Summary</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>Total Investment: ${(totalSpent/1e6).toFixed(1)}M</div>
                          <div>Total Revenue: ${(revenue/1e6).toFixed(1)}M</div>
                          <div>Net Position: ${((budget - 100000000)/1e6).toFixed(1)}M</div>
                          <div>ROI: {(((revenue - totalSpent) / totalSpent) * 100).toFixed(1)}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right sidebar */}
                <div className="space-y-4">
                  {/* Team */}
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <Users size={18} /> Team
                    </h3>
                    <div className="space-y-2">
                      {teamComposition.map(roleId => {
                        const role = ROLES.find(r => r.id === roleId);
                        return (
                          <div key={roleId} className="text-sm flex items-center gap-2">
                            <span>{role.icon}</span>
                            <span style={{ color: role.color }}>{role.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Notifications */}
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="font-bold mb-3 flex items-center gap-2">
                      <AlertTriangle size={18} /> Activity Log
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {notifications.slice(0, 10).map(notif => (
                        <div
                          key={notif.id}
                          className={`p-2 rounded text-xs border ${
                            notif.type === 'success' ? 'bg-emerald-900/20 border-emerald-600/50' :
                            notif.type === 'error' ? 'bg-red-900/20 border-red-600/50' :
                            'bg-blue-900/20 border-blue-600/50'
                          }`}
                        >
                          <div className="font-semibold">{notif.quarter}</div>
                          <div className="text-slate-300">{notif.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Well Summary */}
                  <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                    <h3 className="font-bold mb-3">Wells Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Exploration:</span>
                        <span className="font-bold">{wells.exploration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Appraisal:</span>
                        <span className="font-bold">{wells.appraisal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Production:</span>
                        <span className="font-bold">{wells.production}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-700 pt-2">
                        <span className="text-emerald-400">Successful:</span>
                        <span className="font-bold text-emerald-400">{wells.successful}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-400">Dry:</span>
                        <span className="font-bold text-red-400">{wells.dry}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Game Ended */}

        {/* Dry Hole - Recovery Options */}
        {gameState === 'dry_hole' && (
          <div className="bg-slate-800 rounded-xl p-8 border-4 border-orange-500">
            <div className="text-center mb-8">
              <AlertTriangle size={64} className="text-orange-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-2">Dry Hole - Well Unsuccessful</h2>
              <p className="text-slate-300 mb-4">
                Exploration well was dry. No commercial hydrocarbons at this location.
                But the project doesn't have to end here — in real exploration, companies have options.
              </p>

              <div className="bg-slate-900/50 rounded-lg p-4 mb-6 inline-block">
                <div className="grid grid-cols-3 gap-6 text-sm">
                  <div>
                    <div className="text-slate-400">Budget Remaining</div>
                    <div className="text-2xl font-bold text-emerald-400">${(budget/1e6).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Total Spent</div>
                    <div className="text-2xl font-bold text-red-400">${(totalSpent/1e6).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Wells Drilled</div>
                    <div className="text-2xl font-bold">{wells.exploration} ({wells.dry} dry)</div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold mb-4 text-center">Choose Your Strategy</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Option 1: Drill another well */}
              <div className="bg-slate-700/50 rounded-lg p-6 border-2 border-slate-600 hover:border-blue-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="text-blue-400" size={28} />
                  <h4 className="text-lg font-bold text-blue-400">Drill Another Well</h4>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Try a different location on the same lease. Seismic data suggests other potential targets.
                </p>
                <div className="text-xs text-slate-400 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Cost:</span>
                    <span className="text-orange-400 font-semibold">
                      ~${(applyGeoCost(COSTS.explorationWell, 'explorationWell')/1e6).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Success probability:</span>
                    <span className="text-yellow-400 font-semibold">Reduced (prior miss)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk:</span>
                    <span className="text-red-400">High — same geological area</span>
                  </div>
                </div>
                <button
                  onClick={drillAnotherWell}
                  disabled={budget < applyGeoCost(COSTS.explorationWell, 'explorationWell')}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
                >
                  Drill New Target
                </button>
              </div>

              {/* Option 2: Farm-out */}
              <div className="bg-slate-700/50 rounded-lg p-6 border-2 border-slate-600 hover:border-purple-500 transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="text-purple-400" size={28} />
                  <h4 className="text-lg font-bold text-purple-400">Farm-Out (Joint Venture)</h4>
                </div>
                <p className="text-sm text-slate-300 mb-3">
                  Bring in a partner to share risk and costs. They pay 50% of drilling but take 40% of any discovery.
                </p>
                <div className="text-xs text-slate-400 space-y-1 mb-4">
                  <div className="flex justify-between">
                    <span>Your cost:</span>
                    <span className="text-emerald-400 font-semibold">
                      ~${(applyGeoCost(COSTS.explorationWell, 'explorationWell') * 0.5 /1e6).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Partner brings:</span>
                    <span className="text-emerald-400 font-semibold">+${(budget * 0.5/1e6).toFixed(1)}M budget</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trade-off:</span>
                    <span className="text-yellow-400">Only 60% of reserves if found</span>
                  </div>
                </div>
                <button
                  onClick={farmOut}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all"
                >
                  Find a Partner
                </button>
              </div>

              {/* Option 3: Relocate */}
              <div className="bg-slate-700/50 rounded-lg p-6 border-2 border-slate-600 hover:border-emerald-500 transition-all md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <MapPin className="text-emerald-400" size={28} />
                  <h4 className="text-lg font-bold text-emerald-400">Relocate to New Area</h4>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Abandon current lease and move to a different geological area. Requires new lease and fast-track seismic.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(GEOLOGICAL_CHARACTERISTICS)
                    .filter(([key]) => key !== projectData.geologicalType)
                    .map(([key, geo]) => {
                      const cost = (applyGeoCost(COSTS.lease + COSTS.environmental + COSTS.permits, 'lease') * 0.7 +
                                   applyGeoCost(COSTS.seismic + COSTS.dataProcessing, 'seismic') * 0.5);
                      return (
                        <button
                          key={key}
                          onClick={() => relocateExploration(key)}
                          disabled={budget < cost}
                          className="p-3 rounded-lg border border-slate-500 hover:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left bg-slate-800"
                        >
                          <div className="font-bold text-sm mb-1">{geo.name}</div>
                          <div className="text-xs text-slate-400 mb-2">
                            P(success): {(geo.probability * 100).toFixed(0)}%
                          </div>
                          <div className="text-xs text-orange-400">
                            ~${(cost/1e6).toFixed(1)}M
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Abandon option */}
            <div className="text-center pt-4 border-t border-slate-700">
              <button
                onClick={abandonProject}
                className="text-slate-400 hover:text-red-400 text-sm underline transition-all"
              >
                Abandon Project Entirely (cut losses)
              </button>
            </div>
          </div>
        )}
        {gameState === 'ended' && (
          <div className="bg-slate-800 rounded-xl p-8 border-4 border-red-500">
            <div className="text-center">
              <XCircle size={64} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Project Terminated</h2>
              <p className="text-slate-300 mb-6">
                {projectData.oilDiscovered === false 
                  ? 'Exploration well was dry. No commercial hydrocarbons discovered.'
                  : 'Project terminated at decision gate.'}
              </p>
              
              <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
                <h3 className="font-bold mb-3">Project Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-slate-400">Total Spent</div>
                    <div className="text-2xl font-bold text-red-400">${(totalSpent/1e6).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Wells Drilled</div>
                    <div className="text-2xl font-bold">{wells.exploration + wells.appraisal}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Quarters Elapsed</div>
                    <div className="text-2xl font-bold">{currentQuarterIndex + 1}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Final Decision</div>
                    <div className="text-lg font-bold">{decisions[0]?.outcome || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
              >
                Start New Project
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OilExplorationSimulation;