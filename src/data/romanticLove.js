// ─────────────────────────────────────────────────────────────────────────────
// romanticLove.js — Developer Love metrics, romantic emoji banks & love words
// ─────────────────────────────────────────────────────────────────────────────

export const DEV_LOVE_EMOJIS = [
  { emoji: '💖', label: { en: 'Smitten Heart', am: 'የፍቅር ልብ' }, code: 'git.heart = 100%' },
  { emoji: '☕❤️', label: { en: 'Brew Romance', am: 'የቡና ፍቅር' }, code: 'caffeine.love++' },
  { emoji: '🫀⚡', label: { en: 'Overclocked Pulse', am: 'ፈጣን የልብ ምት' }, code: 'heart.overclock()' },
  { emoji: '💻🌹', label: { en: 'Code & Roses', am: 'ኮድና ጽጌረዳ' }, code: 'import { Rose }' },
  { emoji: '💍💾', label: { en: 'Eternal Commit', am: 'የዘላለም ቃል' }, code: 'git.commit("marry_me")' },
  { emoji: '✨🥰', label: { en: 'Pure Euphoria', am: 'ደስታ' }, code: 'dopamine.emit()' },
  { emoji: '🔐💘', label: { en: 'Root Access Love', am: 'ሙሉ ፈቃድ ፍቅር' }, code: 'sudo chmod 777 heart' },
  { emoji: '🥺👉👈', label: { en: 'Shy PR', am: 'እባክህ/እባክሽ' }, code: 'git.pullRequest.hope()' },
  { emoji: '🇪🇹☕', label: { en: 'Bunna Date', am: 'የቡና ቀጠሮ' }, code: 'traditional.bunna()' },
  { emoji: '🧑‍💻👩‍💻', label: { en: 'Pair Programming', am: 'አብሮ ኮዲንግ' }, code: 'pair.sync(love)' },
];

export const DEV_ROMANTIC_QUOTES = {
  en: [
    { text: "You are the missing semicolon in my life 💖", devTag: "#syntax-romance" },
    { text: "My heart has 100% test coverage whenever you're around 🥰", devTag: "#qa-love" },
    { text: "Can I be the CSS to your HTML? Let's style this life together ✨", devTag: "#frontend-soul" },
    { text: "You're my only commit with zero merge conflicts 💍", devTag: "#clean-merge" },
    { text: "I'd never garbage-collect you from my memory heap 🧠❤️", devTag: "#memory-safe" },
    { text: "You turn all my fatal errors into butterflies in my stomach 🦋", devTag: "#exception-handled" },
    { text: "Let's push to production together and never look back 🚀", devTag: "#prod-ready" },
    { text: "My ping to your heart is 0ms. Direct fiber connection ⚡", devTag: "#low-latency" },
    { text: "You're the open source license I will honor forever 📜💖", devTag: "#mit-forever" },
  ],
  am: [
    { text: "የልቤን root access ወስደሻል/ወሰደሃል 💖", devTag: "#root-ፍቅር" },
    { text: "ካንተ/ካንቺ ጋር ስሆን ህይወቴ ዜሮ compile error ነው 🥰", devTag: "#ፍጹም-ኮድ" },
    { text: "ልቤ እንዳለቀለት infinite loop በስምህ/በስምሽ ይሮጣል ☕", devTag: "#የማያልቅ-ፍቅር" },
    { text: "የኔ ቆንጆ፣ አንተ/አንቺ የኔ ተወዳጅ PR ነህ/ነሽ 💍", devTag: "#የልብ-መርጅ" },
    { text: "በህይወቴ ውስጥ በጣም ውቡ ፍሬምዎርክ አንተ/አንቺ ነህ/ነሽ ✨", devTag: "#ልዩ-ውበት" },
    { text: "እንደ ኢትዮጵያ ምርጥ ቡና ሞቅ ያልሽ/የነበርክ የኔ ፍቅር 🫘❤️", devTag: "#የሀገር-ፍቅር" },
    { text: "ፍቅርህ/ፍቅርሽ በሙሉ ልቤ ተሰማርቷል — 100% uptime 🚀", devTag: "#ዘላቂ-ግንኙነት" },
  ],
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
