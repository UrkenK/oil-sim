export const PROBABILITIES = {
  seismic: { excellent: 0.35, good: 0.25, moderate: 0.15, poor: 0.08 },
  geological: {
    proven_basin: 0.40,
    frontier_basin: 0.15,
    deepwater: 0.20,
    unconventional: 0.10
  }
};

export const COSTS = {
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
  opexPerBarrel: 8,
  oilPrice: 75,
  taxRate: 0.30,
  discountRate: 0.10
};

export const FEED_STUDY_OPTIONS = {
  basic: {
    name: 'Desktop Study',
    cost: 1000000,
    description: 'Quick screening using existing data. Minimal engineering input — fast but leaves significant uncertainty for later phases.',
    badge: 'Fast Track',
    badgeColor: 'bg-yellow-700 text-yellow-200',
    uncertaintyReduction: 0,
    costOverrunRisk: 0.10,
    appraisalCostMod: 0,
    deliverables: ['Screening economics', 'Concept identification', 'Go/no-go recommendation'],
  },
  standard: {
    name: 'Standard FEED',
    cost: 3000000,
    description: 'Engineering study with vendor quotes and concept selection. Defines scope, estimates costs, and selects preferred development concept.',
    badge: 'Recommended',
    badgeColor: 'bg-blue-700 text-blue-200',
    uncertaintyReduction: 0.10,
    costOverrunRisk: 0,
    appraisalCostMod: -0.05,
    deliverables: ['Concept selection report', 'Cost estimate (±25%)', 'Vendor pre-qualification', 'Project schedule'],
  },
  comprehensive: {
    name: 'Full FEED + EPCI Strategy',
    cost: 5000000,
    description: 'Detailed engineering, procurement plans, and construction strategy. Maximises cost certainty and reduces risk of overruns during execution.',
    badge: 'Full Scope',
    badgeColor: 'bg-purple-700 text-purple-200',
    uncertaintyReduction: 0.20,
    costOverrunRisk: -0.15,
    appraisalCostMod: -0.10,
    deliverables: ['Detailed engineering package', 'Cost estimate (±10%)', 'EPCI tender documents', 'Risk register', 'Execution plan', 'Long-lead item orders'],
  },
};

export const APPRAISAL_STRATEGIES = {
  minimal: {
    name: 'Minimal Appraisal',
    wells: 1,
    baseCost: 10000000,
    includesWellTest: false,
    includesExtraSeismic: false,
    uncertaintyRange: 0.30,
    description: 'Single appraisal well with seismic reinterpretation. Fastest but highest remaining uncertainty.',
    badge: 'Fast Track',
    badgeColor: 'bg-yellow-700 text-yellow-200',
    riskReduction: 'Low',
    activities: ['1 appraisal well', 'Seismic reinterpretation', 'Core analysis'],
  },
  standard: {
    name: 'Standard Appraisal',
    wells: 2,
    baseCost: 25000000,
    includesWellTest: true,
    includesExtraSeismic: false,
    uncertaintyRange: 0.15,
    description: 'Two wells with well testing. Good balance of cost and data quality.',
    badge: 'Recommended',
    badgeColor: 'bg-blue-700 text-blue-200',
    riskReduction: 'Medium',
    activities: ['2 appraisal wells', 'Well test (DST/EWT)', 'Core & fluid analysis', 'Pressure data'],
  },
  comprehensive: {
    name: 'Comprehensive Appraisal',
    wells: 3,
    baseCost: 45000000,
    includesWellTest: true,
    includesExtraSeismic: true,
    uncertaintyRange: 0.08,
    description: 'Full appraisal: 3 wells, extended testing, additional seismic. Maximum data, minimum uncertainty.',
    badge: 'Full Scope',
    badgeColor: 'bg-purple-700 text-purple-200',
    riskReduction: 'High',
    activities: ['3 appraisal wells', 'Extended well test', 'Additional 3D seismic', 'Full core program', 'PVT analysis', 'Interference test'],
  },
};

export const WELL_TEST_TYPES = {
  dst: {
    name: 'Drill Stem Test (DST)',
    cost: 500000,
    duration: '2-3 days',
    accuracyBonus: 0.05,
    description: 'Standard flow test. Measures flow rate and initial pressure response. Quick but limited reservoir data.',
    dataProducts: ['Flow rate', 'Initial pressure', 'Fluid sample'],
  },
  extended: {
    name: 'Extended Well Test (EWT)',
    cost: 3000000,
    duration: '2-4 weeks',
    accuracyBonus: 0.12,
    description: 'Long-duration test with surface facilities. Provides reservoir behaviour, boundaries, and production forecast data.',
    dataProducts: ['Flow rate profile', 'Pressure transient analysis', 'Fluid PVT data', 'Reservoir boundaries', 'Skin factor', 'Production forecast'],
  },
};

