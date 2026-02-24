import React from 'react';

import { useGame } from '../../context/GameContext';
import { useGameActions } from '../../hooks/useGameActions';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';
import { PRODUCTION_LIMIT_DAYS } from '../../hooks/useProductionSimulation';
import { COSTS, LEASE_OPTIONS, calculateRoyaltyRate, FID_OPTIONS } from '../../constants/economics';
import { GEOLOGICAL_CHARACTERISTICS } from '../../constants/geology';

const ProductionPhase = () => {
  const {
    production,
    totalSpent,
    revenue,
    budget,
    wells,
    projectData,
    leaseTerms,
    fidSelections,
    setShowReport,
  } = useGame();

  const { calculateNPV } = useGameActions();
  const { hasRole, getRoleBonus } = useRoleHelpers();

  // Current declined production
  const currentDaily = production.currentDaily || production.daily;
  const peakDaily = production.daily;

  // Decline info
  const geo = projectData.geologicalType
    ? GEOLOGICAL_CHARACTERISTICS[projectData.geologicalType]
    : null;
  const baseDeclineRate = geo ? geo.declineRateAnnual : 0.05;
  const declineRate = baseDeclineRate + (projectData.riskDeclineBonus || 0);

  // Calculate current daily economics based on declined production
  const grossDailyRev = currentDaily * COSTS.oilPrice;
  const royaltyOption = leaseTerms?.royaltyTerms
    ? LEASE_OPTIONS.royaltyTerms.options[leaseTerms.royaltyTerms]
    : null;
  const royaltyRate = calculateRoyaltyRate(royaltyOption, COSTS.oilPrice);
  const dailyRoyalty = grossDailyRev * royaltyRate;
  const netDailyRev = grossDailyRev - dailyRoyalty;

  // OPEX: fixed + variable per-barrel
  let fixedOPEX = COSTS.dailyOPEX * (geo ? geo.dailyOPEXMultiplier : 1);
  let variableOPEX = currentDaily * COSTS.opexPerBarrel;
  let dailyOPEX = fixedOPEX + variableOPEX;
  if (projectData.facilityOpexModifier) {
    dailyOPEX *= (1 + projectData.facilityOpexModifier);
  }
  if (projectData.riskOpexModifier) {
    dailyOPEX *= (1 + projectData.riskOpexModifier);
  }
  if (hasRole('operations')) {
    dailyOPEX *= (1 - getRoleBonus('operatingCostReduction'));
  }
  if (hasRole('finance')) {
    dailyOPEX *= (1 - getRoleBonus('budgetEfficiency'));
  }

  // Tax on operating profit
  const dailyOperatingProfit = netDailyRev - dailyOPEX;
  const dailyTax = dailyOperatingProfit > 0 ? dailyOperatingProfit * COSTS.taxRate : 0;
  const dailyNet = netDailyRev - dailyOPEX - dailyTax;

  // Cumulative values
  const cumulativeOPEX = production.totalOPEX || 0;
  const cumulativeRoyalties = production.totalRoyalties || 0;
  const cumulativeTax = production.totalTax || 0;
  const grossRevenue = revenue + cumulativeRoyalties; // revenue is already net of royalties
  const netOperating = revenue - cumulativeOPEX - cumulativeTax;
  const totalAllCosts = totalSpent + cumulativeOPEX + cumulativeRoyalties + cumulativeTax;
  const netProfit = grossRevenue - totalAllCosts;

  // Loan info
  const hasLoan = projectData.loanAmount > 0;
  const financingName = fidSelections?.financingStructure
    ? FID_OPTIONS.financingStructure.options[fidSelections.financingStructure]?.name
    : null;

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-2">
        {production.days >= PRODUCTION_LIMIT_DAYS ? 'Production Complete — 10 Year Summary' : 'Full Production Operations'}
      </h3>

      {/* Production timeline progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Year {Math.min(Math.floor(production.days / 365) + 1, 10)} of 10</span>
          <span>{production.days} / {PRODUCTION_LIMIT_DAYS} days</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${Math.min((production.days / PRODUCTION_LIMIT_DAYS) * 100, 100)}%`,
              background: production.days >= PRODUCTION_LIMIT_DAYS ? '#22c55e' : '#3b82f6'
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4">
          <div className="text-sm text-emerald-200">Current Production</div>
          <div className="text-3xl font-bold">{currentDaily.toLocaleString()} bpd</div>
          {currentDaily < peakDaily && (
            <div className="text-xs text-slate-400 mt-1">
              Peak: {peakDaily.toLocaleString()} bpd ({(declineRate * 100).toFixed(0)}%/yr decline)
            </div>
          )}
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

      {/* Operating Economics */}
      <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
        <h4 className="font-bold mb-3 text-blue-400">Operating Economics</h4>

        {/* Daily rates */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs mb-3">
          <div className="bg-slate-800/50 rounded-lg p-2">
            <div className="text-slate-500">Gross Revenue</div>
            <div className="font-bold text-emerald-400">${(grossDailyRev/1000).toFixed(0)}K/day</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <div className="text-slate-500">Royalties ({(royaltyRate * 100).toFixed(0)}%)</div>
            <div className="font-bold text-yellow-400">-${(dailyRoyalty/1000).toFixed(0)}K/day</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <div className="text-slate-500">OPEX</div>
            <div className="font-bold text-red-400">-${(dailyOPEX/1000).toFixed(0)}K/day</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <div className="text-slate-500">Tax ({(COSTS.taxRate * 100).toFixed(0)}%)</div>
            <div className="font-bold text-orange-400">-${(dailyTax/1000).toFixed(0)}K/day</div>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <div className="text-slate-500">Daily Net</div>
            <div className={`font-bold ${dailyNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${(dailyNet/1000).toFixed(0)}K/day
            </div>
          </div>
        </div>

        {/* Cumulative breakdown */}
        <div className="space-y-1.5 text-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Cumulative Breakdown</div>
          <div className="flex justify-between">
            <span className="text-slate-400">Gross Revenue</span>
            <span className="text-emerald-400 font-semibold">${(grossRevenue/1e6).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Royalties</span>
            <span className="text-yellow-400">-${(cumulativeRoyalties/1e6).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Operating Costs (OPEX)</span>
            <span className="text-red-400">-${(cumulativeOPEX/1e6).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Income Tax</span>
            <span className="text-orange-400">-${(cumulativeTax/1e6).toFixed(1)}M</span>
          </div>
          <div className="border-t border-slate-700 my-1"></div>
          <div className="flex justify-between font-bold">
            <span className="text-slate-300">Net Operating Income</span>
            <span className={netOperating >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              ${(netOperating/1e6).toFixed(1)}M
            </span>
          </div>

          {hasLoan && (
            <>
              <div className="border-t border-slate-700 my-1"></div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loan Principal{financingName ? ` (${financingName})` : ''}</span>
                <span className="text-orange-400">${(projectData.loanAmount/1e6).toFixed(1)}M</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Interest Paid</span>
                <span className="text-red-400">-${(projectData.loanInterest/1e6).toFixed(1)}M</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-slate-900/50 p-4 rounded-lg">
        <h4 className="font-bold mb-3">Project Summary</h4>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">CAPEX (Investment)</span>
            <span className="text-orange-400">${(totalSpent/1e6).toFixed(1)}M</span>
          </div>
          {hasLoan && (
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 pl-3">incl. Loan Interest</span>
              <span className="text-slate-500">${(projectData.loanInterest/1e6).toFixed(1)}M</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-400">OPEX (Cumulative)</span>
            <span className="text-red-400">${(cumulativeOPEX/1e6).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Royalties</span>
            <span className="text-yellow-400">${(cumulativeRoyalties/1e6).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Income Tax</span>
            <span className="text-orange-400">${(cumulativeTax/1e6).toFixed(1)}M</span>
          </div>
          <div className="border-t border-slate-700 my-1"></div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Costs</span>
            <span className="text-red-400">${(totalAllCosts/1e6).toFixed(1)}M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Gross Revenue</span>
            <span className="text-emerald-400">${(grossRevenue/1e6).toFixed(1)}M</span>
          </div>
          <div className="border-t border-slate-700 my-1"></div>
          <div className="flex justify-between font-bold text-base">
            <span className="text-slate-200">Net Profit</span>
            <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              ${(netProfit/1e6).toFixed(1)}M
            </span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-slate-300">ROI</span>
            <span className={netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {totalAllCosts > 0 ? ((netProfit / totalAllCosts) * 100).toFixed(1) : '0.0'}%
            </span>
          </div>
        </div>
      </div>

      {production.days >= PRODUCTION_LIMIT_DAYS && (
        <div className="mt-4 bg-emerald-900/30 border border-emerald-600 rounded-lg p-4">
          <div className="text-center">
            <div className="text-lg font-bold text-emerald-400 mb-2">10-Year Production Cycle Complete</div>
            <p className="text-sm text-slate-300 mb-3">
              The field has reached the end of its planned production period.
              Final project economics are shown above.
            </p>
            <div className={`text-2xl font-bold ${netProfit > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {netProfit > 0 ? 'Project Profitable' : 'Project Unprofitable'}
            </div>
            <div className="flex gap-3 mt-4 justify-center">
              <button
                onClick={() => setShowReport(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                View Full Project Report
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
              >
                Start New Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionPhase;
