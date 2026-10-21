// ─────────────────────────────────────────────────────────────────────────────
// romanticLove.js — Developer Love metrics, gender-specific romantic quotes & emojis
// ─────────────────────────────────────────────────────────────────────────────

export const DEV_LOVE_EMOJIS = [
  { emoji: '💖', label: { en: 'Smitten Heart', am: 'የፍቅር ልብ' }, code: 'git.heart = 100%' },
  { emoji: '☕❤️', label: { en: 'Brew Romance', am: 'የቡና ፍቅር' }, code: 'caffeine.love++' },
  { emoji: '🫀⚡', label: { en: 'Overclocked Pulse', am: 'ፈጣን የልብ ምት' }, code: 'heart.overclock()' },
  { emoji: '💻🌹', label: { en: 'Code & Roses', am: 'ኮድና ጽጌረዳ' }, code: 'import { Rose }' },
  { emoji: '💍💾', label: { en: 'Eternal Commit', am: 'የዘላለም ቃል' }, code: 'git.commit("marry_me")' },
  { emoji: '✨🥰', label: { en: 'Pure Euphoria', am: 'ደስታ' }, code: 'dopamine.emit()' },
  { emoji: '🔐💘', label: { en: 'Root Access Love', am: 'ሙሉ ፈቃድ ፍቅር' }, code: 'sudo chmod 777 heart' },
  { emoji: '🥺👉👈', label: { en: 'Shy PR', am: 'የልብ ጥያቄ' }, code: 'git.pullRequest.hope()' },
  { emoji: '🇪🇹☕', label: { en: 'Bunna Date', am: 'የቡና ቀጠሮ' }, code: 'traditional.bunna()' },
  { emoji: '🧑‍💻👩‍💻', label: { en: 'Pair Programming', am: 'አብሮ ኮዲንግ' }, code: 'pair.sync(love)' },
];

/**
 * Returns strictly gender-accurate romantic quotes (no slashes like እሱ/ሷ or አንተ/ቺ)
 * @param {'female'|'male'} targetGender - The gender of the soulmate you are talking to
 * @param {'en'|'am'} lang - Language
 */
