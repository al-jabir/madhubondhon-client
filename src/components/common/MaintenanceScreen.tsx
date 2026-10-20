import React from 'react';
import { Link } from 'react-router';
import {
  Wrench,
  ShieldAlert,
  Clock,
  Mail,
  Lock,
  Heart,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { PlatformSettings } from '../../types';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';
import { WhatsAppIcon } from './WhatsAppSupportWidget';

interface MaintenanceScreenProps {
  settings?: PlatformSettings;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({ settings }) => {
  const { isBengali } = useLanguage();

  const siteName = settings?.siteName || 'MadhuBondhon';
  const siteTagline =
    settings?.siteTagline || (isBengali ? 'টাঙ্গাইল জেলার বিশ্বস্ত ইসলামিক ম্যাট্রিমনিয়াল প্ল্যাটফর্ম' : 'Tangail Islamic Matrimonial Platform');
  const supportPhone = settings?.supportWhatsApp || settings?.contactPhone || '01700000000';
  const contactEmail = settings?.contactEmail || 'support@madhubondhon.com';

  const cleanWhatsAppNumber = supportPhone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanWhatsAppNumber.startsWith('88') ? cleanWhatsAppNumber : '88' + cleanWhatsAppNumber}?text=${encodeURIComponent(
    isBengali
      ? 'আসসালামু আলাইকুম, মধুবন্ধন রক্ষণাবেক্ষণ চলাকালীন জরুরি প্রয়োজনে যোগাযোগ করছি।'
      : 'Hello MadhuBondhon Support, reaching out regarding maintenance mode.'
  )}`;

  return (
    <div className="min-h-screen bg-base text-ink flex flex-col justify-between selection:bg-brand selection:text-white relative overflow-hidden transition-colors">
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand/5 dark:bg-brand/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shadow-md shadow-brand/25">
            <Heart className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-black text-ink tracking-tight flex items-center gap-2">
              <span>{siteName}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-soft text-brand-ink uppercase tracking-wider">
                {isBengali ? 'টাঙ্গাইল' : 'Tangail'}
              </span>
            </h1>
            <p className="text-[11px] text-ink-3 hidden sm:block">{siteTagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Center Content */}
      <main className="max-w-2xl w-full mx-auto px-4 sm:px-6 py-12 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        <div className="space-y-6">
          {/* Animated maintenance emblem */}
          <div className="relative inline-flex items-center justify-center mx-auto">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-xl shadow-amber-500/10 relative">
              <Wrench className="w-12 h-12 sm:w-14 sm:h-14 animate-[spin_10s_linear_infinite]" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center shadow-md border-2 border-base">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>{isBengali ? 'রক্ষণাবেক্ষণ প্রক্রিয়াধীন' : 'Scheduled Maintenance in Progress'}</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-ink tracking-tight">
              {isBengali ? 'ওয়েবসাইট সাময়িক রক্ষণাবেক্ষণ চলছে' : 'System Under Scheduled Maintenance'}
            </h2>
            <p className="text-sm sm:text-base text-ink-2 leading-relaxed max-w-xl mx-auto">
              {isBengali
                ? 'আমাদের প্ল্যাটফর্মের পারফরম্যান্স, নিরাপত্তা ও নতুন ফিচার আপগ্রেডের কাজ চলছে। খুব দ্রুতই ওয়েবসাইটটি সবার জন্য পুনরায় উন্মুক্ত করা হবে। সাময়িক অসুবিধার জন্য আমরা আন্তরিকভাবে দুঃখিত।'
                : 'We are currently performing scheduled maintenance and performance upgrades. The platform will be back online shortly. Thank you for your patience and understanding.'}
            </p>
          </div>

          {/* Refresh hint */}
          <div className="pt-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-elev border border-line text-ink-2 hover:text-brand hover:border-brand/40 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isBengali ? 'পেজ রিফ্রেশ করে দেখুন' : 'Refresh Page'}</span>
            </button>
          </div>

          {/* Quick Help Contacts Box */}
          <div className="bg-card/80 backdrop-blur-sm border border-line rounded-2xl p-5 sm:p-6 text-left space-y-3 mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-3">
              {isBengali ? 'জরুরি প্রয়োজনে যোগাযোগ' : 'Need Urgent Assistance?'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <WhatsAppIcon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>WhatsApp Support</span>
                    <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-ink-3 truncate">{supportPhone}</div>
                </div>
              </a>

              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-brand-soft hover:bg-brand-soft/80 border border-brand/20 text-brand-ink transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold flex items-center gap-1">
                    <span>{isBengali ? 'ইমেইল সহায়তা' : 'Email Support'}</span>
                    <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-[11px] text-ink-3 truncate">{contactEmail}</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer & Admin Gateway Link */}
      <footer className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 border-t border-line/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-3 relative z-10">
        <div>
          © {new Date().getFullYear()} {siteName}. {isBengali ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'}
        </div>
        <div className="flex items-center gap-1">
          <Lock className="w-3 h-3" />
          <span>{isBengali ? 'আপনি কি প্ল্যাটফর্ম প্রশাসক?' : 'Platform Administrator?'}</span>
          <Link
            to="/admin/login"
            className="text-brand font-bold hover:underline ml-1"
          >
            {isBengali ? 'অ্যাডমিন লগইন' : 'Admin Login'}
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default MaintenanceScreen;
