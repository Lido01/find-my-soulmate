// ─────────────────────────────────────────────────────────────────────────────
// websocket.js — Robust WebSocket Client Manager for Live Developer Dating Chat
// Handles live connection, auto-reconnect, and intelligent peer matchmaking.
// ─────────────────────────────────────────────────────────────────────────────

// Simulated realistic online developers (shown if user wants live peer discovery)
const SIMULATED_ONLINE_DEVS = [
  {
    id: 'sim_meron',
    name: 'Meron T.',
    handle: '@meron_dev',
    gender: 'female',
    lookingFor: 'male',
    location: 'Addis Ababa 🇪🇹',
    techStack: ['Next.js', 'Tailwind', 'GraphQL'],
    bio: 'Late night frontend builder. Addicted to pour-over coffee and clean component design.',
    emoji: '👩‍💻',
    status: 'online',
    initialMood: 'curious',
  },
  {
    id: 'sim_hanna',
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
    id: 'sim_selam',
    name: 'Selamawit A.',
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
    id: 'sim_yonas',
    name: 'Yonas B.',
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
    id: 'sim_alex',
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
    id: 'sim_kenean',
    name: 'Kenean M.',
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

function getApiBase() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `http://${window.location.hostname}:8080`;
  }
  return 'http://localhost:8080';
}

function getWsBase() {
  if (typeof window !== 'undefined' && window.location?.hostname) {
    return `ws://${window.location.hostname}:8080`;
  }
  return 'ws://localhost:8080';
}

class WebSocketManager {
  constructor() {
    this.ws = null;
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
        this.currentPeer = msg.inviter;
        this.emit('room:entered', { roomId: msg.roomId, peer: msg.inviter });
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
    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isSimulated) {
      this.ws.send(JSON.stringify({
        type: 'room:invite',
        targetUserId: peer.id,
      }));
    } else {
      this.currentRoomId = `sim_room_${Date.now()}`;
      this.currentPeer = peer;
      this.emit('room:entered', { roomId: this.currentRoomId, peer });
    }
  }

  sendMessage(text, options = {}) {
    const msgPayload = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      senderId: this.currentUser?.id || 'me',
      senderName: this.currentUser?.name || 'Me',
      senderHandle: this.currentUser?.handle || '@me',
      senderEmoji: this.currentUser?.emoji || '🧑‍💻',
      senderAvatarUrl: this.currentUser?.avatarUrl || null,
      text: text.trim(),
      timestamp: new Date().toISOString(),
      isAudio: Boolean(options.isAudio),
      audioDuration: options.audioDuration || null,
      isGift: Boolean(options.isGift),
      gift: options.gift || null,
      isImage: Boolean(options.isImage),
      imageUrl: options.imageUrl || null,
      isCode: Boolean(options.isCode),
      codeLang: options.codeLang || null,
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN && !this.isSimulated) {
      this.ws.send(JSON.stringify({
        type: 'chat:send',
        roomId: this.currentRoomId,
        message: msgPayload,
      }));
    } else {
      // Echo locally
      this.emit('chat:message', msgPayload);

      // Trigger simulated reply from peer after human delay
      this.triggerSimulatedReply(text, options);
    }
  }

  sendTyping(isTyping) {
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
        replyText = `Whoa, love the photo! 📸 Look at that clarity. Saving this to my favorites! 💖`;
      } else if (options.isCode) {
        replyText = `That's clean code! 🔥 Zero memory leaks, pristine logic. Truly a 10x soulmate move.`;
      } else if (lower.includes('hi') || lower.includes('hello') || lower.includes('ሰላም')) {
        replyText = `Hey ${this.currentUser?.name || 'there'}! 👋 Loved seeing your profile pop up. What are you coding tonight?`;
      } else if (lower.includes('love') || lower.includes('cute') || lower.includes('ቆንጆ') || lower.includes('ፍቅር')) {
        replyText = `Aww, you're so sweet! 🥺💖 My heart just dropped zero packets. Let's finish this sprint together!`;
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
  async registerInBackend(profile) {
    this.currentUser = profile;
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

  async fetchCommunityPosts() {
    try {
      const res = await fetch(`${getApiBase()}/api/social/feed`);
      if (res.ok) {
        const data = await res.json();
        return data.posts || [];
      }
    } catch {}
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

  async sendSocialAction(action, targetUserId) {
    if (!this.currentUser) return;
    try {
      // Send over socket if connected
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'social:interact',
          action,
          targetUserId,
        }));
      }

      // Also persist in REST API database
      await fetch(`${getApiBase()}/api/social/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          fromUser: this.currentUser,
          targetUserId,
        }),
      });
    } catch (err) {
      console.warn('[WS-Client] Social action fallback:', err.message);
    }
  }
}

export const wsService = new WebSocketManager();
