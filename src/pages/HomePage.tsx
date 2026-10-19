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
    <div className="min-h-screen bg-base text-ink">
      {/* ─────────────────── HERO ─────────────────── */}
      <section className="relative overflow-hidden pt-10 pb-20 lg:pt-16 lg:pb-28 border-b border-line">
        {/* ─ Light decorations ─ */}
        <div className="absolute inset-0 z-0 pointer-events-none dark:hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-[radial-gradient(1200px_500px_at_80%_-10%,theme(colors.pink.100/70%),transparent),radial-gradient(800px_400px_at_5%_20%,var(--mb-brand-soft),transparent)]" />
          <div className="absolute -top-20 -left-16 w-96 h-96 text-brand/10">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M100 0 C60 40 40 80 40 140 L40 200 L160 200 L160 140 C160 80 140 40 100 0 Z" />
              <circle cx="100" cy="140" r="32" />
            </svg>
          </div>
          <div className="absolute -bottom-24 right-0 w-80 h-80 text-pink-300/25 rotate-12">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M100 0 C60 40 40 80 40 140 L40 200 L160 200 L160 140 C160 80 140 40 100 0 Z" />
            </svg>
          </div>
        </div>

        {/* ─ Dark: atmospheric mosque photo ─ */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden hidden dark:block" aria-hidden="true">
          <img
            src="/hero-mosque-bg.jpg"
            alt=""
            className="w-full h-full object-cover object-center opacity-30 filter contrast-125 brightness-95"
          />
          <div className="absolute inset-0 bg-radial-[ellipse_at_center] from-[#1c1022]/40 via-[#110a15]/85 to-[var(--mb-base)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--mb-base)] via-[var(--mb-base)]/75 to-[var(--mb-base)]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--mb-base)] via-transparent to-[var(--mb-base)]/70" />
          <div className="absolute -top-10 -left-10 w-96 h-96 opacity-10 text-brand pointer-events-none">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M100 0 C60 40 40 80 40 140 L40 200 L160 200 L160 140 C160 80 140 40 100 0 Z" />
              <circle cx="100" cy="140" r="32" />
            </svg>
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-soft border border-brand/25 text-brand-ink text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span>টাঙ্গাইল জেলার জন্য বিশেষভাবে</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.3] tracking-tight text-ink">
                একই শিকড়ের টানে,<br />
                শুরু হোক <span className="text-brand">নতুন গল্প</span>{' '}
                <span className="text-pink-500 font-normal align-middle">♡</span>
              </h1>

              <p className="text-ink-2 text-sm sm:text-base leading-relaxed max-w-xl">
                পরিবার, সংস্কৃতি, মূল্যবোধ এবং টাঙ্গাইলের মানুষের জন্য নিরাপদ, বিশ্বাসযোগ্য ও সম্মানজনক একটি ম্যাট্রিমনিয়াল প্ল্যাটফর্ম।
              </p>

              {/* Feature badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                {[
                  { icon: ShieldCheck, t: 'নিরাপদ ও', s: 'গোপনীয়তা রক্ষা' },
                  { icon: Users, t: 'বাস্তব ও', s: 'বিশ্বস্ত সদস্য' },
                  { icon: MapPin, t: 'শুধু টাঙ্গাইল', s: 'জেলার জন্য' },
                ].map(({ icon: Icon, t, s }) => (
                  <div key={t + s} className="flex items-center gap-3 p-2.5 rounded-2xl bg-card/70 backdrop-blur-xs border border-line">
                    <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand/20 flex items-center justify-center text-brand shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left leading-tight">
                      <div className="text-xs font-bold text-ink">{t}</div>
                      <div className="text-[11px] text-ink-3">{s}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link to="/search" className="mb-btn-primary px-7 py-3.5">
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>বায়োডাটা খুঁজুন</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="mb-btn-secondary px-5 py-3.5"
                >
                  <Play className="w-4 h-4 text-brand fill-brand/30" />
                  <span>কিভাবে কাজ করে?</span>
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-ink-3 pt-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-brand/80 shrink-0" />
                <span>আপনার তথ্য সর্বদা নিরাপদ ও গোপন রাখা হয়</span>
              </div>
            </div>

            {/* Search card */}
            <div className="lg:col-span-5">
              <div className="bg-card/95 backdrop-blur-md rounded-[1.75rem] p-6 sm:p-7 border border-line shadow-[var(--mb-shadow-pop)] relative">
                <span className="absolute -top-3 right-8 h-6 w-14 rounded-full bg-linear-to-r from-brand to-pink-500 opacity-90 blur-md" aria-hidden="true" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft border border-brand/20 text-brand-ink text-[11px] font-bold mb-3">
                  <Heart className="w-3.5 h-3.5 text-brand fill-brand" />
                  <span>হাজারো সুন্দর পরিচয়ের প্রথম ধাপ</span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
                      আপনার জীবনসঙ্গী খুঁজছেন?
                    </h2>
                    <p className="text-xs text-ink-3 mt-1 leading-relaxed">
                      সহজ কিছু তথ্য দিন, পেয়ে যান আপনার সম্ভাব্য জীবনসঙ্গী
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-brand-soft border border-brand/25 text-brand flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                  {/* Gender selector */}
                  <div>
                    <label className="mb-label">আমি খুঁজছি</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {([
                        { value: 'female', icon: UserRound, label: 'পাত্রীর বায়োডাটা' },
                        { value: 'male', icon: User, label: 'পাত্রের বায়োডাটা' },
                      ] as const).map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setGender(value)}
                          className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            gender === value
                              ? 'bg-linear-to-r from-brand to-pink-500 text-white border-transparent shadow-md shadow-brand/30'
                              : 'bg-elev text-ink-2 border-line hover:border-strongline hover:text-ink'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upazila */}
                  <div>
                    <label className="mb-label">উপজেলা নির্বাচন করুন</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select value={upazila} onChange={(e) => setUpazila(e.target.value)} className="mb-input pl-10">
                        <option value="">টাঙ্গাইলের সকল উপজেলা</option>
                        {TANGAIL_UPAZILAS.map((up) => (
                          <option key={up} value={up}>{UPAZILA_DISPLAY_NAMES[up]}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-ink-3 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Marital status */}
                  <div>
                    <label className="mb-label">বৈবাহিক অবস্থা</label>
                    <div className="relative">
                      <Heart className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="mb-input pl-10">
                        <option value="">সকল অবস্থা</option>
                        <option value="never_married">অবিবাহিত</option>
                        <option value="divorced">বিবাহবিচ্ছেদ হয়েছে</option>
                        <option value="widowed">বিধবা / বিপত্নীক</option>
                        <option value="separated">পৃথক বসবাস</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-ink-3 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Age range */}
                  <div>
                    <label className="mb-label">বয়স সীমা (ঐচ্ছিক)</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select value={minAge} onChange={(e) => setMinAge(e.target.value)} className="mb-input pl-8 !py-2 !text-xs">
                          <option value="">সর্বনিম্ন বয়স</option>
                          {[18, 20, 22, 24, 26, 28, 30, 32, 35, 40].map((a) => (
                            <option key={a} value={a}>{toBanglaNumber(a)} বছর</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-ink-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select value={maxAge} onChange={(e) => setMaxAge(e.target.value)} className="mb-input pl-8 !py-2 !text-xs">
                          <option value="">সর্বোচ্চ বয়স</option>
                          {[22, 25, 28, 30, 32, 35, 38, 40, 45, 50, 60].map((a) => (
                            <option key={a} value={a}>{toBanglaNumber(a)} বছর</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-ink-3 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="mb-btn-primary w-full mt-1 py-3.5">
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>বায়োডাটা খুঁজুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <Link
                  to="/search"
                  className="flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-strong font-bold mt-4 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>বিস্তারিত ফিল্টার দিয়ে খুঁজুন</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-card/85 backdrop-blur-md border border-line rounded-3xl p-5 sm:p-6 mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 shadow-[var(--mb-shadow-card)]">
            {[
              { icon: Users, v: '৫,০০০+', l: 'নিবন্ধিত সদস্য' },
              { icon: Heart, v: '৩৫০+', l: 'সফল পরিচয়', fill: true },
              { icon: MapPin, v: '১২টি', l: 'টাঙ্গাইল উপজেলা', fill: true },
              { icon: ShieldCheck, v: '১০০%', l: 'নিরাপত্তা ও গোপনীয়তা' },
            ].map(({ icon: Icon, v, l, fill }) => (
              <div key={l} className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-brand-soft border border-brand/20 text-brand flex items-center justify-center shrink-0">
                  <Icon className={`w-5 h-5 ${fill ? 'fill-brand/15' : ''}`} />
                </div>
                <div className="text-left leading-tight">
                  <div className="text-xl font-bold text-ink tracking-tight">{v}</div>
                  <div className="text-xs text-ink-3">{l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─ Public stats (from live DB) ─ */}
      <div className="border-b border-line">
        <PublicStatistics />
      </div>

      {/* ─ Principles ─ */}
      <section className="py-16 border-b border-line max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="আমাদের অঙ্গীকার">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: MapPin, title: 'কাছের মানুষ, পরিচিত পরিবেশ', description: 'টাঙ্গাইলের ১২ উপজেলাকে ঘিরে জীবনসঙ্গীর সন্ধান।' },
            { icon: ShieldCheck, title: 'গোপনীয়তায় আপনার নিয়ন্ত্রণ', description: 'অনুমতি অনুযায়ী অভিভাবকের সঙ্গে যোগাযোগ ও সর্বোচ্চ নিরাপত্তা।' },
            { icon: FileCheck2, title: 'পর্যালোচনার পর প্রকাশ', description: 'জমা দেওয়া প্রতিটি বায়োডাটা যাচাই ও নিরীক্ষা করেন মডারেটর।' },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="mb-card mb-card-hover flex items-start gap-4 p-5"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-soft border border-brand/20 flex items-center justify-center text-brand shrink-0">
                <Icon className="w-6 h-6 stroke-[1.7]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink mb-1">{title}</h3>
                <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─ How it works ─ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-line" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2.5">
          <span className="mb-badge">সহজ চারটি ধাপ</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-section-title">
            পরিচয় থেকে পরিণয়ের পথে
          </h2>
          <p className="text-xs sm:text-sm text-ink-2">
            নিজের তথ্য দিয়ে শুরু করুন। সময় নিয়ে জানুন, পরিবারের সঙ্গে আলোচনা করে সিদ্ধান্ত নিন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: UserRoundPlus, n: '০১', title: 'নিজের বায়োডাটা তৈরি', body: 'অ্যাকাউন্ট খুলে নিজের পরিচয়, পরিবার ও জীবনসঙ্গীর প্রত্যাশার তথ্য পূরণ করুন।' },
            { icon: Search, n: '০২', title: 'পছন্দ মিলিয়ে অনুসন্ধান', body: 'উপজেলা, বয়স, শিক্ষা ও পেশার ফিল্টারে উপযুক্ত বায়োডাটা সহজেই খুঁজুন।' },
            { icon: MessagesSquare, n: '০৩', title: 'পরিবারের সঙ্গে যোগাযোগ', body: 'আগ্রহ প্রকাশ করুন। উভয় পক্ষের সম্মতিতে অভিভাবকের সঙ্গে কথা এগিয়ে নিন।' },
            { icon: Handshake, n: '০৪', title: 'বিবাহের সুন্দর পরিণয়', body: 'তথ্য যাচাই ও পারিবারিক আলোচনার পর সম্মানজনকভাবে বিবাহের সিদ্ধান্ত নিন।' },
          ].map(({ icon: Icon, n, title, body }) => (
            <article key={n} className="mb-card mb-card-hover p-6 space-y-3 relative group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand to-pink-500 text-white flex items-center justify-center shadow-md shadow-brand/25 group-hover:scale-105 group-hover:-rotate-3 transition-transform">
                  <Icon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <span className="text-3xl font-bold text-brand/15 group-hover:text-brand/35 transition-colors select-none">
                  {n}
                </span>
              </div>
              <h3 className="text-base font-bold text-ink pt-1">{title}</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─ Upazilas ─ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-line">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
          <span className="mb-badge">নিজের এলাকার মানুষ</span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-section-title">
            এক জেলা, বারোটি পরিচিত ঠিকানা
          </h2>
          <p className="text-xs sm:text-sm text-ink-2">
            আপনার পছন্দের উপজেলা বেছে নিন এবং সেই এলাকার নির্ভরযোগ্য বায়োডাটা দেখুন।
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {TANGAIL_UPAZILAS.map((up, i) => (
            <Link
              key={up}
              to={'/search?upazila=' + up}
              className="p-3.5 rounded-2xl bg-card border border-line hover:border-brand/50 hover:shadow-[var(--mb-shadow-card)] hover:-translate-y-0.5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-[11px] font-bold text-brand/60 group-hover:text-brand transition-colors">
                  {(i + 1).toLocaleString('bn-BD', { minimumIntegerDigits: 2 })}
                </span>
                <span className="text-xs sm:text-sm font-bold text-ink-2 group-hover:text-ink transition-colors">
                  {UPAZILA_DISPLAY_NAMES[up]}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-ink-3 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─ CTA banner ─ */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-14 rounded-[2rem] bg-linear-to-br from-brand via-rose-600 to-pink-600 text-white shadow-2xl shadow-brand/30 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* decorative pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" aria-hidden="true">
            <defs>
              <pattern id="mb-arch" width="40" height="80" patternUnits="userSpaceOnUse">
                <path d="M20 10 C10 22 6 34 6 52 L6 78 L34 78 L34 52 C34 34 30 22 20 10 Z" fill="none" stroke="white" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mb-arch)" />
          </svg>

          <div className="space-y-3 text-center md:text-left z-10">
            <span className="inline-block text-xs font-bold text-white/90 tracking-wider bg-white/15 px-3 py-1 rounded-full border border-white/25 backdrop-blur-xs">
              আপনার গল্পের অপেক্ষায়
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              সুন্দর শুরুর প্রথম পদক্ষেপ নিন
            </h2>
            <p className="text-xs sm:text-sm text-white/85 max-w-xl">
              আজই বিনামূল্যে আপনার বায়োডাটা তৈরি করুন এবং টাঙ্গাইলের মানুষের সঙ্গে দ্বীনি ও বিশ্বস্ত পরিচয়ের নতুন দরজা খুলুন।
            </p>
          </div>

          <Link
            to="/register"
            className="z-10 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-brand font-bold text-base shadow-xl hover:scale-105 hover:shadow-2xl transition-all shrink-0 cursor-pointer"
          >
            <span>বিনামূল্যে বায়োডাটা তৈরি করুন</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
