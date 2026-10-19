import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X, Send, Phone, Sparkles } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { adminApi } from '../../api/admin.api';

// Official WhatsApp Vector Icon (SVG)
export const WhatsAppIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.276-.1-.476-.15-.676.15-.2.301-.777.979-.953 1.18-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.494-.894-.798-1.497-1.784-1.673-2.085-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.175.2-.301.301-.502.1-.2.05-.376-.025-.527-.075-.15-.676-1.63-.927-2.232-.244-.587-.492-.507-.676-.517-.175-.01-.376-.01-.577-.01-.2 0-.526.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.278.495 1.716.634.721.23 1.378.197 1.9.12.581-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.176-1.43-.076-.125-.276-.2-.577-.35zM12.004 2c-5.523 0-10 4.477-10 10 0 1.77.46 3.435 1.265 4.89L2 22l5.233-1.237C8.634 21.47 10.27 22 12.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.2c-1.523 0-2.956-.412-4.195-1.127l-.3-.173-3.111.736.75-3.033-.19-.306A8.17 8.17 0 0 1 3.804 12c0-4.521 3.683-8.2 8.2-8.2 4.521 0 8.2 3.679 8.2 8.2 0 4.521-3.679 8.2-8.2 8.2z" />
  </svg>
);

// WhatsApp Colored Circular Emblem
export const WhatsAppEmblem: React.FC<{ className?: string }> = ({
  className = 'w-9 h-9',
}) => (
  <div
    className={`rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0 ${className}`}
  >
    <WhatsAppIcon className="w-5 h-5 text-white" />
  </div>
);

interface WhatsAppSupportWidgetProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppSupportWidget: React.FC<WhatsAppSupportWidgetProps> = ({
  phoneNumber,
  defaultMessage,
}) => {
  const { isBengali } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic platform settings for support numbers if available
  const { data: settingsData } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => adminApi.getPublicSettings(),
    staleTime: 5 * 60 * 1000,
  });

  const settings = settingsData?.data?.settings;
  const rawPhone =
    phoneNumber || settings?.supportWhatsApp || settings?.contactPhone || '8801700000000';

  // Format clean digits for WhatsApp URL
  const formatWhatsAppNumber = (phone: string): string => {
    let digits = phone.replace(/\D/g, '');
    if (digits.startsWith('01') && digits.length === 11) {
      digits = '88' + digits;
    }
    return digits || '8801700000000';
  };

  const cleanPhone = formatWhatsAppNumber(rawPhone);
  const displayPhone = settings?.supportWhatsApp || settings?.contactPhone || '+8801700000000';

  const defaultGreeting = isBengali
    ? 'আসসালামু আলাইকুম, মধুবন্ধন (Tangail Matrimony) সম্পর্কে আমার কিছু তথ্য জানার ছিল।'
    : 'Assalamu Alaikum, I would like to inquire about MadhuBondhon (Tangail Matrimony).';

  const [message, setMessage] = useState(defaultMessage || defaultGreeting);

  // Update default message when language changes if user hasn't typed custom message
  useEffect(() => {
    if (!defaultMessage) {
      setMessage(defaultGreeting);
    }
  }, [isBengali, defaultGreeting, defaultMessage]);

  // Close popover when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLaunchWhatsApp = (msgToSend?: string) => {
    const text = (msgToSend || message || defaultGreeting).trim();
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Quick query topics
  const quickTopics = [
    {
      id: 'general',
      labelBn: '💬 সাধারণ জিজ্ঞাসা',
      labelEn: '💬 General Query',
      msgBn: 'আসসালামু আলাইকুম, মধুবন্ধন প্ল্যাটফর্ম সম্পর্কে আমার কিছু তথ্য জানার ছিল।',
      msgEn: 'Assalamu Alaikum, I would like to inquire about the MadhuBondhon platform.',
    },
    {
      id: 'biodata',
      labelBn: '📋 বায়োডাটা সহায়তা',
      labelEn: '📋 Biodata Help',
      msgBn: 'আসসালামু আলাইকুম, আমার বায়োডাটা তৈরি বা অনুমোদনে সহায়তা প্রয়োজন।',
      msgEn: 'Assalamu Alaikum, I need assistance with creating/approving my biodata.',
    },
    {
      id: 'otp',
      labelBn: '🔐 অভিভাবক ওটিপি',
      labelEn: '🔐 Guardian OTP',
      msgBn: 'আসসালামু আলাইকুম, অভিভাবকের ওটিপি ভেরিফিকেশনে সহায়তা চাচ্ছি।',
      msgEn: 'Assalamu Alaikum, I need assistance with guardian OTP verification.',
    },
    {
      id: 'packages',
      labelBn: '💳 প্যাকেজ ও পেমেন্ট',
      labelEn: '💳 Recharge & Credits',
      msgBn: 'আসসালামু আলাইকুম, ক্রেডিট প্যাকেজ ও বিকাশ/নগদ পেমেন্ট বিষয়ে জানতে চাই।',
      msgEn: 'Assalamu Alaikum, I have an inquiry regarding credit recharge and packages.',
    },
  ];

  return (
    <div
      ref={popoverRef}
      className="fixed bottom-4 right-3.5 sm:bottom-6 sm:right-6 z-50 print:hidden font-sans"
    >
      {/* Floating Chat Popover Modal */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-90 bg-card rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-line overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header styled like WhatsApp */}
          <div className="bg-[#128C7E] dark:bg-[#075E54] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <WhatsAppEmblem className="w-10 h-10 ring-2 ring-white/30" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#128C7E] ring-1 ring-white" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm tracking-tight truncate">
                  {isBengali ? 'মধুবন্ধন হোয়াটসঅ্যাপ সাপোর্ট' : 'MadhuBondhon WhatsApp'}
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                  <span>{isBengali ? 'অনলাইন | সরাসরি সহায়তা' : 'Online | Live Assistance'}</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
              aria-label={isBengali ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3.5 bg-elev">
            {/* WhatsApp message bubble */}
            <div className="relative bg-card p-3.5 rounded-2xl rounded-tl-sm border border-line shadow-2xs space-y-1 text-xs text-ink-2">
              <div className="flex items-center gap-1.5 text-[#25D366] font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isBengali ? 'টাঙ্গাইল কাস্টমার কেয়ার টিম' : 'Tangail Matrimony Helpline'}</span>
              </div>
              <p className="leading-relaxed">
                {isBengali
                  ? 'আসসালামু আলাইকুম! বায়োডাটা তৈরি, অভিভাবক সম্মতি বা যে কোনো সমস্যায় আমাদের প্রতিনিধি সরাসরি হোয়াটসঅ্যাপে আপনাকে সহায়তা করবে।'
                  : 'Assalamu Alaikum! Our support team is ready to assist you directly on WhatsApp with registration, verification, or queries.'}
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-ink-3 block">
                {isBengali ? 'দ্রুত প্রশ্ন নির্বাচন করুন:' : 'Quick Topic Options:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickTopics.map((topic) => {
                  const label = isBengali ? topic.labelBn : topic.labelEn;
                  const topicMsg = isBengali ? topic.msgBn : topic.msgEn;
                  const isSelected = message === topicMsg;

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => setMessage(topicMsg)}
                      className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#25D366]/15 border-[#25D366] text-emerald-800 dark:text-emerald-300 font-bold'
                          : 'bg-card border-line text-ink-2 hover:border-[#25D366]/50 hover:bg-[#25D366]/5'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Editable Message Box */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-2 block">
                {isBengali ? 'আপনার বার্তা:' : 'Your Message:'}
              </label>
              <textarea
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isBengali
                    ? 'আপনার বার্তা এখানে লিখুন...'
                    : 'Type your message here...'
                }
                className="mb-input w-full !text-xs p-2.5 rounded-xl resize-none"
              />
            </div>

            {/* Primary Action: Launch WhatsApp */}
            <button
              type="button"
              onClick={() => handleLaunchWhatsApp()}
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <WhatsAppIcon className="w-4 h-4 text-white" />
              <span>{isBengali ? 'হোয়াটসঅ্যাপে চ্যাট শুরু করুন' : 'Start WhatsApp Chat'}</span>
            </button>

            {/* Secondary Direct Call Action */}
            <div className="flex items-center justify-between pt-1 border-t border-line text-[11px] text-ink-3">
              <span>{isBengali ? 'জরুরি কল করতে পারেন:' : 'Need urgent voice call:'}</span>
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Phone className="w-3 h-3" />
                <span>{displayPhone}</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button with official WhatsApp icon & styling */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white p-2.5 sm:py-3 sm:px-4.5 rounded-full shadow-lg shadow-emerald-700/35 hover:shadow-xl hover:shadow-emerald-700/45 transition-all cursor-pointer border border-emerald-300/40"
        title={
          isBengali
            ? 'হোয়াটসঅ্যাপে সরাসরি কথা বলুন'
            : 'Chat directly on WhatsApp'
        }
        aria-label={isBengali ? 'হোয়াটসঅ্যাপ সাপোর্ট' : 'WhatsApp Support'}
      >
        <div className="relative flex items-center justify-center">
          <WhatsAppIcon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white transition-transform group-hover:scale-110" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-300 rounded-full border-2 border-[#25D366] animate-pulse" />
        </div>
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          {isBengali ? 'হোয়াটসঅ্যাপ সাপোর্ট' : 'WhatsApp Support'}
        </span>
      </button>
    </div>
  );
};

export default WhatsAppSupportWidget;
