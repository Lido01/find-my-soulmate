// ─────────────────────────────────────────────────────────────────────────────
// gemini.js — Resilient Gemini API utility with multi-model fallback & clean diagnostics
// ─────────────────────────────────────────────────────────────────────────────

export const CANDIDATE_MODELS = [
  'gemini-1.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-pro',
  'gemini-2.5-flash',
  'gemini-pro',
];

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Sanitizes input API key by stripping quotes, whitespace, and hidden control characters.
 */
export function cleanApiKey(rawKey) {
  if (!rawKey) return '';
  return String(rawKey)
    .trim()
    .replace(/^["'`]|["'`]$/g, '') // remove surrounding quotes
    .replace(/[\r\n\t\s]/g, '');   // remove all whitespace/newlines
}

/**
 * Tests connection with Gemini API across candidate models.
 * Returns { success: boolean, workingModel?: string, error?: string, rawStatus?: number }
 */
export async function testGeminiApiKey(rawKey) {
  const key = cleanApiKey(rawKey);
  if (!key) {
    return { success: false, error: 'API key is empty.' };
  }

  let lastError = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      });

      if (res.ok) {
        return { success: true, workingModel: model };
      }

      const errData = await res.json().catch(() => ({}));
      lastError = errData?.error?.message || `HTTP ${res.status}`;

      // If it's a definitive invalid key error, stop early
      if (res.status === 400 && lastError.toLowerCase().includes('api key not valid')) {
        return { success: false, error: lastError, rawStatus: res.status };
      }
    } catch (netErr) {
      lastError = netErr.message || 'Network request failed';
    }
  }

  return { success: false, error: lastError || 'Could not connect to Gemini models.' };
}

/**
 * Send a chat message to Gemini API with fallback over candidate models.
 */
export async function sendGeminiMessage({ apiKey, systemPrompt, history = [], userMessage, lang = 'en' }) {
  const key = cleanApiKey(apiKey);
  if (!key) throw new Error('No API key provided. Please connect your Gemini key in AI Mode.');

  const langInstruction = lang === 'am'
    ? '\n\nIMPORTANT: The user has selected Amharic (አማርኛ) mode. You are interacting with an Ethiopian developer or someone who loves Ethiopian tech culture. Sprinkle in authentic Amharic love phrases and developer humor naturally (e.g., ፍቅሬ, ቆንጆ, ወዳጄ, ጎበዝ, የኔ ልብ, እንጀራ, ቡና). Keep your technical dev personality while being warmly bilingual.'
    : '\n\nKeep your responses playful, witty, and developer-themed. Use markdown code snippets or terminal syntax occasionally.';

  const fullSystemPrompt = systemPrompt + langInstruction;

  // Build conversation history for Gemini (last 10 turns max)
  const contents = [];
  const recentHistory = history
    .filter((m) => m && m.text && !m.isGift)
    .slice(-10);

  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'player' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }

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

  let lastErrMsg = '';

  for (const model of CANDIDATE_MODELS) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${key}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      } else {
        const errJson = await res.json().catch(() => ({}));
        lastErrMsg = errJson?.error?.message || `HTTP ${res.status}`;
      }
    } catch (e) {
      lastErrMsg = e.message;
    }
  }

  throw new Error(lastErrMsg || 'All Gemini models failed to generate content.');
}

/**
 * Backward-compatible validation helper
 */
export async function validateApiKey(rawKey) {
  const result = await testGeminiApiKey(rawKey);
  return result.success;
}
