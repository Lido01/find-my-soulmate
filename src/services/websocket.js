// ─────────────────────────────────────────────────────────────────────────────
// websocket.js — Robust WebSocket & Supabase Client Manager for Live Developer Dating Chat
// Handles live connection, auto-reconnect, and intelligent peer matchmaking.
// Seamlessly routes to Supabase in Production/Vercel or WebSocket server in Local.
// ─────────────────────────────────────────────────────────────────────────────

import {
  isSupabaseConfigured,
  supabase,
  sbSaveUser,
  sbFetchUsers,
  sbLoginWithLoveCode,
  sbFetchMessages,
  sbSendMessage,
  sbMarkMessagesSeen,
  sbFetchNotifications,
  sbAddNotification,
  sbMarkNotificationsRead,
  sbRespondFriendRequest,
  sbFetchPosts,
  sbAddPost,
  sbInteract,
  mapMessageFromDb,
  mapNotificationFromDb,
  mapUserFromDb,
} from './supabase.js';

// Simulated realistic online developers (shown if offline or fallback)
const SIMULATED_ONLINE_DEVS = [
  {
    id: 'user_meron',
    name: 'Meron Tadesse',
    handle: '@meron_dev',
    gender: 'female',
    lookingFor: 'male',
    location: 'Addis Ababa 🇪🇹',
    techStack: ['Next.js', 'React', 'Tailwind', 'GraphQL'],
    bio: 'Late night frontend builder. Addicted to pour-over coffee and clean component design.',
    emoji: '👩‍💻',
    status: 'online',
    initialMood: 'curious',
  },
  {
    id: 'user_hanna',
    name: 'Hanna Lind',
    handle: '@hanna_codes',
    gender: 'female',
    lookingFor: 'male',
    location: 'Stockholm 🇸🇪',
    techStack: ['TypeScript', 'Vue 3', 'Node.js'],
    bio: 'Building indie SaaS by day, hunting CSS bugs by night. Looking for a genuine dev partner.',
    emoji: '👩‍💻',
    status: 'online',
    initialMood: 'smitten',
  },
  {
    id: 'user_selam',
    name: 'Selamawit Alemayehu',
    handle: '@selam_ai',
    gender: 'female',
    lookingFor: 'male',
    location: 'Nairobi 🇰🇪',
    techStack: ['Python', 'FastAPI', 'PyTorch'],
    bio: 'Training vision models and looking for someone who loves deep talks over bunna.',
    emoji: '👩‍💻',
    status: 'online',
    initialMood: 'caffeinated',
  },
  {
    id: 'user_yonas',
    name: 'Yonas Bekele',
    handle: '@yonas_rust',
    gender: 'male',
    lookingFor: 'female',
    location: 'Addis Ababa 🇪🇹',
    techStack: ['Rust', 'WebAssembly', 'Linux'],
    bio: 'Zero memory leaks, 100% devotion. Looking for a smart dev girl to share late night commits with.',
    emoji: '👨‍💻',
    status: 'online',
    initialMood: 'smitten',
  },
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    handle: '@alex_fullstack',
    gender: 'male',
    lookingFor: 'female',
    location: 'Austin 🇺🇸',
    techStack: ['React', 'Go', 'Docker'],
    bio: 'Mechanical keyboard enthusiast. I make great breakfast burritos and clean git trees.',
    emoji: '👨‍💻',
    status: 'online',
    initialMood: 'curious',
  },
  {
    id: 'user_kenean',
    name: 'Kenean Mengistu',
    handle: '@kenean_arch',
    gender: 'male',
    lookingFor: 'female',
    location: 'London 🇬🇧',
    techStack: ['Elixir', 'Distributed Systems', 'Tailwind'],
    bio: 'Aesthetic enthusiast. I believe in romantic code comments and spontaneous coffee dates.',
    emoji: '👨‍💻',
    status: 'online',
    initialMood: 'caffeinated',
  },
];

function isLocalEnvironment() {
  if (typeof window === 'undefined') return true;
  const h = window.location.hostname || '';
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.startsWith('10.') || h.endsWith('.local');
}