export const LEASE_OPTIONS = {
  licenseType: {
    label: 'License Type',
    role: 'finance',
    options: {
      standard: { name: 'Standard License', cost: 2_000_000, desc: 'Standard terms, no renegotiation', renegotiable: false },
      premium: { name: 'Premium License', cost: 3_500_000, desc: 'Includes option to renegotiate at FID', renegotiable: true },
      farmIn: { name: 'Farm-In License', cost: 1_200_000, desc: 'Cheaper entry but partner takes 25% WI', renegotiable: false, partnerWI: 0.25 },
    }
  },
  environmentalScope: {
    label: 'Environmental Assessment',
    role: 'operations',
    options: {
      minimal: { name: 'Minimal EIA', cost: 300_000, desc: 'Basic compliance only', delayRisk: 0.35, delayDays: 30 },
      standard: { name: 'Standard EIA', cost: 500_000, desc: 'Industry standard assessment', delayRisk: 0.15, delayDays: 15 },
      comprehensive: { name: 'Comprehensive EIA', cost: 900_000, desc: 'Full environmental baseline + monitoring', delayRisk: 0.03, delayDays: 0 },
    }
  },
  blockSize: {
    label: 'Block Size',
    role: 'geologist',
    options: {
      small: { name: 'Small Block (50 km\u00B2)', cost: 800_000, desc: 'Focused area, lower cost', reserveMultiplier: 0.7, permitCost: 600_000 },
      medium: { name: 'Medium Block (150 km\u00B2)', cost: 1_500_000, desc: 'Standard exploration block', reserveMultiplier: 1.0, permitCost: 1_000_000 },
      large: { name: 'Large Block (400 km\u00B2)', cost: 2_800_000, desc: 'Maximum acreage, highest upside', reserveMultiplier: 1.4, permitCost: 1_500_000 },
    }
  },
  royaltyTerms: {
    label: 'Royalty Terms',
    role: 'finance',
    options: {
      fixed_low: { name: 'Fixed 10%', cost: 1_500_000, desc: 'Higher signing bonus, lower royalty', rate: 0.10, type: 'fixed' },
      fixed_high: { name: 'Fixed 18%', cost: 500_000, desc: 'Lower signing bonus, higher royalty', rate: 0.18, type: 'fixed' },
      sliding: { name: 'Sliding Scale 8-20%', cost: 800_000, desc: 'Royalty varies with oil price', type: 'sliding',
        getRate: (oilPrice) => Math.min(0.20, Math.max(0.08, 0.08 + (oilPrice - 50) * 0.002)) },
    }
  }
};

export const calculateRoyaltyRate = (royaltyOption, oilPrice = COSTS.oilPrice) => {
  if (!royaltyOption) return 0.12;
  if (royaltyOption.type === 'sliding') return royaltyOption.getRate(oilPrice);
  return royaltyOption.rate;
};

