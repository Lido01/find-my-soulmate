// ─────────────────────────────────────────────────────────────────────────────
// gemini.js — Gemini API integration utility (supports Gemini 1.5 & 2.0)
// Commit: feat(api): enhance Gemini API utility with model fallback and error handling
// ─────────────────────────────────────────────────────────────────────────────

const PRIMARY_MODEL = 'gemini-1.5-flash';
const FALLBACK_MODEL = 'gemini-2.0-flash-exp';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Send a message to Gemini API with character system prompt.
 * @param {string} apiKey - Gemini API key
 * @param {string} systemPrompt - Character personality system prompt
 * @param {Array} history - Previous message history [{role, text}]
 * @param {string} userMessage - The player's latest message
 * @param {string} lang - Current language ('en' | 'am')
 * @returns {Promise<string>} Partner's AI-generated reply
 */
export async function sendGeminiMessage({ apiKey, systemPrompt, history = [], userMessage, lang = 'en' }) {
  if (!apiKey || !apiKey.trim()) throw new Error('No API key provided. Connect key in AI Mode.');

  const langInstruction = lang === 'am'
    ? '\n\nIMPORTANT: The user has selected Amharic (አማርኛ) mode. You are interacting with an Ethiopian developer or someone who loves Ethiopian tech culture. Sprinkle in authentic Amharic love phrases and developer humor naturally (e.g., ፍቅሬ, ቆንጆ, ወዳጄ, ጎበዝ, የኔ ልብ, እንጀራ, ቡና). Keep your technical dev personality while being warmly bilingual.'
    : '\n\nKeep your responses playful, witty, and developer-themed. Use markdown code snippets or terminal syntax occasionally.';

  const fullSystemPrompt = systemPrompt + langInstruction;

  // Build clean conversation contents
  const contents = [];

  // Filter and format recent history (last 10 turns max)
  const recentHistory = history
    .filter((m) => m && m.text && !m.isGift)
    .slice(-10);

  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'player' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const requestBody = {
    system_instruction: { parts: [{ text: fullSystemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.95,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 300,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  };

  // Try primary model first, fallback if unavailable
  let res;
  try {
    const url = `${GEMINI_BASE}/${PRIMARY_MODEL}:generateContent?key=${apiKey.trim()}`;
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok && res.status === 404) {
      // Fallback model
      const fallbackUrl = `${GEMINI_BASE}/${FALLBACK_MODEL}:generateContent?key=${apiKey.trim()}`;
      res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
    }
  } catch (netErr) {
    throw new Error('Network error connecting to Gemini API. Please check your connection.');
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData?.error?.message || `Gemini API returned status ${res.status}`;
    throw new Error(message);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Received empty response from Gemini.');
  }

  return text.trim();
}

/**
 * Quick API key validation — verifies key format and tests simple call
 */
export async function validateApiKey(apiKey) {
  if (!apiKey || !apiKey.trim()) return false;
  const cleanKey = apiKey.trim();

  // If it matches standard Gemini key structure
  if (cleanKey.startsWith('AIza') && cleanKey.length >= 35) {
    try {
      const url = `${GEMINI_BASE}/${PRIMARY_MODEL}:generateContent?key=${cleanKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 5 },
        }),
      });
      // 200 means working, 400 with valid key structure could also be accepted
      return res.ok;
    } catch {
      // If network fails during validation, still allow valid format
      return true;
    }
  }

  return false;
}
