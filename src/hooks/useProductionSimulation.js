import { useEffect } from 'react';
import { QUARTERS } from '../constants/timeline';
import { COSTS, LEASE_OPTIONS, calculateRoyaltyRate } from '../constants/economics';
import { GEOLOGICAL_CHARACTERISTICS } from '../constants/geology';
import { useGame } from '../context/GameContext';
import { useRoleHelpers } from './useRoleHelpers';

const PRODUCTION_LIMIT_DAYS = 3650;

export const useProductionSimulation = () => {
  const {
    gameState,
    currentQuarterIndex,
    production, setProduction,
    setRevenue,
    setBudget,
    projectData,
    leaseTerms,
  } = useGame();

  const { hasRole, getRoleBonus } = useRoleHelpers();

  const currentQuarter = QUARTERS[currentQuarterIndex];

  useEffect(() => {
    if (gameState === 'playing' && currentQuarter.phase === 'production' && production.daily > 0 && production.days < PRODUCTION_LIMIT_DAYS) {
      const interval = setInterval(() => {
        setProduction(prev => {
          if (prev.days >= PRODUCTION_LIMIT_DAYS) return prev;
          const newDay = prev.days + 1;

          // Decline: prev.daily is peak rate, apply exponential decline based on elapsed days
          const geo = projectData.geologicalType
            ? GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]
            : null;
          const baseDeclineRate = geo ? geo.declineRateAnnual : 0.05;
          const declineRate = baseDeclineRate + (projectData.riskDeclineBonus || 0);
          const yearFraction = prev.days / 365;
          const declinedDaily = Math.floor(prev.daily * Math.pow(1 - declineRate, yearFraction));

          // Revenue from declined production
          const grossDailyRev = declinedDaily * COSTS.oilPrice;
          const royaltyOption = leaseTerms?.royaltyTerms
            ? LEASE_OPTIONS.royaltyTerms.options[leaseTerms.royaltyTerms]
            : null;
          const royaltyRate = calculateRoyaltyRate(royaltyOption, COSTS.oilPrice);
          const royaltyCost = grossDailyRev * royaltyRate;
          const dailyRev = grossDailyRev - royaltyCost;

          // OPEX: fixed component (with geo multiplier) + variable per-barrel
          let fixedOPEX = COSTS.dailyOPEX * (geo ? geo.dailyOPEXMultiplier : 1);
          let variableOPEX = declinedDaily * COSTS.opexPerBarrel;
          let dailyCost = fixedOPEX + variableOPEX;

          // Apply facility OPEX modifier from infrastructure selections
          if (projectData.facilityOpexModifier) {
            dailyCost *= (1 + projectData.facilityOpexModifier);
          }

          // Apply risk-based OPEX modifier (e.g., compartmentalization)
          if (projectData.riskOpexModifier) {
            dailyCost *= (1 + projectData.riskOpexModifier);
          }

          if (hasRole('operations')) {
            const reduction = getRoleBonus('operatingCostReduction');
            dailyCost *= (1 - reduction);
          }

          if (hasRole('finance')) {
            const reduction = getRoleBonus('budgetEfficiency');
            dailyCost *= (1 - reduction);
          }

          // Tax on operating profit
          const operatingProfit = dailyRev - dailyCost;
          const tax = operatingProfit > 0 ? operatingProfit * COSTS.taxRate : 0;

          const net = dailyRev - dailyCost - tax;

          setRevenue(r => r + dailyRev);
          setBudget(b => b + net);

          return {
            ...prev,
            days: newDay,
            currentDaily: declinedDaily,
            cumulative: prev.cumulative + declinedDaily,
            totalOPEX: (prev.totalOPEX || 0) + dailyCost,
            totalRoyalties: (prev.totalRoyalties || 0) + royaltyCost,
            totalTax: (prev.totalTax || 0) + tax,
          };
        });
      }, 50);

      return () => clearInterval(interval);
    }
  }, [gameState, currentQuarter.phase, production.daily, production.days]);
};

export { PRODUCTION_LIMIT_DAYS };
