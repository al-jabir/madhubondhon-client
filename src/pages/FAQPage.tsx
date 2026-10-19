import React, { useState, useMemo } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ShieldCheck, 
  Lock, 
  Users,
  Search,
  X,
  Sparkles,
  Phone,
  MessageCircle,
  CreditCard
} from 'lucide-react';
import { Link } from 'react-router';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQ_CATEGORIES = [
  'সবগুলো',
  'মৌলিক',
  'অভিভাবক ও শরিয়াহ',
  'প্রাইভেসি ও ছবি',
  'বায়োডাটা অনুসন্ধান',
  'পেমেন্ট ও ক্রেডিট',
  'নিরাপত্তা ও অন্যান্য',
] as const;

const faqs: FAQItem[] = [
  {
    id: 'how-it-works',
    category: 'মৌলিক',
    question: 'মধুবন্ধন (Tangail Matrimony) প্ল্যাটফর্মটি কীভাবে কাজ করে?',
    answer:
      'মধুবন্ধন হলো টাঙ্গাইল জেলা এবং দেশ-বিদেশে বসবাসরত টাঙ্গাইলবাসীর জন্য একটি নির্ভরযোগ্য এবং ইসলামিক মূল্যবোধসম্পন্ন পাত্র-পাত্রী খোঁজার মাধ্যম। এখানে যেকোনো প্রাপ্তবয়স্ক (১৮+) পাত্র-পাত্রী বা তাদের অভিভাবক বিনামূল্যে বায়োডাটা তৈরি করতে পারেন। মডারেটরদের দ্বারা প্রতিটি তথ্য যাচাই ও অনুমোদনের পর তা প্ল্যাটফর্মে প্রকাশিত হয়। পছন্দ হলে একে অপরকে আগ্রহ (Interest) পাঠাতে পারেন এবং অভিভাবকের সম্মতিক্রমে সরাসরি পারিবারিক যোগাযোগের ব্যবস্থা করা হয়।',
  },
  {
    id: 'guardian-consent',
    category: 'অভিভাবক ও শরিয়াহ',
    question: 'অভিভাবকের সম্মতি কেন বাধ্যতামূলক এবং কীভাবে যাচাই করা হয়?',
    answer:
      'ইসলামিক শরিয়াহ ও সুস্থ পারিবারিক সংস্কৃতির মূল ভিত্তি হলো অভিভাবকের সন্তুষ্টি ও সম্পৃক্ততা। মধুবন্ধনে কোনো বায়োডাটা জমা দেওয়ার পূর্বে অভিভাবকের মোবাইল নম্বরে ৬ সংখ্যার ওটিপি (OTP) পাঠিয়ে তাঁর অনুমতি নিশ্চিত করা হয়। উভয় পক্ষের অভিভাবকের সম্মতি ছাড়া কাউকে কোনো ব্যক্তিগত ফোন নম্বর প্রদান করা হয় না।',
  },
  {
    id: 'direct-chat',
    category: 'অভিভাবক ও শরিয়াহ',
    question: 'পাত্র ও পাত্রীর মাঝে সরাসরি গোপন চ্যাট বা মেসেজিংয়ের সুযোগ আছে কি?',
    answer:
      'না। মধুবন্ধনে অনিয়ন্ত্রিত বা গোপন সরাসরি চ্যাটিংয়ের কোনো সুযোগ রাখা হয়নি। কারণ এটি শরিয়াহ পরিপন্থী ও পারিবারিক নিরাপত্তার জন্য ঝুঁকিপূর্ণ। আগ্রহ পাঠানোর পর উভয় পরিবারের অভিভাবক সম্মত হলেই কেবল অফিশিয়াল অভিভাবক নম্বর উন্মুক্ত হয় এবং পরিবারগুলো নিজেদের মধ্যে যোগাযোগ স্থাপন করে।',
  },
  {
    id: 'purdah-mode',
    category: 'প্রাইভেসি ও ছবি',
    question: 'পর্দাশীল বায়োডাটা (ব্লার মোড) এবং ছবির গোপনীয়তা কীভাবে কাজ করে?',
    answer:
      'আমরা মা-বোনদের পর্দার সর্বোচ্চ সম্মান করি। ছবি আপলোড করার সময় "পর্দাশীল ছবি (ব্লার রাখুন)" নির্বাচন করলে আপনার ছবিটি জনসাধারণের কাছে স্বয়ংক্রিয়ভাবে ঝাপসা দেখাবে। এছাড়া আপনি সেটিংস থেকে নির্ধারণ করতে পারবেন আপনার ছবি শুধুমাত্র নিবন্ধিত সদস্য বা যাদের প্রস্তাব আপনি অনুমোদন করবেন তারাই কেবল দেখতে পাবেন। চাইলে যেকোনো সময় ছবি সম্পূর্ণ গোপন (Hidden) রাখতে পারবেন।',
  },
  {
    id: 'biodata-id',
    category: 'বায়োডাটা অনুসন্ধান',
    question: 'বায়োডাটা কোড (যেমন: MB-M101 বা MB-F205) কী এবং এটি দিয়ে কীভাবে খুঁজব?',
    answer:
      'প্রতিটি প্রকাশিত বায়োডাটার জন্য একটি অনন্য কোড তৈরি হয় (পাত্রদের জন্য MB-M... এবং পাত্রীদের জন্য MB-F...)। সার্চ পেজের উপরে বায়োডাটা কোড বক্সে সরাসরি এই কোডটি লিখে সার্চ বাটনে ক্লিক করলে নির্দিষ্ট সেই পাত্র বা পাত্রীর সম্পূর্ণ তথ্য মুহূর্তে দেখা যাবে। অভিভাবকরা আত্মীয়-স্বজনের সাথে আলোচনার সময় নাম বা ছবি না দিয়ে শুধুমাত্র এই কোডটি শেয়ার করতে পারেন।',
  },
  {
    id: 'credits-payment',
    category: 'পেমেন্ট ও ক্রেডিট',
    question: 'অভিভাবকের যোগাযোগ নম্বর দেখতে ক্রেডিট কেন প্রয়োজন এবং কীভাবে কিনব?',
    answer:
      'স্প্যামার বা অসাধু ব্যক্তিদের অনাকাঙ্ক্ষিত কল থেকে পাত্র-পাত্রীর পরিবারকে সুরক্ষিত রাখতে এবং প্ল্যাটফর্মের সার্ভার ও এসএমএস গেটওয়ে পরিচালনা করতে সামান্য সার্ভিস ক্রেডিট ফি নেওয়া হয়। নতুন নিবন্ধনে ২টি ক্রেডিট সম্পূর্ণ ফ্রি থাকে। এরপর বিকাশ বা নগদে সেন্ড মানি করে ৫, ১০ বা ২০ ক্রেডিটের সাশ্রয়ী প্যাকেজ কেনা যায়। ট্রানজেকশন আইডি (TrxID) দিলে আমাদের টিম ৫-১০ মিনিটের মধ্যে ভেরিফাই করে ক্রেডিট যোগ করে দেয়।',
  },
  {
    id: 'expats-eligibility',
    category: 'মৌলিক',
    question: 'টাঙ্গাইলের বাইরে বা প্রবাসে বসবাসকারীরা কি বায়োডাটা তৈরি করতে পারবে?',
    answer:
      'অবশ্যই! যে সকল পরিবারের আদি নিবাস টাঙ্গাইল জেলায় কিন্তু বর্তমানে পেশা বা পড়াশোনার কারণে ঢাকা বা দেশের অন্যান্য অঞ্চলে কিংবা প্রবাসে (যেমন: মধ্যপ্রাচ্য, যুক্তরাজ্য, যুক্তরাষ্ট্র, ইউরোপ) বসবাস করছেন, তারা সানন্দে মধুবন্ধনে বায়োডাটা জমা দিতে পারেন।',
  },
  {
    id: 'approval-time',
    category: 'নিরাপত্তা ও অন্যান্য',
    question: 'বায়োডাটা জমা দেওয়ার পর অনুমোদন হতে কত সময় লাগে?',
    answer:
      'আমাদের ডেডিকেটেড মডারেশন টিম প্রতিটি বায়োডাটার তথ্য, জন্মতারিখ এবং অভিভাবকের সম্মতি পুঙ্খানুপুঙ্খভাবে যাচাই করে। সাধারণত আবেদন জমা দেওয়ার ২ থেকে ৬ ঘণ্টার মধ্যে বায়োডাটা পর্যালোচনা ও অনুমোদন সম্পন্ন হয়। কোনো তথ্য সংশোধনের প্রয়োজন হলে তা "আমার প্রোফাইল" ড্যাশবোর্ডে মন্তব্যসহ জানিয়ে দেওয়া হয়।',
  },
  {
    id: 'orphan-alternative-guardian',
    category: 'অভিভাবক ও শরিয়াহ',
    question: 'বাবা-মা জীবিত না থাকলে অভিভাবক হিসেবে কার নম্বর দেওয়া যাবে?',
    answer:
      'বাবা জীবিত না থাকলে বড় ভাই, চাচা, মামা, দাদা, নানা বা আইনগত/পারিবারিক যেকোনো বিশ্বস্ত নিকটাত্মীয়কে অভিভাবক হিসেবে মনোনীত করা যাবে। বায়োডাটা পূরণ করার সময় সম্পর্ক নির্বাচন করে তাঁর ফোন নম্বরে ওটিপি ভেরিফিকেশন সম্পন্ন করলেই চলবে।',
  },
  {
    id: 'marriage-complete',
    category: 'নিরাপত্তা ও অন্যান্য',
    question: 'বিবাহ ঠিক হয়ে গেলে বায়োডাটা কীভাবে বন্ধ বা মুছে ফেলব?',
    answer:
      'আলহামদুলিল্লাহ, আপনার বিয়ে ঠিক হয়ে গেলে "আমার প্রোফাইল" পেজের নিচের নিরাপত্তা সেকশন থেকে যেকোনো সময় বায়োডাটাটি সাময়িকভাবে "নিষ্ক্রিয়" (Deactivate) করতে পারেন অথবা "স্থায়ীভাবে মুছে ফেলুন" (Delete Account) বাটনে ক্লিক করে চিরতরে মুছে ফেলতে পারেন।',
  },
  {
    id: 'safety-report',
    category: 'নিরাপত্তা ও অন্যান্য',
    question: 'কোনো সন্দেহজনক বা মিথ্যা তথ্যযুক্ত বায়োডাটা দেখলে কী করব?',
    answer:
      'প্রতিটি বায়োডাটার নিচে একটি লাল "রিপোর্ট" (Report) বাটন রয়েছে। আপনি উপযুক্ত কারণ ও বিবরণ লিখে অভিযোগ দাখিল করলে আমাদের অ্যাডমিন টিম তাৎক্ষণিকভাবে বিষয়টি তদন্ত করে বায়োডাটাটি বাতিল ও সেই অ্যাকাউন্টটি স্থায়ীভাবে নিষিদ্ধ (Ban) করবে।',
  },
  {
    id: 'registration-cost',
    category: 'মৌলিক',
    question: 'বায়োডাটা তৈরি করতে কোনো ফি বা টাকা দিতে হয় কি?',
    answer:
      'না! মধুবন্ধনে যেকোনো পাত্র-পাত্রী বা অভিভাবকের জন্য একাউন্ট খোলা, সম্পূর্ণ বায়োডাটা তৈরি করা এবং প্ল্যাটফর্মে প্রকাশ করা সম্পূর্ণ বিনামূল্যে। প্রাথমিক অনুসন্ধানের জন্য রেজিস্ট্রেশনের সাথে সাথে ওয়েলকাম ক্রেডিটও প্রদান করা হয়।',
  },
];

