import React, { useState } from 'react';
import { Users, Wifi, WifiOff, Crown, Copy, Check, ArrowLeft, Shield } from 'lucide-react';
import { ROLES } from '../../constants/roles';
import { useGame } from '../../context/GameContext';
import { useGameActions } from '../../hooks/useGameActions';

const SetupScreen = ({ multiplayer }) => {
  const { gameMode, setGameMode, teamComposition, multiplayerState, setMultiplayerState, projectData, setProjectData } = useGame();
  const { startGame, toggleRole } = useGameActions();

  // Local state for multiplayer lobby
  const [lobbyStep, setLobbyStep] = useState(null); // null | 'create' | 'join'
  const [joinCode, setJoinCode] = useState('');
  const [hostName, setHostName] = useState('');
  const [peerName, setPeerName] = useState('');
  const [isAdmin, setIsAdmin] = useState(true);
  const [copied, setCopied] = useState(false);
  const [joinError, setJoinError] = useState('');

  const mp = multiplayer || {};

  // Copy room code to clipboard
  const copyCode = () => {
    if (mp.roomId) {
      navigator.clipboard.writeText(mp.roomId).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // HOST: Create room
  const handleCreateRoom = async () => {
    if (!hostName.trim()) return;
    try {
      const role = isAdmin ? 'admin' : null;
      const code = await mp.createRoom(hostName.trim(), role);
      setMultiplayerState(prev => ({
        ...prev,
        roomId: code,
        isHost: true,
        playerRole: role,
        playerName: hostName.trim(),
      }));
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  // PEER: Join room
  const handleJoinRoom = async () => {
    if (!peerName.trim() || !joinCode.trim()) return;
    setJoinError('');
    try {
      await mp.joinRoom(joinCode.trim().toUpperCase(), peerName.trim());
      setMultiplayerState(prev => ({
        ...prev,
        roomId: joinCode.trim().toUpperCase(),
        isHost: false,
        playerName: peerName.trim(),
      }));
    } catch (err) {
      setJoinError(err.message || 'Failed to connect');
    }
  };

  // HOST: Select own role (non-admin)
  const handleHostRoleSelect = (roleId) => {
    if (isAdmin) return;
    mp.selectRole?.(roleId);
    setMultiplayerState(prev => ({ ...prev, playerRole: roleId }));
  };

  // PEER: Select role
  const handlePeerRoleSelect = (roleId) => {
    const taken = mp.connectedPlayers?.some(p => p.role === roleId && p.peerId !== mp.peerId) || false;
    if (taken) return;
    mp.selectRole?.(roleId);
    setMultiplayerState(prev => ({ ...prev, playerRole: roleId }));
  };

  // HOST: Start multiplayer game
  const handleStartMultiplayer = () => {
    // Build teamComposition from all players' roles
    const roles = (mp.connectedPlayers || [])
      .filter(p => p.connected && p.role && p.role !== 'admin')
      .map(p => p.role);

    // If host is admin, add all roles
    const hostPlayer = (mp.connectedPlayers || []).find(p => p.peerId === 'host');
    if (hostPlayer?.role === 'admin') {
      ROLES.forEach(r => {
        if (!roles.includes(r.id)) roles.push(r.id);
      });
    }

    // Toggle roles into teamComposition
    roles.forEach(roleId => {
      if (!teamComposition.includes(roleId)) toggleRole(roleId);
    });

    // Start game (will broadcast state to peers)
    setTimeout(() => {
      startGame();
      if (mp.startMultiplayerGame) {
        // Give React a tick to update state
        setTimeout(() => {
          // broadcastState will be called by the GameContext integration
        }, 100);
      }
    }, 50);
  };

  // ======== Mode Selection ========
  if (!gameMode) {
    return (
      <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-6 text-center">Select Game Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <button
            onClick={() => setGameMode('solo')}
            className="p-8 rounded-xl border-2 border-emerald-500/50 bg-emerald-900/20 hover:bg-emerald-900/40 hover:border-emerald-400 transition-all text-left"
          >
            <div className="text-4xl mb-3 text-center">
              <Users size={48} className="mx-auto text-emerald-400" />
            </div>
            <h3 className="font-bold text-xl text-emerald-400 text-center mb-2">Solo Mode</h3>
            <p className="text-sm text-slate-300 text-center mb-3">
              One player controls all roles. Select team composition and manage the entire project.
            </p>
            <div className="text-xs text-emerald-400/70 text-center">Recommended for learning</div>
          </button>
          <button
            onClick={() => setGameMode('multiplayer')}
            className="p-8 rounded-xl border-2 border-purple-500/50 bg-purple-900/20 hover:bg-purple-900/40 hover:border-purple-400 transition-all text-left"
          >
            <div className="text-4xl mb-3 text-center">
              <Users size={48} className="mx-auto text-purple-400" />
            </div>
            <h3 className="font-bold text-xl text-purple-400 text-center mb-2">Multiplayer Mode</h3>
            <p className="text-sm text-slate-300 text-center mb-3">
              Each role is a separate player. Collaborate with your team to make decisions together.
            </p>
            <div className="text-xs text-purple-400/70 text-center">2-4 players | Real-time collaboration</div>
          </button>
        </div>
      </div>
    );
  }

  // ======== Multiplayer Lobby ========
  if (gameMode === 'multiplayer') {
    const isConnected = mp.connectionStatus === 'connected';
    const players = mp.connectedPlayers || [];
    const takenRoles = players.filter(p => p.role && p.role !== 'admin').map(p => p.role);
    const allReady = players.every(p => p.role !== null) && players.length >= 1;

    // Step 1: Create or Join
    if (!lobbyStep) {
      return (
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700 max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => setGameMode(null)} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-3xl font-bold text-center flex-1">Multiplayer</h2>
            <div className="w-16"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setLobbyStep('create')}
              className="p-6 rounded-xl border-2 border-amber-500/50 bg-amber-900/20 hover:bg-amber-900/40 hover:border-amber-400 transition-all"
            >
              <Crown size={40} className="mx-auto text-amber-400 mb-3" />
              <h3 className="font-bold text-lg text-amber-400 text-center mb-2">Create Room</h3>
              <p className="text-sm text-slate-400 text-center">Host a new game session and invite players</p>
            </button>
            <button
              onClick={() => setLobbyStep('join')}
              className="p-6 rounded-xl border-2 border-blue-500/50 bg-blue-900/20 hover:bg-blue-900/40 hover:border-blue-400 transition-all"
            >
              <Wifi size={40} className="mx-auto text-blue-400 mb-3" />
              <h3 className="font-bold text-lg text-blue-400 text-center mb-2">Join Room</h3>
              <p className="text-sm text-slate-400 text-center">Enter a room code to join an existing game</p>
            </button>
          </div>
        </div>
      );
    }

    // Step 2a: Create Room form
    if (lobbyStep === 'create' && !isConnected) {
      return (
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700 max-w-lg mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => setLobbyStep(null)} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-2xl font-bold text-center flex-1">Create Room</h2>
            <div className="w-16"></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Your Name</label>
              <input
                type="text"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-amber-500 focus:outline-none"
                maxLength={20}
              />
            </div>

            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <div>
                  <div className="font-semibold text-amber-400 flex items-center gap-1">
                    <Crown size={14} /> Admin Mode
                  </div>
                  <div className="text-xs text-slate-400">Control all roles (for testing or facilitation)</div>
                </div>
              </label>
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={!hostName.trim() || mp.connectionStatus === 'connecting'}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
            >
              {mp.connectionStatus === 'connecting' ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </div>
      );
    }

    // Step 2b: Join Room form
    if (lobbyStep === 'join' && !isConnected) {
      return (
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700 max-w-lg mx-auto">
          <div className="flex items-center mb-6">
            <button onClick={() => setLobbyStep(null)} className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
              <ArrowLeft size={16} /> Back
            </button>
            <h2 className="text-2xl font-bold text-center flex-1">Join Room</h2>
            <div className="w-16"></div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Your Name</label>
              <input
                type="text"
                value={peerName}
                onChange={(e) => setPeerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 focus:border-blue-500 focus:outline-none"
                maxLength={20}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Room Code</label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3K9"
                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-center text-2xl font-mono tracking-widest focus:border-blue-500 focus:outline-none uppercase"
                maxLength={4}
              />
            </div>

            {joinError && (
              <div className="bg-red-900/30 border border-red-600 rounded p-3 text-sm text-red-300">{joinError}</div>
            )}

            <button
              onClick={handleJoinRoom}
              disabled={!peerName.trim() || joinCode.length < 4 || mp.connectionStatus === 'connecting'}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all"
            >
              {mp.connectionStatus === 'connecting' ? 'Connecting...' : 'Join Room'}
            </button>
          </div>
        </div>
      );
    }

    // Step 3: Lobby (connected) — role selection & waiting
    if (isConnected) {
      const isHost = multiplayerState.isHost;

      return (
        <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700 max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => { mp.disconnect?.(); setLobbyStep(null); setMultiplayerState(prev => ({ ...prev, connectionStatus: 'disconnected', roomId: null })); }}
              className="text-slate-400 hover:text-white text-sm flex items-center gap-1">
              <ArrowLeft size={16} /> Leave
            </button>
            <h2 className="text-2xl font-bold text-center flex-1">Game Lobby</h2>
            <div className="w-16"></div>
          </div>

          {/* Room Code */}
          {isHost && (
            <div className="bg-amber-900/30 border border-amber-600 rounded-lg p-4 mb-6 text-center">
              <div className="text-xs text-amber-400 mb-1">Room Code — share with players</div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-4xl font-mono font-bold tracking-[0.3em] text-amber-300">{mp.roomId}</span>
                <button onClick={copyCode} className="p-2 rounded bg-amber-800/50 hover:bg-amber-700/50 transition-all">
                  {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-amber-400" />}
                </button>
              </div>
            </div>
          )}

          {/* Connected Players */}
          <div className="mb-6">
            <h3 className="font-bold text-sm text-slate-400 mb-3">Connected Players ({players.length})</h3>
            <div className="space-y-2">
              {players.map((player) => {
                const role = ROLES.find(r => r.id === player.role);
                const playerIsAdmin = player.role === 'admin';
                return (
                  <div key={player.peerId} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                    <div className="flex items-center gap-3">
                      {player.connected ? <Wifi size={14} className="text-emerald-400" /> : <WifiOff size={14} className="text-red-400" />}
                      <span className="font-semibold">{player.name || 'Connecting...'}</span>
                      {player.peerId === 'host' && <Crown size={14} className="text-amber-400" />}
                    </div>
                    <div>
                      {playerIsAdmin ? (
                        <span className="text-xs px-3 py-1 rounded bg-amber-900/50 text-amber-400 border border-amber-600">Admin (All Roles)</span>
                      ) : role ? (
                        <span className="text-xs px-3 py-1 rounded" style={{ backgroundColor: role.color + '20', color: role.color, border: `1px solid ${role.color}60` }}>
                          {role.icon} {role.name}
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded bg-slate-700 text-slate-400">Selecting role...</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role Selection (for peers, or non-admin host) */}
          {(!isHost || !isAdmin) && !multiplayerState.playerRole && (
            <div className="mb-6">
              <h3 className="font-bold text-sm text-slate-400 mb-3">Select Your Role</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ROLES.map(role => {
                  const taken = takenRoles.includes(role.id);
                  return (
                    <button
                      key={role.id}
                      onClick={() => isHost ? handleHostRoleSelect(role.id) : handlePeerRoleSelect(role.id)}
                      disabled={taken}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        taken ? 'border-slate-700 bg-slate-800/50 opacity-40 cursor-not-allowed' :
                        'border-slate-600 bg-slate-700/50 hover:border-emerald-500 cursor-pointer'
                      }`}
                    >
                      <div className="text-2xl text-center mb-1">{role.icon}</div>
                      <div className="text-sm font-bold text-center" style={{ color: taken ? '#64748b' : role.color }}>{role.name}</div>
                      {taken && <div className="text-xs text-slate-500 text-center mt-1">Taken</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role selected confirmation for peer */}
          {!isHost && multiplayerState.playerRole && (
            <div className="bg-emerald-900/30 border border-emerald-600 rounded-lg p-4 mb-6 text-center">
              <div className="text-sm text-emerald-400">You are playing as</div>
              <div className="text-xl font-bold mt-1" style={{ color: ROLES.find(r => r.id === multiplayerState.playerRole)?.color }}>
                {ROLES.find(r => r.id === multiplayerState.playerRole)?.icon} {ROLES.find(r => r.id === multiplayerState.playerRole)?.name}
              </div>
              <div className="text-xs text-slate-400 mt-2">Waiting for host to start the game...</div>
            </div>
          )}

          {/* Start Game (host only) */}
          {isHost && (
            <button
              onClick={handleStartMultiplayer}
              disabled={players.length < 1}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg"
            >
              Start Game ({players.length} player{players.length !== 1 ? 's' : ''})
            </button>
          )}
        </div>
      );
    }
  }

  // ======== Solo Mode: Team Building ========
  return (
    <div className="bg-slate-800 rounded-xl p-8 shadow-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setGameMode(null)}
          className="text-slate-400 hover:text-white text-sm flex items-center gap-1 transition-all"
        >
          &larr; Back to mode selection
        </button>
        <h2 className="text-3xl font-bold text-center flex-1">Build Your Exploration Team</h2>
        <div className="w-32"></div>
      </div>

      {/* Educational Introduction */}
      <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-lg text-blue-400 mb-3">Welcome to Oil Exploration Simulator</h3>
        <p className="text-sm text-slate-300 mb-4">You are the project manager of an oil exploration company. Your goal is to find and develop an oil field from initial geological survey to full-scale production. Every decision carries risk, and your budget of 100M dollars is limited.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
          <div className="bg-slate-800/80 rounded-lg p-3 border border-emerald-600/50"><div className="text-emerald-400 font-bold mb-1">1. Exploration</div><div className="text-slate-400">Find a promising area and drill a test well</div></div>
          <div className="bg-slate-800/80 rounded-lg p-3 border border-blue-600/50"><div className="text-blue-400 font-bold mb-1">2. Appraisal</div><div className="text-slate-400">Confirm the discovery and estimate reserves</div></div>
          <div className="bg-slate-800/80 rounded-lg p-3 border border-orange-600/50"><div className="text-orange-400 font-bold mb-1">3. Development</div><div className="text-slate-400">Build wells and infrastructure</div></div>
          <div className="bg-slate-800/80 rounded-lg p-3 border border-purple-600/50"><div className="text-purple-400 font-bold mb-1">4. Production</div><div className="text-slate-400">Extract oil and generate revenue</div></div>
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">At each stage you will face Decision Gates (FID) — critical go/no-go decisions that determine the project future.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {ROLES.map(role => (
          <div
            key={role.id}
            onClick={() => toggleRole(role.id)}
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              teamComposition.includes(role.id)
                ? 'border-emerald-400 bg-emerald-900/30 shadow-lg'
                : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
            }`}
          >
            <div className="text-4xl mb-3 text-center">{role.icon}</div>
            <h3 className="font-bold text-lg mb-2 text-center" style={{ color: role.color }}>
              {role.name}
            </h3>
            <p className="text-sm text-slate-300 text-center mb-3">{role.description}</p>

            {/* Skill Bonuses */}
            <div className="bg-slate-900/50 rounded p-2 text-xs space-y-1">
              <div className="font-semibold text-center mb-1" style={{ color: role.color }}>
                Key Benefits:
              </div>
              {Object.entries(role.skillBonuses).slice(0, 2).map(([key, value]) => (
                <div key={key} className="text-slate-400 text-center">
                  +{(value * 100).toFixed(0)}% {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900/50 p-6 rounded-lg mb-6">
        <div className="bg-emerald-900/20 border border-emerald-600/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-emerald-300"><span className="font-bold">Tip for beginners:</span> Select all 4 roles for maximum bonuses and the best chance of success. Advanced players can limit the team for a greater challenge.</p>
      </div>

      <h3 className="text-xl font-bold mb-3">Project Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div><span className="text-slate-400">Initial Budget:</span> <span className="font-bold text-emerald-400">$100M</span></div>
          <div><span className="text-slate-400">Timeline:</span> <span className="font-bold text-blue-400">4+ Years</span></div>
          <div><span className="text-slate-400">Decision Gates:</span> <span className="font-bold text-purple-400">5 Critical FIDs</span></div>
          <div><span className="text-slate-400">Oil Price:</span> <span className="font-bold text-orange-400">$75/bbl</span></div>
          <div><span className="text-slate-400">Hurdle Rate:</span> <span className="font-bold text-red-400">10% NPV</span></div>
          <div><span className="text-slate-400">Team Size:</span> <span className="font-bold text-yellow-400">{teamComposition.length} roles</span></div>
        </div>
      </div>

      {/* Game Options */}
      <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={projectData.detailedWellMode || false}
            onChange={(e) => setProjectData(prev => ({ ...prev, detailedWellMode: e.target.checked }))}
            className="w-5 h-5 rounded accent-amber-500"
          />
          <div>
            <div className="font-semibold text-amber-400">Detailed Well Management</div>
            <div className="text-xs text-slate-400">
              Track individual wells with unique performance, decline curves, water cut, health, and interventions during production.
              When off, production uses simplified aggregate simulation.
            </div>
          </div>
        </label>
      </div>

      <button
        onClick={startGame}
        className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600 text-white font-bold py-4 rounded-lg text-xl transition-all shadow-lg"
      >
        Launch Exploration Project →
      </button>
    </div>
  );
};

export default SetupScreen;
