import BiodataInfoTables from '../components/profile/BiodataInfoTables';
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  MapPin,
  Shield,
  AlertTriangle,
  Ban,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { getDemoProfile } from '../data/demoProfiles';
import { profilesApi } from '../api/profiles.api';
import { workflowApi, errorMessage } from '../api/workflow.api';
import { blocksApi } from '../api/blocks.api';
import { Gender } from '../types';
import { UPAZILA_DISPLAY_NAMES, TangailUpazila } from '../constants/locations';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SendInterestModal from '../components/profile/SendInterestModal';
import ReportModal from '../components/profile/ReportModal';
import { useAuth } from '../context/useAuth';

export const ProfileDetailPage: React.FC<{ demo?: boolean }> = ({ demo = false }) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuth();

  const [isInterestOpen, setIsInterestOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [contactBusy, setContactBusy] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-profile', demo, userId, currentUser?.id || currentUser?._id || 'guest'],
    queryFn: () => demo ? getDemoProfile(userId || '') : profilesApi.getPublicProfile(userId || ''),
    enabled: !!userId,
  });

  const profile = data?.data?.profile;

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

  const isOwnProfile =
    currentUser &&
    (currentUser.id === userId ||
      (typeof profile.user === 'object' && profile.user?._id === currentUser.id));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {demo && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>নমুনা বায়োডাটা</strong> — এই প্রোফাইলটি কাল্পনিক, শুধু উদাহরণ দেখানোর জন্য। <Link to="/demo" className="font-bold underline">সব নমুনা দেখুন</Link></div>}
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-rose-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>পূর্ববর্তী পৃষ্ঠায় ফিরুন</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-rose-100 shadow-md p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="w-28 h-28 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center text-4xl font-extrabold shadow-lg shadow-rose-200 shrink-0">
          {profile.displayName?.charAt(0) || (isMale ? 'পা' : 'পা')}
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
              {profile.displayName}
            </h1>
            {profile.isApproved && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ভেরিফাইড বায়োডাটা
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm text-gray-600 font-medium">
            <span className="flex items-center gap-1 text-rose-600 font-bold">
              <Sparkles className="w-4 h-4" />
              {isMale ? 'পাত্র' : 'পাত্রী'} • {profile.age ? `${profile.age} বছর` : ''}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-rose-500" />
              {upazilaBangla}, টাঙ্গাইল
            </span>
          </div>

        </div>

        {/* Action Buttons */}
        {!demo && !isOwnProfile && (
          <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
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

            {isAuthenticated && <button type="button" disabled={contactBusy} className="text-xs text-rose-700 p-2 border rounded-xl disabled:opacity-40" onClick={async()=>{if(!userId)return;setContactBusy(true);try{await workflowApi.requestContact(userId);toast.success('যোগাযোগের অনুরোধ পাঠানো হয়েছে');navigate('/contacts');}catch(error){toast.error(errorMessage(error));}finally{setContactBusy(false);}}}>অভিভাবকের যোগাযোগের অনুমতি চান</button>}
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
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-3 text-xs text-amber-850 leading-relaxed">
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
        targetUserId={userId || ''}
        targetName={profile.displayName}
      />
    </div>
  );
};

export default ProfileDetailPage;
