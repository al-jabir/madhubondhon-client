import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  Download,
  Users,
  FileSpreadsheet,
  CreditCard,
  MapPin,
  TrendingUp,
  Sparkles,
  FileCheck2,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { useLanguage } from '../../../i18n/LanguageContext';
import { UpazilaAnalyticsItem } from '../../../types';

export const AdminAnalyticsTab: React.FC = () => {
  const { isBengali, formatNumber } = useLanguage();
  const [downloadingType, setDownloadingType] = useState<string | null>(null);

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-upazila-analytics'],
    queryFn: () => adminApi.getUpazilaAnalytics(),
  });

  const upazilas: UpazilaAnalyticsItem[] = analyticsData?.data?.upazilas || [];
  const summary = analyticsData?.data?.summary || {
    totalProfiles: 0,
    totalGrooms: 0,
    totalBrides: 0,
    totalApproved: 0,
  };

  const handleExport = async (type: 'users' | 'biodata' | 'transactions') => {
    try {
      setDownloadingType(type);
      await adminApi.exportDataCsv(type);
      toast.success(
        isBengali
          ? `${type === 'users' ? 'ইউজার' : type === 'biodata' ? 'বায়োডাটা' : 'লেনদেন'} CSV ডাউনলোড সম্পন্ন!`
          : `${type} CSV downloaded successfully!`
      );
    } catch {
      toast.error(isBengali ? 'ডাউনলোড করতে সমস্যা হয়েছে।' : 'Failed to export CSV.');
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand" />
            <span>{isBengali ? 'টাঙ্গাইল জেলা অ্যানালিটিক্স ও ডাটা এক্সপোর্ট' : 'District Analytics & CSV Export'}</span>
          </h2>
          <p className="text-xs text-ink-3 mt-1">
            {isBengali
              ? 'টাঙ্গাইলের ১২টি উপজেলার পাত্র-পাত্রীর বিস্তার এবং ১-ক্লিকে প্রয়োজনীয় ডাটা এক্সপোর্ট করুন।'
              : 'Detailed demographic distribution across Tangail and one-click reporting.'}
          </p>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="mb-card rounded-2xl p-4 border border-line space-y-1">
          <span className="text-[11px] font-bold text-ink-3">{isBengali ? 'মোট বায়োডাটা' : 'Total Profiles'}</span>
          <div className="text-2xl font-black text-ink">
            {isBengali ? formatNumber(summary.totalProfiles) : summary.totalProfiles}
          </div>
        </div>
        <div className="mb-card rounded-2xl p-4 border border-line space-y-1">
          <span className="text-[11px] font-bold text-ink-3">{isBengali ? 'মোট পাত্র (Male)' : 'Total Grooms'}</span>
          <div className="text-2xl font-black text-brand">
            {isBengali ? formatNumber(summary.totalGrooms) : summary.totalGrooms}
          </div>
        </div>
        <div className="mb-card rounded-2xl p-4 border border-line space-y-1">
          <span className="text-[11px] font-bold text-ink-3">{isBengali ? 'মোট পাত্রী (Female)' : 'Total Brides'}</span>
          <div className="text-2xl font-black text-rose-500">
            {isBengali ? formatNumber(summary.totalBrides) : summary.totalBrides}
          </div>
        </div>
        <div className="mb-card rounded-2xl p-4 border border-line space-y-1">
          <span className="text-[11px] font-bold text-ink-3">{isBengali ? 'প্রকাশিত বায়োডাটা' : 'Approved Live'}</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {isBengali ? formatNumber(summary.totalApproved) : summary.totalApproved}
          </div>
        </div>
      </div>

      {/* CSV Export Quick Action Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-black text-ink flex items-center gap-2">
          <Download className="w-4 h-4 text-brand" />
          <span>{isBengali ? '১-ক্লিক এক্সেল / CSV ডাটা ডাউনলোড' : '1-Click Data Exports'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Users */}
          <div className="mb-card rounded-2xl p-5 border border-line space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-bold text-ink">{isBengali ? 'ইউজার তালিকা (Users)' : 'Users List'}</h4>
              <p className="text-xs text-ink-3 leading-relaxed">
                {isBengali
                  ? 'সকল নিবন্ধিত সদস্যের নাম, ইমেইল, মোবাইল নম্বর, ক্রেডিট ও রোলসহ সম্পূর্ণ তালিকা।'
                  : 'All registered members with contact details, verification status and credits.'}
              </p>
            </div>
            <button
              disabled={downloadingType === 'users'}
              onClick={() => handleExport('users')}
              className="mb-btn-primary !text-xs py-2.5 px-4 rounded-xl cursor-pointer w-full inline-flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloadingType === 'users'
                  ? isBengali
                    ? 'তৈরি হচ্ছে...'
                    : 'Exporting...'
                  : isBengali
                  ? 'ইউজার CSV ডাউনলোড'
                  : 'Export Users CSV'}
              </span>
            </button>
          </div>

          {/* 2. Biodata */}
          <div className="mb-card rounded-2xl p-5 border border-line space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <FileCheck2 className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-bold text-ink">{isBengali ? 'বায়োডাটা ডাটাবেজ (Biodata)' : 'Biodata Records'}</h4>
              <p className="text-xs text-ink-3 leading-relaxed">
                {isBengali
                  ? 'সকল বায়োডাটার আইডি, উপজেলা, শিক্ষা, পেশা, বৈবাহিক অবস্থা ও অনুমোদনের স্ট্যাটাস।'
                  : 'Full matrimonial profile records with Tangail upazila, career and status.'}
              </p>
            </div>
            <button
              disabled={downloadingType === 'biodata'}
              onClick={() => handleExport('biodata')}
              className="mb-btn-secondary !text-xs py-2.5 px-4 rounded-xl cursor-pointer w-full inline-flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloadingType === 'biodata'
                  ? isBengali
                    ? 'তৈরি হচ্ছে...'
                    : 'Exporting...'
                  : isBengali
                  ? 'বায়োডাটা CSV ডাউনলোড'
                  : 'Export Biodata CSV'}
              </span>
            </button>
          </div>

          {/* 3. Transactions */}
          <div className="mb-card rounded-2xl p-5 border border-line space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-gold-soft text-gold flex items-center justify-center">
                <CreditCard className="w-4.5 h-4.5" />
              </div>
              <h4 className="text-sm font-bold text-ink">{isBengali ? 'পেমেন্ট ও লেনদেন (Payments)' : 'Payment History'}</h4>
              <p className="text-xs text-ink-3 leading-relaxed">
                {isBengali
                  ? 'বিকাশ ও নগদ পেমেন্ট, TrxID, প্রেরক নম্বর, ক্রয়কৃত প্যাকেজ ও অডিট হিস্ট্রি।'
                  : 'Complete transaction ledger with bKash/Nagad TrxIDs and amounts.'}
              </p>
            </div>
            <button
              disabled={downloadingType === 'transactions'}
              onClick={() => handleExport('transactions')}
              className="mb-btn-secondary !text-xs py-2.5 px-4 rounded-xl cursor-pointer w-full inline-flex items-center justify-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>
                {downloadingType === 'transactions'
                  ? isBengali
                    ? 'তৈরি হচ্ছে...'
                    : 'Exporting...'
                  : isBengali
                  ? 'পেমেন্ট CSV ডাউনলোড'
                  : 'Export Payments CSV'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Tangail 12 Upazilas Grid Breakdown */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-ink flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand" />
          <span>{isBengali ? 'টাঙ্গাইল জেলার ১২টি উপজেলার বিস্তার' : 'Tangail Upazila Distribution'}</span>
        </h3>

        {isLoading ? (
          <div className="py-12 text-center text-ink-3">
            {isBengali ? 'উপজেলা ডাটা লোড হচ্ছে...' : 'Loading analytics...'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {upazilas.map((u) => (
              <div
                key={u.key}
                className="mb-card rounded-2xl p-4 border border-line hover:border-brand/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-ink">{u.nameBn}</h4>
                  <span className="text-xs font-black text-brand font-mono bg-brand-soft px-2 py-0.5 rounded-full">
                    {isBengali ? formatNumber(u.total) : u.total}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-line/60">
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] text-ink-3">{isBengali ? 'পাত্র' : 'Grooms'}</span>
                    <p className="font-bold text-ink">{isBengali ? formatNumber(u.male) : u.male}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] text-ink-3">{isBengali ? 'পাত্রী' : 'Brides'}</span>
                    <p className="font-bold text-rose-500">{isBengali ? formatNumber(u.female) : u.female}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] text-ink-3">{isBengali ? 'অনুমোদিত' : 'Approved'}</span>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                      {isBengali ? formatNumber(u.approved) : u.approved}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10.5px] text-ink-3">{isBengali ? 'অপেক্ষমান' : 'Pending'}</span>
                    <p className="font-bold text-amber-600 dark:text-amber-400">
                      {isBengali ? formatNumber(u.pending) : u.pending}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalyticsTab;
