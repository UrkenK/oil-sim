import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';
import { QUARTERS } from '../../constants/timeline';
import { useGame } from '../../context/GameContext';
import { useRoleHelpers } from '../../hooks/useRoleHelpers';

const TimelineHeader = () => {
  const { currentQuarterIndex } = useGame();
  const { currentQuarter } = useRoleHelpers();

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Calendar className="text-blue-400" size={24} />
          <div>
            <div className="font-bold text-lg">{currentQuarter.name}</div>
            <div className="text-sm text-slate-400">Phase: {currentQuarter.phase}</div>
          </div>
        </div>
        {currentQuarter.gate && (
          <div className="flex items-center gap-2 text-orange-400">
            <AlertTriangle size={20} />
            <span className="font-semibold">Decision Gate Ahead</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex gap-2">
        {QUARTERS.slice(0, -1).map((q, idx) => (
          <div
            key={q.id}
            className={`flex-1 h-2 rounded ${
              idx < currentQuarterIndex ? 'bg-emerald-500' :
              idx === currentQuarterIndex ? 'bg-blue-500 animate-pulse' :
              'bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineHeader;
