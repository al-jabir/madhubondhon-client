import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, RotateCcw, AlertCircle, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES } from '../constants/locations';
import { searchDemoProfiles } from '../data/demoProfiles';
import { profilesApi } from '../api/profiles.api';
import { Gender, MaritalStatus, EducationLevel, Profile } from '../types';
import ProfileCard from '../components/profile/ProfileCard';
import SendInterestModal from '../components/profile/SendInterestModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/useAuth';

export const SearchPage: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const [params] = useSearchParams();
  return <SearchPageContent key={params.toString()} demo={demo} />;
};

const SearchPageContent: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

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
  const [page, setPage] = useState<number>(Number(searchParams.get('page')) || 1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeFilterCount = [
    biodataId,
    gender,
    upazila,
    maritalStatus,
    education,
    occupation,
    minAge !== '18' ? minAge : '',
    maxAge !== '60' ? maxAge : '',
  ].filter(Boolean).length;

  // Selected profile for sending interest modal
  const [selectedProfileForInterest, setSelectedProfileForInterest] = useState<Profile | null>(null);

  // Query API
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['search-profiles', demo, user?.id || user?._id || 'guest', biodataId, query, gender, upazila, minAge, maxAge, maritalStatus, education, occupation, page],
    queryFn: () =>
      (demo ? searchDemoProfiles : profilesApi.searchProfiles)({
        biodataId: biodataId.trim() || undefined,
        query: query.trim() || undefined,
        gender: (gender as Gender) || undefined,
        upazila: upazila || undefined,
        minAge: minAge ? Number(minAge) : undefined,
        maxAge: maxAge ? Number(maxAge) : undefined,
        maritalStatus: (maritalStatus as MaritalStatus) || undefined,
        education: (education as EducationLevel) || undefined,
        occupation: occupation.trim() || undefined,
        page,
        limit: 9,
      }),
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
    setMaritalStatus('');
    setEducation('');
    setOccupation('');
    setPage(1);
    setSearchParams(new URLSearchParams());
    setMobileFiltersOpen(false);
  };

  const profiles = data?.data?.profiles || [];
  const meta = data?.meta || { total: profiles.length, totalPages: 1, page: 1, limit: 9 };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 sm:space-y-8">
      {demo && <div className="rounded-2xl bg-gold-soft border border-gold/25 p-4 text-sm text-gold"><strong>নমুনা বায়োডাটা</strong> — নিচের ১২টি প্রোফাইল কাল্পনিক। ফিল্টার ও বিস্তারিত পেজ ঘুরে দেখতে পারেন।</div>}
      {!demo && import.meta.env.DEV && import.meta.env.VITE_LOCAL_DEV === 'true' && <div className="rounded-2xl bg-gold-soft border border-gold/25 p-4 text-sm text-gold">নিজের local database থেকে ফলাফল দেখানো হচ্ছে। Development-এর জন্য যোগ করা ১২টি sample বায়োডাটা কাল্পনিক।</div>}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-line">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink flex items-center gap-3">
            <span className="w-11 h-11 rounded-2xl bg-brand-soft border border-brand/20 text-brand flex items-center justify-center">
              <Search className="w-5 h-5" />
            </span>
            <span>বায়োডাটা অনুসন্ধান</span>
          </h1>
          <p className="text-sm text-ink-2 pl-[3.75rem]">
            টাঙ্গাইলের ১২টি উপজেলার দ্বীনি ও উপযুক্ত পাত্র-পাত্রী খুঁজে নিন
          </p>
        </div>

        {data?.meta && (
          <div className="mb-badge self-start md:self-auto px-3.5 py-1.5">
            মোট {meta.total} টি বায়োডাটা পাওয়া গেছে
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
              placeholder="কীওয়ার্ড (নাম, পেশা বা শিক্ষা দিয়ে খুঁজুন)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mb-input pl-10"
            />
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="বায়োডাটা কোড (MB-M101)"
              value={biodataId}
              onChange={(e) => setBiodataId(e.target.value.toUpperCase())}
              className="mb-input uppercase font-mono tracking-wider"
            />
          </div>

          <button type="submit" className="mb-btn-primary w-full sm:w-auto shrink-0">
            <Search className="w-4 h-4" />
            <span>খুঁজুন</span>
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
            <span>ফিল্টারসমূহ</span>
            {activeFilterCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-brand text-white text-[11px] font-bold">
                {activeFilterCount} টি সক্রিয়
              </span>
            ) : (
              <span className="text-xs text-ink-3 font-normal">(উপজেলা, বয়স, পেশা...)</span>
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
                ফিল্টারসমূহ
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-semibold text-ink-3 hover:text-brand flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                রিসেট
              </button>
            </div>

            {/* Biodata code */}
            <div>
              <label className="mb-label">বায়োডাটা কোড</label>
              <input
                type="text"
                placeholder="যেমন: MB-M101"
                value={biodataId}
                onChange={(e) => setBiodataId(e.target.value.toUpperCase())}
                className="mb-input !text-xs font-mono uppercase"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-label">পাত্র / পাত্রী</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} className="mb-input !text-xs">
                <option value="">উভয় (সকল)</option>
                <option value="female">পাত্রী</option>
                <option value="male">পাত্র</option>
              </select>
            </div>

            {/* Upazila */}
            <div>
              <label className="mb-label">টাঙ্গাইলের উপজেলা</label>
              <select value={upazila} onChange={(e) => setUpazila(e.target.value)} className="mb-input !text-xs">
                <option value="">সকল উপজেলা</option>
                {TANGAIL_UPAZILAS.map((up) => (
                  <option key={up} value={up}>{UPAZILA_DISPLAY_NAMES[up]}</option>
                ))}
              </select>
            </div>

            {/* Age */}
            <div>
              <label className="mb-label">বয়স পরিসীমা (১৮+)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                  placeholder="নূন্যতম"
                  className="mb-input !text-xs"
                />
                <input
                  type="number"
                  min="18"
                  max="80"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                  placeholder="সর্বোচ্চ"
                  className="mb-input !text-xs"
                />
              </div>
            </div>

            {/* Marital status */}
            <div>
              <label className="mb-label">বৈবাহিক অবস্থা</label>
              <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} className="mb-input !text-xs">
                <option value="">সকল অবস্থা</option>
                <option value="never_married">অবিবাহিত (Never Married)</option>
                <option value="divorced">ডিভোর্সড (Divorced)</option>
                <option value="widowed">বিধবা / বিপত্নীক (Widowed)</option>
                <option value="separated">বিচ্ছিন্ন (Separated)</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="mb-label" htmlFor="occupation-filter">পেশা</label>
              <input
                id="occupation-filter"
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                maxLength={100}
                placeholder="যেমন: শিক্ষক"
                className="mb-input !text-xs"
              />
            </div>

            {/* Education */}
            <div>
              <label className="mb-label">শিক্ষাগত যোগ্যতা</label>
              <select value={education} onChange={(e) => setEducation(e.target.value)} className="mb-input !text-xs">
                <option value="">সকল যোগ্যতা</option>
                <option value="bachelors">স্নাতক / অনার্স (Bachelors)</option>
                <option value="masters">মাস্টার্স (Masters)</option>
                <option value="hsc">এইচএসসি (HSC)</option>
                <option value="ssc">এসএসসি (SSC)</option>
                <option value="diploma">ডিপ্লোমা (Diploma)</option>
                <option value="islamic_education">ইসলামিক শিক্ষা (কওমি/মাদরাসা)</option>
                <option value="phd">পিএইচডি (PhD)</option>
              </select>
            </div>

            <button type="submit" className="mb-btn-primary w-full">
              ফিল্টার প্রয়োগ করুন
            </button>
          </form>
        </aside>

        {/* Results */}
        <main className="lg:col-span-3 space-y-6">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <LoadingSpinner size="lg" label="বায়োডাটা অনুসন্ধান করা হচ্ছে..." />
            </div>
          ) : isError ? (
            <div className="p-8 text-center bg-brand-soft rounded-3xl border border-brand/25">
              <AlertCircle className="w-10 h-10 text-brand mx-auto mb-2" />
              <p className="text-sm font-bold text-brand-ink">বায়োডাটা লোড করতে সমস্যা হয়েছে।</p>
              <button type="button" onClick={() => refetch()} className="mb-btn-primary mt-4 px-4 py-2 text-xs">
                পুনরায় চেষ্টা করুন
              </button>
            </div>
          ) : profiles.length === 0 ? (
            <div className="py-16 px-4 text-center mb-card space-y-3">
              <div className="w-14 h-14 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-ink">কোনো বায়োডাটা খুঁজে পাওয়া যায়নি</h3>
              <p className="text-xs text-ink-2 max-w-md mx-auto">
                আপনার নির্বাচিত ফিল্টারের সাথে মিল রেখে কোনো রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে ফিল্টার শিথিল করে পুনরায় চেষ্টা করুন।
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand bg-brand-soft hover:bg-brand/15 rounded-xl border border-brand/25 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>সব ফিল্টার রিসেট করুন</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {profiles.map((profile) => (
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
                    পূর্ববর্তী
                  </button>

                  <span className="text-xs font-medium text-ink-2">
                    পৃষ্ঠা <strong className="text-ink">{page}</strong> এর <strong className="text-ink">{meta.totalPages}</strong>
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
                    পরবর্তী
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
