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
    status: 'online',
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
    status: 'online',
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
    status: 'online',
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
    status: 'online',
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
    likes: 19,
    friends: ['user_selam'],
    status: 'online',
    currentStatus: 'Lubed my mechanical switches today. The typing sounds are divine ⌨️✨',
    registeredAt: new Date(Date.now() - 86400000 * 1).toISOString(),
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
    drink: '☕ Espresso Roast',
    emoji: '👨‍💻',
    likes: 33,
    friends: [],
    status: 'online',
    currentStatus: 'Writing software that scales and looking for someone who stays 💖',
    registeredAt: new Date(Date.now() - 86400000 * 6).toISOString(),
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
    } catch (err) {
      console.error('[DB] Error initializing database files:', err.message);
    }
  }

  getUsers() {
    try {
      this.ensureInitialized();
      const content = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(content) || [];
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
        status: 'online',
        currentStatus: userData.currentStatus || 'Just registered on DevSoulmate! Say hi 👋',
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
      console.log(`[DB] 💾 User saved to database: ${updatedUser.name} (${updatedUser.handle})`);
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
