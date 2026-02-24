export const OIL_PRICE_CONFIG = {
  initialPrice: 75,
  floor: 30,
  ceiling: 130,
  dailyDriftMax: 0.50,
  quarterLengthDays: 90,
};

export const MARKET_EVENTS = [
  {
    id: 'opec_cut',
    name: 'OPEC+ Production Cut',
    description: 'OPEC+ announces coordinated production cuts to support prices.',
    impactMin: 8,
    impactMax: 15,
    probability: 0.12,
    icon: '🛢️',
    color: 'text-emerald-400',
  },
  {
    id: 'geopolitical_crisis',
    name: 'Geopolitical Crisis',
    description: 'Conflict in a major oil-producing region disrupts supply.',
    impactMin: 10,
    impactMax: 25,
    probability: 0.08,
    icon: '⚠️',
    color: 'text-red-400',
  },
  {
    id: 'hurricane_disruption',
    name: 'Hurricane Season Disruption',
    description: 'Gulf hurricanes shut down offshore platforms and refineries.',
    impactMin: 3,
    impactMax: 8,
    probability: 0.10,
    icon: '🌀',
    color: 'text-yellow-400',
  },
  {
    id: 'global_recession',
    name: 'Global Recession',
    description: 'Economic slowdown reduces global oil demand significantly.',
    impactMin: -20,
    impactMax: -10,
    probability: 0.10,
    icon: '📉',
    color: 'text-red-400',
  },
  {
    id: 'opec_increase',
    name: 'OPEC+ Production Increase',
    description: 'OPEC+ increases output quotas to capture market share.',
    impactMin: -12,
    impactMax: -5,
    probability: 0.10,
    icon: '📊',
    color: 'text-orange-400',
  },
  {
    id: 'shale_surge',
    name: 'US Shale Production Surge',
    description: 'Rapid shale drilling growth floods the market with light crude.',
    impactMin: -8,
    impactMax: -3,
    probability: 0.12,
    icon: '🏗️',
    color: 'text-orange-400',
  },
  {
    id: 'seasonal_demand',
    name: 'Seasonal Demand Increase',
    description: 'Summer driving season and winter heating boost consumption.',
    impactMin: 2,
    impactMax: 5,
    probability: 0.15,
    icon: '📈',
    color: 'text-blue-400',
  },
  {
    id: 'stable_market',
    name: 'Stable Market',
    description: 'No major disruptions. Market conditions remain broadly unchanged.',
    impactMin: -2,
    impactMax: 2,
    probability: 0, // fallback — remainder after all other probabilities
    icon: '➖',
    color: 'text-slate-400',
  },
];

const clampPrice = (price) =>
  Math.max(OIL_PRICE_CONFIG.floor, Math.min(OIL_PRICE_CONFIG.ceiling, price));

export const selectMarketEvent = () => {
  const roll = Math.random();
  let cumulative = 0;
  for (const event of MARKET_EVENTS) {
    if (event.id === 'stable_market') continue;
    cumulative += event.probability;
    if (roll < cumulative) return event;
  }
  return MARKET_EVENTS.find(e => e.id === 'stable_market');
};

export const applyEventImpact = (currentPrice, event) => {
  const { impactMin, impactMax } = event;
  const impact = impactMin + Math.random() * (impactMax - impactMin);
  return Math.round(clampPrice(currentPrice + impact) * 100) / 100;
};

export const applyDailyDrift = (currentPrice) => {
  const drift = (Math.random() - 0.5) * 2 * OIL_PRICE_CONFIG.dailyDriftMax;
  return Math.round(clampPrice(currentPrice + drift) * 100) / 100;
};
