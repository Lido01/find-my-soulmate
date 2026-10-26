// ─────────────────────────────────────────────────────────────────────────────
// RomanticLoveDrawer.jsx — How Much Love Metrics, Romantic Emojis & Dev Love Lines
// High-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { DEV_LOVE_EMOJIS, getRomanticQuotes, calculateLoveMetrics } from '../../data/romanticLove.js';
import { soundEngine } from '../../utils/audio.js';

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

  const quotes = getRomanticQuotes(character?.gender || 'female', lang);

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
    <div className="border-t border-zinc-800 bg-black/98 backdrop-blur-md p-3 sm:p-4 max-h-[38vh] sm:max-h-[48vh] overflow-y-auto animate-slide-up shadow-2xl font-mono select-text">
      {/* Top Bar with How Much Love Summary */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          {/* Pulsing heart indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1   bg-red-950/80 border border-red-600/70 text-red-400">
            <span className="text-sm animate-pulse">❤️</span>
            <span className="font-mono text-xs font-bold">{metrics.heartbeatBPM} BPM</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-xs text-zinc-400">
            <span>// Bond:</span>
            <span className="text-white font-bold">{metrics.bond}%</span>
            <span>·</span>
            <span className="text-red-400 font-bold">{metrics.tier}</span>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800   p-1">
          {[
            { id: 'emojis', label: '❤️ Emojis' },
            { id: 'quotes', label: '💌 Love Quotes' },
            { id: 'metrics', label: '📊 Metrics' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`font-mono text-[11px] px-3 py-1   transition-all font-bold ${
                activeTab === tab.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-white px-2 py-1 text-xs font-mono ml-1"
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
              type="button"
              onClick={() => handleSendEmoji(item)}
              className="flex items-center gap-2.5 p-2   bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600 text-left transition-all group shadow-sm"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs font-bold text-zinc-200 truncate group-hover:text-white">
                  {typeof item.label === 'object' ? item.label[lang] || item.label.en : item.label}
                </p>
                <p className="font-mono text-[9px] text-red-400 truncate">{item.code}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* TAB 2: Developer Romantic Quotes */}
      {activeTab === 'quotes' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#27272a transparent' }}>
          {quotes.map((quote, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendQuote(quote)}
              className="p-2.5   bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-red-600 text-left transition-all shadow-sm"
            >
              <p className="font-mono text-xs text-zinc-200 leading-snug">{quote.text}</p>
              <span className="font-mono text-[10px] text-red-400 mt-1 inline-block font-bold">
                {quote.devTag}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* TAB 3: How Much Love Metrics */}
      {activeTab === 'metrics' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-3   border border-zinc-800">
          <div className="p-3 bg-black   border border-zinc-800">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Heart Pulse</p>
            <p className="font-mono text-xl font-bold text-red-400 mt-0.5">{metrics.heartbeatBPM} BPM</p>
            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Overclocked with love</p>
          </div>
          <div className="p-3 bg-black   border border-zinc-800">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Connection</p>
            <p className="font-mono text-xl font-bold text-white mt-0.5">{metrics.bond}%</p>
            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Reliable socket pair</p>
          </div>
          <div className="p-3 bg-black   border border-zinc-800">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Packet Loss</p>
            <p className="font-mono text-xl font-bold text-zinc-300 mt-0.5">{metrics.droppedPackets}%</p>
            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Zero dropped emotions</p>
          </div>
          <div className="p-3 bg-black   border border-zinc-800">
            <p className="font-mono text-[10px] text-zinc-500 uppercase">Compatibility</p>
            <p className="font-mono text-xl font-bold text-red-400 mt-0.5">{metrics.compatibility}%</p>
            <p className="font-mono text-[10px] text-zinc-500 mt-0.5">Architecture match</p>
          </div>
        </div>
      )}
    </div>
  );
}
