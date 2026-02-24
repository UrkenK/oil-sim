import React from 'react';
import { AlertTriangle, RefreshCw, Users, MapPin } from 'lucide-react';
import { GEOLOGICAL_CHARACTERISTICS } from '../../constants/geology';
import { COSTS } from '../../constants/economics';
import { useGame } from '../../context/GameContext';
import { useGameActions } from '../../hooks/useGameActions';
import { useAuthority } from '../../hooks/useAuthority';
import RoleSection from '../game/RoleSection';

const DryHoleScreen = () => {
  const {
    budget, totalSpent, wells,
    projectData, drillingInProgress, dryHoleHistory,
  } = useGame();
  const {
    applyGeoCost, drillAnotherWell, relocateExploration,
    farmOut, abandonProject,
  } = useGameActions();
  const { authProps } = useAuthority();

  return (
    <div className="bg-slate-800 rounded-xl p-8 border-4 border-orange-500 relative">

      {/* Drilling Animation Overlay */}
      {drillingInProgress && (
        <div className="absolute inset-0 bg-slate-900/90 rounded-xl flex items-center justify-center z-10">
          <div className="text-center p-8">
            <div className="animate-pulse mb-6">
              <div className="w-20 h-20 mx-auto rounded-full border-4 border-blue-400 border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-2xl font-bold mb-2 text-blue-300">{drillingInProgress.message}</h3>
            <div className="w-80 mx-auto bg-slate-700 rounded-full h-4 mt-4 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${drillingInProgress.progress}%`, background: drillingInProgress.progress < 100 ? '#3b82f6' : '#22c55e' }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-2">{drillingInProgress.progress}% complete</p>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <AlertTriangle size={64} className="text-orange-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">Dry Hole - Well Unsuccessful</h2>
        <p className="text-slate-300 mb-4">
          Exploration well was dry. No commercial hydrocarbons at this location.
          But the project doesn't have to end here — in real exploration, companies have options.
        </p>

        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 inline-block">
          <div className="grid grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-slate-400">Budget Remaining</div>
              <div className="text-2xl font-bold text-emerald-400">${(budget/1e6).toFixed(1)}M</div>
            </div>
            <div>
              <div className="text-slate-400">Total Spent</div>
              <div className="text-2xl font-bold text-red-400">${(totalSpent/1e6).toFixed(1)}M</div>
            </div>
            <div>
              <div className="text-slate-400">Wells Drilled</div>
              <div className="text-2xl font-bold">{wells.exploration} ({wells.dry} dry)</div>
            </div>
          </div>
        </div>
      </div>
      {/* Drilling History Log */}
      {dryHoleHistory.length > 0 && (
        <div className="mb-6 bg-slate-900/50 rounded-lg p-4">
          <h4 className="text-sm font-bold text-slate-300 mb-3">Drilling History</h4>
          <div className="space-y-2">
            {dryHoleHistory.map((h, i) => (
              <div key={i} className={`flex items-center justify-between text-xs p-2 rounded ${h.success ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-red-900/30 border border-red-700'}`}>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-300">#{h.attempt}</span>
                  <span className="text-slate-400">{h.type}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-orange-400">${(h.cost/1e6).toFixed(1)}M</span>
                  <span className={h.success ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>{h.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-4 text-center">Choose Your Strategy</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Option 1: Drill another well */}
        <RoleSection roles="engineer" className="bg-slate-700/50 rounded-lg p-6 border-2 border-slate-600 hover:border-blue-500 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <RefreshCw className="text-blue-400" size={28} />
            <h4 className="text-lg font-bold text-blue-400">Drill Another Well</h4>
          </div>
          <p className="text-sm text-slate-300 mb-3">
            Try a different location on the same lease. Seismic data suggests other potential targets.
          </p>
          <div className="text-xs text-slate-400 space-y-1 mb-4">
            <div className="flex justify-between">
              <span>Cost:</span>
              <span className="text-orange-400 font-semibold">
                ~${(applyGeoCost(COSTS.explorationWell, 'explorationWell')/1e6).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span>Success probability:</span>
              <span className="text-yellow-400 font-semibold">Reduced (prior miss)</span>
            </div>
            <div className="flex justify-between">
              <span>Risk:</span>
              <span className="text-red-400">High — same geological area</span>
            </div>
          </div>
          {budget < applyGeoCost(COSTS.explorationWell, 'explorationWell') && (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-2 mb-3 text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle size={14} />
              <span>Insufficient budget. Need ${(applyGeoCost(COSTS.explorationWell, 'explorationWell')/1e6).toFixed(1)}M but only ${(budget/1e6).toFixed(1)}M available.</span>
            </div>
          )}
          <button
            onClick={drillAnotherWell}
            disabled={budget < applyGeoCost(COSTS.explorationWell, 'explorationWell') || drillingInProgress || authProps('drillAnotherWell').disabled}
            title={authProps('drillAnotherWell').title}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
          >
            {budget < applyGeoCost(COSTS.explorationWell, 'explorationWell') ? 'Insufficient Budget' : 'Drill New Target'}
          </button>
        </RoleSection>
        {/* Option 2: Farm-out */}
        <RoleSection roles="finance" className="bg-slate-700/50 rounded-lg p-6 border-2 border-slate-600 hover:border-purple-500 transition-all">
          <div className="flex items-center gap-3 mb-3">
            <Users className="text-purple-400" size={28} />
            <h4 className="text-lg font-bold text-purple-400">Farm-Out (Joint Venture)</h4>
          </div>
          <p className="text-sm text-slate-300 mb-3">
            Bring in a partner to share risk and costs. They pay 50% of drilling but take 40% of any discovery.
          </p>
          <div className="text-xs text-slate-400 space-y-1 mb-4">
            <div className="flex justify-between">
              <span>Your cost:</span>
              <span className="text-emerald-400 font-semibold">
                ~${(applyGeoCost(COSTS.explorationWell, 'explorationWell') * 0.5 /1e6).toFixed(1)}M
              </span>
            </div>
            <div className="flex justify-between">
              <span>Partner brings:</span>
              <span className="text-emerald-400 font-semibold">+${(budget * 0.5/1e6).toFixed(1)}M budget</span>
            </div>
            <div className="flex justify-between">
              <span>Trade-off:</span>
              <span className="text-yellow-400">Only 60% of reserves if found</span>
            </div>
            <div className="flex justify-between">
              <span>Bonus:</span>
              <span className="text-emerald-400">+8% probability (partner expertise)</span>
            </div>
          </div>
          <button
            onClick={farmOut}
            disabled={drillingInProgress || authProps('farmOut').disabled}
            title={authProps('farmOut').title}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
          >
            Find a Partner
          </button>
        </RoleSection>

        {/* Option 3: Relocate */}
        <RoleSection roles="geologist" className="bg-slate-700/50 rounded-lg p-6 border-2 border-slate-600 hover:border-emerald-500 transition-all md:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="text-emerald-400" size={28} />
            <h4 className="text-lg font-bold text-emerald-400">Relocate to New Area</h4>
          </div>
          <p className="text-sm text-slate-300 mb-4">
            Abandon current lease and move to a different geological area. Requires new lease and fast-track seismic.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(GEOLOGICAL_CHARACTERISTICS)
              .filter(([key]) => key !== projectData.geologicalType)
              .map(([key, geo]) => {
                const cost = (applyGeoCost(COSTS.lease + COSTS.environmental + COSTS.permits, 'lease') * 0.7 +
                             applyGeoCost(COSTS.seismic + COSTS.dataProcessing, 'seismic') * 0.5);
                const canAfford = budget >= cost;
                return (
                  <div key={key} className="relative">
                    <button
                      onClick={() => relocateExploration(key)}
                      disabled={!canAfford || drillingInProgress || authProps('relocateExploration').disabled}
                      title={authProps('relocateExploration').title}
                      className="w-full p-3 rounded-lg border border-slate-500 hover:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left bg-slate-800"
                    >
                      <div className="font-bold text-sm mb-1">{geo.name}</div>
                      <div className="text-xs text-slate-400 mb-2">
                        P(success): {(geo.probability * 100).toFixed(0)}%
                      </div>
                      <div className={`text-xs ${canAfford ? 'text-orange-400' : 'text-red-400'}`}>
                        ~${(cost/1e6).toFixed(1)}M
                      </div>
                      {!canAfford && (
                        <div className="text-xs text-red-400 mt-1 font-bold">Can't afford</div>
                      )}
                    </button>
                  </div>
                );
              })}
          </div>
        </RoleSection>
      </div>

      {/* Abandon option */}
      <div className="text-center pt-4 border-t border-slate-700">
        <button
          onClick={abandonProject}
          disabled={drillingInProgress || authProps('abandonProject').disabled}
          title={authProps('abandonProject').title}
          className="text-slate-400 hover:text-red-400 text-sm underline transition-all disabled:opacity-50"
        >
          Abandon Project Entirely (cut losses)
        </button>
      </div>
    </div>
  );
};

export default DryHoleScreen;
