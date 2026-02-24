// Individual well management constants

export const WELL_CONFIG = {
  // IP (Initial Productivity) generation
  ip: {
    baseMin: 1200,     // bpd minimum before geo multiplier
    baseMax: 3500,     // bpd maximum before geo multiplier
  },

  // Decline rate variance per well
  decline: {
    varianceFraction: 0.20, // each well's decline = geo base ± 20%
  },

  // Water cut progression
  waterCut: {
    initialMin: 0.00,
    initialMax: 0.05,
    dailyGrowthBase: 0.00008,   // ~3% per year base
    dailyGrowthVariance: 0.30,  // ± 30%
  },

  // Health degradation
  health: {
    initial: 100,
    dailyDegradationBase: 0.008,    // ~3% per year when producing
    shutInDegradationMult: 0.2,     // 80% slower when shut-in
  },

  // Per-well fixed OPEX
  perWellDailyOPEX: 2000, // $2K/day per active well

  // Well statuses
  STATUSES: {
    PRODUCING: 'producing',
    SHUT_IN: 'shut_in',
    WORKOVER: 'workover',
    STIMULATION: 'stimulation',
    REPAIR: 'repair',
    FAILED: 'failed',
    ABANDONED: 'abandoned',
  },

  // Action costs and parameters
  actions: {
    shutIn: {
      dailyStandbyCost: 5000, // $5K/day standby
    },
    restart: {
      cost: 50000, // $50K one-time
    },
    workover: {
      costMin: 1_500_000,
      costMax: 3_000_000,
      downtimeMin: 15,
      downtimeMax: 30,
      ipRestorationMin: 0.60,   // restores IP to 60-80% of original
      ipRestorationMax: 0.80,
      waterCutReduction: 0.30,  // reduces water cut by 30% (relative)
      healthRestore: 20,        // +20 health points
    },
    stimulation: {
      costMin: 2_000_000,
      costMax: 5_000_000,
      downtime: 10,
      ipBoostMin: 0.20,          // +20-40% IP boost
      ipBoostMax: 0.40,
      boostDurationMin: 365,     // 1-2 years
      boostDurationMax: 730,
    },
    abandon: {
      costMin: 500_000,
      costMax: 2_000_000,
    },
  },
};

// Random well events
export const WELL_EVENTS = {
  esp_failure: {
    name: 'ESP Failure',
    description: 'Electric submersible pump failed. Well needs repair.',
    probability: 0.03,
    effect: 'repair',
    repairCost: 800_000,
    repairDays: 7,
  },
  sand_production: {
    name: 'Sand Production',
    description: 'Sand ingress reducing output. Needs workover.',
    probability: 0.025,
    effect: 'production_loss',
    productionImpact: -0.30,
    requiresWorkover: true,
  },
  casing_leak: {
    name: 'Casing Leak',
    description: 'Casing integrity compromised. Repair or abandon.',
    probability: 0.015,
    effect: 'choice',
    repairCost: 2_000_000,
    repairDays: 14,
  },
  water_breakthrough: {
    name: 'Water Breakthrough',
    description: 'Water cut jumped significantly.',
    probability: 0.035,
    effect: 'water_cut_jump',
    waterCutIncrease: 0.15,
  },
};

// How often to check for events (in simulated days)
export const EVENT_CHECK_INTERVAL_DAYS = 90;
