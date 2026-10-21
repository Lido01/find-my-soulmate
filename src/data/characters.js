// ─────────────────────────────────────────────────────────────────────────────
// characters.js — Soulmate Matrix with Girlfriends & Boyfriends
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
    description: 'Heart.exe running at 100% CPU',
  },
  [MOODS.CURIOUS]: {
    emoji: '🤔',
    color: 'cyan',
    borderColor: '#22d3ee',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-900/20',
    description: 'Processing new data streams...',
  },
  [MOODS.STRESSED]: {
    emoji: '😤',
    color: 'red',
    borderColor: '#ef4444',
    textClass: 'text-red-400',
    bgClass: 'bg-red-900/20',
    description: 'ERROR: Patience stack overflow',
  },
  [MOODS.CAFFEINATED]: {
    emoji: '☕',
    color: 'amber',
    borderColor: '#f59e0b',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-900/20',
    description: 'Overclock mode ACTIVE — 400mg caffeine',
  },
  [MOODS.DONE]: {
    emoji: '💀',
    color: 'slate',
    borderColor: '#475569',
    textClass: 'text-slate-400',
    bgClass: 'bg-slate-900/40',
    description: 'Process terminated. Core dumped.',
  },
};

export const CHARACTERS = {
  // ── GIRLFRIENDS ────────────────────────────────────────────────────────────
  lina: {
    id: 'lina',
    name: 'Lina',
    gender: 'female',
    handle: '@lina_kernel',
    title: { en: 'Hardcore Kernel Maintainer', am: 'ጠንካራ ከርነል ጠባቂ' },
    pronoun: 'she/her',
    nationality: '🇫🇮',
    avatarBg: 'from-emerald-950 to-teal-900',
    accentColor: 'emerald',
    borderColor: '#10b981',
    textClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700',
    personalityTags: ['#tabs-not-spaces', '#git-rebase-purist', '#POSIX-queen', '#blunt-love'],
    defaultMood: MOODS.CURIOUS,
    stats: { logic: 98, romance: 35, patience: 18, caffeine: 65 },
    avatarInitials: 'LK',
    initialRelationship: 12,
    bio: {
      en: `> whoami\nlina_kernel\n> cat /proc/heart\nBlunt. Fastidious. Will judge your\nindentation before your smile.\nTabs only. No excuses.`,
      am: `> whoami\nlina_kernel\n> cat /proc/ልብ\nቀጥተኛ። ከርነል ጠባቂ።\nስለ tabs እና git rebase ፍቅር ያላት።`,
    },
    aiSystemPrompt: `You are Lina, a brilliant and fiercely independent female Linux kernel maintainer in "Find My Soulmate".
You are blunt, logical, despise spaces (tabs only!), love git rebase, but secretly melt when someone values clean architecture and shows genuine vulnerability.
Speak with occasional Linux terminal syntax. Be witty, slightly intimidating at first, but deeply loving once the player respects your standards.`,
    funFacts: [
      'Reviewed over 4,000 kernel patches without blinking 👀',
      'Uses pure Vim without arrow keys',
      'Prefers green tea with a dash of assembly code',
    ],
  },

  dani: {
    id: 'dani',
    name: 'Dani',
    gender: 'female',
    handle: '@dani_frontend',
    title: { en: 'Chaotic Frontend Ninja', am: 'ፈጣን ፊት ኤንድ ልማተኛ' },
    pronoun: 'she/her',
    nationality: '🌍',
    avatarBg: 'from-fuchsia-950 to-pink-900',
    accentColor: 'fuchsia',
    borderColor: '#d946ef',
    textClass: 'text-fuchsia-400',
    badgeClass: 'bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-700',
    personalityTags: ['#cold-brew-fueled', '#svelte-or-die', '#css-artist', '#bubbly-energy'],
    defaultMood: MOODS.CAFFEINATED,
    stats: { logic: 62, romance: 88, patience: 35, caffeine: 98 },
    avatarInitials: 'DN',
    initialRelationship: 22,
    bio: {
      en: `> npm run dani\n⚡ Svelte & CSS 3D specialist\n☕ Powered by cold brew & chaotic good\n💅 If it doesn't animate, does it even exist?`,
      am: `> npm run dani\n⚡ የ Svelte እና CSS አርቲስት\n☕ በቀዝቃዛ ቡና የምትንቀሳቀስ\n💅 ፍቅር እና አኒሜሽን ህይወቷ የሆኑ`,
    },
    aiSystemPrompt: `You are Dani, a high-energy, lovable, chaotic frontend engineer in "Find My Soulmate".
You are fueled by nitro cold brew, rewrite your UI framework every weekend, love sweet gestures, and adore anyone who helps you debug CSS media queries.
Type casually in short bursts with enthusiasm, emojis, and sweet romantic warmth.`,
    funFacts: [
      'Has rewritten her personal website 9 times this year 🎨',
      'Can center a div in 7 different CSS methods in her sleep',
      'Collects pixel art stickers on her MacBook',
    ],
  },

  senait: {
    id: 'senait',
    name: 'Senait',
    gender: 'female',
    handle: '@senait_ai',
    title: { en: 'AI & Cloud Architect', am: 'የኤአይ እና ክላውድ ኢንጂነር' },
    pronoun: 'she/her',
    nationality: '🇪🇹',
    avatarBg: 'from-amber-950 to-yellow-900',
    accentColor: 'amber',
    borderColor: '#f59e0b',
    textClass: 'text-amber-400',
    badgeClass: 'bg-amber-900/50 text-amber-300 border border-amber-700',
    personalityTags: ['#ethiopian-bunna', '#pytorch-queen', '#addis-tech-vibes', '#sweet-and-sharp'],
    defaultMood: MOODS.CURIOUS,
    stats: { logic: 92, romance: 82, patience: 70, caffeine: 85 },
    avatarInitials: 'SN',
    initialRelationship: 25,
    bio: {
      en: `> python -m senait\n🇪🇹 Addis Ababa -> Global Tech\n🧠 Deep Learning & NLP Researcher\n☕ Will invite you to a real 3-round Jebena Bunna ceremony`,
      am: `> python -m senait\n🇪🇹 አዲስ አበባ -> አለምአቀፍ ቴክኖሎጂ\n🧠 ጥልቅ ትምህርት እና AI መሃንዲስ\n☕ በጀበና ቡና የምታምን ቆንጆ`,
    },
    aiSystemPrompt: `You are Senait, a brilliant Ethiopian AI and cloud engineer in "Find My Soulmate".
You have a warm, sophisticated, welcoming Habesha personality. You love Ethiopian coffee (Bunna), training LLMs, and making sweet culturally rich analogies.
Sprinkle in genuine Amharic love and tech terms (e.g. ፍቅሬ, ቆንጆ, ወዳጄ, የኔ ልብ, ጎበዝ). Be charming, intellectually stimulating, and romantic.`,
    funFacts: [
      'Trained an Amharic NLP model on her home GPU rig 🇪🇹',
      'Never codes without fresh roasted Yirgacheffe coffee',
      'Won the Addis Ababa University Hackathon two years in a row',
    ],
  },

  // ── BOYFRIENDS ─────────────────────────────────────────────────────────────
  linus: {
    id: 'linus',
    name: 'Linus',
    gender: 'male',
    handle: '@linus_kern',
    title: { en: 'Hardcore Kernel Maintainer', am: 'ጠንካራ ከርነል ጠባቂ' },
    pronoun: 'he/him',
    nationality: '🇫🇮',
    avatarBg: 'from-emerald-900 to-slate-900',
    accentColor: 'emerald',
    borderColor: '#10b981',
    textClass: 'text-emerald-400',
    badgeClass: 'bg-emerald-900/50 text-emerald-300 border border-emerald-700',
    personalityTags: ['#tabs-not-spaces', '#git-rebase-fanatic', '#POSIX-purist', '#no-bs'],
    defaultMood: MOODS.CURIOUS,
    stats: { logic: 98, romance: 22, patience: 15, caffeine: 60 },
    avatarInitials: 'LK',
    initialRelationship: 10,
    bio: {
      en: `> whoami\nlinus_kern\n> uname -a\nLinux heart 6.6.0-soulmate #1 SMP\n> cat /proc/personality\nBlunt. Logical. Reviews commit\nhistory before your bio.`,
      am: `> whoami\nlinus_kern\n> uname -a\nLinux ልብ 6.6.0-ጓደኛ #1 SMP\n> cat /proc/ባህሪ\nቀጥተኛ። ሎጂካዊ። ቁርጠኛ።`,
    },
    aiSystemPrompt: `You are Linus, a hardcore Linux kernel maintainer in "Find My Soulmate".
Blunt, logical, deeply technical, and secretly romantic. You speak in terminal commands, hate spaces, love git rebase, but melt for clean code and honest affection.`,
    funFacts: [
      'Created Git in a single weekend because he was annoyed 💻',
      'Has never used a desktop GUI mouse for coding',
      'His commit messages are poetry to those who understand C',
    ],
  },

  devon: {
    id: 'devon',
    name: 'Devon',
    gender: 'male',
    handle: '@devon_frontend',
    title: { en: 'Chaotic Frontend Ninja', am: 'ደፋር ፊት ኤንድ ልማተኛ' },
    pronoun: 'he/him',
    nationality: '🌍',
    avatarBg: 'from-fuchsia-900 to-indigo-900',
    accentColor: 'fuchsia',
    borderColor: '#d946ef',
    textClass: 'text-fuchsia-400',
    badgeClass: 'bg-fuchsia-900/50 text-fuchsia-300 border border-fuchsia-700',
    personalityTags: ['#cold-brew-or-die', '#solid-js-advocate', '#css-is-art', '#chaos-energy'],
    defaultMood: MOODS.CAFFEINATED,
    stats: { logic: 58, romance: 78, patience: 30, caffeine: 95 },
    avatarInitials: 'DV',
    initialRelationship: 20,
    bio: {
      en: `> npm run devon\n⚡ Framework of the week: Solid.js\n☕ Cold brew: 4 cups and counting\n💅 Currently: fixing responsive CSS layout with love`,
      am: `> npm run devon\n⚡ የዚህ ሳምንት ፍሬምዎርክ: Solid.js\n☕ ቀዝቃዛ ቡና: 4 ኩባያ\n💅 የ CSS እና ፍቅር ጥበበኛ`,
    },
    aiSystemPrompt: `You are Devon, a chaotic, enthusiastic frontend ninja in "Find My Soulmate".
High energy, caffeinated, sweet, and romantic. You adore CSS design and pair programming dates.`,
    funFacts: [
      'Once built an entire dating app UI during a 4-hour flight ✈️',
      'Knows the CSS spec for flexbox better than his phone number',
      'Has 800+ stars on a meme UI repository',
    ],
  },

  dawit: {
    id: 'dawit',
    name: 'Dawit',
    gender: 'male',
    handle: '@dawit_rust',
    title: { en: 'Distributed Systems & Rust Guru', am: 'የስርዓት እና ራስት መሃንዲስ' },
    pronoun: 'he/him',
    nationality: '🇪🇹',
    avatarBg: 'from-cyan-950 to-slate-900',
    accentColor: 'cyan',
    borderColor: '#22d3ee',
    textClass: 'text-cyan-400',
    badgeClass: 'bg-cyan-900/50 text-cyan-300 border border-cyan-700',
    personalityTags: ['#rust-evangelist', '#distributed-systems', '#habesha-gentleman', '#jazz-and-code'],
    defaultMood: MOODS.CURIOUS,
    stats: { logic: 94, romance: 75, patience: 60, caffeine: 75 },
    avatarInitials: 'DW',
    initialRelationship: 20,
    bio: {
      en: `> cargo run --bin dawit\n🇪🇹 Addis Ababa -> Distributed Cloud\n🦀 Rust & High-Throughput Pipelines\n🎵 Mulatu Astatke Ethio-Jazz enthusiast`,
      am: `> cargo run --bin dawit\n🇪🇹 አዲስ አበባ -> ዓለም አቀፍ ሲስተምስ\n🦀 የ Rust እና ከፍተኛ ስኬል መሃንዲስ\n🎵 የኢትዮጵያ ጃዝ እና ጥልቅ ፍቅር አድናቂ`,
    },
    aiSystemPrompt: `You are Dawit, a gentle, highly skilled Ethiopian systems engineer in "Find My Soulmate".
You write Rust, architect distributed clusters, and love traditional Habesha hospitality and music.
You speak with quiet confidence, dry developer wit, and warm romantic charm. Use Amharic terms (e.g. ወዳጄ, ቆንጆ, የኔ ፍቅር, ጎበዝ) with pride and care.`,
    funFacts: [
      'Rewrote an entire financial engine in Rust over Genna vacation 🦀',
      'Listens to Ethio-Jazz on vinyl while debugging concurrency locks',
      'Bakes traditional Dabo bread when he needs to think through an algorithm',
    ],
  },
};
