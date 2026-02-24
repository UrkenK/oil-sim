import React from 'react';
import { XCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const ProjectEndedScreen = () => {
  const {
    currentQuarterIndex, totalSpent, wells,
    projectData, decisions, setShowReport,
  } = useGame();

  return (
    <div className="bg-slate-800 rounded-xl p-8 border-4 border-red-500">
      <div className="text-center">
        <XCircle size={64} className="text-red-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-4">Project Terminated</h2>
        <p className="text-slate-300 mb-6">
          {projectData.oilDiscovered === false
            ? 'Exploration well was dry. No commercial hydrocarbons discovered.'
            : 'Project terminated at decision gate.'}
        </p>

        <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
          <h3 className="font-bold mb-3">Project Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400">Total Spent</div>
              <div className="text-2xl font-bold text-red-400">${(totalSpent/1e6).toFixed(1)}M</div>
            </div>
            <div>
              <div className="text-slate-400">Wells Drilled</div>
              <div className="text-2xl font-bold">{wells.exploration + wells.appraisal}</div>
            </div>
            <div>
              <div className="text-slate-400">Quarters Elapsed</div>
              <div className="text-2xl font-bold">{currentQuarterIndex + 1}</div>
            </div>
            <div>
              <div className="text-slate-400">Final Decision</div>
              <div className="text-lg font-bold">{decisions[0]?.outcome || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setShowReport(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            View Full Project Report
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
          >
            Start New Project
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectEndedScreen;
