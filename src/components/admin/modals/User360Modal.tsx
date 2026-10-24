import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  X,
  UserCheck,
  FileText,
  CreditCard,
  HeartHandshake,
  Phone,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { adminApi, AuditLogItem } from '../../../api/admin.api';
import { getUpazilaDisplayName } from '../../../constants/locations';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useLanguage } from '../../../i18n/LanguageContext';

interface User360ModalProps {
  userId: string | null;
  onClose: () => void;
}

interface TimelineEvent {
  id: string;
  type: 'registration' | 'biodata' | 'payment' | 'interest' | 'contact' | 'admin';
  title: string;
  description: string;
  timestamp: string;
  status?: string;
}

export const User360Modal: React.FC<User360ModalProps> = ({ userId, onClose }) => {
  const { isBengali, formatNumber } = useLanguage();
  const [activeTab, setActiveTab] = useState<'timeline' | 'profile' | 'guardian'>('timeline');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-user-360', userId],
    enabled: Boolean(userId),
    queryFn: () => (userId ? adminApi.getUserTimeline(userId) : null),
  });

  if (!userId) return null;

  const payload = data?.data;
  const user = payload?.user;
  const profile = payload?.profile;
  const application = payload?.application;
  const timeline: TimelineEvent[] = payload?.timeline || [];
  const stats = payload?.stats || {
    credits: 0,
    transactionsCount: 0,
    interestsSentCount: 0,
    interestsReceivedCount: 0,
    contactGrantsCount: 0,
  };

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'registration':
        return <UserCheck className="w-4 h-4 text-emerald-500" />;
      case 'biodata':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'interest':
        return <HeartHandshake className="w-4 h-4 text-rose-500" />;
      case 'contact':
        return <Phone className="w-4 h-4 text-purple-500" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-indigo-500" />;
      default:
        return <Clock className="w-4 h-4 text-ink-3" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-card border border-line rounded-2xl w-full max-w-4xl my-6 p-5 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <Compass className="w-6 h-6 animate-spin-slow" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <span>{user?.name || (isBengali ? 'ব্যবহারকারী' : 'User')}</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                  {isBengali ? '৩৬০° প্রোফাইল ও টাইমলাইন' : '360° Profile & Timeline'}
                </span>
              </h2>
              <p className="text-xs text-ink-3 mt-0.5">
                {isBengali
                  ? 'সদস্যের নিবন্ধন থেকে বর্তমান পর্যন্ত সম্পূর্ণ কার্যকলাপ ও বৈবাহিক রেকর্ড'
                  : 'Complete activity lifecycle, marital records and transaction timeline'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner
              size="lg"
              label={isBengali ? '৩৬০° রেকর্ড লোড হচ্ছে...' : 'Loading 360° records...'}
            />
          </div>
        ) : !payload || !user ? (
          <div className="py-12 text-center text-ink-3 text-sm">
            {isBengali
              ? 'ব্যবহারকারীর বিস্তারিত তথ্য পাওয়া যায়নি।'
              : 'User details could not be found.'}
          </div>
        ) : (
          <div className="space-y-6 text-sm">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-elev border border-line p-3 rounded-xl text-center">
                <span className="text-[11px] text-ink-3 block">
                  {isBengali ? 'যোগাযোগ ক্রেডিট' : 'Contact Credits'}
                </span>
                <span className="text-lg font-bold text-primary mt-0.5 block">
                  {formatNumber(stats.credits)}
                </span>
              </div>
              <div className="bg-elev border border-line p-3 rounded-xl text-center">
                <span className="text-[11px] text-ink-3 block">
                  {isBengali ? 'মোট লেনদেন' : 'Total Transactions'}
                </span>
                <span className="text-lg font-bold text-ink mt-0.5 block">
                  {formatNumber(stats.transactionsCount)}
                </span>
              </div>
              <div className="bg-elev border border-line p-3 rounded-xl text-center">
                <span className="text-[11px] text-ink-3 block">
                  {isBengali ? 'আগ্রহ প্রেরণ' : 'Interests Sent'}
                </span>
                <span className="text-lg font-bold text-rose-500 mt-0.5 block">
                  {formatNumber(stats.interestsSentCount)}
                </span>
              </div>
              <div className="bg-elev border border-line p-3 rounded-xl text-center">
                <span className="text-[11px] text-ink-3 block">
                  {isBengali ? 'আগ্রহ প্রাপ্তি' : 'Interests Received'}
                </span>
                <span className="text-lg font-bold text-emerald-600 mt-0.5 block">
                  {formatNumber(stats.interestsReceivedCount)}
                </span>
              </div>
              <div className="bg-elev border border-line p-3 rounded-xl text-center col-span-2 sm:col-span-1">
                <span className="text-[11px] text-ink-3 block">
                  {isBengali ? 'যোগাযোগ আনলক' : 'Contacts Unlocked'}
                </span>
                <span className="text-lg font-bold text-purple-600 mt-0.5 block">
                  {formatNumber(stats.contactGrantsCount)}
                </span>
              </div>
            </div>

            {/* Profile Overview Card */}
            <div className="bg-muted/30 border border-line p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink text-sm">{user.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 uppercase">
                    {user.accountStatus}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
                    {user.role}
                  </span>
                </div>
                <div className="text-ink-3 flex flex-wrap gap-x-4 gap-y-1 font-mono">
                  <span>{isBengali ? 'ইমেইল:' : 'Email:'} {user.email}</span>
                  <span>
                    {isBengali ? 'ফোন:' : 'Phone:'}{' '}
                    {user.phone || (isBengali ? 'যুক্ত নেই' : 'Not added')}
                  </span>
                  <span>
                    {isBengali ? 'নিবন্ধন:' : 'Joined:'}{' '}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')
                      : '—'}
                  </span>
                </div>
              </div>

              {profile?.biodataId && (
                <div className="text-right sm:border-l sm:border-line sm:pl-4">
                  <span className="text-[10px] text-ink-3 block">
                    {isBengali ? 'বায়োডাটা কোড' : 'Biodata ID'}
                  </span>
                  <span className="font-mono font-bold text-sm text-primary">
                    {profile.biodataId}
                  </span>
                  <span className="text-[10px] text-emerald-600 block mt-0.5 font-medium">
                    {profile.isApproved
                      ? isBengali
                        ? 'অনুমোদিত ও সক্রিয়'
                        : 'Approved & Active'
                      : isBengali
                      ? 'অপেক্ষমান'
                      : 'Pending Approval'}
                  </span>
                </div>
              )}
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex items-center gap-2 border-b border-line pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('timeline')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'timeline'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {isBengali ? 'অ্যাক্টিভিটি টাইমলাইন' : 'Activity Timeline'} ({timeline.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {isBengali ? 'বায়োডাটা বিস্তারিত' : 'Biodata Details'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('guardian')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'guardian'
                    ? 'bg-primary text-white shadow-xs'
                    : 'text-ink-3 hover:text-ink'
                }`}
              >
                {isBengali ? 'অভিভাবকের সম্মতি ও তথ্য' : 'Guardian Details & Consent'}
              </button>
            </div>

            {/* Content: Timeline */}
            {activeTab === 'timeline' && (
              <div className="space-y-3">
                {timeline.length === 0 ? (
                  <div className="py-8 text-center text-ink-3 text-xs">
                    {isBengali
                      ? 'কোনো অ্যাক্টিভিটি ইভেন্ট পাওয়া যায়নি।'
                      : 'No activity events recorded yet.'}
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                    {timeline.map((evt) => (
                      <div key={evt.id} className="relative flex items-start gap-3">
                        <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-card border border-line flex items-center justify-center shadow-xs">
                          {getEventIcon(evt.type)}
                        </span>
                        <div className="bg-elev border border-line rounded-xl p-3 w-full text-xs space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-ink">{evt.title}</span>
                            <span className="text-[10px] text-ink-3 font-mono">
                              {new Date(evt.timestamp).toLocaleString(
                                isBengali ? 'bn-BD' : 'en-US'
                              )}
                            </span>
                          </div>
                          <p className="text-ink-2 leading-relaxed">{evt.description}</p>
                          {evt.status && (
                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-muted font-mono text-ink-3 capitalize">
                              {isBengali ? 'স্ট্যাটাস:' : 'Status:'} {evt.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Content: Profile Details */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {profile ? (
                  <div className="bg-elev border border-line rounded-xl p-4 text-xs space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-ink-3">{isBengali ? 'লিঙ্গ:' : 'Gender:'}</span>{' '}
                        <strong className="text-ink">
                          {profile.gender === 'male'
                            ? isBengali
                              ? 'পাত্র'
                              : 'Groom'
                            : isBengali
                            ? 'পাত্রী'
                            : 'Bride'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'উপজেলা:' : 'Upazila:'}</span>{' '}
                        <strong className="text-ink">
                          {getUpazilaDisplayName(profile.upazila, isBengali)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'বৈবাহিক অবস্থা:' : 'Marital Status:'}</span>{' '}
                        <strong className="text-ink">{profile.maritalStatus}</strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'উচ্চতা:' : 'Height:'}</span>{' '}
                        <strong className="text-ink">
                          {profile.height?.feet || 5}' {profile.height?.inches || 0}"
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'পেশা:' : 'Occupation:'}</span>{' '}
                        <strong className="text-ink">{profile.occupation || '—'}</strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'শিক্ষা:' : 'Education:'}</span>{' '}
                        <strong className="text-ink">{profile.education || '—'}</strong>
                      </div>
                    </div>

                    {profile.religiousInfo && (
                      <div className="pt-2 border-t border-line space-y-1">
                        <span className="font-bold text-ink block">
                          {isBengali ? 'দ্বীনি তথ্য:' : 'Religious Info:'}
                        </span>
                        <div className="flex flex-wrap gap-2 text-[11px] text-ink-2">
                          {profile.religiousInfo.praysFiveTimes && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                              ✓ {isBengali ? '৫ ওয়াক্ত নামাজি' : '5 Times Prayers'}
                            </span>
                          )}
                          {profile.religiousInfo.canReciteQuran && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                              ✓ {isBengali ? 'কুরআন পাঠ' : 'Quran Recitation'}
                            </span>
                          )}
                          {profile.religiousInfo.wearsHijab && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                              ✓ {isBengali ? 'পর্দা / হিজাব' : 'Hijab / Niqab'}
                            </span>
                          )}
                          {profile.religiousInfo.hasBeard && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                              ✓ {isBengali ? 'সুন্নত দাড়ি' : 'Sunnah Beard'}
                            </span>
                          )}
                          {profile.religiousInfo.maintainsMahram && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                              ✓ {isBengali ? 'মাহরাম মেনে চলেন' : 'Maintains Mahram'}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.bio && (
                      <div className="pt-2 border-t border-line">
                        <span className="font-bold text-ink block mb-0.5">
                          {isBengali ? 'জীবনবৃত্তান্ত ও প্রত্যাশা:' : 'Bio & Expectations:'}
                        </span>
                        <p className="text-ink-3 leading-relaxed">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-ink-3 italic text-center py-6">
                    {isBengali
                      ? 'এই ইউজারের কোনো বায়োডাটা প্রোফাইল নেই।'
                      : 'This user does not have a registered biodata profile.'}
                  </p>
                )}
              </div>
            )}

            {/* Content: Guardian Info */}
            {activeTab === 'guardian' && (
              <div className="space-y-4">
                {application?.guardian ? (
                  <div className="bg-elev border border-line rounded-xl p-4 text-xs space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-ink-3">{isBengali ? 'অভিভাবকের নাম:' : "Guardian's Name:"}</span>{' '}
                        <strong className="text-ink">{application.guardian.name}</strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'সম্পর্ক:' : 'Relationship:'}</span>{' '}
                        <strong className="text-ink">
                          {application.guardian.relationship}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'মোবাইল নম্বর:' : 'Mobile Number:'}</span>{' '}
                        <strong className="text-ink font-mono">
                          {application.guardian.phone}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'ইমেইল:' : 'Email:'}</span>{' '}
                        <strong className="text-ink font-mono">
                          {application.guardian.email || '—'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'সম্মতি প্রদানের সময়:' : 'Consent Recorded At:'}</span>{' '}
                        <strong className="text-ink">
                          {application.guardianConsentedAt
                            ? new Date(application.guardianConsentedAt).toLocaleString(
                                isBengali ? 'bn-BD' : 'en-US'
                              )
                            : isBengali ? 'সরাসরি যাচাইকৃত' : 'Directly Verified'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-ink-3">{isBengali ? 'পর্যালোচক অ্যাডমিন:' : 'Reviewed By:'}</span>{' '}
                        <strong className="text-ink">
                          {application.reviewedBy?.name || (isBengali ? 'অ্যাডমিন টিম' : 'Admin Team')}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-ink-3 italic text-center py-6">
                    {isBengali
                      ? 'কোনো অভিভাবকের বিবরণ সংরক্ষিত নেই।'
                      : 'No guardian information recorded.'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default User360Modal;
