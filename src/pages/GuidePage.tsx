import React from 'react';
import { Link } from 'react-router';
import { UserPlus, FileEdit, ShieldCheck, HeartHandshake, CircleCheck, CircleX, ArrowRight, Info } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '০১',
    title: 'বিনামূল্যে নিবন্ধন',
    body: 'ইমেইল ও মোবাইল যাচাই করে অ্যাকাউন্ট তৈরি করুন। নিবন্ধন সম্পূর্ণ বিনামূল্যে — কোনো ফি নেই।',
  },
  {
    icon: FileEdit,
    step: '০২',
    title: 'বায়োডাটা তৈরি',
    body: 'ধাপে ধাপে মাল্টি-স্টেপ ফর্মে শিক্ষা, পেশা, পারিবারিক ও ধর্মীয় তথ্য পূরণ করুন; প্রয়োজনে ছবি যোগ করুন।',
  },
  {
    icon: ShieldCheck,
    step: '০৩',
    title: 'অভিভাবকের সম্মতি ও যাচাই',
    body: 'অভিভাবকের মোবাইলে ওটিপি যায়; সম্মতি পেলে মডারেটর বায়োডাটা যাচাই করে প্রকাশ করেন।',
  },
  {
    icon: HeartHandshake,
    step: '০৪',
    title: 'আগ্রহ পাঠান ও পরিণয়',
    body: 'পছন্দের পাত্র-পাত্রীর বায়োডাটায় আগ্রহ পাঠান; দুই অভিভাবক সম্মত হলে যোগাযোগের অনুমতি তৈরি হয় — ইনশাআল্লাহ, পারিবারিক বৈঠকে সুন্দর পরিণয়।',
  },
];

const dosAndDonts = {
  dos: [
    'সব তথ্য সত্য ও যথাযথ লিখুন — অসম্পূর্ণ বায়োডাটা অনুমোদন পায় না',
    'অভিভাবকদের সম্মতি নিয়েই যোগাযোগের অনুরোধ দিন',
    'সন্দেহজনক আচরণ পেলে "রিপোর্ট" বাটন ব্যবহার করুন',
    'নিয়মনীতি ও সাধারণ জিজ্ঞাসা নিয়মিত পড়ে জানুন',
  ],
  donts: [
    'কেউ ফি চাইলে বা "ডিল" এর প্রস্তাব দিলে মডারেটরকে রিপোর্ট করুন',
    'অভিভাবকের সম্মতি ছাড়া ব্যক্তিগত নম্বর শেয়ার করবেন না',
    'ভুয়া বয়স বা বৈবাহিক অবস্থা দিয়ে প্রোফাইল বানাবেন না',
    'শালীনতাবিরোধী ভাষা বা আচরণ একদম নয়',
  ],
};

export const GuidePage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="mb-badge">নির্দেশনা</span>
        <h1 className="text-3xl sm:text-4xl font-black text-ink">
          ধাপে ধাপে ব্যবহার নির্দেশিকা
        </h1>
        <p className="text-sm sm:text-base text-ink-2 max-w-xl mx-auto leading-relaxed">
          নিবন্ধন থেকে বিবাহের সিদ্ধান্ত — মধুবন্ধনে প্রক্রিয়াটি কীভাবে অভিভাবক-নির্ভরভাবে চলে, নিচের ধাপগুলো একবার দেখে নিন।
        </p>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {steps.map(({ icon: Icon, step, title, body }) => (
          <div key={step} className="mb-card mb-card-hover p-5 flex items-start gap-4">
            <div className="relative shrink-0 w-11 h-11 rounded-2xl bg-linear-to-br from-brand to-pink-500 text-white flex items-center justify-center shadow-md shadow-brand/25">
              <Icon className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-card border border-line text-[10px] font-bold text-gold flex items-center justify-center">
                {step.replace('০', '')}
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-ink text-sm">{title}</h3>
              <p className="text-xs text-ink-2 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="mb-card p-5 space-y-3">
          <h2 className="font-bold text-sm text-ink flex items-center gap-2">
            <CircleCheck className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
            <span>যা করবেন</span>
          </h2>
          <ul className="space-y-2">
            {dosAndDonts.dos.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-ink-2 leading-relaxed">
                <CircleCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-card p-5 space-y-3">
          <h2 className="font-bold text-sm text-ink flex items-center gap-2">
            <CircleX className="w-4.5 h-4.5 text-brand" />
            <span>যা করবেন না</span>
          </h2>
          <ul className="space-y-2">
            {dosAndDonts.donts.map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-ink-2 leading-relaxed">
                <CircleX className="w-3.5 h-3.5 text-brand shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Info note */}
      <div className="rounded-2xl bg-gold-soft border border-gold/25 p-5 flex items-start gap-3 text-xs text-gold leading-relaxed">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          সতর্কতা: এই প্ল্যাটফর্মের মডারেটর কখনো টাকা চান না। যে কোনো আর্থিক লেনদেন থেকে বিরত থাকুন —
          পাত্র/পাত্রীর পারিবারিক তথ্য অভিভাবক মারফত সরাসরি যাচাই করে তারপর সিদ্ধান্ত নিন।
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/register" className="mb-btn-primary px-6 py-3 text-xs">
          বিনামূল্যে নিবন্ধন করুন
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/faq" className="mb-btn-secondary text-xs">
          সচরাচর জিজ্ঞাসা দেখুন
        </Link>
      </div>
    </div>
  );
};

export default GuidePage;
