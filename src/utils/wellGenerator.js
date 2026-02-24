import { WELL_CONFIG } from '../constants/wellConfig';

/**
 * Generate array of individual well objects with randomized properties.
 * @param {number} wellCount - number of wells (4, 8, or 12)
 * @param {object} geo - GEOLOGICAL_CHARACTERISTICS entry (or null)
 * @returns {Array<object>} wells array
 */
export function generateIndividualWells(wellCount, geo) {
  const wells = [];
  const { ip, decline, waterCut, health } = WELL_CONFIG;

  for (let i = 0; i < wellCount; i++) {
    const id = `W-${i + 1}`;

    // IP: random within range, scaled by geo.wellProductivityMultiplier
    const baseIP = ip.baseMin + Math.random() * (ip.baseMax - ip.baseMin);
    const geoMultiplier = geo?.wellProductivityMultiplier || 1.0;
    const wellIP = Math.round(baseIP * geoMultiplier);

    // Decline rate: geo base ± variance
    const baseDecline = geo?.declineRateAnnual || 0.08;
    const varianceMult = 1 + (Math.random() * 2 - 1) * decline.varianceFraction;
    const wellDecline = Math.max(0.01, baseDecline * varianceMult);

    // Initial water cut
    const initialWC = waterCut.initialMin +
      Math.random() * (waterCut.initialMax - waterCut.initialMin);

    // Water cut daily growth rate (individual variance)
    const wcGrowthVariance = 1 + (Math.random() * 2 - 1) * waterCut.dailyGrowthVariance;
    const wcDailyGrowth = waterCut.dailyGrowthBase * wcGrowthVariance;

    wells.push({
      id,
      name: id,
      ip: wellIP,
      originalIP: wellIP,
      declineRate: wellDecline,
      waterCut: initialWC,
      waterCutGrowthRate: wcDailyGrowth,
      health: health.initial,
      status: WELL_CONFIG.STATUSES.PRODUCING,
      workoverCount: 0,
      daysProducing: 0,
      actionDowntimeRemaining: 0,
      stimulationBoost: 0,
      stimulationDaysRemaining: 0,
      productionModifier: 1.0,
      cumulativeProduction: 0,
      dailyProduction: 0,
    });
  }

  return wells;
}
