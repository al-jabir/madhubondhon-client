import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Settings,
  Save,
  Globe,
  Phone,
  MessageCircle,
  Mail,
  Shield,
  AlertTriangle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { PlatformSettings } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';

export const AdminSettingsTab: React.FC = () => {
  const queryClient = useQueryClient();

  const [siteName, setSiteName] = useState('');
  const [siteTagline, setSiteTagline] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [supportWhatsApp, setSupportWhatsApp] = useState('');
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [requireBiodataApproval, setRequireBiodataApproval] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [contactCreditCost, setContactCreditCost] = useState(100);

  // Settings Query
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['admin-platform-settings'],
    queryFn: () => adminApi.getSettings(),
  });

  const settings = settingsData?.data?.settings;

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || 'মধুবন্ধন');
      setSiteTagline(settings.siteTagline || 'টাঙ্গাইল জেলার বিশ্বস্ত বৈবাহিক প্ল্যাটফর্ম');
      setContactEmail(settings.contactEmail || 'support@madhubondhon.com');
      setContactPhone(settings.contactPhone || '+8801711000000');
      setSupportWhatsApp(settings.supportWhatsApp || '+8801711000000');
      setRegistrationOpen(settings.registrationOpen !== false);
      setRequireBiodataApproval(settings.requireBiodataApproval !== false);
      setMaintenanceMode(Boolean(settings.maintenanceMode));
      setContactCreditCost(settings.contactCreditCost || 100);
    }
  }, [settings]);

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
        contactCreditCost,
      }),
    onSuccess: () => {
      toast.success('প্ল্যাটফর্ম সেটিংস সফলভাবে সংরক্ষিত হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['admin-platform-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'সেটিংস সংরক্ষণ ব্যর্থ হয়েছে।');
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>সিস্টেম ও প্ল্যাটফর্ম সেটিংস (Platform Configuration)</span>
          </h2>
          <p className="text-xs text-ink-3">
            শুধুমাত্র সুপার অ্যাডমিনের জন্য: ওয়েবসাইটের সাধারণ তথ্য, রেজিস্ট্রেশন কন্ট্রোল ও নিরাপত্তা নিয়মাবলী
          </p>
        </div>

        <button
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => updateMutation.mutate()}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-md shadow-purple-600/20 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{updateMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center mb-card">
          <LoadingSpinner size="lg" label="সেটিংস লোড হচ্ছে..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Site Information */}
          <div className="mb-card p-5 space-y-4">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2 border-b border-line pb-2">
              <Globe className="w-4 h-4 text-brand" />
              <span>ওয়েবসাইট পরিচিতি ও ব্র্যান্ডিং</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-ink mb-1">ওয়েবসাইটের নাম (Site Name):</label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  className="mb-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">ট্যাগলাইন (Tagline):</label>
                <input
                  type="text"
                  value={siteTagline}
                  onChange={(e) => setSiteTagline(e.target.value)}
                  className="mb-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">সাপোর্ট ইমেইল (Contact Email):</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="mb-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">হটলাইন নম্বর (Contact Phone):</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="mb-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">হোয়াটসঅ্যাপ সাপোর্ট নম্বর:</label>
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
                <span>অপারেশনাল কন্ট্রোল ও ফিচার সুইচ</span>
              </h3>

              <div className="space-y-4 text-xs">
                {/* Registration Switch */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-elev border border-line">
                  <div>
                    <div className="font-bold text-ink">নতুন মেম্বার রেজিস্ট্রেশন</div>
                    <div className="text-ink-3 text-[11px]">উন্মুক্ত রাখলে নতুন পাত্র-পাত্রী একাউন্ট খুলতে পারবেন</div>
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
                    <div className="font-bold text-ink">বায়োডাটা অনুমোদন আবশ্যক</div>
                    <div className="text-ink-3 text-[11px]">মডারেটর অনুমোদন ছাড়া প্রোফাইল সার্চে আসবে না</div>
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

                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/5 border border-red-500/20">
                  <div>
                    <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>মেইনটেন্যান্স মোড (Maintenance Mode)</span>
                    </div>
                    <div className="text-ink-3 text-[11px]">চালু থাকলে সাধারণ সদস্যরা সাময়িক রক্ষণাবেক্ষণ বার্তা দেখবেন</div>
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
                কন্টাক্ট ক্রেডিট খরচ (টাকা)
              </h3>
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  প্রতি যোগাযোগ তথ্যের অনুমোদনে ক্রেডিট মূল্য (BDT):
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
