import React, { useEffect, useRef, useCallback } from 'react';
import { Droplet } from 'lucide-react';

import ProjectReport from './components/screens/ProjectReport';
import SetupScreen from './components/screens/SetupScreen';
import DryHoleScreen from './components/screens/DryHoleScreen';
import ProjectEndedScreen from './components/screens/ProjectEndedScreen';

import TimelineHeader from './components/game/TimelineHeader';
import StatusBar from './components/game/StatusBar';
import DecisionGateModal from './components/game/DecisionGateModal';
import Sidebar from './components/game/Sidebar';
import PlayerBar from './components/game/PlayerBar';

import Q1Activities from './components/quarters/Q1Activities';
import Q2Activities from './components/quarters/Q2Activities';
import Q3Activities from './components/quarters/Q3Activities';
import Q4Activities from './components/quarters/Q4Activities';
import H1Y2Appraisal from './components/quarters/H1Y2Appraisal';
import H2Y2Development from './components/quarters/H2Y2Development';
import H1Y3Construction from './components/quarters/H1Y3Construction';
import H2Y3Startup from './components/quarters/H2Y3Startup';
import ProductionPhase from './components/quarters/ProductionPhase';

import { GameProvider, useGame } from './context/GameContext';
import { useRoleHelpers } from './hooks/useRoleHelpers';
import { useGameActions } from './hooks/useGameActions';
import { useProductionSimulation } from './hooks/useProductionSimulation';
import { useMultiplayer } from './hooks/useMultiplayer';

