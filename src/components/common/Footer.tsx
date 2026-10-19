import React from 'react';
import { Link } from 'react-router';
import { Heart, ShieldCheck, MapPin, PhoneCall, ArrowRight } from 'lucide-react';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES } from '../../constants/locations';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2b161f] text-[#e9d3db] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-rose-500 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Heart className="w-4.5 h-4.5 fill-current" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-bold text-2xl text-white tracking-tight">মধুবন্ধন</span>
                <span className="text-[9px] text-[#b98fa0] font-semibold mt-1 tracking-[0.18em] uppercase">
                  Tangail Matrimony
                </span>
              </div>
            </div>
            <p className="text-sm text-[#c8a9b6] leading-relaxed">
              টাঙ্গাইল জেলা ও প্রবাসে বসবাসরত টাঙ্গাইলবাসীর জন্য একটি বিশ্বস্ত, নিরাপদ ও দ্বীনি পারিবারিক
              ম্যাট্রিমনি প্ল্যাটফর্ম। ১৮+ প্রাপ্তবয়স্কদের জন্য অনুমোদিত।
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-rose-300  px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>১০০% ভেরিফাইড ও গোপনীয়তা সুরক্ষাপ্রাপ্ত</span>
            </div>
          </div>

          {/* Upazilas */}
          <div>
            <h4 className="font-semibold text-base mb-3 flex items-center gap-1.5 text-white">
              <MapPin className="w-4 h-4 text-rose-400" />
              টাঙ্গাইলের ১২টি উপজেলা
            </h4>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-[#c8a9b6]">
              {TANGAIL_UPAZILAS.map((upazila, i) => (
                <Link
                  key={upazila}
                  to={`/search?upazila=${upazila}`}
                  className="group flex items-center gap-1.5 hover:text-white transition-colors w-fit"
                >
                  <span className="text-rose-500/70 group-hover:text-rose-400 font-semibold">{(i + 1).toLocaleString('bn-BD', { minimumIntegerDigits: 2 })}</span>
                  {UPAZILA_DISPLAY_NAMES[upazila]}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-semibold text-base mb-3 text-white">গুরুত্বপূর্ণ লিঙ্ক</h4>
            <ul className="space-y-2 text-sm text-[#c8a9b6]">
              {[
                { to: '/search', label: 'বায়োডাটা অনুসন্ধান' },
                { to: '/register', label: 'বিনামূল্যে বায়োডাটা তৈরি করুন' },
                { to: '/login', label: 'একাউন্টে লগইন' },
                { to: '/search?gender=female', label: 'পাত্রীর বায়োডাটা' },
                { to: '/search?gender=male', label: 'পাত্রের বায়োডাটা' },
                { to: '/faq', label: 'সাধারণ জিজ্ঞাসা (FAQ)' },
                { to: '/packages', label: 'ক্রেডিট প্যাকেজ ও মূল্য' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="group inline-flex items-center gap-1 hover:text-white transition-colors">
                    <ArrowRight className="w-3 h-3 text-rose-500/60 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-base mb-3 flex items-center gap-1.5 text-white">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              সহায়তা ও সতকর্তা
            </h4>
            <p className="text-xs text-[#c8a9b6] leading-relaxed mb-4">
              যে কোনো আর্থিক লেনদেন থেকে বিরত থাকুন। পাত্র/পাত্রীর পারিবারিক তথ্য অভিভাবক মারফত সরাসরি যাচাই
              করুন।
            </p>
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
              <p className="font-semibold text-white">জরুরি যোগাযোগ ও সাপোর্ট:</p>
              <p className="text-rose-300 font-mono">support@madhubondhon.com</p>
              <p className="text-[#c8a9b6]">টাঙ্গাইল সদর, টাঙ্গাইল, বাংলাদেশ</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-xs text-[#c8a9b6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} মধুবন্ধন — Tangail Matrimony. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1.5">
            টাঙ্গাইলের মানুষের জন্য ভালোবাসার সাথে নির্মিত
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-current" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
