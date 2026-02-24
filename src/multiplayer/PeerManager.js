import Peer from 'peerjs';

const ROOM_PREFIX = 'oilsim-';
const HEARTBEAT_INTERVAL = 5000;
const HEARTBEAT_TIMEOUT = 15000;

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default class PeerManager {
  constructor() {
    this.peer = null;
    this.connections = new Map(); // peerId → DataConnection
    this.roomId = null;
    this.isHost = false;
    this.heartbeatTimers = new Map();

    // Callbacks
    this.onPlayerConnected = null;
    this.onPlayerDisconnected = null;
    this.onMessage = null;
    this.onError = null;
    this.onStatusChange = null;
  }

  _setStatus(status) {
    if (this.onStatusChange) this.onStatusChange(status);
  }

  _handleMessage(peerId, data) {
    if (data.type === '__heartbeat') {
      // Reset timeout for this peer
      this._resetHeartbeat(peerId);
      return;
    }
    if (this.onMessage) this.onMessage(peerId, data);
  }

  _setupConnection(conn) {
    const peerId = conn.peer;

    conn.on('open', () => {
      this.connections.set(peerId, conn);
      this._startHeartbeat(peerId);
      if (this.onPlayerConnected) this.onPlayerConnected(peerId);
    });

    conn.on('data', (data) => {
      this._handleMessage(peerId, data);
    });

    conn.on('close', () => {
      this._cleanupPeer(peerId);
    });

    conn.on('error', (err) => {
      console.warn(`Connection error with ${peerId}:`, err);
      this._cleanupPeer(peerId);
    });
  }

  _startHeartbeat(peerId) {
    // Send heartbeats periodically
    const sendInterval = setInterval(() => {
      const conn = this.connections.get(peerId);
      if (conn && conn.open) {
        conn.send({ type: '__heartbeat' });
      }
    }, HEARTBEAT_INTERVAL);

    // Detect timeout
    const timeout = setTimeout(() => {
      console.warn(`Heartbeat timeout for ${peerId}`);
      this._cleanupPeer(peerId);
    }, HEARTBEAT_TIMEOUT);

    this.heartbeatTimers.set(peerId, { sendInterval, timeout });
  }

  _resetHeartbeat(peerId) {
    const timers = this.heartbeatTimers.get(peerId);
    if (timers) {
      clearTimeout(timers.timeout);
      timers.timeout = setTimeout(() => {
        console.warn(`Heartbeat timeout for ${peerId}`);
        this._cleanupPeer(peerId);
      }, HEARTBEAT_TIMEOUT);
    }
  }

  _cleanupPeer(peerId) {
    const timers = this.heartbeatTimers.get(peerId);
    if (timers) {
      clearInterval(timers.sendInterval);
      clearTimeout(timers.timeout);
      this.heartbeatTimers.delete(peerId);
    }
    const conn = this.connections.get(peerId);
    if (conn) {
      try { conn.close(); } catch (e) { /* ignore */ }
      this.connections.delete(peerId);
    }
    if (this.onPlayerDisconnected) this.onPlayerDisconnected(peerId);
  }

  // HOST: Create a room and listen for connections
  createRoom() {
    return new Promise((resolve, reject) => {
      const roomCode = generateRoomCode();
      this.roomId = roomCode;
      this.isHost = true;
      const peerId = ROOM_PREFIX + roomCode;

      this._setStatus('connecting');

      this.peer = new Peer(peerId);

      this.peer.on('open', (id) => {
        this._setStatus('connected');
        resolve(roomCode);
      });

      this.peer.on('connection', (conn) => {
        this._setupConnection(conn);
      });

      this.peer.on('error', (err) => {
        if (err.type === 'unavailable-id') {
          // Room code collision — retry
          this.peer.destroy();
          this.createRoom().then(resolve).catch(reject);
          return;
        }
        this._setStatus('error');
        if (this.onError) this.onError(err);
        reject(err);
      });

      this.peer.on('disconnected', () => {
        // Try to reconnect to signaling server
        if (this.peer && !this.peer.destroyed) {
          this.peer.reconnect();
        }
      });
    });
  }

  // PEER: Join an existing room
  joinRoom(roomCode) {
    return new Promise((resolve, reject) => {
      this.roomId = roomCode;
      this.isHost = false;
      const hostPeerId = ROOM_PREFIX + roomCode;

      this._setStatus('connecting');

      this.peer = new Peer();

      this.peer.on('open', () => {
        const conn = this.peer.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
          this.connections.set(hostPeerId, conn);
          this._startHeartbeat(hostPeerId);
          this._setStatus('connected');
          resolve(this.peer.id);
        });

        conn.on('data', (data) => {
          this._handleMessage(hostPeerId, data);
        });

        conn.on('close', () => {
          this._cleanupPeer(hostPeerId);
          this._setStatus('disconnected');
        });

        conn.on('error', (err) => {
          this._setStatus('error');
          if (this.onError) this.onError(err);
          reject(err);
        });
      });

      this.peer.on('error', (err) => {
        this._setStatus('error');
        if (this.onError) this.onError(err);
        reject(err);
      });

      // Timeout if connection takes too long
      setTimeout(() => {
        if (this.connections.size === 0) {
          this._setStatus('error');
          reject(new Error('Connection timeout — room may not exist'));
        }
      }, 10000);
    });
  }

  // Send message to a specific peer
  send(peerId, data) {
    const conn = this.connections.get(peerId);
    if (conn && conn.open) {
      conn.send(data);
    }
  }

  // Host: broadcast to all connected peers
  broadcast(data) {
    for (const [, conn] of this.connections) {
      if (conn.open) {
        conn.send(data);
      }
    }
  }

  // Peer: send to host
  sendToHost(data) {
    if (this.isHost) return; // Host doesn't send to itself
    const hostPeerId = ROOM_PREFIX + this.roomId;
    this.send(hostPeerId, data);
  }

  // Disconnect a specific peer (kick)
  disconnectPeer(peerId) {
    this._cleanupPeer(peerId);
  }

  // Destroy everything
  destroy() {
    for (const [peerId] of this.connections) {
      this._cleanupPeer(peerId);
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    this.roomId = null;
    this.isHost = false;
    this._setStatus('disconnected');
  }

  getConnectedPeerIds() {
    return Array.from(this.connections.keys());
  }
}
