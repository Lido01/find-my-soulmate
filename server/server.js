// ─────────────────────────────────────────────────────────────────────────────
// server/server.js — Fast, lightweight WebSocket server & REST API for "Find My Soulmate"
// Handles persistent database storage, real-time developer matchmaking, social interactions.
// ─────────────────────────────────────────────────────────────────────────────

import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { db } from './db.js';

const PORT = process.env.PORT || 8080;

// Helper to send JSON responses with CORS
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// Helper to read JSON request body
function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10e6) { // 10MB limit for image attachments & photo uploads
        req.destroy();
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Create HTTP server with REST endpoints
const server = http.createServer(async (req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  // Health check
  if (url.pathname === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      onlineSockets: clients.size,
      registeredUsers: db.getUsers().length,
      time: new Date(),
    });
    return;
  }

  // ── REST: Get All Registered Users from Database ──────────────────────────
  if (req.method === 'GET' && url.pathname === '/api/users') {
    const users = db.getUsers();
    sendJson(res, 200, { ok: true, users });
    return;
  }

  // ── REST: Register / Save User in Database ────────────────────────────────
  if (req.method === 'POST' && url.pathname === '/api/register') {
    try {
      const body = await readJsonBody(req);
      const savedUser = db.saveUser(body);

      // Broadcast new registration to all live WebSocket peers
      broadcastToAll({
        type: 'community:new_user',
        user: savedUser,
        announcement: `🎉 Developer ${savedUser.name} (${savedUser.handle}) just joined the community!`,
      });

      broadcastOnlineUsers();
      sendJson(res, 200, { ok: true, user: savedUser });
    } catch (err) {
      console.error('[API] /api/register error:', err.message);
      sendJson(res, 400, { ok: false, error: err.message });
    }
    return;
  }

  // ── REST: Social Feed (Posts & Updates) ───────────────────────────────────
  if (req.method === 'GET' && url.pathname === '/api/social/feed') {
    const posts = db.getPosts();
    sendJson(res, 200, { ok: true, posts });
    return;
  }

  // ── REST: Post New Status / Feed Update ───────────────────────────────────
  if (req.method === 'POST' && url.pathname === '/api/social/post') {
    try {
      const body = await readJsonBody(req);
      const post = db.addPost(body);

      broadcastToAll({
        type: 'social:new_post',
        post,
      });

      sendJson(res, 200, { ok: true, post });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
    }
    return;
  }

  // ── REST: Social Actions (Wave, Like, Friend) ─────────────────────────────
  if (req.method === 'POST' && url.pathname === '/api/social/action') {
    try {
      const body = await readJsonBody(req);
      const { action, fromUser, targetUserId, metadata } = body;
      const targetUser = db.interact(action, fromUser, targetUserId);

      // Real-time broadcast of wave or like
      broadcastToAll({
        type: 'social:action',
        action,
        fromUser,
        targetUserId,
        metadata,
      });

      sendJson(res, 200, { ok: true, action, targetUser });
    } catch (err) {
      sendJson(res, 400, { ok: false, error: err.message });
    }
    return;
  }

  // Fallback
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Find My Soulmate WebSocket & REST API Server is running.');
});

// Create WebSocket server
const wss = new WebSocketServer({ server });

// State tracking
const clients = new Map(); // ws -> userData
const rooms = new Map();   // roomId -> Set of ws
const matchmakingQueues = {
  female: new Set(), // looking for female
  male: new Set(),   // looking for male
};

function broadcastToAll(payload) {
  const data = JSON.stringify(payload);
  for (const [ws] of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function broadcastOnlineUsers() {
  const dbUsers = db.getUsers();
  const connectedMap = new Map();

  for (const [, user] of clients) {
    if (user && user.id) {
      connectedMap.set(user.id, user);
    }
  }

  // Merge database users with active connection indicators
  const userList = dbUsers.map((u) => {
    const isLiveConnected = connectedMap.has(u.id);
    const liveUser = connectedMap.get(u.id);
    return {
      ...u,
      status: 'online',
      isLiveSocket: isLiveConnected,
      inChat: Boolean(liveUser?.roomId),
    };
  });

  const payload = JSON.stringify({
    type: 'presence:update',
    users: userList,
    count: userList.length,
  });

  for (const [ws] of clients) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  }
}

wss.on('connection', (ws) => {
  const clientId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  clients.set(ws, { id: clientId, status: 'online' });

  console.log(`[Soulmate-WS] 🔌 Client connected: ${clientId}`);

  // Send welcome ack
  ws.send(JSON.stringify({
    type: 'connected',
    clientId,
    serverTime: new Date().toISOString(),
  }));

  // Immediately send initial user presence
  broadcastOnlineUsers();

  // Handle messages from client
  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      handleClientMessage(ws, data);
    } catch (err) {
      console.error('[Soulmate-WS] Invalid JSON received:', err.message);
    }
  });

  // Handle client disconnect
  ws.on('close', () => {
    const user = clients.get(ws);
    console.log(`[Soulmate-WS] ❌ Client disconnected: ${user?.handle || user?.id || clientId}`);

    if (user?.roomId) {
      leaveRoom(ws, user.roomId);
    }

    matchmakingQueues.female.delete(ws);
    matchmakingQueues.male.delete(ws);

    clients.delete(ws);
    broadcastOnlineUsers();
  });
});

