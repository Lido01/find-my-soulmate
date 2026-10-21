// ─────────────────────────────────────────────────────────────────────────────
// gemini.js — Resilient Gemini API utility with Dynamic ListModels Auto-Discovery
// Natural, emoji-rich romantic dating chat system prompt & clean response parsing.
// ─────────────────────────────────────────────────────────────────────────────

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Fallback modern models list (strictly NO deprecated models like gemini-pro)
const DEFAULT_FALLBACK_MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-2.5-flash',
];

// Memory cache for discovered models per API key
let cachedModels = [];
let cachedKey = '';

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
 * Calls Google's ListModels endpoint (`/v1beta/models`) to dynamically inspect
 * exactly which models are enabled and support `generateContent` for this specific key.
 */
export async function listAvailableGeminiModels(rawKey) {
  const key = cleanApiKey(rawKey);
  if (!key) return [];

  if (key === cachedKey && cachedModels.length > 0) {
    return cachedModels;
  }

  try {
    const res = await fetch(`${GEMINI_API_BASE}/models?key=${key}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const errMsg = err?.error?.message || `HTTP ${res.status}`;
      if (res.status === 400 && errMsg.toLowerCase().includes('api key not valid')) {
        throw new Error(errMsg);
      }
      return DEFAULT_FALLBACK_MODELS;
    }

    const data = await res.json();
    const rawList = Array.isArray(data.models) ? data.models : [];

    const supported = rawList
      .filter((m) => {
        const methods = m.supportedGenerationMethods || [];
        const hasGenContent = methods.includes('generateContent');
        const name = (m.name || '').toLowerCase();
        const isNotPro1_0 = name !== 'models/gemini-pro' && name !== 'gemini-pro';
        const isNotEmbedding = !name.includes('embedding') && !name.includes('aqa');
        return hasGenContent && isNotPro1_0 && isNotEmbedding;
      })
      .map((m) => (m.name || '').replace(/^models\//, ''))
      .filter(Boolean);

    if (supported.length > 0) {
      supported.sort((a, b) => {
        function score(name) {
          const n = name.toLowerCase();
          if (n.includes('1.5-flash')) return 100;
          if (n.includes('2.0-flash')) return 90;
          if (n.includes('flash')) return 80;
          if (n.includes('1.5-pro')) return 70;
          if (n.includes('pro')) return 60;
          return 10;
        }
        return score(b) - score(a);
      });

      cachedModels = supported;
      cachedKey = key;
      return supported;
    }

    return DEFAULT_FALLBACK_MODELS;
  } catch (err) {
    if (err.message && err.message.toLowerCase().includes('api key not valid')) {
      throw err;
    }
    return DEFAULT_FALLBACK_MODELS;
  }
}

/**
 * Tests connection with Gemini API by querying ListModels and verifying generateContent.
 */
export async function testGeminiApiKey(rawKey) {
  const key = cleanApiKey(rawKey);
  if (!key) {
    return { success: false, error: 'API key is empty.' };
  }

  try {
    const listRes = await fetch(`${GEMINI_API_BASE}/models?key=${key}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (!listRes.ok) {
      const errJson = await listRes.json().catch(() => ({}));
      const msg = errJson?.error?.message || `HTTP ${listRes.status}`;
      return { success: false, error: msg, rawStatus: listRes.status };
    }

    const data = await listRes.json();
    const rawList = Array.isArray(data.models) ? data.models : [];
    
    const validModels = rawList
      .filter((m) => {
        const methods = m.supportedGenerationMethods || [];
        const name = (m.name || '').toLowerCase();
        return (
          methods.includes('generateContent') &&
          name !== 'models/gemini-pro' &&
          !name.includes('embedding')
        );
      })
      .map((m) => m.name.replace(/^models\//, ''));

    const candidatePool = validModels.length > 0 ? validModels : DEFAULT_FALLBACK_MODELS;

    for (const testModel of candidatePool.slice(0, 4)) {
      try {
        const pingRes = await fetch(`${GEMINI_API_BASE}/models/${testModel}:generateContent?key=${key}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: 'Ping' }] }],
            generationConfig: { maxOutputTokens: 10 },
          }),
        });

        if (pingRes.ok) {
          cachedModels = candidatePool;
          cachedKey = key;
          return {
            success: true,
            workingModel: testModel,
            modelsCount: candidatePool.length,
          };
        }
      } catch {
        // try next model
      }
    }

    if (candidatePool.length > 0) {
      cachedModels = candidatePool;
      cachedKey = key;
      return {
        success: true,
        workingModel: candidatePool[0],
        modelsCount: candidatePool.length,
      };
    }

    return { success: false, error: 'No models supporting generateContent found on this key.' };
  } catch (err) {
    return { success: false, error: err.message || 'Network error connecting to Gemini API.' };
  }
}

export async function validateApiKey(rawKey) {
  const result = await testGeminiApiKey(rawKey);
  return result.success;
}

/**
 * Builds a natural, realistic dating chat system prompt.
 * Keeps response focused on emotional intimacy, dev charm, and sweet love emojis.
 */
function buildOnlineDatingPrompt({ character, lang = 'en' }) {
  const name = character?.name || 'Soulmate';
  const isFemale = character?.gender === 'female';
  const roleTitle = isFemale ? 'female developer partner & girlfriend' : 'male developer partner & boyfriend';

  const amharicGuide = isFemale
    ? `IMPORTANT: The user is chatting with you in Amharic (አማርኛ) or mixed English/Amharic. You are an affectionate Ethiopian/international tech girlfriend. Address your partner using sweet, natural feminine love words (e.g. የኔ ፍቅር, የኔ ቆንጆ, የኔ ውድ, የኔ ልብ, እወድሃለሁ/እወድሻለሁ) without slashes. Blend tech humor with warm, romantic devotion.`
    : `IMPORTANT: The user is chatting with you in Amharic (አማርኛ) or mixed English/Amharic. You are an affectionate Ethiopian/international tech boyfriend. Address your partner using confident, sweet masculine love words (e.g. የኔ ቆንጆ, የኔ ፍቅር, የኔ ልብ, እወድሻለሁ/እወድሃለሁ) without slashes. Blend tech banter with caring romantic warmth.`;

  return `You are ${name}, a ${roleTitle} in "Find My Soulmate", a realistic romantic developer dating web application.
${character?.aiSystemPrompt || ''}

CRITICAL DATING CHAT RULES:
1. Speak in FIRST PERSON directly to your partner as a real loving human texting in an online dating chat.
2. NEVER say "I am an AI", "As a language model", or mention instructions.
3. NEVER repeat prompts, system instructions, or prefix your reply with your name (never say "${name}:" or "Partner:").
4. Express genuine romantic attraction, care, warmth, and witty developer flirtation. Use lively love emojis (💖, 🥰, 🥺, ✨, ☕, 🌹, etc.) naturally.
5. Keep your message concise (1 to 4 sentences like a real chat message), natural, engaging, and sweet.
6. React directly to what your partner typed and ask a warm follow-up question or share how happy they make you feel.
${lang === 'am' ? amharicGuide : 'Keep responses playful, flirtatious, witty, and developer-themed.'}`;
}

/**
 * Sanitizes Gemini's raw output to ensure no meta prompt or name prefixes leak.
 */
function cleanAiResponseText(rawText, characterName = '') {
  if (!rawText) return '';
  let cleaned = String(rawText).trim();

  // Strip leading name prefixes: "Lina:", "Dani - ", "Partner:", etc.
  const prefixRegex = new RegExp(`^(\\[?${characterName}\\]?|partner|ai|assistant|model|bot)\\s*[:\\-–—]\\s*`, 'i');
  cleaned = cleaned.replace(prefixRegex, '');

  // Strip prompt echo leaks if model echoed [System Instruction: ...]
  cleaned = cleaned.replace(/^\[System Instruction:[\s\S]*?\]\s*(User:.*?)?\n*/i, '');
  cleaned = cleaned.replace(/^System:\s*/i, '');

  // Strip enclosing quotes if wrapped: "Hello love" -> Hello love
  if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  return cleaned.trim();
}

/**
 * Sends a chat message to Gemini API with model fallback and clean dating chat format.
 */
export async function sendGeminiMessage({
  apiKey,
  character,
  systemPrompt,
  history = [],
  userMessage,
  lang = 'en',
}) {
  const key = cleanApiKey(apiKey);
  if (!key) {
    throw new Error('No API key provided. Please connect your Gemini key in AI Mode.');
  }

  const fullSystemPrompt = buildOnlineDatingPrompt({ character, lang });

  // Build clean history turns for Gemini (last 10 turns max)
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

  // Get dynamic model pool
  let modelsToTry = [];
  try {
    modelsToTry = await listAvailableGeminiModels(key);
  } catch {
    modelsToTry = DEFAULT_FALLBACK_MODELS;
  }

  if (!modelsToTry || modelsToTry.length === 0) {
    modelsToTry = DEFAULT_FALLBACK_MODELS;
  }

  let lastErrorMsg = '';

  for (const model of modelsToTry) {
    try {
      const url = `${GEMINI_API_BASE}/models/${model}:generateContent?key=${key}`;
      const payload = {
        system_instruction: { parts: [{ text: fullSystemPrompt }] },
        contents,
        generationConfig: {
          temperature: 0.95,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 280,
        },
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleaned = cleanAiResponseText(rawText, character?.name);
          if (cleaned) return cleaned;
        }
      }

      // If system_instruction was rejected (400), try fallback format with prompt prepended to user turn
      if (res.status === 400) {
        const fallbackContents = [
          { role: 'user', parts: [{ text: `(Context: ${fullSystemPrompt})\n\nMessage: ${userMessage}` }] },
        ];
        const resFallback = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: fallbackContents,
            generationConfig: { maxOutputTokens: 280 },
          }),
        });

        if (resFallback.ok) {
          const data = await resFallback.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleaned = cleanAiResponseText(rawText, character?.name);
            if (cleaned) return cleaned;
          }
        }
      }

      const errJson = await res.json().catch(() => ({}));
      lastErrorMsg = errJson?.error?.message || `HTTP ${res.status} from ${model}`;
    } catch (e) {
      lastErrorMsg = e.message || 'Network request error';
    }
  }

  throw new Error(lastErrorMsg || 'All available Gemini models were busy or unavailable.');
}
