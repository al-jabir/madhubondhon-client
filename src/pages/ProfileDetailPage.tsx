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
  MessageCircle,
  Copy,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { getDemoProfile } from '../data/demoProfiles';
import { profilesApi } from '../api/profiles.api';
import { adminApi } from '../api/admin.api';
import { workflowApi, errorMessage } from '../api/workflow.api';
import { blocksApi } from '../api/blocks.api';
import { shortlistApi } from '../api/shortlist.api';
import { calculateCompatibility } from '../utils/compatibility';
import { Gender } from '../types';
import { getUpazilaDisplayName } from '../constants/locations';
import LoadingSpinner from '../components/common/LoadingSpinner';
import GenderAvatar from '../components/common/GenderAvatar';
import SendInterestModal from '../components/profile/SendInterestModal';
import ReportModal from '../components/profile/ReportModal';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useAuth } from '../context/useAuth';
import { useLanguage } from '../i18n/LanguageContext';

export const ProfileDetailPage: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated, user: currentUser } = useAuth();
  const { isBengali, formatNumber } = useLanguage();

  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);
  const [isShortlistBusy, setIsShortlistBusy] = useState(false);

  // Public platform settings check for demo profiles
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

  const isDemoId = demo;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-profile', demo, isDemoEnabled, userId, currentUser?.id || currentUser?._id || 'guest'],
    queryFn: () => demo ? Promise.resolve(getDemoProfile(userId || '')) : profilesApi.getPublicProfile(userId || ''),
    enabled: !!userId && (!demo || isDemoEnabled),
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
      toast.info(isBengali ? 'বায়োডাটা শর্টলিস্ট করতে প্রথমে লগইন করুন।' : 'Please log in to shortlist this biodata.');
      navigate('/login');
      return;
    }

    try {
      setIsShortlistBusy(true);
      if (isShortlisted) {
        await shortlistApi.removeFromShortlist(profile._id);
        toast.info(isBengali ? 'বায়োডাটাটি শর্টলিস্ট থেকে সরানো হয়েছে।' : 'Biodata removed from shortlist.');
      } else {
        await shortlistApi.addToShortlist(profile._id);
        toast.success(isBengali ? 'বায়োডাটাটি পছন্দের তালিকায় সংরক্ষিত হয়েছে!' : 'Biodata saved to shortlist!');
      }
      queryClient.invalidateQueries({ queryKey: ['shortlist-check', profile._id] });
      queryClient.invalidateQueries({ queryKey: ['my-shortlist'] });
    } catch {
      toast.error(isBengali ? 'শর্টলিস্ট আপডেট ব্যর্থ হয়েছে।' : 'Failed to update shortlist.');
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
    const upName = getUpazilaDisplayName(profile.upazila, isBengali);
    const bioId = profile.biodataId ? ` (${isBengali ? 'বায়োডাটা কোড' : 'Biodata Code'}: ${profile.biodataId})` : '';
    const text = isBengali
      ? `আসসালামু আলাইকুম। মধুবন্ধন টাঙ্গাইল মেট্রিমনিতে একটি উপযুক্ত বায়োডাটা${bioId}:\n\n` +
        `• পরিচিতি: ${profile.displayName}\n` +
        `• বয়স: ${profile.age ? `${formatNumber(profile.age)} বছর` : 'প্রাপ্তবয়স্ক'}\n` +
        `• এলাকা: ${upName}, টাঙ্গাইল\n` +
        (profile.occupation ? `• পেশা: ${profile.occupation}\n` : '') +
        (profile.education ? `• শিক্ষা: ${profile.education.toUpperCase()}\n` : '') +
        `\nসম্পূর্ণ বায়োডাটা দেখতে লিংকে ক্লিক করুন:\n${currentUrl}`
      : `Assalamu Alaikum. Check out this matrimonial biodata on MadhuBondhon${bioId}:\n\n` +
        `• Name: ${profile.displayName}\n` +
        `• Age: ${profile.age ? `${profile.age} years` : 'Adult'}\n` +
        `• Location: ${upName}, Tangail\n` +
        (profile.occupation ? `• Occupation: ${profile.occupation}\n` : '') +
        (profile.education ? `• Education: ${profile.education.toUpperCase()}\n` : '') +
        `\nView complete biodata here:\n${currentUrl}`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success(isBengali ? 'বায়োডাটার লিংক কপি করা হয়েছে!' : 'Biodata link copied to clipboard!');
  };

  const handleBlockUser = () => {
    if (!userId) return;
    setIsBlockConfirmOpen(true);
  };

  const confirmBlockUser = async () => {
    if (!userId) return;
    try {
      setIsBlocking(true);
      await blocksApi.blockUser(userId, isBengali ? 'ইউজার দ্বারা ব্লককৃত' : 'Blocked by user');
      toast.success(isBengali ? 'প্রোফাইলটি সফলভাবে ব্লক করা হয়েছে।' : 'Profile has been blocked.');
      navigate('/search');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'ব্লক করতে সমস্যা হয়েছে।' : 'Failed to block user.');
      toast.error(msg);
    } finally {
      setIsBlocking(false);
      setIsBlockConfirmOpen(false);
    }
  };

  if (isDemoId && !isDemoEnabled) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 mb-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
          <EyeOff className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-ink">
          {isBengali ? 'নমুনা বায়োডাটা প্রদর্শন নিষ্ক্রিয় রয়েছে' : 'Demo Profiles are Disabled'}
        </h2>
        <p className="text-sm text-ink-2">
          {isBengali
            ? 'প্ল্যাটফর্ম অ্যাডমিনিস্ট্রেটর কর্তৃক নমুনা বায়োডাটা সাময়িকভাবে লুকানো হয়েছে। বাস্তব বায়োডাটা দেখতে মূল অনুসন্ধানে যান।'
            : 'Demo biodatas have been temporarily disabled by the platform administrator. Browse real profiles to continue.'}
        </p>
        <div className="pt-2">
          <Link to="/search" className="mb-btn mb-btn-primary text-xs inline-flex items-center gap-2">
            <span>{isBengali ? 'বাস্তব বায়োডাটা খুঁজুন' : 'Search Real Profiles'}</span>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label={isBengali ? "বায়োডাটা লোড হচ্ছে..." : "Loading biodata..."} />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 mb-card text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-ink">
          {isBengali ? 'বায়োডাটা প্রদর্শনে অনুপলব্ধ' : 'Biodata Unavailable'}
        </h2>
        <p className="text-sm text-ink-2">
          {isBengali
            ? 'এই বায়োডাটাটি হয়তো মুছে ফেলা হয়েছে, প্রাইভেট রাখা হয়েছে অথবা আপনাকে দেখতে অনুমতি দেয়া হয়নি।'
            : 'This biodata may have been removed, set to private, or you do not have permission to view it.'}
        </p>
        <div className="pt-2">
          <Link to={demo ? '/demo' : '/search'} className="mb-btn-secondary text-xs inline-flex">
            <ArrowLeft className="w-4 h-4" />
            <span>{isBengali ? 'অনুসন্ধানে ফিরে যান' : 'Back to Search'}</span>
          </Link>
        </div>
      </div>
    );
  }

  const isMale = profile.gender === Gender.MALE;
  const upazilaBangla = getUpazilaDisplayName(profile.upazila, isBengali);

  const targetUserId =
    typeof profile.user === 'string' ? profile.user : profile.user?._id || profile.user?.id || profile._id;

  const isOwnProfile =
    currentUser &&
    (currentUser.id === targetUserId ||
      (typeof profile.user === 'object' && profile.user?._id === currentUser.id));

  // Members' original photos are never displayed publicly — the hero uses a
  // gender-based illustrated avatar (see GenderAvatar).

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 print:p-0 print:m-0 print:max-w-full">
      {(demo || isDemoId) && (
        <div className="rounded-2xl bg-gold-soft border border-gold/25 p-4 text-sm text-gold print:hidden">
          <strong>{isBengali ? 'নমুনা বায়োডাটা' : 'Demo Profile'}</strong> —{' '}
          {isBengali
            ? 'এই প্রোফাইলটি কাল্পনিক, শুধু উদাহরণ দেখানোর জন্য।'
            : 'This profile is fictional and for demonstration purposes only.'}{' '}
          <Link to="/search" className="font-bold underline">
            {isBengali ? 'সব বায়োডাটা দেখুন' : 'View all profiles'}
          </Link>
        </div>
      )}

      {/* Print-only header */}
      <div className="hidden print:block border-b-2 border-brand pb-4 mb-6 text-center">
        <h1 className="text-2xl font-black text-brand">মধুবন্ধন — Tangail Matrimony</h1>
        <p className="text-xs text-gray-600">
          {isBengali
            ? 'টাঙ্গাইল জেলার পাত্র-পাত্রীর সম্পূর্ণ পারিবারিক বায়োডাটা'
            : 'Comprehensive Matrimonial Biodata from Tangail'}
        </p>
        {profile.biodataId && (
          <span className="inline-block mt-1 font-mono font-bold text-sm bg-gray-100 px-3 py-0.5 rounded-full border">
            {isBengali ? `বায়োডাটা নং: ${profile.biodataId}` : `Biodata ID: ${profile.biodataId}`}
          </span>
        )}
      </div>

      {/* Navigation & utilities bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-3 hover:text-brand transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBengali ? 'পূর্ববর্তী পৃষ্ঠায় ফিরুন' : 'Back to Previous Page'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="mb-btn-secondary !text-xs !border-emerald-300 dark:!border-emerald-800 hover:!text-emerald-700 gap-1.5 bg-elev"
            title={isBengali ? 'পারিবারিক আলোচনার জন্য হোয়াটসঅ্যাপে শেয়ার করুন' : 'Share on WhatsApp for family discussion'}
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100 dark:fill-transparent" />
            <span>{isBengali ? 'হোয়াটসঅ্যাপে শেয়ার' : 'Share on WhatsApp'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="mb-btn-secondary !px-3 gap-1.5 !text-xs"
            title={isBengali ? 'বায়োডাটার লিংক কপি করুন' : 'Copy biodata link'}
          >
            <Copy className="w-3.5 h-3.5 text-ink-3" />
            <span>{isBengali ? 'লিংক কপি' : 'Copy Link'}</span>
          </button>

          {!isOwnProfile && !demo && (
            <button
              type="button"
              onClick={handleToggleShortlist}
              disabled={isShortlistBusy}
              className={`mb-btn-secondary !px-3 gap-1.5 !text-xs ${isShortlisted ? '!text-brand !border-brand/50 !bg-brand-soft' : ''}`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isShortlisted ? 'fill-brand text-brand' : 'text-ink-3'}`} />
              <span>
                {isShortlisted
                  ? isBengali
                    ? 'শর্টলিস্ট করা আছে'
                    : 'Shortlisted'
                  : isBengali
                  ? 'শর্টলিস্টে রাখুন'
                  : 'Shortlist'}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrintBiodata}
            className="mb-btn-secondary !px-3 gap-1.5 !text-xs"
            title={isBengali ? 'বায়োডাটা প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন' : 'Print or save biodata as PDF'}
          >
            <Printer className="w-3.5 h-3.5 text-brand" />
            <span>{isBengali ? 'প্রিন্ট / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* Hero header card */}
      <div className="relative mb-card rounded-[1.5rem] p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-7 print:border-none print:shadow-none print:p-0 overflow-hidden">
        {/* decorative corner wash */}
        <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-brand-soft/70 blur-3xl -z-0 pointer-events-none max-md:hidden" aria-hidden="true" />

        <div className="relative shrink-0 mx-auto md:mx-0">
          <div className="absolute -inset-1.5 rounded-full bg-linear-to-br from-brand/60 via-pink-500/40 to-transparent opacity-70" aria-hidden="true" />
          <div className="relative w-32 h-32 rounded-full shadow-lg border-3 border-card">
            <GenderAvatar
              gender={profile.gender}
              size={128}
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-3 relative">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink">
              {profile.displayName}
            </h1>
            {profile.biodataId && (
              <span className="text-xs font-black tracking-wider px-3 py-1 rounded-full bg-[#2b161f] text-gold border border-gold/30">
                {profile.biodataId}
              </span>
            )}
            {profile.isApproved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {isBengali ? 'প্রকাশিত বায়োডাটা' : 'Published Biodata'}
              </span>
            )}
            {compatibility && (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-soft text-gold border border-gold/30"
                title={compatibility.reasons.join(' • ')}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {isBengali
                    ? `${formatNumber(compatibility.score)}% মিল (${compatibility.label})`
                    : `${compatibility.score}% Match (${compatibility.label})`}
                </span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs sm:text-sm text-ink-2 font-medium">
            <span className="flex items-center gap-1 text-brand font-bold">
              <Sparkles className="w-4 h-4" />
              {isMale ? (isBengali ? 'পাত্র (বর)' : 'Groom') : isBengali ? 'পাত্রী (কনে)' : 'Bride'} •{' '}
              {profile.age ? (isBengali ? `${formatNumber(profile.age)} বছর` : `${profile.age} yrs`) : ''}
            </span>
            <span className="text-ink-3">•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-brand/70" />
              {upazilaBangla}, {isBengali ? 'টাঙ্গাইল' : 'Tangail'}
            </span>
          </div>

          {profile.bio && (
            <p className="text-sm text-ink-2 pt-2 italic max-w-2xl leading-relaxed border-l-2 border-brand/40 pl-3">
              "{profile.bio}"
            </p>
          )}
        </div>

        {/* Action buttons (hidden on print) */}
        {!demo && !isOwnProfile && (
          <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto print:hidden relative">
            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) navigate('/login');
                else setIsInterestOpen(true);
              }}
              className="mb-btn-primary flex-1 md:flex-initial py-3 px-6"
            >
              <Heart className="w-4 h-4 fill-current" />
              <span>{isBengali ? 'আগ্রহ পাঠান' : 'Send Interest'}</span>
            </button>

            {isAuthenticated && (
              <button
                type="button"
                disabled={contactBusy}
                className="mb-btn-secondary !text-xs text-center flex items-center justify-center disabled:opacity-40"
                onClick={async () => {
                  if (!userId) return;
                  setContactBusy(true);
                  try {
                    await workflowApi.requestContact(userId);
                    toast.success(isBengali ? 'যোগাযোগের অনুরোধ পাঠানো হয়েছে' : 'Contact request sent');
                    navigate('/contacts');
                  } catch (error) {
                    toast.error(errorMessage(error));
                  } finally {
                    setContactBusy(false);
                  }
                }}
              >
                {isBengali ? 'অভিভাবকের যোগাযোগের অনুমতি চান' : "Request Guardian's Contact"}
              </button>
            )}

            {isAuthenticated && (
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsReportOpen(true)}
                  className="p-2 text-xs font-medium text-gold hover:bg-gold-soft rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title={isBengali ? 'রিপোর্ট করুন' : 'Report'}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>{isBengali ? 'রিপোর্ট' : 'Report'}</span>
                </button>
                <button
                  type="button"
                  disabled={isBlocking}
                  onClick={handleBlockUser}
                  className="p-2 text-xs font-medium text-ink-3 hover:text-brand hover:bg-brand-soft rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title={isBengali ? 'ব্লক করুন' : 'Block'}
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isBengali ? 'ব্লক' : 'Block'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BiodataInfoTables profile={profile} />

      {/* Safety notice */}
      <div className="p-4 bg-gold-soft border border-gold/25 rounded-2xl flex items-start gap-3 text-xs text-gold leading-relaxed print:mt-6">
        <Shield className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-bold">
            {isBengali ? 'সতর্কতামূলক পরামর্শ:' : 'Safety Advisory:'}
          </strong>
          {isBengali
            ? 'মধুবন্ধনে কোনো পাত্র বা পাত্রীর অভিভাবকের সম্মতি ছাড়া ব্যক্তিগত নম্বর প্রকাশ করা হয় না। উভয় পক্ষ সম্মতি জানালে তবেই পারিবারিক বৈঠকে অংশগ্রহণ করুন। যে কোনো সন্দেহজনক কার্যকলাপে "রিপোর্ট" বাটন ব্যবহার করুন।'
            : 'Direct contact numbers are never disclosed on MadhuBondhon without guardian consent. Proceed to family meetings only after mutual consent. Please use the "Report" button if you notice anything suspicious.'}
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
      <ConfirmationModal
        isOpen={isBlockConfirmOpen}
        onClose={() => setIsBlockConfirmOpen(false)}
        onConfirm={confirmBlockUser}
        title={isBengali ? 'প্রোফাইল ব্লক নিশ্চিতকরণ' : 'Confirm Block Profile'}
        message={
          isBengali
            ? `আপনি কি সত্যিই ${profile?.displayName || 'এই ব্যবহারকারী'} এর প্রোফাইলটি ব্লক করতে চান? ব্লক করলে তার কোনো তথ্য দেখতে পাবেন না এবং তিনিও আপনার সাথে যোগাযোগ করতে পারবেন না।`
            : `Are you sure you want to block ${profile?.displayName || 'this user'}? You will not see their biodata anymore, and they will not be able to contact you.`
        }
        confirmText={isBengali ? 'ব্লক করুন' : 'Block'}
        variant="danger"
        isLoading={isBlocking}
      />
    </div>
  );
};

export default ProfileDetailPage;
