import React from 'react';
import { Link } from 'react-router';
import { Phone, MessageCircle, Clock, ShieldAlert, Mail, HelpCircle, MapPin } from 'lucide-react';

const HELPLINE_BN = '০১৭০০–০০০০০০';
const PHONE_LOCAL = '+8801700000000';
const WHATSAPP_TEXT = encodeURIComponent('আসসালামু আলাইকুম, মধুবন্ধন সাপোর্টে যোগাযোগ করতে চাই।');

export const ContactPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="mb-badge">যোগাযোগ</span>
        <h1 className="text-3xl sm:text-4xl font-black text-ink">আমাদের সাথে যোগাযোগ করুন</h1>
        <p className="text-sm sm:text-base text-ink-2 max-w-xl mx-auto leading-relaxed">
          যেকোনো প্রশ্ন, রিপোর্ট বা সহায়তার প্রয়োজনে হোয়াটসঅ্যাপ হেল্পলাইনে যোগাযোগ করুন — মডারেটর দ্বীনি উপায়ে দ্রুত সহায়তা করেন।
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* WhatsApp (primary) */}
        <div className="mb-card p-6 space-y-4 sm:row-span-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-ink">হোয়াটসঅ্যাপ হেল্পলাইন</h2>
            <p className="text-xs text-ink-2 leading-relaxed">
              সবচেয়ে দ্রুত যোগাযোগের মাধ্যম। বায়োডাটা রিপোর্ট, পেমেন্ট যাচাই ও যেকোনো বিষয়ে প্রয়োজনের পাশে আমরা সবসময় আছি।
            </p>
          </div>
          <div className="rounded-2xl bg-elev border border-line p-4 text-center space-y-1.5">
            <p className="text-ink-3 text-[11px] font-semibold">নম্বর</p>
            <p className="text-lg font-black text-ink tracking-wide" dir="ltr">{HELPLINE_BN}</p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={`https://api.whatsapp.com/send?phone=${PHONE_LOCAL.replace(/\D/g, '')}&text=${WHATSAPP_TEXT}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              <span>WhatsApp-এ কথা বলুন</span>
            </a>
            <a
              href={`tel:${PHONE_LOCAL}`}
              className="mb-btn-secondary w-full justify-center"
            >
              <Phone className="w-4 h-4" />
              <span>সরাসরি কল করুন</span>
            </a>
          </div>
        </div>

        {/* Hours */}
        <div className="mb-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-ink">সহায়তার সময়</h3>
          <ul className="text-xs text-ink-2 space-y-1.5 leading-relaxed">
            <li>শনি – বৃহস্পতি: সকাল ১০টা – রাত ১০টা</li>
            <li>শুক্রবার: বাদ জুমা, বিকেল ৩টা – রাত ১০টা</li>
            <li>রিপোর্ট সংক্রান্ত বিষয় ২৪ ঘণ্টার মধ্যে পর্যালোচিত হয়</li>
          </ul>
        </div>

        {/* Other channels */}
        <div className="mb-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gold-soft text-gold flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-ink">অন্যান্য চ্যানেল</h3>
          <ul className="text-xs text-ink-2 space-y-1.5 leading-relaxed">
            <li>টাঙ্গাইল শহরের অনুমোদিত স্থানীয় প্রতিনিধিদের সাথে সাক্ষাৎ করা যায়</li>
            <li>প্রশাসনিক জিজ্ঞাসা: <span className="font-mono text-ink" dir="ltr">staff@madhubondhon.com</span></li>
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-ink-3" />
              <span>টাঙ্গাইল সদর, টাঙ্গাইল ১৯০০</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Safety note */}
      <div className="rounded-2xl bg-gold-soft border border-gold/25 p-5 flex items-start gap-3 text-xs text-gold leading-relaxed">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          সতর্কতা: মডারেটর কখনো আপনাকে টাকা চাইবে না। নিশ্চিত না হয়ে কারো সাথে কোনো অর্থ লেনদেন করবেন না — প্রতারণা এড়াতে সবসময় সতর্ক থাকুন।
        </p>
      </div>

      {/* FAQ link */}
      <div className="text-center">
        <Link to="/faq" className="mb-btn-secondary text-xs inline-flex">
          <HelpCircle className="w-4 h-4" />
          <span>সচরাচর জিজ্ঞাসা দেখুন</span>
        </Link>
      </div>
    </div>
  );
};

export default ContactPage;
