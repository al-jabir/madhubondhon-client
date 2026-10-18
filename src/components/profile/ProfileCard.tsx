import React, { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, Briefcase, GraduationCap, Heart, CheckCircle2, Bookmark, EyeOff } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Profile, Gender } from '../../types';
import { UPAZILA_DISPLAY_NAMES, TangailUpazila } from '../../constants/locations';
import { shortlistApi } from '../../api/shortlist.api';
import { profilesApi } from '../../api/profiles.api';
import { calculateCompatibility } from '../../utils/compatibility';
import { useAuth } from '../../context/useAuth';

interface ProfileCardProps {
  profile: Profile;
  detailsBasePath?: string;
  onSendInterest?: (profile: Profile) => void;
  isInitiallyShortlisted?: boolean;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  onSendInterest,
  detailsBasePath = '/profiles',
  isInitiallyShortlisted = false,
}) => {
  const { isAuthenticated } = useAuth();
  const [isShortlisted, setIsShortlisted] = useState(isInitiallyShortlisted);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const upazilaBangla =
    UPAZILA_DISPLAY_NAMES[profile.upazila as TangailUpazila] || profile.upazila;

  const isMale = profile.gender === Gender.MALE;
  const targetId = profile.biodataId || (typeof profile.user === 'string' ? profile.user : profile.user?._id || profile.user?.id || profile._id);

  const { data: ownProfileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profilesApi.getOwnProfile(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });

  const myProfile = ownProfileData?.data?.profile;
  const compatibility = calculateCompatibility(myProfile, profile);

  const primaryPhoto = profile.photos?.find((p) => p.isProfilePhoto) || profile.photos?.[0];
  const isBlurred = Boolean(primaryPhoto?.blurPhoto || profile.photoPrivacy === 'on_interest_accepted');

  const handleToggleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info('বায়োডাটা শর্টলিস্ট করতে প্রথমে লগইন করুন।');
      return;
    }

    try {
      setIsBookmarking(true);
      if (isShortlisted) {
        await shortlistApi.removeFromShortlist(profile._id);
        setIsShortlisted(false);
        toast.info('শর্টলিস্ট থেকে সরানো হয়েছে।');
      } else {
        await shortlistApi.addToShortlist(profile._id);
        setIsShortlisted(true);
        toast.success('পছন্দের তালিকায় যোগ করা হয়েছে!');
      }
    } catch {
      toast.error('শর্টলিস্ট আপডেট করা যায়নি।');
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-rose-100/90 shadow-xs hover:shadow-lg hover:border-rose-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group relative">
      {/* Top Badges & Shortlist Button */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        {profile.biodataId ? (
          <span className="pointer-events-auto text-[11px] font-black tracking-wider px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-xs">
            {profile.biodataId}
          </span>
        ) : <span />}

        <button
          type="button"
          onClick={handleToggleShortlist}
          disabled={isBookmarking}
          title={isShortlisted ? 'শর্টলিস্ট থেকে সরান' : 'শর্টলিস্টে রাখুন'}
          className={`pointer-events-auto p-2 rounded-full backdrop-blur-md border shadow-sm transition-all cursor-pointer ${
            isShortlisted
              ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700'
              : 'bg-white/90 text-gray-600 hover:text-rose-600 border-gray-250 hover:bg-white'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div>
        {/* Header Ribbon / Photo Avatar Placeholder */}
        <div className="relative bg-linear-to-r from-rose-50 via-pink-50/50 to-rose-50 pt-10 pb-6 px-6 flex flex-col items-center text-center border-b border-rose-100/60">
          <div className="relative w-22 h-22 rounded-full overflow-hidden shadow-md border-3 border-white mb-3 group-hover:scale-105 transition-transform bg-rose-100 flex items-center justify-center">
            {primaryPhoto?.url ? (
              <>
                <img
                  src={primaryPhoto.url}
                  alt={profile.displayName}
                  className={`w-full h-full object-cover transition-all ${isBlurred ? 'filter blur-md scale-110' : ''}`}
                />
                {isBlurred && (
                  <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center text-white p-1">
                    <EyeOff className="w-5 h-5 text-white/90 drop-shadow-md" />
                    <span className="text-[9px] font-bold tracking-tight">পর্দাশীল</span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-2xl font-black text-rose-600">
                {profile.displayName ? profile.displayName.charAt(0) : (isMale ? 'পা' : 'পা')}
              </span>
            )}
          </div>
          
          <h3 className="font-bold text-lg text-gray-900 flex items-center gap-1.5">
            {profile.displayName || 'সম্মানিত সদস্য'}
            {profile.isApproved && (
              <span title="ভেরিফাইড বায়োডাটা">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2 mt-1 text-xs text-rose-700 font-semibold bg-rose-100/80 px-2.5 py-0.5 rounded-full">
            <span>{isMale ? 'পাত্র' : 'পাত্রী'}</span>
            <span>•</span>
            <span>{profile.age ? `${profile.age} বছর` : 'প্রাপ্তবয়স্ক'}</span>
          </div>

          {compatibility && (
            <div
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-200 px-2.5 py-0.5 rounded-full shadow-2xs"
              title={compatibility.reasons.join(' • ')}
            >
              <span>✨ {compatibility.score}% মিল</span>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="p-5 space-y-2.5 text-sm text-gray-650">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
            <span className="font-medium text-gray-850">{upazilaBangla}, টাঙ্গাইল</span>
          </div>

          {profile.occupation && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate">{profile.occupation}</span>
            </div>
          )}

          {profile.education && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="truncate uppercase">{profile.education}</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-xs text-gray-500 line-clamp-2 italic pt-1 border-t border-gray-100">
              "{profile.bio}"
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-gray-50/70 border-t border-rose-100/60 flex items-center gap-2">
        <Link
          to={`${detailsBasePath}/${targetId}`}
          className="flex-1 py-2 px-3 text-center text-xs font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-lg transition-colors"
        >
          সম্পূর্ণ বায়োডাটা
        </Link>
        {onSendInterest && (
          <button
            type="button"
            onClick={() => onSendInterest(profile)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>পছন্দ</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
