import { useState, useCallback, useRef, useEffect } from 'react';
import PeerManager from '../multiplayer/PeerManager';

export const useMultiplayer = () => {
  const peerRef = useRef(null);
  const [roomId, setRoomId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [peerId, setPeerId] = useState(null);
  const [playerRole, setPlayerRole] = useState(null); // roleId or 'admin'
  const [playerName, setPlayerName] = useState('');
  const [connectedPlayers, setConnectedPlayers] = useState([]); // [{ peerId, name, role, connected }]
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Callbacks set by GameContext
  const onActionRef = useRef(null);       // Host: handle incoming action from peer
  const onStateUpdateRef = useRef(null);  // Peer: handle state update from host
  const onPlayersChangeRef = useRef(null); // Both: lobby player list changed

  const getPeer = () => {
    if (!peerRef.current) {
      peerRef.current = new PeerManager();

      peerRef.current.onStatusChange = (status) => {
        setConnectionStatus(status);
      };

      peerRef.current.onError = (err) => {
        console.error('PeerManager error:', err);
      };
    }
    return peerRef.current;
  };

  // HOST: Create room
  const createRoom = useCallback(async (hostName, hostRole) => {
    const pm = getPeer();

    pm.onPlayerConnected = (newPeerId) => {
      // New peer connected — send them current player list
      setConnectedPlayers(prev => {
        const updated = [...prev, { peerId: newPeerId, name: '', role: null, connected: true }];
        // Send player list to all peers
        setTimeout(() => {
          pm.broadcast({ type: 'players_update', players: updated });
        }, 100);
        return updated;
      });
    };

    pm.onPlayerDisconnected = (disconnectedPeerId) => {
      setConnectedPlayers(prev => {
        const updated = prev.map(p =>
          p.peerId === disconnectedPeerId ? { ...p, connected: false } : p
        );
        pm.broadcast({ type: 'players_update', players: updated });
        if (onPlayersChangeRef.current) onPlayersChangeRef.current(updated);
        return updated;
      });
    };

    pm.onMessage = (fromPeerId, data) => {
      switch (data.type) {
        case 'join_request': {
          // Peer wants to join with name
          setConnectedPlayers(prev => {
            const updated = prev.map(p =>
              p.peerId === fromPeerId ? { ...p, name: data.name, role: null } : p
            );
            pm.broadcast({ type: 'players_update', players: updated });
            if (onPlayersChangeRef.current) onPlayersChangeRef.current(updated);
            return updated;
          });
          break;
        }
        case 'role_select': {
          // Peer selected a role
          setConnectedPlayers(prev => {
            const updated = prev.map(p =>
              p.peerId === fromPeerId ? { ...p, role: data.role } : p
            );
            pm.broadcast({ type: 'players_update', players: updated });
            if (onPlayersChangeRef.current) onPlayersChangeRef.current(updated);
            return updated;
          });
          break;
        }
        case 'game_action': {
          // Peer wants to execute a game action
          if (onActionRef.current) {
            onActionRef.current(data.action, data.payload, fromPeerId);
          }
          break;
        }
        default:
          break;
      }
    };

    const code = await pm.createRoom();
    setRoomId(code);
    setIsHost(true);
    setPeerId(pm.peer.id);
    setPlayerRole(hostRole || 'admin');
    setPlayerName(hostName || 'Host');

    // Add host to player list
    const hostPlayer = { peerId: 'host', name: hostName || 'Host', role: hostRole || 'admin', connected: true };
    setConnectedPlayers([hostPlayer]);

    return code;
  }, []);

  // PEER: Join room
  const joinRoom = useCallback(async (roomCode, name) => {
    const pm = getPeer();

    pm.onMessage = (fromPeerId, data) => {
      switch (data.type) {
        case 'players_update': {
          setConnectedPlayers(data.players);
          if (onPlayersChangeRef.current) onPlayersChangeRef.current(data.players);
          break;
        }
        case 'state_update': {
          if (onStateUpdateRef.current) {
            onStateUpdateRef.current(data.state);
          }
          break;
        }
        case 'game_started': {
          if (onStateUpdateRef.current) {
            onStateUpdateRef.current(data.state);
          }
          break;
        }
        default:
          break;
      }
    };

    pm.onPlayerDisconnected = () => {
      setConnectionStatus('disconnected');
    };

    const id = await pm.joinRoom(roomCode);
    setRoomId(roomCode);
    setIsHost(false);
    setPeerId(id);
    setPlayerName(name);

    // Tell host our name
    pm.sendToHost({ type: 'join_request', name });

    return id;
  }, []);

  // PEER: Select role
  const selectRole = useCallback((roleId) => {
    setPlayerRole(roleId);
    const pm = peerRef.current;
    if (pm && !pm.isHost) {
      pm.sendToHost({ type: 'role_select', role: roleId });
    } else if (pm && pm.isHost) {
      // Host changing their own role
      setConnectedPlayers(prev => {
        const updated = prev.map(p =>
          p.peerId === 'host' ? { ...p, role: roleId } : p
        );
        pm.broadcast({ type: 'players_update', players: updated });
        return updated;
      });
    }
  }, []);

  // HOST: Send action (peer sends to host)
  const sendAction = useCallback((actionName, payload = {}) => {
    const pm = peerRef.current;
    if (!pm) return;

    if (isHost) {
      // Host executes locally
      if (onActionRef.current) {
        onActionRef.current(actionName, payload, 'host');
      }
    } else {
      // Peer sends to host
      pm.sendToHost({ type: 'game_action', action: actionName, payload });
    }
  }, [isHost]);

  // HOST: Broadcast state to all peers
  const broadcastState = useCallback((state) => {
    const pm = peerRef.current;
    if (pm && isHost) {
      pm.broadcast({ type: 'state_update', state });
    }
  }, [isHost]);

  // HOST: Start multiplayer game (notify all peers)
  const startMultiplayerGame = useCallback((initialState) => {
    const pm = peerRef.current;
    if (pm && isHost) {
      pm.broadcast({ type: 'game_started', state: initialState });
    }
  }, [isHost]);

  // HOST: Kick player
  const kickPlayer = useCallback((targetPeerId) => {
    const pm = peerRef.current;
    if (pm && isHost) {
      pm.disconnectPeer(targetPeerId);
      setConnectedPlayers(prev => {
        const updated = prev.filter(p => p.peerId !== targetPeerId);
        pm.broadcast({ type: 'players_update', players: updated });
        return updated;
      });
    }
  }, [isHost]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setRoomId(null);
    setIsHost(false);
    setPeerId(null);
    setPlayerRole(null);
    setConnectedPlayers([]);
    setConnectionStatus('disconnected');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, []);

  return {
    // State
    roomId,
    isHost,
    peerId,
    playerRole,
    playerName,
    setPlayerName,
    connectedPlayers,
    connectionStatus,

    // Actions
    createRoom,
    joinRoom,
    selectRole,
    sendAction,
    broadcastState,
    startMultiplayerGame,
    kickPlayer,
    disconnect,

    // Callback refs (set by GameContext)
    onActionRef,
    onStateUpdateRef,
    onPlayersChangeRef,
  };
};
