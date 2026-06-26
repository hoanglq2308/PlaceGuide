import { LANGUAGE_OPTIONS } from '../i18n/languageConfig';
import { useLanguage } from '../context/LanguageContext';

function LanguageSelector({ className = '' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <label
      className={`inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:border-red-200 hover:text-red-700 sm:gap-2 sm:px-2.5 sm:text-sm ${className}`}
    >
      <span className="material-symbols-outlined shrink-0 text-[18px]" aria-hidden="true">
        language
      </span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label="Choose language"
        className="min-w-0 max-w-[7rem] bg-transparent outline-none sm:max-w-32"
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSelector;
