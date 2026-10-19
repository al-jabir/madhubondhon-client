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
  Sparkles,
  Plus,
  ArrowRight,
  LayoutDashboard,
  Image,
  Compass,
  ClipboardCheck,
  Settings,
  Heart,
  Bookmark,
  Contact,
  Gem,
  Mail,
} from 'lucide-react';
import { toast } from 'sonner';
import { profilesApi } from '../api/profiles.api';
import { authApi } from '../api/auth.api';
import { useAuth } from '../context/useAuth';
import { getUpazilaDisplayName, TangailUpazila } from '../constants/locations';
import PhotoManager from '../components/profile/PhotoManager';
import ProfileCard from '../components/profile/ProfileCard';
import GenderAvatar from '../components/common/GenderAvatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useLanguage } from '../i18n/LanguageContext';

type TabKey = 'overview' | 'photos' | 'recommendations' | 'verification' | 'settings';

export const MyProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const { isBengali } = useLanguage();

  const tabs: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
    { key: 'overview', label: isBengali ? 'সারসংক্ষেপ' : 'Overview', icon: LayoutDashboard },
    { key: 'photos', label: isBengali ? 'ছবি ও পর্দাশীলতা' : 'Photos & Privacy', icon: Image },
    { key: 'recommendations', label: isBengali ? 'পরামর্শ' : 'Matches', icon: Sparkles },
    { key: 'verification', label: isBengali ? 'যাচাই ও জমা' : 'Verification', icon: ClipboardCheck },
    { key: 'settings', label: isBengali ? 'অ্যাকাউন্ট সেটিংস' : 'Account Settings', icon: Settings },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Sticky segmented tab bar */}
      <div className="sticky top-16 z-20 bg-base/90 backdrop-blur-md border-b border-line">
        <nav
          className="max-w-6xl mx-auto px-4 flex items-center gap-1.5 overflow-x-auto py-2.5"
          style={{ scrollbarWidth: 'none' }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-brand text-white shadow-md shadow-brand/25'
                    : 'text-ink-2 bg-elev hover:text-brand hover:bg-brand-soft border border-transparent hover:border-brand/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="px-4 sm:px-6 py-8 pb-16">
        {activeTab === 'overview' && <OverviewTab onNavigateTab={setActiveTab} />}
        {activeTab === 'photos' && <PhotosTab />}
        {activeTab === 'recommendations' && <RecommendationsTab />}
        {activeTab === 'verification' && <BiodataDashboard />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

/* ═══════════════ Shared profile data hook ═══════════════ */
const useMyProfile = () => {
  const base = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profilesApi.getOwnProfile(),
  });
  const profile = base.data?.data?.profile;

  const completion = useQuery({
    queryKey: ['my-profile', 'completion'],
    queryFn: () => profilesApi.getCompletion(),
    enabled: !!profile,
  });

  return {
    isLoading: base.isLoading,
    profile,
    completion: completion.data?.data?.completion,
  };
};

