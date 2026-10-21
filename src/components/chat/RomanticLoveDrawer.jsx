// ─────────────────────────────────────────────────────────────────────────────
// RomanticLoveDrawer.jsx — How Much Love Metrics, Romantic Emojis & Dev Love Lines
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { DEV_LOVE_EMOJIS, DEV_ROMANTIC_QUOTES, calculateLoveMetrics } from '../../data/romanticLove.js';
import { soundEngine } from '../../utils/audio.js';
import { IconHeart, IconZap } from '../ui/Icons.jsx';

export default function RomanticLoveDrawer({
  isOpen,
  onClose,
  charState,
  character,
  onSendLoveMessage,
  lang = 'en',
}) {
  const [activeTab, setActiveTab] = useState('emojis'); // 'emojis' | 'quotes' | 'metrics'

  if (!isOpen || !character) return null;

  const metrics = calculateLoveMetrics(
    charState?.relationship ?? 15,
    charState?.totalChoicesMade ?? 0,
    charState?.giftsGiven ?? []
  );

  const quotes = DEV_ROMANTIC_QUOTES[lang] || DEV_ROMANTIC_QUOTES.en;

  function handleSendEmoji(emojiObj) {
    soundEngine.playHeartbeat();
    onSendLoveMessage?.(`${emojiObj.emoji} ${typeof emojiObj.label === 'object' ? emojiObj.label[lang] || emojiObj.label.en : emojiObj.label}`);
    onClose?.();
  }

  function handleSendQuote(quoteObj) {
    soundEngine.playRomanticChime();
    onSendLoveMessage?.(`${quoteObj.text} ${quoteObj.devTag}`);
    onClose?.();
  }

  return (
    <div className="border-t border-slate-800 bg-slate-950/98 backdrop-blur-md p-4 animate-slide-up shadow-2xl">
      {/* Top Bar with How Much Love Summary */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
        <div className="flex items-center gap-3">
          {/* Pulsing heart indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-fuchsia-950/60 border border-fuchsia-700/60 text-fuchsia-400">
            <span className="text-sm animate-pulse">❤️</span>
            <span className="font-mono text-xs font-bold">{metrics.heartbeatBPM} BPM</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-slate-400">
            <span>// Bond:</span>
            <span className="text-emerald-400 font-bold">{metrics.bond}%</span>
            <span>·</span>
            <span>{metrics.tier}</span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
          {[
            { id: 'emojis', label: '💖 Emojis' },
            { id: 'quotes', label: '💌 Love Quotes' },
            { id: 'metrics', label: '📊 Metrics' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-[11px] px-2.5 py-1 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white px-2 py-1 text-xs font-mono ml-1"
          >
            ✕
          </button>
        </div>
      </div>

      {/* TAB 1: Romantic Developer Emojis */}
      {activeTab === 'emojis' && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {DEV_LOVE_EMOJIS.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSendEmoji(item)}
              className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-fuchsia-500/60 text-left transition-all group"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-bold text-slate-200 truncate">
                  {typeof item.label === 'object' ? item.label[lang] || item.label.en : item.label}
                </p>
                <p className="font-mono text-[9px] text-fuchsia-400/80 truncate">{item.code}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* TAB 2: Developer Romantic Quotes */}
      {activeTab === 'quotes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {quotes.map((quote, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuote(quote)}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/60 text-left transition-all"
            >
              <p className="font-mono text-xs text-slate-200 leading-snug">{quote.text}</p>
              <span className="font-mono text-[10px] text-emerald-400/80 mt-1 inline-block">
                {quote.devTag}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* TAB 3: How Much Love Metrics */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/50 p-3 rounded-2xl border border-slate-800/80">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-mono text-[10px] text-slate-500 uppercase">Heart Pulse</p>
            <p className="font-mono text-xl font-bold text-fuchsia-400 mt-0.5">{metrics.heartbeatBPM} BPM</p>
            <p className="font-mono text-[10px] text-slate-500 mt-0.5">Overclocked with love</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-mono text-[10px] text-slate-500 uppercase">Connection</p>
            <p className="font-mono text-xl font-bold text-emerald-400 mt-0.5">{metrics.bond}%</p>
            <p className="font-mono text-[10px] text-slate-500 mt-0.5">Reliable socket pair</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-mono text-[10px] text-slate-500 uppercase">Packet Loss</p>
            <p className="font-mono text-xl font-bold text-cyan-400 mt-0.5">{metrics.droppedPackets}%</p>
            <p className="font-mono text-[10px] text-slate-500 mt-0.5">Zero dropped emotions</p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-mono text-[10px] text-slate-500 uppercase">Compatibility</p>
            <p className="font-mono text-xl font-bold text-amber-400 mt-0.5">{metrics.compatibility}%</p>
            <p className="font-mono text-[10px] text-slate-500 mt-0.5">Architecture match</p>
          </div>
        </div>
      )}
    </div>
  );
}
