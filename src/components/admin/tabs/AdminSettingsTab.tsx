import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  Globe,
  Shield,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useLanguage } from '../../../i18n/LanguageContext';

export const AdminSettingsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali } = useLanguage();

  const [siteName, setSiteName] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [supportWhatsApp, setSupportWhatsApp] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [requireBiodataApproval, setRequireBiodataApproval] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showDemoProfiles, setShowDemoProfiles] = useState(true);
  const [contactCreditCost, setContactCreditCost] = useState(100);

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
      setRegistrationOpen(settings.registrationOpen !== false);
      setRequireBiodataApproval(settings.requireBiodataApproval !== false);
      setMaintenanceMode(Boolean(settings.maintenanceMode));
      setShowDemoProfiles(settings.showDemoProfiles !== false);
      setContactCreditCost(settings.contactCreditCost || 100);
    }
  }, [settings, isBengali]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updateSettings({
        siteName,
        siteTagline,
        contactEmail,
        contactPhone,
        supportWhatsApp,
        registrationOpen,
        requireBiodataApproval,
        maintenanceMode,
        showDemoProfiles,
        contactCreditCost,
      }),
    onSuccess: () => {
      localStorage.setItem('mb_show_demo_profiles', String(showDemoProfiles));
      toast.success(isBengali ? 'প্ল্যাটফর্ম সেটিংস সফলভাবে সংরক্ষিত হয়েছে।' : 'Platform settings saved successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      queryClient.refetchQueries({ queryKey: ['public-settings'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save settings.'));
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>{isBengali ? 'সিস্টেম ও প্ল্যাটফর্ম সেটিংস (Platform Configuration)' : 'System & Platform Settings'}</span>
          </h2>
          <p className="text-xs text-ink-3">
            {isBengali
              ? 'শুধুমাত্র সুপার অ্যাডমিনের জন্য: ওয়েবসাইটের সাধারণ তথ্য, রেজিস্ট্রেশন কন্ট্রোল ও নিরাপত্তা নিয়মাবলী'
              : 'Super Admin Only: Site information, registration control, and platform operations'}
          </p>
        </div>

        <button
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => updateMutation.mutate()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-md shadow-purple-600/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>
            {updateMutation.isPending
              ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
              : (isBengali ? 'সেটিংস সংরক্ষণ করুন' : 'Save Settings')}
          </span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center mb-card">
          <LoadingSpinner size="lg" label={isBengali ? 'সেটিংস লোড হচ্ছে...' : 'Loading settings...'} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Site Information */}
          <div className="mb-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2 border-b border-line pb-2">
              <Globe className="w-4 h-4 text-brand" />
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
                  className="mb-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'ট্যাগলাইন (Tagline):' : 'Tagline:'}
                </label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  className="mb-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'সাপোর্ট ইমেইল (Contact Email):' : 'Contact Email:'}
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mb-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'হটলাইন নম্বর (Contact Phone):' : 'Contact Phone:'}
                </label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mb-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'হোয়াটসঅ্যাপ সাপোর্ট নম্বর:' : 'WhatsApp Support Number:'}
                </label>
                <input
                  type="text"
                  value={supportWhatsApp}
                  onChange={(e) => setSupportWhatsApp(e.target.value)}
                  className="mb-input text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Platform Controls & Toggles */}
          <div className="space-y-6">
            <div className="mb-card p-5 space-y-4">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2 border-b border-line pb-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>{isBengali ? 'অপারেশনাল কন্ট্রোল ও ফিচার সুইচ' : 'Operational Controls & Feature Switches'}</span>
              </h3>

              <div className="space-y-4 text-xs">
                {/* Registration Switch */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-elev border border-line">
                  <div>
                    <div className="font-bold text-ink">{isBengali ? 'নতুন মেম্বার রেজিস্ট্রেশন' : 'Member Registration'}</div>
                    <div className="text-ink-3 text-[11px]">
                      {isBengali ? 'উন্মুক্ত রাখলে নতুন পাত্র-পাত্রী একাউন্ট খুলতে পারবেন' : 'Allow new users to register on the site'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRegistrationOpen(!registrationOpen)}
                    className="cursor-pointer text-brand"
                  >
                    {registrationOpen ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-ink-3" />
                    )}
                  </button>
                </div>

                {/* Require Biodata Approval */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-elev border border-line">
                  <div>
                    <div className="font-bold text-ink">{isBengali ? 'বায়োডাটা অনুমোদন আবশ্যক' : 'Require Biodata Approval'}</div>
                    <div className="text-ink-3 text-[11px]">
                      {isBengali ? 'মডারেটর অনুমোদন ছাড়া প্রোফাইল সার্চে আসবে না' : 'Profiles must be approved by moderators before appearing publicly'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRequireBiodataApproval(!requireBiodataApproval)}
                    className="cursor-pointer text-brand"
                  >
                    {requireBiodataApproval ? (
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-ink-3" />
                    )}
                  </button>
                </div>

                {/* Show Demo Profiles Switch */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <div>
                    <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isBengali ? 'ওয়েবসাইটে নমুনা বায়োডাটা প্রদর্শন (Demo Data)' : 'Display Demo Profiles on Website'}</span>
                    </div>
                    <div className="text-ink-3 text-[11px]">
                      {isBengali
                        ? 'চালু থাকলে সাধারণ ভিজিটররা ন্যাভবারে "নমুনা বায়োডাটা" লিংক দেখতে পাবেন'
                        : 'When enabled, public visitors can view sample demo profiles'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDemoProfiles(!showDemoProfiles)}
                    className="cursor-pointer"
                  >
                    {showDemoProfiles ? (
                      <ToggleRight className="w-8 h-8 text-amber-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-ink-3" />
                    )}
                  </button>
                </div>

                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div>
                    <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{isBengali ? 'মেইনটেন্যান্স মোড (Maintenance Mode)' : 'Maintenance Mode'}</span>
                    </div>
                    <div className="text-ink-3 text-[11px]">
                      {isBengali
                        ? 'চালু থাকলে সাধারণ সদস্যরা সাময়িক রক্ষণাবেক্ষণ বার্তা দেখবেন'
                        : 'When enabled, public visitors will see a scheduled maintenance notice'}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMaintenanceMode(!maintenanceMode)}
                    className="cursor-pointer"
                  >
                    {maintenanceMode ? (
                      <ToggleRight className="w-8 h-8 text-red-500" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-ink-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Economic / Credit pricing */}
            <div className="mb-card p-5 space-y-3">
              <h3 className="font-bold text-sm text-ink border-b border-line pb-2">
                {isBengali ? 'কন্টাক্ট ক্রেডিট খরচ (টাকা)' : 'Contact Credit Pricing (BDT)'}
              </h3>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {isBengali ? 'প্রতি যোগাযোগ তথ্যের অনুমোদনে ক্রেডিট মূল্য (BDT):' : 'Credit Cost per Contact Unlock (BDT):'}
                </label>
                <input
                  type="number"
                  min={0}
                  value={contactCreditCost}
                  onChange={(e) => setContactCreditCost(Number(e.target.value))}
                  className="mb-input text-xs font-mono max-w-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingsTab;
