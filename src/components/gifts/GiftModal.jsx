// Commit: feat(gifts): add GiftModal with category tabs and gift grid

import { useState } from "react";
import { GIFT_CATEGORIES, RARITY_META } from "../../data/gifts.js";
import { IconX, IconGift, IconStar } from "../ui/Icons.jsx";

export default function GiftModal({ isOpen, onClose, onGift, character, t, lang = "en" }) {
  const [activeCategory, setActiveCategory] = useState(0);

  if (!isOpen) return null;

  const categories = GIFT_CATEGORIES ?? [];
  const currentCategory = categories[activeCategory] ?? {};
  const gifts = currentCategory.gifts ?? [];
  const accentColor = character?.accentColor ?? "#64748b";
  const borderColor = character?.borderColor ?? accentColor;

  function handleGift(gift) {
    onGift?.(gift);
    onClose?.();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className="relative w-full max-w-2xl bg-slate-900 rounded-2xl border shadow-2xl overflow-hidden"
        style={{
          borderColor: borderColor,
          boxShadow: `0 0 30px ${borderColor}40, 0 0 60px ${borderColor}15`,
        }}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <IconGift className="w-4 h-4 text-amber-400" />
            <h2 className="font-mono font-bold text-sm text-white">
              {t?.giftTitle ?? "Choose a Gift"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-4 pt-3 overflow-x-auto scrollbar-none">
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(i)}
              className={`
                shrink-0 font-mono text-xs px-3 py-1.5 rounded-lg border transition-all duration-200
                ${activeCategory === i
                  ? "text-white border-opacity-80"
                  : "text-slate-500 border-slate-800 hover:text-slate-300 hover:border-slate-600 bg-slate-900"
                }
              `}
              style={
                activeCategory === i
                  ? { borderColor: cat.color ?? accentColor, background: `${cat.color ?? accentColor}20`, color: cat.color ?? "white" }
                  : {}
              }
            >
              {cat.icon && <span className="mr-1">{cat.icon}</span>}
              {cat.label?.[lang] ?? cat.label?.en ?? cat.name ?? `Cat ${i + 1}`}
            </button>
          ))}
        </div>

        {/* Gift grid */}
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" }}>
          {gifts.map((gift, i) => {
            const rarity = RARITY_META?.[gift.rarity] ?? { label: gift.rarity ?? "common", color: "#64748b" };
            const giftName = gift.name?.[lang] ?? gift.name?.en ?? gift.name ?? "Gift";
            const giftDesc = gift.description?.[lang] ?? gift.description?.en ?? gift.description ?? "";

            return (
              <button
                key={gift.id ?? i}
                onClick={() => handleGift(gift)}
                className="group relative flex flex-col gap-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 rounded-xl p-3 text-left transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Icon + name */}
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{gift.icon ?? "🎁"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-xs font-bold text-white truncate">{giftName}</p>
                    {/* Rarity badge */}
                    <span
                      className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{
                        background: `${rarity.color}20`,
                        color: rarity.color,
                        border: `1px solid ${rarity.color}50`,
                      }}
                    >
                      {rarity.label}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {giftDesc && (
                  <p className="font-mono text-[10px] text-slate-400 leading-relaxed line-clamp-2">{giftDesc}</p>
                )}

                {/* Relationship boost */}
                {gift.relationshipBoost && (
                  <div className="flex items-center gap-1">
                    <IconStar className="w-3 h-3 text-fuchsia-400" />
                    <span className="font-mono text-[10px] text-fuchsia-300">+{gift.relationshipBoost}</span>
                  </div>
                )}

                {/* Hover: send button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl bg-black/40">
                  <span
                    className="font-mono text-xs font-bold px-3 py-1.5 rounded-lg border"
                    style={{
                      color: currentCategory.color ?? accentColor,
                      borderColor: currentCategory.color ?? accentColor,
                      background: `${currentCategory.color ?? accentColor}25`,
                    }}
                  >
                    Send 🎁
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
