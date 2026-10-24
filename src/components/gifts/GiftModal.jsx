// ─────────────────────────────────────────────────────────────────────────────
// GiftModal.jsx — Developer & Romantic Gift Selection Modal
// Styled in high-tech Red, Black & White developer theme with Space Grotesk / JetBrains Mono
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { GIFT_CATEGORIES, RARITY_META } from "../../data/gifts.js";
import { IconX, IconGift, IconStar } from "../ui/Icons.jsx";

export default function GiftModal({ isOpen, onClose, onGift, character, t, lang = "en" }) {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!isOpen) return null;

  const categories = GIFT_CATEGORIES ?? [];
  const currentCategory = categories[activeCategory] ?? {};
  const gifts = currentCategory.gifts ?? [];

  function handleGift(gift) {
    onGift?.(gift);
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in font-mono select-text"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className="relative w-full max-w-2xl bg-black rounded-3xl border border-zinc-800 shadow-2xl shadow-red-950/40 overflow-hidden flex flex-col max-h-[90vh] animate-slide-up">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 bg-zinc-950/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-xl bg-red-950/70 border border-red-600/50 text-red-400">
              <IconGift className="w-4 h-4" />
            </span>
            <div>
              <h2 className="font-heading font-bold text-sm sm:text-base text-white">
                {t?.giftTitle ?? "Choose a Developer Gift"}
              </h2>
              <p className="text-[10px] text-zinc-500 font-mono">Send assets, tech fuel & tokens of affection</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-red-600"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 px-4 pt-3.5 pb-2 overflow-x-auto shrink-0 bg-black border-b border-zinc-900 scrollbar-none">
          {categories.map((cat, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveCategory(i)}
              className={`
                shrink-0 font-mono text-xs px-3.5 py-1.5 rounded-xl border transition-all duration-200 font-bold flex items-center gap-1.5
                ${activeCategory === i
                  ? "bg-red-600 text-white border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                }
              `}
            >
              {cat.icon && <span>{cat.icon}</span>}
              <span>{cat.label?.[lang] ?? cat.label?.en ?? cat.name ?? `Cat ${i + 1}`}</span>
            </button>
          ))}
        </div>

        {/* Gift grid */}
        <div
          className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto flex-1 bg-black"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#27272a transparent" }}
        >
          {gifts.map((gift, i) => {
            const giftName = gift.name?.[lang] ?? gift.name?.en ?? gift.name ?? "Gift";
            const giftDesc = gift.description?.[lang] ?? gift.description?.en ?? gift.description ?? "";

            return (
              <button
                key={gift.id ?? i}
                type="button"
                onClick={() => handleGift(gift)}
                className="group relative flex flex-col justify-between gap-2.5 bg-zinc-950 hover:bg-zinc-900/90 border border-zinc-800 hover:border-red-600 rounded-2xl p-3.5 text-left transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-black"
              >
                <div>
                  {/* Icon + name */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-3xl p-1.5 rounded-xl bg-black border border-zinc-800 group-hover:border-red-600/70 transition-colors shrink-0">
                      {gift.icon ?? "🎁"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-bold text-white truncate group-hover:text-red-400 transition-colors">
                        {giftName}
                      </p>
                      {/* Rarity badge */}
                      <span className="inline-block mt-0.5 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-zinc-900 text-red-300 border border-red-900/50">
                        {gift.rarity || 'Common'}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {giftDesc && (
                    <p className="font-mono text-[10px] text-zinc-400 leading-relaxed line-clamp-2">
                      {giftDesc}
                    </p>
                  )}
                </div>

                {/* Relationship boost */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-900 text-[10px]">
                  {gift.relationshipBoost ? (
                    <div className="flex items-center gap-1 text-red-400 font-bold">
                      <IconStar className="w-3 h-3 text-red-500" />
                      <span>+{gift.relationshipBoost} Bond</span>
                    </div>
                  ) : (
                    <span className="text-zinc-600 font-mono">Dev Token</span>
                  )}
                  <span className="text-zinc-500 group-hover:text-white transition-colors text-[10px] font-bold">
                    Send →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
