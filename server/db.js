// ─────────────────────────────────────────────────────────────────────────────
// server/db.js — Lightweight JSON database storage for registered users & social
// ─────────────────────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SOCIAL_FILE = path.join(DATA_DIR, 'social.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

export function generateLoveCode() {
  const p1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const p2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LOVE-${p1}-${p2}`;
}

const INITIAL_USERS = [
  {
    id: 'user_meron',
    name: 'Meron Tadesse',
    handle: '@meron_dev',
    gender: 'female',
    lookingFor: 'male',
    location: 'Addis Ababa 🇪🇹',
    techStack: ['Next.js', 'React', 'Tailwind', 'GraphQL'],
    bio: 'Late night frontend builder. Addicted to Ethiopian Bunna and clean component design.',
    indentation: 'Tabs',
    drink: '☕ Ethiopian Bunna',
    emoji: '👩‍💻',
    likes: 14,
    friends: ['user_yonas'],
    status: 'offline',
    loveCode: 'LOVE-MERO-9021',
    currentStatus: 'Refactoring auth components with Tailwind... need more bunna ☕',
    registeredAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isRegistered: true,
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
    indentation: 'Spaces',
    drink: '🍵 Matcha Latte',
    emoji: '👩‍💻',
    likes: 21,
    friends: [],
    status: 'offline',
    loveCode: 'LOVE-HANN-4432',
    currentStatus: 'Just deployed v1.2 to production without a single error! 🚀',
    registeredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isRegistered: true,
  },
  {
    id: 'user_selam',
    name: 'Selamawit Alemayehu',
    handle: '@selam_ai',
    gender: 'female',
    lookingFor: 'male',
    location: 'Nairobi 🇰🇪',
    techStack: ['Python', 'FastAPI', 'PyTorch', 'Linux'],
    bio: 'Training vision models and looking for someone who loves deep talks over bunna.',
    indentation: 'Tabs',
    drink: '☕ Ethiopian Bunna',
    emoji: '👩‍💻',
    likes: 38,
    friends: ['user_alex'],
    status: 'offline',
    loveCode: 'LOVE-SELA-7719',
    currentStatus: 'Fine-tuning a local LLM while listening to Tilahun Gessesse 🎶',
    registeredAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    isRegistered: true,
  },
  {
    id: 'user_yonas',
    name: 'Yonas Bekele',
    handle: '@yonas_rust',
    gender: 'male',
    lookingFor: 'female',
    location: 'Addis Ababa 🇪🇹',
    techStack: ['Rust', 'WebAssembly', 'Linux', 'Go'],
    bio: 'Zero memory leaks, 100% devotion. Looking for a smart dev girl to share late night commits with.',
    indentation: 'Tabs',
    drink: '☕ Ethiopian Bunna',
    emoji: '👨‍💻',
    likes: 27,
    friends: ['user_meron'],
    status: 'offline',
    loveCode: 'LOVE-YONA-1823',
    currentStatus: 'Async Rust is pure poetry. Who wants to debate tabs vs spaces? 💻',
    registeredAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    isRegistered: true,
  },
  {
    id: 'user_alex',
    name: 'Alex Rivera',
    handle: '@alex_fullstack',
    gender: 'male',
    lookingFor: 'female',
    location: 'Austin 🇺🇸',
    techStack: ['React', 'Go', 'Docker', 'PostgreSQL'],
    bio: 'Mechanical keyboard enthusiast. I make great breakfast burritos and clean git trees.',
    indentation: 'Spaces',
    drink: '🥤 Cold Brew',
    emoji: '👨‍💻',
    likes: 42,
    friends: ['user_selam'],
    status: 'offline',
    loveCode: 'LOVE-ALEX-3392',
    currentStatus: 'Just built a real-time WebSocket cluster in Go. Anyone want to test? ⚡',
    registeredAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    isRegistered: true,
  },
  {
    id: 'user_kenean',
    name: 'Kenean Mengistu',
    handle: '@kenean_arch',
    gender: 'male',
    lookingFor: 'female',
    location: 'London 🇬🇧',
    techStack: ['Elixir', 'Distributed Systems', 'Tailwind', 'Next.js'],
    bio: 'Aesthetic enthusiast. I believe in romantic code comments and spontaneous coffee dates.',
    indentation: 'Tabs',
    drink: '☕ Ethiopian Bunna',
    emoji: '👨‍💻',
    likes: 31,
    friends: [],
    status: 'offline',
    loveCode: 'LOVE-KENE-6651',
    currentStatus: 'Designing fault-tolerant systems and looking for genuine chemistry ✨',
    registeredAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    isRegistered: true,
  },
];

const INITIAL_POSTS = [
  {
    id: 'post_1',
    authorId: 'user_meron',
    authorName: 'Meron Tadesse',
    authorHandle: '@meron_dev',
    authorEmoji: '👩‍💻',
    content: 'Nothing hits better than a fresh cup of Ethiopian Bunna while fixing a complex state management bug ☕❤️',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    likes: 8,
    comments: 3,
  },
  {
    id: 'post_2',
    authorId: 'user_yonas',
    authorName: 'Yonas Bekele',
    authorHandle: '@yonas_rust',
    authorEmoji: '👨‍💻',
    content: 'Just convinced another engineer to switch to Tabs. The world is healing! 🚀',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    likes: 12,
    comments: 5,
  },
  {
    id: 'post_3',
    authorId: 'user_selam',
    authorName: 'Selamawit Alemayehu',
    authorHandle: '@selam_ai',
    authorEmoji: '👩‍💻',
    content: 'Looking for a coding partner to build an open-source Ethiopian language AI dataset. Say hi! ✨🇪🇹',
    timestamp: new Date(Date.now() - 3600000 * 9).toISOString(),
    likes: 15,
    comments: 7,
  },
];

export class Database {
  constructor() {
    this.ensureInitialized();
  }

  ensureInitialized() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(INITIAL_USERS, null, 2), 'utf-8');
      }
      if (!fs.existsSync(SOCIAL_FILE)) {
        fs.writeFileSync(SOCIAL_FILE, JSON.stringify({ posts: INITIAL_POSTS, waves: [] }, null, 2), 'utf-8');
      }
      if (!fs.existsSync(MESSAGES_FILE)) {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify({}, null, 2), 'utf-8');
      }
      if (!fs.existsSync(NOTIFICATIONS_FILE)) {
        fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[DB] Error initializing database files:', err.message);
    }
  }

  getUsers() {
    try {
      this.ensureInitialized();
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      const users = JSON.parse(content) || [];
      let dirty = false;

      for (const u of users) {
        if (!u.loveCode || typeof u.loveCode !== 'string' || !u.loveCode.trim()) {
          u.loveCode = generateLoveCode();
          dirty = true;
        }
      }

      if (dirty) {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
        console.log(`[DB] 🔑 Assigned missing Love Codes to database users.`);
      }

      return users;
    } catch (err) {
      console.error('[DB] Error reading users:', err.message);
      return INITIAL_USERS;
    }
  }

  saveUser(userData) {
    try {
      this.ensureInitialized();
      const users = this.getUsers();
      const existingIdx = users.findIndex((u) => u.id === userData.id || u.handle === userData.handle);

      const cleanHandle = typeof userData.handle === 'string' && userData.handle.trim()
        ? (userData.handle.trim().startsWith('@') ? userData.handle.trim() : `@${userData.handle.trim()}`)
        : `@${(userData.name || 'dev').toLowerCase().replace(/\s+/g, '_')}`;

      const existingLoveCode = existingIdx >= 0 ? users[existingIdx].loveCode : null;
      const loveCode = (userData.loveCode && userData.loveCode.trim()) || existingLoveCode || generateLoveCode();

      const updatedUser = {
        id: userData.id || `user_${Date.now()}`,
        name: userData.name || 'Anonymous Dev',
        handle: cleanHandle,
        gender: userData.gender || 'female',
        lookingFor: userData.lookingFor || 'male',
        location: userData.location || 'Addis Ababa 🇪🇹',
        techStack: userData.techStack || ['React', 'TypeScript'],
        bio: userData.bio || 'Coding with passion...',
        quote: userData.quote || '',
        avatarUrl: userData.avatarUrl || null,
        indentation: userData.indentation || 'Tabs',
        drink: userData.drink || '☕ Ethiopian Bunna',
        emoji: userData.emoji || (userData.gender === 'female' ? '👩‍💻' : '👨‍💻'),
        likes: userData.likes || (existingIdx >= 0 ? users[existingIdx].likes : 1),
        friends: userData.friends || (existingIdx >= 0 ? users[existingIdx].friends : []),
        loveCode: loveCode,
        status: 'offline',
        currentStatus: userData.currentStatus || 'Just registered on DevSoulmate! Say hi',
        registeredAt: existingIdx >= 0 ? users[existingIdx].registeredAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRegistered: true,
      };

      if (existingIdx >= 0) {
        users[existingIdx] = { ...users[existingIdx], ...updatedUser };
      } else {
        users.unshift(updatedUser);
      }

      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
      console.log(`[DB] 💾 User saved to database: ${updatedUser.name} (${updatedUser.handle}) [LoveCode: ${updatedUser.loveCode}]`);
      return updatedUser;
    } catch (err) {
      console.error('[DB] Error saving user:', err.message);
      return userData;
    }
  }

  getUserById(id) {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  }

  getUserByLoveCode(searchCode) {
    if (!searchCode) return null;
    const raw = String(searchCode).trim();
    const normalized = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanWithDashes = raw.toUpperCase();
    const cleanHandle = raw.startsWith('@') ? raw.toLowerCase() : `@${raw.toLowerCase()}`;
    const users = this.getUsers();

    return users.find((u) => {
      if (!u) return false;
      // 1. Direct Love Code match (exact or stripped of dashes/spaces)
      if (u.loveCode) {
        const uCode = String(u.loveCode).toUpperCase();
        const uNorm = uCode.replace(/[^a-zA-Z0-9]/g, '');
        if (uCode === cleanWithDashes || (normalized.length >= 6 && uNorm === normalized)) {
          return true;
        }
      }
      // 2. Handle fallback match (@handle or handle)
      if (u.handle && (u.handle.toLowerCase() === cleanHandle || u.handle.toLowerCase() === `@${raw.toLowerCase()}`)) {
        return true;
      }
      // 3. User ID match
      if (u.id && u.id.toLowerCase() === raw.toLowerCase()) {
        return true;
      }
      return false;
    });
  }

  // ── Conversation Key Helper ───────────────────────────────────────────────
  getConversationKey(u1, u2) {
    if (!u1 || !u2) return null;
    return [String(u1), String(u2)].sort().join('___');
  }

  // ── Message Persistence ───────────────────────────────────────────────────
  getMessages(u1, u2) {
    try {
      this.ensureInitialized();
      const key = this.getConversationKey(u1, u2);
      if (!key) return [];
      if (!fs.existsSync(MESSAGES_FILE)) return [];
      const content = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      const allMessages = JSON.parse(content) || {};
      return allMessages[key] || [];
    } catch (err) {
      console.error('[DB] Error reading messages:', err.message);
      return [];
    }
  }

  saveMessage(u1, u2, message) {
    try {
      this.ensureInitialized();
      const key = this.getConversationKey(u1, u2);
      if (!key) return message;
      const content = fs.existsSync(MESSAGES_FILE) ? fs.readFileSync(MESSAGES_FILE, 'utf-8') : '{}';
      const allMessages = JSON.parse(content) || {};
      if (!allMessages[key]) allMessages[key] = [];

      // Avoid duplicates
      const exists = allMessages[key].some((m) => m.id === message.id);
      if (!exists) {
        allMessages[key].push(message);
        // Keep max 250 messages per conversation
        if (allMessages[key].length > 250) {
          allMessages[key] = allMessages[key].slice(-250);
        }
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(allMessages, null, 2), 'utf-8');
      }
      return message;
    } catch (err) {
      console.error('[DB] Error saving message:', err.message);
      return message;
    }
  }

  markMessagesSeen(u1, u2, readerId, messageIds = []) {
    try {
      this.ensureInitialized();
      const key = this.getConversationKey(u1, u2);
      if (!key || !fs.existsSync(MESSAGES_FILE)) return [];
      const content = fs.readFileSync(MESSAGES_FILE, 'utf-8');
      const allMessages = JSON.parse(content) || {};
      if (!allMessages[key]) return [];

      let modified = false;
      const updatedIds = [];

      allMessages[key] = allMessages[key].map((m) => {
        // If message was sent to readerId and is in messageIds (or mark all unread from partner)
        if (m.senderId !== readerId) {
          if (!messageIds.length || messageIds.includes(m.id)) {
            if (m.status !== 'seen') {
              modified = true;
              updatedIds.push(m.id);
              return { ...m, status: 'seen' };
            }
          }
        }
        return m;
      });

      if (modified) {
        fs.writeFileSync(MESSAGES_FILE, JSON.stringify(allMessages, null, 2), 'utf-8');
      }
      return updatedIds;
    } catch (err) {
      console.error('[DB] Error marking messages seen:', err.message);
      return [];
    }
  }

  // ── Notification Persistence ──────────────────────────────────────────────
  getNotifications(userId) {
    try {
      this.ensureInitialized();
      if (!fs.existsSync(NOTIFICATIONS_FILE)) return [];
      const content = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      const list = JSON.parse(content) || [];
      return list.filter((n) => n.targetUserId === userId);
    } catch (err) {
      console.error('[DB] Error reading notifications:', err.message);
      return [];
    }
  }

  addNotification(notif) {
    try {
      this.ensureInitialized();
      const content = fs.existsSync(NOTIFICATIONS_FILE) ? fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8') : '[]';
      const list = JSON.parse(content) || [];
      const item = {
        id: notif.id || `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        type: notif.type || 'info', // 'friend_request' | 'friend_accept' | 'wave' | 'like' | 'chat_message'
        targetUserId: notif.targetUserId,
        fromUser: notif.fromUser,
        text: notif.text,
        timestamp: new Date().toISOString(),
        read: false,
        status: notif.type === 'friend_request' ? 'pending' : 'read',
      };
      list.unshift(item);
      // Keep max 150 notifications
      const trimmed = list.slice(0, 150);
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(trimmed, null, 2), 'utf-8');
      return item;
    } catch (err) {
      console.error('[DB] Error adding notification:', err.message);
      return null;
    }
  }

  respondToFriendRequest(notificationId, action, userId) {
    try {
      this.ensureInitialized();
      if (!fs.existsSync(NOTIFICATIONS_FILE)) return null;
      const content = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      const list = JSON.parse(content) || [];
      const targetNotif = list.find((n) => n.id === notificationId);
      if (!targetNotif) return null;

      targetNotif.status = action; // 'accepted' | 'declined'
      targetNotif.read = true;

      if (action === 'accepted') {
        // Mutual friend addition in users database
        this.interact('add_friend', { id: targetNotif.fromUser.id }, targetNotif.targetUserId);
      }

      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
      return targetNotif;
    } catch (err) {
      console.error('[DB] Error responding to friend request:', err.message);
      return null;
    }
  }

  markNotificationsRead(userId) {
    try {
      this.ensureInitialized();
      if (!fs.existsSync(NOTIFICATIONS_FILE)) return;
      const content = fs.readFileSync(NOTIFICATIONS_FILE, 'utf-8');
      const list = JSON.parse(content) || [];
      let updated = false;
      for (const n of list) {
        if (n.targetUserId === userId && !n.read) {
          n.read = true;
          updated = true;
        }
      }
      if (updated) {
        fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(list, null, 2), 'utf-8');
      }
    } catch (err) {
      console.error('[DB] Error marking notifications read:', err.message);
    }
  }

  // Social interactions: like, wave, friend
  interact(action, fromUser, targetUserId) {
    try {
      const users = this.getUsers();
      const targetUser = users.find((u) => u.id === targetUserId);
      if (!targetUser) return null;

      if (action === 'like') {
        targetUser.likes = (targetUser.likes || 0) + 1;
      } else if (action === 'add_friend' || action === 'friend_request') {
        if (!targetUser.friends) targetUser.friends = [];
        if (!targetUser.friends.includes(fromUser.id)) {
          targetUser.friends.push(fromUser.id);
        }

        // Add reciprocally for user
        const actor = users.find((u) => u.id === fromUser.id);
        if (actor) {
          if (!actor.friends) actor.friends = [];
          if (!actor.friends.includes(targetUserId)) {
            actor.friends.push(targetUserId);
          }
        }
      }

      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
      return targetUser;
    } catch (err) {
      console.error('[DB] Error interacting:', err.message);
      return null;
    }
  }

  getPosts() {
    try {
      this.ensureInitialized();
      const content = fs.readFileSync(SOCIAL_FILE, 'utf-8');
      const data = JSON.parse(content);
      return data.posts || [];
    } catch (err) {
      return INITIAL_POSTS;
    }
  }

  addPost(post) {
    try {
      this.ensureInitialized();
      const content = fs.readFileSync(SOCIAL_FILE, 'utf-8');
      const data = JSON.parse(content);
      const newPost = {
        id: `post_${Date.now()}`,
        authorId: post.authorId,
        authorName: post.authorName,
        authorHandle: post.authorHandle,
        authorEmoji: post.authorEmoji || '🧑‍💻',
        content: post.content,
        timestamp: new Date().toISOString(),
        likes: 1,
        comments: 0,
      };
      data.posts = [newPost, ...(data.posts || [])].slice(0, 50);
      fs.writeFileSync(SOCIAL_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return newPost;
    } catch (err) {
      console.error('[DB] Error adding post:', err.message);
      return null;
    }
  }
}

export const db = new Database();