const OilExplorationSimulation = () => {
  const {
    gameState,
    showDecisionGate,
    showReport, setShowReport,
    projectData,
    production,
    teamComposition, decisions, roleApprovals, wells, individualWells, budget, totalSpent, revenue,
    selectedSeismicPkg, selectedContractor, selectedDrillSite, appraisalStrategy,
    wellTestType, processingWorkflow, seismicObservations, riskAssessment,
    loanAssessment, dryHoleHistory, gameMode,
    selectedFacilities, feedStudy,
    oilPrice, oilPriceHistory, financialHistory,
    multiplayerState,
    getSnapshot, applySnapshot,
    actionDispatchRef,
  } = useGame();

  const { currentQuarter } = useRoleHelpers();
  const { evaluateGate, exportSession, actionRegistry } = useGameActions();
  const multiplayer = useMultiplayer();
  const actionRegistryRef = useRef(actionRegistry);
  actionRegistryRef.current = actionRegistry;

  useProductionSimulation();

  // ======== Multiplayer: Action dispatch (Peer → Host) ========
  useEffect(() => {
    if (gameMode !== 'multiplayer') {
      actionDispatchRef.current = null;
      return;
    }

    if (!multiplayerState.isHost) {
      // Peer: send actions to host via PeerJS
      actionDispatchRef.current = (actionName, args) => {
        multiplayer.sendAction(actionName, { args });
      };
    } else {
      // Host: execute actions locally (no dispatch needed)
      actionDispatchRef.current = null;
    }

    return () => { actionDispatchRef.current = null; };
  }, [gameMode, multiplayerState.isHost, multiplayer, actionDispatchRef]);

  // ======== Multiplayer: Host receives actions from Peers ========
  useEffect(() => {
    if (gameMode !== 'multiplayer' || !multiplayerState.isHost) return;

    multiplayer.onActionRef.current = (actionName, payload) => {
      const registry = actionRegistryRef.current;
      const fn = registry[actionName];
      if (fn) {
        const args = payload?.args || [];
        fn(...args);
      } else {
        console.warn('Unknown remote action:', actionName);
      }
    };

    return () => { multiplayer.onActionRef.current = null; };
  }, [gameMode, multiplayerState.isHost, multiplayer]);

  // ======== Multiplayer: State broadcasting (Host) ========
  const prevSnapshotRef = useRef(null);

  useEffect(() => {
    if (gameMode !== 'multiplayer' || !multiplayerState.isHost) return;
    if (multiplayerState.connectionStatus !== 'connected') return;

    // Broadcast state to peers whenever game state changes
    const snapshot = getSnapshot();
    // Simple check: only broadcast if something changed (compare JSON)
    const json = JSON.stringify(snapshot);
    if (json !== prevSnapshotRef.current) {
      prevSnapshotRef.current = json;
      multiplayer.broadcastState(snapshot);
    }
  });

  // ======== Multiplayer: State receiving (Peer) ========
  useEffect(() => {
    if (gameMode !== 'multiplayer') return;

    if (!multiplayerState.isHost) {
      // Peer: receive state updates from host
      multiplayer.onStateUpdateRef.current = (state) => {
        applySnapshot(state);
      };
    }

    return () => {
      multiplayer.onStateUpdateRef.current = null;
    };
  }, [gameMode, multiplayerState.isHost, applySnapshot, multiplayer]);

  // ======== Multiplayer: Sync multiplayerState from hook ========
  const { setMultiplayerState } = useGame();

  useEffect(() => {
    if (gameMode !== 'multiplayer') return;
    setMultiplayerState(prev => ({
      ...prev,
      roomId: multiplayer.roomId,
      isHost: multiplayer.isHost,
      playerRole: multiplayer.playerRole,
      playerName: multiplayer.playerName,
      connectedPlayers: multiplayer.connectedPlayers,
      connectionStatus: multiplayer.connectionStatus,
    }));
  }, [
    gameMode, multiplayer.roomId, multiplayer.isHost, multiplayer.playerRole,
    multiplayer.playerName, multiplayer.connectedPlayers, multiplayer.connectionStatus,
    setMultiplayerState,
  ]);

  const gateEvaluation = evaluateGate();

  const reportData = {
    teamComposition, decisions, roleApprovals, projectData, wells, individualWells, budget, totalSpent, revenue, production,
    selectedSeismicPkg, selectedContractor, selectedDrillSite, appraisalStrategy, wellTestType, processingWorkflow,
    seismicObservations, riskAssessment, loanAssessment, dryHoleHistory, gameState,
    selectedFacilities, feedStudy,
    oilPrice, oilPriceHistory, financialHistory
  };

  if (showReport) {
    return <ProjectReport data={reportData} onClose={() => setShowReport(false)} onExport={exportSession} />;
  }

  const renderQuarterContent = () => {
    switch (currentQuarter.id) {
      case 'Q1_Y1':
        return <Q1Activities />;
      case 'Q2_Y1':
        return <Q2Activities />;
      case 'Q3_Y1':
        return <Q3Activities />;
      case 'Q4_Y1':
        return <Q4Activities />;
      case 'H1_Y2':
        return projectData.oilDiscovered ? <H1Y2Appraisal /> : null;
      case 'H2_Y2':
        return projectData.appraisalComplete ? <H2Y2Development /> : null;
      case 'H1_Y3':
        return projectData.developmentPlan ? <H1Y3Construction /> : null;
      case 'H2_Y3':
        return projectData.facilitiesComplete ? <H2Y3Startup /> : null;
      case 'PROD':
        return production.daily > 0 ? <ProductionPhase /> : null;
      default:
        return null;
    }
  };

  const isMultiplayer = gameMode === 'multiplayer';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Droplet size={40} className="text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Oil Exploration Simulator
            </h1>
          </div>
          <p className="text-slate-300">Phase-Gated Project Management | Quarterly Decision Points</p>
        </div>

        {/* Setup Phase */}
        {gameState === 'setup' && <SetupScreen multiplayer={multiplayer} />}

        {/* Game Interface */}
        {gameState === 'playing' && (
          <div className="space-y-6">
            {/* Multiplayer Player Bar */}
            {isMultiplayer && <PlayerBar />}

            <TimelineHeader />
            <StatusBar />

            {/* Decision Gate Modal */}
            {showDecisionGate && <DecisionGateModal gateEvaluation={gateEvaluation} />}

            {/* Quarter Activities */}
            {!showDecisionGate && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {renderQuarterContent()}
                </div>
                <Sidebar />
              </div>
            )}
          </div>
        )}

        {/* Dry Hole */}
        {gameState === 'dry_hole' && <DryHoleScreen />}

        {/* Game Ended */}
        {gameState === 'ended' && <ProjectEndedScreen />}
      </div>
    </div>
  );
};

const App = () => (
  <GameProvider>
    <OilExplorationSimulation />
  </GameProvider>
);

export default App;
