// ─────────────────────────────────────────────────────────────────────────────
// FooterConsole.jsx — Terminal Input, Audio Voice Recording, Choices & Gifts
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";
import { MOOD_META } from "../../data/characters.js";
import { IconGift, IconTerminal, IconSend } from "../ui/Icons.jsx";
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
    <footer className="border-t border-slate-800 bg-slate-950/95 backdrop-blur shrink-0 relative">
      {/* Terminal title bar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/60">
        {/* macOS traffic lights */}
        <div className="flex items-center gap-1.5 mr-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <IconTerminal className="w-3.5 h-3.5" />
          <span className="font-mono text-xs tracking-widest font-semibold">
            {t?.devTerminal ?? "DEV_TERMINAL"}
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Quick Voice Audio Presets Button */}
          <button
            type="button"
            onClick={() => setShowVoicePresets((prev) => !prev)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border border-slate-700 bg-slate-900 text-slate-300 hover:text-cyan-300 hover:border-cyan-600 transition-all"
            title="Send romantic voice audio clips"
          >
            <span>🎙️</span>
            <span className="hidden sm:inline">{isAm ? "የድምፅ ቅንጥብ" : "Voice Note"}</span>
          </button>

          {/* Romantic Love Drawer Button */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playHeartbeat();
              onToggleLoveDrawer?.();
            }}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-bold border transition-all ${
              loveDrawerOpen
                ? 'bg-fuchsia-950 border-fuchsia-500 text-fuchsia-300 shadow-md shadow-fuchsia-900/40'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-fuchsia-300 hover:border-fuchsia-600'
            }`}
            title="Open Developer Love Indicators & Romantic Emojis"
          >
            <span>💖</span>
            <span className="hidden sm:inline">Love Hub</span>
          </button>

          {/* Mood indicator */}
          {moodMeta.emoji && (
            <div className="flex items-center gap-1">
              <span className="text-xs">{moodMeta.emoji}</span>
              <span className={`font-mono text-[10px] font-bold ${moodMeta.textClass || 'text-cyan-400'}`}>
                {t?.moods?.[mood] ?? mood}
              </span>
            </div>
          )}

          {/* Typing status */}
          {isTyping && (
            <span className="font-mono text-[10px] text-amber-400 animate-pulse">
              {t?.isTyping ?? "typing..."}
            </span>
          )}
        </div>
      </div>

      {/* Voice Presets Dropdown Drawer */}
      {showVoicePresets && (
        <div className="p-3 bg-slate-900/95 border-b border-slate-800 animate-slide-up space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
              <span>🎙️</span>
              <span>{isAm ? "ፈጣን የድምፅ መልእክት ምረጥ" : "Select a Romantic Voice Note to Send"}</span>
            </span>
            <button
              onClick={() => setShowVoicePresets(false)}
              className="text-xs text-slate-500 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {voicePresets.map((phrase, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendVoicePreset(phrase)}
                className="text-left p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500 text-xs text-slate-300 hover:text-white transition-all flex items-center justify-between group"
              >
                <span className="truncate pr-2">"{phrase}"</span>
                <span className="text-cyan-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  🎙️ Send
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Voice Recording Overlay */}
      {isRecording && (
        <div className="p-3 bg-red-950/40 border-b border-red-800/60 animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              <span className="font-mono text-xs font-bold text-red-400">
                REC 0:0{recordSeconds}
              </span>
            </div>

            {/* Audio wave animation */}
            <div className="flex items-center gap-1 h-5">
              <span className="w-1 h-3 bg-red-400 animate-pulse" />
              <span className="w-1 h-5 bg-red-400 animate-pulse delay-75" />
              <span className="w-1 h-4 bg-red-400 animate-pulse delay-150" />
              <span className="w-1 h-2 bg-red-400 animate-pulse delay-200" />
            </div>

            <p className="font-mono text-xs text-slate-200 truncate max-w-xs sm:max-w-md">
              {voiceText || (isAm ? "እየሰማሁ ነው... ተናገሩ" : "Listening... speak now")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={cancelRecording}
              className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-400 hover:text-white text-xs font-mono"
            >
              ✕ Cancel
            </button>
            <button
              type="button"
              onClick={stopRecordingAndSend}
              className="px-3 py-1 rounded-lg border border-red-600 bg-red-950 text-red-200 hover:bg-red-900 text-xs font-mono font-bold flex items-center gap-1 shadow-md shadow-red-950/50"
            >
              <span>🎙️</span>
              <span>Send Voice</span>
            </button>
          </div>
        </div>
      )}

      <div className="p-3 space-y-2.5">
        {/* Branching choices (when available in scripted mode) */}
        {choices.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                {t?.selectResponse ?? "QUICK RESPONSES"}
              </p>
              <span className="font-mono text-[10px] text-slate-600">
                {choices.length} options
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                      group relative w-full text-left font-mono text-xs px-3 py-2 rounded-xl border
                      bg-slate-900/90 border-slate-700/80 text-slate-300
                      transition-all duration-200
                      hover:border-opacity-100 hover:text-white hover:bg-slate-800
                      ${isTyping ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
                    `}
                    onMouseEnter={(e) => {
                      if (!isTyping) e.currentTarget.style.borderColor = borderColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "";
                    }}
                  >
                    <span className="text-slate-600 mr-1.5">{i + 1}.</span>
                    {label}
                    {!isTyping && (
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        ↵
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Freeform custom text and voice audio input row */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2 pt-1">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-emerald-400 select-none">
              &gt;
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                aiModeActive
                  ? (isAm ? "ለ AI ነፍስ ጓደኛህ/ሽን መልእክት ጻፍ ወይም 🎙️ ተጭነህ ተናገር..." : "Chat freely with your AI soulmate or tap 🎙️ to speak...")
                  : (isAm ? "መልእክት ይተይቡ፣ ከላይ ይምረጡ ወይም 🎙️ ይጫኑ..." : "Type custom message, choose above, or tap 🎙️...")
              }
              disabled={isTyping}
              className="w-full bg-slate-900 border border-slate-700 focus:border-emerald-500 rounded-xl pl-7 pr-3 py-2.5 font-mono text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Voice Microphone Audio Button */}
          <button
            type="button"
            onClick={handleToggleVoiceRecord}
            disabled={isTyping}
            className={`font-mono text-xs font-bold px-3 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all
              ${isRecording
                ? "bg-red-950 border-red-500 text-red-300 animate-pulse shadow-md shadow-red-900/50"
                : "bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500"
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
            className={`font-mono text-xs font-bold px-3 py-2.5 rounded-xl border flex items-center gap-1.5 transition-all
              ${!inputText.trim() || isTyping
                ? "bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed"
                : "bg-emerald-950 border-emerald-700 text-emerald-300 hover:bg-emerald-900 cursor-pointer shadow-md shadow-emerald-900/30"
              }`}
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
              className="flex items-center gap-1.5 font-mono text-xs px-3 py-2.5 rounded-xl border border-fuchsia-700/60 bg-fuchsia-950/40 text-fuchsia-300 hover:bg-fuchsia-900/50 hover:border-fuchsia-500 transition-all shadow-md shadow-fuchsia-900/20"
              title={t?.sendGift ?? "Send a Gift"}
            >
              <IconGift className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="hidden sm:inline">{t?.sendGift ?? "🎁 Gift"}</span>
            </button>
          )}
        </form>
      </div>
    </footer>
  );
}
