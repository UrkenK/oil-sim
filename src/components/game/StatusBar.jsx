import React from 'react';
import { DollarSign, TrendingUp, Droplet, Zap } from 'lucide-react';
import { useGame } from '../../context/GameContext';

const StatusBar = () => {
  const { budget, totalSpent, revenue, production } = useGame();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-emerald-100 text-sm">Budget</div>
            <div className="text-2xl font-bold">${(budget/1e6).toFixed(1)}M</div>
          </div>
          <DollarSign size={28} className="text-emerald-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-orange-100 text-sm">Total Spent</div>
            <div className="text-2xl font-bold">${(totalSpent/1e6).toFixed(1)}M</div>
          </div>
          <TrendingUp size={28} className="text-orange-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-blue-100 text-sm">Revenue</div>
            <div className="text-2xl font-bold">${(revenue/1e6).toFixed(1)}M</div>
          </div>
          <Droplet size={28} className="text-blue-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-purple-100 text-sm">Production</div>
            <div className="text-2xl font-bold">{production.daily.toLocaleString()} bpd</div>
          </div>
          <Zap size={28} className="text-purple-200" />
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
