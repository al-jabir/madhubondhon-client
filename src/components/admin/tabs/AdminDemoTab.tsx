import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import {
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Users,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  EyeOff,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { demoProfiles } from '../../../data/demoProfiles';
import { useLanguage } from '../../../i18n/LanguageContext';
import LoadingSpinner from '../../common/LoadingSpinner';

export const AdminDemoTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { t, formatNumber, isBengali } = useLanguage();

  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Platform Settings Query
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => adminApi.getSettings(),
  });

  const settings = settingsData?.data?.settings;
  const isDemoVisible = settings?.showDemoProfiles !== false; // default true

  // Mutation to toggle demo profiles
  const toggleMutation = useMutation({
    mutationFn: (newStatus: boolean) =>
      adminApi.updateSettings({ showDemoProfiles: newStatus }),
    onSuccess: (_, newStatus) => {
      toast.success(
        newStatus
          ? isBengali
            ? 'নমুনা বায়োডাটা লাইভ ওয়েবসাইটে সফলভাবে প্রদর্শন করা হয়েছে।'
            : 'Sample biodata has been published live on the website.'
          : isBengali
          ? 'নমুনা বায়োডাটা লাইভ ওয়েবসাইট থেকে সফলভাবে লুকানো (Hide) হয়েছে।'
          : 'Sample biodata has been hidden from the live website.'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          (isBengali ? 'সেটিংস আপডেট ব্যর্থ হয়েছে।' : 'Failed to update settings.')
      );
    },
  });

  // Filter demo profiles for display
  const filteredProfiles = demoProfiles.filter((p) => {
    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      (p.displayName && p.displayName.toLowerCase().includes(term)) ||
      (p.biodataId && p.biodataId.toLowerCase().includes(term)) ||
      (p.upazila && p.upazila.toLowerCase().includes(term)) ||
      (p.occupation && p.occupation.toLowerCase().includes(term));
    return matchesGender && matchesSearch;
  });

  const maleCount = demoProfiles.filter((p) => p.gender === 'male').length;
  const femaleCount = demoProfiles.filter((p) => p.gender === 'female').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="mb-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-linear-to-r from-card via-card to-amber-500/5 border border-amber-500/20">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-ink flex items-center gap-2">
              <span>{isBengali ? 'ডেমো ডেটা নিয়ন্ত্রণ কেন্দ্র' : 'Demo Data Control Center'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                Demo Data Control
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-ink-3 mt-0.5">
              {isBengali
                ? 'ওয়েবসাইটে কাল্পনিক নমুনা বায়োডাটা প্রদর্শন নিয়ন্ত্রণ করুন, তাৎক্ষণিক অন/অফ করুন এবং স্যাম্পল ডেটা পর্যবেক্ষণ করুন'
                : 'Control sample matrimonial profiles on the website, toggle live visibility, and inspect mock datasets.'}
            </p>
          </div>
        </div>

        <Link
          to="/demo"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20 transition-all shrink-0 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4" />
          <span>{isBengali ? 'পাবলিক ডেমো পেজ দেখুন' : 'View Public Demo Page'}</span>
        </Link>
      </div>

      {/* Main Switch Card */}
      <div className="mb-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-ink">
                {isBengali
                  ? 'ওয়েবসাইটে নমুনা বায়োডাটা দৃশ্যমানতা (Live Visibility)'
                  : 'Sample Biodata Live Visibility on Website'}
              </span>
              {isDemoVisible ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isBengali ? 'সক্রিয় (Visible)' : 'Visible (Active)'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-ink/10 text-ink-3 border border-line">
                  <EyeOff className="w-3.5 h-3.5" />
                  {isBengali ? 'লুকানো (Hidden)' : 'Hidden (Inactive)'}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-3 mt-1 max-w-2xl leading-relaxed">
              {isDemoVisible
                ? isBengali
                  ? 'বর্তমানে মূল ওয়েবসাইটের ন্যাভবারে "নমুনা বায়োডাটা" লিংক প্রদর্শিত হচ্ছে এবং নতুন দর্শনার্থীরা ১২টি স্যাম্পল বায়োডাটা দেখতে পারছেন।'
                  : 'Currently the "Sample Profiles" link is visible in the main website navbar and visitors can browse 12 sample profiles.'
                : isBengali
                ? 'বর্তমানে নমুনা বায়োডাটা মূল সাইট থেকে লুকানো রয়েছে। সাধারণ ভিজিটররা শুধুমাত্র অনুমোদিত বাস্তব ব্যবহারকারীদের বায়োডাটাই দেখতে পাবেন।'
                : 'Sample profiles are currently hidden from the live website. Visitors will only see real verified member profiles.'}
            </p>
          </div>

          <button
            type="button"
            disabled={isLoading || toggleMutation.isPending}
            onClick={() => toggleMutation.mutate(!isDemoVisible)}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border border-line hover:border-amber-500/50 bg-elev hover:bg-amber-500/10 cursor-pointer transition-all shrink-0 select-none disabled:opacity-50"
            title={
              isDemoVisible
                ? isBengali
                  ? 'নমুনা বায়োডাটা বন্ধ করতে ক্লিক করুন'
                  : 'Click to hide sample profiles'
                : isBengali
                ? 'নমুনা বায়োডাটা চালু করতে ক্লিক করুন'
                : 'Click to show sample profiles'
            }
          >
            {isDemoVisible ? (
              <>
                <ToggleRight className="w-8 h-8 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {toggleMutation.isPending
                    ? isBengali
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : isBengali
                    ? 'প্রদর্শন চালু আছে'
                    : 'Visibility ON'}
                </span>
              </>
            ) : (
              <>
                <ToggleLeft className="w-8 h-8 text-ink-3 shrink-0" />
                <span className="text-xs font-bold text-ink-3">
                  {toggleMutation.isPending
                    ? isBengali
                      ? 'সংরক্ষণ হচ্ছে...'
                      : 'Saving...'
                    : isBengali
                    ? 'প্রদর্শন বন্ধ আছে'
                    : 'Visibility OFF'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Info guide box */}
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-ink-2">
          <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>{isBengali ? 'প্রশাসনিক নির্দেশনা:' : 'Admin Advisory:'}</strong>{' '}
            {isBengali
              ? 'ওয়েবসাইট প্রাথমিক পর্যায়ে যখন পর্যাপ্ত বাস্তব বায়োডাটা থাকে না, তখন নতুন দর্শনার্থীদের প্ল্যাটফর্মের ফিচার ও লেআউট বোঝাতে এই ১২টি ডেমো প্রোফাইল কার্যকর ভূমিকা রাখে। বাস্তব সদস্যরা যোগ দিলে আপনি এই সুইচের মাধ্যমে যে কোনো সময় ডেমো ডেটা হাইড বা আনহাইড করতে পারেন।'
              : 'These 12 demo profiles help initial visitors experience search filters and full biodata layouts prior to large-scale organic member registrations. Once real candidates register, you can toggle this switch anytime.'}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="mb-card p-4">
          <div className="flex items-center justify-between text-ink-3 text-xs font-semibold mb-2">
            <span>{isBengali ? 'মোট নমুনা প্রোফাইল' : 'Total Sample Profiles'}</span>
            <Users className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-ink">{formatNumber(demoProfiles.length)}</div>
          <div className="text-[11px] text-ink-3 mt-1">
            {isBengali ? 'টাঙ্গাইল জেলার ১২টি উপজেলা' : '12 Upazilas of Tangail'}
          </div>
        </div>

        <div className="mb-card p-4">
          <div className="flex items-center justify-between text-ink-3 text-xs font-semibold mb-2">
            <span>{isBengali ? 'পাত্রের বায়োডাটা (Male)' : "Groom's Profiles (Male)"}</span>
            <span className="text-xs font-bold text-sky-500">♂</span>
          </div>
          <div className="text-2xl font-black text-sky-600 dark:text-sky-400">
            {formatNumber(maleCount)}
          </div>
          <div className="text-[11px] text-ink-3 mt-1">
            {isBengali ? 'প্রকৌশলী, ব্যাংকার, শিক্ষক ইত্যাদি' : 'Engineers, Bankers, Teachers etc.'}
          </div>
        </div>

        <div className="mb-card p-4">
          <div className="flex items-center justify-between text-ink-3 text-xs font-semibold mb-2">
            <span>{isBengali ? 'পাত্রীর বায়োডাটা (Female)' : "Bride's Profiles (Female)"}</span>
            <span className="text-xs font-bold text-pink-500">♀</span>
          </div>
          <div className="text-2xl font-black text-pink-600 dark:text-pink-400">
            {formatNumber(femaleCount)}
          </div>
          <div className="text-[11px] text-ink-3 mt-1">
            {isBengali ? 'শিক্ষিকা, ডিজাইনার, পুষ্টিবিদ ইত্যাদি' : 'Teachers, Designers, Nutritionists etc.'}
          </div>
        </div>

        <div className="mb-card p-4">
          <div className="flex items-center justify-between text-ink-3 text-xs font-semibold mb-2">
            <span>{isBengali ? 'কভারেজ' : 'Coverage'}</span>
            <MapPin className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {isBengali ? '১০০%' : '100%'}
          </div>
          <div className="text-[11px] text-ink-3 mt-1">
            {isBengali ? 'সকল ১২টি উপজেলা কভার্ড' : 'All 12 Upazilas covered'}
          </div>
        </div>
      </div>

      {/* Sample Profiles Table with Filters */}
      <div className="mb-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-ink flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>
                {isBengali
                  ? 'নমুনা বায়োডাটার তালিকা (Demo Profiles Catalog)'
                  : 'Sample Profiles Catalog (Tangail District)'}
              </span>
            </h3>
            <p className="text-xs text-ink-3">
              {isBengali
                ? 'ফিল্টার করে যেকোনো নমুনা প্রোফাইল বিস্তারিতভাবে পর্যবেক্ষণ করুন'
                : 'Filter and inspect any sample profile in detail'}
            </p>
          </div>

          {/* Controls: Search + Gender Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  isBengali ? 'নাম, পেশা বা আইডি...' : 'Search by name, occupation, ID...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-input text-xs pl-8 pr-3 py-1.5 h-8 w-44 sm:w-56"
              />
            </div>

            <div className="inline-flex rounded-lg bg-elev p-0.5 border border-line text-xs font-semibold">
              <button
                type="button"
                onClick={() => setGenderFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  genderFilter === 'all'
                    ? 'bg-card text-brand font-bold shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {isBengali ? 'সব' : 'All'} ({formatNumber(demoProfiles.length)})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('male')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  genderFilter === 'male'
                    ? 'bg-card text-sky-600 dark:text-sky-400 font-bold shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {isBengali ? 'পাত্র' : 'Male'} ({formatNumber(maleCount)})
              </button>
              <button
                type="button"
                onClick={() => setGenderFilter('female')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  genderFilter === 'female'
                    ? 'bg-card text-pink-600 dark:text-pink-400 font-bold shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {isBengali ? 'পাত্রী' : 'Female'} ({formatNumber(femaleCount)})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-elev border-b border-line text-ink-3 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{isBengali ? 'আইডি' : 'Biodata ID'}</th>
                <th className="py-3 px-4">{isBengali ? 'নাম ও লিঙ্গ' : 'Name & Gender'}</th>
                <th className="py-3 px-4">{isBengali ? 'বয়স' : 'Age'}</th>
                <th className="py-3 px-4">{isBengali ? 'উপজেলা' : 'Upazila'}</th>
                <th className="py-3 px-4">{isBengali ? 'পেশা ও শিক্ষা' : 'Occupation & Education'}</th>
                <th className="py-3 px-4 text-right">{isBengali ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-ink-3">
                    {isBengali ? 'কোনো নমুনা বায়োডাটা মেলেনি।' : 'No sample profiles matched.'}
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => (
                  <tr key={p._id} className="hover:bg-elev/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand">
                      {p.biodataId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink">{p.displayName}</div>
                      <div className="text-[11px] text-ink-3">
                        {p.gender === 'male' ? (
                          <span className="text-sky-600 dark:text-sky-400 font-semibold">
                            {isBengali ? 'পাত্র (Male)' : 'Male'}
                          </span>
                        ) : (
                          <span className="text-pink-600 dark:text-pink-400 font-semibold">
                            {isBengali ? 'পাত্রী (Female)' : 'Female'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-ink">
                      {p.age
                        ? isBengali
                          ? `${formatNumber(p.age)} বছর`
                          : `${formatNumber(p.age)} yrs`
                        : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-elev border border-line text-[11px] font-semibold text-ink-2">
                        <MapPin className="w-3 h-3 text-brand shrink-0" />
                        <span>{p.upazila ? p.upazila.replace('_', ' ') : 'Tangail'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-ink">{p.occupation || '—'}</div>
                      <div className="text-[11px] text-ink-3 truncate max-w-xs">
                        {p.educationDetail || p.education || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/demo/profiles/${p.biodataId || p._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold bg-brand-soft text-brand-ink hover:bg-brand hover:text-white transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>{isBengali ? 'প্রোফাইল দেখুন' : 'View Profile'}</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDemoTab;
