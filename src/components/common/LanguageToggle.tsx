import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface LanguageToggleProps {
  compact?: boolean;
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ compact = false, className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-full border border-strongline bg-elev font-bold select-none transition-all ${
        compact ? 'h-7 text-[10px]' : 'h-8 text-[11px]'
      } ${className}`}
      role="group"
      aria-label="Language Selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('bn')}
        className={`flex items-center justify-center rounded-full transition-all cursor-pointer ${
          compact ? 'px-2 h-full' : 'px-2.5 h-full'
        } ${
          language === 'bn'
            ? 'bg-brand text-white shadow-xs font-black'
            : 'text-ink-2 hover:text-ink hover:bg-card/50'
        }`}
        title={language === 'bn' ? 'বাংলা (সক্রিয়)' : 'বাংলা ভাষায় পরিবর্তন করুন'}
      >
        বাং
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`flex items-center justify-center rounded-full transition-all cursor-pointer ${
          compact ? 'px-2 h-full' : 'px-2.5 h-full'
        } ${
          language === 'en'
            ? 'bg-brand text-white shadow-xs font-black'
            : 'text-ink-2 hover:text-ink hover:bg-card/50'
        }`}
        title={language === 'en' ? 'English (Active)' : 'Switch to English'}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageToggle;
