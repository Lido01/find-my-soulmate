// Commit: feat(settings): add ApiKeyModal for Gemini API key configuration

import { useState } from "react";
import { IconKey, IconX, IconCheck } from "../ui/Icons.jsx";

// Simple eye SVG icons inline (no external deps)
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
  const [status, setStatus] = useState(null); // null | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const hasKey = Boolean(currentKey);

  async function handleSave() {
    const key = inputKey.trim();
    if (!key) return;
    setLoading(true);
    setStatus(null);
    try {
      const result = await onSave?.(key);
      if (result === false) {
        setStatus("error");
        setErrorMsg(t?.apiKeyError ?? "Invalid key or connection failed.");
      } else {
        setStatus("success");
        setTimeout(() => {
          onClose?.();
          setStatus(null);
          setInputKey("");
        }, 1200);
      }
    } catch {
      setStatus("error");
      setErrorMsg(t?.apiKeyError ?? "Connection failed. Check your key.");
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    onSave?.("");
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.70)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <IconKey className="w-4 h-4 text-emerald-400" />
            <h2 className="font-mono font-bold text-sm text-white">
              {t?.apiKeyTitle ?? "AI Mode — Gemini API Key"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Explanation */}
          <p className="font-mono text-xs text-slate-400 leading-relaxed">
            Connect your Gemini API key to enable real AI conversation with your soulmate instead of scripted dialogues.
          </p>

          {/* If key already set */}
          {hasKey && (
            <div className="bg-emerald-950/50 border border-emerald-700/50 rounded-lg px-4 py-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-emerald-300 font-bold mb-0.5">✓ API Key Connected</p>
                <p className="font-mono text-[10px] text-emerald-600">{maskKey(currentKey)}</p>
              </div>
              <button
                onClick={handleDisconnect}
                className="font-mono text-xs text-red-400 hover:text-red-300 border border-red-800 hover:border-red-600 px-2 py-1 rounded transition-all"
              >
                Disconnect AI
              </button>
            </div>
          )}

          {/* Key input */}
          <div className="space-y-2">
            <label className="font-mono text-xs text-slate-400">{t?.apiKeyLabel ?? "Gemini API Key"}</label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder={t?.apiKeyPlaceholder ?? "AIza..."}
                className="w-full font-mono text-sm bg-slate-800 border border-slate-700 focus:border-emerald-600 focus:outline-none rounded-lg px-3 py-2.5 pr-10 text-slate-100 placeholder-slate-600 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Hint link */}
          <p className="font-mono text-[10px] text-slate-600">
            {t?.apiKeyHint ?? "Get your key at"}{" "}
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-300 underline transition-colors"
            >
              aistudio.google.com
            </a>
          </p>

          {/* Status */}
          {status === "success" && (
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
              <IconCheck className="w-4 h-4" />
              {t?.apiKeySuccess ?? "Connected! AI mode enabled."}
            </div>
          )}
          {status === "error" && (
            <p className="font-mono text-xs text-red-400">{errorMsg}</p>
          )}

          {/* Test & Connect button */}
          <button
            onClick={handleSave}
            disabled={loading || !inputKey.trim()}
            className={`
              w-full font-mono text-sm font-bold py-2.5 rounded-lg border transition-all duration-200
              ${loading || !inputKey.trim()
                ? "opacity-40 cursor-not-allowed border-slate-700 text-slate-500 bg-slate-800"
                : "border-emerald-600 text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 hover:text-white"
              }
            `}
          >
            {loading ? "Validating..." : (t?.apiKeyConnect ?? "Test & Connect")}
          </button>
        </div>
      </div>
    </div>
  );
}
