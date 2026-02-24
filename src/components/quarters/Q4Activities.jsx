import React from 'react';
import { AlertTriangle, Target } from 'lucide-react';

import { COSTS } from '../../constants/economics';

import { useGame } from '../../context/GameContext';
import { useGameActions } from '../../hooks/useGameActions';

const Q4Activities = () => {
  const {
    projectData,
  } = useGame();
  const { dispatchSetShowDecisionGate } = useGameActions();

  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold mb-4">Q4 Activities: Ready to Drill</h3>

      <div className="bg-orange-900/30 border border-orange-600 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="text-orange-400" />
          <span className="font-bold">Approaching Decision Gate 2</span>
        </div>
        <p className="text-sm text-slate-300">
          Complete all preparations before proceeding to the drilling decision.
          The next gate will determine if you drill the exploration well.
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded">
          <span>Exploration well cost:</span>
          <span className="font-bold text-orange-400">${(COSTS.explorationWell/1e6).toFixed(1)}M</span>
        </div>
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded">
          <span>Success probability:</span>
          <span className="font-bold text-emerald-400">{(projectData.probabilityOfSuccess * 100).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded">
          <span>Expected value:</span>
          <span className="font-bold text-blue-400">
            ${((projectData.probabilityOfSuccess * 200 - COSTS.explorationWell) / 1e6).toFixed(1)}M
          </span>
        </div>
      </div>

      <button
        onClick={() => dispatchSetShowDecisionGate(true)}
        className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
      >
        <Target size={20} />
        Proceed to Decision Gate 2
      </button>
    </div>
  );
};

export default Q4Activities;
