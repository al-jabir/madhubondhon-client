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

import { useLanguage } from '../i18n/LanguageContext';

interface FAQCategory {
  key: string;
  bn: string;
  en: string;
}

const CATEGORIES: FAQCategory[] = [
  { key: 'all', bn: 'সবগুলো', en: 'All' },
  { key: 'basics', bn: 'মৌলিক', en: 'Basics' },
  { key: 'guardian', bn: 'অভিভাবক ও শরিয়াহ', en: 'Guardian & Shariah' },
  { key: 'privacy', bn: 'প্রাইভেসি ও পর্দাশীলতা', en: 'Privacy & Modesty' },
  { key: 'search', bn: 'বায়োডাটা অনুসন্ধান', en: 'Biodata Search' },
  { key: 'payment', bn: 'পেমেন্ট ও ক্রেডিট', en: 'Payment & Credits' },
  { key: 'safety', bn: 'নিরাপত্তা ও অন্যান্য', en: 'Safety & Others' },
];

interface FAQItem {
  id: string;
  categoryKey: string;
  questionBn: string;
  questionEn: string;
  answerBn: string;
  answerEn: string;
}

const faqs: FAQItem[] = [
  {
    id: 'how-it-works',
    categoryKey: 'basics',
    questionBn: 'মধুবন্ধন (Tangail Matrimony) প্ল্যাটফর্মটি কীভাবে কাজ করে?',
    questionEn: 'How does the MadhuBondhon (Tangail Matrimony) platform work?',
    answerBn:
      'মধুবন্ধন হলো টাঙ্গাইল জেলা এবং দেশ-বিদেশে বসবাসরত টাঙ্গাইলবাসীর জন্য একটি নির্ভরযোগ্য এবং ইসলামিক মূল্যবোধসম্পন্ন পাত্র-পাত্রী খোঁজার মাধ্যম। এখানে যেকোনো প্রাপ্তবয়স্ক (১৮+) পাত্র-পাত্রী বা তাদের অভিভাবক বিনামূল্যে বায়োডাটা তৈরি করতে পারেন। মডারেটরদের দ্বারা প্রতিটি তথ্য যাচাই ও অনুমোদনের পর তা প্ল্যাটফর্মে প্রকাশিত হয়। পছন্দ হলে একে অপরকে আগ্রহ (Interest) পাঠাতে পারেন এবং অভিভাবকের সম্মতিক্রমে সরাসরি পারিবারিক যোগাযোগের ব্যবস্থা করা হয়।',
    answerEn:
      'MadhuBondhon is a trusted, Shariah-compliant matrimonial matchmaking platform dedicated to candidates from Tangail district, both locally and abroad. Adult candidates (18+) or their guardians can create a biodata for free. Each profile is reviewed and verified by our moderation team before publication. Members can send interests to matching candidates, and direct family communications are established upon mutual guardian consent.',
  },
  {
    id: 'guardian-consent',
    categoryKey: 'guardian',
    questionBn: 'অভিভাবকের সম্মতি কেন বাধ্যতামূলক এবং কীভাবে যাচাই করা হয়?',
    questionEn: 'Why is guardian consent mandatory and how is it verified?',
    answerBn:
      'ইসলামিক শরিয়াহ ও সুস্থ পারিবারিক সংস্কৃতির মূল ভিত্তি হলো অভিভাবকের সন্তুষ্টি ও সম্পৃক্ততা। মধুবন্ধনে কোনো বায়োডাটা জমা দেওয়ার পূর্বে অভিভাবকের অনুমতি ও সম্মতি নিশ্চিত করা আবশ্যক। উভয় পক্ষের অভিভাবকের সম্মতি ছাড়া কাউকে কোনো ব্যক্তিগত ফোন নম্বর প্রদান করা হয় না।',
    answerEn:
      'Islamic Shariah and wholesome family ethics center around guardian involvement and consent. Before any biodata is submitted or contact numbers are revealed, candidate confirms clear guardian awareness and consent. Official guardian phone numbers are never disclosed without mutual guardian consent.',
  },
  {
    id: 'direct-chat',
    categoryKey: 'guardian',
    questionBn: 'পাত্র ও পাত্রীর মাঝে সরাসরি গোপন চ্যাট বা মেসেজিংয়ের সুযোগ আছে কি?',
    questionEn: 'Is direct, unmoderated chatting or secret messaging allowed between candidates?',
    answerBn:
      'না। মধুবন্ধনে অনিয়ন্ত্রিত বা গোপন সরাসরি চ্যাটিংয়ের কোনো সুযোগ রাখা হয়নি। কারণ এটি শরিয়াহ পরিপন্থী ও পারিবারিক নিরাপত্তার জন্য ঝুঁকিপূর্ণ। আগ্রহ পাঠানোর পর উভয় পরিবারের অভিভাবক সম্মত হলেই কেবল অফিশিয়াল অভিভাবক নম্বর উন্মুক্ত হয় এবং পরিবারগুলো নিজেদের মধ্যে যোগাযোগ স্থাপন করে।',
    answerEn:
      'No. MadhuBondhon strictly prohibits direct, private unmoderated chatting to protect Islamic boundaries, family safety, and modesty. Once mutual guardian consent is established through formal interest acceptance, official guardian contact details are shared for honorable family discussions.',
  },
  {
    id: 'purdah-mode',
    categoryKey: 'privacy',
    questionBn: 'বায়োডাটায় কি ছবি দেওয়া প্রয়োজন? প্ল্যাটফর্মে ছবির নীতি কী?',
    questionEn: 'Are photos required in biodatas? What is the photo policy?',
    answerBn:
      'না, মধুবন্ধনে কোনো ছবি আপলোড করার প্রয়োজন নেই এবং প্ল্যাটফর্মে কোনো ছবি ব্যবহৃত হয় না। ইসলামিক শরীয়াহ মোতাবেক সম্পূর্ণ পর্দা ও সামাজিক সম্মান বজায় রাখতে ছবিমুক্ত বায়োডাটা ব্যবস্থা রাখা হয়েছে। দ্বীনি গুণাবলী, চরিত্র, শিক্ষা, পেশা ও পরিবারের তথ্যের ওপর ভিত্তি করে জীবনসঙ্গী নির্ধারণ করা হয়।',
    answerEn:
      'No, photographs are neither required nor supported on MadhuBondhon. In strict adherence to Islamic modesty, candidates do not upload photos. Matching is purely based on religious practice, character, education, career, and family background.',
  },
  {
    id: 'biodata-id',
    categoryKey: 'search',
    questionBn: 'বায়োডাটা কোড (যেমন: MB-M101 বা MB-F205) কী এবং এটি দিয়ে কীভাবে খুঁজব?',
    questionEn: 'What is a Biodata Code (e.g. MB-M101 or MB-F205) and how do I search with it?',
    answerBn:
      'প্রতিটি প্রকাশিত বায়োডাটার জন্য একটি অনন্য কোড তৈরি হয় (পাত্রদের জন্য MB-M... এবং পাত্রীদের জন্য MB-F...)। সার্চ পেজের উপরে বায়োডাটা কোড বক্সে সরাসরি এই কোডটি লিখে সার্চ বাটনে ক্লিক করলে নির্দিষ্ট সেই পাত্র বা পাত্রীর সম্পূর্ণ তথ্য মুহূর্তে দেখা যাবে। অভিভাবকরা আত্মীয়-স্বজনের সাথে আলোচনার সময় নাম বা ছবি না দিয়ে শুধুমাত্র এই কোডটি শেয়ার করতে পারেন।',
    answerEn:
      'Each published biodata receives a unique code (MB-M... for grooms and MB-F... for brides). You can enter this code directly into the search bar at the top of the search page to immediately view that candidate’s full verified profile. Families can share this code with relatives to discuss proposals without exposing private contact info.',
  },
  {
    id: 'credits-payment',
    categoryKey: 'payment',
    questionBn: 'অভিভাবকের যোগাযোগ নম্বর দেখতে ক্রেডিট কেন প্রয়োজন এবং কীভাবে কিনব?',
    questionEn: 'Why are credits required to view guardian contact info, and how do I purchase them?',
    answerBn:
      'স্প্যামার বা অসাধু ব্যক্তিদের অনাকাঙ্ক্ষিত কল থেকে পাত্র-পাত্রীর পরিবারকে সুরক্ষিত রাখতে এবং প্ল্যাটফর্মের সার্ভার ও প্রশাসনিক মডারেশন পরিচালনা করতে সামান্য সার্ভিস ক্রেডিট ফি নেওয়া হয়। নতুন নিবন্ধনে ২টি ক্রেডিট সম্পূর্ণ ফ্রি থাকে। এরপর বিকাশ বা নগদে সেন্ড মানি করে ৫, ১০ বা ২০ ক্রেডিটের সাশ্রয়ী প্যাকেজ কেনা যায়। ট্রানজেকশন আইডি (TrxID) দিলে আমাদের টিম ৫-১০ মিনিটের মধ্যে ভেরিফাই করে ক্রেডিট যোগ করে দেয়।',
    answerEn:
      'A nominal credit system is maintained to protect families from spammers and unsolicited calls, as well as to cover cloud infrastructure and moderation server costs. New registrations receive 2 complimentary free credits. Additional affordable credit packs (5, 10, or 20 credits) can be acquired via bKash or Nagad Send Money. Once you submit the TrxID, our team verifies and credits your account within 5–10 minutes.',
  },
  {
    id: 'expats-eligibility',
    categoryKey: 'basics',
    questionBn: 'টাঙ্গাইলের বাইরে বা প্রবাসে বসবাসকারীরা কি বায়োডাটা তৈরি করতে পারবে?',
    questionEn: 'Can Tangail natives living in other districts or abroad register a biodata?',
    answerBn:
      'অবশ্যই! যে সকল পরিবারের আদি নিবাস টাঙ্গাইল জেলায় কিন্তু বর্তমানে পেশা বা পড়াশোনার কারণে ঢাকা বা দেশের অন্যান্য অঞ্চলে কিংবা প্রবাসে (যেমন: মধ্যপ্রাচ্য, যুক্তরাজ্য, যুক্তরাষ্ট্র, ইউরোপ) বসবাস করছেন, তারা সানন্দে মধুবন্ধনে বায়োডাটা জমা দিতে পারেন।',
    answerEn:
      'Absolutely! Families originating from Tangail district who currently reside in Dhaka, other parts of Bangladesh, or abroad (e.g., Middle East, UK, USA, Europe) for career or study are warmly welcome to register on MadhuBondhon.',
  },
  {
    id: 'approval-time',
    categoryKey: 'safety',
    questionBn: 'বায়োডাটা জমা দেওয়ার পর অনুমোদন হতে কত সময় লাগে?',
    questionEn: 'How long does it take for a biodata to get approved after submission?',
    answerBn:
      'আমাদের ডেডিকেটেড মডারেশন টিম প্রতিটি বায়োডাটার তথ্য, জন্মতারিখ এবং অভিভাবকের সম্মতি পুঙ্খানুপুঙ্খভাবে যাচাই করে। সাধারণত আবেদন জমা দেওয়ার ২ থেকে ৬ ঘণ্টার মধ্যে বায়োডাটা পর্যালোচনা ও অনুমোদন সম্পন্ন হয়। কোনো তথ্য সংশোধনের প্রয়োজন হলে তা "আমার প্রোফাইল" ড্যাশবোর্ডে মন্তব্যসহ জানিয়ে দেওয়া হয়।',
    answerEn:
      'Our dedicated moderation team thoroughly verifies submitted information, date of birth, and guardian consent. Reviews are typically completed within 2 to 6 hours. If any correction is required, clear guidance will be displayed in your "My Profile" dashboard.',
  },
  {
    id: 'orphan-alternative-guardian',
    categoryKey: 'guardian',
    questionBn: 'বাবা-মা জীবিত না থাকলে অভিভাবক হিসেবে কার নম্বর দেওয়া যাবে?',
    questionEn: 'Who can be nominated as guardian if parents are deceased?',
    answerBn:
      'বাবা জীবিত না থাকলে বড় ভাই, চাচা, মামা, দাদা, নানা বা আইনগত/পারিবারিক যেকোনো বিশ্বস্ত নিকটাত্মীয়কে অভিভাবক হিসেবে মনোনীত করা যাবে। বায়োডাটা পূরণ করার সময় সম্পর্ক নির্বাচন করে তাঁর ফোন নম্বরে ওটিপি ভেরিফিকেশন সম্পন্ন করলেই চলবে।',
    answerEn:
      'If parents are deceased, an elder brother, uncle (paternal or maternal), grandfather, or any trusted close family relative can be nominated as the legal guardian. Simply select the relationship when completing the biodata and complete their mobile OTP verification.',
  },
  {
    id: 'marriage-complete',
    categoryKey: 'safety',
    questionBn: 'বিবাহ ঠিক হয়ে গেলে বায়োডাটা কীভাবে বন্ধ বা মুছে ফেলব?',
    questionEn: 'How do I deactivate or delete my biodata once a marriage is finalized?',
    answerBn:
      'আলহামদুলিল্লাহ, আপনার বিয়ে ঠিক হয়ে গেলে "আমার প্রোফাইল" পেজের নিচের নিরাপত্তা সেকশন থেকে যেকোনো সময় বায়োডাটাটি সাময়িকভাবে "নিষ্ক্রিয়" (Deactivate) করতে পারেন অথবা "স্থায়ীভাবে মুছে ফেলুন" (Delete Account) বাটনে ক্লিক করে চিরতরে মুছে ফেলতে পারেন।',
    answerEn:
      'Alhamdulillah, once your marriage is settled, you can temporarily deactivate your biodata from the Security section on your "My Profile" page, or permanently delete your account by clicking "Delete Account".',
  },
  {
    id: 'safety-report',
    categoryKey: 'safety',
    questionBn: 'কোনো সন্দেহজনক বা মিথ্যা তথ্যযুক্ত বায়োডাটা দেখলে কী করব?',
    questionEn: 'What should I do if I find a suspicious or inaccurate biodata?',
    answerBn:
      'প্রতিটি বায়োডাটার নিচে একটি লাল "রিপোর্ট" (Report) বাটন রয়েছে। আপনি উপযুক্ত কারণ ও বিবরণ লিখে অভিযোগ দাখিল করলে আমাদের অ্যাডমিন টিম তাৎক্ষণিকভাবে বিষয়টি তদন্ত করে বায়োডাটাটি বাতিল ও সেই অ্যাকাউন্টটি স্থায়ীভাবে নিষিদ্ধ (Ban) করবে।',
    answerEn:
      'Every biodata includes a "Report" button at the bottom. By submitting a report with specific details, our administrative team will immediately investigate, hide the profile, and permanently ban any fraudulent account.',
  },
  {
    id: 'registration-cost',
    categoryKey: 'basics',
    questionBn: 'বায়োডাটা তৈরি করতে কোনো ফি বা টাকা দিতে হয় কি?',
    questionEn: 'Is there any fee to create and publish a biodata?',
    answerBn:
      'না! মধুবন্ধনে যেকোনো পাত্র-পাত্রী বা অভিভাবকের জন্য একাউন্ট খোলা, সম্পূর্ণ বায়োডাটা তৈরি করা এবং প্ল্যাটফর্মে প্রকাশ করা সম্পূর্ণ বিনামূল্যে। প্রাথমিক অনুসন্ধানের জন্য রেজিস্ট্রেশনের সাথে সাথে ওয়েলকাম ক্রেডিটও প্রদান করা হয়।',
    answerEn:
      'No! Account registration, full biodata creation, and platform publication are completely free of charge for all candidates and guardians. Welcome credits are also gifted upon signup for initial searches.',
  },
];