export const FID_OPTIONS = {
  developmentConcept: {
    label: 'Development Concept',
    role: 'engineer',
    options: {
      minimal_facilities: {
        name: 'Early Production Facility',
        cost: 25_000_000,
        desc: 'Modular/leased equipment, minimal permanent infrastructure. Fast to deploy but limited capacity and higher OPEX.',
        badge: 'Budget',
        badgeColor: 'bg-yellow-700 text-yellow-200',
        opexModifier: 0.08,
        productionModifier: -0.10,
      },
      standard_cpf: {
        name: 'Central Processing Facility',
        cost: 50_000_000,
        desc: 'Purpose-built processing plant with full separation, compression and export. Industry standard for most fields.',
        badge: 'Standard',
        badgeColor: 'bg-blue-700 text-blue-200',
        opexModifier: 0,
        productionModifier: 0,
      },
      integrated_complex: {
        name: 'Integrated Production Complex',
        cost: 85_000_000,
        desc: 'Full-scale complex with gas processing, water injection, power generation and digital monitoring. Maximum efficiency.',
        badge: 'Premium',
        badgeColor: 'bg-purple-700 text-purple-200',
        opexModifier: -0.08,
        productionModifier: 0.12,
      },
    }
  },
  executionStrategy: {
    label: 'Execution Strategy',
    role: 'operations',
    options: {
      phased: {
        name: 'Phased Development',
        desc: 'Build in 2 phases: first wells then remaining. Lower initial CAPEX, slower ramp-up.',
        badge: 'Low Risk',
        badgeColor: 'bg-emerald-700 text-emerald-200',
        capexModifier: -0.15,
        productionModifier: -0.10,
        riskModifier: -0.10,
      },
      standard: {
        name: 'Standard Execution',
        desc: 'Single-phase development with multi-contract strategy. Standard timeline and cost.',
        badge: 'Standard',
        badgeColor: 'bg-blue-700 text-blue-200',
        capexModifier: 0,
        productionModifier: 0,
        riskModifier: 0,
      },
      fast_track: {
        name: 'Fast Track (EPIC)',
        desc: 'Single EPIC contractor, parallel activities. Higher cost but faster first oil.',
        badge: 'Aggressive',
        badgeColor: 'bg-red-700 text-red-200',
        capexModifier: 0.20,
        productionModifier: 0.05,
        riskModifier: 0.15,
      },
    }
  },
  financingStructure: {
    label: 'Financing Structure',
    role: 'finance',
    options: {
      corporate: {
        name: 'Corporate Finance',
        desc: 'Fund from company balance sheet. No interest, but full risk exposure.',
        badge: 'Equity',
        badgeColor: 'bg-emerald-700 text-emerald-200',
        debtRatio: 0,
        interestRate: 0,
        loanMultiplier: 0,
      },
      balanced: {
        name: 'Project Finance (70/30)',
        desc: '70% debt, 30% equity. Industry standard. Bank covenants apply.',
        badge: 'Standard',
        badgeColor: 'bg-blue-700 text-blue-200',
        debtRatio: 0.70,
        interestRate: 0.08,
        loanMultiplier: 1.0,
      },
      reserve_based: {
        name: 'Reserve-Based Lending',
        desc: 'Loan secured against proven reserves. Higher interest but maximum leverage.',
        badge: 'High Leverage',
        badgeColor: 'bg-orange-700 text-orange-200',
        debtRatio: 0.85,
        interestRate: 0.12,
        loanMultiplier: 1.2,
      },
    }
  },
};

