// Commit: feat(ui): add StatBar component for character stat display

// Red, Black & White developer theme StatBar
const COLOR_MAP = {
  red: {
    bar: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]",
    text: "text-red-400 font-bold",
  },
  crimson: {
    bar: "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.6)]",
    text: "text-red-500 font-bold",
  },
  white: {
    bar: "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]",
    text: "text-white font-bold",
  },
  zinc: {
    bar: "bg-zinc-500",
    text: "text-zinc-300",
  },
  // Seamless brand fallbacks
  emerald: {
    bar: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
    text: "text-red-400",
  },
  fuchsia: {
    bar: "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]",
    text: "text-red-300",
  },
  cyan: {
    bar: "bg-zinc-200 shadow-[0_0_8px_rgba(255,255,255,0.4)]",
    text: "text-white font-bold",
  },
  amber: {
    bar: "bg-red-400",
    text: "text-red-300",
  },
  slate: {
    bar: "bg-zinc-700",
    text: "text-zinc-400",
  },
};

export default function StatBar({ label, value, color = "red" }) {
  const colors = COLOR_MAP[color] ?? COLOR_MAP.red;
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-2 w-full font-mono">
      <span className="text-[11px] text-zinc-400 w-24 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-zinc-900 border border-zinc-800   h-1.5 overflow-hidden">
        <div
          className={`h-full   transition-all duration-500 ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-[11px] w-8 text-right shrink-0 ${colors.text}`}>
        {pct}
      </span>
    </div>
  );
}