function getApiBase() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    if (isLocalEnvironment()) {
      return `http://${window.location.hostname}:8080`;
    }
  }
  return 'http://localhost:8080';
}

function getWsBase() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    if (isLocalEnvironment()) {
      return `ws://${window.location.hostname}:8080`;
    }
  }
  return 'ws://localhost:8080';
}

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.sbChannel = null;
    this.connected = false;
    this.isSimulated = false;
    this.listeners = new Map();
    this.currentRoomId = null;
    this.currentPeer = null;
    this.currentUser = null;
    this.reconnectTimer = null;
    this.serverUrl = getWsBase();
    this.simulatedPeers = [...SIMULATED_ONLINE_DEVS];
  }

  // ── Event Emitter ─────────────────────────────────────────────────────────
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const callback of this.listeners.get(event)) {
        try { callback(data); } catch (e) { console.error(e); }
      }
    }
  }

  // ── Connect ───────────────────────────────────────────────────────────────
  connect(url = null) {
    if (url) this.serverUrl = url;

    // Supabase Mode (Production / Vercel Serverless)
    if (isSupabaseConfigured() && supabase) {
      this.connected = true;
      this.isSimulated = false;
      this.emit('connection:status', { status: 'connected', isSimulated: false, provider: 'supabase' });
      console.log('[WS-Client] ⚡ Connected via Supabase Realtime.');

      if (!this.sbChannel) {
        this.sbChannel = supabase
          .channel('soulmate-global')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
            const msg = mapMessageFromDb(payload.new);
            if (msg && msg.senderId !== this.currentUser?.id) {
              this.emit('chat:message', msg);
            }
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, (payload) => {
            const msg = mapMessageFromDb(payload.new);
            if (msg && msg.status === 'seen') {
              this.emit('chat:seen', { messageIds: [msg.id] });
            }
          })
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
            const notif = mapNotificationFromDb(payload.new);
            if (notif && (!this.currentUser || notif.targetUserId === this.currentUser.id)) {
              this.emit('notification:new', notif);
            }
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
            const user = mapUserFromDb(payload.new);
            if (user) {
              this.emit('presence:update', { users: [user] });
            }
          })
          .on('broadcast', { event: 'chat:typing' }, ({ payload }) => {
            if (payload.senderId !== this.currentUser?.id) {
              this.emit('chat:typing', payload);
            }
          })
          .on('broadcast', { event: 'chat:message' }, ({ payload }) => {
            if (payload.senderId !== this.currentUser?.id) {
              this.emit('chat:message', payload);
            }
          })
          .subscribe();
      }

      // Initial presence broadcast from Supabase (with fallback to default seed developers)
      sbFetchUsers().then((users) => {
        if (users && users.length > 0) {
          this.emit('presence:update', { users, count: users.length });
        } else {
          this.emit('presence:update', { users: this.simulatedPeers, count: this.simulatedPeers.length });
        }
      }).catch(() => {
        this.emit('presence:update', { users: this.simulatedPeers, count: this.simulatedPeers.length });
      });
      return;
    }

    // If on a remote host (e.g. Vercel) without Supabase, fall back to simulation immediately
    if (!isLocalEnvironment() && !isSupabaseConfigured()) {
      console.log('[WS-Client] 🌐 Production hosting detected without Supabase keys. Using simulated live peers.');
      this.fallbackToSimulation();
      return;
    }

    // Close existing connection if any
    if (this.ws) {
      try { this.ws.close(); } catch {}
    }

    this.emit('connection:status', { status: 'connecting', url: this.serverUrl });

    try {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        this.connected = true;
        this.isSimulated = false;
        console.log('[WS-Client] 🟢 Connected to WebSocket server:', this.serverUrl);
        this.emit('connection:status', { status: 'connected', isSimulated: false });

        // Auto-register if user profile is already saved
        if (this.currentUser) {
          this.registerProfile(this.currentUser);
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (e) {
          console.error('[WS-Client] Message parse error:', e);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WS-Client] WebSocket server unreachable, falling back to simulated live peers.');
        this.fallbackToSimulation();
      };

      this.ws.onclose = () => {
        if (!this.isSimulated) {
          this.connected = false;
          this.emit('connection:status', { status: 'disconnected' });
        }
      };
    } catch (err) {
      this.fallbackToSimulation();
    }
  }

  // ── Clean Disconnect & Session Reset ───────────────────────────────────────
  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.sbChannel) {
      try { this.sbChannel.unsubscribe(); } catch {}
      this.sbChannel = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
    this.connected = false;
    this.currentUser = null;
    this.currentPeer = null;
    this.currentRoomId = null;
    this.emit('connection:status', { status: 'disconnected', isSimulated: false });
    console.log('[WS-Client] 🔌 Disconnected cleanly from server and wiped session.');
  }

  // Fallback to local simulated peer network if server is not running
  fallbackToSimulation() {
    this.isSimulated = true;
    this.connected = true;
    this.emit('connection:status', { status: 'connected', isSimulated: true });
    
    // Broadcast simulated users
    setTimeout(() => {
      this.emit('presence:update', {
        users: this.simulatedPeers,
        count: this.simulatedPeers.length,
      });
    }, 300);
  }

  // ── Message handling from server ──────────────────────────────────────────
  handleServerMessage(msg) {
    switch (msg.type) {
      case 'presence:update':
        this.emit('presence:update', msg);
        break;

      case 'match:waiting':
        this.emit('match:waiting', msg);
        break;

      case 'match:success':
      case 'room:joined':
        this.currentRoomId = msg.roomId;
        this.currentPeer = msg.peer;
        this.emit('room:entered', { roomId: msg.roomId, peer: msg.peer });
        break;

      case 'room:invited':
        this.currentRoomId = msg.roomId;
        // Do NOT force screen redirect on recipient; notify them politely
        this.emit('chat:incoming_invite', { roomId: msg.roomId, peer: msg.inviter, inviter: msg.inviter });
        break;

      case 'chat:message':
        this.emit('chat:message', msg.message);
        break;

      case 'chat:typing':
        this.emit('chat:typing', msg);
        break;

      case 'community:new_user':
      case 'community:toast':
        this.emit('community:announcement', msg);
        break;

      case 'social:action':
        this.emit('social:action', msg);
        break;

      case 'social:new_post':
        this.emit('social:new_post', msg.post);
        break;

      case 'chat:history':
        this.emit('chat:history', msg);
        break;

      case 'chat:seen':
        this.emit('chat:seen', msg);
        break;

      case 'notification:new':
        this.emit('notification:new', msg.notification);
        break;

      case 'room:peer_left':
        this.emit('room:peer_left', msg);
        this.currentRoomId = null;
        this.currentPeer = null;
        break;
    }
  }

  // ── Client Actions ────────────────────────────────────────────────────────

  registerProfile(profile) {
    this.currentUser = profile;
    if (isSupabaseConfigured()) {
      sbSaveUser(profile).catch((err) => console.warn('[Supabase] Profile sync warning:', err.message));
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'profile:register',
        profile,
      }));
    } else if (this.isSimulated) {
      this.emit('presence:update', {
        users: this.simulatedPeers,
        count: this.simulatedPeers.length,
      });
    }
  }

  findMatch(lookingFor = 'female') {
    if (isSupabaseConfigured()) {
      this.emit('match:waiting', { message: 'Scanning developer frequencies in Supabase...' });
      sbFetchUsers().then((users) => {
        const pool = (users || []).filter((u) => u.id !== this.currentUser?.id);
        const candidates = pool.filter((p) => p.gender === lookingFor || lookingFor === 'any');
        const match = candidates[Math.floor(Math.random() * candidates.length)] || pool[0] || this.simulatedPeers[0];
        this.currentRoomId = `room_${[this.currentUser?.id || 'me', match.id].sort().join('___')}`;
        this.currentPeer = match;
        this.emit('room:entered', { roomId: this.currentRoomId, peer: match });
      });
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isSimulated) {
      this.ws.send(JSON.stringify({
        type: 'match:find',
        lookingFor,
      }));
    } else {
      // Simulated auto-matching
      this.emit('match:waiting', { message: 'Scanning online developer frequency...' });
      setTimeout(() => {
        const candidates = this.simulatedPeers.filter((p) => p.gender === lookingFor);
        const match = candidates[Math.floor(Math.random() * candidates.length)] || this.simulatedPeers[0];
        
        this.currentRoomId = `sim_room_${Date.now()}`;
        this.currentPeer = match;
        this.emit('room:entered', { roomId: this.currentRoomId, peer: match });
      }, 1400);
    }
  }

  startDirectChat(peer) {
    this.currentPeer = peer;
    const sortedIds = [this.currentUser?.id || 'me', peer.id].sort();
    this.currentRoomId = `room_${sortedIds.join('___')}`;
    this.emit('room:entered', { roomId: this.currentRoomId, peer });
  }

  async sendMessage(text, options = {}) {
    const msgId = options.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const msgPayload = {
      id: msgId,
      senderId: this.currentUser?.id || 'me',
      senderName: this.currentUser?.name || 'Me',
      senderHandle: this.currentUser?.handle || '@me',
      senderEmoji: this.currentUser?.emoji || '🧑‍💻',
      senderAvatarUrl: this.currentUser?.avatarUrl || null,
      targetUserId: options.targetUserId || this.currentPeer?.id || null,
      text: (text || '').trim(),
      timestamp: options.timestamp || new Date().toISOString(),
      replyTo: options.replyTo || null,
      isAudio: Boolean(options.isAudio),
      audioUrl: options.audioUrl || null,
      audioDuration: options.audioDuration || null,
      isGift: Boolean(options.isGift),
      gift: options.gift || null,
      isImage: Boolean(options.isImage),
      imageUrl: options.imageUrl || null,
      isCode: Boolean(options.isCode),
      codeLang: options.codeLang || null,
      status: 'sending',
    };

    // 1. Emit locally as sending so UI renders pending status
    this.emit('chat:message', msgPayload);

    if (isSupabaseConfigured()) {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          throw new Error('Network connection is offline');
        }

        // Send & Persist in Supabase Postgres
        await sbSendMessage({
          ...msgPayload,
          imageData: options.imageUrl,
          voiceData: options.audioUrl,
          codeSnippet: options.isCode ? text : null,
          codeLanguage: options.codeLang || null,
          recipientId: msgPayload.targetUserId,
        });

        // 2. Broadcast live to peer over Supabase channel
        this.sbChannel?.send({
          type: 'broadcast',
          event: 'chat:message',
          payload: { ...msgPayload, status: 'sent' },
        });

        this.emit('chat:status', { messageId: msgId, status: 'sent' });
        return { ok: true, message: { ...msgPayload, status: 'sent' } };
      } catch (e) {
        console.warn('[Supabase] Send failed:', e.message);
        this.emit('chat:status', { messageId: msgId, status: 'failed', error: e.message });
        return { ok: false, error: e.message, message: { ...msgPayload, status: 'failed' } };
      }
    }

    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isSimulated) {
      try {
        this.ws.send(JSON.stringify({
          type: 'chat:send',
          roomId: this.currentRoomId,
          targetUserId: msgPayload.targetUserId,
          message: { ...msgPayload, status: 'sent' },
        }));
        this.emit('chat:status', { messageId: msgId, status: 'sent' });
        return { ok: true, message: { ...msgPayload, status: 'sent' } };
      } catch (err) {
        this.emit('chat:status', { messageId: msgId, status: 'failed', error: err.message });
        return { ok: false, error: err.message, message: { ...msgPayload, status: 'failed' } };
      }
    } else {
      if (this.isSimulated) {
        this.emit('chat:status', { messageId: msgId, status: 'sent' });
        this.triggerSimulatedReply(text, options);
        return { ok: true, message: { ...msgPayload, status: 'sent' } };
      } else {
        this.emit('chat:status', { messageId: msgId, status: 'failed', error: 'No active connection' });
        return { ok: false, error: 'No active connection', message: { ...msgPayload, status: 'failed' } };
      }
    }
  }

  sendSeen(peerId, messageIds = []) {
    if (isSupabaseConfigured()) {
      sbMarkMessagesSeen(this.currentUser?.id, peerId, messageIds).catch(() => {});
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isSimulated) {
      this.ws.send(JSON.stringify({
        type: 'chat:seen',
        peerId,
        messageIds,
      }));
    }
  }

  async fetchMessages(user1, user2) {
    if (isSupabaseConfigured()) {
      return await sbFetchMessages(user1, user2);
    }
    try {
      const res = await fetch(`${getApiBase()}/api/chat/messages?user1=${encodeURIComponent(user1)}&user2=${encodeURIComponent(user2)}`);
      if (res.ok) {
        const data = await res.json();
        return data.messages || [];
      }
    } catch {}
    return [];
  }

  async fetchNotifications(userId) {
    if (isSupabaseConfigured()) {
      return await sbFetchNotifications(userId);
    }
    try {
      const res = await fetch(`${getApiBase()}/api/notifications?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.notifications || [];
      }
    } catch {}
    return [];
  }

  async respondToFriendRequest(notificationId, action, userId) {
    if (isSupabaseConfigured()) {
      return await sbRespondFriendRequest(notificationId, action, userId);
    }
    try {
      const res = await fetch(`${getApiBase()}/api/notifications/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId, action, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        return data.notification;
      }
    } catch {}
    return null;
  }

  async markNotificationsRead(userId) {
    if (isSupabaseConfigured()) {
      await sbMarkNotificationsRead(userId);
      return;
    }
    try {
      await fetch(`${getApiBase()}/api/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch {}
  }

  async loginWithLoveCode(loveCode) {
    if (isSupabaseConfigured()) {
      const user = await sbLoginWithLoveCode(loveCode);
      if (user) {
        this.currentUser = user;
        return { ok: true, success: true, user };
      }
      return { ok: false, success: false, error: 'Love Code not found in database' };
    }
    try {
      const res = await fetch(`${getApiBase()}/api/auth/login-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loveCode }),
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { ok: false, error: err.message || 'Connection error' };
    }
  }

  sendTyping(isTyping) {
    if (isSupabaseConfigured() && this.sbChannel) {
      this.sbChannel.send({
        type: 'broadcast',
        event: 'chat:typing',
        payload: {
          senderId: this.currentUser?.id,
          isTyping,
        },
      });
      return;
    }
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isSimulated) {
      this.ws.send(JSON.stringify({
        type: 'chat:typing',
        roomId: this.currentRoomId,
        isTyping,
      }));
    }
  }

  leaveRoom() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isSimulated) {
      this.ws.send(JSON.stringify({
        type: 'room:leave',
        roomId: this.currentRoomId,
      }));
    }
    this.currentRoomId = null;
    this.currentPeer = null;
    this.emit('room:left');
  }

  triggerSimulatedReply(playerText, options = {}) {
    if (!this.currentPeer) return;

    // Simulate typing after 800ms
    setTimeout(() => {
      this.emit('chat:typing', { senderId: this.currentPeer.id, isTyping: true });
    }, 600);

    // Reply after 2000ms
    setTimeout(() => {
      this.emit('chat:typing', { senderId: this.currentPeer.id, isTyping: false });

      const peer = this.currentPeer;
      let replyText = "";
      const lower = playerText.toLowerCase();

      if (options.isImage) {
        replyText = `Whoa, love the photo! 📸 Look at that clarity. Saving this to my favorites! ❤️`;
      } else if (options.isCode) {
        replyText = `That's clean code! 🔥 Zero memory leaks, pristine logic. Truly a 10x soulmate move.`;
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('ሰላም')) {
        replyText = `Hey ${this.currentUser?.name || 'there'}! 👋 Loved seeing your profile pop up. What are you coding tonight?`;
      } else if (lower.includes('love') || lower.includes('cute') || lower.includes('ቆንጆ') || lower.includes('ፍቅር')) {
        replyText = `Aww, you're so sweet! 🥺❤️ My heart just dropped zero packets. Let's finish this sprint together!`;
      } else if (lower.includes('coffee') || lower.includes('tea') || lower.includes('ቡና')) {
        replyText = `Coffee is the only valid love language! ☕ In ${peer.location || 'town'}, the brew hits just right.`;
      } else {
        const pool = [
          `That's awesome! I'm actually wrapping up a pull request right now. You have really good energy ✨`,
          `Haha completely agree! It's so refreshing chatting with a fellow dev who actually gets the tech life 💻❤️`,
          `Tell me more! By the way, your avatar emoji is adorable 😊`,
        ];
        replyText = pool[Math.floor(Math.random() * pool.length)];
      }

      this.emit('chat:message', {
        id: `peer_msg_${Date.now()}`,
        senderId: peer.id,
        senderName: peer.name,
        senderHandle: peer.handle,
        senderEmoji: peer.emoji,
        text: replyText,
        timestamp: new Date().toISOString(),
      });
    }, 2200);
  }

  // ── Database & Social REST API Helpers ─────────────────────────────────────
  async registerUser(profile) {
    return await this.registerInBackend(profile);
  }

  async registerInBackend(profile) {
    this.currentUser = profile;
    if (isSupabaseConfigured()) {
      const saved = await sbSaveUser(profile);
      return saved || profile;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[WS-Client] 💾 Successfully registered in database:', data.user);
        this.registerProfile(data.user || profile);
        return data.user;
      }
    } catch (err) {
      console.warn('[WS-Client] Backend API registration offline, saving locally:', err.message);
    }
    this.registerProfile(profile);
    return profile;
  }

  async fetchRegisteredUsers() {
    if (isSupabaseConfigured()) {
      try {
        const users = await sbFetchUsers();
        if (users && users.length > 0) return users;
      } catch (e) {
        console.warn('[Supabase] fetchRegisteredUsers fallback:', e.message);
      }
    }
    if (isLocalEnvironment()) {
      try {
        const res = await fetch(`${getApiBase()}/api/users`);
        if (res.ok) {
          const data = await res.json();
          if (data.users && data.users.length > 0) return data.users;
        }
      } catch {}
    }
    return this.simulatedPeers || [];
  }

  async fetchCommunityPosts() {
    if (isSupabaseConfigured()) {
      try {
        const posts = await sbFetchPosts();
        if (posts && posts.length > 0) return posts;
      } catch {}
    }
    if (isLocalEnvironment()) {
      try {
        const res = await fetch(`${getApiBase()}/api/social/feed`);
        if (res.ok) {
          const data = await res.json();
          if (data.posts && data.posts.length > 0) return data.posts;
        }
      } catch {}
    }
    return [];
  }

  async createStatusPost(content) {
    if (!this.currentUser) return null;
    const postPayload = {
      authorId: this.currentUser.id,
      authorName: this.currentUser.name,
      authorHandle: this.currentUser.handle,
      authorEmoji: this.currentUser.emoji || '🧑‍💻',
      content,
    };
    if (isSupabaseConfigured()) {
      return await sbAddPost(postPayload);
    }
    try {
      const res = await fetch(`${getApiBase()}/api/social/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload),
      });
      if (res.ok) {
        const data = await res.json();
        return data.post;
      }
    } catch {}
    return { ...postPayload, id: `local_${Date.now()}`, timestamp: new Date().toISOString(), likes: 1 };
  }

  async fetchUserProfile(userId) {
    if (!userId) return null;
    if (isSupabaseConfigured()) {
      const users = await sbFetchUsers();
      const match = (users || []).find((u) => u.id === userId);
      if (match) return match;
    }
    if (isLocalEnvironment()) {
      try {
        const res = await fetch(`${getApiBase()}/api/users/profile?userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          return data.user || null;
        }
      } catch (err) {
        console.warn('[WS-Client] Profile sync error:', err.message);
      }
    }
    return null;
  }

  async sendSocialAction(action, targetUserId) {
    if (!this.currentUser) return null;
    if (isSupabaseConfigured()) {
      return await sbInteract(action, targetUserId, this.currentUser);
    }
    try {
      // Send over socket if connected
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'social:interact',
          action,
          targetUserId,
        }));
      }

      // Also call REST to get guaranteed updated targetUser and actor
      const res = await fetch(`${getApiBase()}/api/social/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          fromUser: this.currentUser,
          targetUserId,
        }),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn('[WS-Client] Social action fallback:', err.message);
    }
    return null;
  }
}

export const wsService = new WebSocketManager();
