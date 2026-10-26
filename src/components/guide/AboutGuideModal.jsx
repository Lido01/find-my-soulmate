// ─────────────────────────────────────────────────────────────────────────────
// AboutGuideModal.jsx — Interactive Guide & About "Find My Soulmate"
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { IconX } from "../ui/Icons.jsx";
import { soundEngine } from "../../utils/audio.js";

export default function AboutGuideModal({
  isOpen,
  onClose,
  onChooseCategory,
  lang = "en",
}) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'audio' | 'chat' | 'gifts' | 'personas'

  if (!isOpen) return null;

  const isAm = lang === "am";

  const tabs = [
    { id: "overview", label: isAm ? "መግቢያ" : "Overview", icon: "" },
    { id: "audio", label: isAm ? "የድምፅ ውይይት" : "Audio Chat", icon: "" },
    { id: "chat", label: isAm ? "እንዴት ማውራት ይቻላል" : "How to Chat", icon: "" },
    { id: "gifts", label: isAm ? "ስጦታዎች" : "Gifts & Swag", icon: "" },
    { id: "personas", label: isAm ? "ነፍስ ጓደኞች" : "The Soulmates", icon: "" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-text"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-black border border-zinc-800   shadow-2xl shadow-red-950/40 flex flex-col overflow-hidden animate-slide-up">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isAm ? "ስለ DevSoulmate እና መመሪያ" : "About & Developer Guide"}</span>
                <span className="font-mono text-[10px] px-2 py-0.5   bg-red-600 text-white font-bold">
                  v2.0
                </span>
              </h2>
              <p className="font-mono text-xs text-zinc-400">
                {isAm
                  ? "የድምፅ ውይይት፣ የመልእክት ልውውጥ እና የነፍስ ጓደኛን እንዴት ማግኘት እንደሚቻል"
                  : "How to chat, send voice audio, listen to whispers & win dev hearts"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5   text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-red-600 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-2 px-4 border-b border-zinc-900 bg-black overflow-x-auto select-none shrink-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundEngine.playHeartbeat();
                setActiveTab(tab.id);
              }}
              className={`font-mono text-xs font-bold px-3.5 py-1.5   transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-red-600 text-white border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  : "bg-zinc-950 text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-zinc-300 font-mono text-xs sm:text-sm bg-black" style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4   bg-zinc-950 border border-red-900/40 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isAm ? "DevSoulmate ምንድን ነው?" : "What is DevSoulmate?"}</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {isAm
                    ? "ለገንቢዎች እና ለቴክኖሎጂ አፍቃሪዎች የተዘጋጀ የፍቅር ግንኙነት ጨዋታ ነው። ሙሉ ቀን ኮድ ከመጻፍ እና ብቻ ከመሆን ፋንታ፣ እዚህ ከመረጡት የሴት ወይም የወንድ ገንቢ ጓደኛ ጋር በመወያየት ዘና ማለት ይችላሉ!"
                    : "A high-tech developer dating platform that blends real-time WebSocket communication, authentic audio voice notes, and live matchmaking with developer attributes like indentation preferences, favorite tech stacks, and Ethiopian Bunna."}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4   bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-white">
                    {isAm ? "የሴት ጓደኛ ይምረጡ" : "Find a Girlfriend"}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {isAm
                      ? "ሊና (ከርነል ማስተር)፣ ዳኒ (ፈጣን ፊት-ኤንድ) ወይም ሰናይት (የ AI ተመራማሪ)"
                      : "Engage with Lina (Linux Kernel Maintainer), Dani (Chaotic Frontend Ninja), or Senait (AI/PyTorch Researcher)."}
                  </p>
                </div>

                <div className="p-4   bg-zinc-950 border border-zinc-800 space-y-1.5">
                  <h4 className="font-bold text-white">
                    {isAm ? "የወንድ ጓደኛ ይምረጡ" : "Find a Boyfriend"}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {isAm
                      ? "ሊኑስ (ሲስተምስ አርክቴክት)፣ ዴቮን (UI/UX አርቲስት) ወይም ዳዊት (Rust ኢንጂነር)"
                      : "Connect with Linus (Systems Architect), Devon (Creative Technologist), or Dawit (Rust & Distributed Systems)."}
                  </p>
                </div>
              </div>

              <div className="p-3   bg-zinc-950 border border-zinc-800 flex items-center gap-3">
                <p className="text-xs text-zinc-400 font-sans">
                  {isAm
                    ? "የመረጡት ፆታ ብቻ በመድረኩ ላይ ይታያል — በቅንብሮች ውስጥ በፈለጉት ጊዜ መቀየር ይችላሉ!"
                    : "Your choice is dedicated: selecting Girlfriend focuses on female developers; selecting Boyfriend focuses on male developers. Easily toggle in Settings."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO CHAT */}
          {activeTab === "audio" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4   bg-zinc-950 border border-red-900/40 space-y-2">
                <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                  <span>🎙️</span>
                  <span>{isAm ? "የድምፅ ውይይት: መላክ እና ማዳመጥ" : "Voice Audio: Send & Listen"}</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {isAm
                    ? "መድረኩ ሙሉ የድምፅ ልውውጥን ይደግፋል። በማይክራፎን ተጠቅመው ድምፅዎን መላክ እና የነፍስ ጓደኛዎን ድምፅ ማዳመጥ ይችላሉ።"
                    : "The platform features bidirectional audio: record real voice audio clips on desktop or mobile, and listen to synthesized romantic voice narration tuned for developer immersion."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5   bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <div className="p-2   bg-red-950/80 border border-red-700 text-xl">
                    🎙️
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">
                      {isAm ? "1. የድምፅ መልእክት መላክ (Send Voice Note)" : "1. How to Send Voice Notes"}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {isAm
                        ? "በታችኛው የትዕዛዝ ሳጥን ውስጥ የሚገኘውን ማይክራፎን ይጫኑ። ድምፅዎን ሲናገሩ ወዲያው ተቀርጾ እንደ የድምፅ ማስታወሻ ይላካል!"
                        : "Click the mic button in the chat console. Speak your message; on click send, your voice recording is transmitted and playable directly in chat."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5   bg-zinc-950 border border-zinc-800 flex items-start gap-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">
                      {isAm ? "2. የፍቅረኛዎን ድምፅ ማዳመጥ (Listen to Partner)" : "2. Listen to Romantic Voice"}
                    </h4>
                    <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                      {isAm
                        ? "በማንኛውም መልእክት ስር የሚገኘውን 'Voice' ቁልፍ ይጫኑ።"
                        : "Click 'Voice' on any message bubble to hear real voice playback or synthesized narration."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO CHAT */}
          {activeTab === "chat" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4   bg-zinc-950 border border-red-900/40 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isAm ? "እንዴት ማውራት እና ማፍቀር ይቻላል?" : "How to Connect & Chat"}</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {isAm
                    ? "በነጻነት ይወያዩ! የኮድ ክርክሮችን ያንሱ፣ የአማርኛ የፍቅር ቃላትን ይጠቀሙ ወይም ፎቶ እና ኮድ ይላኩ።"
                    : "Connect via direct chat, share photos, share code snippets with syntax highlighting, or send Ethiopian Bunna."}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3   bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="text-red-400">1.</span>
                    <span>{isAm ? "የቀጥታ ማዛመጃ (Live Match)" : "Live 1-on-1 Match"}</span>
                  </div>
                  <p className="text-xs text-zinc-400 pl-4 font-sans">
                    {isAm
                      ? "የቀጥታ ግጥሚያ ጀምርን በመጫን ወዲያውኑ ከመስመር ላይ ካሉ ገንቢዎች ጋር ይገናኙ።"
                      : "Click 'Start Live Match' in the lobby to be instantly paired with an online developer."}
                  </p>
                </div>

                <div className="p-3   bg-zinc-950 border border-zinc-800 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="text-red-400">2.</span>
                    <span>{isAm ? "የጓደኝነት እና የደጋፊነት ስርዓት" : "Friends & Real Followers"}</span>
                  </div>
                  <p className="text-xs text-zinc-400 pl-4 font-sans">
                    {isAm
                      ? "ገንቢዎችን ይከተሉ (+ Follow)፣ የጓደኝነት ጥያቄ ይላኩ እና ማሳወቂያዎችን ይቀበሉ።"
                      : "Follow developers to build your network, send friend requests, and exchange mutual likes."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GIFTS */}
          {activeTab === "gifts" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4   bg-zinc-950 border border-red-900/40 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isAm ? "ስጦታዎችን መስጠት" : "Sending Gifts & Dev Swag"}</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {isAm
                    ? "ከቡና እስከ ሜካኒካል ኪቦርድ ድረስ ልዩ ስጦታዎችን ይላኩ!"
                    : "Send gifts categorized into developer lifestyle tiers: Brew Lab, Dev Swag, Love Tokens, and Ethiopian Corner."}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5   bg-zinc-950 border border-zinc-800 space-y-1">
                  <h4 className="font-bold text-amber-300">Brew Lab</h4>
                  <p className="text-xs text-zinc-400 font-sans">
                    {isAm ? "የይርጋጨፌ ቡና፣ ቪ60 ፖር-ኦቨር፣ ኮልድ ብሩ" : "Ethiopian Yirgacheffe Pour-Over, Kyoto Cold Brew, Oat Cortado."}
                  </p>
                </div>

                <div className="p-3.5   bg-zinc-950 border border-zinc-800 space-y-1">
                  <h4 className="font-bold text-white">Dev Swag</h4>
                  <p className="text-xs text-zinc-400 font-sans">
                    {isAm ? "ሉብድ ሜካኒካል ኪቦርድ፣ ANC የጆሮ ማዳመጫ" : "Lubed Mechanical Keyboard, ANC Studio Headphones, Ultra-wide OLED."}
                  </p>
                </div>

                <div className="p-3.5   bg-zinc-950 border border-zinc-800 space-y-1">
                  <p className="text-xs text-zinc-400 font-sans">
                    {isAm ? "የፍቅር git commit፣ የኮድ ግጥም" : "Handwritten Git Commit, Endless While-Loop of Devotion, Signed GPG key."}
                  </p>
                </div>

                <div className="p-3.5   bg-zinc-950 border border-zinc-800 space-y-1">
                  <h4 className="font-bold text-amber-400">Ethiopian Corner</h4>
                  <p className="text-xs text-zinc-400 font-sans">
                    {isAm ? "የጀበና ቡና ዝግጅት፣ የሽሮ ድግስ" : "Authentic Jebena Coffee Ceremony, Traditional Shiro & Injera Feast."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERSONAS */}
          {activeTab === "personas" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4   bg-zinc-950 border border-red-900/40 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{isAm ? "የ 6ቱ የነፍስ ጓደኞች ዝርዝር" : "Meet The Personas"}</span>
                </h3>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  {isAm
                    ? "እያንዳንዱ ሰው የራሱ የሆነ ስብዕና፣ የሚወደው እና የሚጠላው የኮድ ዘይቤ አለው።"
                    : "Each developer persona has distinct technical standards, quirks, and relationship progressions."}
                </p>
              </div>

              {/* Girlfriends */}
              <div className="space-y-2">
                <p className="font-bold text-xs text-red-400 uppercase tracking-widest">
                  {isAm ? "የሴት ጓደኞች" : "Girlfriends"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3   bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Lina 🇸🇪</span>
                      <span className="text-xs text-red-400">Tabs</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Linux kernel maintainer. Blunt terminal syntax. Secretly smitten if you rebase cleanly.
                    </p>
                  </div>

                  <div className="p-3   bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Dani 🇺🇸</span>
                      <span className="text-xs text-red-400">CSS Wizard</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Chaotic frontend ninja. Cold brew powered. Affectionate when you fix flexbox bugs.
                    </p>
                  </div>

                  <div className="p-3   bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Senait 🇪🇹</span>
                      <span className="text-xs text-red-400">AI Scientist</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      PyTorch & LLM researcher. Loves Habesha coffee ceremony and poetic Amharic devotion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Boyfriends */}
              <div className="space-y-2 pt-2">
                <p className="font-bold text-xs text-white uppercase tracking-widest">
                  {isAm ? "የወንድ ጓደኞች" : "Boyfriends"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3   bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Linus 🇫🇮</span>
                      <span className="text-xs text-zinc-400">C / Systems</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Low-level hacker. Detests spaghetti code. 100% emotional uptime once he opens up.
                    </p>
                  </div>

                  <div className="p-3   bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Devon 🇬🇧</span>
                      <span className="text-xs text-zinc-400">Three.js</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Creative technologist & aesthetic designer. Passionate about glassmorphism and late tea.
                    </p>
                  </div>

                  <div className="p-3   bg-zinc-950 border border-zinc-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Dawit 🇪🇹</span>
                      <span className="text-xs text-zinc-400">Rust</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">
                      Distributed systems mastermind in Addis Ababa. Zero memory leaks, maximum loyalty.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Action Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="font-mono text-xs text-zinc-400">
            {isAm ? "ለመጀመር ዝግጁ ኖት?" : "Ready to choose your soulmate?"}
          </span>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                soundEngine.playRomanticChime();
                onChooseCategory?.("female");
                onClose?.();
              }}
              className="flex-1 sm:flex-initial px-4 py-2   bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>{isAm ? "የሴት ጓደኛ ፈልግ" : "Find Girlfriend"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playRomanticChime();
                onChooseCategory?.("male");
                onClose?.();
              }}
              className="flex-1 sm:flex-initial px-4 py-2   bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>{isAm ? "የወንድ ጓደኛ ፈልግ" : "Find Boyfriend"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
