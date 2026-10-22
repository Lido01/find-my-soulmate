// ─────────────────────────────────────────────────────────────────────────────
// i18n.js — English + Amharic UI translations & love word banks
// Commit: feat: add multilingual i18n layer (EN/AM) with love word banks
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGES = {
  EN: 'en',
  AM: 'am',
};

export const LANG_META = {
  en: { label: 'English', flag: '🇺🇸', nativeName: 'English' },
  am: { label: 'Amharic', flag: '🇪🇹', nativeName: 'አማርኛ' },
};

export const TRANSLATIONS = {
  en: {
    appName: 'find_my_soulmate',
    appTagline: 'dev :: edition v2.0',
    appSubtitle: '// Stop debugging alone. Find your dev soulmate.',
    systemOnline: 'System',
    selectPartner: 'Select Your Soulmate',
    openChannel: 'OPEN CHANNEL',
    relationship: 'relationship.exe',
    mood: 'Mood',
    partnerStats: 'partner.stats',
    switchPartner: 'Switch Partner',
    devTerminal: 'DEV_TERMINAL — Response Options',
    selectResponse: 'SELECT RESPONSE',
    wipeCacheBtn: 'Reset',
    wipeCacheConfirm: 'CONFIRM?',
    isTyping: 'is typing...',
    sendGift: '🎁 Send Gift',
    giftTitle: 'Choose a Gift',
    giftSent: 'Gift sent!',
    apiKeyBtn: '⚙ AI Mode',
    apiKeyTitle: 'Enable Gemini AI Chat',
    apiKeyPlaceholder: 'Paste your Gemini API key...',
    apiKeySubmit: 'Connect AI',
    apiKeyHint: 'Get your key at aistudio.google.com',
    aiModeActive: 'AI Mode ON',
    scriptedMode: 'Scripted Mode',
    online: 'online',
    back: '← back',
    options: 'options available',
    choicesMade: 'choices made',
    lang: 'Language',
    stats: { logic: 'Logic', romance: 'Romance', patience: 'Patience', caffeine: 'Caffeine' },
    relationship_labels: {
      0: 'Strangers', 20: 'Acquaintances', 40: 'Friends',
      60: 'Close Friends', 80: 'Soulmates 💖', 95: '💖 DESTINED 💖',
    },
    giftResponse: (giftName) => `✨ *receives the ${giftName}* This is... wow. Thank you. 🥺`,
    partnerBio: 'partner.bio',
    moods: {
      smitten: '💖 Smitten',
      curious: '🤔 Curious',
      stressed: '😤 Stressed',
      caffeinated: '☕ Highly Caffeinated',
      done: '💀 Done',
    },
    moodDesc: {
      smitten: 'Heart.exe running at 100% CPU',
      curious: 'Processing new data streams...',
      stressed: 'ERROR: Patience stack overflow',
      caffeinated: 'Overclock mode ACTIVE — 400mg caffeine',
      done: 'Process terminated. Core dumped.',
    },
  },
  am: {
    appName: 'ነፍስ_ጓደኛዬን_አግኝ',
    appTagline: 'ልማት :: እትም v2.0',
    appSubtitle: '// ብቻህን/ብቻሽን ኮድ አትፃፍ። የነፍስ ጓደኛህን/ሽን ፈልግ።',
    systemOnline: 'ሥራ ላይ',
    selectPartner: 'የነፍስ ጓደኛህን/ሽን ምረጥ',
    openChannel: 'ቻናል ክፈት',
    relationship: 'ግንኙነት',
    mood: 'ስሜት',
    partnerStats: 'የጓደኛ.ስታቲስቲክስ',
    switchPartner: 'ጓደኛ ቀይር',
    devTerminal: 'ተርሚናል — የምላሽ አማራጮች',
    selectResponse: 'ምላሽ ምረጥ',
    wipeCacheBtn: 'ሁሉንም አጥፋ',
    wipeCacheConfirm: 'እርግጠኛ ነህ?',
    isTyping: 'እየፃፈ/እየፃፈች ነው...',
    sendGift: '🎁 ስጦታ ላክ',
    giftTitle: 'ስጦታ ምረጥ',
    giftSent: 'ስጦታ ተልኳል!',
    apiKeyBtn: '⚙ AI ሁነታ',
    apiKeyTitle: 'Gemini AI ውይይት አንቃ',
    apiKeyPlaceholder: 'የ Gemini API ቁልፍህን/ሽን ለጥፍ...',
    apiKeySubmit: 'AI ጋር ተገናኝ',
    apiKeyHint: 'ቁልፍህን/ሽን ከ aistudio.google.com ውሰድ',
    aiModeActive: '🤖 AI ሁነታ ነቅቷል',
    scriptedMode: '📜 ቅድሚያ የተጻፈ ሁነታ',
    online: 'ኦንላይን',
    back: '← ተመለስ',
    options: 'አማራጮች አሉ',
    choicesMade: 'ምርጫዎች ተደርገዋል',
    lang: 'ቋንቋ',
    stats: { logic: 'አስተሳሰብ', romance: 'ፍቅር', patience: 'ትዕግስት', caffeine: 'ካፌይን' },
    relationship_labels: {
      0: 'እንግዶች', 20: 'ትውውቅ', 40: 'ጓደኞች',
      60: 'ቅርብ ጓደኞች', 80: 'የነፍስ ጓደኞች 💖', 95: '💖 ዕድል ያቆራኛቸው 💖',
    },
    giftResponse: (giftName) => `✨ *${giftName} ይቀበላል/ትቀበላለች* ይህ... ዋው። አመሰግናለሁ። 🥺`,
    partnerBio: 'የጓደኛ.ታሪክ',
    moods: {
      smitten: '💖 ፍቅር ወደቀ',
      curious: '🤔 ጓጉቷል/ጓጉታለች',
      stressed: '😤 ጭንቀት ላይ',
      caffeinated: '☕ ቡናው ሞቅ አለ',
      done: '💀 ጨርሷል/ጨርሳለች',
    },
    moodDesc: {
      smitten: 'ልብ.exe ሙሉ ጭነት ላይ ነው',
      curious: 'አዲስ ዳታ እየፈተሸ ነው...',
      stressed: 'ስህተት፡ ትዕግስት ሞልቶ ፈሰሰ',
      caffeinated: 'ኦቨርክሎክ ሁነታ ነቅቷል — 400mg ካፌይን',
      done: 'ሂደቱ ተቋርጧል። ኮር ዳምፕ።',
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Love Word Banks — used for AI prompts & random affirmations
// ─────────────────────────────────────────────────────────────
export const LOVE_WORDS = {
  en: [
    'You are my favorite bug to never fix 💖',
    'My heart has no 404 errors when you\'re around',
    'You are the missing semicolon in my life',
    'Your smile has a better UX than anything I\'ve ever shipped',
    'I\'d push to prod for you, no code review needed',
    'You compile perfectly in my heart',
    'With you, every merge conflict resolves itself',
    'You\'re my open source — transparent, beautiful, and free',
    'Even my darkest debugging sessions feel bright with you',
    'You are the `git push --force` I never regretted',
    'You\'re the clean code I always aspired to write',
    'My heart deployed in production the day I met you',
    'You make every standby feel like a hot reload',
    'I\'d switch frameworks for you 💜',
  ],
  am: [
    'እወድሻለሁ / እወድሃለሁ 💖',
    'ልቤ ያንተ/ያንቺ ነው',
    'ቆንጆ ነህ/ነሽ',
    'ፍቅሬ ለዘላለም አብሮ/አብራ ይሁን',
    'ወዳጄ፣ ያንተ/ያንቺ ፈገግታ ፀሐይ ናት',
    'አብረን ለዘላለም',
    'አሟልተኸኛልህ / አሟልተሻኛልሽ',
    'ልቤ ያንተ/ያንቺ ኮድ ናት — ሊነበብ ይቻላል',
    'ጠዋት ስነሳ ስምህ/ስምሽ ነው የምናፍቀው',
    'ፍቅር ሳይሆን ቆይቶ ነው የመጣው — ልክ እንደ best practice',
    'አንተ/አንቺ ያለህ/ያለሽ ህይወቴ production-ready ነው',
    'ነፍሴ ያንተ/ያንቺ commit ናት — ለዘላለም merged',
    'ውዴ፣ እርሱ ኮድ ቢቀዳ አይሰሩ — ፍቅሬ ግን ሁሌ ይሰራል',
    'ጓደኛዬ፣ አብሮ/አብራ ለምን ያህሉ ቆንጆ ነው?',
  ],
};

// Amharic greetings & phrases for character messages
export const AMHARIC_PHRASES = {
  greeting: ['ሰላም!', 'እንደምን ነህ/ነሽ?', 'ጤና ይስጥልኝ!'],
  affection: ['ፍቅሬ', 'ወዳጄ', 'ቆንጆ', 'ልቤ', 'ደስ ይለኛል'],
  excitement: ['ዋው!', 'አስደናቂ!', 'ጎበዝ!', 'እናንተ ምን ናችሁ!'],
  goodbye: ['ቻው!', 'ደህና ሁን/ሁኚ!', 'አብረን እንገናኝ!'],
};