export const FAQPage: React.FC = () => {
  const { isBengali, formatNumber } = useLanguage();
  const [openId, setOpenId] = useState<string | null>('how-it-works');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const toggleOpen = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory =
        selectedCategoryKey === 'all' || item.categoryKey === selectedCategoryKey;
      const query = searchQuery.trim().toLowerCase();
      const qText = isBengali ? item.questionBn : item.questionEn;
      const aText = isBengali ? item.answerBn : item.answerEn;
      const cat = CATEGORIES.find((c) => c.key === item.categoryKey);
      const catText = cat ? (isBengali ? cat.bn : cat.en) : '';

      const matchesSearch =
        !query ||
        qText.toLowerCase().includes(query) ||
        aText.toLowerCase().includes(query) ||
        catText.toLowerCase().includes(query) ||
        item.questionBn.toLowerCase().includes(query) ||
        item.questionEn.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategoryKey, searchQuery, isBengali]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-soft text-brand rounded-full text-xs font-bold border border-brand/25">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isBengali ? 'সহায়তা ও দিকনির্দেশনা' : 'Help & Guidance'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {isBengali ? 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)' : 'Frequently Asked Questions (FAQ)'}
        </h1>
        <p className="text-sm text-ink-2">
          {isBengali
            ? 'মধুবন্ধন টাঙ্গাইল মেট্রিমনি প্ল্যাটফর্মের ব্যবহারবিধি, শরিয়াহ নীতিমালা ও সেবা সংক্রান্ত যাবতীয় উত্তর'
            : 'Answers regarding platform usage, Shariah guidelines, and matrimonial services across Tangail'}
        </p>

        {/* Search bar */}
        <div className="pt-2">
          <div className="relative max-w-md mx-auto">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isBengali ? 'প্রশ্ন বা কীওয়ার্ড লিখে খুঁজুন...' : 'Search questions or keywords...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-input w-full !text-sm pl-10 pr-10 py-2.5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                aria-label={isBengali ? 'ক্লিয়ার করুন' : 'Clear search'}
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
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {isBengali ? 'শতভাগ গোপনীয়তা' : '100% Confidential'}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {isBengali ? 'অনুমতি ছাড়া কোনো ফোন নম্বর শেয়ার হয় না' : 'No phone numbers shared without consent'}
            </p>
          </div>
        </div>

        <div className="bg-card mb-card p-5 flex items-center gap-3.5 border-line">
          <div className="w-10 h-10 rounded-full bg-gold-soft text-gold flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {isBengali ? 'অভিভাবকের তত্ত্বাবধান' : 'Guardian Supervision'}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {isBengali ? 'পারিবারিক সম্মতির মাধ্যমে সরাসরি যোগাযোগ' : 'Direct communication via family approval'}
            </p>
          </div>
        </div>

        <div className="bg-card mb-card p-5 flex items-center gap-3.5 border-line">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-gray-900 dark:text-white">
              {isBengali ? 'ছবিমুক্ত পর্দাশীল ব্যবস্থা' : '100% Modest & Photo-Free'}
            </h4>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {isBengali ? 'সম্পূর্ণ পর্দা রক্ষা ও শরীয়াহসম্মত সম্মানজনক ম্যাচমেকিং' : 'Strict modesty and shariah-compliant matchmaking'}
            </p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategoryKey === cat.key;
          const count =
            cat.key === 'all'
              ? faqs.length
              : faqs.filter((f) => f.categoryKey === cat.key).length;

          return (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategoryKey(cat.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                isActive
                  ? 'bg-rose-600 text-white shadow-xs shadow-rose-600/30 font-bold'
                  : 'bg-card text-ink-2 border border-line hover:border-brand/40 hover:text-brand hover:bg-brand-soft/30'
              }`}
            >
              <span>{isBengali ? cat.bn : cat.en}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-elev text-gray-500 dark:text-gray-400'
                }`}
              >
                {formatNumber(count)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search / Filter status indicator */}
      {(searchQuery.trim() !== '' || selectedCategoryKey !== 'all') && (
        <div className="flex items-center justify-between text-xs text-ink-3 px-1">
          <span>
            {isBengali
              ? `${formatNumber(filteredFaqs.length)} টি প্রশ্নোত্তর প্রদর্শিত হচ্ছে${
                  searchQuery ? ` ("${searchQuery}" এর জন্য)` : ''
                }`
              : `Showing ${filteredFaqs.length} questions & answers${
                  searchQuery ? ` (for "${searchQuery}")` : ''
                }`}
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedCategoryKey('all');
              setSearchQuery('');
            }}
            className="text-brand hover:underline font-semibold cursor-pointer"
          >
            {isBengali ? 'ফিল্টার রিসেট করুন' : 'Reset filters'}
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
              {isBengali
                ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো প্রশ্নোত্তর পাওয়া যায়নি।'
                : 'No questions found matching your search.'}
            </p>
            <p className="text-xs text-ink-3 max-w-sm mx-auto">
              {isBengali
                ? 'অন্য কোনো কীওয়ার্ড লিখে অনুসন্ধান করুন অথবা নিচে দেওয়া হেল্পলাইনে সরাসরি যোগাযোগ করুন।'
                : 'Try searching with different keywords or contact our 24/7 Tangail helpline below.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryKey('all');
                setSearchQuery('');
              }}
              className="mb-btn-secondary text-xs px-4 py-2 mt-2"
            >
              {isBengali ? 'সবগুলো প্রশ্নোত্তর দেখুন' : 'View all FAQs'}
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            const categoryObj = CATEGORIES.find((c) => c.key === faq.categoryKey);
            const categoryLabel = categoryObj ? (isBengali ? categoryObj.bn : categoryObj.en) : '';
            const questionText = isBengali ? faq.questionBn : faq.questionEn;
            const answerText = isBengali ? faq.answerBn : faq.answerEn;

            return (
              <div
                key={faq.id}
                className={`bg-card mb-card overflow-hidden transition-all duration-200 border ${
                  isOpen
                    ? 'border-rose-400 dark:border-rose-500/80 shadow-md ring-1 ring-rose-500/20'
                    : 'border-line hover:border-line-strong'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleOpen(faq.id)}
                  className={`w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                    isOpen ? 'bg-rose-500/10 dark:bg-rose-950/30' : 'hover:bg-rose-500/5 dark:hover:bg-elev/60'
                  }`}
                  aria-expanded={isOpen}
                >
                  <div className="space-y-1.5 pr-2">
                    <span className="bg-rose-100 text-rose-800 border border-rose-300/80 dark:bg-rose-950/70 rounded-full px-2.5 py-0.5 text-[11px] font-bold inline-flex items-center">
                      {categoryLabel}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-ink leading-snug">
                      {questionText}
                    </h3>
                  </div>

                  <div
                    className={`w-7 h-7 rounded-full bg-elev flex items-center justify-center text-ink-3 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-rose-500/20 text-rose-600 dark:text-rose-400' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-3 text-xs sm:text-sm text-ink-2 leading-relaxed border-t border-line bg-elev/50">
                    <p className="whitespace-pre-line leading-relaxed">{answerText}</p>
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
          <span>{isBengali ? '২৪/৭ সার্বক্ষণিক টাঙ্গাইল সাপোর্ট' : '24/7 Tangail Support Helpline'}</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
          {isBengali ? 'অন্য কোনো জিজ্ঞাসা বা বিশেষ সমস্যা আছে?' : 'Have other questions or need assistance?'}
        </h3>
        <p className="text-xs sm:text-sm text-rose-100 max-w-lg mx-auto leading-relaxed">
          {isBengali
            ? 'আমাদের টাঙ্গাইল হেল্পলাইন টিম আপনার সেবায় সর্বদা নিয়োজিত। যে কোনো তথ্যের জন্য সরাসরি কথা বলতে পারেন।'
            : 'Our Tangail support team is dedicated to assisting you. Feel free to contact us directly anytime.'}
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/packages"
            className="px-5 py-2.5 bg-white text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" />
            <span>{isBengali ? 'প্যাকেজ ও মূল্যতালিকা দেখুন' : 'View Packages & Pricing'}</span>
          </Link>
          <a
            href="https://api.whatsapp.com/send?phone=8801700000000"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isBengali ? 'হোয়াটসঅ্যাপে যোগাযোগ করুন' : 'Chat on WhatsApp'}</span>
          </a>
          <a
            href="tel:+8801700000000"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5"
          >
            <Phone className="w-4 h-4" />
            <span>{isBengali ? 'কল করুন' : 'Call Support'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
