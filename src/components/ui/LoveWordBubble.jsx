// Commit: feat(ui): add LoveWordBubble floating random love word display

import { useState, useEffect } from "react";
import { LOVE_WORDS } from "../../data/i18n.js";

function getRandomWord(lang) {
  const words = LOVE_WORDS?.[lang];
  if (!words || words.length === 0) return null;
  return words[Math.floor(Math.random() * words.length)];
}

export default function LoveWordBubble({ lang = "en" }) {
  const [word, setWord] = useState(null);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show bubble randomly every ~30 seconds for 4 seconds
    function showBubble() {
      const w = getRandomWord(lang);
      if (w) {
        setWord(w);
        setFading(false);
        setVisible(true);

        // Start fade out after 3.5s, hide fully at 4s
        const fadeTimer = setTimeout(() => setFading(true), 3500);
        const hideTimer = setTimeout(() => setVisible(false), 4000);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(hideTimer);
        };
      }
    }

    const interval = setInterval(showBubble, 30000);
    return () => clearInterval(interval);
  }, [lang]);

  // Refresh word every 8 seconds if already visible
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      const w = getRandomWord(lang);
      if (w) setWord(w);
    }, 8000);
    return () => clearInterval(interval);
  }, [visible, lang]);

  if (!visible || !word) return null;

  return (
    <div
      className={`fixed bottom-6 left-4 z-40 pointer-events-none transition-all duration-500 ${
        fading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="font-mono bg-slate-900/90 backdrop-blur border border-fuchsia-500/40 rounded-2xl px-4 py-2 shadow-lg"
        style={{ boxShadow: "0 0 12px rgba(217,70,239,0.3)" }}>
        <p className="text-fuchsia-300 text-sm font-bold tracking-wide">{word}</p>
      </div>
    </div>
  );
}
