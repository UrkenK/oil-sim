import { useEffect, useRef } from 'react';
import { QUARTERS } from '../constants/timeline';
import { COSTS, LEASE_OPTIONS, calculateRoyaltyRate } from '../constants/economics';
import { GEOLOGICAL_CHARACTERISTICS } from '../constants/geology';
import { WELL_CONFIG, WELL_EVENTS, EVENT_CHECK_INTERVAL_DAYS } from '../constants/wellConfig';
import { OIL_PRICE_CONFIG, selectMarketEvent, applyEventImpact, applyDailyDrift } from '../constants/oilMarket';
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
    individualWells, setIndividualWells,
    setPendingWellEvents,
    notifications, setNotifications,
    oilPrice, setOilPrice,
    setOilPriceHistory, setCurrentMarketEvent,
    setFinancialHistory,
  } = useGame();

  const { hasRole, getRoleBonus } = useRoleHelpers();

  const currentQuarter = QUARTERS[currentQuarterIndex];

  // Ref to pass aggregate daily total from well update to production update
  const detailedDailyTotalRef = useRef(0);

  // Helper: add notification without causing re-render dependency
  const addNotificationRef = useRef((msg, type) => {
    setNotifications(prev => [...prev, { id: Date.now() + Math.random(), message: msg, type }]);
  });

  // Oil price ref — read inside interval without adding to deps
  const oilPriceRef = useRef(oilPrice);
  useEffect(() => { oilPriceRef.current = oilPrice; }, [oilPrice]);


  useEffect(() => {
    if (gameState !== 'playing' || currentQuarter.phase !== 'production' ||
        production.daily <= 0 || production.days >= PRODUCTION_LIMIT_DAYS) {
      return;
    }

    const isDetailedMode = projectData.detailedWellMode && individualWells.length > 0;

    const interval = setInterval(() => {
      const geo = projectData.geologicalType
        ? GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]
        : null;

      const royaltyOption = leaseTerms?.royaltyTerms
        ? LEASE_OPTIONS.royaltyTerms.options[leaseTerms.royaltyTerms]
        : null;

      // --- Oil price update (every tick = 1 day) ---
      const currentDay = production.days + 1;
      let tickPrice = oilPriceRef.current;

      if (currentDay > 0 && currentDay % OIL_PRICE_CONFIG.quarterLengthDays === 0) {
        // Quarterly market event
        const event = selectMarketEvent();
        tickPrice = applyEventImpact(tickPrice, event);
        setCurrentMarketEvent({
          ...event,
          day: currentDay,
          priceAfter: tickPrice,
        });
        setOilPriceHistory(prev => [...prev, {
          day: currentDay,
          price: tickPrice,
          event: event.name,
          eventId: event.id,
        }]);
        addNotificationRef.current(`Market: ${event.name} — oil now $${tickPrice.toFixed(2)}/bbl`, 'info');
      } else {
        // Daily random walk drift
        tickPrice = applyDailyDrift(tickPrice);
        // Sample every 7 days for history chart
        if (currentDay > 0 && currentDay % 7 === 0) {
          setOilPriceHistory(prev => [...prev, {
            day: currentDay,
            price: tickPrice,
          }]);
        }
      }

      oilPriceRef.current = tickPrice;
      setOilPrice(tickPrice);

      const royaltyRate = calculateRoyaltyRate(royaltyOption, tickPrice);

      if (isDetailedMode) {
        // ====== DETAILED MODE: Per-well simulation ======

        // 1. Update individual wells
        setIndividualWells(prevWells => {
          let dailyTotal = 0;

          const updated = prevWells.map(well => {
            if (well.status === 'abandoned' || well.status === 'failed') return well;

            let w = { ...well };

            // Handle downtime countdown (workover/repair/stimulation)
            if (w.actionDowntimeRemaining > 0) {
              w.actionDowntimeRemaining -= 1;
              if (w.actionDowntimeRemaining <= 0) {
                w.status = WELL_CONFIG.STATUSES.PRODUCING;
              }
              w.dailyProduction = 0;
              return w;
            }

            // Health degradation
            const degradeRate = w.status === 'shut_in'
              ? WELL_CONFIG.health.dailyDegradationBase * WELL_CONFIG.health.shutInDegradationMult
              : WELL_CONFIG.health.dailyDegradationBase;
            w.health = Math.max(0, w.health - degradeRate);

            // If health reaches 0, well fails
            if (w.health <= 0) {
              w.status = WELL_CONFIG.STATUSES.FAILED;
              w.dailyProduction = 0;
              return w;
            }

            // Only producing wells generate output
            if (w.status !== 'producing') {
              w.dailyProduction = 0;
              return w;
            }

            w.daysProducing += 1;

            // Decline: IP * (1 - declineRate)^(daysProducing/365)
            const yearFraction = w.daysProducing / 365;
            let output = w.ip * Math.pow(1 - w.declineRate, yearFraction);

            // Stimulation boost
            if (w.stimulationDaysRemaining > 0) {
              output *= (1 + w.stimulationBoost);
              w.stimulationDaysRemaining -= 1;
              if (w.stimulationDaysRemaining <= 0) {
                w.stimulationBoost = 0;
              }
            }

            // Production modifier (sand damage etc.)
            output *= w.productionModifier;

            // Water cut progression
            w.waterCut = Math.min(0.95, w.waterCut + w.waterCutGrowthRate);
            output *= (1 - w.waterCut);

            // Health factor
            output *= (w.health / 100);

            output = Math.max(0, Math.floor(output));

            w.dailyProduction = output;
            w.cumulativeProduction += output;
            dailyTotal += output;

            return w;
          });

          detailedDailyTotalRef.current = dailyTotal;
          return updated;
        });

        // 2. Update aggregate production state
        setProduction(prev => {
          if (prev.days >= PRODUCTION_LIMIT_DAYS) return prev;
          const newDay = prev.days + 1;

          const declinedDaily = detailedDailyTotalRef.current;

          // Revenue
          const grossDailyRev = declinedDaily * tickPrice;
          const royaltyCost = grossDailyRev * royaltyRate;
          const dailyRev = grossDailyRev - royaltyCost;

          // OPEX: base fixed + per-well cost + shut-in standby + variable per-barrel
          const activeWells = individualWells.filter(w =>
            w.status === 'producing' || w.status === 'shut_in'
          );
          const shutInCount = individualWells.filter(w => w.status === 'shut_in').length;

          let fixedOPEX = COSTS.dailyOPEX * (geo ? geo.dailyOPEXMultiplier : 1);
          let perWellOPEX = activeWells.length * WELL_CONFIG.perWellDailyOPEX;
          let shutInOPEX = shutInCount * WELL_CONFIG.actions.shutIn.dailyStandbyCost;
          let variableOPEX = declinedDaily * COSTS.opexPerBarrel;
          let dailyCost = fixedOPEX + perWellOPEX + shutInOPEX + variableOPEX;

          if (projectData.facilityOpexModifier) dailyCost *= (1 + projectData.facilityOpexModifier);
          if (projectData.riskOpexModifier) dailyCost *= (1 + projectData.riskOpexModifier);
          if (hasRole('operations')) dailyCost *= (1 - getRoleBonus('operatingCostReduction'));
          if (hasRole('finance')) dailyCost *= (1 - getRoleBonus('budgetEfficiency'));

          const operatingProfit = dailyRev - dailyCost;
          const tax = operatingProfit > 0 ? operatingProfit * COSTS.taxRate : 0;
          const net = dailyRev - dailyCost - tax;

          setRevenue(r => r + dailyRev);
          setBudget(b => b + net);

          // 3. Check for random events every N days
          if (newDay > 0 && newDay % EVENT_CHECK_INTERVAL_DAYS === 0) {
            const producingWells = individualWells.filter(w => w.status === 'producing');
            if (producingWells.length > 0) {
              Object.entries(WELL_EVENTS).forEach(([eventKey, eventDef]) => {
                producingWells.forEach(well => {
                  if (Math.random() < eventDef.probability) {
                    const eventInstance = {
                      id: `${eventKey}_${well.id}_${newDay}`,
                      eventKey,
                      wellId: well.id,
                      wellName: well.name,
                      day: newDay,
                      ...eventDef,
                    };

                    if (eventDef.effect === 'water_cut_jump') {
                      // Apply immediately
                      setIndividualWells(ws => ws.map(w =>
                        w.id === well.id
                          ? { ...w, waterCut: Math.min(0.95, w.waterCut + eventDef.waterCutIncrease) }
                          : w
                      ));
                      addNotificationRef.current(`${well.name}: Water breakthrough! (+${(eventDef.waterCutIncrease*100).toFixed(0)}% water cut)`, 'warning');
                    } else if (eventDef.effect === 'production_loss') {
                      // Apply sand damage modifier
                      setIndividualWells(ws => ws.map(w =>
                        w.id === well.id
                          ? { ...w, productionModifier: w.productionModifier * (1 + eventDef.productionImpact) }
                          : w
                      ));
                      setPendingWellEvents(pe => [...pe, eventInstance]);
                      addNotificationRef.current(`${well.name}: ${eventDef.name} — production reduced`, 'error');
                    } else {
                      // repair or choice — requires player action
                      setIndividualWells(ws => ws.map(w =>
                        w.id === well.id ? { ...w, status: 'failed', dailyProduction: 0 } : w
                      ));
                      setPendingWellEvents(pe => [...pe, eventInstance]);
                      addNotificationRef.current(`${well.name}: ${eventDef.name} — action required!`, 'error');
                    }
                  }
                });
              });
            }
          }

          // Monthly financial accumulation (pure functional via prev state)
          const newMonthRev = (prev._monthRev || 0) + grossDailyRev;
          const newMonthOpex = (prev._monthOpex || 0) + dailyCost;
          const newMonthRoyalties = (prev._monthRoyalties || 0) + royaltyCost;
          const newMonthTax = (prev._monthTax || 0) + tax;

          const isMonthEnd = newDay > 0 && newDay % 30 === 0;
          if (isMonthEnd) {
            setFinancialHistory(h => [...h, {
              day: newDay, month: newDay / 30,
              revenue: newMonthRev, opex: newMonthOpex,
              royalties: newMonthRoyalties, tax: newMonthTax,
            }]);
          }

          return {
            ...prev,
            days: newDay,
            currentDaily: declinedDaily,
            cumulative: prev.cumulative + declinedDaily,
            totalOPEX: (prev.totalOPEX || 0) + dailyCost,
            totalRoyalties: (prev.totalRoyalties || 0) + royaltyCost,
            totalTax: (prev.totalTax || 0) + tax,
            _monthRev: isMonthEnd ? 0 : newMonthRev,
            _monthOpex: isMonthEnd ? 0 : newMonthOpex,
            _monthRoyalties: isMonthEnd ? 0 : newMonthRoyalties,
            _monthTax: isMonthEnd ? 0 : newMonthTax,
          };
        });

      } else {
        // ====== AGGREGATE MODE: Original code (unchanged) ======
        setProduction(prev => {
          if (prev.days >= PRODUCTION_LIMIT_DAYS) return prev;
          const newDay = prev.days + 1;

          const baseDeclineRate = geo ? geo.declineRateAnnual : 0.05;
          const declineRate = baseDeclineRate + (projectData.riskDeclineBonus || 0);
          const yearFraction = prev.days / 365;
          const declinedDaily = Math.floor(prev.daily * Math.pow(1 - declineRate, yearFraction));

          const grossDailyRev = declinedDaily * tickPrice;
          const royaltyCost = grossDailyRev * royaltyRate;
          const dailyRev = grossDailyRev - royaltyCost;

          let fixedOPEX = COSTS.dailyOPEX * (geo ? geo.dailyOPEXMultiplier : 1);
          let variableOPEX = declinedDaily * COSTS.opexPerBarrel;
          let dailyCost = fixedOPEX + variableOPEX;

          if (projectData.facilityOpexModifier) dailyCost *= (1 + projectData.facilityOpexModifier);
          if (projectData.riskOpexModifier) dailyCost *= (1 + projectData.riskOpexModifier);
          if (hasRole('operations')) dailyCost *= (1 - getRoleBonus('operatingCostReduction'));
          if (hasRole('finance')) dailyCost *= (1 - getRoleBonus('budgetEfficiency'));

          const operatingProfit = dailyRev - dailyCost;
          const tax = operatingProfit > 0 ? operatingProfit * COSTS.taxRate : 0;
          const net = dailyRev - dailyCost - tax;

          setRevenue(r => r + dailyRev);
          setBudget(b => b + net);

          // Monthly financial accumulation (pure functional via prev state)
          const newMonthRev = (prev._monthRev || 0) + grossDailyRev;
          const newMonthOpex = (prev._monthOpex || 0) + dailyCost;
          const newMonthRoyalties = (prev._monthRoyalties || 0) + royaltyCost;
          const newMonthTax = (prev._monthTax || 0) + tax;

          const isMonthEnd = newDay > 0 && newDay % 30 === 0;
          if (isMonthEnd) {
            setFinancialHistory(h => [...h, {
              day: newDay, month: newDay / 30,
              revenue: newMonthRev, opex: newMonthOpex,
              royalties: newMonthRoyalties, tax: newMonthTax,
            }]);
          }

          return {
            ...prev,
            days: newDay,
            currentDaily: declinedDaily,
            cumulative: prev.cumulative + declinedDaily,
            totalOPEX: (prev.totalOPEX || 0) + dailyCost,
            totalRoyalties: (prev.totalRoyalties || 0) + royaltyCost,
            totalTax: (prev.totalTax || 0) + tax,
            _monthRev: isMonthEnd ? 0 : newMonthRev,
            _monthOpex: isMonthEnd ? 0 : newMonthOpex,
            _monthRoyalties: isMonthEnd ? 0 : newMonthRoyalties,
            _monthTax: isMonthEnd ? 0 : newMonthTax,
          };
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameState, currentQuarter.phase, production.daily, production.days]);
};

export { PRODUCTION_LIMIT_DAYS };
