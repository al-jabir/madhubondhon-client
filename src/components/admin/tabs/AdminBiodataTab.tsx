import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileCheck,
  FileClock,
  Eye,
  EyeOff,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewQueue from '../../profile/ReviewQueue';
import { profilesApi } from '../../../api/profiles.api';
import { adminApi } from '../../../api/admin.api';
import { Profile } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES } from '../../../constants/locations';

export const AdminBiodataTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [subTab, setSubTab] = useState<'queue' | 'published'>('queue');

  // Filters for published profiles
  const [search, setSearch] = useState('');
  const [upazila, setUpazila] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [page, setPage] = useState(1);

  // Profile Visibility Modal
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [visibilityReason, setVisibilityReason] = useState('');

  // Published profiles query
  const { data: searchData, isLoading: isProfilesLoading } = useQuery({
    queryKey: ['admin-published-profiles', search, upazila, gender, page],
    enabled: subTab === 'published',
    queryFn: () =>
      profilesApi.searchProfiles({
        query: search.trim() || undefined,
        upazila: upazila || undefined,
        gender: (gender as any) || undefined,
        page,
        limit: 12,
      }),
  });

  // Toggle Visibility Mutation
  const visibilityMutation = useMutation({
    mutationFn: ({ profileId, isHidden, reason }: { profileId: string; isHidden: boolean; reason: string }) =>
      adminApi.toggleProfileVisibility(profileId, { isHidden, reason }),
    onSuccess: () => {
      toast.success('বায়োডাটার দৃশ্যমানতা সফলভাবে পরিবর্তিত হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['admin-published-profiles'] });
      setSelectedProfile(null);
      setVisibilityReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'পরিবর্তন করা যায়নি।');
    },
  });

  const profilesList = searchData?.data?.profiles || [];
  const meta = searchData?.meta;

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2 bg-elev p-1 rounded-xl border border-line">
          <button
            type="button"
            onClick={() => setSubTab('queue')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'queue'
                ? 'bg-card text-brand shadow-xs'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            <FileClock className="w-4 h-4" />
            <span>পর্যালোচনা কিউ (Review Queue)</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab('published')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              subTab === 'published'
                ? 'bg-card text-brand shadow-xs'
                : 'text-ink-2 hover:text-ink'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>প্রকাশিত বায়োডাটা ব্যবস্থাপনা</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Review Queue */}
      {subTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-brand-soft/40 border border-brand/20 p-4 rounded-xl text-xs text-brand-ink space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-brand" />
              <span>বায়োডাটা যাচাই ও অনুমোদন প্রক্রিয়া</span>
            </h4>
            <p className="leading-relaxed">
              সদস্যদের জমা দেওয়া নতুন আবেদন বা সংশোধিত বায়োডাটা অভিভাবকের সম্মতি যাচাই সাপেক্ষে পরীক্ষা করে অনুমোদন,
              সংশোধন অনুরোধ বা বাতিল করুন। প্রতিটি প্রত্যাখ্যান বা সংশোধনে স্পষ্ট কারণ উল্লেখ করুন।
            </p>
          </div>
          <ReviewQueue />
        </div>
      )}

      {/* Sub-tab 2: Published Profiles Manager */}
      {subTab === 'published' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="mb-card p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="relative">
                <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="নাম বা পেশা দিয়ে খুঁজুন..."
                  className="mb-input pl-9 text-xs"
                />
              </div>

              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value as any);
                  setPage(1);
                }}
                className="mb-input text-xs"
              >
                <option value="">সকল পাত্র-পাত্রী</option>
                <option value="male">পাত্র (Male)</option>
                <option value="female">পাত্রী (Female)</option>
              </select>

              <select
                value={upazila}
                onChange={(e) => {
                  setUpazila(e.target.value);
                  setPage(1);
                }}
                className="mb-input text-xs"
              >
                <option value="">সকল উপজেলা</option>
                {TANGAIL_UPAZILAS.map((up) => (
                  <option key={up} value={up}>
                    {UPAZILA_DISPLAY_NAMES[up]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Published Profiles Grid */}
          {isProfilesLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" label="বায়োডাটা লোড হচ্ছে..." />
            </div>
          ) : profilesList.length === 0 ? (
            <div className="mb-card py-16 text-center text-ink-3">
              <p className="text-sm font-bold">কোনো বায়োডাটা পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profilesList.map((p: Profile) => (
                <div
                  key={p._id}
                  className="mb-card p-4 space-y-3 flex flex-col justify-between hover:border-brand/40 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-ink">{p.displayName}</span>
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-elev text-ink-2">
                        {p.gender === 'male' ? 'পাত্র' : 'পাত্রী'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-ink-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span>{UPAZILA_DISPLAY_NAMES[p.upazila as keyof typeof UPAZILA_DISPLAY_NAMES] || p.upazila}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                        <span className="truncate">{p.occupation || 'উল্লেখ নেই'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-line flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        p.visibility === 'public'
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {p.visibility === 'public' ? 'উন্মুক্ত (Public)' : 'লুকানো (Hidden)'}
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedProfile(p);
                        setVisibilityReason('');
                      }}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-line bg-elev hover:bg-brand-soft hover:text-brand-ink text-ink-2 transition-colors cursor-pointer"
                    >
                      {p.visibility === 'public' ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5 inline mr-1" />
                          <span>লুকান</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          <span>উন্মুক্ত করুন</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 mb-card text-xs">
              <span className="text-ink-3">
                পৃষ্ঠা {meta.page} / {meta.totalPages} (মোট {meta.total} টি)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-line bg-elev disabled:opacity-40 cursor-pointer font-bold"
                >
                  পূর্ববর্তী
                </button>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-line bg-elev disabled:opacity-40 cursor-pointer font-bold"
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visibility Toggle Reason Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="mb-card max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-ink flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>বায়োডাটা দৃশ্যমানতা নিয়ন্ত্রণ</span>
            </h3>

            <p className="text-xs text-ink-2">
              আপনি <strong>{selectedProfile.displayName}</strong>-এর প্রোফাইল{' '}
              {selectedProfile.visibility === 'public'
                ? 'সাময়িকভাবে লুকানোর (Hide)'
                : 'পুনরায় উন্মুক্ত করার (Public)'}{' '}
              অনুরোধ করছেন।
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const isCurrentlyPublic = selectedProfile.visibility === 'public';
                visibilityMutation.mutate({
                  profileId: selectedProfile._id || '',
                  isHidden: isCurrentlyPublic,
                  reason: visibilityReason.trim() || 'প্রশাসনিক নিরীক্ষা',
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  কারণ / প্রশাসনিক নোট (বাধ্যতামূলক):
                </label>
                <textarea
                  required
                  rows={3}
                  value={visibilityReason}
                  onChange={(e) => setVisibilityReason(e.target.value)}
                  placeholder="যেমন: অভিযোগ প্রাপ্তি, অসম্পূর্ণ তথ্য ইত্যাদি..."
                  className="mb-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-line hover:bg-elev cursor-pointer text-ink-2"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={visibilityMutation.isPending || !visibilityReason.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:bg-brand-strong disabled:opacity-50 cursor-pointer"
                >
                  {visibilityMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBiodataTab;
