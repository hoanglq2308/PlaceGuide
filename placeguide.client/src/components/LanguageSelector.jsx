import { LANGUAGE_OPTIONS } from '../i18n/languageConfig';
import { useLanguage } from '../context/LanguageContext';

function LanguageSelector({ className = '' }) {
  const { language, setLanguage } = useLanguage();

  return (
    <label
      className={`inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:border-red-200 hover:text-red-700 ${className}`}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        language
      </span>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value)}
        aria-label="Choose language"
        className="max-w-32 bg-transparent outline-none"
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
