// ─────────────────────────────────────────────────────────────────────────────
// gemini.js — Gemini API integration utility
// Commit: feat: integrate Gemini AI for real-time character chat
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.0-flash-exp';
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
export async function sendGeminiMessage({ apiKey, systemPrompt, history, userMessage, lang }) {
  if (!apiKey) throw new Error('No API key provided');

  const langInstruction = lang === 'am'
    ? '\n\nIMPORTANT: The user is using Amharic language mode. Sprinkle in Amharic words and phrases naturally throughout your response. Keep most of the reply in English but add Amharic flavor words like ፍቅሬ, ቆንጆ, አስደናቂ, ወዳጄ, ጎበዝ where they fit naturally.'
    : '';

  const fullSystemPrompt = systemPrompt + langInstruction;

  // Build conversation history for Gemini
  const contents = [];

  // Add history (max last 10 turns to keep context manageable)
  const recentHistory = history.slice(-10);
  for (const msg of recentHistory) {
    contents.push({
      role: msg.sender === 'player' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    });
  }

  // Add current user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const body = {
    system_instruction: { parts: [{ text: fullSystemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.9,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 256,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API Error ${res.status}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini');
  return text.trim();
}

/**
 * Quick API key validation — sends a minimal test prompt
 */
export async function validateApiKey(apiKey) {
  try {
    const url = `${GEMINI_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Say "OK" and nothing else.' }] }],
        generationConfig: { maxOutputTokens: 5 },
      }),
    });
    return res.ok;
  } catch { return false; }
}
