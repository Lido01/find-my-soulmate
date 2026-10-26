// ─────────────────────────────────────────────────────────────────────────────
// gifts.js — Categorized gift system with Ethiopian & international options
// Commit: feat: add gift system with Ethiopian + international categories
// ─────────────────────────────────────────────────────────────────────────────

export const GIFT_CATEGORIES = [
  {
    id: 'brew',
    icon: '☕',
    label: { en: 'Brew Lab', am: 'ቡና ቤት' },
    color: 'red',
    borderClass: 'border-red-900/60',
    bgClass: 'bg-red-950/20',
    textClass: 'text-red-400',
    gifts: [
      { id: 'bunna', icon: '🫘', name: { en: 'Ethiopian Bunna Ceremony', am: 'የኢትዮጵያ ቡና ሥነ ሥርዓት' }, description: { en: 'A full traditional Ethiopian coffee ceremony ☕🌿', am: 'ሙሉ ባህላዊ ቡና ሥነ ሥርዓት ☕🌿' }, boost: 20, rarity: 'legendary' },
      { id: 'coldbrew', icon: '🧊', name: { en: 'Nitrogen Cold Brew', am: 'ቀዝቃዛ ቡና' }, description: { en: 'Nitrogen-infused cold brew from Devon\'s fav café', am: 'ናይትሮጅን ቀዝቃዛ ቡና' }, boost: 15, rarity: 'rare' },
      { id: 'matcha', icon: '🍵', name: { en: 'Ceremonial Matcha Latte', am: 'ማቻ ላቴ' }, description: { en: 'Grade A ceremonial matcha, oat milk, love', am: 'ከፍተኛ ጥራት ያለው ማቻ' }, boost: 12, rarity: 'uncommon' },
      { id: 'energy', icon: '⚡', name: { en: 'Dev Energy Drink', am: 'ሃይል መጠጥ' }, description: { en: '400mg caffeine. You could rewrite Linux.', am: '400mg ካፌይን። ሊኑክስ ልትፅፍ ትችላለህ/ሽ።' }, boost: 8, rarity: 'common' },
      { id: 'tejkebena', icon: '🏺', name: { en: 'Tej in a Berele', am: 'ጠጅ በበርሌ' }, description: { en: 'Honey wine served in traditional Ethiopian glass', am: 'ጠጅ በባህላዊ ብርሌ' }, boost: 18, rarity: 'rare' },
    ],
  },
  {
    id: 'devswag',
    icon: '💻',
    label: { en: 'Dev Swag', am: 'ልማት ስጦታ' },
    color: 'red',
    borderClass: 'border-red-900/60',
    bgClass: 'bg-red-950/20',
    textClass: 'text-red-400',
    gifts: [
      { id: 'githubstars', icon: '⭐', name: { en: '100 GitHub Stars', am: '100 GitHub ኮከቦች' }, description: { en: 'Starred your repo. All 100 of them. Manually.', am: 'ሁሉንም ኮከብ ሰጥቻለሁ — ሙሉ 100ቱ' }, boost: 25, rarity: 'legendary' },
      { id: 'codereview', icon: '🔍', name: { en: 'Personal Code Review', am: 'ኮድ ክለሳ' }, description: { en: 'I\'ll review every PR like it\'s a love letter', am: 'ሁሉንም PR እቃኛለሁ — እንደ ፍቅር ደብዳቤ' }, boost: 20, rarity: 'epic' },
      { id: 'stickers', icon: '🏷️', name: { en: 'Holographic Dev Stickers', am: 'ሆሎግራፊ ስቲከሮች' }, description: { en: 'Linux, React, Ethiopia flag — holographic set', am: 'ሊኑክስ፣ ሪአክት፣ ኢትዮጵያ ባንዲራ — ስቲከር ስብስብ' }, boost: 10, rarity: 'uncommon' },
      { id: 'theme', icon: '🎨', name: { en: 'Custom VS Code Theme', am: 'ብጁ VS Code ጭብጥ' }, description: { en: 'Hand-crafted theme named after them 💜', am: 'በስማቸው የተሰየመ ጭብጥ 💜' }, boost: 15, rarity: 'rare' },
      { id: 'keyboard', icon: '⌨️', name: { en: 'Mechanical Keyboard', am: 'ሜካኒካል ቁልፍ ሰሌዳ' }, description: { en: 'Cherry MX switches. The good ones. 🥹', am: 'Cherry MX ስዊቶች። ጥሩዎቹ። 🥹' }, boost: 22, rarity: 'epic' },
    ],
  },
  {
    id: 'love',
    icon: '❤️',
    label: { en: 'Love Tokens', am: 'የፍቅር ቶከን' },
    color: 'red',
    borderClass: 'border-red-900/60',
    bgClass: 'bg-red-950/20',
    textClass: 'text-red-400',
    gifts: [
      { id: 'hug', icon: '🤗', name: { en: 'Virtual Dev Hug', am: 'ምናባዊ ሰላምታ' }, description: { en: 'A warm embrace from across the terminal', am: 'ከተርሚናሉ ማዶ ሞቅ ያለ ሰላምታ' }, boost: 12, rarity: 'common' },
      { id: 'flowers', icon: '🌸', name: { en: 'Digital Cherry Blossoms', am: 'ዲጂታል አበቦች' }, description: { en: 'A full garden of cherry blossoms, rendered in CSS', am: 'CSS ውስጥ የተሳሉ አበቦች' }, boost: 14, rarity: 'uncommon' },
      { id: 'loveletter', icon: '💌', name: { en: 'Handwritten Love Letter', am: 'የእጅ ፍቅር ደብዳቤ' }, description: { en: 'Written in both English and Amharic 🥺', am: 'በእንግሊዝኛም በአማርኛም የተጻፈ 🥺' }, boost: 22, rarity: 'epic' },
      { id: 'poem', icon: '📜', name: { en: 'Dev Love Poem', am: 'የፍቅር ግጥም' }, description: { en: 'Haiku about your commit history and their eyes', am: 'ስለ commit ታሪክዎ እና ዓይኖቻቸው ሃይኩ' }, boost: 18, rarity: 'rare' },
      { id: 'ring', icon: '💍', name: { en: 'Pixel Ring', am: 'ፒክሰል ቀለበት' }, description: { en: 'Will you be my pair programmer... forever? 💍', am: 'ለዘላለም pair programmer ትሆናለህ/ሽ? 💍' }, boost: 35, rarity: 'legendary' },
    ],
  },
  {
    id: 'ethiopia',
    icon: '🇪🇹',
    label: { en: 'Ethiopian Corner', am: 'የኢትዮጵያ ጥግ' },
    color: 'red',
    borderClass: 'border-red-900/60',
    bgClass: 'bg-red-950/20',
    textClass: 'text-red-400',
    gifts: [
      { id: 'injera', icon: '🫓', name: { en: 'Virtual Injera + Tibs', am: 'ምናባዊ እንጀራ + ጥብስ' }, description: { en: 'The ultimate Ethiopian comfort food. Digital version.', am: 'ምርጥ ኢትዮጵያዊ ምግብ። ዲጂታል ቅጂ።' }, boost: 20, rarity: 'rare' },
      { id: 'amharicaletter', icon: '✍️', name: { en: 'Amharic Love Poem', am: 'አማርኛ የፍቅር ግጥም' }, description: { en: 'A heartfelt poem written in Ge\'ez script', am: 'በግዕዝ ፊደል የተጻፈ ግጥም ❤️' }, boost: 25, rarity: 'epic' },
      { id: 'art', icon: '🎨', name: { en: 'Habesha Digital Art', am: 'ሐበሻ ዲጂታል ሥዕል' }, description: { en: 'Traditional Ethiopian patterns, reimagined digitally', am: 'ባህላዊ ኢትዮጵያዊ ዲዛይን፣ ዲጂታሉ' }, boost: 18, rarity: 'rare' },
      { id: 'music', icon: '🎵', name: { en: 'Ethiopian Jazz Playlist', am: 'ኢትዮጵያዊ ጃዝ playlist' }, description: { en: 'Mulatu Astatke vibes for your coding session', am: 'ሙላቱ አስታጥቄ — ምርጥ ሙዚቃ ለኮዲንግ' }, boost: 15, rarity: 'uncommon' },
      { id: 'netela', icon: '🤍', name: { en: 'Digital Netela', am: 'ዲጂታል ነጠላ' }, description: { en: 'Wrapped in love, the Ethiopian way 🤍', am: 'ፍቅር ተጠቅሎ — ኢትዮጵያዊ መንገድ 🤍' }, boost: 20, rarity: 'rare' },
    ],
  },
  {
    id: 'vibes',
    icon: '🎵',
    label: { en: 'Good Vibes', am: 'ጥሩ ስሜት' },
    color: 'red',
    borderClass: 'border-red-900/60',
    bgClass: 'bg-red-950/20',
    textClass: 'text-red-400',
    gifts: [
      { id: 'lofi', icon: '🎧', name: { en: 'Lo-fi Coding Playlist', am: 'Lo-fi ሙዚቃ' }, description: { en: 'Beats to code and fall in love to 💙', am: 'ለኮዲንግ እና ለፍቅር — Lo-fi beats 💙' }, boost: 10, rarity: 'common' },
      { id: 'meme', icon: '😂', name: { en: 'Custom Dev Meme', am: 'ብጁ ሜም' }, description: { en: 'A handcrafted meme about their specific code style', am: 'ስለ ኮዳቸው ልዩ ሜም' }, boost: 12, rarity: 'uncommon' },
      { id: 'gaming', icon: '🎮', name: { en: 'Co-op Gaming Session', am: 'አብሮ የጨዋታ ጊዜ' }, description: { en: 'One full evening of co-op. No work. Just play.', am: 'አንድ ምሽት — ሥራ የለም። ጨዋታ ብቻ።' }, boost: 18, rarity: 'rare' },
      { id: 'podcast', icon: '🎙️', name: { en: 'Podcast Feature', am: 'Podcast ቃለ መጠይቅ' }, description: { en: 'Feature them on your dev podcast episode 🎙️', am: 'በ podcast ስራዎ ቃለ-ምልልስ ያድርጉ 🎙️' }, boost: 22, rarity: 'epic' },
      { id: 'netlfix', icon: '🍿', name: { en: 'Netflix & Debug', am: 'ፊልምና Debug' }, description: { en: 'Movies. Popcorn. Bug fixing. Romance. 🍿', am: 'ፊልም። ፖፕኮርን። Bug ማስተካከያ። ፍቅር። 🍿' }, boost: 15, rarity: 'rare' },
    ],
  },
];

export const RARITY_META = {
  common: { label: 'Common', color: 'text-zinc-400', bg: 'bg-zinc-900 border border-zinc-800' },
  uncommon: { label: 'Uncommon', color: 'text-zinc-200', bg: 'bg-zinc-800/80 border border-zinc-700' },
  rare: { label: 'Rare', color: 'text-red-400', bg: 'bg-red-950/50 border border-red-800/60' },
  epic: { label: 'Epic 🔥', color: 'text-red-300 font-bold', bg: 'bg-red-900/60 border border-red-600' },
  legendary: { label: 'Legendary ⚡', color: 'text-white font-extrabold', bg: 'bg-red-600 text-white border border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' },
};
