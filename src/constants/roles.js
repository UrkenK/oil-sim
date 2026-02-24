export const ROLES = [
  {
    id: 'geologist',
    name: 'Geologist',
    color: '#10b981',
    icon: '🔬',
    description: 'Analyzes geological data and recommends drilling locations',
    authorityAreas: ['geological_selection', 'seismic_interpretation', 'reserve_estimation'],
    skillBonuses: {
      probabilityBoost: 0.05,
      seismicQualityBoost: 0.10,
      reserveAccuracy: 0.15
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
      drillingCostReduction: 0.10,
      technicalRiskReduction: 0.15,
      wellPerformanceBoost: 0.12
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
      costOverrunProtection: 0.20,
      betterFinancing: 0.05,
      budgetEfficiency: 0.08
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
      productionOptimization: 0.15,
      operatingCostReduction: 0.12,
      uptimeImprovement: 0.10
    },
    insights: {
      H2_Y2: 'Optimizes field development plan for maximum NPV',
      H1_Y3: 'Ensures facilities are designed for operational efficiency',
      H2_Y3: 'Production startup and ramp-up planning',
      PROD: 'Continuous production optimization and cost management'
    }
  }
];
