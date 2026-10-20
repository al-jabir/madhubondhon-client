import React, { useState } from 'react';
import { Link } from 'react-router';
import { MapPin, Briefcase, GraduationCap, Heart, CheckCircle2, Bookmark } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Profile, Gender } from '../../types';
import { getUpazilaDisplayName } from '../../constants/locations';
import { shortlistApi } from '../../api/shortlist.api';
import { profilesApi } from '../../api/profiles.api';
import { calculateCompatibility } from '../../utils/compatibility';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../i18n/LanguageContext';
import GenderAvatar from '../common/GenderAvatar';

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
  const { isAuthenticated, user } = useAuth();
  const { isBengali, formatNumber } = useLanguage();
  const [isShortlisted, setIsShortlisted] = useState(isInitiallyShortlisted);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const isOwnProfile =
    user &&
    (user.id === profile.user ||
      (typeof profile.user === 'object' &&
        (profile.user?._id === user.id || profile.user?.id === user.id)));

  const upazilaName = getUpazilaDisplayName(profile.upazila, isBengali);

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

  const handleToggleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.info(isBengali ? 'বায়োডাটা শর্টলিস্ট করতে প্রথমে লগইন করুন।' : 'Please sign in to shortlist biodata.');
      return;
    }

    try {
      setIsBookmarking(true);
      if (isShortlisted) {
        await shortlistApi.removeFromShortlist(profile._id);
        setIsShortlisted(false);
        toast.info(isBengali ? 'শর্টলিস্ট থেকে সরানো হয়েছে।' : 'Removed from shortlist.');
      } else {
        await shortlistApi.addToShortlist(profile._id);
        setIsShortlisted(true);
        toast.success(isBengali ? 'পছন্দের তালিকায় যোগ করা হয়েছে!' : 'Added to your shortlist!');
      }
    } catch {
      toast.error(isBengali ? 'শর্টলিস্ট আপডেট করা যায়নি।' : 'Failed to update shortlist.');
    } finally {
      setIsBookmarking(false);
    }
  };

  return (
    <div className="mb-card mb-card-hover overflow-hidden flex flex-col justify-between group relative p-0">
      {/* Top badges & shortlist button */}
      <div className="absolute top-3 inset-x-3 z-10 flex items-center justify-between pointer-events-none">
        {profile.biodataId ? (
          <span className="pointer-events-auto text-[11px] font-black tracking-wider px-2.5 py-1 rounded-full bg-[#2b161f]/85 backdrop-blur-md text-gold border border-gold/30">
            {profile.biodataId}
          </span>
        ) : <span />}

        <button
          type="button"
          onClick={handleToggleShortlist}
          disabled={isBookmarking}
          title={
            isShortlisted
              ? isBengali
                ? 'শর্টলিস্ট থেকে সরান'
                : 'Remove from shortlist'
              : isBengali
              ? 'শর্টলিস্টে রাখুন'
              : 'Save to shortlist'
          }
          className={`pointer-events-auto p-2 rounded-full backdrop-blur-md border shadow-sm transition-all cursor-pointer ${
            isShortlisted
              ? 'bg-brand text-white border-brand hover:bg-brand-strong'
              : 'bg-card/90 text-ink-2 hover:text-brand border-strongline hover:border-brand/50'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div>
        {/* Photo header */}
        <div className="relative bg-linear-to-b from-brand-soft/60 to-card pt-10 pb-6 px-6 flex flex-col items-center text-center border-b border-line">
          <div className="relative w-24 h-24 rounded-full shadow-md border-3 border-card mb-3 group-hover:scale-105 transition-transform">
            <GenderAvatar
              gender={profile.gender}
              size={96}
              className="w-full h-full"
            />
          </div>

          <h3 className="font-bold text-lg text-ink flex items-center gap-1.5 text-center">
            {profile.displayName || (isBengali ? 'সম্মানিত সদস্য' : 'Honored Member')}
            {profile.isApproved && (
              <span title={isBengali ? 'ভেরিফাইড বায়োডাটা' : 'Verified Biodata'}>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50 dark:fill-transparent" />
              </span>
            )}
            {isOwnProfile && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand/15 text-brand border border-brand/30">
                {isBengali ? 'আপনার বায়োডাটা' : 'Your Biodata'}
              </span>
            )}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 text-xs text-brand-ink font-semibold bg-brand-soft px-2.5 py-0.5 rounded-full border border-brand/15">
            <span>{isMale ? (isBengali ? 'পাত্র' : 'Groom') : (isBengali ? 'পাত্রী' : 'Bride')}</span>
            <span className="text-brand/50">•</span>
            <span>
              {profile.age
                ? `${formatNumber(profile.age)} ${isBengali ? 'বছর' : 'yrs'}`
                : isBengali
                ? 'প্রাপ্তবয়স্ক'
                : 'Adult'}
            </span>
          </div>

          {compatibility && (
            <div
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-gold bg-gold-soft border border-gold/25 px-2.5 py-0.5 rounded-full"
              title={compatibility.reasons.join(' • ')}
            >
              <span>✨ {formatNumber(compatibility.score)}% {isBengali ? 'মিল' : 'Match'}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5 space-y-2.5 text-sm text-ink-2">
          <div className="flex items-center gap-2 text-ink font-medium">
            <MapPin className="w-4 h-4 text-brand shrink-0" />
            <span>{upazilaName}, {isBengali ? 'টাঙ্গাইল' : 'Tangail'}</span>
          </div>

          {profile.occupation && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-brand/60 shrink-0" />
              <span className="truncate">{profile.occupation}</span>
            </div>
          )}

          {profile.education && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand/60 shrink-0" />
              <span className="truncate uppercase">{profile.education}</span>
            </div>
          )}

          {profile.bio && (
            <p className="text-xs text-ink-3 line-clamp-2 italic pt-1.5 border-t border-line">
              "{profile.bio}"
            </p>
          )}
        </div>
      </div>

      {/* Action footer */}
      <div className="p-4 bg-elev border-t border-line flex items-center gap-2 rounded-b-[1.25rem]">
        <Link
          to={`${detailsBasePath}/${targetId}`}
          className="flex-1 py-2 px-3 text-center text-xs font-semibold text-brand bg-card hover:bg-brand-soft border border-brand/25 rounded-lg transition-colors"
        >
          {isBengali ? 'সম্পূর্ণ বায়োডাটা' : 'Full Biodata'}
        </Link>
        {isOwnProfile ? (
          <Link
            to="/my-profile"
            className="py-2 px-3 text-xs font-semibold text-brand bg-brand-soft hover:bg-brand/20 border border-brand/30 rounded-lg whitespace-nowrap"
          >
            {isBengali ? 'আমার প্রোফাইল' : 'My Profile'}
          </Link>
        ) : onSendInterest ? (
          <button
            type="button"
            onClick={() => onSendInterest(profile)}
            className="flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-white bg-linear-to-r from-brand to-pink-500 hover:brightness-110 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{isBengali ? 'পছন্দ' : 'Interest'}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default ProfileCard;
