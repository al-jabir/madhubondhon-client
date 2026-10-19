import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ compact = false, className = '' }) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleLanguage}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border border-line bg-elev hover:border-brand/40 text-xs font-bold text-ink transition-all cursor-pointer shadow-2xs ${className}`}
        title={language === 'bn' ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
        aria-label="Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-brand shrink-0" />
        <span>{language === 'bn' ? 'EN' : 'বাং'}</span>
      </button>
    );
  }

  return (
    <div
      className={`inline-flex items-center p-0.5 h-8 rounded-full border border-strongline bg-elev text-[11px] font-bold select-none transition-colors ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`px-2.5 h-full flex items-center justify-center rounded-full transition-all cursor-pointer ${
          language === 'bn'
            ? 'bg-brand text-white shadow-xs font-black'
            : 'text-ink-2 hover:text-ink hover:bg-card/50'
        }`}
        title="বাংলা ভাষা নির্বাচন করুন"
      >
        বাং
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 h-full flex items-center justify-center rounded-full transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-brand text-white shadow-xs font-black'
            : 'text-ink-2 hover:text-ink hover:bg-card/50'
        }`}
        title="Switch to English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
