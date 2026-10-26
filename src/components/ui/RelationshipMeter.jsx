// ─────────────────────────────────────────────────────────────────────────────
// RelationshipMeter.jsx — Red, Black & White animated relationship progress bar
// ─────────────────────────────────────────────────────────────────────────────

const THRESHOLDS = [
  { min: 0,  key: 0  },
  { min: 20, key: 20 },
  { min: 40, key: 40 },
  { min: 60, key: 60 },
  { min: 80, key: 80 },
];

function getLabel(value, labels) {
  if (!labels) return "";
  let active = labels[0] ?? "";
  for (const { min, key } of THRESHOLDS) {
    if (value >= min && labels[key] !== undefined) {
      active = labels[key];
    }
  }
  return active;
}

const ACCENT_MAP = {
  red: {
    bar: "bg-gradient-to-r from-red-700 via-red-500 to-white",
    text: "text-red-400",
    glow: "shadow-red-500/40",
  },
  emerald: {
    bar: "bg-gradient-to-r from-red-700 via-red-500 to-white",
    text: "text-red-400",
    glow: "shadow-red-500/40",
  },
  fuchsia: {
    bar: "bg-gradient-to-r from-red-700 via-red-500 to-white",
    text: "text-red-400",
    glow: "shadow-red-500/40",
  },
};

export default function RelationshipMeter({ value = 0, accentColor = "red", t = {} }) {
  const pct = Math.max(0, Math.min(100, value));
  const colors = ACCENT_MAP[accentColor] ?? ACCENT_MAP.red;
  const label = getLabel(pct, t.relationship_labels);

  return (
    <div className="w-full space-y-1 font-mono">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-zinc-400">{t.relationship ?? "relationship"}</span>
        <span className={`font-mono text-xs font-bold ${colors.text}`}>{pct}%</span>
      </div>
      <div className="w-full bg-black border border-zinc-800   h-2 overflow-hidden">
        <div
          className={`h-full   transition-all duration-700 ease-out ${colors.bar} shadow-sm ${colors.glow}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && (
        <p className={`font-mono text-xs ${colors.text} font-bold opacity-90`}>{label}</p>
      )}
    </div>
  );
}
