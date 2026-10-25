// ─────────────────────────────────────────────────────────────────────────────
// FooterConsole.jsx — Terminal Input, Audio Voice Recording, Choices & Gifts
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { MOOD_META } from "../../data/characters.js";
import { IconGift, IconTerminal, IconSend, IconHeart } from "../ui/Icons.jsx";
import { soundEngine, isSpeechRecognitionSupported, createSpeechRecognizer } from "../../utils/audio.js";

const QUICK_VOICE_NOTES = {
  female: {
    en: [
      "Hey... just pushed my commit and was thinking of you, beautiful. 💖",
      "Can you review my pull request? Need your brilliant mind. ☕",
      "Zero bugs in my code, but 100% bugs in my heart for you. 🥺",
      "Take a break and drink some water, my favorite dev girl. ✨",
    ],
    am: [
      "የኔ ቆንጆ፣ ስራሽን አብረን እንጨርሰው? ☕💖",
      "ስለ አንቺ ሳስብ ኮዴ ሁሉ ያለ ስህተት ይሰራል! ✨",
      "የኔ ልብ፣ ዛሬ ቀንሽ እንዴት ነበር? 🥺❤️",
      "ትንሽ እረፍት አድርጊ፣ ቡና እንጠጣ? 🇪🇹",
    ],
  },
  male: {
    en: [
      "Hey... just pushed my commit and was thinking of you, handsome. 💖",
      "Can you review my pull request? Need your systems mind. ☕",
      "Zero bugs in my code, but 100% bugs in my heart for you. 🥺",
      "Take a break and drink some water, my dev king. ✨",
    ],
    am: [
      "የኔ ጀግና፣ ስራህን አብረን እንጨርሰው? ☕💖",
      "ስለ አንተ ሳስብ ኮዴ ሁሉ ያለ ስህተት ይሰራል! ✨",
      "የኔ ልብ፣ ዛሬ ቀንህ እንዴት ነበር? 🥺❤️",
      "ትንሽ እረፍት አድርግ፣ ቡና እንጠጣ? 🇪🇹",
    ],
  },
};