function handleClientMessage(ws, msg) {
  const user = clients.get(ws);

  switch (msg.type) {
    // ── 1. Register/Update Profile & Save to Database ────────────────────────
    case 'profile:register': {
      const profile = msg.profile || {};
      const savedUser = db.saveUser({
        ...profile,
        id: profile.id || user.id,
      });

      // Update socket metadata
      Object.assign(user, savedUser);
      clients.set(ws, user);

      console.log(`[Soulmate-WS] 👤 Profile registered: ${user.name} (${user.handle}) in Database`);

      ws.send(JSON.stringify({ type: 'profile:ack', profile: user }));
      broadcastOnlineUsers();

      // Announce new presence
      broadcastToAll({
        type: 'community:toast',
        message: `${user.name} is active in the developer lobby!`,
        user,
      });
      break;
    }

    // ── 2. Instant Matchmaking ──────────────────────────────────────────────
    case 'match:find': {
      const targetGender = msg.lookingFor || user.lookingFor || 'female';
      console.log(`[Soulmate-WS] ⚡ Matchmaking request from ${user.handle} looking for ${targetGender}`);

      const candidateQueue = matchmakingQueues[targetGender] || new Set();
      let matchedPeerWs = null;

      for (const peerWs of candidateQueue) {
        const peer = clients.get(peerWs);
        if (peerWs !== ws && peer && !peer.roomId) {
          if (peer.lookingFor === user.gender || peer.lookingFor === 'all') {
            matchedPeerWs = peerWs;
            break;
          }
        }
      }

      if (matchedPeerWs) {
        candidateQueue.delete(matchedPeerWs);
        const peer = clients.get(matchedPeerWs);

        const roomId = `room_${Date.now()}`;
        rooms.set(roomId, new Set([ws, matchedPeerWs]));

        user.roomId = roomId;
        peer.roomId = roomId;

        const matchPayloadForUser = {
          type: 'match:success',
          roomId,
          peer: {
            id: peer.id,
            name: peer.name,
            handle: peer.handle,
            gender: peer.gender,
            bio: peer.bio,
            techStack: peer.techStack,
            emoji: peer.emoji,
            avatarUrl: peer.avatarUrl || null,
            quote: peer.quote || '',
            indentation: peer.indentation,
            drink: peer.drink,
            location: peer.location,
          },
        };

        const matchPayloadForPeer = {
          type: 'match:success',
          roomId,
          peer: {
            id: user.id,
            name: user.name,
            handle: user.handle,
            gender: user.gender,
            bio: user.bio,
            techStack: user.techStack,
            emoji: user.emoji,
            avatarUrl: user.avatarUrl || null,
            quote: user.quote || '',
            indentation: user.indentation,
            drink: user.drink,
            location: user.location,
          },
        };

        ws.send(JSON.stringify(matchPayloadForUser));
        matchedPeerWs.send(JSON.stringify(matchPayloadForPeer));

        console.log(`[Soulmate-WS] 💖 Match made! ${user.handle} <-> ${peer.handle} in ${roomId}`);
        broadcastOnlineUsers();
      } else {
        const targetQueue = matchmakingQueues[user.gender] || new Set();
        targetQueue.add(ws);
        matchmakingQueues[user.gender] = targetQueue;
        ws.send(JSON.stringify({ type: 'match:waiting', message: 'Looking for an online match...' }));
      }
      break;
    }

    // ── 3. Direct Invitation / Join Room ────────────────────────────────────
    case 'room:invite': {
      const targetUserId = msg.targetUserId;
      let targetWs = null;
      for (const [otherWs, otherUser] of clients) {
        if (otherUser.id === targetUserId) {
          targetWs = otherWs;
          break;
        }
      }

      // If target is live connected
      if (targetWs && targetWs.readyState === WebSocket.OPEN) {
        const roomId = `room_${Date.now()}`;
        rooms.set(roomId, new Set([ws, targetWs]));
        user.roomId = roomId;
        const targetUser = clients.get(targetWs);
        targetUser.roomId = roomId;

        ws.send(JSON.stringify({
          type: 'room:joined',
          roomId,
          peer: targetUser,
        }));

        targetWs.send(JSON.stringify({
          type: 'room:invited',
          roomId,
          inviter: user,
        }));

        broadcastOnlineUsers();
      } else {
        // Target is in database, launch simulated room with database profile
        const targetDbUser = db.getUserById(targetUserId);
        if (targetDbUser) {
          const roomId = `sim_room_${Date.now()}`;
          user.roomId = roomId;
          ws.send(JSON.stringify({
            type: 'room:joined',
            roomId,
            peer: targetDbUser,
          }));
        }
      }
      break;
    }

    // ── 4. Chat Message in Room ─────────────────────────────────────────────
    case 'chat:send': {
      const roomId = msg.roomId || user.roomId;
      if (!roomId) return;

      const messagePayload = JSON.stringify({
        type: 'chat:message',
        message: {
          id: msg.message?.id || `msg_${Date.now()}`,
          senderId: user.id,
          senderName: user.name,
          senderHandle: user.handle,
          senderEmoji: user.emoji,
          senderAvatarUrl: user.avatarUrl || msg.message?.senderAvatarUrl || null,
          text: msg.message?.text || '',
          timestamp: new Date().toISOString(),
          isAudio: Boolean(msg.message?.isAudio),
          audioDuration: msg.message?.audioDuration || null,
          isGift: Boolean(msg.message?.isGift),
          gift: msg.message?.gift || null,
          isImage: Boolean(msg.message?.isImage),
          imageUrl: msg.message?.imageUrl || null,
          isCode: Boolean(msg.message?.isCode),
          codeLang: msg.message?.codeLang || null,
        },
      });

      const roomMembers = rooms.get(roomId);
      if (roomMembers) {
        for (const memberWs of roomMembers) {
          if (memberWs.readyState === WebSocket.OPEN) {
            memberWs.send(messagePayload);
          }
        }
      } else {
        // Echo to self for simulated rooms
        ws.send(messagePayload);
      }
      break;
    }

    // ── 5. Typing Indicators ────────────────────────────────────────────────
    case 'chat:typing': {
      const roomId = msg.roomId || user.roomId;
      if (!roomId || !rooms.has(roomId)) return;

      const roomMembers = rooms.get(roomId);
      const typingPayload = JSON.stringify({
        type: 'chat:typing',
        senderId: user.id,
        isTyping: Boolean(msg.isTyping),
      });

      for (const memberWs of roomMembers) {
        if (memberWs !== ws && memberWs.readyState === WebSocket.OPEN) {
          memberWs.send(typingPayload);
        }
      }
      break;
    }

    // ── 6. Social Action (Wave, Like, Coffee) ──────────────────────────────
    case 'social:interact': {
      const { action, targetUserId } = msg;
      const targetUser = db.interact(action, user, targetUserId);

      broadcastToAll({
        type: 'social:action',
        action,
        fromUser: {
          id: user.id,
          name: user.name,
          handle: user.handle,
          emoji: user.emoji,
        },
        targetUserId,
      });
      break;
    }

    // ── 7. Leave Room ───────────────────────────────────────────────────────
    case 'room:leave': {
      const roomId = msg.roomId || user.roomId;
      if (roomId) {
        leaveRoom(ws, roomId);
        broadcastOnlineUsers();
      }
      break;
    }
  }
}

function leaveRoom(ws, roomId) {
  const roomMembers = rooms.get(roomId);
  if (!roomMembers) return;

  roomMembers.delete(ws);
  const user = clients.get(ws);
  if (user) user.roomId = null;

  const leavePayload = JSON.stringify({
    type: 'room:peer_left',
    userId: user?.id,
  });

  for (const memberWs of roomMembers) {
    if (memberWs.readyState === WebSocket.OPEN) {
      memberWs.send(leavePayload);
      const member = clients.get(memberWs);
      if (member) member.roomId = null;
    }
  }

  rooms.delete(roomId);
}

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║   🚀 Find My Soulmate — WebSocket Server & REST API Live       ║
║   Listening on ws://localhost:${PORT}                           ║
║   Database: server/data/users.json (${db.getUsers().length} devs)            ║
║   Health check: http://localhost:${PORT}/health                ║
╚════════════════════════════════════════════════════════════════╝
  `);
});
