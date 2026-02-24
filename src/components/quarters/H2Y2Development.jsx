import React from 'react';

import { COSTS } from '../../constants/economics';

import { useGame } from '../../context/GameContext';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';
import RoleSection from '../game/RoleSection';

const H2Y2Development = () => {
  const {
    projectData,
  } = useGame();

  const {
    calculateNPV,
    approveDevelopmentPlan,
    dispatchSetShowDecisionGate,
  } = useGameActions();

  const { authProps } = useAuthority();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">H2 Year 2: Development Planning</h3>

      <RoleSection roles={['finance', 'operations']}>
        <label className="block text-sm font-semibold mb-2">Select Development Scenario</label>
        <div className="space-y-3">
          {[
            { wells: 4, name: 'Conservative', desc: 'Lower risk, lower return' },
            { wells: 8, name: 'Base Case', desc: 'Balanced approach' },
            { wells: 12, name: 'Aggressive', desc: 'Maximum production' }
          ].map(scenario => {
            const npv = calculateNPV(projectData.reserveEstimate, scenario.wells, scenario.wells * 2000);
            const cost = scenario.wells * COSTS.developmentWell + COSTS.facility;
            return (
              <button
                key={scenario.wells}
                onClick={() => approveDevelopmentPlan(scenario.wells)}
                disabled={projectData.developmentPlan !== null || authProps('approveDevelopmentPlan').disabled}
                title={authProps('approveDevelopmentPlan').title}
                className="w-full p-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 rounded-lg transition-all text-left"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold">{scenario.name} - {scenario.wells} Wells</div>
                    <div className="text-sm text-slate-400">{scenario.desc}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Production: ~{(scenario.wells * 2000).toLocaleString()} bpd
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-400">CAPEX</div>
                    <div className="font-bold text-orange-400">${(cost/1e6).toFixed(1)}M</div>
                    <div className="text-sm text-slate-400 mt-1">NPV</div>
                    <div className={`font-bold ${npv > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${(npv/1e6).toFixed(1)}M
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </RoleSection>

      {projectData.developmentPlan && (
        <button
          onClick={() => dispatchSetShowDecisionGate(true)}
          title={authProps('advanceWithoutGate').title}
          disabled={authProps('advanceWithoutGate').disabled}
          className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all mt-4"
        >
          Proceed to Decision Gate 4 - Final Investment Decision
        </button>
      )}
    </div>
  );
};

export default H2Y2Development;
