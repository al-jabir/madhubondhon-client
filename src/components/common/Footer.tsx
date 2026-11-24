import React from 'react';
import { Link } from 'react-router';
import { HeartHandshake, ShieldCheck, MapPin, PhoneCall, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { TANGAIL_UPAZILAS, getUpazilaDisplayName } from '../../constants/locations';
import { useLanguage } from '../../i18n/LanguageContext';
import { adminApi } from '../../api/admin.api';

export const Footer: React.FC = () => {
  const { t, isBengali, formatNumber } = useLanguage();

  const { data: settingsData } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => adminApi.getPublicSettings(),
    staleTime: 60000,
  });
  const settings = settingsData?.data?.settings;

  return (
    <footer className="bg-[#0b111a] text-slate-300 pt-10 sm:pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand to-emerald-700 flex items-center justify-center text-white shadow-md shadow-brand/25">
                <HeartHandshake className="w-4.5 h-4.5 text-emerald-100" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-2xl text-white tracking-tight">
                  {isBengali ? 'মধুবন্ধন' : 'MadhuBondhon'}
                </span>
                <span className="text-[9px] text-emerald-400/80 font-semibold mt-1 tracking-[0.18em] uppercase">
                  Tangail Matrimony
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {isBengali
                ? 'টাঙ্গাইল জেলা ও প্রবাসে বসবাসরত টাঙ্গাইলবাসীর জন্য একটি বিশ্বস্ত, নিরাপদ ও দ্বীনি পারিবারিক ম্যাট্রিমনি প্ল্যাটফর্ম। ১৮+ প্রাপ্তবয়স্কদের জন্য অনুমোদিত।'
                : 'A trusted, safe, and family-oriented matrimonial platform for the residents of Tangail district and expatriates worldwide. 18+ only.'}
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-300 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/25">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{isBengali ? 'যোগাযোগে পারস্পরিক অনুমতি ও গোপনীয়তা' : 'Mutual permission & contact privacy'}</span>
            </div>
          </div>

          {/* Upazilas */}
          <div>
            <h4 className="font-semibold text-base mb-3 flex items-center gap-1.5 text-white">
              <MapPin className="w-4 h-4 text-emerald-400" />
              {isBengali ? 'টাঙ্গাইলের ১২টি উপজেলা' : '12 Upazilas of Tangail'}
            </h4>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-400">
              {TANGAIL_UPAZILAS.map((upazila, i) => (
                <Link
                  key={upazila}
                  to={`/search?upazila=${upazila}`}
                  className="group flex items-center gap-1.5 hover:text-white transition-colors w-fit"
                >
                  <span className="text-emerald-500/70 group-hover:text-emerald-400 font-semibold">
                    {formatNumber((i + 1).toString().padStart(2, '0'))}
                  </span>
                  {getUpazilaDisplayName(upazila, isBengali)}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-base mb-3 text-white">
              {isBengali ? 'গুরুত্বপূর্ণ লিঙ্ক' : 'Quick Links'}
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              {[
                { to: '/search', label: isBengali ? 'বায়োডাটা অনুসন্ধান' : 'Find Biodata' },
                { to: '/register', label: isBengali ? 'বিনামূল্যে বায়োডাটা তৈরি করুন' : 'Create Free Biodata' },
                { to: '/login', label: isBengali ? 'একাউন্টে লগইন' : 'Member Sign In' },
                { to: '/search?gender=female', label: isBengali ? 'পাত্রীর বায়োডাটা' : "Bride's Biodata" },
                { to: '/search?gender=male', label: isBengali ? 'পাত্রের বায়োডাটা' : "Groom's Biodata" },
                { to: '/faq', label: isBengali ? 'সাধারণ জিজ্ঞাসা (FAQ)' : 'Frequently Asked (FAQ)' },
                { to: '/packages', label: isBengali ? 'ক্রেডিট প্যাকেজ ও মূল্য' : 'Credits & Packages' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="group inline-flex items-center gap-1 hover:text-white transition-colors">
                    <ArrowRight className="w-3 h-3 text-emerald-400 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-base mb-3 flex items-center gap-1.5 text-white">
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              {isBengali ? 'সহায়তা ও সতকর্তা' : 'Support & Safety'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {isBengali
                ? 'যে কোনো অননুমোদিত আর্থিক লেনদেন থেকে বিরত থাকুন। পাত্র/পাত্রীর পারিবারিক তথ্য অভিভাবক মারফত সরাসরি যাচাই করুন।'
                : 'Avoid any unofficial transactions. Always verify matrimonial family details directly via lawful guardians.'}
            </p>
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
              <p className="font-semibold text-white">
                {isBengali ? 'জরুরি যোগাযোগ ও সাপোর্ট:' : 'Emergency Contact & Support:'}
              </p>
              <p className="text-emerald-400 font-mono">
                {settings?.contactEmail || 'support@madhubondhon.com'}
              </p>
              {settings?.contactPhone && (
                <p className="text-slate-300 font-mono text-[11px]">
                  {settings.contactPhone}
                </p>
              )}
              <p className="text-slate-400">
                {settings?.officeAddress || (isBengali ? 'টাঙ্গাইল সদর, টাঙ্গাইল, বাংলাদেশ' : 'Tangail Sadar, Tangail, Bangladesh')}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center flex-wrap gap-x-2">
            <span>© {new Date().getFullYear()} {t('footer.copyright')}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <span>{isBengali ? 'পবিত্র সম্পর্কের বিশ্বস্ত মাধ্যম' : 'A trusted bond of faith'}</span>
            <span className="text-emerald-400">✦</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
