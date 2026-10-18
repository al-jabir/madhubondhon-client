import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  minAge?: number; // default: 18
  maxAge?: number; // default: 75
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  error?: string;
}

const BANGLA_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BANGLA_WEEKDAYS = ['শনি', 'রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র'];

// English to Bangla number converter
export const toBanglaNumber = (num: number | string): string => {
  const banglaDigits: Record<string, string> = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  return num
    .toString()
    .replace(/[0-9]/g, (char) => banglaDigits[char] || char);
};

export const calculateAge = (dobString: string): number => {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
  minAge = 18,
  maxAge = 75,
  placeholder = 'জন্ম তারিখ নির্বাচন করুন',
  className = '',
  disabled = false,
  error,
}) => {
  const today = useMemo(() => new Date(), []);
  const maxYear = today.getFullYear() - minAge;
  const minYear = today.getFullYear() - maxAge;

  // Selected date components
  const selectedDate = useMemo(() => {
    if (!value) return null;
    const parts = value.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  }, [value]);

  // Current view in calendar (month & year)
  const [viewYear, setViewYear] = useState<number>(() => {
    return selectedDate ? selectedDate.getFullYear() : maxYear - 5; // e.g. 23 years ago
  });

  const [viewMonth, setViewMonth] = useState<number>(() => {
    return selectedDate ? selectedDate.getMonth() : 0;
  });

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync view when selectedDate changes externally
  useEffect(() => {
    if (selectedDate) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Age calculation
  const currentAge = useMemo(() => calculateAge(value), [value]);
  const isAgeValid = value ? currentAge >= minAge : true;

  // Formatted date string in Bengali
  const formattedDisplay = useMemo(() => {
    if (!selectedDate) return '';
    const day = selectedDate.getDate();
    const month = BANGLA_MONTHS[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    return `${toBanglaNumber(day)} ${month} ${toBanglaNumber(year)}`;
  }, [selectedDate]);

  // Calendar days generation
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // Day of week of the first day of the month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  // We want Saturday as first column (0 = Sat, 1 = Sun, 2 = Mon, ... 6 = Fri)
  const firstDayIndex = useMemo(() => {
    const day = new Date(viewYear, viewMonth, 1).getDay();
    // In JS: 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
    // Convert so 0 = Sat, 1 = Sun, 2 = Mon, 3 = Tue, 4 = Wed, 5 = Thu, 6 = Fri
    return (day + 1) % 7;
  }, [viewYear, viewMonth]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const formattedMonth = String(viewMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${viewYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  // Quick preset age selection
  const handleQuickAgeJump = (targetAge: number) => {
    const targetYear = today.getFullYear() - targetAge;
    setViewYear(targetYear);
  };

  // List of selectable years
  const yearsList = useMemo(() => {
    const years: number[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [maxYear, minYear]);

  // Check if a specific day is disabled (e.g. user would be under 18)
  const isDateDisabled = (day: number) => {
    const dateToCheck = new Date(viewYear, viewMonth, day);
    const minBirthDate = new Date();
    minBirthDate.setFullYear(today.getFullYear() - minAge);
    return dateToCheck > minBirthDate;
  };

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-750 dark:text-gray-300">
            {label} {required && <span className="text-rose-600">*</span>}
          </label>
          {value && isAgeValid && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-bold border border-rose-200 dark:border-rose-900/60 animate-in fade-in">
              <Sparkles className="w-3 h-3 text-rose-500 shrink-0" />
              <span>বয়স: {toBanglaNumber(currentAge)} বছর</span>
            </span>
          )}
        </div>
      )}

      {/* Main Input Display Trigger */}
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              !disabled && setIsOpen(!isOpen);
            }
          }}
          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-sm transition-all cursor-pointer select-none ${
            disabled
              ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-700'
              : isOpen
              ? 'border-rose-500 ring-2 ring-rose-500/20 bg-white dark:bg-[#1f2533] shadow-xs'
              : 'border-gray-250 dark:border-gray-700 bg-gray-50/50 dark:bg-[#1a202c] hover:bg-white dark:hover:bg-[#1f2533] hover:border-rose-400'
          } ${error || (!isAgeValid && value) ? 'border-rose-500 ring-1 ring-rose-500/30' : ''}`}
        >
          <div className="flex items-center gap-2.5 truncate">
            <CalendarIcon className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
            {value ? (
              <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {formattedDisplay}
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 font-normal font-mono">
                  ({value})
                </span>
              </span>
            ) : (
              <span className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                {placeholder}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {value && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 rounded-full text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                title="মুছে ফেলুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-rose-600' : ''
              }`}
            />
          </div>
        </div>

        {/* Validation warning if under 18 */}
        {value && !isAgeValid && (
          <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>আইনগত ও প্ল্যাটফর্ম নিয়মানুযায়ী বয়স ন্যূনতম ১৮ বছর হতে হবে।</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-1 text-[11px] text-rose-600 dark:text-rose-400 mt-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Dropdown Calendar Popover */}
        {isOpen && (
          <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[calc(100vw-2.5rem)] max-w-[340px] sm:w-80 rounded-2xl bg-white dark:bg-[#1a202c] border border-rose-100 dark:border-gray-700 shadow-2xl p-3.5 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Month & Year Controls */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 transition-colors cursor-pointer"
                aria-label="আগের মাস"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                {/* Month Select */}
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                  className="text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-rose-500 cursor-pointer"
                >
                  {BANGLA_MONTHS.map((m, idx) => (
                    <option key={m} value={idx}>
                      {m}
                    </option>
                  ))}
                </select>

                {/* Year Select */}
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                  className="text-xs font-bold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 focus:ring-1 focus:ring-rose-500 cursor-pointer"
                >
                  {yearsList.map((y) => {
                    const approxAge = today.getFullYear() - y;
                    return (
                      <option key={y} value={y}>
                        {toBanglaNumber(y)} ({toBanglaNumber(approxAge)} বছর)
                      </option>
                    );
                  })}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 transition-colors cursor-pointer"
                aria-label="পরের মাস"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Age Jump Presets */}
            <div className="mb-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="block text-[10px] font-semibold text-gray-400 dark:text-gray-500 mb-1.5 uppercase tracking-wider">
                বয়স অনুযায়ী দ্রুত খুঁজুন:
              </span>
              <div className="flex flex-wrap gap-1">
                {[20, 22, 25, 28, 30, 35].map((presetAge) => {
                  const targetYear = today.getFullYear() - presetAge;
                  const isActive = viewYear === targetYear;
                  return (
                    <button
                      key={presetAge}
                      type="button"
                      onClick={() => handleQuickAgeJump(presetAge)}
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-2xs font-bold'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-rose-50 dark:hover:bg-gray-700 hover:text-rose-600'
                      }`}
                    >
                      {toBanglaNumber(presetAge)} বছর
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weekdays Row */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {BANGLA_WEEKDAYS.map((wd, i) => (
                <div
                  key={wd}
                  className={`text-[10px] font-bold py-1 ${
                    i === 6 ? 'text-rose-500' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* Empty placeholder cells for offset */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="h-8" />
              ))}

              {/* Days of current month */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected =
                  selectedDate &&
                  selectedDate.getFullYear() === viewYear &&
                  selectedDate.getMonth() === viewMonth &&
                  selectedDate.getDate() === day;

                const disabledDate = isDateDisabled(day);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={disabledDate}
                    onClick={() => handleSelectDay(day)}
                    className={`h-8 w-8 mx-auto rounded-lg text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                      disabledDate
                        ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed opacity-40'
                        : isSelected
                        ? 'bg-linear-to-tr from-rose-600 to-pink-600 text-white font-bold shadow-md shadow-rose-200 dark:shadow-none scale-105'
                        : 'text-gray-750 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600'
                    }`}
                  >
                    {toBanglaNumber(day)}
                  </button>
                );
              })}
            </div>

            {/* Footer with manual entry info and Close */}
            <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-[10px] text-gray-500 dark:text-gray-400">
                {selectedDate ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    নির্বাচিত
                  </span>
                ) : (
                  'একটি তারিখ বেছে নিন'
                )}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 px-2 py-1 rounded-md hover:bg-rose-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                সম্পন্ন
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatePicker;
