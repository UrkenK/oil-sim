import React from 'react';

import { APPRAISAL_STRATEGIES, WELL_TEST_TYPES } from '../../constants/economics';

import { useGame } from '../../context/GameContext';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';
import RoleSection from '../game/RoleSection';

const H1Y2Appraisal = () => {
  const {
    projectData,
    budget,
    appraisalStrategy,
    wellTestType,
  } = useGame();

  const { hasRole, getRoleBonus } = useRoleHelpers();

  const {
    applyGeoCost,
    drillAppraisalWells,
    dispatchSetAppraisalStrategy,
    dispatchSetWellTestType,
    dispatchSetShowDecisionGate,
  } = useGameActions();

  const { authProps } = useAuthority();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">H1 Year 2: Appraisal Program</h3>

      {/* Discovery Summary */}
      <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4 mb-4">
        <h4 className="font-bold mb-2">Discovery Summary</h4>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-slate-400">Reserve Estimate:</span>
            <div className="font-bold text-lg">{(projectData.reserveEstimate/1e6).toFixed(1)}M bbl</div>
          </div>
          <div>
            <span className="text-slate-400">Oil Quality:</span>
            <div className="font-bold text-lg capitalize">{projectData.oilQuality}</div>
          </div>
          <div>
            <span className="text-slate-400">Probability of Success:</span>
            <div className="font-bold text-lg text-emerald-400">{((projectData.probabilityOfSuccess || 0) * 100).toFixed(0)}%</div>
          </div>
        </div>
      </div>

      {/* Pre-appraisal Uncertainty Range */}
      {!projectData.appraisalComplete && (
        <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-4">
          <h4 className="font-bold mb-2 text-blue-400">Pre-Appraisal Uncertainty</h4>
          <p className="text-xs text-slate-400 mb-3">Current reserve estimate has high uncertainty. Appraisal will narrow this range.</p>
          <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden mb-2">
            <div className="absolute left-[15%] right-[15%] h-full bg-yellow-600/40 rounded-full"></div>
            <div className="absolute left-[30%] right-[30%] h-full bg-yellow-500/50 rounded-full"></div>
            <div className="absolute left-[48%] w-[4%] h-full bg-emerald-400 rounded-full"></div>
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>P10: {(projectData.reserveEstimate * 0.5 / 1e6).toFixed(0)}M</span>
            <span className="text-emerald-400 font-bold">P50: {(projectData.reserveEstimate / 1e6).toFixed(0)}M</span>
            <span>P90: {(projectData.reserveEstimate * 1.8 / 1e6).toFixed(0)}M</span>
          </div>
        </div>
      )}

      {/* Appraisal Strategy Selection */}
      {!projectData.appraisalComplete && (
        <div className="mb-4">
          <h4 className="font-bold text-blue-400 mb-1">1. Select Appraisal Strategy</h4>
          <p className="text-xs text-slate-400 mb-3">More comprehensive appraisal reduces uncertainty but costs more.</p>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(APPRAISAL_STRATEGIES).map(([sId, strat]) => {
              const isSelected = appraisalStrategy === sId;
              const totalCost = applyGeoCost(strat.baseCost, "appraisalWell");
              return (
                <button key={sId} onClick={() => dispatchSetAppraisalStrategy(sId)}
                  title={authProps('setAppraisalStrategy').title}
                  disabled={authProps('setAppraisalStrategy').disabled}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? "border-emerald-400 bg-emerald-900/30" : "border-slate-600 bg-slate-700/50 hover:border-blue-500"}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm">{strat.name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded ${strat.badgeColor}`}>{strat.badge}</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-2">{strat.description}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Wells:</span><span>{strat.wells}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Base cost:</span><span className="font-bold">${(totalCost/1e6).toFixed(1)}M</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Uncertainty:</span><span>+/- {Math.round(strat.uncertaintyRange * 100)}%</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Risk reduction:</span><span className={`${strat.riskReduction === "High" ? "text-emerald-400" : strat.riskReduction === "Medium" ? "text-yellow-400" : "text-red-400"}`}>{strat.riskReduction}</span></div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {strat.activities.map((a, i) => <span key={i} className="inline-block bg-slate-600/50 rounded px-1.5 py-0.5 mr-1 mb-1">{a}</span>)}
                  </div>
                  {isSelected && <div className="text-xs text-emerald-400 mt-1 font-bold">Selected</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Well Test Type Selection */}
      {!projectData.appraisalComplete && appraisalStrategy && APPRAISAL_STRATEGIES[appraisalStrategy]?.includesWellTest && (
        <div className="mb-4">
          <h4 className="font-bold text-blue-400 mb-1">2. Select Well Test Type</h4>
          <p className="text-xs text-slate-400 mb-3">Well testing measures how the reservoir flows. Extended tests give more data but cost more.</p>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(WELL_TEST_TYPES).map(([tId, test]) => {
              const isSelected = wellTestType === tId;
              return (
                <button key={tId} onClick={() => dispatchSetWellTestType(tId)}
                  title={authProps('setWellTestType').title}
                  disabled={authProps('setWellTestType').disabled}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${isSelected ? "border-emerald-400 bg-emerald-900/30" : "border-slate-600 bg-slate-700/50 hover:border-blue-500"}`}>
                  <div className="font-bold text-sm mb-1">{test.name}</div>
                  <div className="text-xs text-slate-400 mb-2">{test.description}</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Cost:</span><span>${(test.cost/1e6).toFixed(1)}M</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Duration:</span><span>{test.duration}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Accuracy bonus:</span><span className="text-emerald-400">+{Math.round(test.accuracyBonus * 100)}%</span></div>
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    {test.dataProducts.map((d, i) => <span key={i} className="inline-block bg-slate-600/50 rounded px-1.5 py-0.5 mr-1 mb-1">{d}</span>)}
                  </div>
                  {isSelected && <div className="text-xs text-emerald-400 mt-1 font-bold">Selected</div>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Risk Summary */}
      {!projectData.appraisalComplete && appraisalStrategy && (
        <div className="bg-orange-900/20 border border-orange-600/50 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-orange-400 mb-2">Key Appraisal Risks</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { name: "Reservoir connectivity", minimal: "High", standard: "Medium", comprehensive: "Low" },
              { name: "Fluid contact uncertainty", minimal: "High", standard: "Medium", comprehensive: "Low" },
              { name: "Permeability variation", minimal: "High", standard: "Low-Med", comprehensive: "Low" },
              { name: "Reserve volume uncertainty", minimal: "High", standard: "Medium", comprehensive: "Low" },
            ].map((risk, i) => {
              const level = risk[appraisalStrategy];
              const color = level === "Low" ? "text-emerald-400" : level === "Medium" || level === "Low-Med" ? "text-yellow-400" : "text-red-400";
              return (
                <div key={i} className="flex justify-between bg-slate-800/50 rounded p-2">
                  <span className="text-slate-400">{risk.name}</span>
                  <span className={color}>{level}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Budget Impact */}
      {!projectData.appraisalComplete && appraisalStrategy && (
        <div className="bg-slate-800/80 rounded-xl p-4 border border-amber-600/50 mb-4">
          <h4 className="font-bold text-amber-400 mb-2">Budget Impact</h4>
          {(() => {
            const strat = APPRAISAL_STRATEGIES[appraisalStrategy];
            let totalCost = applyGeoCost(strat.baseCost, "appraisalWell");
            if (strat.includesWellTest && wellTestType) totalCost += WELL_TEST_TYPES[wellTestType]?.cost || 0;
            if (hasRole("engineer")) totalCost *= (1 - getRoleBonus("drillingCostReduction"));
            const remaining = budget - totalCost;
            return (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-slate-400">Current budget:</span><span className="font-bold">${(budget/1e6).toFixed(1)}M</span></div>
                <div className="flex justify-between"><span className="text-slate-400">Appraisal program:</span><span className="text-red-400">-${(totalCost/1e6).toFixed(1)}M</span></div>
                <div className="border-t border-slate-600 my-1"></div>
                <div className="flex justify-between font-bold"><span>Remaining:</span><span className={`${remaining > 0 ? "text-emerald-400" : "text-red-400"}`}>${(remaining/1e6).toFixed(1)}M</span></div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Execute Appraisal Button */}
      {!projectData.appraisalComplete && appraisalStrategy && (
        <RoleSection roles="engineer" className="mb-4">
          <button
            onClick={() => drillAppraisalWells()}
            disabled={(APPRAISAL_STRATEGIES[appraisalStrategy]?.includesWellTest && !wellTestType) || authProps('drillAppraisalWells').disabled}
            title={authProps('drillAppraisalWells').title}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg transition-all"
          >
            Execute Appraisal Program: {APPRAISAL_STRATEGIES[appraisalStrategy]?.name}
          </button>
        </RoleSection>
      )}

      {/* Post-appraisal Results */}
      {projectData.appraisalComplete && (
        <div className="bg-emerald-900/20 border border-emerald-600 rounded-lg p-4 mb-4">
          <h4 className="font-bold text-emerald-400 mb-2">Appraisal Results — Refined Reserve Estimate</h4>
          <div className="relative h-8 bg-slate-700 rounded-full overflow-hidden mb-2">
            {(() => {
              const p10 = projectData.appraisalP10 || projectData.reserveEstimate * 0.7;
              const p50 = projectData.appraisalP50 || projectData.reserveEstimate;
              const p90 = projectData.appraisalP90 || projectData.reserveEstimate * 1.3;
              const max = p90 * 1.3;
              const p10pct = (p10 / max) * 100;
              const p90pct = (p90 / max) * 100;
              const p50pct = (p50 / max) * 100;
              return (
                <>
                  <div style={{left: p10pct + "%", width: (p90pct - p10pct) + "%"}} className="absolute h-full bg-emerald-600/40 rounded-full"></div>
                  <div style={{left: (p50pct - 1) + "%", width: "2%"}} className="absolute h-full bg-emerald-400 rounded-full"></div>
                </>
              );
            })()}
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center">
              <div className="text-slate-400 text-xs">P10 (low)</div>
              <div className="font-bold text-yellow-400">{((projectData.appraisalP10 || projectData.reserveEstimate * 0.7)/1e6).toFixed(1)}M bbl</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-xs">P50 (most likely)</div>
              <div className="font-bold text-emerald-400 text-lg">{((projectData.appraisalP50 || projectData.reserveEstimate)/1e6).toFixed(1)}M bbl</div>
            </div>
            <div className="text-center">
              <div className="text-slate-400 text-xs">P90 (high)</div>
              <div className="font-bold text-blue-400">{((projectData.appraisalP90 || projectData.reserveEstimate * 1.3)/1e6).toFixed(1)}M bbl</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 mt-2 text-center">
            Strategy: {APPRAISAL_STRATEGIES[projectData.appraisalStrategy]?.name || "N/A"}
            {projectData.wellTestType && " | Well Test: " + (WELL_TEST_TYPES[projectData.wellTestType]?.name || "")}
          </div>
        </div>
      )}

      {/* Proceed to Gate 3 */}
      {projectData.appraisalComplete && (
        <button
          onClick={() => dispatchSetShowDecisionGate(true)}
          title={authProps('advanceWithoutGate').title}
          disabled={authProps('advanceWithoutGate').disabled}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all"
        >
          Proceed to Decision Gate 3
        </button>
      )}
    </div>
  );
};

export default H1Y2Appraisal;
