import React from 'react';
import { Link } from 'react-router';
import { Heart, ShieldCheck, MapPin, PhoneCall } from 'lucide-react';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES } from '../../constants/locations';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold text-2xl text-white tracking-tight">মধুবন্ধন</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              টাঙ্গাইল জেলা ও প্রবাসে বসবাসরত টাঙ্গাইলবাসীর জন্য একটি বিশ্বস্ত, নিরাপদ ও দ্বীনি পারিবারিক
              ম্যাট্রিমনি প্ল্যাটফর্ম। ১৮+ প্রাপ্তবয়স্কদের জন্য অনুমোদিত।
            </p>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>১০০% ভেরিফাইড ও গোপনীয়তা সুরক্ষাপ্রাপ্ত</span>
            </div>
          </div>

          {/* Tangail Upazilas */}
          <div>
            <h4 className="text-white font-semibold text-base mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              টাঙ্গাইলের ১২টি উপজেলা
            </h4>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-slate-400">
              {TANGAIL_UPAZILAS.map((upazila) => (
                <Link
                  key={upazila}
                  to={`/search?upazila=${upazila}`}
                  className="hover:text-rose-400 transition-colors"
                >
                  • {UPAZILA_DISPLAY_NAMES[upazila]}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-base mb-3">গুরুত্বপূর্ণ লিঙ্ক</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/search" className="hover:text-rose-400 transition-colors">
                  বায়োডাটা অনুসন্ধান
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-rose-400 transition-colors">
                  বিনামূল্যে বায়োডাটা তৈরি করুন
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-rose-400 transition-colors">
                  একাউন্টে লগইন
                </Link>
              </li>
              <li>
                <Link to="/search?gender=female" className="hover:text-rose-400 transition-colors">
                  পাত্রীর বায়োডাটা
                </Link>
              </li>
              <li>
                <Link to="/search?gender=male" className="hover:text-rose-400 transition-colors">
                  পাত্রের বায়োডাটা
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Guidelines */}
          <div>
            <h4 className="text-white font-semibold text-base mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 text-rose-400" />
              সহায়তা ও সতকর্তা
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              যে কোনো আর্থিক লেনদেন থেকে বিরত থাকুন। পাত্র/পাত্রীর পারিবারিক তথ্য অভিভাবক মারফত সরাসরি যাচাই
              করুন।
            </p>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs text-slate-300">
              <p className="font-semibold text-white">জরুরি যোগাযোগ ও সাপোর্ট:</p>
              <p className="text-rose-400 font-mono mt-0.5">support@madhubondhon.com</p>
              <p className="text-slate-400 mt-1">টাঙ্গাইল সদর, টাঙ্গাইল, বাংলাদেশ</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} মধুবন্ধন — Tangail Matrimony. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 text-slate-400">
            টাঙ্গাইলের মানুষের জন্য ভালোবাসার সাথে নির্মিত ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
