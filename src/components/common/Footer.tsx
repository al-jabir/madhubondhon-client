import './Footer.css';
import React from 'react';
import { Link } from 'react-router';
import { Heart, ShieldCheck, MapPin, PhoneCall } from 'lucide-react';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES } from '../../constants/locations';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer pt-14 pb-8 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-linear-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <span className="font-extrabold text-2xl footer-heading tracking-tight">মধুবন্ধন</span>
            </div>
            <p className="text-sm footer-muted leading-relaxed">
              টাঙ্গাইল জেলা ও প্রবাসে বসবাসরত টাঙ্গাইলবাসীর জন্য একটি বিশ্বস্ত, নিরাপদ ও দ্বীনি পারিবারিক
              ম্যাট্রিমনি প্ল্যাটফর্ম। ১৮+ প্রাপ্তবয়স্কদের জন্য অনুমোদিত।
            </p>
            <div className="flex items-center gap-2 text-xs footer-accent font-medium">
              <ShieldCheck className="w-4 h-4 footer-check" />
              <span>১০০% ভেরিফাইড ও গোপনীয়তা সুরক্ষাপ্রাপ্ত</span>
            </div>
          </div>

          {/* Tangail Upazilas */}
          <div>
            <h4 className="footer-heading font-semibold text-base mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 footer-accent" />
              টাঙ্গাইলের ১২টি উপজেলা
            </h4>
            <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs footer-muted">
              {TANGAIL_UPAZILAS.map((upazila) => (
                <Link
                  key={upazila}
                  to={`/search?upazila=${upazila}`}
                  className="footer-link transition-colors"
                >
                  • {UPAZILA_DISPLAY_NAMES[upazila]}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="footer-heading font-semibold text-base mb-3">গুরুত্বপূর্ণ লিঙ্ক</h4>
            <ul className="space-y-2 text-sm footer-muted">
              <li>
                <Link to="/search" className="footer-link transition-colors">
                  বায়োডাটা অনুসন্ধান
                </Link>
              </li>
              <li>
                <Link to="/register" className="footer-link transition-colors">
                  বিনামূল্যে বায়োডাটা তৈরি করুন
                </Link>
              </li>
              <li>
                <Link to="/login" className="footer-link transition-colors">
                  একাউন্টে লগইন
                </Link>
              </li>
              <li>
                <Link to="/search?gender=female" className="footer-link transition-colors">
                  পাত্রীর বায়োডাটা
                </Link>
              </li>
              <li>
                <Link to="/search?gender=male" className="footer-link transition-colors">
                  পাত্রের বায়োডাটা
                </Link>
              </li>
              <li>
                <Link to="/faq" className="footer-link transition-colors">
                  সাধারণ জিজ্ঞাসা (FAQ)
                </Link>
              </li>
              <li>
                <Link to="/packages" className="footer-link transition-colors">
                  ক্রেডিট প্যাকেজ ও মূল্য
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Guidelines */}
          <div>
            <h4 className="footer-heading font-semibold text-base mb-3 flex items-center gap-1.5">
              <PhoneCall className="w-4 h-4 footer-accent" />
              সহায়তা ও সতকর্তা
            </h4>
            <p className="text-xs footer-muted leading-relaxed mb-3">
              যে কোনো আর্থিক লেনদেন থেকে বিরত থাকুন। পাত্র/পাত্রীর পারিবারিক তথ্য অভিভাবক মারফত সরাসরি যাচাই
              করুন।
            </p>
            <div className="footer-contact p-3 rounded-lg border text-xs footer-copy">
              <p className="font-semibold footer-heading">জরুরি যোগাযোগ ও সাপোর্ট:</p>
              <p className="footer-accent font-mono mt-0.5">support@madhubondhon.com</p>
              <p className="footer-muted mt-1">টাঙ্গাইল সদর, টাঙ্গাইল, বাংলাদেশ</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t footer-divider text-center text-xs footer-muted flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} মধুবন্ধন — Tangail Matrimony. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1 footer-muted">
            টাঙ্গাইলের মানুষের জন্য ভালোবাসার সাথে নির্মিত ❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
