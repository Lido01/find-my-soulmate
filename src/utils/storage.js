// ─────────────────────────────────────────────────────────────────────────────
// storage.js — localStorage persistence layer
// Commit: feat: hook up localStorage state persistence and hard reset
// ─────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'find_my_soulmate_sim_v2';
const API_KEY_STORAGE = 'fms_gemini_api_key';
const LANG_STORAGE = 'fms_language';

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
      relationship: char.initialRelationship,
      mood: char.defaultMood,
      unlockedDialogues: ['intro'],
      totalChoicesMade: 0,
      giftsGiven: [],
      totalGiftsValue: 0,
    };
  });
  return state;
}
