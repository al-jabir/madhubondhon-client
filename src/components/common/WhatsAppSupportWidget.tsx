import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface WhatsAppSupportWidgetProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppSupportWidget: React.FC<WhatsAppSupportWidgetProps> = ({
  phoneNumber = '8801700000000', // Tangail Helpline
  defaultMessage,
}) => {
  const { isBengali } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const fallbackMessage = isBengali
    ? 'আসসালামু আলাইকুম, মধুবন্ধন (Tangail Matrimony) সম্পর্কে আমার কিছু তথ্য জানার ছিল।'
    : 'Assalamu Alaikum, I would like to inquire about MadhuBondhon (Tangail Matrimony).';
  const [customMsg, setCustomMsg] = useState(defaultMessage || fallbackMessage);

  const handleOpenWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
      customMsg || fallbackMessage
    )}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-3.5 sm:bottom-6 sm:right-6 z-50 print:hidden font-sans">
      {/* Floating Chat Modal Popover */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm sm:w-88 bg-card rounded-3xl shadow-[var(--mb-shadow-pop)] border border-line overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-600 dark:from-emerald-700 dark:to-teal-700 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-sm">
                  {isBengali ? 'মধুবন্ধন টাঙ্গাইল হেল্পলাইন' : 'Tangail Matrimony Helpline'}
                </h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  {isBengali ? 'সরাসরি সহায়তার জন্য অনলাইন' : 'Online for live assistance'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
              aria-label={isBengali ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleOpenWhatsApp} className="p-4 space-y-3 bg-elev">
            <div className="bg-card p-3 rounded-2xl border border-line text-xs text-ink-2 leading-relaxed shadow-2xs">
              <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                {isBengali ? 'আসসালামু আলাইকুম!' : 'Assalamu Alaikum!'}
              </p>
              <p className="mt-1 text-ink-3">
                {isBengali
                  ? 'বায়োডাটা তৈরি, অভিভাবক সম্মতি, বিকাশ/নগদে পেমেন্ট অথবা কোনো সমস্যায় আমাদের প্রতিনিধি আপনাকে সহায়তা করবে।'
                  : 'Our dedicated representatives are here to assist you with registration, guardian verification, packages, or any inquiries.'}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-ink-2 block">
                {isBengali ? 'আপনার বার্তা:' : 'Your message:'}
              </label>
              <textarea
                rows={3}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="mb-input w-full text-xs p-3 rounded-xl resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isBengali ? 'হোয়াটসঅ্যাপে পাঠান' : 'Open WhatsApp'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center justify-center gap-2 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 dark:from-emerald-700 dark:to-teal-700 dark:hover:from-emerald-600 dark:hover:to-teal-600 text-white p-2.5 sm:py-3 sm:px-5 rounded-full shadow-lg shadow-emerald-700/30 hover:shadow-xl hover:scale-105 transition-all cursor-pointer border border-emerald-300/40"
        title={isBengali ? 'টাঙ্গাইল হেল্পলাইনে সরাসরি কথা বলুন' : 'Talk with Tangail Helpline'}
        aria-label={isBengali ? 'হোয়াটসঅ্যাপ হেল্পলাইন' : 'WhatsApp Helpline'}
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-gold rounded-full border-2 border-emerald-600" />
        </div>
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          {isBengali ? 'হেল্পলাইন' : 'Helpline'}
        </span>
      </button>
    </div>
  );
};

export default WhatsAppSupportWidget;
