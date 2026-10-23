// ─────────────────────────────────────────────────────────────────────────────
// AboutGuideModal.jsx — Interactive Guide & About "Find My Soulmate"
// Detailed guide on how to chat, send & listen to voice audio, gifts, and soulmate personas.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { IconX, IconHeart, IconTerminal, IconGift } from "../ui/Icons.jsx";
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
    { id: "overview", label: isAm ? "📖 መግቢያ" : "📖 Overview", icon: "✨" },
    { id: "audio", label: isAm ? "🎙️ የድምፅ ውይይት" : "🎙️ Audio Chat", icon: "🎧" },
    { id: "chat", label: isAm ? "💬 እንዴት ማውራት ይቻላል" : "💬 How to Chat", icon: "💻" },
    { id: "gifts", label: isAm ? "🎁 ስጦታዎች" : "🎁 Gifts & Swag", icon: "☕" },
    { id: "personas", label: isAm ? "👥 የነፍስ ጓደኞች" : "👥 The Soulmates", icon: "💖" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700  shadow-2xl flex flex-col overflow-hidden animate-scale-up">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <span className="p-2  bg-fuchsia-950/70 border border-fuchsia-800/80 text-xl">
              💌
            </span>
            <div>
              <h2 className="font-mono text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{isAm ? "ስለ 'ነፍስ ጓደኛዬን አግኝ' እና መመሪያ" : "About & Dating Guide"}</span>
                <span className="font-mono text-[10px] px-2 py-0.5  bg-emerald-950 border border-emerald-700 text-emerald-400 font-bold">
                  v2.0
                </span>
              </h2>
              <p className="font-mono text-xs text-slate-400">
                {isAm
                  ? "የድምፅ ውይይት፣ የመልእክት ልውውጥ እና የነፍስ ጓደኛን እንዴት ማግኘት እንደሚቻል"
                  : "How to chat, send voice audio, listen to whispers & win dev hearts"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2  text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <IconX className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-2 px-4 border-b border-slate-800/80 bg-slate-900/50 overflow-x-auto select-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundEngine.playHeartbeat();
                setActiveTab(tab.id);
              }}
              className={`font-mono text-xs font-bold px-3 py-1.5  transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? "bg-slate-800 text-fuchsia-300 border border-fuchsia-600/60 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-slate-300 font-mono text-xs sm:text-sm">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4  bg-gradient-to-br from-fuchsia-950/30 to-indigo-950/30 border border-fuchsia-900/40 space-y-2">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>💘</span>
                  <span>{isAm ? "Find My Soulmate ምንድን ነው?" : "What is Find My Soulmate?"}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAm
                    ? "ለገንቢዎች እና ለቴክኖሎጂ አፍቃሪዎች የተዘጋጀ የፍቅር ግንኙነት ጨዋታ ነው። ሙሉ ቀን ኮድ ከመጻፍ እና ብቻ ከመሆን ፋንታ፣ እዚህ ከመረጡት የሴት ወይም የወንድ ገንቢ ጓደኛ ጋር በመወያየት ዘና ማለት ይችላሉ!"
                    : "A developer-themed Virtual Dating Simulation that blends the sleek interface of a modern code editor (VS Code) with the intimacy of a real messaging and audio voice chat client. Instead of debugging alone late at night, connect with your ideal partner!"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-4  bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-2xl">👩‍💻</span>
                  <h4 className="font-bold text-white">
                    {isAm ? "የሴት ጓደኛ ይምረጡ" : "Find a Girlfriend"}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAm
                      ? "ሊና (ከርነል ማስተር)፣ ዳኒ (ፈጣን ፊት-ኤንድ) ወይም ሰናይት (የ AI ተመራማሪ)"
                      : "Engage with Lina (Linux Kernel Maintainer), Dani (Chaotic Frontend Ninja), or Senait (AI/PyTorch Researcher)."}
                  </p>
                </div>

                <div className="p-4  bg-slate-950/70 border border-slate-800 space-y-1.5">
                  <span className="text-2xl">👨‍💻</span>
                  <h4 className="font-bold text-white">
                    {isAm ? "የወንድ ጓደኛ ይምረጡ" : "Find a Boyfriend"}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isAm
                      ? "ሊኑስ (ሲስተምስ አርክቴክት)፣ ዴቮን (UI/UX አርቲስት) ወይም ዳዊት (Rust ኢንጂነር)"
                      : "Connect with Linus (Systems Architect), Devon (Creative Technologist), or Dawit (Rust & Distributed Systems)."}
                  </p>
                </div>
              </div>

              <div className="p-3  bg-slate-950 border border-emerald-900/50 flex items-center gap-3">
                <span className="text-emerald-400 text-lg">💡</span>
                <p className="text-xs text-slate-400">
                  {isAm
                    ? "የመረጡት ፆታ ብቻ በጨዋታው ውስጥ ይታያል — ምንም ድብልቅልቅ የለም!"
                    : "Your choice is dedicated: selecting Girlfriend focuses solely on female partners; selecting Boyfriend focuses solely on male partners."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO CHAT */}
          {activeTab === "audio" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4  bg-slate-950/80 border border-cyan-800/40 space-y-2">
                <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
                  <span>🎙️</span>
                  <span>{isAm ? "የድምፅ ውይይት: መላክ እና ማዳመጥ" : "Voice Audio: Send & Listen"}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAm
                    ? "መድረኩ ሙሉ የድምፅ ልውውጥን ይደግፋል። በኮምፒውተርዎ ወይም በሞባይልዎ ማይክራፎን ተጠቅመው ድምፅዎን መላክ እና የነፍስ ጓደኛዎን ድምፅ ማዳመጥ ይችላሉ።"
                    : "The simulation features realistic bidirectional audio: you can speak to send voice messages, and listen to spoken audio narration with custom gender-tuned frequencies."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5  bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="p-2  bg-fuchsia-950/80 border border-fuchsia-700 text-xl">
                    🎙️
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">
                      {isAm ? "1. የድምፅ መልእክት መላክ (Send Voice Note)" : "1. How to Send Voice Messages"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isAm
                        ? "በታችኛው የትዕዛዝ ሳጥን (DEV_TERMINAL) ውስጥ የሚገኘውን 🎙️ ማይክራፎን ይጫኑ። ድምፅዎን ሲናገሩ ወዲያው ወደ ጽሑፍ ተለውጦ እንደ የድምፅ ማስታወሻ ይላካል!"
                        : "Click the 🎙️ mic icon next to the send button in DEV_TERMINAL. Speak your message aloud; the speech engine captures your voice and sends it as an audio voice note directly into the chat."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5  bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="p-2  bg-cyan-950/80 border border-cyan-700 text-xl">
                    🔊
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">
                      {isAm ? "2. የፍቅረኛዎን ድምፅ ማዳመጥ (Listen to Partner)" : "2. How to Listen to Spoken Voice"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isAm
                        ? "በማንኛውም የፍቅረኛዎ መልእክት ስር የሚገኘውን '🔊 Voice audio' ወይም 'Listen' ቁልፍ ይጫኑ። የሴት ጓደኛዎች ሞቅ ባለ ቃና፣ የወንድ ጓደኛዎች ደግሞ ረጋ ባለ ድምፅ ያነቡልዎታል!"
                        : "Click the '🔊 Voice audio' button on any message bubble from your partner. Girlfriends speak in a warm, melodious tone, while Boyfriends speak in a deep, relaxed baritone pitch."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5  bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <div className="p-2  bg-amber-950/80 border border-amber-700 text-xl">
                    🎼
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-white">
                      {isAm ? "3. የፍቅር የድምፅ ሞገዶች (Synthesizer Chimes)" : "3. Romantic Audio Synthesizer"}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isAm
                        ? "የልብ ምት (Heartbeat flutter)፣ የፍቅር ቃጭል (C-maj9 Chimes) እና የስጦታ ዜማዎችን በራስ-ሰር ያጫውታል።"
                        : "Powered by the Web Audio API with real-time synthesized chords, double heartbeat pulses, cute terminal beeps, and celebratory gift fanfares."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO CHAT */}
          {activeTab === "chat" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4  bg-slate-950/80 border border-emerald-800/40 space-y-2">
                <h3 className="text-base font-bold text-emerald-300 flex items-center gap-2">
                  <span>💻</span>
                  <span>{isAm ? "እንዴት ማውራት እና ማፍቀር ይቻላል?" : "How to Chat & Win Hearts"}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAm
                    ? "በነጻነት ይወያዩ! የኮድ ክርክሮችን ያንሱ፣ የአማርኛ የፍቅር ቃላትን ይጠቀሙ ወይም በ Gemini AI አማካኝነት በፈለጉት ርዕስ ያውሩ።"
                    : "Express yourself through developer humor, git commits, code style debates, or romantic Amharic phrases. Everything reacts to your personality!"}
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="text-amber-400">1.</span>
                    <span>{isAm ? "የተዘጋጁ የኮንሶል ምርጫዎች (Quick Choices)" : "Interactive Branching Choices"}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4">
                    {isAm
                      ? "ከኮንሶሉ ላይ የሚቀርቡትን ጥያቄዎች እና መልሶች ይምረጡ። እያንዳንዱ ምርጫ የፍቅር መለኪያውን (Bond %) እና ስሜትን (Mood) ይለውጣል።"
                      : "Click tailored multiple-choice options (Tabs vs Spaces, Git Rebase, CSS grid issues). Each has calibrated relationship point deltas."}
                  </p>
                </div>

                <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="text-fuchsia-400">2.</span>
                    <span>{isAm ? "የ Google Gemini AI እውነተኛ ውይይት" : "Live Google Gemini AI Mode"}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4">
                    {isAm
                      ? "የ Gemini API ቁልፍዎን በማስገባት ከነፍስ ጓደኛዎ ጋር በነጻነት በጽሑፍም ሆነ በድምፅ ያውሩ። መተግበሪያው በራስ-ሰር የሚሰሩ ሞዴሎችን ያገኛል!"
                      : "Enter your Gemini API key from Google AI Studio. It automatically auto-discovers all active models supporting generateContent so you can talk about anything."}
                  </p>
                </div>

                <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <span className="text-cyan-400">3.</span>
                    <span>{isAm ? "የፍቅር ማዕከል (Love Hub & Emojis)" : "Love Hub & Dev Love Emojis"}</span>
                  </div>
                  <p className="text-xs text-slate-400 pl-4">
                    {isAm
                      ? "የልብ ምት ፍጥነት (BPM)፣ የፓኬት መጥፋት እና የገንቢዎች የፍቅር ጥቅሶችን በአንድ ጠቅታ ይላኩ።"
                      : "Tap 'Love Hub' in the terminal to view simulated Heartbeat BPM, Dropped Packet metrics, and send one-click developer love quotes."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GIFTS */}
          {activeTab === "gifts" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4  bg-slate-950/80 border border-fuchsia-800/40 space-y-2">
                <h3 className="text-base font-bold text-fuchsia-300 flex items-center gap-2">
                  <span>🎁</span>
                  <span>{isAm ? "ስጦታዎችን መስጠት" : "Sending Gifts & Dev Swag"}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAm
                    ? "ግንኙነታችሁ እያደገ ሲሄድ ልዩ ስጦታዎችን መስጠት ትችላላችሁ። ከቡና እስከ ሜካኒካል ኪቦርድ ድረስ!"
                    : "Surprise your partner with gifts categorized into distinct developer lifestyle tiers. Every gift plays celebratory fanfares and boosts your bond!"}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5  bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-2xl">☕</span>
                  <h4 className="font-bold text-amber-300">Brew Lab</h4>
                  <p className="text-xs text-slate-400">
                    {isAm ? "የይርጋጨፌ ቡና፣ ቪ60 ፖር-ኦቨር፣ ኮልድ ብሩ" : "Ethiopian Yirgacheffe Pour-Over, Kyoto Cold Brew, Oat Cortado."}
                  </p>
                </div>

                <div className="p-3.5  bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-2xl">⌨️</span>
                  <h4 className="font-bold text-cyan-300">Dev Swag</h4>
                  <p className="text-xs text-slate-400">
                    {isAm ? "ሉብድ ሜካኒካል ኪቦርድ፣ ANC የጆሮ ማዳመጫ" : "Lubed Mechanical Keyboard, ANC Studio Headphones, Ultra-wide OLED."}
                  </p>
                </div>

                <div className="p-3.5  bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-2xl">💖</span>
                  <h4 className="font-bold text-fuchsia-300">Love Tokens</h4>
                  <p className="text-xs text-slate-400">
                    {isAm ? "የፍቅር git commit፣ የኮድ ግጥም" : "Handwritten Git Commit, Endless While-Loop of Devotion, Signed GPG key."}
                  </p>
                </div>

                <div className="p-3.5  bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-2xl">🇪🇹</span>
                  <h4 className="font-bold text-emerald-300">Ethiopian Corner</h4>
                  <p className="text-xs text-slate-400">
                    {isAm ? "የጀበና ቡና ዝግጅት፣ የሽሮ ድግስ" : "Authentic Jebena Coffee Ceremony, Traditional Shiro & Injera Feast."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PERSONAS */}
          {activeTab === "personas" && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4  bg-slate-950/80 border border-purple-800/40 space-y-2">
                <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
                  <span>👥</span>
                  <span>{isAm ? "የ 6ቱ የነፍስ ጓደኞች ዝርዝር" : "Meet The 6 Unique Personas"}</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {isAm
                    ? "እያንዳንዱ ሰው የራሱ የሆነ ስብዕና፣ የሚወደው እና የሚጠላው የኮድ ዘይቤ አለው።"
                    : "Each soulmate has distinct emotional triggers, technical standards, and relationship progressions."}
                </p>
              </div>

              {/* Girlfriends */}
              <div className="space-y-2">
                <p className="font-bold text-xs text-fuchsia-400 uppercase tracking-widest">
                  👩‍💻 {isAm ? "የሴት ጓደኞች" : "Girlfriends"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Lina 🇸🇪</span>
                      <span className="text-xs text-fuchsia-400">Tabs Only</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Linux kernel maintainer. Blunt terminal syntax. Secretly smitten if you rebase cleanly.
                    </p>
                  </div>

                  <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Dani 🇺🇸</span>
                      <span className="text-xs text-fuchsia-400">CSS Wizard</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Chaotic frontend ninja. Cold brew powered. Affectionate when you fix flexbox bugs.
                    </p>
                  </div>

                  <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Senait 🇪🇹</span>
                      <span className="text-xs text-fuchsia-400">AI Scientist</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      PyTorch & LLM researcher. Loves Habesha coffee ceremony and poetic Amharic devotion.
                    </p>
                  </div>
                </div>
              </div>

              {/* Boyfriends */}
              <div className="space-y-2 pt-2">
                <p className="font-bold text-xs text-cyan-400 uppercase tracking-widest">
                  👨‍💻 {isAm ? "የወንድ ጓደኞች" : "Boyfriends"}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Linus 🇫🇮</span>
                      <span className="text-xs text-cyan-400">C / Systems</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Low-level hacker. Detests spaghetti code. 100% emotional uptime once he opens up.
                    </p>
                  </div>

                  <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Devon 🇬🇧</span>
                      <span className="text-xs text-cyan-400">UI / Three.js</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Creative technologist & aesthetic designer. Passionate about glassmorphism and late tea.
                    </p>
                  </div>

                  <div className="p-3  bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Dawit 🇪🇹</span>
                      <span className="text-xs text-cyan-400">Rust Architect</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Distributed systems mastermind in Addis Ababa. Zero memory leaks, maximum loyalty.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Quick Action Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-mono text-xs text-slate-400">
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
              className="flex-1 sm:flex-initial px-4 py-2  bg-fuchsia-950 hover:bg-fuchsia-900 border border-fuchsia-700 text-fuchsia-200 font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>👩‍💻</span>
              <span>{isAm ? "የሴት ጓደኛ ፈልግ" : "Find Girlfriend"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playRomanticChime();
                onChooseCategory?.("male");
                onClose?.();
              }}
              className="flex-1 sm:flex-initial px-4 py-2  bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <span>👨‍💻</span>
              <span>{isAm ? "የወንድ ጓደኛ ፈልግ" : "Find Boyfriend"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
