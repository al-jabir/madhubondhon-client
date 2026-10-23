import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileCheck,
  FileClock,
  Eye,
  EyeOff,
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Briefcase,
  Trash2,
  Printer,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import ReviewQueue from '../../profile/ReviewQueue';
import PrintBiodataModal from '../../profile/PrintBiodataModal';
import { AssistedBiodataModal } from '../modals/AssistedBiodataModal';
import { profilesApi } from '../../../api/profiles.api';
import { adminApi } from '../../../api/admin.api';
import { Profile } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';
import { TANGAIL_UPAZILAS, getUpazilaDisplayName } from '../../../constants/locations';
import { useLanguage } from '../../../i18n/LanguageContext';
import ConfirmationModal from '../../common/ConfirmationModal';

export const AdminBiodataTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();
  const [subTab, setSubTab] = useState<'queue' | 'published'>('queue');

  // Filters for published profiles
  const [search, setSearch] = useState('');
  const [upazila, setUpazila] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [page, setPage] = useState(1);

  // Profile Visibility Modal
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [visibilityReason, setVisibilityReason] = useState('');

  // Delete Profile State & Mutation
  const [deleteProfileTarget, setDeleteProfileTarget] = useState<Profile | null>(null);
  const [printProfile, setPrintProfile] = useState<Profile | null>(null);
  const [isAssistedModalOpen, setIsAssistedModalOpen] = useState(false);

  const deleteProfileMutation = useMutation({
    mutationFn: (profileId: string) => adminApi.deleteProfile(profileId),
    onSuccess: () => {
      toast.success(isBengali ? 'বায়োডাটা সফলভাবে মুছে ফেলা হয়েছে।' : 'Biodata deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-published-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['search-profiles'] });
      setDeleteProfileTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'বায়োডাটা মুছে ফেলা যায়নি।' : 'Could not delete biodata.'));
    },
  });

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
      toast.success(isBengali ? 'বায়োডাটার দৃশ্যমানতা সফলভাবে পরিবর্তিত হয়েছে।' : 'Biodata visibility updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-published-profiles'] });
      setSelectedProfile(null);
      setVisibilityReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'পরিবর্তন করা যায়নি।' : 'Could not update visibility.'));
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
            <span>{isBengali ? 'পর্যালোচনা কিউ (Review Queue)' : 'Review Queue'}</span>
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
            <span>{isBengali ? 'প্রকাশিত বায়োডাটা ব্যবস্থাপনা' : 'Published Biodata Management'}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsAssistedModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isBengali ? '+ অফলাইন বায়োডাটা এন্ট্রি' : '+ Assisted Entry'}</span>
        </button>
      </div>

      {/* Sub-tab 1: Review Queue */}
      {subTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-brand-soft/40 border border-brand/20 p-4 rounded-xl text-xs text-brand-ink space-y-1">
            <h4 className="font-bold flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-brand" />
              <span>{isBengali ? 'বায়োডাটা যাচাই ও অনুমোদন প্রক্রিয়া' : 'Biodata Verification & Approval Process'}</span>
            </h4>
            <p className="leading-relaxed">
              {isBengali
                ? 'সদস্যদের জমা দেওয়া নতুন আবেদন বা সংশোধিত বায়োডাটা অভিভাবকের সম্মতি যাচাই সাপেক্ষে পরীক্ষা করে অনুমোদন, সংশোধন অনুরোধ বা বাতিল করুন। প্রতিটি প্রত্যাখ্যান বা সংশোধনে স্পষ্ট কারণ উল্লেখ করুন।'
                : 'Review newly submitted or revised biodata applications with guardian verification before approving, requesting changes, or rejecting. Always provide clear feedback for any rejection.'}
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
                  placeholder={isBengali ? 'নাম বা পেশা দিয়ে খুঁজুন...' : 'Search by name or occupation...'}
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
                <option value="">{isBengali ? 'সকল পাত্র-পাত্রী' : 'All Profiles'}</option>
                <option value="male">{isBengali ? 'পাত্র (Male)' : 'Groom (Male)'}</option>
                <option value="female">{isBengali ? 'পাত্রী (Female)' : 'Bride (Female)'}</option>
              </select>

              <select
                value={upazila}
                onChange={(e) => {
                  setUpazila(e.target.value);
                  setPage(1);
                }}
                className="mb-input text-xs"
              >
                <option value="">{isBengali ? 'সকল উপজেলা' : 'All Upazilas'}</option>
                {TANGAIL_UPAZILAS.map((up) => (
                  <option key={up} value={up}>
                    {getUpazilaDisplayName(up, isBengali)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Published Profiles Grid */}
          {isProfilesLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" label={isBengali ? 'বায়োডাটা লোড হচ্ছে...' : 'Loading biodata...'} />
            </div>
          ) : profilesList.length === 0 ? (
            <div className="mb-card py-16 text-center text-ink-3">
              <p className="text-sm font-bold">{isBengali ? 'কোনো বায়োডাটা পাওয়া যায়নি' : 'No biodata found'}</p>
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
                        {p.gender === 'male' ? (isBengali ? 'পাত্র' : 'Male') : (isBengali ? 'পাত্রী' : 'Female')}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-ink-2">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-brand shrink-0" />
                        <span>{getUpazilaDisplayName(p.upazila, isBengali)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-ink-3 shrink-0" />
                        <span className="truncate">{p.occupation || (isBengali ? 'উল্লেখ নেই' : 'Not specified')}</span>
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
                      {p.visibility === 'public'
                        ? (isBengali ? 'উন্মুক্ত (Public)' : 'Public')
                        : (isBengali ? 'লুকানো (Hidden)' : 'Hidden')}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPrintProfile(p)}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-line bg-elev hover:bg-brand-soft hover:text-brand-ink text-ink-2 transition-colors cursor-pointer inline-flex items-center gap-1"
                        title={isBengali ? 'প্রিন্ট বা PDF সংরক্ষণ করুন' : 'Print or Save PDF'}
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>{isBengali ? 'প্রিন্ট' : 'Print'}</span>
                      </button>

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
                            <span>{isBengali ? 'লুকান' : 'Hide'}</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3.5 h-3.5 inline mr-1" />
                            <span>{isBengali ? 'উন্মুক্ত করুন' : 'Make Public'}</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteProfileTarget(p)}
                        className="px-2 py-1 text-xs font-bold rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
                        title={isBengali ? 'বায়োডাটা মুছে ফেলুন' : 'Delete Biodata'}
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        <span>{isBengali ? 'মুছুন' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 mb-card text-xs">
              <span className="text-ink-3">
                {isBengali
                  ? `পৃষ্ঠা ${formatNumber(meta.page)} / ${formatNumber(meta.totalPages)} (মোট ${formatNumber(meta.total)} টি)`
                  : `Page ${formatNumber(meta.page)} of ${formatNumber(meta.totalPages)} (Total: ${formatNumber(meta.total)})`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-line bg-elev disabled:opacity-40 cursor-pointer font-bold"
                >
                  {isBengali ? 'পূর্ববর্তী' : 'Previous'}
                </button>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-line bg-elev disabled:opacity-40 cursor-pointer font-bold"
                >
                  {isBengali ? 'পরবর্তী' : 'Next'}
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
              <span>{isBengali ? 'বায়োডাটা দৃশ্যমানতা নিয়ন্ত্রণ' : 'Biodata Visibility Control'}</span>
            </h3>

            <p className="text-xs text-ink-2">
              {isBengali ? (
                <>
                  আপনি <strong>{selectedProfile.displayName}</strong>-এর প্রোফাইল{' '}
                  {selectedProfile.visibility === 'public'
                    ? 'সাময়িকভাবে লুকানোর (Hide)'
                    : 'পুনরায় উন্মুক্ত করার (Public)'}{' '}
                  অনুরোধ করছেন।
                </>
              ) : (
                <>
                  You are requesting to{' '}
                  <strong>{selectedProfile.visibility === 'public' ? 'hide' : 'make public'}</strong>{' '}
                  the biodata of <strong>{selectedProfile.displayName}</strong>.
                </>
              )}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const isCurrentlyPublic = selectedProfile.visibility === 'public';
                visibilityMutation.mutate({
                  profileId: selectedProfile._id || '',
                  isHidden: isCurrentlyPublic,
                  reason: visibilityReason.trim() || (isBengali ? 'প্রশাসনিক নিরীক্ষা' : 'Administrative audit'),
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {isBengali ? 'কারণ / প্রশাসনিক নোট (বাধ্যতামূলক):' : 'Reason / Admin Note (Required):'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={visibilityReason}
                  onChange={(e) => setVisibilityReason(e.target.value)}
                  placeholder={isBengali ? 'যেমন: অভিযোগ প্রাপ্তি, অসম্পূর্ণ তথ্য ইত্যাদি...' : 'e.g. Received complaint, missing verification...'}
                  className="mb-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-line hover:bg-elev cursor-pointer text-ink-2"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={visibilityMutation.isPending || !visibilityReason.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:bg-brand-strong disabled:opacity-50 cursor-pointer"
                >
                  {visibilityMutation.isPending ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBengali ? 'সংরক্ষণ করুন' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Biodata Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteProfileTarget)}
        onClose={() => setDeleteProfileTarget(null)}
        onConfirm={() => {
          if (deleteProfileTarget) {
            deleteProfileMutation.mutate(deleteProfileTarget._id);
          }
        }}
        title={isBengali ? 'বায়োডাটা স্থায়ীভাবে মুছে ফেলা' : 'Permanently Delete Biodata'}
        message={
          deleteProfileTarget ? (
            isBengali ? (
              <>
                আপনি কি নিশ্চিতভাবে <strong>{deleteProfileTarget.displayName}</strong>-এর বায়োডাটাটি স্থায়ীভাবে মুছে ফেলতে চান?
                <br />
                <span className="text-red-500 font-semibold mt-1 inline-block">
                  ⚠️ সতর্কবার্তা: বায়োডাটা ও সংশ্লিষ্ট আবেদন ডাটাবেজ থেকে চিরতরে মুছে যাবে।
                </span>
              </>
            ) : (
              <>
                Are you sure you want to permanently delete the biodata of <strong>{deleteProfileTarget.displayName}</strong>?
                <br />
                <span className="text-red-500 font-semibold mt-1 inline-block">
                  ⚠️ Warning: This biodata and its workflow applications will be permanently erased.
                </span>
              </>
            )
          ) : null
        }
        confirmText={isBengali ? 'স্থায়ীভাবে মুছুন' : 'Delete Permanently'}
        variant="danger"
        isLoading={deleteProfileMutation.isPending}
      />

      {printProfile && (
        <PrintBiodataModal
          isOpen={!!printProfile}
          onClose={() => setPrintProfile(null)}
          profile={printProfile}
        />
      )}

      {isAssistedModalOpen && (
        <AssistedBiodataModal
          isOpen={isAssistedModalOpen}
          onClose={() => setIsAssistedModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminBiodataTab;
