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
import { TANGAIL_UPAZILAS, getUpazilaDisplayName } from '../constants/locations';
import { useLanguage } from '../i18n/LanguageContext';
import PublicStatistics from '../components/profile/PublicStatistics';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isBengali, formatNumber } = useLanguage();
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
      <section className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-20 lg:pt-16 lg:pb-28 border-b border-line">
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
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left column */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-brand-soft border border-brand/25 text-brand-ink text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                <span>{isBengali ? 'টাঙ্গাইল জেলার জন্য বিশেষভাবে' : 'Exclusively for Tangail District'}</span>
              </div>

              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold leading-tight sm:leading-[1.3] tracking-tight text-ink">
                {isBengali ? (
                  <>
                    একই শিকড়ের টানে,<br className="hidden sm:inline" />{' '}
                    শুরু হোক <span className="text-brand">নতুন গল্প</span>{' '}
                    <span className="text-pink-500 font-normal align-middle">♡</span>
                  </>
                ) : (
                  <>
                    Bound by Shared Roots,<br className="hidden sm:inline" />{' '}
                    Begin Your <span className="text-brand">New Chapter</span>{' '}
                    <span className="text-pink-500 font-normal align-middle">♡</span>
                  </>
                )}
              </h1>

              <p className="text-ink-2 text-xs sm:text-base leading-relaxed max-w-xl">
                {isBengali
                  ? 'পরিবার, সংস্কৃতি, মূল্যবোধ এবং টাঙ্গাইলের মানুষের জন্য নিরাপদ, বিশ্বাসযোগ্য ও সম্মানজনক একটি ম্যাট্রিমনিয়াল প্ল্যাটফর্ম।'
                  : 'A safe, trusted, and dignified matrimonial platform tailored to the culture, values, and people of Tangail.'}
              </p>

              {/* Feature badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                {[
                  {
                    icon: ShieldCheck,
                    t: isBengali ? 'নিরাপদ ও' : 'Safe &',
                    s: isBengali ? 'গোপনীয়তা রক্ষা' : 'Privacy Protected',
                  },
                  {
                    icon: Users,
                    t: isBengali ? 'বাস্তব ও' : 'Genuine &',
                    s: isBengali ? 'বিশ্বস্ত সদস্য' : 'Verified Profiles',
                  },
                  {
                    icon: MapPin,
                    t: isBengali ? 'শুধু টাঙ্গাইল' : 'Exclusively for',
                    s: isBengali ? 'জেলার জন্য' : 'Tangail District',
                  },
                ].map(({ icon: Icon, t, s }) => (
                  <div key={t + s} className="flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-2xl bg-card/70 backdrop-blur-xs border border-line">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-soft border border-brand/20 flex items-center justify-center text-brand shrink-0">
                      <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                    </div>
                    <div className="text-left leading-tight">
                      <div className="text-xs font-bold text-ink">{t}</div>
                      <div className="text-[11px] text-ink-3">{s}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
                <Link to="/search" className="mb-btn-primary w-full sm:w-auto px-7 py-3 sm:py-3.5 text-center justify-center">
                  <Search className="w-4 h-4 stroke-[2.5]" />
                  <span>{isBengali ? 'বায়োডাটা খুঁজুন' : 'Find Biodata'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href="#how-it-works"
                  className="mb-btn-secondary w-full sm:w-auto px-5 py-3 sm:py-3.5 text-center justify-center"
                >
                  <Play className="w-4 h-4 text-brand fill-brand/30" />
                  <span>{isBengali ? 'কিভাবে কাজ করে?' : 'How It Works'}</span>
                </a>
              </div>

              <div className="flex items-center gap-2 text-xs text-ink-3 pt-1 font-medium">
                <Lock className="w-3.5 h-3.5 text-brand/80 shrink-0" />
                <span>{isBengali ? 'আপনার তথ্য সর্বদা নিরাপদ ও গোপন রাখা হয়' : 'Your information is always protected and confidential'}</span>
              </div>
            </div>

            {/* Search card */}
            <div className="lg:col-span-5">
              <div className="bg-card/95 backdrop-blur-md rounded-2xl sm:rounded-[1.75rem] p-4 sm:p-7 border border-line shadow-[var(--mb-shadow-pop)] relative">
                <span className="absolute -top-3 right-8 h-6 w-14 rounded-full bg-linear-to-r from-brand to-pink-500 opacity-90 blur-md" aria-hidden="true" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft border border-brand/20 text-brand-ink text-[11px] font-bold mb-3">
                  <Heart className="w-3.5 h-3.5 text-brand fill-brand" />
                  <span>{isBengali ? 'হাজারো সুন্দর পরিচয়ের প্রথম ধাপ' : 'First Step to a Meaningful Connection'}</span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-ink tracking-tight">
                      {isBengali ? 'আপনার জীবনসঙ্গী খুঁজছেন?' : 'Looking for a Life Partner?'}
                    </h2>
                    <p className="text-xs text-ink-3 mt-1 leading-relaxed">
                      {isBengali ? 'সহজ কিছু তথ্য দিন, পেয়ে যান আপনার সম্ভাব্য জীবনসঙ্গী' : 'Provide basic criteria to explore compatible matches'}
                    </p>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-soft border border-brand/25 text-brand flex items-center justify-center shrink-0">
                    <Search className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </div>

                <form onSubmit={handleSearch} className="space-y-3.5 sm:space-y-4">
                  {/* Gender selector */}
                  <div>
                    <label className="mb-label">{isBengali ? 'আমি খুঁজছি' : 'Looking For'}</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      {([
                        { value: 'female', icon: UserRound, label: isBengali ? 'পাত্রীর বায়োডাটা' : "Bride's Biodata" },
                        { value: 'male', icon: User, label: isBengali ? 'পাত্রের বায়োডাটা' : "Groom's Biodata" },
                      ] as const).map(({ value, icon: Icon, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setGender(value)}
                          className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            gender === value
                              ? 'bg-linear-to-r from-brand to-pink-500 text-white border-transparent shadow-md shadow-brand/30'
                              : 'bg-elev text-ink-2 border-line hover:border-strongline hover:text-ink'
                          }`}
                        >
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upazila */}
                  <div>
                    <label className="mb-label">{isBengali ? 'উপজেলা নির্বাচন করুন' : 'Select Upazila'}</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select value={upazila} onChange={(e) => setUpazila(e.target.value)} className="mb-input pl-10 text-xs sm:text-sm">
                        <option value="">{isBengali ? 'টাঙ্গাইলের সকল উপজেলা' : 'All Upazilas in Tangail'}</option>
                        {TANGAIL_UPAZILAS.map((up) => (
                          <option key={up} value={up}>{getUpazilaDisplayName(up, isBengali)}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-ink-3 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Marital status */}
                  <div>
                    <label className="mb-label">{isBengali ? 'বৈবাহিক অবস্থা' : 'Marital Status'}</label>
                    <div className="relative">
                      <Heart className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="mb-input pl-10 text-xs sm:text-sm">
                        <option value="">{isBengali ? 'সকল অবস্থা' : 'All Statuses'}</option>
                        <option value="never_married">{isBengali ? 'অবিবাহিত' : 'Never Married'}</option>
                        <option value="divorced">{isBengali ? 'বিবাহবিচ্ছেদ হয়েছে' : 'Divorced'}</option>
                        <option value="widowed">{isBengali ? 'বিধবা / বিপত্নীক' : 'Widowed'}</option>
                        <option value="separated">{isBengali ? 'পৃথক বসবাস' : 'Separated'}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-ink-3 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Age range */}
                  <div>
                    <label className="mb-label">{isBengali ? 'বয়স সীমা (ঐচ্ছিক)' : 'Age Range (Optional)'}</label>
                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select value={minAge} onChange={(e) => setMinAge(e.target.value)} className="mb-input pl-7 sm:pl-8 !py-2 !text-xs">
                          <option value="">{isBengali ? 'সর্বনিম্ন বয়স' : 'Min Age'}</option>
                          {[18, 20, 22, 24, 26, 28, 30, 32, 35, 40].map((a) => (
                            <option key={a} value={a}>{formatNumber(a)} {isBengali ? 'বছর' : 'yrs'}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-ink-3 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      <div className="relative">
                        <Calendar className="w-3.5 h-3.5 text-ink-3 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select value={maxAge} onChange={(e) => setMaxAge(e.target.value)} className="mb-input pl-7 sm:pl-8 !py-2 !text-xs">
                          <option value="">{isBengali ? 'সর্বোচ্চ বয়স' : 'Max Age'}</option>
                          {[22, 25, 28, 30, 32, 35, 38, 40, 45, 50, 60].map((a) => (
                            <option key={a} value={a}>{formatNumber(a)} {isBengali ? 'বছর' : 'yrs'}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-ink-3 absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="mb-btn-primary w-full mt-1 py-3 sm:py-3.5">
                    <Search className="w-4 h-4 stroke-[2.5]" />
                    <span>{isBengali ? 'বায়োডাটা খুঁজুন' : 'Search Biodata'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                <Link
                  to="/search"
                  className="flex items-center justify-center gap-1.5 text-xs text-brand hover:text-brand-strong font-bold mt-4 transition-colors"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>{isBengali ? 'বিস্তারিত ফিল্টার দিয়ে খুঁজুন' : 'Search with Advanced Filters'}</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="bg-card/85 backdrop-blur-md border border-line rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 mt-8 sm:mt-14 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 shadow-[var(--mb-shadow-card)]">
            {[
              { icon: Users, v: formatNumber('5000') + '+', l: isBengali ? 'নিবন্ধিত সদস্য' : 'Registered Members' },
              { icon: Heart, v: formatNumber('350') + '+', l: isBengali ? 'সফল পরিচয়' : 'Successful Matches', fill: true },
              { icon: MapPin, v: formatNumber('12') + (isBengali ? 'টি' : ''), l: isBengali ? 'টাঙ্গাইল উপজেলা' : 'Tangail Upazilas', fill: true },
              { icon: ShieldCheck, v: '100%', l: isBengali ? 'নিরাপত্তা ও গোপনীয়তা' : 'Privacy & Security' },
            ].map(({ icon: Icon, v, l, fill }) => (
              <div key={l} className="flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-3.5 p-2 rounded-xl">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-brand-soft border border-brand/20 text-brand flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${fill ? 'fill-brand/15' : ''}`} />
                </div>
                <div className="leading-tight">
                  <div className="text-base sm:text-xl font-bold text-ink tracking-tight">{v}</div>
                  <div className="text-[10px] sm:text-xs text-ink-3 mt-0.5">{l}</div>
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
      <section className="py-10 sm:py-16 border-b border-line max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label={isBengali ? "আমাদের অঙ্গীকার" : "Our Principles"}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-6 items-stretch">
          {[
            {
              icon: MapPin,
              title: isBengali ? 'কাছের মানুষ, পরিচিত পরিবেশ' : 'Familiar Roots & Community',
              description: isBengali
                ? 'টাঙ্গাইলের ১২ উপজেলাকে ঘিরে জীবনসঙ্গীর সন্ধান।'
                : 'Connect with life partners rooted in Tangail’s 12 upazilas.',
            },
            {
              icon: ShieldCheck,
              title: isBengali ? 'গোপনীয়তায় আপনার নিয়ন্ত্রণ' : 'Privacy in Your Control',
              description: isBengali
                ? 'অনুমতি অনুযায়ী অভিভাবকের সঙ্গে যোগাযোগ ও সর্বোচ্চ নিরাপত্তা।'
                : 'Direct communication via lawful guardians with strict confidentiality.',
            },
            {
              icon: FileCheck2,
              title: isBengali ? 'পর্যালোচনার পর প্রকাশ' : 'Moderator Verified Profiles',
              description: isBengali
                ? 'জমা দেওয়া প্রতিটি বায়োডাটা যাচাই ও নিরীক্ষা করেন মডারেটর।'
                : 'Every submitted profile is reviewed and vetted by moderators before release.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="mb-card mb-card-hover flex items-start gap-3 sm:gap-4 p-3.5 sm:p-5 lg:p-6 rounded-2xl h-full transition-all"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-brand-soft border border-brand/20 flex items-center justify-center text-brand shrink-0 shadow-xs">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.7]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm sm:text-base font-bold text-ink mb-1 sm:mb-1.5 leading-snug">{title}</h3>
                <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─ How it works ─ */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-line" id="how-it-works">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-14 space-y-2">
          <span className="mb-badge">{isBengali ? 'সহজ চারটি ধাপ' : 'Four Simple Steps'}</span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-section-title">
            {isBengali ? 'পরিচয় থেকে পরিণয়ের পথে' : 'From Introduction to Blessed Union'}
          </h2>
          <p className="text-xs sm:text-sm text-ink-2">
            {isBengali
              ? 'নিজের তথ্য দিয়ে শুরু করুন। সময় নিয়ে জানুন, পরিবারের সঙ্গে আলোচনা করে সিদ্ধান্ত নিন।'
              : 'Begin by creating your biodata. Explore respectfully, involve family, and make blessed decisions.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            {
              icon: UserRoundPlus,
              n: formatNumber('01'),
              title: isBengali ? 'নিজের বায়োডাটা তৈরি' : 'Create Biodata',
              body: isBengali
                ? 'অ্যাকাউন্ট খুলে নিজের পরিচয়, পরিবার ও জীবনসঙ্গীর প্রত্যাশার তথ্য পূরণ করুন।'
                : 'Register an account and fill in details about yourself, family, and partner expectations.',
            },
            {
              icon: Search,
              n: formatNumber('02'),
              title: isBengali ? 'পছন্দ মিলিয়ে অনুসন্ধান' : 'Search & Filter',
              body: isBengali
                ? 'উপজেলা, বয়স, শিক্ষা ও পেশার ফিল্টারে উপযুক্ত বায়োডাটা সহজেই খুঁজুন।'
                : 'Easily filter candidate profiles by upazila, age, education, and profession.',
            },
            {
              icon: MessagesSquare,
              n: formatNumber('03'),
              title: isBengali ? 'পরিবারের সঙ্গে যোগাযোগ' : 'Guardian Communication',
              body: isBengali
                ? 'আগ্রহ প্রকাশ করুন। উভয় পক্ষের সম্মতিতে অভিভাবকের সঙ্গে কথা এগিয়ে নিন।'
                : 'Send interest. Upon mutual agreement, proceed with family and guardian conversations.',
            },
            {
              icon: Handshake,
              n: formatNumber('04'),
              title: isBengali ? 'বিবাহের সুন্দর পরিণয়' : 'Blessed Marriage',
              body: isBengali
                ? 'তথ্য যাচাই ও পারিবারিক আলোচনার পর সম্মানজনকভাবে বিবাহের সিদ্ধান্ত নিন।'
                : 'Verify background details with family elders and conclude in a dignified union.',
            },
          ].map(({ icon: Icon, n, title, body }) => (
            <article key={n} className="mb-card mb-card-hover p-4 sm:p-6 rounded-2xl space-y-2.5 sm:space-y-3 relative group">
              <div className="flex items-center justify-between">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-linear-to-br from-brand to-pink-500 text-white flex items-center justify-center shadow-md shadow-brand/25 group-hover:scale-105 group-hover:-rotate-3 transition-transform">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
                </div>
                <span className="text-2xl sm:text-3xl font-bold text-brand/15 group-hover:text-brand/35 transition-colors select-none">
                  {n}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-ink pt-1">{title}</h3>
              <p className="text-xs sm:text-sm text-ink-2 leading-relaxed">{body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ─ Upazilas ─ */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-line">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
          <span className="mb-badge">{isBengali ? 'নিজের এলাকার মানুষ' : 'Tangail Upazilas'}</span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-section-title">
            {isBengali ? 'এক জেলা, বারোটি পরিচিত ঠিকানা' : 'One District, 12 Familiar Hometowns'}
          </h2>
          <p className="text-xs sm:text-sm text-ink-2">
            {isBengali
              ? 'আপনার পছন্দের উপজেলা বেছে নিন এবং সেই এলাকার নির্ভরযোগ্য বায়োডাটা দেখুন।'
              : 'Choose your desired upazila to explore authentic matrimonial profiles from that locality.'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
          {TANGAIL_UPAZILAS.map((up, i) => (
            <Link
              key={up}
              to={'/search?upazila=' + up}
              className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-card border border-line hover:border-brand/50 hover:shadow-[var(--mb-shadow-card)] hover:-translate-y-0.5 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-brand/60 group-hover:text-brand transition-colors shrink-0">
                  {formatNumber((i + 1).toString().padStart(2, '0'))}
                </span>
                <span className="text-xs sm:text-sm font-bold text-ink-2 group-hover:text-ink transition-colors truncate">
                  {getUpazilaDisplayName(up, isBengali)}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-ink-3 group-hover:text-brand group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─ CTA banner ─ */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-14 rounded-2xl sm:rounded-[2rem] bg-linear-to-br from-brand via-rose-600 to-pink-600 text-white shadow-xl sm:shadow-2xl shadow-brand/30 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 relative overflow-hidden">
          {/* decorative pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" aria-hidden="true">
            <defs>
              <pattern id="mb-arch" width="40" height="80" patternUnits="userSpaceOnUse">
                <path d="M20 10 C10 22 6 34 6 52 L6 78 L34 78 L34 52 C34 34 30 22 20 10 Z" fill="none" stroke="white" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#mb-arch)" />
          </svg>

          <div className="space-y-2.5 sm:space-y-3 text-center md:text-left z-10">
            <span className="inline-block text-xs font-bold text-white/90 bg-white/15 px-3 py-1 rounded-full border border-white/25 backdrop-blur-xs">
              {isBengali ? 'আপনার গল্পের অপেক্ষায়' : 'Your Story Awaits'}
            </span>
            <h2 className="text-xl sm:text-3xl font-bold text-white">
              {isBengali ? 'সুন্দর শুরুর প্রথম পদক্ষেপ নিন' : 'Take the First Step to a Blessed Union'}
            </h2>
            <p className="text-xs sm:text-sm text-white/85 max-w-xl">
              {isBengali
                ? 'আজই বিনামূল্যে আপনার বায়োডাটা তৈরি করুন এবং টাঙ্গাইলের মানুষের সঙ্গে দ্বীনি ও বিশ্বস্ত পরিচয়ের নতুন দরজা খুলুন।'
                : 'Create your free biodata today and open the door to genuine matrimonial introductions across Tangail.'}
            </p>
          </div>

          <Link
            to="/register"
            className="z-10 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl bg-white text-brand font-bold text-sm sm:text-base shadow-xl hover:scale-105 hover:shadow-2xl transition-all shrink-0 cursor-pointer"
          >
            <span>{isBengali ? 'বিনামূল্যে বায়োডাটা তৈরি করুন' : 'Create Free Biodata'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
