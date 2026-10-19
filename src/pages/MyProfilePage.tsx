import BiodataDashboard from '../components/profile/BiodataDashboard';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import {
  User as UserIcon,
  Edit3,
  Eye,
  Shield,
  CheckCircle2,
  AlertCircle,
  Lock,
  Trash2,
  PauseCircle,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { profilesApi } from '../api/profiles.api';
import { authApi } from '../api/auth.api';
import { useAuth } from '../context/useAuth';
import { UPAZILA_DISPLAY_NAMES, TangailUpazila } from '../constants/locations';
import PhotoManager from '../components/profile/PhotoManager';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const MyProfilePage: React.FC = () => <><BiodataDashboard /><PublishedProfileContent /></>;

const PublishedProfileContent: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPwSubmitting, setIsPwSubmitting] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profilesApi.getOwnProfile(),
  });

  const profile = data?.data?.profile;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('নতুন পাসওয়ার্ড মেলেনি।');
      return;
    }
    try {
      setIsPwSubmitting(true);
      await authApi.changePassword({ currentPassword, newPassword, confirmNewPassword });
      toast.success('পাসওয়ার্ড পরিবর্তিত হয়েছে। আবার লগইন করুন।');
      await logout();
      navigate('/login');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।';
      toast.error(msg);
    } finally {
      setIsPwSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় করতে চান?')) {
      return;
    }
    try {
      await profilesApi.deactivateAccount();
      toast.info('আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।');
      await logout();
      navigate('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'নিষ্ক্রিয় করতে সমস্যা হয়েছে।';
      toast.error(msg);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('সতর্কতা: অ্যাকাউন্ট মুছে ফেললে আপনার সকল তথ্য ও বায়োডাটা চিরতরে মুছে যাবে। আপনি কি নিশ্চিত?')) {
      return;
    }
    try {
      await profilesApi.deleteAccount();
      toast.info('আপনার অ্যাকাউন্ট মুছে ফেলা হয়েছে।');
      await logout();
      navigate('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'অ্যাকাউন্ট মুছতে সমস্যা হয়েছে।';
      toast.error(msg);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex justify-center">
        <LoadingSpinner size="lg" label="প্রোফাইল তথ্য লোড হচ্ছে..." />
      </div>
    );
  }

  // If no profile found yet
  if (!profile) {
    return (
      <div className="mb-card max-w-2xl mx-auto my-16 p-8 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto">
          <UserIcon className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-ink">আপনার প্রকাশিত বায়োডাটা এখনও নেই</h2>
        <p className="text-sm text-ink-2 max-w-md mx-auto leading-relaxed">
          টাঙ্গাইলের উপযুক্ত জীবনসঙ্গী খুঁজতে এবং অন্যদের সাথে সংযুক্ত হতে অনুগ্রহ করে আপনার বায়োডাটা সম্পন্ন
          করুন।
        </p>
        <div>
          <Link
            to="/edit-profile"
            className="mb-btn-primary py-3 px-6 text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
            <span>এখনই বায়োডাটা তৈরি করুন</span>
          </Link>
        </div>
      </div>
    );
  }

  const upazilaBangla =
    UPAZILA_DISPLAY_NAMES[profile.upazila as TangailUpazila] || profile.upazila;

  const targetUserId =
    typeof profile.user === 'string' ? profile.user : profile.user?._id || user?.id;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Overview Card */}
      <div className="mb-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
          <div className="w-24 h-24 rounded-full bg-linear-to-tr from-brand to-pink-500 text-white flex items-center justify-center text-3xl font-extrabold shadow-lg shadow-rose-200 shrink-0">
            {profile.displayName?.charAt(0) || 'ম'}
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl font-black text-ink">{profile.displayName}</h1>
              {profile.biodataId && (
                <span className="text-xs font-black tracking-wider px-2.5 py-0.5 rounded-full bg-gold-soft text-gold border border-gold/25 shadow-2xs">
                  {profile.biodataId}
                </span>
              )}
              {profile.isApproved ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  অনুমোদিত
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gold-soft text-gold border border-gold/25">
                  <AlertCircle className="w-3.5 h-3.5" />
                  প্রকাশিত নয়
                </span>
              )}
            </div>

            <p className="text-xs text-ink-3">{user?.email}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-ink-2 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                {upazilaBangla}, টাঙ্গাইল
              </span>
              <span>•</span>
              <span>{profile.age ? `${profile.age} বছর` : ''}</span>
              <span>•</span>
              <span className="capitalize">{profile.gender === 'male' ? 'পাত্র' : 'পাত্রী'}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            to="/edit-profile"
            className="mb-btn-primary py-2.5 px-4 text-xs rounded-xl inline-flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>বায়োডাটা সম্পাদনা</span>
          </Link>
          {targetUserId && (
            <Link
              to={`/profiles/${targetUserId}`}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold text-brand bg-brand-soft hover:bg-brand/20 rounded-xl border border-brand/40 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>পাবলিক ভিউ</span>
            </Link>
          )}
        </div>
      </div>

      {/* Completion Percentage Progress */}
      <div className="mb-card p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-ink-2">বায়োডাটা সম্পূর্ণতার হার</span>
          <span className="text-brand">{profile.completionPercentage || 0}% সম্পূর্ণ</span>
        </div>
        <div className="w-full bg-elev h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-linear-to-r from-brand to-pink-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${profile.completionPercentage || 0}%` }}
          />
        </div>
        <p className="text-[11px] text-ink-3">
          যত বেশি তথ্য যুক্ত করবেন, আপনার বায়োডাটার গ্রহণযোগ্যতা ও উপযুক্ত পাত্র-পাত্রী প্রাপ্তির সম্ভাবনা
          ততই বৃদ্ধি পাবে।
        </p>
      </div>

      {/* Photo Management & Purdah Settings */}
      <PhotoManager
        photos={profile.photos || []}
        currentPrivacy={profile.photoPrivacy || 'public'}
      />

      {/* Account Settings & Security */}
      <div className="mb-card p-6 sm:p-8 rounded-3xl space-y-6">
        <h3 className="text-lg font-bold text-ink border-b border-line pb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-brand" />
          <span>অ্যাকাউন্ট নিরাপত্তা ও সেটিংস</span>
        </h3>

        {/* Change Password Collapsible */}
        <div>
          <button
            type="button"
            onClick={() => setIsChangingPassword(!isChangingPassword)}
            className="text-xs font-bold text-brand hover:text-brand/80 flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{isChangingPassword ? 'পাসওয়ার্ড পরিবর্তন বন্ধ করুন' : 'পাসওয়ার্ড পরিবর্তন করুন'}</span>
          </button>

          {isChangingPassword && (
            <form onSubmit={handleChangePassword} className="mt-4 max-w-md space-y-3 p-4 bg-elev border border-line rounded-xl">
              <div>
                <label className="mb-label !text-[11px]">বর্তমান পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="mb-input w-full"
                />
              </div>
              <div>
                <label className="mb-label !text-[11px]">নতুন পাসওয়ার্ড</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="mb-input w-full"
                />
              </div>
              <div>
                <label className="mb-label !text-[11px]">নতুন পাসওয়ার্ড নিশ্চিত করুন</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="mb-input w-full"
                />
              </div>
              <button
                type="submit"
                disabled={isPwSubmitting}
                className="mb-btn-primary py-2 px-4 text-xs rounded-lg cursor-pointer"
              >
                {isPwSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'পাসওয়ার্ড আপডেট করুন'}
              </button>
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-ink block">অ্যাকাউন্ট নিয়ন্ত্রণ</span>
            <span className="text-[11px] text-ink-3 block">
              বিয়ে ঠিক হয়ে গেলে অথবা সাময়িক বিরতির জন্য অ্যাকাউন্ট স্থগিত বা মুছে ফেলতে পারেন।
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDeactivate}
              className="px-3.5 py-2 text-xs font-semibold text-gold bg-gold-soft hover:bg-gold/20 rounded-lg border border-gold/25 cursor-pointer flex items-center gap-1.5"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>নিষ্ক্রিয় করুন</span>
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2 text-xs font-semibold text-brand bg-brand-soft hover:bg-brand/20 rounded-lg border border-brand/40 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>স্থায়ীভাবে মুছুন</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
