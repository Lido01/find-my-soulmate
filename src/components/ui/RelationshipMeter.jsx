// Commit: feat(ui): add RelationshipMeter with animated progress and label thresholds

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
  emerald: {
    bar: "bg-emerald-500",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/30",
  },
  fuchsia: {
    bar: "bg-fuchsia-500",
    text: "text-fuchsia-400",
    glow: "shadow-fuchsia-500/30",
  },
};

export default function RelationshipMeter({ value = 0, accentColor = "emerald", t = {} }) {
  const pct = Math.max(0, Math.min(100, value));
  const colors = ACCENT_MAP[accentColor] ?? ACCENT_MAP.emerald;
  const label = getLabel(pct, t.relationship_labels);

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-400">{t.relationship ?? "relationship"}</span>
        <span className={`font-mono text-xs font-bold ${colors.text}`}>{pct}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar} shadow-sm ${colors.glow}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {label && (
        <p className={`font-mono text-xs ${colors.text} opacity-80`}>{label}</p>
      )}
    </div>
  );
}
