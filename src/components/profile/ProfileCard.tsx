import React from 'react';
import { Link } from 'react-router';
import { MapPin, Briefcase, GraduationCap, Heart, CheckCircle2 } from 'lucide-react';
import { Profile, Gender } from '../../types';
import { UPAZILA_DISPLAY_NAMES, TangailUpazila } from '../../constants/locations';

interface ProfileCardProps {
  profile: Profile;
  detailsBasePath?: string;
  onSendInterest?: (profile: Profile) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ profile, onSendInterest, detailsBasePath = '/profiles' }) => {
  const upazilaBangla =
    UPAZILA_DISPLAY_NAMES[profile.upazila as TangailUpazila] || profile.upazila;

  const isMale = profile.gender === Gender.MALE;
  const targetUserId =
    typeof profile.user === 'string' ? profile.user : profile.user?._id || profile.user?.id;

  return (
    <div className="bg-white rounded-2xl border border-rose-100/80 shadow-xs hover:shadow-lg hover:border-rose-300 transition-all duration-300 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Header Ribbon / Photo Avatar Placeholder */}
        <div className="relative bg-linear-to-r from-rose-50 to-pink-50 p-6 flex flex-col items-center text-center border-b border-rose-100/50">
          <div className="w-20 h-20 rounded-full bg-white shadow-md border-2 border-rose-300 flex items-center justify-center text-2xl font-bold text-rose-600 mb-3 group-hover:scale-105 transition-transform">
            {profile.displayName ? profile.displayName.charAt(0) : (isMale ? 'পা' : 'পা')}
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
          to={`${detailsBasePath}/${targetUserId}`}
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
