import React from 'react';
import { Wifi, WifiOff, Shield, Crown } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { useGame } from '../../context/GameContext';

const PlayerBar = () => {
  const { multiplayerState } = useGame();
  const { connectedPlayers, playerRole, connectionStatus } = multiplayerState;

  if (!connectedPlayers || connectedPlayers.length === 0) return null;

  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-lg px-4 py-2 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          {connectionStatus === 'connected' ? (
            <Wifi size={12} className="text-emerald-400" />
          ) : (
            <WifiOff size={12} className="text-red-400" />
          )}
          <span>Room: {multiplayerState.roomId}</span>
        </div>

        <div className="flex items-center gap-2">
          {connectedPlayers.map((player) => {
            const role = ROLES.find(r => r.id === player.role);
            const isAdmin = player.role === 'admin';
            const isYou = (multiplayerState.isHost && player.peerId === 'host') ||
                          (!multiplayerState.isHost && player.peerId === multiplayerState.peerId);

            return (
              <div
                key={player.peerId}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                  isYou ? 'bg-blue-900/50 border border-blue-600' : 'bg-slate-700/50'
                } ${!player.connected ? 'opacity-40' : ''}`}
              >
                {isAdmin ? (
                  <Crown size={12} className="text-amber-400" />
                ) : role ? (
                  <span style={{ color: role.color }}>{role.icon}</span>
                ) : (
                  <Shield size={12} className="text-slate-500" />
                )}
                <span className={isAdmin ? 'text-amber-400' : role ? '' : 'text-slate-400'}
                  style={role && !isAdmin ? { color: role.color } : {}}>
                  {player.name || 'Joining...'}
                </span>
                {isYou && <span className="text-blue-400 font-bold">(you)</span>}
                {!player.connected && <WifiOff size={10} className="text-red-400" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