export const FACILITY_OPTIONS = {
  processing_plant: {
    id: 'processing_plant',
    name: 'Processing Plant',
    description: 'Separates oil, water, and gas. Core production facility.',
    required: true,
    category: 'core',
    icon: '🏭',
    tiers: {
      basic: {
        name: 'Basic Separator Train',
        cost: 12000000,
        opexModifier: 0,
        productionModifier: 0,
        description: 'Two-phase separation. Limited gas handling. Suitable for simple reservoirs.',
        badge: 'Budget',
        badgeColor: 'bg-yellow-700 text-yellow-200',
      },
      standard: {
        name: 'Standard 3-Phase Plant',
        cost: 20000000,
        opexModifier: -0.05,
        productionModifier: 0.05,
        description: 'Full three-phase separation with gas compression. Industry standard for most fields.',
        badge: 'Recommended',
        badgeColor: 'bg-blue-700 text-blue-200',
      },
      advanced: {
        name: 'Advanced Processing Complex',
        cost: 35000000,
        opexModifier: -0.10,
        productionModifier: 0.12,
        description: 'Multi-stage separation, gas treatment, NGL recovery. Maximum throughput and recovery.',
        badge: 'Premium',
        badgeColor: 'bg-purple-700 text-purple-200',
      },
    },
  },
  storage_export: {
    id: 'storage_export',
    name: 'Storage & Export',
    description: 'Tank farm and export infrastructure for transporting crude to market.',
    required: true,
    category: 'core',
    icon: '🛢️',
    tiers: {
      tanks_only: {
        name: 'Tank Farm Only',
        cost: 5000000,
        opexModifier: 0.02,
        productionModifier: -0.03,
        description: 'Storage tanks with truck loading. Low CAPEX but higher transport costs and revenue delays.',
        badge: 'Minimal',
        badgeColor: 'bg-yellow-700 text-yellow-200',
      },
      pipeline: {
        name: 'Pipeline Connection',
        cost: 15000000,
        opexModifier: -0.05,
        productionModifier: 0.03,
        description: 'Dedicated pipeline to export terminal. Reliable and low transport cost.',
        badge: 'Recommended',
        badgeColor: 'bg-blue-700 text-blue-200',
      },
    },
  },
  water_treatment: {
    id: 'water_treatment',
    name: 'Water Treatment',
    description: 'Handles produced water for disposal or re-injection into the reservoir.',
    required: false,
    category: 'support',
    icon: '💧',
    tiers: {
      none: {
        name: 'No Water Treatment',
        cost: 0,
        opexModifier: 0,
        productionModifier: 0,
        description: 'Produced water disposed offsite. Meets minimum requirements but no reservoir support.',
        badge: 'Skip',
        badgeColor: 'bg-slate-600 text-slate-300',
      },
      basic: {
        name: 'Basic Disposal',
        cost: 3000000,
        opexModifier: -0.02,
        productionModifier: 0,
        description: 'On-site water separation and disposal well. Reduces trucking costs.',
        badge: 'Minimum',
        badgeColor: 'bg-yellow-700 text-yellow-200',
      },
      reinjection: {
        name: 'Water Re-Injection System',
        cost: 10000000,
        opexModifier: -0.04,
        productionModifier: 0.08,
        description: 'Re-injects produced water to maintain reservoir pressure. Extends field life and improves recovery.',
        badge: 'Enhanced',
        badgeColor: 'bg-emerald-700 text-emerald-200',
      },
    },
  },
  power_generation: {
    id: 'power_generation',
    name: 'Power Generation',
    description: 'On-site power supply for all facilities and equipment.',
    required: true,
    category: 'utilities',
    icon: '⚡',
    tiers: {
      diesel: {
        name: 'Diesel Generators',
        cost: 3000000,
        opexModifier: 0.05,
        productionModifier: 0,
        description: 'Reliable but expensive fuel costs add significantly to daily OPEX.',
        badge: 'Basic',
        badgeColor: 'bg-yellow-700 text-yellow-200',
      },
      gas_turbine: {
        name: 'Gas Turbine (Field Gas)',
        cost: 12000000,
        opexModifier: -0.06,
        productionModifier: 0.02,
        description: 'Uses associated gas as fuel. Eliminates fuel cost and reduces flaring penalties.',
        badge: 'Efficient',
        badgeColor: 'bg-blue-700 text-blue-200',
      },
      solar_hybrid: {
        name: 'Solar-Gas Hybrid',
        cost: 18000000,
        opexModifier: -0.08,
        productionModifier: 0.02,
        description: 'Solar panels with gas backup. Lowest operating cost with ESG benefits.',
        badge: 'Green',
        badgeColor: 'bg-emerald-700 text-emerald-200',
      },
    },
  },
  safety_systems: {
    id: 'safety_systems',
    name: 'Safety & Emergency Systems',
    description: 'Fire detection, emergency shutdown, flare, and life safety systems.',
    required: true,
    category: 'safety',
    icon: '🛡️',
    tiers: {
      standard: {
        name: 'Standard Safety Package',
        cost: 5000000,
        opexModifier: 0,
        productionModifier: 0,
        certifiesSafety: true,
        description: 'ESD system, fire & gas detection, flare stack. Meets regulatory requirements.',
        badge: 'Required',
        badgeColor: 'bg-red-700 text-red-200',
      },
      enhanced: {
        name: 'Enhanced Safety & Integrity',
        cost: 10000000,
        opexModifier: -0.03,
        productionModifier: 0.03,
        certifiesSafety: true,
        description: 'Advanced monitoring, redundant barriers, integrity management. Reduces unplanned shutdowns.',
        badge: 'Premium',
        badgeColor: 'bg-purple-700 text-purple-200',
      },
    },
  },
  control_monitoring: {
    id: 'control_monitoring',
    name: 'Control & Monitoring',
    description: 'SCADA, instrumentation, and production optimization systems.',
    required: false,
    category: 'optimization',
    icon: '📡',
    tiers: {
      none: {
        name: 'No Monitoring System',
        cost: 0,
        opexModifier: 0,
        productionModifier: 0,
        description: 'Manual operations only. Higher labour costs and slower response to issues.',
        badge: 'Skip',
        badgeColor: 'bg-slate-600 text-slate-300',
      },
      basic: {
        name: 'Basic SCADA',
        cost: 2000000,
        opexModifier: -0.02,
        productionModifier: 0.01,
        description: 'Basic supervisory control. Manual intervention still required for most operations.',
        badge: 'Standard',
        badgeColor: 'bg-yellow-700 text-yellow-200',
      },
      advanced: {
        name: 'Digital Oilfield Package',
        cost: 8000000,
        opexModifier: -0.07,
        productionModifier: 0.05,
        description: 'Full digital twin, predictive analytics, automated optimization. Significant OPEX savings.',
        badge: 'Smart',
        badgeColor: 'bg-cyan-700 text-cyan-200',
      },
    },
  },
};
