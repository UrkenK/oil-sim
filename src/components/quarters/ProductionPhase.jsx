import React from 'react';

import { useGame } from '../../context/GameContext';
import { useGameActions } from '../../hooks/useGameActions';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';
import { useAuthority } from '../../hooks/useAuthority';
import { PRODUCTION_LIMIT_DAYS } from '../../hooks/useProductionSimulation';
import { COSTS, LEASE_OPTIONS, calculateRoyaltyRate, FID_OPTIONS } from '../../constants/economics';
import { GEOLOGICAL_CHARACTERISTICS } from '../../constants/geology';
import { WELL_CONFIG } from '../../constants/wellConfig';

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
    individualWells,
    pendingWellEvents,
    oilPrice,
    currentMarketEvent,
    financialHistory,
  } = useGame();

  const { calculateNPV, shutInWell, restartWell, workoverWell, stimulateWell, abandonWell, repairWell, dismissWellEvent } = useGameActions();
  const { hasRole, getRoleBonus } = useRoleHelpers();
  const { authProps } = useAuthority();

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
  const grossDailyRev = currentDaily * oilPrice;
  const royaltyOption = leaseTerms?.royaltyTerms
    ? LEASE_OPTIONS.royaltyTerms.options[leaseTerms.royaltyTerms]
    : null;
  const royaltyRate = calculateRoyaltyRate(royaltyOption, oilPrice);
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
      {/* Oil Price Banner */}
      <div className={`rounded-lg p-3 mb-4 border flex items-center justify-between ${
        currentMarketEvent && currentMarketEvent.id !== 'stable_market'
          ? (currentMarketEvent.impactMin > 0
              ? 'bg-emerald-900/20 border-emerald-600/50'
              : 'bg-red-900/20 border-red-600/50')
          : 'bg-slate-900/50 border-slate-600'
      }`}>
        <div className="flex items-center gap-3">
          <div>
            <span className="text-2xl font-bold">${oilPrice.toFixed(2)}</span>
            <span className="text-sm text-slate-400 ml-1">/bbl</span>
          </div>
          {currentMarketEvent && (
            <div className="text-sm">
              <span className="mr-1">{currentMarketEvent.icon}</span>
              <span className={currentMarketEvent.color}>{currentMarketEvent.name}</span>
              <span className="text-slate-500 ml-2 text-xs">(Day {currentMarketEvent.day})</span>
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500">Range: $30–$130</div>
      </div>

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

      {/* Financial History Chart */}
      {financialHistory && financialHistory.length >= 2 && (() => {
        const width = 700;
        const height = 250;
        const pad = { top: 20, right: 20, bottom: 35, left: 55 };
        const chartW = width - pad.left - pad.right;
        const chartH = height - pad.top - pad.bottom;

        const revData = financialHistory.map(d => d.revenue);
        const expData = financialHistory.map(d => d.opex + d.royalties + d.tax);
        const allVals = [...revData, ...expData];
        const maxVal = Math.max(...allVals) * 1.1;
        const minVal = 0;
        const valRange = maxVal - minVal || 1;

        const x = (i) => pad.left + (i / (financialHistory.length - 1)) * chartW;
        const y = (v) => pad.top + chartH - ((v - minVal) / valRange) * chartH;

        const revPoints = financialHistory.map((d, i) => `${x(i)},${y(d.revenue)}`).join(' ');
        const expPoints = financialHistory.map((d, i) => `${x(i)},${y(d.opex + d.royalties + d.tax)}`).join(' ');

        // Grid lines
        const gridCount = 4;
        const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => minVal + (valRange * i) / gridCount);

        // Year labels on X axis
        const yearLabels = [];
        for (let i = 0; i < financialHistory.length; i++) {
          if (financialHistory[i].month % 12 === 0) {
            yearLabels.push({ i, year: financialHistory[i].month / 12 });
          }
        }

        return (
          <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
            <h4 className="font-bold mb-3 text-blue-400">Monthly Revenue vs Expenses</h4>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ maxHeight: '300px' }}>
              {gridLines.map((v, i) => (
                <g key={i}>
                  <line x1={pad.left} y1={y(v)} x2={width - pad.right} y2={y(v)}
                    stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />
                  <text x={pad.left - 5} y={y(v) + 4} textAnchor="end"
                    fill="#64748b" fontSize="10">${(v / 1e6).toFixed(1)}M</text>
                </g>
              ))}
              {yearLabels.map(({ i, year }) => (
                <g key={year}>
                  <line x1={x(i)} y1={pad.top} x2={x(i)} y2={pad.top + chartH}
                    stroke="#334155" strokeWidth="1" strokeDasharray="2,4" />
                  <text x={x(i)} y={height - 5} textAnchor="middle"
                    fill="#64748b" fontSize="10">Y{year}</text>
                </g>
              ))}
              <polyline points={revPoints} fill="none" stroke="#10b981" strokeWidth="2" />
              <polyline points={expPoints} fill="none" stroke="#ef4444" strokeWidth="2" />
            </svg>
            <div className="flex justify-center gap-6 mt-2 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-emerald-500"></div>
                <span className="text-slate-400">Gross Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-red-500"></div>
                <span className="text-slate-400">Total Expenses (OPEX + Royalties + Tax)</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Individual Well Management */}
      {projectData.detailedWellMode && individualWells && individualWells.length > 0 && (
        <div className="bg-slate-900/50 p-4 rounded-lg mb-4">
          <h4 className="font-bold mb-3 text-amber-400">
            Well Management ({individualWells.filter(w => w.status === 'producing').length} producing / {individualWells.filter(w => !['abandoned','failed'].includes(w.status)).length} active / {individualWells.length} total)
          </h4>

          {/* Pending Events */}
          {pendingWellEvents && pendingWellEvents.length > 0 && (
            <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-3">
              <div className="font-bold text-red-400 text-sm mb-2">Active Events ({pendingWellEvents.length})</div>
              {pendingWellEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between text-xs bg-slate-800/50 rounded p-2 mt-1">
                  <div>
                    <span className="text-red-300 font-bold">{event.name}</span>
                    <span className="text-slate-400 ml-2">{event.wellName || event.wellId}</span>
                    <span className="text-slate-500 ml-2">— {event.description}</span>
                  </div>
                  <div className="flex gap-2 ml-2 shrink-0">
                    {event.repairCost && (
                      <button
                        onClick={() => repairWell(event.wellId, event.id)}
                        disabled={authProps('repairWell').disabled}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white text-xs"
                      >
                        Repair (${(event.repairCost/1e6).toFixed(1)}M)
                      </button>
                    )}
                    {event.effect === 'choice' && (
                      <button
                        onClick={() => abandonWell(event.wellId)}
                        disabled={authProps('abandonWell').disabled}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 rounded text-white text-xs"
                      >
                        Abandon
                      </button>
                    )}
                    {event.effect === 'production_loss' && event.requiresWorkover && (
                      <button
                        onClick={() => workoverWell(event.wellId)}
                        disabled={authProps('workoverWell').disabled}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 rounded text-white text-xs"
                      >
                        Workover
                      </button>
                    )}
                    {(event.effect === 'water_cut_jump' || event.effect === 'production_loss') && (
                      <button
                        onClick={() => dismissWellEvent(event.id)}
                        className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-white text-xs"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Well Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {individualWells.map(well => {
              const isActive = well.status === 'producing';
              const isShutIn = well.status === 'shut_in';
              const isDown = ['workover', 'stimulation', 'repair'].includes(well.status);
              const isDead = ['failed', 'abandoned'].includes(well.status);

              const borderColor = isActive ? 'border-emerald-600' :
                isShutIn ? 'border-yellow-600' :
                isDown ? 'border-blue-600' : 'border-red-600';
              const bgColor = isActive ? 'bg-emerald-900/20' :
                isShutIn ? 'bg-yellow-900/20' :
                isDown ? 'bg-blue-900/20' : 'bg-red-900/20';

              return (
                <div key={well.id} className={`rounded-lg p-3 border ${borderColor} ${bgColor} ${isDead ? 'opacity-50' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm">{well.name}</div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-emerald-700 text-emerald-200' :
                      isShutIn ? 'bg-yellow-700 text-yellow-200' :
                      isDown ? 'bg-blue-700 text-blue-200' :
                      'bg-red-700 text-red-200'
                    }`}>
                      {well.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Production */}
                  <div className="text-lg font-bold text-emerald-400">
                    {(well.dailyProduction || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">bpd</span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    IP: {well.ip.toLocaleString()} | Cum: {(well.cumulativeProduction / 1e6).toFixed(2)}M bbl
                  </div>

                  {/* Health + Water Cut bars */}
                  <div className="grid grid-cols-2 gap-1.5 mt-2 text-[10px]">
                    <div>
                      <div className="flex justify-between text-slate-500">
                        <span>Health</span>
                        <span>{well.health.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${well.health}%`,
                          background: well.health > 60 ? '#10b981' : well.health > 30 ? '#f59e0b' : '#ef4444'
                        }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-500">
                        <span>Water</span>
                        <span>{(well.waterCut * 100).toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-1.5">
                        <div className="h-full rounded-full bg-blue-500 transition-all"
                          style={{ width: `${Math.min(well.waterCut * 100, 100)}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Stimulation indicator */}
                  {well.stimulationDaysRemaining > 0 && (
                    <div className="text-[10px] text-purple-400 mt-1">
                      Stim: +{(well.stimulationBoost*100).toFixed(0)}% ({well.stimulationDaysRemaining}d left)
                    </div>
                  )}

                  {/* Downtime */}
                  {well.actionDowntimeRemaining > 0 && (
                    <div className="text-[10px] text-blue-400 mt-1">
                      {well.actionDowntimeRemaining} days remaining
                    </div>
                  )}

                  {/* Action buttons */}
                  {!isDead && production.days < PRODUCTION_LIMIT_DAYS && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {isActive && (
                        <button onClick={() => shutInWell(well.id)}
                          disabled={authProps('shutInWell').disabled}
                          className="px-1.5 py-0.5 bg-yellow-700 hover:bg-yellow-600 disabled:bg-slate-700 rounded text-[10px] text-yellow-200">
                          Shut-in
                        </button>
                      )}
                      {isShutIn && (
                        <button onClick={() => restartWell(well.id)}
                          disabled={authProps('restartWell').disabled}
                          className="px-1.5 py-0.5 bg-emerald-700 hover:bg-emerald-600 disabled:bg-slate-700 rounded text-[10px] text-emerald-200">
                          Restart
                        </button>
                      )}
                      {(isActive || isShutIn) && (
                        <>
                          <button onClick={() => workoverWell(well.id)}
                            disabled={authProps('workoverWell').disabled}
                            className="px-1.5 py-0.5 bg-blue-700 hover:bg-blue-600 disabled:bg-slate-700 rounded text-[10px] text-blue-200">
                            Workover
                          </button>
                          <button onClick={() => stimulateWell(well.id)}
                            disabled={authProps('stimulateWell').disabled}
                            className="px-1.5 py-0.5 bg-purple-700 hover:bg-purple-600 disabled:bg-slate-700 rounded text-[10px] text-purple-200">
                            Stimulate
                          </button>
                          <button onClick={() => abandonWell(well.id)}
                            disabled={authProps('abandonWell').disabled}
                            className="px-1.5 py-0.5 bg-red-700 hover:bg-red-600 disabled:bg-slate-700 rounded text-[10px] text-red-200">
                            P&A
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
