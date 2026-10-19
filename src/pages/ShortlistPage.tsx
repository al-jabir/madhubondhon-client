import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bookmark, Trash2, ArrowRight, Heart, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { shortlistApi } from '../api/shortlist.api';
import { ShortlistItem, Profile } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SendInterestModal from '../components/profile/SendInterestModal';
import { UPAZILA_DISPLAY_NAMES, TangailUpazila } from '../constants/locations';

export const ShortlistPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProfileForInterest, setSelectedProfileForInterest] = useState<Profile | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-shortlist'],
    queryFn: () => shortlistApi.getShortlist(),
  });

  const removeMutation = useMutation({
    mutationFn: (profileId: string) => shortlistApi.removeFromShortlist(profileId),
    onSuccess: () => {
      toast.success('বায়োডাটাটি শর্টলিস্ট থেকে সরানো হয়েছে');
      queryClient.invalidateQueries({ queryKey: ['my-shortlist'] });
    },
    onError: () => {
      toast.error('শর্টলিস্ট থেকে সরাতে সমস্যা হয়েছে');
    },
  });

  const profiles: ShortlistItem[] = data?.data || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink flex items-center gap-2.5">
            <Bookmark className="w-7 h-7 text-brand fill-brand-soft" />
            <span>পছন্দের তালিকা (Shortlist)</span>
          </h1>
          <p className="text-sm text-ink-3 mt-1">
            আপনার সংরক্ষিত পছন্দের পাত্র ও পাত্রীর বায়োডাটা সমূহ
          </p>
        </div>

        {profiles.length > 0 && (
          <span className="text-xs font-bold px-3 py-1 bg-brand-soft text-brand-ink rounded-full border border-brand/25 self-start sm:self-auto">
            মোট {profiles.length} টি সংরক্ষিত বায়োডাটা
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="py-24 flex justify-center">
          <LoadingSpinner size="lg" label="শর্টলিস্ট লোড হচ্ছে..." />
        </div>
      ) : profiles.length === 0 ? (
        <div className="py-20 text-center mb-card rounded-3xl p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-ink">পছন্দের তালিকা খালি</h3>
          <p className="text-xs text-ink-3 leading-relaxed">
            আপনি এখনও কোনো বায়োডাটা শর্টলিস্টে যোগ করেননি। পাত্র-পাত্রী অনুসন্ধান করে পছন্দের বায়োডাটাগুলোর
            বুকমার্ক আইকনে ক্লিক করুন।
          </p>
          <div className="pt-2">
            <Link
              to="/search"
              className="mb-btn-primary inline-flex items-center gap-2 px-6 py-2.5 !text-xs rounded-xl"
            >
              <Search className="w-3.5 h-3.5" />
              <span>বায়োডাটা অনুসন্ধান করুন</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const upazilaBangla =
              UPAZILA_DISPLAY_NAMES[profile.upazila as TangailUpazila] || profile.upazila;
            const targetId = profile.biodataId || profile._id;

            return (
              <div
                key={profile._id}
                className="mb-card-hover rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-wider px-2.5 py-0.5 rounded-full bg-elev text-gold border border-line">
                      {profile.biodataId || 'MB-P'}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(profile._id)}
                      disabled={removeMutation.isPending}
                      className="text-ink-3 hover:text-brand p-1.5 rounded-lg hover:bg-brand-soft transition-colors cursor-pointer"
                      title="শর্টলিস্ট থেকে মুছুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-1">
                    <h3 className="font-bold text-base text-ink">{profile.displayName}</h3>
                    <div className="flex items-center gap-2 text-xs text-brand font-semibold mt-0.5">
                      <span>{profile.gender === 'male' ? 'পাত্র (বর)' : 'পাত্রী (কনে)'}</span>
                      <span>•</span>
                      <span>{profile.age ? `${profile.age} বছর` : 'প্রাপ্তবয়স্ক'}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-ink-2 pt-2 border-t border-line">
                    <div>
                      <span className="text-ink-3">এলাকা: </span>
                      <span className="font-medium text-ink">{upazilaBangla}, টাঙ্গাইল</span>
                    </div>
                    {profile.occupation && (
                      <div>
                        <span className="text-ink-3">পেশা: </span>
                        <span className="font-medium text-ink">{profile.occupation}</span>
                      </div>
                    )}
                    {profile.education && (
                      <div>
                        <span className="text-ink-3">শিক্ষা: </span>
                        <span className="font-medium text-ink uppercase">{profile.education}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-3.5 bg-elev border-t border-line flex items-center gap-2">
                  <Link
                    to={`/profiles/${targetId}`}
                    className="mb-btn-secondary flex-1 !py-2 !px-3 text-center !text-xs rounded-lg"
                  >
                    বায়োডাটা দেখুন
                  </Link>
                  <button
                    type="button"
                    onClick={() => setSelectedProfileForInterest(profile as unknown as Profile)}
                    className="mb-btn-primary flex items-center gap-1.5 !py-2 !px-3 !text-xs rounded-lg"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>পছন্দ</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <SendInterestModal
        isOpen={!!selectedProfileForInterest}
        onClose={() => setSelectedProfileForInterest(null)}
        profile={selectedProfileForInterest}
      />
    </div>
  );
};

export default ShortlistPage;
