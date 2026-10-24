// ─────────────────────────────────────────────────────────────────────────────
// LoveWordBubble.jsx — Floating random romantic dev word display
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

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
    function showBubble() {
      const w = getRandomWord(lang);
      if (w) {
        setWord(w);
        setFading(false);
        setVisible(true);

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
      className={`fixed bottom-6 left-4 z-40 pointer-events-none transition-all duration-500 font-mono ${
        fading ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
    >
      <div className="bg-black/95 backdrop-blur border border-red-600/70 rounded-2xl px-4 py-2 shadow-xl shadow-red-950/50">
        <p className="text-red-400 text-sm font-bold tracking-wide">{word}</p>
      </div>
    </div>
  );
}
