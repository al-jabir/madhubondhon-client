import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  Globe,
  Shield,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  CreditCard,
  Share2,
  Search,
  Bell,
  Coins,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { PlatformSettings } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useLanguage } from '../../../i18n/LanguageContext';

export const AdminSettingsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali } = useLanguage();

  const [activeSubTab, setActiveSubTab] = useState<'general' | 'payment' | 'security' | 'maintenance' | 'seo' | 'alerts'>('general');

  // Loading states for granular actions
  const [pendingToggleKey, setPendingToggleKey] = useState<string | null>(null);
  const [savingSection, setSavingSection] = useState<string | null>(null);

  // General & Social States
  const [siteName, setSiteName] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [supportWhatsApp, setSupportWhatsApp] = useState('');
  const [officeAddress, setOfficeAddress] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [telegramUrl, setTelegramUrl] = useState('');

  // Payment States
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashType, setBkashType] = useState('Send Money / Personal');
  const [nagadNumber, setNagadNumber] = useState('');
  const [nagadType, setNagadType] = useState('Send Money / Personal');
  const [rocketNumber, setRocketNumber] = useState('');
  const [rocketType, setRocketType] = useState('Send Money / Personal');
  const [paymentInstructions, setPaymentInstructions] = useState('');

  // Security, Limits & Policies
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [requireBiodataApproval, setRequireBiodataApproval] = useState(true);
  const [showDemoProfiles, setShowDemoProfiles] = useState(true);
  const [allowProfilePhotos, setAllowProfilePhotos] = useState(true);
  const [maxPhotosPerUser, setMaxPhotosPerUser] = useState(5);
  const [freeWelcomeCredits, setFreeWelcomeCredits] = useState(0);
  const [dailyInterestLimit, setDailyInterestLimit] = useState(10);
  const [contactCreditCost, setContactCreditCost] = useState(100);

  // Maintenance States
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceNotice, setMaintenanceNotice] = useState('');

  // SEO States
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');

  // Alerts States
  const [enableAdminEmailAlerts, setEnableAdminEmailAlerts] = useState(true);
  const [enableNewReportAlerts, setEnableNewReportAlerts] = useState(true);

  // Settings Query
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => adminApi.getSettings(),
  });

  const settings = settingsData?.data?.settings;

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || (isBengali ? 'মধুবন্ধন' : 'MadhuBondhon'));
      setSiteTagline(
        settings.siteTagline ||
          (isBengali ? 'টাঙ্গাইল জেলার বিশ্বস্ত বৈবাহিক প্ল্যাটফর্ম' : 'Tangail Matrimonial Platform')
      );
      setContactEmail(settings.contactEmail || 'support@madhubondhon.com');
      setContactPhone(settings.contactPhone || '+8801711000000');
      setSupportWhatsApp(settings.supportWhatsApp || '+8801711000000');
      setOfficeAddress(settings.officeAddress || 'ভিক্টোরিয়া রোড, টাঙ্গাইল সদর, টাঙ্গাইল');
      setFacebookUrl(settings.facebookUrl || 'https://facebook.com');
      setYoutubeUrl(settings.youtubeUrl || '');
      setTelegramUrl(settings.telegramUrl || '');

      setBkashNumber(settings.bkashNumber || '01700-000000');
      setBkashType(settings.bkashType || 'Send Money / Personal');
      setNagadNumber(settings.nagadNumber || '01700-000000');
      setNagadType(settings.nagadType || 'Send Money / Personal');
      setRocketNumber(settings.rocketNumber || '01700-000000');
      setRocketType(settings.rocketType || 'Send Money / Personal');
      setPaymentInstructions(
        settings.paymentInstructions ||
          'বিকাশ বা নগদ থেকে টাকা পাঠিয়ে নিচের ফর্মে আপনার মোবাইল নম্বর এবং ট্রানজেকশন আইডি (TrxID) সাবমিট করুন। অ্যাডমিন টিম সর্বোচ্চ ৫-১০ মিনিটের মধ্যে ক্রেডিট যোগ করে দেবে।'
      );

      setRegistrationOpen(settings.registrationOpen !== false);
      setRequireBiodataApproval(settings.requireBiodataApproval !== false);
      setShowDemoProfiles(settings.showDemoProfiles !== false);
      setAllowProfilePhotos(settings.allowProfilePhotos !== false);
      setMaxPhotosPerUser(settings.maxPhotosPerUser || 5);
      setFreeWelcomeCredits(settings.freeWelcomeCredits || 0);
      setDailyInterestLimit(settings.dailyInterestLimit || 10);
      setContactCreditCost(settings.contactCreditCost || 100);

      setMaintenanceMode(Boolean(settings.maintenanceMode));
      setMaintenanceNotice(
        settings.maintenanceNotice ||
          'ওয়েবসাইটের নিরাপত্তা ও পারফরম্যান্স উন্নয়নের কাজ চলছে। শীঘ্রই আমরা ফিরে আসব ইনশাআল্লাহ।'
      );

      setMetaTitle(
        settings.metaTitle || 'মধুবন্ধন — টাঙ্গাইল জেলার বিশ্বস্ত বৈবাহিক প্ল্যাটফর্ম'
      );
      setMetaDescription(
        settings.metaDescription ||
          'টাঙ্গাইল জেলার মুসলিম পাত্র-পাত্রীদের শরীয়াহ সম্মত নিরাপদ বৈবাহিক মাধ্যম। সম্পূর্ণ পারিবারিক উদ্যোগে পাত্র-পাত্রীর বায়োডাটা খুঁজুন।'
      );
      setMetaKeywords(
        settings.metaKeywords ||
          'টাঙ্গাইল ম্যাট্রিমনি, মুসলিম বিবাহ, বায়োডাটা, টাঙ্গাইল পাত্র পাত্রী, মধুবন্ধন'
      );

      setEnableAdminEmailAlerts(settings.enableAdminEmailAlerts !== false);
      setEnableNewReportAlerts(settings.enableNewReportAlerts !== false);
    }
  }, [settings, isBengali]);

  // Instant Toggle Handler (Auto-save on Switch)
  const handleToggle = async (
    key: keyof PlatformSettings,
    nextValue: boolean,
    labelBn: string,
    labelEn: string
  ) => {
    // 1. Optimistic local update
    if (key === 'registrationOpen') setRegistrationOpen(nextValue);
    else if (key === 'requireBiodataApproval') setRequireBiodataApproval(nextValue);
    else if (key === 'allowProfilePhotos') setAllowProfilePhotos(nextValue);
    else if (key === 'showDemoProfiles') {
      setShowDemoProfiles(nextValue);
      localStorage.setItem('mb_show_demo_profiles', String(nextValue));
    } else if (key === 'maintenanceMode') setMaintenanceMode(nextValue);
    else if (key === 'enableAdminEmailAlerts') setEnableAdminEmailAlerts(nextValue);
    else if (key === 'enableNewReportAlerts') setEnableNewReportAlerts(nextValue);

    setPendingToggleKey(key as string);

    try {
      await adminApi.updateSettings({ [key]: nextValue });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['public-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['search-profiles'] }),
      ]);
      toast.success(
        isBengali
          ? `${labelBn} ${nextValue ? 'সফলভাবে চালু (ON) করা হয়েছে' : 'সফলভাবে বন্ধ (OFF) করা হয়েছে'}`
          : `${labelEn} successfully turned ${nextValue ? 'ON' : 'OFF'}`
      );
    } catch (err: any) {
      // Revert on error
      if (key === 'registrationOpen') setRegistrationOpen(!nextValue);
      else if (key === 'requireBiodataApproval') setRequireBiodataApproval(!nextValue);
      else if (key === 'allowProfilePhotos') setAllowProfilePhotos(!nextValue);
      else if (key === 'showDemoProfiles') {
        setShowDemoProfiles(!nextValue);
        localStorage.setItem('mb_show_demo_profiles', String(!nextValue));
      } else if (key === 'maintenanceMode') setMaintenanceMode(!nextValue);
      else if (key === 'enableAdminEmailAlerts') setEnableAdminEmailAlerts(!nextValue);
      else if (key === 'enableNewReportAlerts') setEnableNewReportAlerts(!nextValue);

      toast.error(
        err.response?.data?.message ||
          (isBengali ? 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে।' : 'Failed to change setting status.')
      );
    } finally {
      setPendingToggleKey(null);
    }
  };

  // Dedicated Per-Section Save Handler
  const handleSaveSection = async (
    sectionKey: string,
    data: Partial<PlatformSettings>,
    successMsgBn: string,
    successMsgEn: string
  ) => {
    setSavingSection(sectionKey);
    try {
      await adminApi.updateSettings(data);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['public-settings'] }),
        queryClient.invalidateQueries({ queryKey: ['credit-packages'] }),
        queryClient.invalidateQueries({ queryKey: ['search-profiles'] }),
      ]);
      toast.success(isBengali ? successMsgBn : successMsgEn);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          (isBengali ? 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save settings.')
      );
    } finally {
      setSavingSection(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-card border border-line p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400">
              <Settings className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <span>{isBengali ? 'সিস্টেম ও প্ল্যাটফর্ম সেটিংস' : 'System & Platform Settings'}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600/15 text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                Super Admin
              </span>
            </h2>
          </div>
          <p className="text-xs text-ink-3">
            {isBengali
              ? 'ওয়েবসাইটের পরিচিতি, মোবাইল ব্যাংকিং, অন/অফ সুইচ, এসইও ও নোটিফিকেশন নিয়ন্ত্রণ'
              : 'Website branding, mobile banking numbers, instant switches, SEO and notification controls'}
          </p>
        </div>

        {/* Live Granular Status Pill (Replaced monolithic Save All) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {isBengali
              ? 'তাত্ক্ষণিক অন/অফ ও সেকশন সেভ সক্রিয়'
              : 'Direct On/Off & Section Save Active'}
          </span>
        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-1.5 p-1 bg-elev rounded-2xl border border-line overflow-x-auto">
        {[
          { id: 'general', label: isBengali ? 'সাধারণ ও সোশ্যাল' : 'General & Social', icon: Globe },
          { id: 'payment', label: isBengali ? 'মোবাইল ব্যাংকিং ও পেমেন্ট' : 'Mobile Banking', icon: CreditCard },
          { id: 'security', label: isBengali ? 'অন/অফ সুইচ ও লিমিট' : 'Switches & Limits', icon: Shield },
          { id: 'maintenance', label: isBengali ? 'মেইনটেন্যান্স মোড' : 'Maintenance Mode', icon: AlertTriangle },
          { id: 'seo', label: isBengali ? 'এসইও ও মেটাডাটা' : 'SEO & Metadata', icon: Search },
          { id: 'alerts', label: isBengali ? 'অ্যাডমিন অ্যালার্ট' : 'Admin Alerts', icon: Bell },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-card text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-ink-3 hover:text-ink'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center bg-card border border-line rounded-2xl">
          <LoadingSpinner size="lg" label={isBengali ? 'সেটিংস লোড হচ্ছে...' : 'Loading settings...'} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: General & Social */}
          {activeSubTab === 'general' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Branding Section */}
              <div className="bg-card border border-line p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-ink flex items-center gap-2 border-b border-line pb-2.5">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span>{isBengali ? 'ওয়েবসাইট পরিচিতি ও ব্র্যান্ডিং' : 'Website Info & Branding'}</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'ওয়েবসাইটের নাম (Site Name):' : 'Site Name:'}
                      </label>
                      <input
                        type="text"
                        value={siteName}
                        onChange={(e) => setSiteName(e.target.value)}
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'ট্যাগলাইন (Site Tagline):' : 'Site Tagline:'}
                      </label>
                      <input
                        type="text"
                        value={siteTagline}
                        onChange={(e) => setSiteTagline(e.target.value)}
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'অফিস ঠিকানা (Office Address):' : 'Office Address:'}
                      </label>
                      <input
                        type="text"
                        value={officeAddress}
                        onChange={(e) => setOfficeAddress(e.target.value)}
                        placeholder="যেমন: ভিক্টোরিয়া রোড, টাঙ্গাইল সদর, টাঙ্গাইল"
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Specific Save Button */}
                <div className="pt-4 border-t border-line flex justify-end">
                  <button
                    type="button"
                    disabled={savingSection === 'branding'}
                    onClick={() =>
                      handleSaveSection(
                        'branding',
                        { siteName, siteTagline, officeAddress },
                        'ওয়েবসাইট পরিচিতি সফলভাবে সংরক্ষিত হয়েছে!',
                        'Website branding saved successfully!'
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                  >
                    {savingSection === 'branding' ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {savingSection === 'branding'
                        ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                        : (isBengali ? 'ব্র্যান্ডিং সংরক্ষণ করুন' : 'Save Branding')}
                    </span>
                  </button>
                </div>
              </div>

              {/* Contact & Social Links Section */}
              <div className="bg-card border border-line p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-ink flex items-center gap-2 border-b border-line pb-2.5">
                    <Share2 className="w-4 h-4 text-blue-500" />
                    <span>{isBengali ? 'যোগাযোগ মাধ্যম ও সোশ্যাল লিংক' : 'Contact & Social Links'}</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'সাপোর্ট ইমেইল (Contact Email):' : 'Contact Email:'}
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-ink mb-1">
                          {isBengali ? 'হটলাইন নম্বর:' : 'Contact Phone:'}
                        </label>
                        <input
                          type="text"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-ink mb-1">
                          {isBengali ? 'হোয়াটসঅ্যাপ সাপোর্ট:' : 'WhatsApp Support:'}
                        </label>
                        <input
                          type="text"
                          value={supportWhatsApp}
                          onChange={(e) => setSupportWhatsApp(e.target.value)}
                          className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'ফেসবুক পেজ / গ্রুপ লিংক:' : 'Facebook Page / Group URL:'}
                      </label>
                      <input
                        type="url"
                        value={facebookUrl}
                        onChange={(e) => setFacebookUrl(e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-ink mb-1">
                          {isBengali ? 'ইউটিউব চ্যানেল (ঐচ্ছিক):' : 'YouTube Channel:'}
                        </label>
                        <input
                          type="url"
                          value={youtubeUrl}
                          onChange={(e) => setYoutubeUrl(e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-ink mb-1">
                          {isBengali ? 'টেলিগ্রাম সাপোর্ট (ঐচ্ছিক):' : 'Telegram Support:'}
                        </label>
                        <input
                          type="url"
                          value={telegramUrl}
                          onChange={(e) => setTelegramUrl(e.target.value)}
                          placeholder="https://t.me/..."
                          className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Specific Save Button */}
                <div className="pt-4 border-t border-line flex justify-end">
                  <button
                    type="button"
                    disabled={savingSection === 'social'}
                    onClick={() =>
                      handleSaveSection(
                        'social',
                        { contactEmail, contactPhone, supportWhatsApp, facebookUrl, youtubeUrl, telegramUrl },
                        'যোগাযোগ ও সোশ্যাল মিডিয়া তথ্য সংরক্ষিত হয়েছে!',
                        'Contact & social details saved successfully!'
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                  >
                    {savingSection === 'social' ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {savingSection === 'social'
                        ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                        : (isBengali ? 'যোগাযোগ তথ্য সংরক্ষণ করুন' : 'Save Contact Info')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Mobile Banking & Payment Numbers */}
          {activeSubTab === 'payment' && (
            <div className="bg-card border border-line p-5 sm:p-6 rounded-2xl space-y-6">
              <div>
                <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>{isBengali ? 'মোবাইল ব্যাংকিং অ্যাকাউন্ট ও পেমেন্ট নির্দেশিকা' : 'Mobile Banking Accounts & Instructions'}</span>
                </h3>
                <p className="text-xs text-ink-3 mt-1">
                  {isBengali
                    ? 'প্যাকেজ ক্রয়ের সময় ব্যবহারকারীদের প্রদর্শিত bKash, Nagad এবং Rocket পেমেন্ট নম্বরসমূহ'
                    : 'bKash, Nagad, and Rocket numbers shown to users during credit package purchase'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* bKash */}
                <div className="bg-elev border border-line p-4 rounded-xl space-y-3">
                  <span className="font-bold text-xs text-pink-600 block">
                    {isBengali ? 'বিকাশ (bKash) কনফিগারেশন' : 'bKash Configuration'}
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-2 mb-1">
                      {isBengali ? 'বিকাশ মোবাইল নম্বর' : 'bKash Account Number'}
                    </label>
                    <input
                      type="text"
                      value={bkashNumber}
                      onChange={(e) => setBkashNumber(e.target.value)}
                      placeholder="01700-000000"
                      className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-2 mb-1">
                      {isBengali ? 'অ্যাকাউন্টের ধরন' : 'Account Type'}
                    </label>
                    <input
                      type="text"
                      value={bkashType}
                      onChange={(e) => setBkashType(e.target.value)}
                      placeholder="Send Money / Personal"
                      className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Nagad */}
                <div className="bg-elev border border-line p-4 rounded-xl space-y-3">
                  <span className="font-bold text-xs text-amber-600 block">
                    {isBengali ? 'নগদ (Nagad) কনফিগারেশন' : 'Nagad Configuration'}
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-2 mb-1">
                      {isBengali ? 'নগদ মোবাইল নম্বর' : 'Nagad Account Number'}
                    </label>
                    <input
                      type="text"
                      value={nagadNumber}
                      onChange={(e) => setNagadNumber(e.target.value)}
                      placeholder="01700-000000"
                      className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-2 mb-1">
                      {isBengali ? 'অ্যাকাউন্টের ধরন' : 'Account Type'}
                    </label>
                    <input
                      type="text"
                      value={nagadType}
                      onChange={(e) => setNagadType(e.target.value)}
                      placeholder="Send Money / Personal"
                      className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-600"
                    />
                  </div>
                </div>

                {/* Rocket */}
                <div className="bg-elev border border-line p-4 rounded-xl space-y-3">
                  <span className="font-bold text-xs text-purple-600 block">
                    {isBengali ? 'রকেট (Rocket) কনফিগারেশন' : 'Rocket Configuration'}
                  </span>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-2 mb-1">
                      {isBengali ? 'রকেট মোবাইল নম্বর' : 'Rocket Account Number'}
                    </label>
                    <input
                      type="text"
                      value={rocketNumber}
                      onChange={(e) => setRocketNumber(e.target.value)}
                      placeholder="01700-000000"
                      className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink-2 mb-1">
                      {isBengali ? 'অ্যাকাউন্টের ধরন' : 'Account Type'}
                    </label>
                    <input
                      type="text"
                      value={rocketType}
                      onChange={(e) => setRocketType(e.target.value)}
                      placeholder="Send Money / Personal"
                      className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-ink text-xs mb-1.5">
                  {isBengali
                    ? 'ব্যবহারকারীদের জন্য পেমেন্ট নির্দেশিকা টেক্সট (Payment Note & Instructions):'
                    : 'Payment Instructions & Note for Users:'}
                </label>
                <textarea
                  rows={3}
                  value={paymentInstructions}
                  onChange={(e) => setPaymentInstructions(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl p-3 text-xs focus:outline-hidden focus:border-purple-600 leading-relaxed"
                />
              </div>

              {/* Dedicated Payment Save Button */}
              <div className="pt-3 border-t border-line flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'payment'}
                  onClick={() =>
                    handleSaveSection(
                      'payment',
                      {
                        bkashNumber,
                        bkashType,
                        nagadNumber,
                        nagadType,
                        rocketNumber,
                        rocketType,
                        paymentInstructions,
                      },
                      'মোবাইল ব্যাংকিং ও পেমেন্ট নির্দেশিকা সংরক্ষিত হয়েছে!',
                      'Payment configuration saved successfully!'
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                >
                  {savingSection === 'payment' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {savingSection === 'payment'
                      ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                      : (isBengali ? 'পেমেন্ট তথ্য ও নির্দেশিকা সংরক্ষণ করুন' : 'Save Payment Info')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Security, Limits & Policies */}
          {activeSubTab === 'security' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Switches (Instant Toggle On/Off) */}
              <div className="bg-card border border-line p-5 rounded-2xl space-y-4">
                <div className="border-b border-line pb-2.5">
                  <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-600" />
                    <span>{isBengali ? 'প্ল্যাটফর্ম অপারেশনাল সুইচ' : 'Operational Feature Switches'}</span>
                  </h3>
                  <p className="text-[11px] text-ink-3 mt-1">
                    {isBengali
                      ? 'যেকোনো সুইচ ক্লিক করলেই তাত্ক্ষণিকভাবে অন বা অফ সংরক্ষিত হয়ে যাবে'
                      : 'Switches automatically save on-the-fly upon toggle'}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Registration Switch */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-elev border border-line">
                    <div className="pr-3">
                      <div className="font-bold text-ink">{isBengali ? 'নতুন মেম্বার রেজিস্ট্রেশন' : 'Member Registration'}</div>
                      <div className="text-ink-3 text-[11px]">
                        {isBengali ? 'উন্মুক্ত রাখলে নতুন পাত্র-পাত্রী একাউন্ট খুলতে পারবেন' : 'Allow new users to register on the site'}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={pendingToggleKey === 'registrationOpen'}
                      onClick={() =>
                        handleToggle(
                          'registrationOpen',
                          !registrationOpen,
                          'নতুন মেম্বার রেজিস্ট্রেশন',
                          'Member Registration'
                        )
                      }
                      className="cursor-pointer disabled:opacity-50 transition-opacity flex items-center gap-2 shrink-0"
                      title={
                        registrationOpen
                          ? isBengali ? 'বন্ধ করতে ক্লিক করুন' : 'Click to turn OFF'
                          : isBengali ? 'চালু করতে ক্লিক করুন' : 'Click to turn ON'
                      }
                    >
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          registrationOpen
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-ink-4/10 text-ink-3'
                        }`}
                      >
                        {registrationOpen ? (isBengali ? 'চালু (ON)' : 'ON') : (isBengali ? 'বন্ধ (OFF)' : 'OFF')}
                      </span>
                      {pendingToggleKey === 'registrationOpen' ? (
                        <LoadingSpinner size="sm" />
                      ) : registrationOpen ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500 hover:scale-105 transition-transform" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-ink-3 hover:scale-105 transition-transform" />
                      )}
                    </button>
                  </div>

                  {/* Require Biodata Approval */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-elev border border-line">
                    <div className="pr-3">
                      <div className="font-bold text-ink">{isBengali ? 'বায়োডাটা অনুমোদন আবশ্যক' : 'Require Biodata Approval'}</div>
                      <div className="text-ink-3 text-[11px]">
                        {isBengali ? 'মডারেটর অনুমোদন ছাড়া প্রোফাইল সার্চে আসবে না' : 'Profiles must be approved by moderators'}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={pendingToggleKey === 'requireBiodataApproval'}
                      onClick={() =>
                        handleToggle(
                          'requireBiodataApproval',
                          !requireBiodataApproval,
                          'বায়োডাটা অনুমোদন আবশ্যক',
                          'Biodata Approval'
                        )
                      }
                      className="cursor-pointer disabled:opacity-50 transition-opacity flex items-center gap-2 shrink-0"
                      title={
                        requireBiodataApproval
                          ? isBengali ? 'বন্ধ করতে ক্লিক করুন' : 'Click to turn OFF'
                          : isBengali ? 'চালু করতে ক্লিক করুন' : 'Click to turn ON'
                      }
                    >
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          requireBiodataApproval
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-ink-4/10 text-ink-3'
                        }`}
                      >
                        {requireBiodataApproval ? (isBengali ? 'চালু (ON)' : 'ON') : (isBengali ? 'বন্ধ (OFF)' : 'OFF')}
                      </span>
                      {pendingToggleKey === 'requireBiodataApproval' ? (
                        <LoadingSpinner size="sm" />
                      ) : requireBiodataApproval ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500 hover:scale-105 transition-transform" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-ink-3 hover:scale-105 transition-transform" />
                      )}
                    </button>
                  </div>

                  {/* Allow Profile Photos Toggle */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-elev border border-line">
                    <div className="pr-3">
                      <div className="font-bold text-ink flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-blue-500" />
                        <span>{isBengali ? 'প্রোফাইলে ছবি আপলোড সুবিধা' : 'Profile Photo Uploads'}</span>
                      </div>
                      <div className="text-ink-3 text-[11px]">
                        {isBengali ? 'বন্ধ রাখলে সাইটে ছবি আপলোড অপশন হাইড থাকবে' : 'Toggle profile photo feature for modesty'}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={pendingToggleKey === 'allowProfilePhotos'}
                      onClick={() =>
                        handleToggle(
                          'allowProfilePhotos',
                          !allowProfilePhotos,
                          'প্রোফাইলে ছবি আপলোড সুবিধা',
                          'Profile Photo Uploads'
                        )
                      }
                      className="cursor-pointer disabled:opacity-50 transition-opacity flex items-center gap-2 shrink-0"
                      title={
                        allowProfilePhotos
                          ? isBengali ? 'বন্ধ করতে ক্লিক করুন' : 'Click to turn OFF'
                          : isBengali ? 'চালু করতে ক্লিক করুন' : 'Click to turn ON'
                      }
                    >
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          allowProfilePhotos
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-ink-4/10 text-ink-3'
                        }`}
                      >
                        {allowProfilePhotos ? (isBengali ? 'চালু (ON)' : 'ON') : (isBengali ? 'বন্ধ (OFF)' : 'OFF')}
                      </span>
                      {pendingToggleKey === 'allowProfilePhotos' ? (
                        <LoadingSpinner size="sm" />
                      ) : allowProfilePhotos ? (
                        <ToggleRight className="w-8 h-8 text-emerald-500 hover:scale-105 transition-transform" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-ink-3 hover:scale-105 transition-transform" />
                      )}
                    </button>
                  </div>

                  {/* Show Demo Profiles Switch */}
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <div className="pr-3">
                      <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isBengali ? 'ওয়েবসাইটে নমুনা বায়োডাটা প্রদর্শন (Demo Data)' : 'Display Demo Profiles'}</span>
                      </div>
                      <div className="text-ink-3 text-[11px]">
                        {isBengali
                          ? 'চালু থাকলে সাধারণ ভিজিটররা ন্যাভবারে "নমুনা বায়োডাটা" লিংক দেখতে পাবেন'
                          : 'Public visitors can view sample demo profiles'}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={pendingToggleKey === 'showDemoProfiles'}
                      onClick={() =>
                        handleToggle(
                          'showDemoProfiles',
                          !showDemoProfiles,
                          'নমুনা বায়োডাটা প্রদর্শন (Demo Data)',
                          'Display Demo Profiles'
                        )
                      }
                      className="cursor-pointer disabled:opacity-50 transition-opacity flex items-center gap-2 shrink-0"
                      title={
                        showDemoProfiles
                          ? isBengali ? 'বন্ধ করতে ক্লিক করুন' : 'Click to turn OFF'
                          : isBengali ? 'চালু করতে ক্লিক করুন' : 'Click to turn ON'
                      }
                    >
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          showDemoProfiles
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'bg-ink-4/10 text-ink-3'
                        }`}
                      >
                        {showDemoProfiles ? (isBengali ? 'চালু (ON)' : 'ON') : (isBengali ? 'বন্ধ (OFF)' : 'OFF')}
                      </span>
                      {pendingToggleKey === 'showDemoProfiles' ? (
                        <LoadingSpinner size="sm" />
                      ) : showDemoProfiles ? (
                        <ToggleRight className="w-8 h-8 text-amber-500 hover:scale-105 transition-transform" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-ink-3 hover:scale-105 transition-transform" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security & Spam Limits (Dedicated Save Button) */}
              <div className="bg-card border border-line p-5 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm text-ink flex items-center gap-2 border-b border-line pb-2.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <span>{isBengali ? 'স্প্যাম প্রতিরোধ, ক্রেডিট ও ইউজার লিমিট' : 'Limits, Credits & Pricing'}</span>
                  </h3>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'ফ্রি ওয়েলকাম ক্রেডিট (রেজিস্ট্রেশন বোনাস):' : 'Free Welcome Credits (Registration Bonus):'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={freeWelcomeCredits}
                        onChange={(e) => setFreeWelcomeCredits(Number(e.target.value))}
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                      />
                      <span className="text-[10px] text-ink-3 mt-0.5 block">
                        {isBengali
                          ? 'নতুন ইউজার যোগ দিলে অ্যাকাউন্ট খোলার সাথে সাথে এই পরিমাণ ক্রেডিট উপহার পাবে।'
                          : 'New users will receive this amount of free contact credits upon registration.'}
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'দৈনিক সর্বোচ্চ আগ্রহ প্রেরণের সীমা (Daily Interest Limit):' : 'Daily Interest Sending Limit:'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={dailyInterestLimit}
                        onChange={(e) => setDailyInterestLimit(Number(e.target.value))}
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                      />
                      <span className="text-[10px] text-ink-3 mt-0.5 block">
                        {isBengali
                          ? 'স্প্যামিং ঠেকাতে একজন সাধারণ ইউজার দিনে সর্বোচ্চ কতটি আগ্রহ পাঠাতে পারবে।'
                          : 'Anti-spam limit for maximum interest requests a user can send per day.'}
                      </span>
                    </div>

                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'ইউজার প্রতি সর্বোচ্চ ছবি আপলোড সীমা:' : 'Max Photos Per User:'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={maxPhotosPerUser}
                        onChange={(e) => setMaxPhotosPerUser(Number(e.target.value))}
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-ink mb-1">
                        {isBengali ? 'প্রতি যোগাযোগ তথ্যের অনুমোদনে ক্রেডিট মূল্য (BDT):' : 'Credit Cost per Contact Unlock (BDT):'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={contactCreditCost}
                        onChange={(e) => setContactCreditCost(Number(e.target.value))}
                        className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs font-mono focus:outline-hidden focus:border-purple-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Specific Save Button */}
                <div className="pt-3 border-t border-line flex justify-end">
                  <button
                    type="button"
                    disabled={savingSection === 'limits'}
                    onClick={() =>
                      handleSaveSection(
                        'limits',
                        {
                          maxPhotosPerUser: Number(maxPhotosPerUser),
                          freeWelcomeCredits: Number(freeWelcomeCredits),
                          dailyInterestLimit: Number(dailyInterestLimit),
                          contactCreditCost: Number(contactCreditCost),
                        },
                        'ইউজার ও ক্রেডিট লিমিট সংরক্ষিত হয়েছে!',
                        'Limits and credit settings saved successfully!'
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                  >
                    {savingSection === 'limits' ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>
                      {savingSection === 'limits'
                        ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                        : (isBengali ? 'লিমিট ও ক্রেডিট সেটিংস সংরক্ষণ করুন' : 'Save Limits & Credits')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Maintenance Mode */}
          {activeSubTab === 'maintenance' && (
            <div className="bg-card border border-line p-5 sm:p-6 rounded-2xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line pb-4">
                <div className="space-y-1">
                  <div className="font-bold text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{isBengali ? 'সাইট মেইনটেন্যান্স মোড (Maintenance Mode)' : 'Site Maintenance Mode'}</span>
                  </div>
                  <p className="text-xs text-ink-3">
                    {isBengali
                      ? 'চালু থাকলে সাধারণ ভিজিটররা সাইট ব্রাউজ করতে পারবেন না। ক্লিক করার সাথে সাথে মোড তাৎক্ষণিক পরিবর্তন হবে।'
                      : 'When enabled, general visitors will see a maintenance notice. Toggling saves immediately.'}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={pendingToggleKey === 'maintenanceMode'}
                  onClick={() =>
                    handleToggle(
                      'maintenanceMode',
                      !maintenanceMode,
                      'সাইট মেইনটেন্যান্স মোড',
                      'Maintenance Mode'
                    )
                  }
                  className="cursor-pointer disabled:opacity-50 transition-opacity flex items-center gap-2.5 self-start sm:self-auto"
                  title={
                    maintenanceMode
                      ? isBengali ? 'স্বাভাবিক মোডে ফিরতে ক্লিক করুন' : 'Click to disable maintenance'
                      : isBengali ? 'মেইনটেন্যান্স চালু করতে ক্লিক করুন' : 'Click to enable maintenance'
                  }
                >
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      maintenanceMode
                        ? 'bg-red-500/15 text-red-600 dark:text-red-400 animate-pulse'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {maintenanceMode
                      ? (isBengali ? 'মেইনটেন্যান্স সক্রিয় (ON)' : 'MAINTENANCE ACTIVE')
                      : (isBengali ? 'সাইট লাইভ (OFF)' : 'SITE LIVE')}
                  </span>
                  {pendingToggleKey === 'maintenanceMode' ? (
                    <LoadingSpinner size="sm" />
                  ) : maintenanceMode ? (
                    <ToggleRight className="w-10 h-10 text-red-500 hover:scale-105 transition-transform" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-ink-3 hover:scale-105 transition-transform" />
                  )}
                </button>
              </div>

              <div>
                <label className="block font-bold text-ink text-xs mb-1.5">
                  {isBengali ? 'মেইনটেন্যান্স চলাকালীন ভিজিটরদের জন্য কাস্টম নোটিশ:' : 'Custom Maintenance Notice to Visitors:'}
                </label>
                <textarea
                  rows={4}
                  value={maintenanceNotice}
                  onChange={(e) => setMaintenanceNotice(e.target.value)}
                  placeholder={
                    isBengali
                      ? 'ওয়েবসাইটের নিরাপত্তা ও পারফরম্যান্স উন্নয়নের কাজ চলছে...'
                      : 'Scheduled maintenance is underway...'
                  }
                  className="w-full bg-base border border-line rounded-xl p-3 text-xs focus:outline-hidden focus:border-red-500 leading-relaxed"
                />
              </div>

              {/* Dedicated Maintenance Notice Save Button */}
              <div className="pt-3 border-t border-line flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'maintenanceNotice'}
                  onClick={() =>
                    handleSaveSection(
                      'maintenanceNotice',
                      { maintenanceNotice },
                      'মেইনটেন্যান্স নোটিশ সফলভাবে সংরক্ষিত হয়েছে!',
                      'Maintenance notice saved successfully!'
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                >
                  {savingSection === 'maintenanceNotice' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {savingSection === 'maintenanceNotice'
                      ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                      : (isBengali ? 'নোটিশ সংরক্ষণ করুন' : 'Save Notice')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: SEO & Metadata */}
          {activeSubTab === 'seo' && (
            <div className="bg-card border border-line p-5 sm:p-6 rounded-2xl space-y-5">
              <div>
                <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-600" />
                  <span>{isBengali ? 'সার্চ ইঞ্জিন অপ্টিমাইজেশন (SEO) ও মেটাডাটা' : 'Search Engine Optimization (SEO)'}</span>
                </h3>
                <p className="text-xs text-ink-3 mt-1">
                  {isBengali
                    ? 'গুগল এবং অন্যান্য সার্চ ইঞ্জিনের ফলাফলে প্রদর্শনের জন্য মেটা টাইটেল, ডেসক্রিপশন ও কীওয়ার্ডস'
                    : 'Meta titles, descriptions, and keywords displayed on search engine result pages'}
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-ink mb-1">
                    {isBengali ? 'মেটা টাইটেল (SEO Title):' : 'Meta Title:'}
                  </label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder={
                      isBengali
                        ? 'মধুবন্ধন — টাঙ্গাইল জেলার বিশ্বস্ত বৈবাহিক প্ল্যাটফর্ম'
                        : 'MadhuBondhon — Tangail Matrimony'
                    }
                    className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">
                    {isBengali ? 'মেটা ডেসক্রিপশন (Meta Description):' : 'Meta Description:'}
                  </label>
                  <textarea
                    rows={3}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder={
                      isBengali
                        ? 'টাঙ্গাইল জেলার মুসলিম পাত্র-পাত্রীদের শরীয়াহ সম্মত নিরাপদ বৈবাহিক মাধ্যম...'
                        : 'Safe, trusted Shariah-compliant matrimonial service for Tangail...'
                    }
                    className="w-full bg-base border border-line rounded-xl p-3 text-xs focus:outline-hidden focus:border-purple-600 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">
                    {isBengali ? 'মেটা কীওয়ার্ডস (কমা দিয়ে পৃথক করুন):' : 'Meta Keywords (comma-separated):'}
                  </label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder={
                      isBengali
                        ? 'টাঙ্গাইল ম্যাট্রিমনি, মুসলিম বিবাহ, বায়োডাটা, টাঙ্গাইল পাত্র পাত্রী'
                        : 'Tangail matrimony, Muslim marriage, biodata'
                    }
                    className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Dedicated SEO Save Button */}
              <div className="pt-3 border-t border-line flex justify-end">
                <button
                  type="button"
                  disabled={savingSection === 'seo'}
                  onClick={() =>
                    handleSaveSection(
                      'seo',
                      { metaTitle, metaDescription, metaKeywords },
                      'এসইও ও মেটাডাটা সফলভাবে সংরক্ষিত হয়েছে!',
                      'SEO metadata saved successfully!'
                    )
                  }
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-xs transition-all"
                >
                  {savingSection === 'seo' ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {savingSection === 'seo'
                      ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                      : (isBengali ? 'এসইও সেটিংস সংরক্ষণ করুন' : 'Save SEO Settings')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 6: Admin Alerts & Notifications (Instant Toggles) */}
          {activeSubTab === 'alerts' && (
            <div className="bg-card border border-line p-5 sm:p-6 rounded-2xl space-y-4">
              <div>
                <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <span>{isBengali ? 'অ্যাডমিন টিম ইমেইল ও পুশ অ্যালার্ট' : 'Admin Email & Push Alerts'}</span>
                </h3>
                <p className="text-xs text-ink-3 mt-1">
                  {isBengali
                    ? 'প্ল্যাটফর্মে জরুরি কার্যক্রম সংঘটিত হলে অ্যাডমিন টিমকে অবহিত করার নিয়মাবলী (সুইচ অন/অফ সাথে সাথে কার্যকর হয়)'
                    : 'Configure notifications and alerts sent to administrators (toggles save immediately)'}
                </p>
              </div>

              <div className="space-y-3 text-xs pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-elev border border-line">
                  <div className="pr-3">
                    <div className="font-bold text-ink">
                      {isBengali ? 'নতুন বায়োডাটা আবেদন জমা অ্যালার্ট' : 'New Biodata Submission Alert'}
                    </div>
                    <div className="text-ink-3 text-[11px]">
                      {isBengali
                        ? 'সদস্যরা নতুন বায়োডাটা বা সংশোধন জমা দিলে মডারেশন টিমকে ইমেইল পাঠাবে'
                        : 'Notify administrators when a new biodata is submitted for review'}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={pendingToggleKey === 'enableAdminEmailAlerts'}
                    onClick={() =>
                      handleToggle(
                        'enableAdminEmailAlerts',
                        !enableAdminEmailAlerts,
                        'নতুন বায়োডাটা আবেদন অ্যালার্ট',
                        'New Biodata Submission Alert'
                      )
                    }
                    className="cursor-pointer disabled:opacity-50 transition-opacity flex items-center gap-2 shrink-0"
                    title={
                      enableAdminEmailAlerts
                        ? isBengali ? 'বন্ধ করতে ক্লিক করুন' : 'Click to turn OFF'
                        : isBengali ? 'চালু করতে ক্লিক করুন' : 'Click to turn ON'
                    }
                  >
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enableAdminEmailAlerts
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-ink-4/10 text-ink-3'
                      }`}
                    >
                      {enableAdminEmailAlerts ? (isBengali ? 'চালু (ON)' : 'ON') : (isBengali ? 'বন্ধ (OFF)' : 'OFF')}
                    </span>
                    {pendingToggleKey === 'enableAdminEmailAlerts' ? (
                      <LoadingSpinner size="sm" />
                    ) : enableAdminEmailAlerts ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500 hover:scale-105 transition-transform" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-ink-3 hover:scale-105 transition-transform" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-elev border border-line">
                  <div className="pr-3">
                    <div className="font-bold text-ink">
                      {isBengali ? 'নতুন অভিযোগ বা রিপোর্ট প্রাপ্তি অ্যালার্ট' : 'New Report / Complaint Alert'}
                    </div>
                    <div className="text-ink-3 text-[11px]">
                      {isBengali
                        ? 'কোনো প্রোফাইলের বিরুদ্ধে ফেক তথ্য বা প্রতারণার অভিযোগ আসলে সাথে সাথে অ্যালার্ট পাঠানো হবে'
                        : 'Instant notification on new fraudulent or abusive profile reports'}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={pendingToggleKey === 'enableNewReportAlerts'}
                    onClick={() =>
                      handleToggle(
                        'enableNewReportAlerts',
                        !enableNewReportAlerts,
                        'নতুন রিপোর্ট বা অভিযোগ অ্যালার্ট',
                        'New Report / Complaint Alert'
                      )
                    }
                    className="cursor-pointer disabled:opacity-50 transition-opacity flex items-center gap-2 shrink-0"
                    title={
                      enableNewReportAlerts
                        ? isBengali ? 'বন্ধ করতে ক্লিক করুন' : 'Click to turn OFF'
                        : isBengali ? 'চালু করতে ক্লিক করুন' : 'Click to turn ON'
                    }
                  >
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        enableNewReportAlerts
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-ink-4/10 text-ink-3'
                      }`}
                    >
                      {enableNewReportAlerts ? (isBengali ? 'চালু (ON)' : 'ON') : (isBengali ? 'বন্ধ (OFF)' : 'OFF')}
                    </span>
                    {pendingToggleKey === 'enableNewReportAlerts' ? (
                      <LoadingSpinner size="sm" />
                    ) : enableNewReportAlerts ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500 hover:scale-105 transition-transform" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-ink-3 hover:scale-105 transition-transform" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSettingsTab;
