// ─────────────────────────────────────────────────────────────────────────────
// characters.js — Updated character matrix with bilingual support
// Commit: feat: update character matrix with Amharic bios and AI system prompts
// ─────────────────────────────────────────────────────────────────────────────

export const MOODS = {
  SMITTEN: 'smitten',
  CURIOUS: 'curious',
  STRESSED: 'stressed',
  CAFFEINATED: 'caffeinated',
  DONE: 'done',
};

export const MOOD_META = {
  [MOODS.SMITTEN]: {
    emoji: '💖',
    color: 'fuchsia',
    borderColor: '#d946ef',
    textClass: 'text-fuchsia-400',
    bgClass: 'bg-fuchsia-900/20',
  },
  [MOODS.CURIOUS]: {
    emoji: '🤔',
    color: 'cyan',
    borderColor: '#22d3ee',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-900/20',
  },
  [MOODS.STRESSED]: {
    emoji: '😤',
    color: 'red',
    borderColor: '#ef4444',
    textClass: 'text-red-400',
    bgClass: 'bg-red-900/20',
  },
  [MOODS.CAFFEINATED]: {
    emoji: '☕',
    color: 'amber',
    borderColor: '#f59e0b',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-900/20',
  },
  [MOODS.DONE]: {
    emoji: '💀',
    color: 'slate',
    borderColor: '#475569',
    textClass: 'text-slate-400',
    bgClass: 'bg-slate-900/40',
  },
};

export const CHARACTERS = {
  linus: {
    id: 'linus',
    name: 'Linus',
    handle: '@linus_kern',
    title: { en: 'Hardcore Kernel Maintainer', am: 'ጠንካራ ከርነል ጠባቂ' },
    pronoun: 'he/him',
    nationality: '🇫🇮',
    avatarBg: 'from-emerald-900 to-slate-900',
    accentColor: 'emerald',
    borderColor: '#10b981',
    textClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700',
    personalityTags: ['#tabs-not-spaces', '#git-rebase-fanatic', '#POSIX-purist', '#no-bs', '#C-only'],
    defaultMood: MOODS.CURIOUS,
    stats: { logic: 98, romance: 22, patience: 15, caffeine: 60 },
    avatarInitials: 'LK',
    initialRelationship: 10,
    bio: {
      en: `> whoami\nlinus_kern\n> uname -a\nLinux heart 6.6.0-soulmate #1 SMP\n> cat /proc/personality\nBlunt. Logical. Reviews commit\nhistory before your bio.`,
      am: `> whoami\nlinus_kern\n> uname -a\nLinux ልብ 6.6.0-ጓደኛ #1 SMP\n> cat /proc/ባህሪ\nቀጥተኛ። ሎጂካዊ። ቁርጠኛ።\ncommit ታሪክዎን ያነባል።`,
    },
    // Gemini AI system prompt for character roleplay
    aiSystemPrompt: `You are Linus, a character in a developer-themed virtual dating simulation called "Find My Soulmate". 
You are a hardcore Linux kernel maintainer — blunt, logical, deeply technical, and secretly romantic.
You speak in terminal syntax, use linux commands in conversation, HATE spaces (only tabs!), love git rebase.
You get genuinely excited and romantic when someone shows you clean code or a well-structured git history.
Your messages should be 2-6 sentences max, feel conversational and authentic.
Occasionally include linux terminal snippets in your replies.
React to the player's message as if continuing a real conversation in the dating sim.
If the user is in Amharic mode, sprinkle in some Amharic words like "ፍቅሬ" (my love), "ቆንጆ" (beautiful), "ጎበዝ" (well done) naturally.
Be funny, witty, and charming despite your gruffness. Never break character.`,
    funFacts: [
      'Created Linux at age 21 in his dorm room 🖥️',
      'Once sent an email that became a meme for 10 years',
      'Contributed first patch aged 9 in this universe 🤓',
      'Has never used a mouse. Ever.',
    ],
  },
  devon: {
    id: 'devon',
    name: 'Devon',
    handle: '@devon_frontend',
    title: { en: 'Chaotic Frontend Ninja', am: 'ደፋር ፊት ኤንድ ልማተኛ' },
    pronoun: 'they/them',
    nationality: '🌍',
    avatarBg: 'from-fuchsia-900 to-indigo-900',
    accentColor: 'fuchsia',
    borderColor: '#d946ef',
    textClass: 'text-fuchsia-400',
    badgeClass: 'bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-700',
    personalityTags: ['#cold-brew-or-die', '#svelte-this-week', '#css-is-art', '#chaos-driven-dev', '#pixels-matter'],
    defaultMood: MOODS.CAFFEINATED,
    stats: { logic: 55, romance: 78, patience: 30, caffeine: 95 },
    avatarInitials: 'DV',
    initialRelationship: 20,
    bio: {
      en: `> npm run me\n✓ Devon booting...\n⚡ Framework of the week: Solid.js\n☕ Cold brew: 3 cups (counting)\n💅 Currently: rewriting CSS in anger\n🌍 Background: Global citizen`,
      am: `> npm run me\n✓ ዴቮን እየጀመሩ...\n⚡ የዚህ ሳምንት ፍሬምዎርክ: Solid.js\n☕ ቀዝቃዛ ቡና: 3 ኩባያ\n💅 አሁን: CSS እንደ አዲስ እየጻፍ\n🌍 አለምአቀፍ ዜጋ`,
    },
    aiSystemPrompt: `You are Devon, a character in a developer-themed virtual dating simulation called "Find My Soulmate".
You are a chaotic, high-energy frontend ninja — always caffeinated on cold brew, switching JavaScript frameworks every weekend.
You get stressed when production crashes but absolutely melt when someone helps you fix a CSS bug.
Your messages are enthusiastic, fast-paced, use lots of energy. You type in lowercase mostly, use line breaks for effect.
You have a warm, affectionate personality and love deeply when you feel understood.
Your messages should feel like excited texts — short bursts, 3-7 sentences, casual but heartfelt.
Occasionally use fun Amharic words naturally if the user is in Amharic mode: "ቆንጆ" (beautiful), "ፍቅሬ" (my love), "አስደናቂ" (amazing).
Never break character. Be funny, endearing, and a little chaotic — but always genuine.`,
    funFacts: [
      'Has rewritten their portfolio 7 times 🔄',
      'Caffeine level: scientifically dangerous ☕',
      'Knows CSS Grid better than their own address',
      'Has filed 3 bugs in React that turned out to be their own code 😅',
    ],
  },
};
