import SaveSearchControl from '../components/profile/SaveSearchControl';
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, RotateCcw, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, EyeOff, Home } from 'lucide-react';
import { TANGAIL_UPAZILAS, getUpazilaDisplayName } from '../constants/locations';
import { searchDemoProfiles } from '../data/demoProfiles';
import { profilesApi } from '../api/profiles.api';
import { Gender, MaritalStatus, EducationLevel, Profile } from '../types';
import ProfileCard from '../components/profile/ProfileCard';
import SendInterestModal from '../components/profile/SendInterestModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/useAuth';
import { adminApi } from '../api/admin.api';
import { useLanguage } from '../i18n/LanguageContext';

export const SearchPage: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const [params] = useSearchParams();
  return <SearchPageContent key={params.toString()} demo={demo} />;
};

const SearchPageContent: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isBengali, formatNumber } = useLanguage();

  // Local filter states initialized from URL params
  const [biodataId, setBiodataId] = useState<string>(searchParams.get('biodataId') || '');
  const [query, setQuery] = useState<string>(searchParams.get('query') || '');
  const [gender, setGender] = useState<string>(searchParams.get('gender') || '');
  const [upazila, setUpazila] = useState<string>(searchParams.get('upazila') || '');
  const [minAge, setMinAge] = useState<string>(searchParams.get('minAge') || '18');
  const [maxAge, setMaxAge] = useState<string>(searchParams.get('maxAge') || '60');
  const [maritalStatus, setMaritalStatus] = useState<string>(searchParams.get('maritalStatus') || '');
  const [education, setEducation] = useState<string>(searchParams.get('education') || '');
  const [occupation, setOccupation] = useState(searchParams.get('occupation') || '');
  const [minHeight, setMinHeight] = useState<string>(searchParams.get('minHeight') || '');
  const [maxHeight, setMaxHeight] = useState<string>(searchParams.get('maxHeight') || '');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(searchParams.get('verifiedOnly') === 'true');
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const hasAdvancedParam = Boolean(
    searchParams.get('minHeight') || searchParams.get('maxHeight') || searchParams.get('verifiedOnly') ||
    searchParams.get('education') || searchParams.get('occupation') || searchParams.get('maritalStatus') ||
    (searchParams.get('minAge') && searchParams.get('minAge') !== '18') ||
    (searchParams.get('maxAge') && searchParams.get('maxAge') !== '60'),
  );
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(hasAdvancedParam);

  const advancedFilterCount = [
    maritalStatus,
    education,
    occupation.trim(),
    minHeight,
    maxHeight,
    verifiedOnly ? 'true' : '',
    minAge !== '18' ? minAge : '',
    maxAge !== '60' ? maxAge : '',
  ].filter(Boolean).length;

  const activeFilterCount = [biodataId, gender, upazila].filter(Boolean).length + (advancedFilterCount > 0 ? 1 : 0);

  // Selected profile for sending interest modal
  const [selectedProfileForInterest, setSelectedProfileForInterest] = useState<Profile | null>(null);

  // Public platform settings check
  const { data: publicSettingsData } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => adminApi.getPublicSettings(),
    staleTime: 1000 * 10,
    refetchOnWindowFocus: true,
  });
  const isDemoEnabled =
    publicSettingsData?.data?.settings?.showDemoProfiles !== undefined
      ? publicSettingsData.data.settings.showDemoProfiles !== false
      : localStorage.getItem('mb_show_demo_profiles') !== 'false';

  // Query API
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [
      'search-profiles',
      demo,
      isDemoEnabled,
      user?.id || user?._id || 'guest',
      biodataId,
      query,
      gender,
      upazila,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      verifiedOnly,
      maritalStatus,
      education,
      occupation,
      page,
    ],
    queryFn: async () => {
      const searchParams = {
        biodataId: biodataId.trim() || undefined,
        query: query.trim() || undefined,
        gender: (gender as Gender) || undefined,
        upazila: upazila || undefined,
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
        minHeight: minHeight ? Number(minHeight) : undefined,
        maxHeight: maxHeight ? Number(maxHeight) : undefined,
        verifiedOnly: verifiedOnly || undefined,
        maritalStatus: (maritalStatus as MaritalStatus) || undefined,
        education: (education as EducationLevel) || undefined,
        occupation: occupation.trim() || undefined,
        page,
        limit: 9,
      };

      if (demo) {
        return searchDemoProfiles(searchParams);
      }

      // 1. Fetch real profiles from server
      const realRes = await profilesApi.searchProfiles(searchParams);

      // 2. If Demo Data Control is enabled, blend demo profiles matching filter
      if (isDemoEnabled) {
        const realProfiles: Profile[] = realRes?.data?.profiles || [];
        const realTotal: number = realRes?.meta?.total ?? realProfiles.length;

        // Fetch all matching demo profiles (unlimited limit to calculate combined pagination correctly)
        const demoRes = searchDemoProfiles({ ...searchParams, limit: 50, page: 1 });
        const demoMatches: Profile[] = demoRes?.data?.profiles || [];

        // Exclude duplicates if real profiles have matching ID
        const realIds = new Set(
          realProfiles
            .map((p) => p.biodataId || p._id)
            .filter((id): id is string => Boolean(id))
        );
        const nonConflictingDemos = demoMatches.filter(
          (dp) => !(dp.biodataId && realIds.has(dp.biodataId)) && !realIds.has(dp._id)
        );

        const combined = [...realProfiles, ...nonConflictingDemos];
        const limit = 9;
        const total = realTotal + nonConflictingDemos.length;
        const totalPages = Math.max(1, Math.ceil(total / limit));
        const paged = combined.slice((page - 1) * limit, page * limit);

        return {
          ...realRes,
          data: {
            profiles: paged,
          },
          meta: {
            page,
            limit,
            total,
            totalPages,
          },
        };
      }

      return realRes;
    },
    enabled: !demo || isDemoEnabled,
  });

  const handleApplyFilter = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMobileFiltersOpen(false);
    const params = new URLSearchParams();
    if (biodataId.trim()) params.set('biodataId', biodataId.trim().toUpperCase());
    if (query.trim()) params.set('query', query.trim());
    if (gender) params.set('gender', gender);
    if (upazila) params.set('upazila', upazila);
    if (minAge) params.set('minAge', minAge);
    if (maxAge) params.set('maxAge', maxAge);
    if (maritalStatus) params.set('maritalStatus', maritalStatus);
    if (education) params.set('education', education);
    if (occupation.trim()) params.set('occupation', occupation.trim());
    if (minHeight) params.set('minHeight', minHeight);
    if (maxHeight) params.set('maxHeight', maxHeight);
    if (verifiedOnly) params.set('verifiedOnly', 'true');
    params.set('page', '1');
    setPage(1);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setBiodataId('');
    setQuery('');
    setGender('');
    setUpazila('');
    setMinAge('18');
    setMaxAge('60');
    setMinHeight('');
    setMaxHeight('');
    setVerifiedOnly(false);
    setMaritalStatus('');
    setEducation('');
    setOccupation('');
    setPage(1);
    setAdvancedOpen(false);
    setSearchParams(new URLSearchParams());
    setMobileFiltersOpen(false);
  };

  const profiles = data?.data?.profiles || [];
  const meta = data?.meta || { total: profiles.length, totalPages: 1, page: 1, limit: 9 };

  if (demo && !isDemoEnabled) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="mb-card p-8 sm:p-12 space-y-6 border border-amber-500/20 bg-linear-to-b from-card to-amber-500/5 shadow-xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
            <EyeOff className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              নমুনা বায়োডাটা সাময়িক বন্ধ
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-ink">
              নমুনা বায়োডাটা প্রদর্শন নিষ্ক্রিয় রয়েছে
            </h2>
            <p className="text-xs sm:text-sm text-ink-3 max-w-md mx-auto leading-relaxed">
              ওয়েবসাইট অ্যাডমিনিস্ট্রেটর কর্তৃক কাল্পনিক নমুনা বায়োডাটা প্রদর্শন সাময়িকভাবে বন্ধ রাখা হয়েছে। আপনি বাস্তব ও ভেরিফায়েড বায়োডাটা অন্বেষণ করতে পারেন।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/search')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-brand text-white hover:bg-brand/90 shadow-md shadow-brand/20 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>আসল বায়োডাটা খুঁজুন</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-card hover:bg-card-hover border border-line text-ink transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>হোমপেজে ফিরে যান</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">
      {demo && (
        <div className="rounded-2xl bg-gold-soft border border-gold/25 p-4 text-sm text-gold">
          <strong>{isBengali ? 'নমুনা বায়োডাটা' : 'Sample Biodatas'}</strong> —{' '}
          {isBengali
            ? 'নিচের ১২টি প্রোফাইল কাল্পনিক। ফিল্টার ও বিস্তারিত পেজ ঘুরে দেখতে পারেন।'
            : 'The following 12 profiles are illustrative samples. Feel free to explore filters and details.'}
        </div>
      )}
      {!demo && import.meta.env.DEV && import.meta.env.VITE_LOCAL_DEV === 'true' && (
        <div className="rounded-2xl bg-gold-soft border border-gold/25 p-4 text-sm text-gold">
          {isBengali
            ? 'নিজের local database থেকে ফলাফল দেখানো হচ্ছে। Development-এর জন্য যোগ করা ১২টি sample বায়োডাটা কাল্পনিক।'
            : 'Showing results from local database. 12 sample biodatas added for development are fictional.'}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-line">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-brand-soft border border-brand/20 text-brand flex items-center justify-center">
              <Search className="w-5 h-5" />
            </span>
            <span>{isBengali ? 'বায়োডাটা অনুসন্ধান' : 'Find Biodata'}</span>
          </h1>
          <p className="text-sm text-ink-2 pl-[3.75rem]">
            {isBengali
              ? 'টাঙ্গাইলের ১২টি উপজেলার দ্বীনি ও উপযুক্ত পাত্র-পাত্রী খুঁজে নিন'
              : 'Explore pious & compatible matrimonial profiles across 12 upazilas of Tangail'}
          </p>
        </div>

        {data?.meta && (
          <div className="mb-badge self-start md:self-auto px-3.5 py-1.5">
            {isBengali
              ? `মোট ${formatNumber(meta.total)} টি বায়োডাটা পাওয়া গেছে`
              : `Total ${formatNumber(meta.total)} biodatas found`}
          </div>
        )}
      </div>

      {/* Quick search bar */}
      <div className="mb-card p-4 sm:p-5">
        <form onSubmit={handleApplyFilter} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isBengali ? "কীওয়ার্ড (নাম, পেশা বা শিক্ষা দিয়ে খুঁজুন)..." : "Keywords (name, profession, education)..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mb-input pl-10"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder={isBengali ? "বায়োডাটা কোড (MB-M101)" : "Biodata Code (MB-M101)"}
              value={biodataId}
              onChange={(e) => setBiodataId(e.target.value.toUpperCase())}
              className="mb-input uppercase font-mono tracking-wider"
            />
          </div>

          <button type="submit" className="mb-btn-primary w-full sm:w-auto shrink-0">
            <Search className="w-4 h-4" />
            <span>{isBengali ? 'খুঁজুন' : 'Search'}</span>
          </button>
        </form>
      </div>

      {/* Mobile filters toggle */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="mb-card w-full flex items-center justify-between p-3.5 text-sm font-bold text-ink cursor-pointer hover:border-strongline transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-brand" />
            <span>{isBengali ? 'ফিল্টারসমূহ' : 'Filters'}</span>
            {activeFilterCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[11px] font-bold">
                {isBengali ? `${formatNumber(activeFilterCount)} টি সক্রিয়` : `${formatNumber(activeFilterCount)} active`}
              </span>
            ) : (
              <span className="text-xs text-ink-2 font-normal">
                {isBengali ? '(উপজেলা, বয়স, পেশা...)' : '(Upazila, age, profession...)'}
              </span>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-ink-3 transition-transform duration-200 ${mobileFiltersOpen ? 'rotate-180 text-brand' : ''}`}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters sidebar */}
        <aside className={`lg:col-span-1 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'}`}>
          <form
            onSubmit={handleApplyFilter}
            className="mb-card p-5 space-y-5 sticky top-20"
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="font-bold text-sm text-ink flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-brand" />
                {isBengali ? 'ফিল্টারসমূহ' : 'Filters'}
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-ink-3 hover:text-brand flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                {isBengali ? 'রিসেট' : 'Reset'}
              </button>
            </div>

            {/* Biodata code */}
            <div>
              <label className="mb-label">{isBengali ? 'বায়োডাটা কোড' : 'Biodata Code'}</label>
              <input
                type="text"
                placeholder={isBengali ? "যেমন: MB-M101" : "e.g. MB-M101"}
                value={biodataId}
                onChange={(e) => setBiodataId(e.target.value.toUpperCase())}
                className="mb-input !text-xs font-mono uppercase"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-label">{isBengali ? 'পাত্র / পাত্রী' : 'Groom / Bride'}</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="mb-input !text-xs">
                <option value="">{isBengali ? 'উভয় (সকল)' : 'Both (All)'}</option>
                <option value="female">{isBengali ? 'পাত্রী' : 'Bride'}</option>
                <option value="male">{isBengali ? 'পাত্র' : 'Groom'}</option>
              </select>
            </div>

            {/* Upazila */}
            <div>
              <label className="mb-label">{isBengali ? 'টাঙ্গাইলের উপজেলা' : 'Tangail Upazila'}</label>
              <select value={upazila} onChange={(e) => setUpazila(e.target.value)} className="mb-input !text-xs">
                <option value="">{isBengali ? 'সকল উপজেলা' : 'All Upazilas'}</option>
                {TANGAIL_UPAZILAS.map((up) => (
                  <option key={up} value={up}>{getUpazilaDisplayName(up, isBengali)}</option>
                ))}
              </select>
            </div>

            {/* Advanced filters toggle */}
            <button
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="w-full flex items-center justify-between cursor-pointer pt-1 group"
            >
              <span className="font-bold text-sm text-ink flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-gold-soft border border-gold/20 text-gold flex items-center justify-center">
                  <Filter className="w-3.5 h-3.5" />
                </span>
                <span>{isBengali ? 'আরও পছন্দ' : 'More options'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                {advancedFilterCount > 0 && (
                  <span className="mb-badge !px-2 !py-0.5 !text-[10px] !font-bold">
                    {isBengali ? `${formatNumber(advancedFilterCount)}টি সক্রিয়` : `${formatNumber(advancedFilterCount)} active`}
                  </span>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-ink-3 group-hover:text-brand transition-transform duration-200 ${advancedOpen ? 'rotate-180 text-brand' : ''}`}
                />
              </span>
            </button>

            {advancedOpen && (
              <div className="space-y-5 pt-1">
                {/* Age */}
                <div>
                  <label className="mb-label">{isBengali ? 'বয়স পরিসীমা (১৮+)' : 'Age Range (18+)'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="18"
                      max="80"
                      value={minAge}
                      onChange={(e) => setMinAge(e.target.value)}
                      placeholder={isBengali ? "নূন্যতম" : "Min"}
                      className="mb-input !text-xs"
                    />
                    <input
                      type="number"
                      min="18"
                      max="80"
                      value={maxAge}
                      onChange={(e) => setMaxAge(e.target.value)}
                      placeholder={isBengali ? "সর্বোচ্চ" : "Max"}
                      className="mb-input !text-xs"
                    />
                  </div>
                </div>

                {/* Height */}
                <div>
                  <label className="mb-label">{isBengali ? 'উচ্চতা (সেমি)' : 'Height (cm)'}</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={minHeight}
                      onChange={(e) => setMinHeight(e.target.value)}
                      placeholder={isBengali ? "নূন্যতম" : "Min"}
                      className="mb-input !text-xs"
                    />
                    <input
                      type="number"
                      min="100"
                      max="250"
                      value={maxHeight}
                      onChange={(e) => setMaxHeight(e.target.value)}
                      placeholder={isBengali ? "সর্বোচ্চ" : "Max"}
                      className="mb-input !text-xs"
                    />
                  </div>
                  <p className="text-[10px] text-ink-3 mt-1">
                    {isBengali ? 'প্রায় ৫ ফুট = ১৫২ সেমি, ৫ ফুট ৬ ইঞ্চি = ১৬৮ সেমি' : 'Approx 5 ft = 152 cm, 5 ft 6 in = 168 cm'}
                  </p>
                </div>

                {/* Occupation */}
                <div>
                  <label className="mb-label" htmlFor="occupation-filter">
                    {isBengali ? 'পেশা' : 'Profession'}
                  </label>
                  <input
                    id="occupation-filter"
                    value={occupation}
                    onChange={e => setOccupation(e.target.value)}
                    maxLength={100}
                    placeholder={isBengali ? "যেমন: শিক্ষক" : "e.g. Teacher, Engineer"}
                    className="mb-input !text-xs"
                  />
                </div>

                {/* Education */}
                <div>
                  <label className="mb-label">{isBengali ? 'শিক্ষাগত যোগ্যতা' : 'Education Level'}</label>
                  <select value={education} onChange={(e) => setEducation(e.target.value)} className="mb-input !text-xs">
                    <option value="">{isBengali ? 'সকল যোগ্যতা' : 'All Qualifications'}</option>
                    <option value="bachelors">{isBengali ? 'স্নাতক / অনার্স (Bachelors)' : 'Bachelors / Honors'}</option>
                    <option value="masters">{isBengali ? 'মাস্টার্স (Masters)' : 'Masters'}</option>
                    <option value="hsc">{isBengali ? 'এইচএসসি (HSC)' : 'HSC'}</option>
                    <option value="ssc">{isBengali ? 'এসএসসি (SSC)' : 'SSC'}</option>
                    <option value="diploma">{isBengali ? 'ডিপ্লোমা (Diploma)' : 'Diploma'}</option>
                    <option value="islamic_education">{isBengali ? 'ইসলামিক শিক্ষা (কওমি/মাদরাসা)' : 'Islamic Education (Qawmi/Madrasa)'}</option>
                    <option value="phd">{isBengali ? 'পিএইচডি (PhD)' : 'PhD'}</option>
                  </select>
                </div>

                {/* Marital status */}
                <div>
                  <label className="mb-label">{isBengali ? 'বৈবাহিক অবস্থা' : 'Marital Status'}</label>
                  <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="mb-input !text-xs">
                    <option value="">{isBengali ? 'সকল অবস্থা' : 'All Statuses'}</option>
                    <option value="never_married">{isBengali ? 'অবিবাহিত (Never Married)' : 'Never Married'}</option>
                    <option value="divorced">{isBengali ? 'ডিভোর্সড (Divorced)' : 'Divorced'}</option>
                    <option value="widowed">{isBengali ? 'বিধবা / বিপত্নীক (Widowed)' : 'Widowed'}</option>
                    <option value="separated">{isBengali ? 'বিচ্ছিন্ন (Separated)' : 'Separated'}</option>
                  </select>
                </div>

                {/* Verified only */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 accent-[var(--mb-brand)] cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-ink-2">
                    {isBengali ? 'শুধু ভেরিফাইড বায়োডাটা' : 'Verified Profiles Only'}
                  </span>
                </label>
              </div>
            )}

            <button type="submit" className="mb-btn-primary w-full">
              {isBengali ? 'এই পছন্দে খুঁজুন' : 'Search with these choices'}
            </button>
          </form>
        </aside>

        {/* Results */}
        <main className="lg:col-span-3 space-y-6">
          {!demo && <SaveSearchControl />}
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" label={isBengali ? "বায়োডাটা অনুসন্ধান করা হচ্ছে..." : "Searching biodatas..."} />
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-brand-soft rounded-3xl border border-brand/25">
              <AlertCircle className="w-10 h-10 text-brand mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-ink">
                {isBengali ? 'বায়োডাটা লোড করতে সমস্যা হয়েছে।' : 'Failed to load biodatas.'}
              </p>
              <button type="button" onClick={() => refetch()} className="mb-btn-primary mt-4 px-4 py-2 text-xs">
                {isBengali ? 'পুনরায় চেষ্টা করুন' : 'Try again'}
              </button>
            </div>
          ) : profiles.length === 0 ? (
            <div className="py-16 px-4 text-center mb-card space-y-3">
              <div className="w-14 h-14 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-ink">
                {isBengali ? 'কোনো বায়োডাটা খুঁজে পাওয়া যায়নি' : 'No biodatas found'}
              </h3>
              <p className="text-xs text-ink-2 max-w-md mx-auto">
                {isBengali
                  ? 'আপনার নির্বাচিত ফিল্টারের সাথে মিল রেখে কোনো রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে কিছু পছন্দ বাদ দিয়ে আবার খুঁজুন।'
                  : 'No profiles match your filters. Please adjust or relax your filters and try again.'}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand bg-brand-soft hover:bg-brand/15 rounded-xl border border-brand/25 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isBengali ? 'সব পছন্দ মুছে আবার খুঁজুন' : 'Reset all filters'}</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {profiles.map((profile: Profile) => (
                  <ProfileCard
                    key={profile._id}
                    profile={profile}
                    detailsBasePath={demo ? '/demo/profiles' : '/profiles'}
                    onSendInterest={demo ? undefined : (p) => {
                      if (!isAuthenticated) {
                        navigate('/login');
                      } else {
                        setSelectedProfileForInterest(p);
                      }
                    }}
                  />
                ))}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-between pt-6 border-t border-line">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => {
                      const newPage = Math.max(1, page - 1);
                      setPage(newPage);
                      const params = new URLSearchParams(searchParams);
                      params.set('page', String(newPage));
                      setSearchParams(params);
                    }}
                    className="mb-btn-secondary !text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {isBengali ? 'পূর্ববর্তী' : 'Previous'}
                  </button>

                  <span className="text-xs font-medium text-ink-2">
                    {isBengali ? (
                      <>
                        পৃষ্ঠা <strong className="text-ink">{formatNumber(page)}</strong> এর{' '}
                        <strong className="text-ink">{formatNumber(meta.totalPages)}</strong>
                      </>
                    ) : (
                      <>
                        Page <strong className="text-ink">{page}</strong> of{' '}
                        <strong className="text-ink">{meta.totalPages}</strong>
                      </>
                    )}
                  </span>

                  <button
                    type="button"
                    disabled={page >= meta.totalPages}
                    onClick={() => {
                      const newPage = Math.min(meta.totalPages, page + 1);
                      setPage(newPage);
                      const params = new URLSearchParams(searchParams);
                      params.set('page', String(newPage));
                      setSearchParams(params);
                    }}
                    className="mb-btn-secondary !text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    {isBengali ? 'পরবর্তী' : 'Next'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Interest Modal */}
      <SendInterestModal
        isOpen={!!selectedProfileForInterest}
        onClose={() => setSelectedProfileForInterest(null)}
        profile={selectedProfileForInterest}
      />
    </div>
  );
};

export default SearchPage;
