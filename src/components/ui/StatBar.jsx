// Commit: feat(ui): add StatBar component for character stat display

const COLOR_MAP = {
  emerald: {
    bar: "bg-emerald-500",
    text: "text-emerald-400",
  },
  fuchsia: {
    bar: "bg-fuchsia-500",
    text: "text-fuchsia-400",
  },
  cyan: {
    bar: "bg-cyan-500",
    text: "text-cyan-400",
  },
  amber: {
    bar: "bg-amber-500",
    text: "text-amber-400",
  },
  red: {
    bar: "bg-red-500",
    text: "text-red-400",
  },
  slate: {
    bar: "bg-slate-500",
    text: "text-slate-400",
  },
};

export default function StatBar({ label, value, color = "slate" }) {
  const colors = COLOR_MAP[color] ?? COLOR_MAP.slate;
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="font-mono text-xs text-slate-400 w-20 shrink-0 truncate">{label}</span>
      <div className="flex-1 bg-slate-800 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-xs w-8 text-right shrink-0 ${colors.text}`}>
        {pct}
      </span>
    </div>
  );
}
