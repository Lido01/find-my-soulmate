// ─────────────────────────────────────────────────────────────────────────────
// storage.js — localStorage persistence layer
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'find_my_soulmate_sim_v2';
const API_KEY_STORAGE = 'fms_gemini_api_key';
const LANG_STORAGE = 'fms_language';
const PROFILE_STORAGE = 'fms_user_profile';
const AUDIO_SETTINGS_STORAGE = 'fms_audio_settings';
const CHAT_HISTORY_PREFIX = 'fms_chat_history_';

export const DEFAULT_USER_PROFILE = {
  name: 'CodeSoul',
  emoji: '🧑‍💻',
  archetype: 'Full-Stack Dreamer',
  favoriteStack: 'TypeScript & React',
  lookingFor: 'all', // 'female' (girlfriend) | 'male' (boyfriend) | 'all'
  goal: 'Pair Programming & Production Soulmate ❤️',
  bio: 'Searching for someone whose code compiles as cleanly as our chemistry.',
};

export const DEFAULT_AUDIO_SETTINGS = {
  soundEffects: true,
  voiceNarration: true,
  volume: 0.9,
};

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* fail silently */ }
}

export function purgeState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
}

export function saveApiKey(key) {
  try { localStorage.setItem(API_KEY_STORAGE, key); } catch { /* */ }
}

export function loadApiKey() {
  try { return localStorage.getItem(API_KEY_STORAGE) || ''; } catch { return ''; }
}

export function clearApiKey() {
  try { localStorage.removeItem(API_KEY_STORAGE); } catch { /* */ }
}

export function saveLanguage(lang) {
  try { localStorage.setItem(LANG_STORAGE, lang); } catch { /* */ }
}

export function loadLanguage() {
  try { return localStorage.getItem(LANG_STORAGE) || 'en'; } catch { return 'en'; }
}

export function loadUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE);
    if (!raw || raw === 'null' || raw === 'undefined') return null;
    const parsed = JSON.parse(raw);
    return parsed && parsed.isRegistered ? parsed : null;
  } catch {
    return null;
  }
}

export function saveUserProfile(profile) {
  try {
    if (!profile) {
      localStorage.removeItem(PROFILE_STORAGE);
    } else {
      localStorage.setItem(PROFILE_STORAGE, JSON.stringify(profile));
    }
  } catch { /* fail silently */ }
}

export function clearUserProfile() {
  try {
    localStorage.removeItem(PROFILE_STORAGE);
  } catch { /* fail silently */ }
}

export function loadAudioSettings() {
  try {
    const raw = localStorage.getItem(AUDIO_SETTINGS_STORAGE);
    return raw ? { ...DEFAULT_AUDIO_SETTINGS, ...JSON.parse(raw) } : DEFAULT_AUDIO_SETTINGS;
  } catch {
    return DEFAULT_AUDIO_SETTINGS;
  }
}

export function saveAudioSettings(settings) {
  try { localStorage.setItem(AUDIO_SETTINGS_STORAGE, JSON.stringify(settings)); } catch { /* */ }
}

// ── Persistent Chat History per Peer (Scoped to user & peer) ─────────────
export function loadChatHistory(currentUserId, peerId) {
  const actualPeerId = peerId || currentUserId;
  const actualUserId = peerId ? currentUserId : null;
  if (!actualPeerId) return [];
  try {
    const scopedKey = actualUserId
      ? `${CHAT_HISTORY_PREFIX}${actualUserId}_${actualPeerId}`
      : `${CHAT_HISTORY_PREFIX}${actualPeerId}`;
    const raw = localStorage.getItem(scopedKey) || localStorage.getItem(`${CHAT_HISTORY_PREFIX}${actualPeerId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(currentUserId, peerId, messages) {
  const actualMessages = Array.isArray(messages) ? messages : (Array.isArray(peerId) ? peerId : []);
  const actualPeerId = Array.isArray(messages) ? peerId : currentUserId;
  const actualUserId = Array.isArray(messages) ? currentUserId : null;
  if (!actualPeerId || !Array.isArray(actualMessages)) return;
  try {
    const trimmed = actualMessages.slice(-250);
    const scopedKey = actualUserId
      ? `${CHAT_HISTORY_PREFIX}${actualUserId}_${actualPeerId}`
      : `${CHAT_HISTORY_PREFIX}${actualPeerId}`;
    localStorage.setItem(scopedKey, JSON.stringify(trimmed));
  } catch {
    /* fail silently */
  }
}

export function clearChatHistory(currentUserId, peerId) {
  const actualPeerId = peerId || currentUserId;
  const actualUserId = peerId ? currentUserId : null;
  if (!actualPeerId) return;
  try {
    if (actualUserId) {
      localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${actualUserId}_${actualPeerId}`);
    }
    localStorage.removeItem(`${CHAT_HISTORY_PREFIX}${actualPeerId}`);
  } catch {
    /* */
  }
}

export function buildInitialState(characters) {
  const state = {
    selectedCharacterId: null,
    phase: 'select', // 'select' | 'chat'
    characters: {},
  };
  Object.values(characters).forEach((char) => {
    state.characters[char.id] = {
      messages: [],
      currentDialogueId: 'intro',
      relationship: char.initialRelationship || 15,
      mood: char.defaultMood || 'curious',
      unlockedDialogues: ['intro'],
      totalChoicesMade: 0,
      giftsGiven: [],
      totalGiftsValue: 0,
    };
  });
  return state;
}
