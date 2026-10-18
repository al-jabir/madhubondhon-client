import React, { useState } from 'react';
import { MessageCircle, X, Send, PhoneCall } from 'lucide-react';

interface WhatsAppSupportWidgetProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppSupportWidget: React.FC<WhatsAppSupportWidgetProps> = ({
  phoneNumber = '8801700000000', // Tangail Helpline
  defaultMessage = 'আসসালামু আলাইকুম, মধুবন্ধন (Tangail Matrimony) সম্পর্কে আমার কিছু তথ্য জানার ছিল।',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState(defaultMessage);

  const handleOpenWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
      customMsg
    )}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 print:hidden font-sans">
      {/* Floating Chat Modal Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-88 bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-linear-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                <MessageCircle className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h4 className="font-bold text-sm">মধুবন্ধন টাঙ্গাইল হেল্পলাইন</h4>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                  সরাসরি সহায়তার জন্য অনলাইন
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleOpenWhatsApp} className="p-4 space-y-3 bg-slate-50">
            <div className="bg-white p-3 rounded-2xl border border-gray-200 text-xs text-gray-700 leading-relaxed shadow-2xs">
              <p className="font-semibold text-emerald-800">আসসালামু আলাইকুম!</p>
              <p className="mt-1 text-gray-600">
                বায়োডাটা তৈরি, অভিভাবক সম্মতি, বিকাশ/নগদে পেমেন্ট অথবা কোনো সমস্যায় আমাদের প্রতিনিধি আপনাকে
                সহায়তা করবে।
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-650 block">আপনার বার্তা:</label>
              <textarea
                rows={3}
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>হোয়াটসঅ্যাপে পাঠান</span>
            </button>
          </form>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white py-3 px-4 sm:px-5 rounded-full shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:scale-105 transition-all cursor-pointer border-2 border-white/40"
        title="টাঙ্গাইল হেল্পলাইনে সরাসরি কথা বলুন"
      >
        <div className="relative">
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-emerald-600" />
        </div>
        <span className="hidden sm:inline font-bold text-xs tracking-wide">
          হেল্পলাইন
        </span>
      </button>
    </div>
  );
};

export default WhatsAppSupportWidget;
