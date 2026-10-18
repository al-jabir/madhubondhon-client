import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  MapPin,
  Search,
  ShieldCheck,
  Users,
  Lock,
  Heart,
  Calendar,
  ChevronDown,
  ArrowRight,
  Play,
  SlidersHorizontal,
  UserRound,
  User,
  Sparkles,
  UserRoundPlus,
  FileCheck2,
  MessagesSquare,
  Handshake,
} from 'lucide-react';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES } from '../constants/locations';
import { toBanglaNumber } from '../components/common/DatePicker';
import PublicStatistics from '../components/profile/PublicStatistics';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [gender, setGender] = useState<'female' | 'male'>('female');
  const [upazila, setUpazila] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ gender });
    if (upazila) params.set('upazila', upazila);
    if (maritalStatus) params.set('maritalStatus', maritalStatus);
    if (minAge) params.set('minAge', minAge);
    if (maxAge) params.set('maxAge', maxAge);
    navigate('/search?' + params.toString());
  };

  return (
    <div className="min-h-screen bg-[#0e0a12] text-gray-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* ─────────────────── HERO SECTION ─────────────────── */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#231728]">
        {/* Atmospheric Background Image with night mosque reflection */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <img
            src="/hero-mosque-bg.jpg"
            alt="Tangail Historic Mosque at Night"
            className="w-full h-full object-cover object-center opacity-35 filter contrast-125 brightness-95"
          />
          {/* Dark radial and gradient overlays matching the aesthetic */}
          <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-[#1c1022]/40 via-[#110a15]/85 to-[#0e0a12]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0a12] via-[#0e0a12]/75 to-[#0e0a12]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a12] via-transparent to-[#0e0a12]/70" />

          {/* Decorative Islamic arch watermark silhouette in top-left corner */}
          <div className="absolute -top-10 -left-10 w-96 h-96 opacity-10 text-rose-400 pointer-events-none">
            <svg viewBox="0 0 200 200" fill="currentColor">
              <path
                d="M100 0 C60 40 40 80 40 140 L40 200 L160 200 L160 140 C160 80 140 40 100 0 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              />
              <circle cx="100" cy="140" r="32" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main 2-Column Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* ─── Left Column (Hero Copy & CTAs) ─── */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Location Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2a1320]/80 border border-rose-900/50 text-rose-300 text-xs font-semibold backdrop-blur-xs">
                <MapPin className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                <span>টাঙ্গাইল জেলার জন্য বিশেষভাবে</span>
              </div>

              {/* Bold Bengali Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black text-white leading-[1.22] tracking-tight">
                একই শিকড়ের টানে,<br />
                শুরু হোক <span className="text-rose-500">নতুন গল্প</span>{' '}
                <span className="text-rose-400 font-normal">♡</span>
              </h1>

              {/* Subtitle */}
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl">
                পরিবার, সংস্কৃতি, মূল্যবোধ এবং টাঙ্গাইলের মানুষের জন্য নিরাপদ, বিশ্বাসযোগ্য ও সম্মানজনক একটি ম্যাট্রিমনিয়াল প্ল্যাটফর্ম।
              </p>

              {/* 3 Feature Badges in Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {/* Feature 1 */}
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#1b121f]/50 border border-rose-950/40">
                  <div className="w-10 h-10 rounded-full bg-rose-950/70 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-gray-200">নিরাপদ ও</div>
                    <div className="text-[11px] text-gray-400">গোপনীয়তা রক্ষা</div>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#1b121f]/50 border border-rose-950/40">
                  <div className="w-10 h-10 rounded-full bg-rose-950/70 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
                    <Users className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-gray-200">বাস্তব ও</div>
                    <div className="text-[11px] text-gray-400">বিশ্বস্ত সদস্য</div>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#1b121f]/50 border border-rose-950/40">
                  <div className="w-10 h-10 rounded-full bg-rose-950/70 border border-rose-800/40 flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-gray-200">শুধু টাঙ্গাইল</div>
                    <div className="text-[11px] text-gray-400">জেলার জন্য</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/search"
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-linear-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-950/80 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>বায়োডাটা খুঁজুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-gray-700/80 hover:border-gray-500 bg-[#1c1422]/60 hover:bg-[#251a2d] text-gray-200 hover:text-white font-semibold text-sm transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 text-rose-400 fill-rose-400/40" />
                  <span>কিভাবে কাজ করে?</span>
                </a>
              </div>

              {/* Trust Note */}
              <div className="flex items-center gap-2 text-xs text-gray-400 pt-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-rose-400/80 shrink-0" />
                <span>আপনার তথ্য সর্বদা নিরাপদ ও গোপন রাখা হয়</span>
              </div>
            </div>

            {/* ─── Right Column (Search Matchmaking Card) ─── */}
            <div className="lg:col-span-5">
              <div className="bg-[#18121c]/92 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-rose-900/50 shadow-2xl shadow-rose-950/80 relative">
                
                {/* Card Top Pill Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-900/60 text-rose-300 text-[11px] font-semibold mb-3">
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
                  <span>হাজারো সুন্দর পরিচয়ের প্রথম ধাপ</span>
                </div>

                {/* Card Header with circular search icon */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                      আপনার জীবনসঙ্গী খুঁজছেন?
                    </h2>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      সহজ কিছু তথ্য দিন, পেয়ে যান আপনার সম্ভাব্য জীবনসঙ্গী
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-rose-950/70 border border-rose-800/50 text-rose-400 flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSearch} className="space-y-3.5">
                  {/* Gender Selector: আমি খুঁজছি */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2">
                      আমি খুঁজছি
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setGender('female')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gender === 'female'
                            ? 'bg-linear-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-950/60 border border-rose-400/40'
                            : 'bg-[#221727]/80 hover:bg-[#2a1d30] text-gray-400 hover:text-gray-200 border border-[#35223c]'
                        }`}
                      >
                        <UserRound className="w-4 h-4 text-white" />
                        <span>পাত্রীর বায়োডাটা</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setGender('male')}
                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          gender === 'male'
                            ? 'bg-linear-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-950/60 border border-rose-400/40'
                            : 'bg-[#221727]/80 hover:bg-[#2a1d30] text-gray-400 hover:text-gray-200 border border-[#35223c]'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        <span>পাত্রের বায়োডাটা</span>
                      </button>
                    </div>
                  </div>

                  {/* Upazila Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      উপজেলা নির্বাচন করুন
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={upazila}
                        onChange={(e) => setUpazila(e.target.value)}
                        className="w-full bg-[#201524]/90 border border-[#36223d] focus:border-rose-500 rounded-xl pl-10 pr-9 py-2.5 text-xs text-gray-200 appearance-none focus:outline-hidden cursor-pointer"
                      >
                        <option value="" className="bg-[#1c1421] text-gray-200">টাঙ্গাইলের সকল উপজেলা</option>
                        {TANGAIL_UPAZILAS.map((up) => (
                          <option key={up} value={up} className="bg-[#1c1421] text-gray-200">
                            {UPAZILA_DISPLAY_NAMES[up]}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Marital Status Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      বৈবাহিক অবস্থা
                    </label>
                    <div className="relative">
                      <Heart className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full bg-[#201524]/90 border border-[#36223d] focus:border-rose-500 rounded-xl pl-10 pr-9 py-2.5 text-xs text-gray-200 appearance-none focus:outline-hidden cursor-pointer"
                      >
                        <option value="" className="bg-[#1c1421] text-gray-200">সকল অবস্থা</option>
                        <option value="never_married" className="bg-[#1c1421] text-gray-200">অবিবাহিত</option>
                        <option value="divorced" className="bg-[#1c1421] text-gray-200">বিবাহবিচ্ছেদ হয়েছে</option>
                        <option value="widowed" className="bg-[#1c1421] text-gray-200">বিধবা / বিপত্নীক</option>
                        <option value="separated" className="bg-[#1c1421] text-gray-200">পৃথক বসবাস</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Age Range Dropdowns */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">
                      বয়স সীমা (ঐচ্ছিক)
                    </label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Min Age */}
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={minAge}
                          onChange={(e) => setMinAge(e.target.value)}
                          className="w-full bg-[#201524]/90 border border-[#36223d] focus:border-rose-500 rounded-xl pl-8 pr-7 py-2 text-xs text-gray-200 appearance-none focus:outline-hidden cursor-pointer"
                        >
                          <option value="" className="bg-[#1c1421] text-gray-200">সর্বনিম্ন বয়স</option>
                          {[18, 20, 22, 24, 26, 28, 30, 32, 35, 40].map((a) => (
                            <option key={a} value={a} className="bg-[#1c1421] text-gray-200">{toBanglaNumber(a)} বছর</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>

                      {/* Max Age */}
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={maxAge}
                          onChange={(e) => setMaxAge(e.target.value)}
                          className="w-full bg-[#201524]/90 border border-[#36223d] focus:border-rose-500 rounded-xl pl-8 pr-7 py-2 text-xs text-gray-200 appearance-none focus:outline-hidden cursor-pointer"
                        >
                          <option value="" className="bg-[#1c1421] text-gray-200">সর্বোচ্চ বয়স</option>
                          {[22, 25, 28, 30, 32, 35, 38, 40, 45, 50, 60].map((a) => (
                            <option key={a} value={a} className="bg-[#1c1421] text-gray-200">{toBanglaNumber(a)} বছর</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-linear-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-lg shadow-rose-950/80 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-rose-900/90 active:scale-[0.99]"
                  >
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>বায়োডাটা খুঁজুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {/* Advanced Filter Link */}
                <Link
                  to="/search"
                  className="flex items-center justify-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-semibold mt-3.5 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>বিস্তারিত ফিল্টার দিয়ে খুঁজুন</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* ─── Bottom 4 Stats Bar ─── */}
          <div className="bg-[#18121c]/85 backdrop-blur-md border border-rose-950/60 rounded-3xl p-5 sm:p-6 mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Stat 1 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-rose-950/70 border border-rose-800/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-black text-white tracking-tight">৫,০০০+</div>
                <div className="text-xs text-gray-400">নিবন্ধিত সদস্য</div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-rose-950/70 border border-rose-800/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                <Heart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div className="text-left">
                <div className="text-xl font-black text-white tracking-tight">৩৫০+</div>
                <div className="text-xs text-gray-400">সফল পরিচয়</div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-rose-950/70 border border-rose-800/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                <MapPin className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div className="text-left">
                <div className="text-xl font-black text-white tracking-tight">১২টি</div>
                <div className="text-xs text-gray-400">টাঙ্গাইল উপজেলা</div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-rose-950/70 border border-rose-800/40 text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xl font-black text-white tracking-tight">১০০%</div>
                <div className="text-xs text-gray-400">নিরাপত্তা ও গোপনীয়তা</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────── PRINCIPLES SECTION ─────────────────── */}
      <section className="py-16 border-b border-[#231728] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="আমাদের অঙ্গীকার">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: MapPin,
              title: 'কাছের মানুষ, পরিচিত পরিবেশ',
              description: 'টাঙ্গাইলের ১২ উপজেলাকে ঘিরে জীবনসঙ্গীর সন্ধান।',
            },
            {
              icon: ShieldCheck,
              title: 'গোপনীয়তায় আপনার নিয়ন্ত্রণ',
              description: 'অনুমতি অনুযায়ী অভিভাবকের সঙ্গে যোগাযোগ ও সর্বোচ্চ নিরাপত্তা।',
            },
            {
              icon: FileCheck2,
              title: 'পর্যালোচনার পর প্রকাশ',
              description: 'জমা দেওয়া প্রতিটি বায়োডাটা যাচাই ও নিরীক্ষা করেন মডারেটর।',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex items-start gap-4 p-5 rounded-2xl bg-[#16101c]/80 border border-[#2b1b30] hover:border-rose-900/50 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-950/70 border border-rose-900/50 flex items-center justify-center text-rose-400 shrink-0">
                <Icon className="w-6 h-6 stroke-[1.7]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-1">{title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────── PUBLIC STATS COMPONENT ─────────────────── */}
      <div className="border-b border-[#231728]">
        <PublicStatistics />
      </div>

      {/* ─────────────────── HOW IT WORKS SECTION ─────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#231728]" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-rose-400 tracking-wider uppercase bg-rose-950/60 px-3 py-1 rounded-full border border-rose-900/50">
            সহজ চারটি ধাপ
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            পরিচয় থেকে পরিণয়ের পথে
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            নিজের তথ্য দিয়ে শুরু করুন। সময় নিয়ে জানুন, পরিবারের সঙ্গে আলোচনা করে সিদ্ধান্ত নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: UserRoundPlus,
              n: '০১',
              title: 'নিজের বায়োডাটা তৈরি',
              body: 'অ্যাকাউন্ট খুলে নিজের পরিচয়, পরিবার ও জীবনসঙ্গীর প্রত্যাশার তথ্য পূরণ করুন।',
            },
            {
              icon: Search,
              n: '০২',
              title: 'পছন্দ মিলিয়ে অনুসন্ধান',
              body: 'উপজেলা, বয়স, শিক্ষা ও পেশার ফিল্টারে উপযুক্ত বায়োডাটা সহজেই খুঁজুন।',
            },
            {
              icon: MessagesSquare,
              n: '০৩',
              title: 'পরিবারের সঙ্গে যোগাযোগ',
              body: 'আগ্রহ প্রকাশ করুন। উভয় পক্ষের সম্মতিতে অভিভাবকের সঙ্গে কথা এগিয়ে নিন।',
            },
            {
              icon: Handshake,
              n: '০৪',
              title: 'বিবাহের সুন্দর পরিণয়',
              body: 'তথ্য যাচাই ও পারিবারিক আলোচনার পর সম্মানজনকভাবে বিবাহের সিদ্ধান্ত নিন।',
            },
          ].map(({ icon: Icon, n, title, body }) => (
            <article
              key={n}
              className="p-6 rounded-3xl bg-[#16101c]/80 border border-[#2b1b30] hover:border-rose-900/60 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-900/50 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                  <Icon className="w-6 h-6 stroke-[1.7]" />
                </div>
                <span className="text-2xl font-black text-rose-500/40 group-hover:text-rose-500/70 transition-colors">
                  {n}
                </span>
              </div>
              <h3 className="text-base font-bold text-white pt-1">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─────────────────── LOCAL UPAZILAS SECTION ─────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-[#231728]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-rose-400 tracking-wider uppercase bg-rose-950/60 px-3 py-1 rounded-full border border-rose-900/50">
            নিজের এলাকার মানুষ
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            এক জেলা, বারোটি পরিচিত ঠিকানা
          </h2>
          <p className="text-xs sm:text-sm text-gray-400">
            আপনার পছন্দের উপজেলা বেছে নিন এবং সেই এলাকার নির্ভরযোগ্য বায়োডাটা দেখুন।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {TANGAIL_UPAZILAS.map((up, i) => (
            <Link
              key={up}
              to={'/search?upazila=' + up}
              className="p-3.5 rounded-2xl bg-[#16101c]/80 border border-[#2b1b30] hover:border-rose-600/60 hover:bg-[#201526] transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-black text-rose-500/60 group-hover:text-rose-400 transition-colors">
                  {(i + 1).toLocaleString('bn-BD', { minimumIntegerDigits: 2 })}
                </span>
                <span className="text-xs sm:text-sm font-bold text-gray-200 group-hover:text-white transition-colors">
                  {UPAZILA_DISPLAY_NAMES[up]}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─────────────────── INVITATION BANNER ─────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-linear-to-r from-[#201124] via-[#28132d] to-[#1d0e21] border border-rose-900/60 shadow-2xl shadow-rose-950/60 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 text-center md:text-left z-10">
            <span className="text-xs font-bold text-rose-400 tracking-wider uppercase bg-rose-950/70 px-3 py-1 rounded-full border border-rose-900/50 inline-block">
              আপনার গল্পের অপেক্ষায়
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              সুন্দর শুরুর প্রথম পদক্ষেপ নিন
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              আজই বিনামূল্যে আপনার বায়োডাটা তৈরি করুন এবং টাঙ্গাইলের মানুষের সঙ্গে দ্বীনি ও বিশ্বস্ত পরিচয়ের নতুন দরজা খুলুন।
            </p>
          </div>

          <Link
            to="/register"
            className="z-10 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-linear-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm shadow-xl shadow-rose-950/90 hover:scale-105 transition-all shrink-0 cursor-pointer"
          >
            <span>বিনামূল্যে বায়োডাটা তৈরি করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
