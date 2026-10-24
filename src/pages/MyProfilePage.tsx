import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
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
  Compass,
  ClipboardCheck,
  Settings,
  Heart,
  Bookmark,
  Contact,
  Gem,
  Mail,
  Phone,
  Clock,
  BookOpen,
  Briefcase,
  Users,
  Calendar,
  Printer,
  TrendingUp,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import BiodataDashboard from '../components/profile/BiodataDashboard';
import PrintableBiodataModal from '../components/profile/PrintableBiodataModal';
import { profilesApi } from '../api/profiles.api';
import { authApi } from '../api/auth.api';
import { workflowApi, Application, ReviewStatus } from '../api/workflow.api';
import { useAuth } from '../context/useAuth';
import { getUpazilaDisplayName } from '../constants/locations';
import { Profile } from '../types';
import ProfileCard from '../components/profile/ProfileCard';
import GenderAvatar from '../components/common/GenderAvatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmationModal from '../components/common/ConfirmationModal';
import { useLanguage } from '../i18n/LanguageContext';

type TabKey = 'overview' | 'recommendations' | 'verification' | 'settings';

export const MyProfilePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isBengali } = useLanguage();

  const validTabs: TabKey[] = ['overview', 'recommendations', 'verification', 'settings'];
  const tabFromUrl = searchParams.get('tab') as TabKey | null;
  const activeTab: TabKey = tabFromUrl && validTabs.includes(tabFromUrl) ? tabFromUrl : 'overview';

  const handleTabChange = (key: TabKey) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', key);
        return next;
      },
      { replace: true }
    );
  };

  const tabs: Array<{ key: TabKey; label: string; icon: React.ElementType }> = [
    { key: 'overview', label: isBengali ? 'সারসংক্ষেপ' : 'Overview', icon: LayoutDashboard },
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
                onClick={() => handleTabChange(tab.key)}
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
        {activeTab === 'overview' && <OverviewTab onNavigateTab={handleTabChange} />}
        {activeTab === 'recommendations' && <RecommendationsTab onNavigateTab={handleTabChange} />}
        {activeTab === 'verification' && <BiodataDashboard />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  );
};

/* ═══════════════ Shared profile & draft data hook ═══════════════ */
const useMyProfile = () => {
  const base = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profilesApi.getOwnProfile(),
    retry: false,
  });
  const profile = base.data?.data?.profile;

  const draftQuery = useQuery({
    queryKey: ['biodata-draft'],
    queryFn: () => workflowApi.getDraft(),
  });
  const application = draftQuery.data?.data?.application;

  const completion = useQuery({
    queryKey: ['my-profile', 'completion'],
    queryFn: () => profilesApi.getCompletion(),
    enabled: !!profile,
  });

  return {
    isLoading: base.isLoading && draftQuery.isLoading,
    profile,
    application,
    completion: completion.data?.data?.completion,
  };
};

/* ═══════════════ Helpers ═══════════════ */
function calculateAge(dob?: string | Date): number | null {
  if (!dob) return null;
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age > 0 ? age : null;
}

function formatDisplayDate(dateStr?: string, isBengali = true): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return isBengali
    ? d.toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatHeight(
  height?: { feet?: number; inches?: number },
  isBengali = true,
  formatNumber?: (n: number | string) => string
) {
  if (!height || !height.feet) return isBengali ? 'উল্লেখ নেই' : 'Not specified';
  const ft = formatNumber ? formatNumber(height.feet) : height.feet;
  const inc = formatNumber ? formatNumber(height.inches ?? 0) : height.inches ?? 0;
  return isBengali ? `${ft} ফুট ${inc} ইঞ্চি` : `${ft}' ${inc}"`;
}

function getMaritalStatusLabel(status?: string, gender?: string, isBengali = true) {
  if (!status) return isBengali ? 'উল্লেখ নেই' : 'Not specified';
  switch (status) {
    case 'never_married':
      return isBengali ? 'অবিবাহিত' : 'Never Married';
    case 'divorced':
      return isBengali ? 'ডিভোর্সড' : 'Divorced';
    case 'widowed':
      if (gender === 'male') return isBengali ? 'বিপত্নীক' : 'Widower';
      if (gender === 'female') return isBengali ? 'বিধবা' : 'Widow';
      return isBengali ? 'বিধবা/বিপত্নীক' : 'Widowed';
    case 'separated':
      return isBengali ? 'বিচ্ছিন্ন' : 'Separated';
    default:
      return status;
  }
}

function formatYesNo(val?: boolean | string, isBengali = true) {
  if (val === true || val === 'yes' || val === 'হ্যাঁ') return isBengali ? 'হ্যাঁ' : 'Yes';
  if (val === false || val === 'no' || val === 'না') return isBengali ? 'না' : 'No';
  return isBengali ? 'তথ্য দেওয়া হয়নি' : 'Not provided';
}