export function getRomanticQuotes(targetGender = 'female', lang = 'en') {
  const isFemale = targetGender === 'female';

  if (lang === 'am') {
    if (isFemale) {
      // Sent to a GIRLFRIEND (female partner)
      return [
        { text: "የልቤን root access ወስደሻል የኔ ቆንጆ 💖", devTag: "#root-ፍቅር" },
        { text: "ካንቺ ጋር ስሆን ህይወቴ ዜሮ compile error ነው 🥰", devTag: "#ፍጹም-ኮድ" },
        { text: "ልቤ እንዳለቀለት infinite loop በስምሽ ይሮጣል ☕", devTag: "#የማያልቅ-ፍቅር" },
        { text: "የኔ ቆንጆ፣ አንቺ የኔ ተወዳጅ PR ነሽ 💍", devTag: "#የልብ-መርጅ" },
        { text: "በህይወቴ ውስጥ በጣም ውቡ ፍሬምዎርክ አንቺ ነሽ ✨", devTag: "#ልዩ-ውበት" },
        { text: "እንደ ኢትዮጵያ ምርጥ ቡና ሞቅ ያልሽ የኔ ፍቅር 🫘❤️", devTag: "#የሀገር-ፍቅር" },
        { text: "ፍቅርሽ በሙሉ ልቤ ተሰማርቷል — 100% uptime 🚀", devTag: "#ዘላቂ-ግንኙነት" },
        { text: "የኔ ቆንጆ ገንቢ፣ ሁሌም በልቤ ውስጥ ነሽ! 💻❤️", devTag: "#የኔ-ልብ" },
      ];
    } else {
      // Sent to a BOYFRIEND (male partner)
      return [
        { text: "የልቤን root access ወስደሃል የኔ ጀግና 💖", devTag: "#root-ፍቅር" },
        { text: "ካንተ ጋር ስሆን ህይወቴ ዜሮ compile error ነው 🥰", devTag: "#ፍጹም-ኮድ" },
        { text: "ልቤ እንዳለቀለት infinite loop በስምህ ይሮጣል ☕", devTag: "#የማያልቅ-ፍቅር" },
        { text: "የኔ ጎበዝ፣ አንተ የኔ ተወዳጅ PR ነህ 💍", devTag: "#የልብ-መርጅ" },
        { text: "በህይወቴ ውስጥ በጣም ውቡ ፍሬምዎርክ አንተ ነህ ✨", devTag: "#ልዩ-ውበት" },
        { text: "እንደ ኢትዮጵያ ምርጥ ቡና ሞቅ ያልህ የኔ ፍቅር 🫘❤️", devTag: "#የሀገር-ፍቅር" },
        { text: "ፍቅርህ በሙሉ ልቤ ተሰማርቷል — 100% uptime 🚀", devTag: "#ዘላቂ-ግንኙነት" },
        { text: "የኔ ጎበዝ ኢንጂነር፣ ሁሌም በልቤ ውስጥ ነህ! 💻❤️", devTag: "#የኔ-ልብ" },
      ];
    }
  }

  // English quotes
  if (isFemale) {
    return [
      { text: "You're the queen of my codebase and the smile of my day 💖", devTag: "#syntax-romance" },
      { text: "My heart has 100% test coverage whenever you're around, beautiful 🥰", devTag: "#qa-love" },
      { text: "Can I be the CSS to your HTML? You make everything look gorgeous ✨", devTag: "#frontend-soul" },
      { text: "You're my only commit with zero merge conflicts, darling 💍", devTag: "#clean-merge" },
      { text: "I'd never garbage-collect you from my memory heap, sweet girl 🧠❤️", devTag: "#memory-safe" },
      { text: "You turn all my fatal errors into butterflies in my stomach 🦋", devTag: "#exception-handled" },
      { text: "My ping to your heart is 0ms. Direct fiber connection ⚡", devTag: "#low-latency" },
      { text: "You're the open source license I will honor forever, my love 📜💖", devTag: "#mit-forever" },
    ];
  } else {
    return [
      { text: "You're the architect of my heart and the reason I love coding 💖", devTag: "#syntax-romance" },
      { text: "My heart has 100% test coverage whenever you're by my side, handsome 🥰", devTag: "#qa-love" },
      { text: "You turn all my stack traces into pure butterflies in my stomach ✨", devTag: "#frontend-soul" },
      { text: "You're my only commit with zero merge conflicts, handsome 💍", devTag: "#clean-merge" },
      { text: "I'd never garbage-collect you from my memory heap, my dev king 🧠❤️", devTag: "#memory-safe" },
      { text: "Let's push to production together and never look back 🚀", devTag: "#prod-ready" },
      { text: "My ping to your heart is 0ms. Direct fiber connection ⚡", devTag: "#low-latency" },
      { text: "You're the open source license I will honor forever, my love 📜💖", devTag: "#mit-forever" },
    ];
  }
}

// Backward compatible export for static fallback
export const DEV_ROMANTIC_QUOTES = {
  en: getRomanticQuotes('female', 'en'),
  am: getRomanticQuotes('female', 'am'),
};

// Calculate realistic Love Metrics based on relationship level
export function calculateLoveMetrics(relationship = 10, totalChoices = 0, giftsGiven = []) {
  const bond = Math.max(0, Math.min(100, relationship));
  
  // Heartbeat BPM ranges from 68 (calm strangers) to 128 (deeply in love)
  const heartbeatBPM = Math.round(68 + (bond / 100) * 60);

  // Love tier description
  let tier = "Curious Ping";
  let statusEmoji = "🤔";
  if (bond >= 90) {
    tier = "Soulmate & Eternal Pair 💖";
    statusEmoji = "💍";
  } else if (bond >= 75) {
    tier = "Deep Devotion & Smitten 🥰";
    statusEmoji = "💖";
  } else if (bond >= 55) {
    tier = "Warm Chemistry & Late Night Calls ✨";
    statusEmoji = "☕";
  } else if (bond >= 35) {
    tier = "Affectionate Coding Buddies 💻";
    statusEmoji = "🤗";
  } else if (bond >= 20) {
    tier = "Mutual Admiration 👀";
    statusEmoji = "🌱";
  }

  // Dropped packets (low dropped packets = great connection)
  const droppedPackets = Math.max(0, Math.round(15 - (bond / 100) * 15));

  // Compatibility score
  const compatibility = Math.min(100, Math.round(65 + (bond / 100) * 35));

  return {
    bond,
    heartbeatBPM,
    tier,
    statusEmoji,
    droppedPackets,
    compatibility,
    giftsCount: giftsGiven.length,
    totalChoices,
  };
}
