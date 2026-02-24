import React from 'react';
import { Users, AlertTriangle } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { useGame } from '../../context/GameContext';

const Sidebar = () => {
  const { teamComposition, notifications, wells } = useGame();

  return (
    <div className="space-y-4">
      {/* Team */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Users size={18} /> Team
        </h3>
        <div className="space-y-2">
          {teamComposition.map(roleId => {
            const role = ROLES.find(r => r.id === roleId);
            return (
              <div key={roleId} className="text-sm flex items-center gap-2">
                <span>{role.icon}</span>
                <span style={{ color: role.color }}>{role.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <AlertTriangle size={18} /> Activity Log
        </h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {notifications.slice(0, 10).map(notif => (
            <div
              key={notif.id}
              className={`p-2 rounded text-xs border ${
                notif.type === 'success' ? 'bg-emerald-900/20 border-emerald-600/50' :
                notif.type === 'error' ? 'bg-red-900/20 border-red-600/50' :
                'bg-blue-900/20 border-blue-600/50'
              }`}
            >
              <div className="font-semibold">{notif.quarter}</div>
              <div className="text-slate-300">{notif.message}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Well Summary */}
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <h3 className="font-bold mb-3">Wells Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-400">Exploration:</span>
            <span className="font-bold">{wells.exploration}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Appraisal:</span>
            <span className="font-bold">{wells.appraisal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Production:</span>
            <span className="font-bold">{wells.production}</span>
          </div>
          <div className="flex justify-between border-t border-slate-700 pt-2">
            <span className="text-emerald-400">Successful:</span>
            <span className="font-bold text-emerald-400">{wells.successful}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-red-400">Dry:</span>
            <span className="font-bold text-red-400">{wells.dry}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