export const FAQPage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('how-it-works');
  const [selectedCategory, setSelectedCategory] = useState<string>('সবগুলো');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory =
        selectedCategory === 'সবগুলো' || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-soft text-brand rounded-full text-xs font-bold border border-brand/25">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>সহায়তা ও দিকনির্দেশনা</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
          সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
        </h1>
        <p className="text-sm text-ink-2">
          মধুবন্ধন টাঙ্গাইল মেট্রিমনি প্ল্যাটফর্মের ব্যবহারবিধি, শরিয়াহ নীতিমালা ও সেবা সংক্রান্ত যাবতীয় উত্তর
        </p>

        {/* Search bar */}
        <div className="pt-2">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="প্রশ্ন বা কীওয়ার্ড লিখে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-input w-full !text-sm pl-10 pr-10 py-2.5"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors cursor-pointer"
                aria-label="ক্লিয়ার করুন"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Trust Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card mb-card p-5 flex items-center gap-3.5 border-line">
          <div className="w-10 h-10 rounded-full bg-brand-soft text-brand flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink">শতভাগ গোপনীয়তা</h4>
            <p className="text-[11px] text-ink-3">অনুমতি ছাড়া কোনো ফোন নম্বর শেয়ার হয় না</p>
          </div>
        </div>

        <div className="bg-card mb-card p-5 flex items-center gap-3.5 border-line">
          <div className="w-10 h-10 rounded-full bg-gold-soft text-gold flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink">অভিভাবকের তত্ত্বাবধান</h4>
            <p className="text-[11px] text-ink-3">পারিবারিক সম্মতির মাধ্যমে সরাসরি যোগাযোগ</p>
          </div>
        </div>

        <div className="bg-card mb-card p-5 flex items-center gap-3.5 border-line">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-ink">পর্দাশীল ব্লার সুবিধা</h4>
            <p className="text-[11px] text-ink-3">মা-বোনদের ছবির জন্য পূর্ণ শালীনতা ও সুরক্ষা</p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {FAQ_CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          const count =
            category === 'সবগুলো'
              ? faqs.length
              : faqs.filter((f) => f.category === category).length;

          return (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                isActive
                  ? 'bg-brand text-white shadow-xs shadow-brand/25'
                  : 'bg-card text-ink-2 border border-line hover:border-brand/40 hover:text-brand hover:bg-brand-soft/30'
              }`}
            >
              <span>{category}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-elev text-ink-3'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search / Filter status indicator */}
      {(searchQuery.trim() !== '' || selectedCategory !== 'সবগুলো') && (
        <div className="flex items-center justify-between text-xs text-ink-3 px-1">
          <span>
            {filteredFaqs.length} টি প্রশ্নোত্তর প্রদর্শিত হচ্ছে
            {searchQuery && ` ("${searchQuery}" এর জন্য)`}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('সবগুলো');
              setSearchQuery('');
            }}
            className="text-brand hover:underline font-semibold cursor-pointer"
          >
            ফিল্টার রিসেট করুন
          </button>
        </div>
      )}

      {/* Accordion FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="bg-card mb-card p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-brand-soft text-brand flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-ink">
              আপনার অনুসন্ধানের সাথে মিলে এমন কোনো প্রশ্নোত্তর পাওয়া যায়নি।
            </p>
            <p className="text-xs text-ink-3 max-w-sm mx-auto">
              অন্য কোনো কীওয়ার্ড লিখে অনুসন্ধান করুন অথবা নিচে দেওয়া হেল্পলাইনে সরাসরি যোগাযোগ করুন।
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('সবগুলো');
                setSearchQuery('');
              }}
              className="mb-btn-secondary text-xs px-4 py-2 mt-2"
            >
              সবগুলো প্রশ্নোত্তর দেখুন
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;

            return (
              <div
                key={faq.id}
                className={`bg-card mb-card overflow-hidden transition-all duration-200 border ${
                  isOpen
                    ? 'border-brand/40 shadow-xs'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(faq.id)}
                  className={`w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    isOpen ? 'bg-brand-soft/20' : 'hover:bg-brand-soft/30'
                  }`}
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1.5 pr-2">
                    <span className="bg-brand-soft border border-brand/20 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-brand-ink inline-flex items-center">
                      {faq.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-ink leading-snug">
                      {faq.question}
                    </h3>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full bg-elev flex items-center justify-center text-ink-3 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-brand-soft text-brand' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-2 text-xs sm:text-sm text-ink-2 leading-relaxed border-t border-line bg-elev/40">
                    <p className="whitespace-pre-line">{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Still need help callout */}
      <div className="bg-linear-to-r from-brand via-rose-600 to-pink-600 rounded-3xl p-6 sm:p-8 text-white text-center space-y-4 shadow-xl shadow-brand/20">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 rounded-full text-xs font-semibold backdrop-blur-xs">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>২৪/৭ সার্বক্ষণিক টাঙ্গাইল সাপোর্ট</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
          অন্য কোনো জিজ্ঞাসা বা বিশেষ সমস্যা আছে?
        </h3>
        <p className="text-xs sm:text-sm text-rose-100 max-w-lg mx-auto leading-relaxed">
          আমাদের টাঙ্গাইল হেল্পলাইন টিম আপনার সেবায় সর্বদা নিয়োজিত। যে কোনো তথ্যের জন্য সরাসরি কথা বলতে পারেন।
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/packages"
            className="px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>প্যাকেজ ও মূল্যতালিকা দেখুন</span>
          </Link>
          <a
            href="https://api.whatsapp.com/send?phone=8801700000000"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>হোয়াটসঅ্যাপে যোগাযোগ করুন</span>
          </a>
          <a
            href="tel:+8801700000000"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <Phone className="w-4 h-4" />
            <span>কল করুন</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
