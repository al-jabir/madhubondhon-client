import React from 'react';
import { Link } from 'react-router';
import { HeartHandshake, ShieldCheck, Lock, Users, EyeOff, MessageCircleHeart, ScrollText, ArrowRight } from 'lucide-react';
import PublicStatistics from '../components/profile/PublicStatistics';
import { useLanguage } from '../i18n/LanguageContext';

export const AboutPage: React.FC = () => {
  const { isBengali } = useLanguage();

  const values = [
    {
      icon: ShieldCheck,
      title: isBengali ? 'মডারেটর যাচাই' : 'Moderator Verification',
      body: isBengali
        ? 'সম্পূর্ণ বায়োডাটা মডারেটরের নজরে থাকে; অসম্পূর্ণ বা সন্দেহজনক তথ্য প্রকাশ পায় না।'
        : 'Every profile is reviewed by human moderators; incomplete or suspicious profiles are never published.',
    },
    {
      icon: Lock,
      title: isBengali ? 'গোপনীয়তা' : 'Strict Privacy',
      body: isBengali
        ? 'অনুমতি ছাড়া কোনো ফোন নম্বর শেয়ার হয় না। যোগাযোগ শুরু হয় অভিভাবকের সম্মতির পর।'
        : 'Direct contact info is never shared without permission. Contact initiates only upon mutual guardian consent.',
    },
    {
      icon: Users,
      title: isBengali ? 'অভিভাবকের অংশগ্রহণ' : 'Guardian Involvement',
      body: isBengali
        ? 'ওটিপি দিয়ে অভিভাবকের অনুমোদন নেওয়া হয়; পরিবারই চূড়ান্ত সিদ্ধান্তের অংশীদার।'
        : 'Guardian consent is verified via OTP; family is at the heart of every marital milestone.',
    },
    {
      icon: EyeOff,
      title: isBengali ? 'শালীনতা' : 'Modesty & Purdah',
      body: isBengali
        ? 'মা-বোনদের ছবি সদস্যের পছন্দে পর্দাশীলভাবে ব্লার থাকে; ব্যবহারবিধি মানা জরুরি।'
        : 'Sisters’ photos remain respectfully blurred based on member preference and strict modest guidelines.',
    },
    {
      icon: HeartHandshake,
      title: isBengali ? 'দ্বীনি দৃষ্টিভঙ্গি' : 'Islamic Values',
      body: isBengali
        ? 'শরিয়াহ-সম্মত নিয়মনীতি ও পবিত্র উদ্দেশ্য — শুধু বিবাহের সেরা নিয়তে এ প্ল্যাটফর্ম।'
        : 'Shariah-compliant guidelines and sincere intentions — built exclusively for sacred matrimony.',
    },
    {
      icon: MessageCircleHeart,
      title: isBengali ? 'দ্রুত সহায়তা' : 'Prompt Support',
      body: isBengali
        ? 'যেকোনো সন্দেহ, রিপোর্ট ও রিভিউ মডারেটর কর্তৃক দ্রুত পর্যালোচনা করা হয়।'
        : 'Any concern, report, or verification request is promptly reviewed by our local moderation team.',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-brand/10 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 text-center space-y-4">
          <span className="mb-badge">{isBengali ? 'আমাদের সম্পর্কে' : 'About Us'}</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink leading-tight">
            {isBengali ? 'একই শিকড়ের টানে, মধুবন্ধনের মিশন' : 'Rooted in Tangail, Built for Blessed Unions'}
          </h1>
          <p className="text-sm sm:text-base text-ink-2 leading-relaxed max-w-2xl mx-auto">
            {isBengali
              ? 'মধুবন্ধন টাঙ্গাইল জেলা ও প্রবাসে বসবাসরত টাঙ্গাইলবাসীর জন্য একটি বিশ্বস্ত, নিরাপদ ও দ্বীনি পারিবারিক ম্যাট্রিমনি প্ল্যাটফর্ম — যেখানে অভিভাবকের সম্মতি, গোপনীয়তা ও শালীনতা সবসময় প্রাধান্য পায়।'
              : 'MadhuBondhon is a trusted, secure, and faith-centered matrimonial platform for families of Tangail and Tangail diaspora worldwide — where guardian consent, privacy, and modesty always come first.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/search" className="mb-btn-primary px-6 py-3 text-xs">
              {isBengali ? 'বায়োডাটা অনুসন্ধান' : 'Search Profiles'}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="mb-btn-secondary text-xs">
              {isBengali ? 'বিনামূল্যে নিবন্ধন' : 'Free Registration'}
            </Link>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-card p-6 sm:p-8 space-y-4 text-sm sm:text-base text-ink-2 leading-relaxed">
          <h2 className="mb-section-title text-lg sm:text-xl">
            <ScrollText className="w-5 h-5 text-brand" />
            <span>{isBengali ? 'আমাদের শুরুর গল্প' : 'Our Story'}</span>
          </h2>
          <p>
            {isBengali
              ? 'টাঙ্গাইলবাসী হিসেবে আমরা দেখেছি — পাত্র-পাত্রী খোঁজার বিশ্বস্ত জায়গার অভাব। অনেকে ভরসা করেন সামাজিক যোগাযোগমাধ্যমে, যেখানে যাচাই নেই, গোপনীয়তা নেই, আর ভুল তথ্যের ঝুঁকিও বেশি। মধুবন্ধন সেই শূন্যতা পূরণের জন্য কাজ করে।'
              : 'As natives of Tangail, we recognized the scarcity of trustworthy matrimonial platforms. Many families relied on social media, where there is little verification, no privacy safeguards, and a high risk of misinformation. MadhuBondhon was founded to bridge this crucial gap.'}
          </p>
          <p>
            {isBengali
              ? 'এখানে মডারেটর দ্বারা যাচাই হওয়া ছাড়া কোনো বায়োডাটা প্রকাশ হয় না। অভিভাবকের মোবাইল নম্বরে ওটিপি পাঠিয়ে সম্মতি নিশ্চিত করা হয়, আর দুই পক্ষের অভিভাবক সম্মত হলেই কেবল যোগাযোগের অনুমতি তৈরি হয়। মা-বোনদের ছবির জন্য পর্দাশীল ব্লার সুবিধা রাখা হয়েছে।'
              : 'No profile is published here without moderator verification. Guardian consent is validated through mobile OTP, and direct communication is permitted only after mutual guardian agreement. Respectful modesty blurring is provided for photos.'}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="text-center space-y-2">
          <span className="mb-badge">{isBengali ? 'আমাদের মূল্যবোধ' : 'Core Values'}</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            {isBengali ? 'যে নীতিতে মধুবন্ধন পরিচালিত' : 'The Principles That Guide MadhuBondhon'}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {values.map(({ icon: Icon, title, body }) => (
            <div key={title} className="mb-card mb-card-hover p-5 space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-ink text-sm">{title}</h3>
              <p className="text-xs text-ink-2 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Live statistics */}
      <div>
        <PublicStatistics />
      </div>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="rounded-3xl bg-linear-to-r from-brand to-pink-500 text-white p-8 sm:p-10 text-center space-y-4 shadow-lg shadow-brand/20">
          <h3 className="text-xl sm:text-2xl font-black">
            {isBengali ? 'আপনার জীবনসঙ্গীর খোঁজ শুরু হোক মধুবন্ধনে' : 'Find Your Soulmate on MadhuBondhon'}
          </h3>
          <p className="text-sm text-white/90 max-w-xl mx-auto">
            {isBengali
              ? 'বিনামূল্যে নিবন্ধন করুন, যাচাইকৃত পাত্র-পাত্রীর সন্ধানে দ্বীনি পরিবেশে যুক্ত হোন।'
              : 'Register for free and connect with verified brides and grooms in a halal, family-friendly environment.'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link to="/register" className="bg-white text-brand font-bold text-xs px-6 py-3 rounded-full hover:bg-brand-soft transition-colors">
              {isBengali ? 'বিনামূল্যে নিবন্ধন করুন' : 'Register for Free'}
            </Link>
            <Link to="/guide" className="border border-white/40 text-white font-semibold text-xs px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
              {isBengali ? 'ব্যবহার নির্দেশনা দেখুন' : 'View User Guide'}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
