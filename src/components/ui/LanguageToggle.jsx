// Commit: feat(ui): add LanguageToggle with flag buttons for EN/AM

import { useLang } from "../../context/LanguageContext.jsx";

const LANG_OPTIONS = [
  { code: "en", flag: "🇺🇸", label: "EN" },
  { code: "am", flag: "🇪🇹", label: "AM" },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-0.5">
      {LANG_OPTIONS.map(({ code, flag, label }) => {
        const isActive = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`
              flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-xs transition-all duration-200
              ${isActive
                ? "bg-slate-700 text-white shadow-sm border border-slate-500"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }
            `}
            style={isActive ? { boxShadow: "0 0 6px rgba(148,163,184,0.4)" } : {}}
            title={`Switch to ${label}`}
          >
            <span className="text-sm leading-none">{flag}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