/* ═══════════════ Overview tab switcher ═══════════════ */
const OverviewTab: React.FC<{ onNavigateTab: (t: TabKey) => void }> = ({ onNavigateTab }) => {
  const { profile, application, isLoading } = useMyProfile();

  if (isLoading) return <TabLoader />;

  if (profile) {
    return (
      <PublishedProfileOverview
        profile={profile}
        application={application}
        onNavigateTab={onNavigateTab}
      />
    );
  }

  if (
    application &&
    (application.data?.displayName ||
      application.guardian?.name ||
      (application.data && Object.keys(application.data).length > 0) ||
      application.status !== 'draft')
  ) {
    return <ApplicationOverview application={application} onNavigateTab={onNavigateTab} />;
  }

  return <ProfileMissing onNavigateTab={onNavigateTab} />;
};

/* ═══════════════ Detailed Biodata Preview Cards (Categorized) ═══════════════ */
interface BiodataDetailPreviewProps {
  data: Partial<Profile>;
  guardian?: { name?: string; relationship?: string; phone?: string };
  guardianConsented?: boolean;
}

const BiodataDetailPreview: React.FC<BiodataDetailPreviewProps> = ({
  data,
  guardian,
  guardianConsented,
}) => {
  const { isBengali, formatNumber } = useLanguage();
  const age = data.age || calculateAge(data.dateOfBirth);
  const upazilaName = getUpazilaDisplayName(data.upazila, isBengali);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="mb-section-title text-base flex items-center gap-2">
          <LayoutDashboard className="w-4 h-4 text-brand" />
          <span>{isBengali ? 'আপনার সংরক্ষিত বায়োডাটার তথ্যাবলী' : 'Submitted Biodata Details'}</span>
        </h2>
        <Link
          to="/edit-profile"
          className="text-xs font-bold text-brand hover:underline inline-flex items-center gap-1"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>{isBengali ? 'সম্পাদনা করুন' : 'Edit details'}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 1. Basic Info */}
        <div className="mb-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 pb-1 border-b border-line">
            <UserIcon className="w-4 h-4 text-brand" />
            <span>{isBengali ? 'মৌলিক বিবরণ' : 'Basic Information'}</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'প্রদর্শনের নাম' : 'Display Name'}</span>
              <span className="font-semibold text-ink">{data.displayName || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'পাত্র / পাত্রী' : 'Gender'}</span>
              <span className="font-semibold text-ink">
                {data.gender === 'female'
                  ? isBengali
                    ? 'পাত্রী'
                    : 'Bride'
                  : isBengali
                  ? 'পাত্র'
                  : 'Groom'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'জন্ম তারিখ ও বয়স' : 'Birth Date & Age'}</span>
              <span className="font-semibold text-ink">
                {data.dateOfBirth ? formatDisplayDate(data.dateOfBirth, isBengali) : '—'}{' '}
                {age ? `(${isBengali ? formatNumber(age) : age} ${isBengali ? 'বছর' : 'yrs'})` : ''}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'স্থায়ী উপজেলা' : 'Permanent Upazila'}</span>
              <span className="font-semibold text-ink">
                {data.upazila ? `${upazilaName}, ${isBengali ? 'টাঙ্গাইল' : 'Tangail'}` : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'বৈবাহিক অবস্থা' : 'Marital Status'}</span>
              <span className="font-semibold text-ink">
                {getMaritalStatusLabel(data.maritalStatus, data.gender, isBengali)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'উচ্চতা' : 'Height'}</span>
              <span className="font-semibold text-ink">{formatHeight(data.height, isBengali, formatNumber)}</span>
            </div>
            {data.skinTone && (
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-ink-3">{isBengali ? 'গায়ের রং' : 'Complexion'}</span>
                <span className="font-semibold text-ink">{data.skinTone}</span>
              </div>
            )}
            {data.weight && (
              <div className="flex justify-between py-1">
                <span className="text-ink-3">{isBengali ? 'ওজন' : 'Weight'}</span>
                <span className="font-semibold text-ink">
                  {isBengali ? `${formatNumber(data.weight)} কেজি` : `${data.weight} kg`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Education & Profession */}
        <div className="mb-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 pb-1 border-b border-line">
            <BookOpen className="w-4 h-4 text-brand" />
            <span>{isBengali ? 'শিক্ষা ও পেশা' : 'Education & Career'}</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'শিক্ষাগত যোগ্যতা' : 'Education Level'}</span>
              <span className="font-semibold text-ink">
                {data.education ? data.education.toUpperCase() : '—'}
              </span>
            </div>
            {data.educationDetail && (
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-ink-3">{isBengali ? 'বিস্তারিত শিক্ষা' : 'Education Details'}</span>
                <span className="font-semibold text-ink text-right max-w-[60%]">{data.educationDetail}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'পেশা' : 'Occupation'}</span>
              <span className="font-semibold text-ink">{data.occupation || '—'}</span>
            </div>
            {data.lifestyle?.monthlyIncome && (
              <div className="flex justify-between py-1">
                <span className="text-ink-3">{isBengali ? 'মাসিক আয়' : 'Monthly Income'}</span>
                <span className="font-semibold text-ink">{data.lifestyle.monthlyIncome}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. Religious Practice */}
        <div className="mb-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 pb-1 border-b border-line">
            <Sparkles className="w-4 h-4 text-gold" />
            <span>{isBengali ? 'দ্বীনদারি ও ধর্মীয় অভ্যাস' : 'Religious Practice'}</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'নিয়মিত পাঁচ ওয়াক্ত নামাজ' : 'Daily 5 Prayers'}</span>
              <span className="font-semibold text-ink">
                {formatYesNo(data.religiousInfo?.praysFiveTimes, isBengali)}
              </span>
            </div>
            {data.gender === 'female' ? (
              <>
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-3">{isBengali ? 'পর্দা বজায় রাখা (হিজাব/নিকাব)' : 'Hijab/Niqab'}</span>
                  <span className="font-semibold text-ink">
                    {data.religiousInfo?.wearsNiqab
                      ? isBengali
                        ? 'নিকাবসহ পর্দা'
                        : 'Niqab with Purdah'
                      : data.religiousInfo?.wearsHijab
                      ? isBengali
                        ? 'হিজাব'
                        : 'Hijab'
                      : isBengali
                      ? 'সাধারণ পর্দা'
                      : 'General Purdah'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-3">{isBengali ? 'গায়রে মাহরাম পর্দা' : 'Mahram Purdah'}</span>
                  <span className="font-semibold text-ink">
                    {formatYesNo(data.religiousInfo?.maintainsMahram, isBengali)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-3">{isBengali ? 'সুন্নতি দাড়ি রয়েছে' : 'Sunnah Beard'}</span>
                  <span className="font-semibold text-ink">
                    {formatYesNo(data.religiousInfo?.hasBeard, isBengali)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-line/50">
                  <span className="text-ink-3">{isBengali ? 'টাখনুর ওপর কাপড় পরা' : 'Clothes Above Ankle'}</span>
                  <span className="font-semibold text-ink">
                    {formatYesNo(data.religiousInfo?.clothesAboveAnkle, isBengali)}
                  </span>
                </div>
              </>
            )}
            <div className="flex justify-between py-1">
              <span className="text-ink-3">{isBengali ? 'কুরআন তিলাওয়াত' : 'Quran Recitation'}</span>
              <span className="font-semibold text-ink">
                {formatYesNo(data.religiousInfo?.canReciteQuran, isBengali)}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Family Information */}
        <div className="mb-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 pb-1 border-b border-line">
            <Users className="w-4 h-4 text-brand" />
            <span>{isBengali ? 'পারিবারিক বিবরণ' : 'Family Details'}</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'পিতার পেশা' : "Father's Occupation"}</span>
              <span className="font-semibold text-ink">{data.familyInfo?.fatherOccupation || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'মাতার পেশা' : "Mother's Occupation"}</span>
              <span className="font-semibold text-ink">{data.familyInfo?.motherOccupation || '—'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'ভাই-বোনের সংখ্যা' : 'Siblings'}</span>
              <span className="font-semibold text-ink">
                {data.familyInfo?.siblings
                  ? isBengali
                    ? `${formatNumber(data.familyInfo.siblings)} জন`
                    : `${data.familyInfo.siblings}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-3">{isBengali ? 'পারিবারিক আর্থিক অবস্থা' : 'Financial Status'}</span>
              <span className="font-semibold text-ink">{data.familyInfo?.financialStatus || '—'}</span>
            </div>
          </div>
        </div>

        {/* 5. Guardian Details */}
        {guardian && (guardian.name || guardian.phone) ? (
          <div className="mb-card rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 pb-1 border-b border-line">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>{isBengali ? 'অভিভাবকের তথ্য ও সম্মতি' : 'Guardian Info & Consent'}</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-ink-3">{isBengali ? 'অভিভাবকের নাম' : "Guardian's Name"}</span>
                <span className="font-semibold text-ink">{guardian.name || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-ink-3">{isBengali ? 'সম্পর্ক' : 'Relationship'}</span>
                <span className="font-semibold text-ink">{guardian.relationship || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-line/50">
                <span className="text-ink-3">{isBengali ? 'মোবাইল নম্বর' : 'Phone'}</span>
                <span className="font-semibold text-ink font-mono">{guardian.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-ink-3">{isBengali ? 'সম্মতি যাচাই অবস্থা' : 'Consent Status'}</span>
                <span
                  className={`font-bold inline-flex items-center gap-1 ${
                    guardianConsented
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {guardianConsented ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isBengali ? 'সম্মতি নিশ্চিতকৃত' : 'Consent Confirmed'}</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{isBengali ? 'যাচাই এখনো বাকি' : 'Consent Pending'}</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* 6. Partner Preferences */}
        <div className="mb-card rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 pb-1 border-b border-line">
            <Heart className="w-4 h-4 text-brand" />
            <span>{isBengali ? 'কাঙ্ক্ষিত জীবনসঙ্গী' : 'Partner Preferences'}</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'প্রত্যাশিত বয়স' : 'Expected Age'}</span>
              <span className="font-semibold text-ink">
                {data.preferences?.minAge && data.preferences?.maxAge
                  ? isBengali
                    ? `${formatNumber(data.preferences.minAge)} - ${formatNumber(data.preferences.maxAge)} বছর`
                    : `${data.preferences.minAge} - ${data.preferences.maxAge} yrs`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-line/50">
              <span className="text-ink-3">{isBengali ? 'পছন্দের উপজেলাসমূহ' : 'Preferred Upazilas'}</span>
              <span className="font-semibold text-ink text-right max-w-[60%]">
                {data.preferences?.preferredUpazilas && data.preferences.preferredUpazilas.length > 0
                  ? data.preferences.preferredUpazilas
                      .map((u: string) => getUpazilaDisplayName(u, isBengali))
                      .join(', ')
                  : isBengali
                  ? 'যেকোনো উপজেলা'
                  : 'Any Upazila'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-ink-3">{isBengali ? 'প্রত্যাশিত শিক্ষাগত যোগ্যতা' : 'Preferred Education'}</span>
              <span className="font-semibold text-ink">
                {data.preferences?.preferredEducation && data.preferences.preferredEducation.length > 0
                  ? data.preferences.preferredEducation.map((e: string) => e.toUpperCase()).join(', ')
                  : isBengali
                  ? 'যেকোনো যোগ্যতা'
                  : 'Any'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. About Bio */}
      {data.bio && (
        <div className="mb-card rounded-2xl p-5 space-y-2">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-brand" />
            <span>{isBengali ? 'নিজের সম্পর্কে কিছু কথা' : 'About Candidate'}</span>
          </h3>
          <p className="text-xs text-ink-2 leading-relaxed whitespace-pre-line">{data.bio}</p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════ Application Overview (Draft / Submitted / Under Review) ═══════════════ */
const ApplicationOverview: React.FC<{
  application: Application;
  onNavigateTab: (t: TabKey) => void;
}> = ({ application, onNavigateTab }) => {
  const { user } = useAuth();
  const { isBengali, formatNumber } = useLanguage();

  const data = application.data || {};
  const guardian = application.guardian || {};
  const status = application.status;
  const age = calculateAge(data.dateOfBirth);
  const upazilaName = getUpazilaDisplayName(data.upazila, isBengali);

  const statusToneMap: Record<
    ReviewStatus,
    { badgeBg: string; badgeText: string; bannerBg: string; border: string; title: string; desc: string }
  > = {
    draft: {
      badgeBg: 'bg-amber-500/15',
      badgeText: 'text-amber-800 dark:text-amber-300',
      bannerBg: 'bg-amber-500/10 dark:bg-amber-950/30',
      border: 'border-amber-500/30',
      title: isBengali
        ? 'আপনার বায়োডাটা সংরক্ষিত (খসড়া) অবস্থায় রয়েছে'
        : 'Your Biodata is Saved as Draft',
      desc: isBengali
        ? "আপনার তথ্য সংরক্ষিত আছে। ইমেইল যাচাই ও অভিভাবকের সম্মতির ঘোষণা দিয়ে বায়োডাটা জমা দিন।"
        : "Your details are saved. Verify your email, declare guardian consent and submit from the submission tab.",
    },
    submitted: {
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      bannerBg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-emerald-500/30',
      title: isBengali
        ? 'বায়োডাটা জমা হয়েছে'
        : 'Biodata Submitted',
      desc: isBengali
        ? 'আপনার বায়োডাটা জমা হয়েছে। পরবর্তী পরিবর্তন হলে জানানো হবে।'
        : 'Your biodata has been submitted. You will be notified of changes.',
    },
    under_review: {
      badgeBg: 'bg-blue-500/15',
      badgeText: 'text-blue-700 dark:text-blue-300',
      bannerBg: 'bg-blue-500/10 dark:bg-blue-950/30',
      border: 'border-blue-500/30',
      title: isBengali
        ? 'বায়োডাটা জমা হয়েছে'
        : 'Biodata Submitted',
      desc: isBengali
        ? 'আপনার বায়োডাটা জমা হয়েছে। প্রয়োজন হলে তথ্য সম্পাদনা করতে পারবেন।'
        : 'Your biodata has been submitted. You can edit your information if needed.',
    },
    changes_requested: {
      badgeBg: 'bg-rose-500/15',
      badgeText: 'text-rose-700 dark:text-rose-300',
      bannerBg: 'bg-rose-500/10 dark:bg-rose-950/30',
      border: 'border-rose-500/30',
      title: isBengali
        ? 'বায়োডাটায় কিছু তথ্য সংশোধন প্রয়োজন'
        : 'Changes Requested on Biodata',
      desc: isBengali
        ? 'বায়োডাটার তথ্য দেখে প্রয়োজনীয় সংশোধন করে আবার জমা দিন।'
        : 'Check your biodata details, make the needed changes and submit again.',
    },
    approved: {
      badgeBg: 'bg-emerald-500/15',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      bannerBg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-emerald-500/30',
      title: isBengali
        ? 'আলহামদুলিল্লাহ! আপনার বায়োডাটা প্রকাশিত হয়েছে'
        : 'Alhamdulillah! Your Biodata is Published',
      desc: isBengali
        ? 'আপনার বায়োডাটা প্ল্যাটফর্মে সক্রিয় রয়েছে এবং পাত্র-পাত্রীরা অনুসন্ধান করতে পারছেন।'
        : 'Your biodata is active on the platform and discoverable by prospective matches.',
    },
    rejected: {
      badgeBg: 'bg-red-500/15',
      badgeText: 'text-red-700 dark:text-red-300',
      bannerBg: 'bg-red-500/10 dark:bg-red-950/30',
      border: 'border-red-500/30',
      title: isBengali ? 'বায়োডাটা অনুমোদিত হয়নি' : 'Biodata Not Approved',
      desc: isBengali
        ? 'বায়োডাটা আমাদের নিরাপত্তা ও নির্ভরযোগ্যতার নীতিমালা পূরণ করেনি।'
        : 'The biodata did not meet platform safety and integrity standards.',
    },
  };

  const currentTone = statusToneMap[status] || statusToneMap.draft;

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
      {/* ── Status Alert Banner ── */}
      <div
        className={`rounded-2xl p-5 border ${currentTone.bannerBg} ${currentTone.border} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            {status === 'submitted' || status === 'under_review' ? (
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            ) : status === 'changes_requested' || status === 'rejected' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-ink">{currentTone.title}</h4>
            <p className="text-xs text-ink-2 leading-relaxed max-w-2xl">{currentTone.desc}</p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          {status === 'draft' ? (
            <button
              type="button"
              onClick={() => onNavigateTab('verification')}
              className="mb-btn-primary py-2.5 px-5 text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-md shadow-brand/20 whitespace-nowrap"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>{isBengali ? 'যাচাই ও জমা ড্যাশবোর্ড' : 'Verification Dashboard'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : status === 'changes_requested' || status === 'rejected' ? (
            <Link
              to="/edit-profile"
              className="mb-btn-primary py-2.5 px-5 text-xs rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-brand/20 whitespace-nowrap"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isBengali ? 'বায়োডাটা সম্পাদনা করুন' : 'Edit Biodata'}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onNavigateTab('verification')}
              className="mb-btn-secondary py-2.5 px-4 text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer bg-card whitespace-nowrap"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isBengali ? 'জমা দেওয়ার তথ্য' : 'Submission details'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Candidate Identity Hero ── */}
      <div className="relative overflow-hidden mb-card rounded-[2rem] px-6 sm:px-8 pt-8 pb-8">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-20 w-72 h-72 rounded-full bg-pink-500/8 blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          {/* Avatar with ring */}
          <div className="relative shrink-0 mx-auto md:mx-0">
            <div
              className="absolute -inset-2 rounded-full bg-linear-to-br from-brand/50 via-pink-500/30 to-transparent"
              aria-hidden="true"
            />
            <div className="relative rounded-full shadow-xl border-4 border-card w-28 h-28">
              <GenderAvatar gender={data.gender || 'male'} size={112} className="w-full h-full" />
            </div>
          </div>

          {/* Identity details */}
          <div className="flex-1 space-y-2.5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                {data.displayName || user?.name || (isBengali ? 'বায়োডাটা প্রার্থী' : 'Candidate')}
              </h1>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${currentTone.badgeBg} ${currentTone.badgeText} ${currentTone.border}`}
              >
                {status==='draft'?(isBengali?'সংরক্ষিত':'Saved'):status==='approved'?(isBengali?'প্রকাশিত':'Published'):['changes_requested','rejected'].includes(status)?(isBengali?'সম্পাদনা প্রয়োজন':'Needs editing'):(isBengali?'জমা হয়েছে':'Submitted')}
              </span>
            </div>

            <p className="text-xs text-ink-3 flex items-center justify-center md:justify-start gap-1.5">
              <Mail className="w-3 h-3" />
              {user?.email}
              {guardian.phone && (
                <>
                  <span className="mx-1">•</span>
                  <Phone className="w-3 h-3" />
                  <span>{guardian.phone}</span>
                </>
              )}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-soft text-brand-ink border border-brand/20">
                <UserIcon className="w-3.5 h-3.5" />
                {data.gender === 'female'
                  ? isBengali
                    ? 'পাত্রী'
                    : 'Bride'
                  : isBengali
                  ? 'পাত্র'
                  : 'Groom'}
              </span>
              {data.upazila && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elev text-ink-2 border border-line">
                  <MapPin className="w-3.5 h-3.5 text-brand" />
                  {upazilaName}, {isBengali ? 'টাঙ্গাইল' : 'Tangail'}
                </span>
              )}
              {age ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elev text-ink-2 border border-line">
                  <Calendar className="w-3.5 h-3.5 text-gold" />
                  <span>{isBengali ? `${formatNumber(age)} বছর` : `${age} yrs`}</span>
                </span>
              ) : null}
              {data.occupation && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elev text-ink-2 border border-line">
                  <Briefcase className="w-3.5 h-3.5 text-ink-3" />
                  <span>{data.occupation}</span>
                </span>
              )}
              {data.education && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elev text-ink-2 border border-line">
                  <BookOpen className="w-3.5 h-3.5 text-ink-3" />
                  <span>{data.educationDetail || data.education.toUpperCase()}</span>
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 shrink-0">
            <Link
              to="/edit-profile"
              className="mb-btn-primary py-2.5 px-5 text-xs rounded-xl inline-flex items-center gap-2 shadow-lg shadow-brand/20 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isBengali ? 'বায়োডাটা সম্পাদনা' : 'Edit Biodata'}</span>
            </Link>
            <button
              type="button"
              onClick={() => onNavigateTab('verification')}
              className="inline-flex items-center gap-1.5 py-2.5 px-5 text-xs font-bold text-brand bg-brand-soft hover:bg-brand/20 rounded-xl border border-brand/40 transition-all cursor-pointer"
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>{isBengali ? 'যাচাই ও জমা' : 'Verification & Submit'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Detailed Biodata Preview (Categorized) ── */}
      <BiodataDetailPreview
        data={data}
        guardian={guardian}
        guardianConsented={!!application.guardianConsentedAt}
      />

      {/* ── Quick Links ── */}
      <div className="space-y-4 pt-2">
        <h3 className="mb-section-title text-sm flex items-center gap-2 px-1">
          <Compass className="w-4 h-4 text-gold" />
          <span>{isBengali ? 'দ্রুত লিংক' : 'Quick Links'}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
  );
};

/* ═══════════════ Hero + stats + overview card for APPROVED profile ═══════════════ */
const PublishedProfileOverview: React.FC<{
  profile: Profile;
  application?: Application;
  onNavigateTab: (t: TabKey) => void;
}> = ({ profile, application, onNavigateTab }) => {
  const { user } = useAuth();
  const { isBengali, formatNumber } = useLanguage();
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const { data: insightsData } = useQuery({
    queryKey: ['my-profile-insights'],
    queryFn: () => profilesApi.getProfileInsights(),
    staleTime: 1000 * 30,
  });
  const insights = insightsData?.data?.insights;

  const upazilaName = getUpazilaDisplayName(profile.upazila, isBengali);

  const targetUserId =
    typeof profile.user === 'string' ? profile.user : profile.user?._id || user?.id;

  const completionPercent = profile.completionPercentage ?? 0;

  const stats = [
    {
      label: isBengali ? 'সম্পূর্ণতা' : 'Completion',
      value: `${isBengali ? formatNumber(completionPercent) : completionPercent}%`,
      tone: completionPercent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gold',
      icon: Sparkles,
    },
    {
      label: isBengali ? 'প্রকাশের অবস্থা' : 'Publication',
      value: profile.isApproved
        ? isBengali
          ? 'প্রকাশিত'
          : 'Published'
        : isBengali
        ? 'অপেক্ষমান'
        : 'Pending',
      tone: profile.isApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-gold',
      icon: profile.isApproved ? CheckCircle2 : AlertCircle,
    },
    {
      label: isBengali ? 'ইমেইল যাচাই' : 'Email Verified',
      value: user?.isEmailVerified
        ? isBengali
          ? 'যাচাইকৃত'
          : 'Verified'
        : isBengali
        ? 'যাচাই বাকি'
        : 'Pending',
      tone: user?.isEmailVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-gold',
      icon: user?.isEmailVerified ? CheckCircle2 : AlertCircle,
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
                  title={isBengali ? 'প্রকাশিত বায়োডাটা' : 'Published biodata'}
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
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center gap-1.5 py-2.5 px-4 text-xs font-bold text-ink-2 bg-elev hover:text-brand hover:bg-brand-soft rounded-xl border border-line transition-all hover:scale-[1.02] cursor-pointer"
              title={isBengali ? 'বায়োডাটা PDF ডাউনলোড বা প্রিন্ট করুন' : 'Download or Print Biodata PDF'}
            >
              <Printer className="w-3.5 h-3.5 text-brand" />
              <span>{isBengali ? 'বায়োডাটা PDF / প্রিন্ট' : 'Biodata PDF / Print'}</span>
            </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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

      {/* ── Biodata Activity & Real-Time Insights Widget ── */}
      <div className="mb-card rounded-[2rem] p-6 sm:p-7 space-y-5 border-brand/20 bg-linear-to-br from-card via-card to-brand-soft/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center border border-brand/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink flex items-center gap-2">
                <span>{isBengali ? 'বায়োডাটা এক্টিভিটি ও ইনসাইটস' : 'Biodata Activity & Insights'}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  {isBengali ? 'লাইভ আপডেট' : 'Live Updates'}
                </span>
              </h3>
              <p className="text-xs text-ink-3">
                {isBengali
                  ? 'আপনার বায়োডাটার পরিচিতি, দর্শক সংখ্যা এবং আগ্রহের সর্বশেষ পরিসংখ্যান'
                  : 'Real-time metrics on profile visibility, shortlists, and incoming proposals'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand bg-brand-soft hover:bg-brand/20 border border-brand/30 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{isBengali ? 'অফিসিয়াল PDF প্রিন্ট' : 'Official PDF Print'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-card border border-line flex flex-col justify-between space-y-2 hover:border-indigo-500/40 transition-colors">
            <div className="flex items-center justify-between text-ink-3">
              <span className="text-xs font-semibold">{isBengali ? 'প্রোফাইল ভিউ' : 'Profile Views'}</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-ink">
                {formatNumber(insights?.viewCount ?? profile.viewCount ?? 0)}
              </span>
              <p className="text-[10px] text-ink-3 font-medium mt-0.5">
                {isBengali ? 'অন্যান্য ব্যবহারকারীর দর্শন' : 'Unique candidate visits'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-line flex flex-col justify-between space-y-2 hover:border-amber-500/40 transition-colors">
            <div className="flex items-center justify-between text-ink-3">
              <span className="text-xs font-semibold">{isBengali ? 'পছন্দের তালিকায়' : 'Shortlisted'}</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Bookmark className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-ink">
                {formatNumber(insights?.shortlistedCount ?? 0)}
              </span>
              <p className="text-[10px] text-ink-3 font-medium mt-0.5">
                {isBengali ? 'সংরক্ষিত করেছেন' : 'Saved to favorites'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-line flex flex-col justify-between space-y-2 hover:border-pink-500/40 transition-colors">
            <div className="flex items-center justify-between text-ink-3">
              <span className="text-xs font-semibold">{isBengali ? 'প্রাপ্ত প্রস্তাব' : 'Proposals In'}</span>
              <div className="w-7 h-7 rounded-lg bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-brand">
                {formatNumber(insights?.interestsReceivedCount ?? 0)}
              </span>
              <p className="text-[10px] text-ink-3 font-medium mt-0.5">
                {isBengali ? 'বিয়ের আগ্রহ প্রকাশ' : 'Received interest'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border border-line flex flex-col justify-between space-y-2 hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between text-ink-3">
              <span className="text-xs font-semibold">{isBengali ? 'প্রেরিত প্রস্তাব' : 'Proposals Sent'}</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-2xl font-black text-ink">
                {formatNumber(insights?.interestsSentCount ?? 0)}
              </span>
              <p className="text-[10px] text-ink-3 font-medium mt-0.5">
                {isBengali ? 'আপনি আগ্রহ পাঠিয়েছেন' : 'Reachable biodatas'}
              </p>
            </div>
          </div>
        </div>

        {/* Shariah Tips / Guidance Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-elev/70 border border-line text-xs">
          <div className="flex items-center gap-2 text-ink-2">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {completionPercent < 100
                ? isBengali
                  ? 'পরামর্শ: বায়োডাটা ১০০% সম্পূর্ণ করলে ৩ গুণ বেশি পাত্র-পাত্রী আপনার প্রোফাইল পরিদর্শন করবে।'
                  : 'Tip: 100% completed biodatas receive 3x more views and proposals.'
                : isBengali
                ? 'পবিত্রতা ও নিরাপত্তা: আপনার ফোন ও ইমেইল নম্বর অভিভাবকের অনুমতি ব্যতীত কাউকে সরাসরি দেখানো হয় না।'
                : "Privacy guarantee: Guardian contact details are never disclosed without your family's consent."}
            </span>
          </div>
          <Link
            to="/interests"
            className="text-brand font-bold hover:underline shrink-0 inline-flex items-center gap-1"
          >
            <span>{isBengali ? 'প্রস্তাবগুলো দেখুন' : 'View proposals'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
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

      {/* ── Detailed Biodata Preview (Categorized) ── */}
      <BiodataDetailPreview
        data={profile}
        guardian={application?.guardian}
        guardianConsented={!!application?.guardianConsentedAt}
      />

      <PrintableBiodataModal
        profile={profile}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
};

/* ═══════════════ Completion card (overview) ═══════════════ */
const CompletionCard: React.FC<{ onNavigateTab?: ((t: TabKey) => void) | undefined }> = () => {
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
                      onClick={() => navigate('/edit-profile')}
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

/* ═══════════════ Recommendations tab ═══════════════ */
const RecommendationsTab: React.FC<{ onNavigateTab?: (t: TabKey) => void }> = ({ onNavigateTab }) => {
  const { profile, application } = useMyProfile();
  const { isBengali } = useLanguage();
  const { data: recsData, isLoading } = useQuery({
    queryKey: ['profile-recommendations'],
    queryFn: () => profilesApi.getRecommendations(),
    enabled: !!profile,
  });

  const recommendations = recsData?.data?.profiles;

  if (isLoading || (!profile && !recsData && !application)) return <TabLoader />;

  if (!profile) {
    if (
      application &&
      (application.data?.displayName ||
        application.guardian?.name ||
        application.status !== 'draft')
    ) {
      return (
        <div className="mb-card rounded-[2rem] p-8 text-center space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-full bg-gold-soft text-gold flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-ink">
            {isBengali ? 'ম্যাচ পরামর্শ বায়োডাটা অনুমোদনের পর চালু হবে' : 'Match recommendations activate after approval'}
          </h3>
          <p className="text-xs text-ink-2 leading-relaxed">
            {isBengali
              ? 'আপনার বায়োডাটা অনুমোদিত হলে আপনার পছন্দের সাথে মিলিয়ে সেরা পাত্র-পাত্রীদের তালিকা এখানে দেখতে পাবেন।'
              : 'Once your biodata is approved, matching profiles aligned with your partner preferences will appear here.'}
          </p>
          <div className="pt-2">
            <Link
              to="/search"
              className="mb-btn-primary py-2 px-5 text-xs rounded-xl inline-flex items-center gap-1.5"
            >
              <span>{isBengali ? 'সকল পাত্র-পাত্রী খুঁজুন' : 'Search Profiles'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      );
    }
    return <ProfileMissing onNavigateTab={onNavigateTab} />;
  }

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

const ProfileMissing: React.FC<{ onNavigateTab?: (t: TabKey) => void }> = () => {
  const { isBengali } = useLanguage();
  return (
    <div className="mb-card rounded-[2rem] p-10 text-center space-y-5 max-w-2xl mx-auto">
      <div className="w-16 h-16 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto border border-brand/20">
        <UserIcon className="w-7 h-7" />
      </div>
      <h2 className="text-2xl font-black text-ink">
        {isBengali ? 'আপনার বায়োডাটা এখনও তৈরি করা হয়নি' : 'You do not have a biodata yet'}
      </h2>
      <p className="text-sm text-ink-2 max-w-md mx-auto leading-relaxed">
        {isBengali
          ? 'টাঙ্গাইলের উপযুক্ত দ্বীনদার জীবনসঙ্গী খুঁজতে এবং পাত্র-পাত্রীদের সাথে সংযুক্ত হতে অনুগ্রহ করে আপনার বায়োডাটা সম্পন্ন করুন।'
          : 'Complete your biodata to connect with prospective brides and grooms across Tangail.'}
      </p>
      <div>
        <Link
          to="/edit-profile"
          className="mb-btn-primary py-3 px-6 text-sm rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-brand/20"
        >
          <Edit3 className="w-4 h-4" />
          <span>{isBengali ? 'এখনই বায়োডাটা তৈরি করুন' : 'Create Biodata Now'}</span>
        </Link>
      </div>
    </div>
  );
};

export default MyProfilePage;