export default function FooterConsole({
  dialogue,
  character,
  charState,
  onChoice,
  onSendMessage,
  isTyping,
  t,
  lang = "en",
  onGiftClick,
  canGift = false,
  aiModeActive = false,
  onToggleLoveDrawer,
  loveDrawerOpen = false,
}) {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [voiceText, setVoiceText] = useState("");
  const [showVoicePresets, setShowVoicePresets] = useState(false);

  const recognizerRef = useRef(null);
  const timerRef = useRef(null);

  const choices = dialogue?.choices ?? [];
  const mood = charState?.mood || character?.defaultMood || "curious";
  const moodMeta = MOOD_META[mood] ?? {};
  const borderColor = character?.borderColor ?? "#10b981";

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recognizerRef.current) {
        try { recognizerRef.current.abort(); } catch {}
      }
    };
  }, []);

  function handleFormSubmit(e) {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isTyping) return;
    soundEngine.playMessageBeep();
    onSendMessage?.(trimmed);
    setInputText("");
  }

  // Toggle voice audio recording
  function handleToggleVoiceRecord() {
    if (isRecording) {
      stopRecordingAndSend();
    } else {
      startRecording();
    }
  }

  function startRecording() {
    if (isTyping) return;

    soundEngine.playMicTone();
    setRecordSeconds(0);
    setVoiceText("");
    setIsRecording(true);

    // Timer
    timerRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);

    const speechLang = lang === "am" ? "am-ET" : "en-US";
    const recognizer = createSpeechRecognizer({
      lang: speechLang,
      onResult: (text) => {
        setVoiceText(text);
      },
      onError: () => {
        // Fallback to random romantic voice phrase if recognition fails or is denied
        if (!voiceText) {
          const genderKey = character?.gender === 'male' ? 'male' : 'female';
          const presetsGroup = QUICK_VOICE_NOTES[genderKey] || QUICK_VOICE_NOTES.female;
          const presets = presetsGroup[lang] || presetsGroup.en;
          const randomPhrase = presets[Math.floor(Math.random() * presets.length)];
          setVoiceText(randomPhrase);
        }
      },
      onEnd: () => {
        // Recognition completed
      },
    });

    if (recognizer) {
      try {
        recognizer.start();
        recognizerRef.current = recognizer;
      } catch {
        // Ignored if already started
      }
    } else {
      // Speech recognition not supported on this browser: use preset fallback
      const genderKey = character?.gender === 'male' ? 'male' : 'female';
      const presetsGroup = QUICK_VOICE_NOTES[genderKey] || QUICK_VOICE_NOTES.female;
      const presets = presetsGroup[lang] || presetsGroup.en;
      const randomPhrase = presets[Math.floor(Math.random() * presets.length)];
      setVoiceText(randomPhrase);
    }
  }

  function stopRecordingAndSend() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognizerRef.current) {
      try { recognizerRef.current.stop(); } catch {}
    }
    setIsRecording(false);

    const isFemale = character?.gender === 'female';
    const defaultVoiceNote = lang === "am"
      ? (isFemale ? "የኔ ፍቅር፣ ድምፅሽን መስማት ደስ ይለኛል 💖" : "የኔ ፍቅር፣ ድምፅህን መስማት ደስ ይለኛል 💖")
      : (isFemale ? "Hey gorgeous... sending you a warm voice note! 💖" : "Hey handsome... sending you a warm voice note! 💖");

    const finalVoice = voiceText.trim() || inputText.trim() || defaultVoiceNote;
    soundEngine.playRomanticChime();
    onSendMessage?.(finalVoice, { isAudio: true, audioDuration: Math.max(2, recordSeconds) });
    setVoiceText("");
    setRecordSeconds(0);
  }

  function cancelRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recognizerRef.current) {
      try { recognizerRef.current.abort(); } catch {}
    }
    setIsRecording(false);
    setVoiceText("");
    setRecordSeconds(0);
  }

  function handleSendVoicePreset(phrase) {
    setShowVoicePresets(false);
    soundEngine.playRomanticChime();
    onSendMessage?.(phrase, { isAudio: true, audioDuration: 3 });
  }

  const isAm = lang === "am";
  const genderKey = character?.gender === 'male' ? 'male' : 'female';
  const presetsGroup = QUICK_VOICE_NOTES[genderKey] || QUICK_VOICE_NOTES.female;
  const voicePresets = presetsGroup[lang] || presetsGroup.en;

  return (
    <footer className="border-t border-zinc-800 bg-black/95 backdrop-blur-md shrink-0 relative font-mono select-text transition-all">
      {/* Terminal title bar - Ultra compact on small screens */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 sm:px-4 sm:py-2 border-b border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {/* Traffic dots */}
          <div className="hidden xs:flex items-center gap-1 mr-1">
            <span className="w-2 h-2 rounded-full bg-red-600/90 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
            <span className="w-2 h-2 rounded-full bg-zinc-700" />
            <span className="w-2 h-2 rounded-full bg-zinc-800" />
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400 min-w-0">
            <IconTerminal className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <span className="font-mono text-[11px] sm:text-xs tracking-wider font-bold truncate">
              {t?.devTerminal ?? "DEV_TERMINAL"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Voice Audio Presets Button */}
          <button
            type="button"
            onClick={() => setShowVoicePresets((prev) => !prev)}
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-all ${
              showVoicePresets
                ? 'bg-red-950/80 border-red-600 text-white shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
            }`}
            title="Send saved voice note audio clips"
          >
            <span>🎙️</span>
            <span className="hidden xs:inline">{isAm ? "ፈጣን ድምፅ" : "Voice Note"}</span>
          </button>

          {/* Romantic Love Drawer Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              onToggleLoveDrawer?.();
            }}
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-[10px] sm:text-[11px] font-bold border transition-all ${
              loveDrawerOpen
                ? 'bg-red-950/80 border-red-500 text-white shadow-sm'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-600'
            }`}
            title="Open Developer Love Indicators & Emojis"
          >
            <IconHeart className="w-3 h-3 text-red-500" />
            <span className="hidden xs:inline">Love Hub</span>
          </button>

          {/* Mood indicator */}
          {moodMeta.emoji && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-zinc-950 border border-zinc-800/80">
              <span className="text-xs">{moodMeta.emoji}</span>
              <span className={`font-mono text-[10px] font-bold hidden sm:inline ${moodMeta.textClass || 'text-red-400'}`}>
                {t?.moods?.[mood] ?? mood}
              </span>
            </div>
          )}

          {/* Typing status */}
          {isTyping && (
            <span className="font-mono text-[10px] text-red-400 animate-pulse font-bold">
              {t?.isTyping ?? "typing..."}
            </span>
          )}
        </div>
      </div>

      {/* Voice Presets Dropdown Drawer - Compact sheet that does NOT overtake screen */}
      {showVoicePresets && (
        <div className="p-2 sm:p-3 bg-zinc-950/98 border-b border-zinc-800 animate-slide-up space-y-2 max-h-44 sm:max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] sm:text-xs font-bold text-red-400 flex items-center gap-1.5">
              <span>🎙️</span>
              <span>{isAm ? "ፈጣን የድምፅ መልእክት ምረጥ" : "Select Quick Voice Note to Send"}</span>
            </span>
            <button
              onClick={() => setShowVoicePresets(false)}
              className="text-xs px-2 py-0.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-900"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {voicePresets.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendVoicePreset(phrase)}
                className="text-left p-2 rounded-xl bg-black border border-zinc-800 hover:border-red-600 text-xs text-zinc-300 hover:text-white transition-all flex items-center justify-between group shadow-sm"
              >
                <span className="truncate pr-2 font-mono text-[11px]">"{phrase}"</span>
                <span className="text-red-400 font-bold shrink-0 text-[10px] opacity-80 group-hover:opacity-100">
                  Send ➔
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Voice Recording Overlay */}
      {isRecording && (
        <div className="p-2.5 bg-red-950/60 border-b border-red-600/70 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono text-xs font-bold text-red-300">
                REC 0:0{recordSeconds}
              </span>
            </div>

            {/* Audio wave animation */}
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 h-2.5 bg-red-400 animate-pulse" />
              <span className="w-1 h-4 bg-red-400 animate-pulse delay-75" />
              <span className="w-1 h-3 bg-red-400 animate-pulse delay-150" />
              <span className="w-1 h-1.5 bg-red-400 animate-pulse delay-200" />
            </div>

            <p className="font-mono text-xs text-white truncate max-w-[200px] sm:max-w-md">
              {voiceText || (isAm ? "እየሰማሁ ነው... ተናገሩ" : "Listening... speak now")}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-2.5 py-1 rounded-lg border border-zinc-700 bg-zinc-900 text-zinc-400 hover:text-white text-xs font-mono"
            >
              ✕ Cancel
            </button>
            <button
              type="button"
              onClick={stopRecordingAndSend}
              className="px-3 py-1 rounded-lg border border-red-500 bg-red-600 text-white hover:bg-red-500 text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-red-950/50"
            >
              <span>Send Audio ➔</span>
            </button>
          </div>
        </div>
      )}

      <div className="p-2 sm:p-3 space-y-2">
        {/* Branching choices / Quick chat responses:
            On small screens: renders as horizontal scrollable carousel chips so it NEVER overtakes screen!
            On medium+ screens: renders as compact 2-col grid */}
        {choices.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span className="uppercase tracking-wider font-bold">
                {t?.selectResponse ?? "QUICK CHAT"}
              </span>
              <span className="text-zinc-600">
                {choices.length} options {typeof window !== 'undefined' && window.innerWidth < 640 ? '· swipe ➔' : ''}
              </span>
            </div>

            {/* Mobile: horizontal scrollable single-row chip bar. Desktop: 2-column grid */}
            <div className="flex sm:grid sm:grid-cols-2 gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {choices.map((choice, i) => {
                const label = typeof choice === "object"
                  ? (choice[lang] ?? choice.label ?? choice.en ?? choice.text ?? "")
                  : choice;
                return (
                  <button
                    key={choice.id ?? i}
                    onClick={() => {
                      if (!isTyping) {
                        soundEngine.playMessageBeep();
                        onChoice?.(choice);
                      }
                    }}
                    disabled={isTyping}
                    className={`
                      shrink-0 sm:shrink max-w-[280px] sm:max-w-none text-left font-mono text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border
                      bg-zinc-950/90 border-zinc-800 text-zinc-200
                      transition-all duration-150
                      hover:border-red-600 hover:text-white hover:bg-zinc-900 active:scale-[0.98]
                      ${isTyping ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    title={label}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="truncate">
                        <span className="text-red-400 font-bold mr-1.5">{i + 1}.</span>
                        {label}
                      </span>
                      {!isTyping && (
                        <span className="text-zinc-500 text-[10px] shrink-0 font-bold">↵</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Freeform custom text and voice audio input row */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex-1 min-w-0">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs text-red-500 select-none font-bold">
              &gt;
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                aiModeActive
                  ? (isAm ? "ለ AI ነፍስ ጓደኛህ/ሽን ጻፍ ወይም 🎙️ ተናገር..." : "Chat with your AI soulmate or tap 🎙️...")
                  : (isAm ? "መልእክት ጻፍ ወይም 🎙️ ይጫኑ..." : "Type custom message or tap 🎙️...")
              }
              disabled={isTyping}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded-xl pl-6 pr-2.5 py-2 sm:py-2.5 font-mono text-xs text-white placeholder:text-zinc-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Voice Microphone Audio Button */}
          <button
            type="button"
            onClick={handleToggleVoiceRecord}
            disabled={isTyping}
            className={`font-mono text-xs font-bold px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border flex items-center gap-1 transition-all shrink-0
              ${isRecording
                ? "bg-red-600 border-red-500 text-white animate-pulse shadow-md shadow-red-900/50"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:text-white hover:border-red-600"
              }`}
            title="Record and send voice audio note"
          >
            <span>🎙️</span>
            <span className="hidden md:inline">{isRecording ? "Stop" : "Voice"}</span>
          </button>

          {/* Send text button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`font-mono text-xs font-bold px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border flex items-center gap-1 transition-all shrink-0
              ${!inputText.trim() || isTyping
                ? "bg-zinc-950 border-zinc-800/80 text-zinc-600 cursor-not-allowed"
                : "bg-red-600 border-red-500 text-white hover:bg-red-500 cursor-pointer shadow-md shadow-red-950/40"
              }`}
            title="Send Message"
          >
            <IconSend className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>

          {/* Gift button */}
          {canGift && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playHeartbeat();
                onGiftClick();
              }}
              disabled={isTyping}
              className="flex items-center gap-1 font-mono text-xs px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border border-zinc-800 bg-zinc-950 text-red-400 hover:border-red-600 hover:text-white transition-all shadow-sm shrink-0"
              title={t?.sendGift ?? "Send a Gift"}
            >
              <IconGift className="w-3.5 h-3.5 text-red-500" />
              <span className="hidden md:inline">{t?.sendGift ?? "Gift"}</span>
            </button>
          )}
        </form>
      </div>
    </footer>
  );
}
