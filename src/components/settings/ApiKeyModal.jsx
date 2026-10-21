// ─────────────────────────────────────────────────────────────────────────────
// ApiKeyModal.jsx — Resilient Gemini API key setup with detailed diagnostics
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { IconKey, IconX, IconCheck } from "../ui/Icons.jsx";
import { cleanApiKey, testGeminiApiKey } from "../../utils/gemini.js";
import { soundEngine } from "../../utils/audio.js";

function IconEye({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function maskKey(key) {
  if (!key || key.length < 8) return "••••••••";
  return key.slice(0, 4) + "••••••••" + key.slice(-4);
}

export default function ApiKeyModal({ isOpen, onClose, onSave, currentKey = "", t = {} }) {
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'success' | 'warning' | 'error'
  const [feedback, setFeedback] = useState("");
  const [allowForceSave, setAllowForceSave] = useState(false);

  if (!isOpen) return null;

  const hasKey = Boolean(currentKey);

  // Primary: Test and Save
  async function handleTestAndSave() {
    const raw = inputKey.trim();
    if (!raw) return;

    const cleaned = cleanApiKey(raw);
    if (!cleaned) return;

    setLoading(true);
    setStatus(null);
    setFeedback("");
    setAllowForceSave(false);

    try {
      const testResult = await testGeminiApiKey(cleaned);

      if (testResult.success) {
        soundEngine.playRomanticChime();
        onSave?.(cleaned);
        setStatus("success");
        setFeedback(`✓ Connected successfully to Google Gemini (${testResult.workingModel}${testResult.modelsCount ? ` · ${testResult.modelsCount} models auto-enabled` : ''})!`);
        setTimeout(() => {
          onClose?.();
          setStatus(null);
          setInputKey("");
        }, 1400);
      } else {
        setStatus("warning");
        setFeedback(testResult.error || "Connection test failed. Google returned an error.");
        setAllowForceSave(true);
      }
    } catch (err) {
      setStatus("warning");
      setFeedback(err.message || "Network error testing connection.");
      setAllowForceSave(true);
    } finally {
      setLoading(false);
    }
  }

  // Fallback: Save directly without blocking
  function handleForceSave() {
    const cleaned = cleanApiKey(inputKey);
    if (cleaned) {
      soundEngine.playHeartbeat();
      onSave?.(cleaned);
      setStatus("success");
      setFeedback("✓ Key saved! AI Mode is now active.");
      setTimeout(() => {
        onClose?.();
        setStatus(null);
        setInputKey("");
        setAllowForceSave(false);
      }, 1000);
    }
  }

  function handleDisconnect() {
    onSave?.("");
    setStatus(null);
    setFeedback("");
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <IconKey className="w-5 h-5 text-emerald-400" />
            <h2 className="font-mono font-bold text-sm text-white">
              {t?.apiKeyTitle ?? "Connect Gemini AI Chat"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Explanation */}
          <p className="font-mono text-xs text-slate-400 leading-relaxed">
            Connect your Gemini API key to unlock unscripted, real-time AI roleplay with your soulmates in English or Amharic!
          </p>

          {/* Current key indicator */}
          {hasKey && (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-950/40 border border-emerald-700/60">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs text-emerald-300 font-bold">Active Key:</span>
                <span className="font-mono text-xs text-slate-400">{maskKey(currentKey)}</span>
              </div>
              <button
                type="button"
                onClick={handleDisconnect}
                className="font-mono text-[10px] text-red-400 hover:text-red-300 underline"
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Input field */}
          <div className="space-y-1.5">
            <label className="font-mono text-[11px] text-slate-400 block font-bold">
              Gemini API Key:
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setStatus(null);
                  setFeedback("");
                }}
                placeholder="Paste API key (starts with AIzaSy...)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 pr-10 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showKey ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
            <p className="font-mono text-[10px] text-slate-500 pt-0.5">
              Get your free key at{" "}
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline"
              >
                aistudio.google.com
              </a>
            </p>
          </div>

          {/* Status feedback block */}
          {feedback && (
            <div
              className={`p-3 rounded-xl font-mono text-xs leading-relaxed border ${
                status === "success"
                  ? "bg-emerald-950/60 border-emerald-700 text-emerald-300"
                  : "bg-amber-950/60 border-amber-700 text-amber-300"
              }`}
            >
              <p>{feedback}</p>
              {allowForceSave && (
                <div className="mt-2 pt-2 border-t border-amber-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">If you know this key is correct:</span>
                  <button
                    type="button"
                    onClick={handleForceSave}
                    className="px-2.5 py-1 rounded bg-amber-800/60 hover:bg-amber-700/80 text-white font-bold text-[10px]"
                  >
                    Save Key Anyway →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              disabled={loading || !inputKey.trim()}
              onClick={handleTestAndSave}
              className={`flex-1 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                loading || !inputKey.trim()
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50 cursor-pointer"
              }`}
            >
              {loading ? (
                <span>Testing connection with Gemini...</span>
              ) : (
                <>
                  <IconCheck className="w-4 h-4" />
                  <span>Connect & Save Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
