import BiodataInfoTables from '../components/profile/BiodataInfoTables';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  MapPin,
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Printer,
  Bookmark,
  EyeOff,
  MessageCircle,
  Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { getDemoProfile } from '../data/demoProfiles';
import { profilesApi } from '../api/profiles.api';
import { workflowApi, errorMessage } from '../api/workflow.api';
import { blocksApi } from '../api/blocks.api';
import { shortlistApi } from '../api/shortlist.api';
import { calculateCompatibility } from '../utils/compatibility';
import { Gender } from '../types';
import { UPAZILA_DISPLAY_NAMES, TangailUpazila } from '../constants/locations';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SendInterestModal from '../components/profile/SendInterestModal';
import ReportModal from '../components/profile/ReportModal';
import { useAuth } from '../context/useAuth';

export const ProfileDetailPage: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: currentUser } = useAuth();

  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);
  const [isShortlistBusy, setIsShortlistBusy] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-profile', demo, userId, currentUser?.id || currentUser?._id || 'guest'],
    queryFn: () => demo ? getDemoProfile(userId || '') : profilesApi.getPublicProfile(userId || ''),
    enabled: !!userId,
  });

  const profile = data?.data?.profile;

  // Check shortlist status
  const { data: shortlistCheck } = useQuery({
    queryKey: ['shortlist-check', profile?._id],
    queryFn: () => shortlistApi.checkIsShortlisted(profile!._id),
    enabled: !!profile?._id && isAuthenticated && !demo,
  });

  const isShortlisted = Boolean(shortlistCheck?.data?.isShortlisted);

  const handleToggleShortlist = async () => {
    if (!profile) return;
    if (!isAuthenticated) {
      toast.info('বায়োডাটা শর্টলিস্ট করতে প্রথমে লগইন করুন।');
      navigate('/login');
      return;
    }

    try {
      setIsShortlistBusy(true);
      if (isShortlisted) {
        await shortlistApi.removeFromShortlist(profile._id);
        toast.info('বায়োডাটাটি শর্টলিস্ট থেকে সরানো হয়েছে।');
      } else {
        await shortlistApi.addToShortlist(profile._id);
        toast.success('বায়োডাটাটি পছন্দের তালিকায় সংরক্ষিত হয়েছে!');
      }
      queryClient.invalidateQueries({ queryKey: ['shortlist-check', profile._id] });
      queryClient.invalidateQueries({ queryKey: ['my-shortlist'] });
    } catch {
      toast.error('শর্টলিস্ট আপডেট ব্যর্থ হয়েছে।');
    } finally {
      setIsShortlistBusy(false);
    }
  };

  const handlePrintBiodata = () => {
    window.print();
  };

  // Fetch logged-in user's own profile to compute compatibility
  const { data: ownProfileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profilesApi.getOwnProfile(),
    enabled: !!isAuthenticated && !demo,
  });

  const myProfile = ownProfileData?.data?.profile;
  const compatibility = calculateCompatibility(myProfile, profile);

  const handleWhatsAppShare = () => {
    if (!profile) return;
    const currentUrl = window.location.href;
    const bioId = profile.biodataId ? ` (বায়োডাটা কোড: ${profile.biodataId})` : '';
    const text = `আসসালামু আলাইকুম। মধুবন্ধন টাঙ্গাইল মেট্রিমনিতে একটি উপযুক্ত বায়োডাটা${bioId}:\n\n` +
      `• পরিচিতি: ${profile.displayName}\n` +
      `• বয়স: ${profile.age ? `${profile.age} বছর` : 'প্রাপ্তবয়স্ক'}\n` +
      `• এলাকা: ${upazilaBangla}, টাঙ্গাইল\n` +
      (profile.occupation ? `• পেশা: ${profile.occupation}\n` : '') +
      (profile.education ? `• শিক্ষা: ${profile.education.toUpperCase()}\n` : '') +
      `\nসম্পূর্ণ বায়োডাটা দেখতে লিংকে ক্লিক করুন:\n${currentUrl}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('বায়োডাটার লিংক কপি করা হয়েছে!');
  };

  const handleBlockUser = async () => {
    if (!userId) return;
    if (!window.confirm('আপনি কি সত্যিই এই প্রোফাইলটি ব্লক করতে চান? ব্লক করলে তার কোনো তথ্য দেখতে পাবেন না।')) {
      return;
    }
    try {
      setIsBlocking(true);
      await blocksApi.blockUser(userId, 'ইউজার দ্বারা ব্লককৃত');
      toast.success('প্রোফাইলটি সফলভাবে ব্লক করা হয়েছে।');
      navigate('/search');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'ব্লক করতে সমস্যা হয়েছে।';
      toast.error(msg);
    } finally {
      setIsBlocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="বায়োডাটা লোড হচ্ছে..." />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-gray-200 text-center space-y-4 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">বায়োডাটা প্রদর্শনে অনুপলব্ধ</h2>
        <p className="text-sm text-gray-600">
          এই বায়োডাটাটি হয়তো মুছে ফেলা হয়েছে, প্রাইভেট রাখা হয়েছে অথবা আপনাকে দেখতে অনুমতি দেয়া হয়নি।
        </p>
        <div className="pt-2">
          <Link
            to={demo ? '/demo' : '/search'}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>অনুসন্ধানে ফিরে যান</span>
          </Link>
        </div>
      </div>
    );
  }

  const isMale = profile.gender === Gender.MALE;
  const upazilaBangla =
    UPAZILA_DISPLAY_NAMES[profile.upazila as TangailUpazila] || profile.upazila;

  const targetUserId =
    typeof profile.user === 'string' ? profile.user : profile.user?._id || profile.user?.id || profile._id;

  const isOwnProfile =
    currentUser &&
    (currentUser.id === targetUserId ||
      (typeof profile.user === 'object' && profile.user?._id === currentUser.id));

  const primaryPhoto = profile.photos?.find((p) => p.isProfilePhoto) || profile.photos?.[0];
  const isBlurred = Boolean(primaryPhoto?.blurPhoto || profile.photoPrivacy === 'on_interest_accepted');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:m-0 print:max-w-full">
      {demo && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 print:hidden">
          <strong>নমুনা বায়োডাটা</strong> — এই প্রোফাইলটি কাল্পনিক, শুধু উদাহরণ দেখানোর জন্য।{' '}
          <Link to="/demo" className="font-bold underline">
            সব নমুনা দেখুন
          </Link>
        </div>
      )}

      {/* Print-Only Header */}
      <div className="hidden print:block border-b-2 border-rose-600 pb-4 mb-6 text-center">
        <h1 className="text-2xl font-black text-rose-700">মধুবন্ধন — Tangail Matrimony</h1>
        <p className="text-xs text-gray-600">টাঙ্গাইল জেলার পাত্র-পাত্রীর সম্পূর্ণ পারিবারিক বায়োডাটা</p>
        {profile.biodataId && (
          <span className="inline-block mt-1 font-mono font-bold text-sm bg-gray-100 px-3 py-0.5 rounded-full border">
            বায়োডাটা নং: {profile.biodataId}
          </span>
        )}
      </div>

      {/* Navigation & Utilities Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>পূর্ববর্তী পৃষ্ঠায় ফিরুন</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs transition-colors cursor-pointer"
            title="পারিবারিক আলোচনার জন্য হোয়াটসঅ্যাপে শেয়ার করুন"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-500" />
            <span>হোয়াটসঅ্যাপে শেয়ার</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-250 shadow-2xs transition-colors cursor-pointer"
            title="বায়োডাটার লিংক কপি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-gray-500" />
            <span>লিংক কপি</span>
          </button>

          {!isOwnProfile && !demo && (
            <button
              type="button"
              onClick={handleToggleShortlist}
              disabled={isShortlistBusy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                isShortlisted
                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                  : 'bg-white text-gray-700 border-gray-250 hover:bg-gray-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-rose-600 text-rose-600' : ''}`} />
              <span>{isShortlisted ? 'শর্টলিস্ট করা আছে' : 'শর্টলিস্টে রাখুন'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintBiodata}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white hover:bg-gray-50 text-gray-700 border border-gray-250 shadow-2xs transition-colors cursor-pointer"
            title="বায়োডাটা প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন"
          >
            <Printer className="w-3.5 h-3.5 text-rose-600" />
            <span>প্রিন্ট / PDF</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6 print:border-none print:shadow-none print:p-0">
        <div className="relative w-28 h-28 rounded-full overflow-hidden shadow-lg border-3 border-rose-200 shrink-0 bg-rose-100 flex items-center justify-center">
          {primaryPhoto?.url ? (
            <>
              <img
                src={primaryPhoto.url}
                alt={profile.displayName}
                className={`w-full h-full object-cover ${isBlurred ? 'filter blur-md scale-110' : ''}`}
              />
              {isBlurred && (
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white p-1">
                  <EyeOff className="w-6 h-6 text-white drop-shadow-md" />
                  <span className="text-[10px] font-bold">পর্দাশীল বায়োডাটা</span>
                </div>
              )}
            </>
          ) : (
            <span className="text-4xl font-extrabold text-rose-600">
              {profile.displayName?.charAt(0) || (isMale ? 'পা' : 'পা')}
            </span>
          )}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {profile.displayName}
            </h1>
            {profile.biodataId && (
              <span className="text-xs font-black tracking-wider px-3 py-1 rounded-full bg-slate-900 text-amber-300 border border-amber-400/30">
                {profile.biodataId}
              </span>
            )}
            {profile.isApproved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ভেরিফাইড বায়োডাটা
              </span>
            )}
            {compatibility && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-linear-to-r from-amber-50 to-rose-50 text-rose-700 border border-rose-200 shadow-2xs"
                title={compatibility.reasons.join(' • ')}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>{compatibility.score}% মিল ({compatibility.label})</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-gray-600 font-medium">
            <span className="flex items-center gap-1 text-rose-600 font-bold">
              <Sparkles className="w-4 h-4" />
              {isMale ? 'পাত্র (বর)' : 'পাত্রী (কনে)'} • {profile.age ? `${profile.age} বছর` : ''}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-rose-500" />
              {upazilaBangla}, টাঙ্গাইল
            </span>
          </div>

          {profile.bio && (
            <p className="text-sm text-gray-650 pt-2 italic max-w-2xl leading-relaxed">
              "{profile.bio}"
            </p>
          )}
        </div>

        {/* Action Buttons (Hidden on Print) */}
        {!demo && !isOwnProfile && (
          <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto print:hidden">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) navigate('/login');
                else setIsInterestOpen(true);
              }}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 py-3 px-6 text-sm font-bold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 hover:shadow-lg transition-all cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>আগ্রহ পাঠান</span>
            </button>

            {isAuthenticated && (
              <button
                type="button"
                disabled={contactBusy}
                className="text-xs text-rose-700 font-semibold p-2.5 border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                onClick={async () => {
                  if (!userId) return;
                  setContactBusy(true);
                  try {
                    await workflowApi.requestContact(userId);
                    toast.success('যোগাযোগের অনুরোধ পাঠানো হয়েছে');
                    navigate('/contacts');
                  } catch (error) {
                    toast.error(errorMessage(error));
                  } finally {
                    setContactBusy(false);
                  }
                }}
              >
                অভিভাবকের যোগাযোগের অনুমতি চান
              </button>
            )}

            {isAuthenticated && (
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="p-2 text-xs font-medium text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="রিপোর্ট করুন"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>রিপোর্ট</span>
                </button>
                <button
                  type="button"
                  disabled={isBlocking}
                  onClick={handleBlockUser}
                  className="p-2 text-xs font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="ব্লক করুন"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>ব্লক</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BiodataInfoTables profile={profile} />

      {/* Safety Notice Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-850 leading-relaxed print:mt-6">
        <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">সতর্কতামূলক পরামর্শ:</strong>
          মধুবন্ধনে কোনো পাত্র বা পাত্রীর অভিভাবকের সম্মতি ছাড়া ব্যক্তিগত নম্বর প্রকাশ করা হয় না। উভয় পক্ষ
          সম্মতি জানালে তবেই পারিবারিক বৈঠকে অংশগ্রহণ করুন। যে কোনো সন্দেহজনক কার্যকলাপে "রিপোর্ট" বাটন
          ব্যবহার করুন।
        </div>
      </div>

      {/* Modals */}
      <SendInterestModal
        isOpen={isInterestOpen}
        onClose={() => setIsInterestOpen(false)}
        profile={profile}
      />
      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        targetUserId={targetUserId || ''}
        targetName={profile.displayName}
      />
    </div>
  );
};

export default ProfileDetailPage;
