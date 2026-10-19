import React from 'react';
import { Link } from 'react-router';
import { HeartHandshake, ShieldCheck, Lock, Users, EyeOff, MessageCircleHeart, ScrollText, ArrowRight } from 'lucide-react';
import PublicStatistics from '../components/profile/PublicStatistics';

export const AboutPage: React.FC = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-brand/10 blur-3xl" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 text-center space-y-4">
          <span className="mb-badge">আমাদের সম্পর্কে</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink leading-tight">
            একই শিকড়ের টানে, মধুবন্ধনের মিশন
          </h1>
          <p className="text-sm sm:text-base text-ink-2 leading-relaxed max-w-2xl mx-auto">
            মধুবন্ধন টাঙ্গাইল জেলা ও প্রবাসে বসবাসরত টাঙ্গাইলবাসীর জন্য একটি বিশ্বস্ত, নিরাপদ ও দ্বীনি পারিবারিক ম্যাট্রিমনি প্ল্যাটফর্ম — যেখানে অভিভাবকের সম্মতি, গোপনীয়তা ও শালীনতা সবসময় প্রাধান্য পায়।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link to="/search" className="mb-btn-primary px-6 py-3 text-xs">
              বায়োডাটা অনুসন্ধান
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="mb-btn-secondary text-xs">
              বিনামূল্যে নিবন্ধন
            </Link>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-card p-6 sm:p-8 space-y-4 text-sm sm:text-base text-ink-2 leading-relaxed">
          <h2 className="mb-section-title text-lg sm:text-xl">
            <ScrollText className="w-5 h-5 text-brand" />
            <span>আমাদের শুরুর গল্প</span>
          </h2>
          <p>
            টাঙ্গাইলবাসী হিসেবে আমরা দেখেছি — পাত্র-পাত্রী খোঁজার বিশ্বস্ত জায়গার অভাব। অনেকে ভরসা করেন সামাজিক যোগাযোগমাধ্যমে, যেখানে যাচাই নেই, গোপনীয়তা নেই, আর ভুল তথ্যের ঝুঁকিও বেশি। মধুবন্ধন সেই শূন্যতা পূরণের জন্য কাজ করে।
          </p>
          <p>
            এখানে মডারেটর দ্বারা যাচাই হওয়া ছাড়া কোনো বায়োডাটা প্রকাশ হয় না। অভিভাবকের মোবাইল নম্বরে ওটিপি পাঠিয়ে সম্মতি নিশ্চিত করা হয়, আর দুই পক্ষের অভিভাবক সম্মত হলেই কেবল যোগাযোগের অনুমতি তৈরি হয়। মা-বোনদের ছবির জন্য পর্দাশীল ব্লার সুবিধা রাখা হয়েছে।
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="text-center space-y-2">
          <span className="mb-badge">আমাদের মূল্যবোধ</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            যে নীতিতে মধুবন্ধন পরিচালিত
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: ShieldCheck,
              title: 'মডারেটর যাচাই',
              body: 'সম্পূর্ণ বায়োডাটা মডারেটরের নজরে থাকে; অসম্পূর্ণ বা সন্দেহজনক তথ্য প্রকাশ পায় না।',            },
            {
              icon: Lock,
              title: 'গোপনীয়তা',
              body: 'অনুমতি ছাড়া কোনো ফোন নম্বর শেয়ার হয় না। যোগাযোগ শুরু হয় অভিভাবকের সম্মতির পর।',
            },
            {
              icon: Users,
              title: 'অভিভাবকের অংশগ্রহণ',
              body: 'ওটিপি দিয়ে অভিভাবকের অনুমোদন নেওয়া হয়; পরিবারই চূড়ান্ত সিদ্ধান্তের অংশীদার।',
            },
            {
              icon: EyeOff,
              title: 'শালীনতা',
              body: 'মা-বোনদের ছবি সদস্যের পছন্দে পর্দাশীলভাবে ব্লার থাকে; ব্যবহারবিধি মানা জরুরি।',
            },
            {
              icon: HeartHandshake,
              title: 'দ্বীনি দৃষ্টিভঙ্গি',
              body: 'শরিয়াহ-সম্মত নিয়মনীতি ও পবিত্র উদ্দেশ্য — শুধু বিবাহের সেরা নিয়তে এ প্ল্যাটফর্ম।',
            },
            {
              icon: MessageCircleHeart,
              title: 'দ্রুত সহায়তা',
              body: 'যেকোনো সন্দেহ, রিপোর্ট ও রিভিউ মডারেটর কর্তৃক দ্রুত পর্যালোচনা করা হয়।',
            },
          ].map(({ icon: Icon, title, body }) => (
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
          <h3 className="text-xl sm:text-2xl font-black">আপনার জীবনসঙ্গীর খোঁজ শুরু হোক মধুবন্ধনে</h3>
          <p className="text-sm text-white/90 max-w-xl mx-auto">
            বিনামূল্যে নিবন্ধন করুন, যাচাইকৃত পাত্র-পাত্রীর সন্ধানে দ্বীনি পরিবেশে যুক্ত হোন।
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-1">
            <Link to="/register" className="bg-white text-brand font-bold text-xs px-6 py-3 rounded-full hover:bg-brand-soft transition-colors">
              বিনামূল্যে নিবন্ধন করুন
            </Link>
            <Link to="/guide" className="border border-white/40 text-white font-semibold text-xs px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
              ব্যবহার নির্দেশনা দেখুন
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