/* ═══════════════ Hero + stats + overview card ═══════════════ */
const OverviewTab: React.FC<{ onNavigateTab: (t: TabKey) => void }> = ({ onNavigateTab }) => {
  const { profile } = useMyProfile();
  const { user } = useAuth();
  const { isBengali, formatNumber } = useLanguage();

  if (!profile) return <ProfileMissing />;

  const upazilaName = getUpazilaDisplayName(profile.upazila, isBengali);

  const targetUserId =
    typeof profile.user === 'string' ? profile.user : profile.user?._id || user?.id;

  const completionPercent = profile.completionPercentage ?? 0;
  const verifiedCount = (user?.isEmailVerified ? 1 : 0) + (user?.isPhoneVerified ? 1 : 0);

  const photoPrivacyLabels: Record<string, string> = {
    public: isBengali ? 'প্রকাশিত' : 'Public',
    on_interest_accepted: isBengali ? 'আগ্রহ গ্রহণের পর' : 'On Interest Accepted',
    hidden: isBengali ? 'গোপন' : 'Hidden',
  };

  const stats = [
    {
      label: isBengali ? 'সম্পূর্ণতা' : 'Completion',
      value: `${isBengali ? formatNumber(completionPercent) : completionPercent}%`,
      tone: completionPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gold',
      icon: Sparkles,
    },
    {
      label: isBengali ? 'প্রকাশের অবস্থা' : 'Approval Status',
      value: profile.isApproved
        ? isBengali
          ? 'অনুমোদিত'
          : 'Approved'
        : isBengali
        ? 'অপেক্ষমান'
        : 'Pending',
      tone: profile.isApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-gold',
      icon: profile.isApproved ? CheckCircle2 : AlertCircle,
    },
    {
      label: isBengali ? 'ইমেইল ও মোবাইল যাচাই' : 'Email & Phone Verified',
      value: isBengali ? `${formatNumber(verifiedCount)}/২` : `${verifiedCount}/2`,
      tone: verifiedCount === 2 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gold',
      icon: verifiedCount === 2 ? Shield : ClipboardCheck,
    },
    {
      label: isBengali
        ? `ছবি (পর্দাশীলতা: ${photoPrivacyLabels[profile.photoPrivacy || 'public'] || 'প্রকাশিত'})`
        : `Photos (${photoPrivacyLabels[profile.photoPrivacy || 'public'] || 'Public'})`,
      value: isBengali
        ? `${formatNumber((profile.photos || []).length)}টি`
        : `${(profile.photos || []).length}`,
      tone: 'text-brand',
      icon: Image,
    },
  ];

  const quickLinks = [
    {
      to: '/interests',
      icon: Heart,
      label: isBengali ? 'আগ্রহের তালিকা' : 'Interests',
      desc: isBengali ? 'পাঠানো ও প্রাপ্ত' : 'Sent & Received',
    },
    {
      to: '/shortlist',
      icon: Bookmark,
      label: isBengali ? 'পছন্দের তালিকা' : 'Shortlist',
      desc: isBengali ? 'সংরক্ষিত পাত্র-পাত্রী' : 'Saved Profiles',
    },
    {
      to: '/contacts',
      icon: Contact,
      label: isBengali ? 'যোগাযোগ' : 'Contacts',
      desc: isBengali ? 'অনুরোধ ও প্রাপ্তি' : 'Requests & Grants',
    },
    {
      to: '/packages',
      icon: Gem,
      label: isBengali ? 'প্যাকেজ' : 'Packages',
      desc: isBengali ? 'ক্রেডিট ও মূল্য' : 'Credits & Pricing',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Hero card ── */}
      <div className="relative overflow-hidden mb-card rounded-[2rem] px-6 sm:px-8 pt-10 pb-8">
        {/* decorative blobs */}
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-pink-500/8 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar with gradient halo */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div
              className="absolute -inset-2 rounded-full bg-linear-to-br from-brand/50 via-pink-500/30 to-transparent"
              aria-hidden="true"
            />
            <div className="relative rounded-full shadow-xl border-4 border-card w-28 h-28">
              <GenderAvatar gender={profile.gender} size={112} className="w-full h-full" />
              {profile.isApproved && (
                <span
                  title={isBengali ? 'ভেরিফাইড বায়োডাটা' : 'Verified Biodata'}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-3 border-card flex items-center justify-center"
                >
                  <CheckCircle2 className="w-4.5 h-4.5 text-white fill-none" />
                </span>
              )}
            </div>
          </div>

          {/* Identity */}
          <div className="flex-1 space-y-2.5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                {profile.displayName}
              </h1>
              {profile.biodataId && (
                <span className="text-xs font-black px-3 py-1 rounded-full bg-gold-soft text-gold border border-gold/25 font-mono">
                  {profile.biodataId}
                </span>
              )}
            </div>

            <p className="text-xs text-ink-3 flex items-center justify-center md:justify-start gap-1.5">
              <Mail className="w-3 h-3" />
              {user?.email}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand-ink border border-brand/20">
                <UserIcon className="w-3.5 h-3.5" />
                {profile.gender === 'male'
                  ? isBengali
                    ? 'পাত্র'
                    : 'Groom'
                  : isBengali
                  ? 'পাত্রী'
                  : 'Bride'}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elev text-ink-2 border border-line">
                <MapPin className="w-3.5 h-3.5 text-brand" />
                {upazilaName}, {isBengali ? 'টাঙ্গাইল' : 'Tangail'}
              </span>
              {profile.age ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elev text-ink-2 border border-line">
                  <span>{isBengali ? `${formatNumber(profile.age)} বছর` : `${profile.age} yrs`}</span>
                </span>
              ) : null}
              {profile.occupation && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elev text-ink-2 border border-line">
                  <span>{profile.occupation}</span>
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 shrink-0">
            <Link
              to="/edit-profile"
              className="mb-btn-primary py-2.5 px-5 text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-brand/20"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isBengali ? 'বায়োডাটা সম্পাদনা' : 'Edit Biodata'}</span>
            </Link>
            {targetUserId ? (
              <Link
                to={`/profiles/${targetUserId}`}
                className="inline-flex items-center gap-1.5 py-2.5 px-5 text-xs font-bold text-brand bg-brand-soft hover:bg-brand/20 rounded-xl border border-brand/40 transition-all hover:scale-[1.03]"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isBengali ? 'পাবলিক ভিউ' : 'Public View'}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* ── Stat strip ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="mb-card rounded-2xl p-4 sm:p-5 flex items-center gap-3.5">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-elev flex items-center justify-center border border-line">
                <Icon className={`w-4.5 h-4.5 ${stat.tone}`} />
              </div>
              <div className="min-w-0">
                <p className={`text-base sm:text-lg font-black leading-tight ${stat.tone}`}>
                  {stat.value}
                </p>
                <p className="text-[10.5px] text-ink-3 font-semibold truncate">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Overview: completion + quick links ── */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <CompletionCard onNavigateTab={onNavigateTab} />
        </div>

        <div className="lg:col-span-2 space-y-4">
          <h3 className="mb-section-title text-sm flex items-center gap-2 px-1">
            <Compass className="w-4 h-4 text-gold" />
            <span>{isBengali ? 'দ্রুত লিংক' : 'Quick Links'}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="mb-card rounded-2xl p-4 flex items-center gap-3.5 group transition-all hover:border-brand/30 hover:-translate-y-0.5 mb-card-hover"
                >
                  <div className="w-9 h-9 shrink-0 rounded-xl bg-brand-soft text-brand flex items-center justify-center transition-transform group-hover:scale-110">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-ink">{link.label}</p>
                    <p className="text-[10.5px] text-ink-3">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-ink-3 group-hover:text-brand transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════ Completion card (overview) ═══════════════ */
const CompletionCard: React.FC<{ onNavigateTab?: ((t: TabKey) => void) | undefined }> = ({
  onNavigateTab,
}) => {
  const { completion } = useMyProfile();
  const navigate = useNavigate();
  const { isBengali, formatNumber } = useLanguage();

  const completionPercent = completion?.percent ?? 0;
  const isProfileComplete = completionPercent >= 100;

  return (
    <div className="mb-card rounded-[2rem] p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Ring */}
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="9"
              style={{ stroke: 'var(--mb-line)' }}
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - completionPercent / 100)}
              style={{ stroke: isProfileComplete ? 'var(--mb-gold)' : 'var(--mb-brand)' }}
              className="transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isProfileComplete ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <span className="text-2xl font-black text-ink">
                {isBengali ? formatNumber(completionPercent) : completionPercent}%
              </span>
            )}
            <span className="text-[10px] text-ink-3 font-bold mt-0.5">
              {isProfileComplete
                ? isBengali
                  ? 'সম্পূর্ণ'
                  : 'Complete'
                : isBengali
                ? 'সম্পূর্ণতা'
                : 'Progress'}
            </span>
          </div>
        </div>

        {/* Message + missing chips */}
        <div className="flex-1 space-y-3 text-center sm:text-left">
          {isProfileComplete ? (
            <>
              <h3 className="text-lg font-black text-ink">
                {isBengali
                  ? 'আপনার প্রোফাইল সম্পূর্ণ! এখন পছন্দের সঙ্গী খুঁজুন।'
                  : 'Your profile is 100% complete! Explore prospective matches.'}
              </h3>
              <Link
                to="/search"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:text-brand/80"
              >
                <span>{isBengali ? 'পছন্দের সঙ্গী খুঁজুন' : 'Explore Matches'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <>
              <h3 className="text-lg font-black text-ink">
                {isBengali ? 'প্রোফাইল সম্পূর্ণ করুন' : 'Complete Your Profile'}
              </h3>
              <p className="text-xs text-ink-2 leading-relaxed">
                {isBengali
                  ? 'বাকি তথ্যগুলো যোগ করলে আপনার বায়োডাটা আরও সম্পূর্ণ ও আকর্ষণীয় হবে।'
                  : 'Adding complete information makes your biodata more attractive and credible.'}
              </p>
              {(completion?.missing?.length ?? 0) > 0 ? (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  {completion!.missing.map((field) => (
                    <button
                      key={field.key}
                      type="button"
                      onClick={() =>
                        field.key === 'photos' && onNavigateTab
                          ? onNavigateTab('photos')
                          : navigate('/edit-profile')
                      }
                      className="mb-badge cursor-pointer hover:bg-brand/15 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{field.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════ Photos tab ═══════════════ */
const PhotosTab: React.FC = () => {
  const { profile, isLoading } = useMyProfile();
  const { isBengali } = useLanguage();

  if (isLoading) return <TabLoader />;
  if (!profile) return <ProfileMissing />;

  return (
    <div className="space-y-4">
      <h2 className="mb-section-title text-lg flex items-center gap-2 px-1">
        <Image className="w-5 h-5 text-brand" />
        <span>{isBengali ? 'ছবি ব্যবস্থাপনা ও পর্দাশীলতা' : 'Photo Management & Privacy'}</span>
      </h2>
      <PhotoManager photos={profile.photos || []} currentPrivacy={profile.photoPrivacy || 'public'} />
    </div>
  );
};

/* ═══════════════ Recommendations tab ═══════════════ */
const RecommendationsTab: React.FC = () => {
  const { profile } = useMyProfile();
  const { isBengali } = useLanguage();
  const { data: recsData, isLoading } = useQuery({
    queryKey: ['profile-recommendations'],
    queryFn: () => profilesApi.getRecommendations(),
    enabled: !!profile,
  });

  const recommendations = recsData?.data?.profiles;

  if (isLoading || (!profile && !recsData)) return <TabLoader />;

  if (!profile) return <ProfileMissing />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="mb-section-title text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-gold" />
          <span>{isBengali ? 'আপনার জন্য পরামর্শ' : 'Recommended For You'}</span>
        </h2>
        <Link
          to="/search"
          className="inline-flex items-center gap-1 text-xs font-bold text-brand hover:text-brand/80"
        >
          <span>{isBengali ? 'সব দেখুন' : 'View All'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="mb-card rounded-3xl p-5 space-y-3 animate-pulse">
              <div className="w-20 h-20 rounded-full bg-elev mx-auto" />
              <div className="h-3.5 w-2/3 bg-elev rounded mx-auto" />
              <div className="h-3 w-1/2 bg-elev rounded mx-auto" />
              <div className="h-3 w-full bg-elev rounded" />
              <div className="h-8 w-full bg-elev rounded-lg" />
            </div>
          ))}
        </div>
      ) : !recommendations || recommendations.length === 0 ? (
        <div className="mb-card rounded-3xl p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-elev flex items-center justify-center mx-auto border border-line">
            <Sparkles className="w-6 h-6 text-ink-3" />
          </div>
          <p className="text-sm font-bold text-ink">
            {isBengali
              ? 'এখন কোনো পরামর্শ নেই — একটু পরে আবার দেখুন'
              : 'No recommendations at this time — please check back soon'}
          </p>
          <p className="text-xs text-ink-3 max-w-sm mx-auto leading-relaxed">
            {isBengali
              ? 'নতুন সদস্যরা যুক্ত হলে এখানে দেখতে পাবেন। ততক্ষণ পর্যন্ত সার্চ ব্যবহার করে খুঁজে দেখুন।'
              : 'As new members register, you will see recommendations here. Meanwhile, explore using search.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {recommendations.map((p) => (
            <ProfileCard key={p._id} profile={p} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════ Settings tab ═══════════════ */
const SettingsTab: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isBengali } = useLanguage();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isPwSubmitting, setIsPwSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'deactivate' | 'delete' | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error(isBengali ? 'নতুন পাসওয়ার্ড মেলেনি।' : 'New passwords do not match.');
      return;
    }
    try {
      setIsPwSubmitting(true);
      await authApi.changePassword({ currentPassword, newPassword, confirmNewPassword });
      toast.success(
        isBengali
          ? 'পাসওয়ার্ড পরিবর্তিত হয়েছে। আবার লগইন করুন।'
          : 'Password changed successfully. Please log in again.'
      );
      await logout();
      navigate('/login');
      setIsChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।' : 'Failed to change password.');
      toast.error(msg);
    } finally {
      setIsPwSubmitting(false);
    }
  };

  const executeDeactivate = async () => {
    try {
      setIsActionLoading(true);
      await profilesApi.deactivateAccount();
      toast.info(isBengali ? 'আপনার অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।' : 'Your account has been deactivated.');
      await logout();
      navigate('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'নিষ্ক্রিয় করতে সমস্যা হয়েছে।' : 'Failed to deactivate account.');
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
      setConfirmAction(null);
    }
  };

  const executeDelete = async () => {
    try {
      setIsActionLoading(true);
      await profilesApi.deleteAccount();
      toast.info(isBengali ? 'আপনার অ্যাকাউন্ট মুছে ফেলা হয়েছে।' : 'Your account has been deleted.');
      await logout();
      navigate('/login');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'অ্যাকাউন্ট মুছতে সমস্যা হয়েছে।' : 'Failed to delete account.');
      toast.error(msg);
    } finally {
      setIsActionLoading(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* — Password — */}
      <div className="mb-card rounded-[2rem] p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 pb-1">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
            <Lock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-black text-ink leading-tight">
              {isBengali ? 'নিরাপত্তা' : 'Security'}
            </h3>
            <p className="text-[11px] text-ink-3">
              {isBengali ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change your account password'}
            </p>
          </div>
        </div>

        {!isChangingPassword ? (
          <div className="bg-elev rounded-2xl p-4 flex items-center justify-between gap-3 border border-line">
            <div>
              <p className="text-xs font-bold text-ink">
                {isBengali ? 'বর্তমান অ্যাকাউন্ট: ' : 'Account: '}
                <span className="text-ink-2 font-semibold">{user?.email}</span>
              </p>
              <p className="text-[10.5px] text-ink-3 mt-0.5">
                {isBengali
                  ? 'মাঝে মাঝে পাসওয়ার্ড পরিবর্তন করলে অ্যাকাউন্ট নিরাপদ থাকে।'
                  : 'Regularly updating your password keeps your account secure.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChangingPassword(true)}
              className="mb-btn-primary !text-xs py-2 px-4 rounded-xl cursor-pointer shrink-0 whitespace-nowrap"
            >
              <span>{isBengali ? 'পরিবর্তন করুন' : 'Change Password'}</span>
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleChangePassword}
            className="space-y-3.5 bg-elev rounded-2xl p-4 border border-line"
          >
            <div>
              <label className="mb-label !text-[11px]">
                {isBengali ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="mb-input w-full"
              />
            </div>
            <div>
              <label className="mb-label !text-[11px]">
                {isBengali ? 'নতুন পাসওয়ার্ড' : 'New Password'}
              </label>
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
              <label className="mb-label !text-[11px]">
                {isBengali ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                minLength={8}
                className="mb-input w-full"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isPwSubmitting}
                className="mb-btn-primary py-2 px-5 text-xs rounded-xl cursor-pointer"
              >
                {isPwSubmitting
                  ? isBengali
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Saving...'
                  : isBengali
                  ? 'পাসওয়ার্ড আপডেট করুন'
                  : 'Update Password'}
              </button>
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="text-xs font-bold text-ink-3 hover:text-ink transition-colors cursor-pointer px-2"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* — Danger zone — */}
      <div className="mb-card rounded-[2rem] p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 pb-1">
          <div className="w-10 h-10 rounded-xl bg-gold-soft text-gold flex items-center justify-center">
            <Shield className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-base font-black text-ink leading-tight">
              {isBengali ? 'বিয়ে হয়ে গেছে? অ্যাকাউন্ট নিয়ন্ত্রণ' : 'Got Married? Account Control'}
            </h3>
            <p className="text-[11px] text-ink-3">
              {isBengali ? 'সাময়িক বিরতি অথবা চিরতরে মুছে ফেলা' : 'Temporary pause or permanent deletion'}
            </p>
          </div>
        </div>

        <p className="text-xs text-ink-2 leading-relaxed bg-elev rounded-2xl p-4 border border-line">
          {isBengali
            ? 'বিয়ে ঠিক হয়ে গেলে অথবা সাময়িক বিরতির জন্য অ্যাকাউন্ট স্থগিত বা মুছে ফেলতে পারেন। প্রয়োজনে আগে পছন্দের তালিকা ও যোগাযোগ ডেটা দেখে নিন।'
            : 'If your marriage has been arranged or you wish to take a pause, you can deactivate or delete your account.'}
        </p>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setConfirmAction('deactivate')}
            className="px-4 py-2.5 text-xs font-bold text-gold bg-gold-soft hover:bg-gold/20 rounded-xl border border-gold/25 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>{isBengali ? 'সাময়িকভাবে নিষ্ক্রিয় করুন' : 'Deactivate Temporarily'}</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmAction('delete')}
            className="px-4 py-2.5 text-xs font-bold text-brand bg-brand-soft hover:bg-brand/20 rounded-xl border border-brand/40 cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isBengali ? 'স্থায়ীভাবে মুছুন' : 'Delete Permanently'}</span>
          </button>
        </div>
      </div>

      {/* Deactivate Account Modal */}
      <ConfirmationModal
        isOpen={confirmAction === 'deactivate'}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeDeactivate}
        title={isBengali ? 'অ্যাকাউন্ট নিষ্ক্রিয়করণ' : 'Account Deactivation'}
        message={
          isBengali
            ? 'আপনি কি নিশ্চিত যে আপনার অ্যাকাউন্টটি সাময়িকভাবে নিষ্ক্রিয় করতে চান? আপনি পরবর্তীতে যেকোনো সময় পুনরায় লগইন করে এটি আবার সক্রিয় করতে পারবেন।'
            : 'Are you sure you want to temporarily deactivate your account? You can reactivate it anytime by logging in again.'
        }
        confirmText={isBengali ? 'নিষ্ক্রিয় করুন' : 'Deactivate'}
        variant="warning"
        isLoading={isActionLoading}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        isOpen={confirmAction === 'delete'}
        onClose={() => setConfirmAction(null)}
        onConfirm={executeDelete}
        title={isBengali ? 'স্থায়ীভাবে অ্যাকাউন্ট মুছে ফেলা' : 'Permanent Account Deletion'}
        message={
          isBengali
            ? 'সতর্কতা: অ্যাকাউন্ট মুছে ফেললে আপনার সকল বায়োডাটা, সংরক্ষিত তালিকা এবং যোগাযোগের তথ্য চিরতরে ডাটাবেজ থেকে মুছে ফেলা হবে। এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়। আপনি কি এগিয়ে যেতে চান?'
            : 'Warning: Deleting your account will permanently remove your biodata, saved lists, and communication history. This action cannot be undone. Do you wish to proceed?'
        }
        confirmText={isBengali ? 'স্থায়ীভাবে মুছুন' : 'Delete Permanently'}
        variant="danger"
        isLoading={isActionLoading}
      />
    </div>
  );
};

/* ═══════════════ Shared bits ═══════════════ */
const TabLoader: React.FC = () => {
  const { isBengali } = useLanguage();
  return (
    <div className="py-24 flex justify-center">
      <LoadingSpinner
        size="lg"
        label={isBengali ? 'প্রোফাইল তথ্য লোড হচ্ছে...' : 'Loading profile details...'}
      />
    </div>
  );
};

const ProfileMissing: React.FC = () => {
  const { isBengali } = useLanguage();
  return (
    <div className="mb-card rounded-[2rem] p-10 text-center space-y-5 max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto border border-brand/20">
        <UserIcon className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-black text-ink">
        {isBengali ? 'আপনার প্রকাশিত বায়োডাটা এখনও নেই' : 'You do not have a published biodata yet'}
      </h2>
      <p className="text-sm text-ink-2 max-w-md mx-auto leading-relaxed">
        {isBengali
          ? 'টাঙ্গাইলের উপযুক্ত জীবনসঙ্গী খুঁজতে এবং অন্যদের সাথে সংযুক্ত হতে অনুগ্রহ করে আপনার বায়োডাটা সম্পন্ন করুন।'
          : 'Complete your biodata to connect with prospective brides and grooms across Tangail.'}
      </p>
      <div>
        <Link
          to="/edit-profile"
          className="mb-btn-primary py-3 px-6 text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isBengali ? 'এখনই বায়োডাটা তৈরি করুন' : 'Create Biodata Now'}</span>
        </Link>
      </div>
    </div>
  );
};

export default MyProfilePage;
