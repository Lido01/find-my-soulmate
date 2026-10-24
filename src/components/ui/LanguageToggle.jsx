// Red, Black & White developer theme LanguageToggle
import { useLang } from "../../context/LanguageContext.jsx";

const LANG_OPTIONS = [
  { code: "en", flag: "🇺🇸", label: "EN" },
  { code: "am", flag: "🇪🇹", label: "AM" },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLang();

  return (
    <div className="flex items-center gap-1 bg-black border border-zinc-800 rounded-lg p-0.5">
      {LANG_OPTIONS.map(({ code, flag, label }) => {
        const isActive = lang === code;
        return (
          <button
            key={code}
            onClick={() => setLang(code)}
            className={`
              flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-xs transition-all duration-200
              ${isActive
                ? "bg-red-600 text-white font-bold shadow-sm border border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-900 border border-transparent"
              }
            `}
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
