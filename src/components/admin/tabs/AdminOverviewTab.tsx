import React from 'react';
import {
  Users,
  UserCheck,
  UserPlus,
  FileText,
  FileCheck2,
  FileX,
  AlertTriangle,
  Heart,
  History,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { AdminStats, AuditLogItem } from '../../../api/admin.api';
import AdminAnalytics from '../AdminAnalytics';
import MarriageStatisticsSettings from '../../profile/MarriageStatisticsSettings';

interface AdminOverviewTabProps {
  stats?: AdminStats;
  onNavigateTab: (tab: any) => void;
  isSuperAdminOrAdmin: boolean;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  onNavigateTab,
  isSuperAdminOrAdmin,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Welcome & KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Users */}
        <div
          onClick={() => onNavigateTab('users')}
          className="mb-card p-4 sm:p-5 space-y-2 cursor-pointer hover:border-brand/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-3">মোট নিবন্ধিত ইউজার</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink">
            {stats?.users?.total?.toLocaleString('bn-BD') || '০'}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>সক্রিয়: {stats?.users?.active?.toLocaleString('bn-BD') || '০'} জন</span>
          </div>
        </div>

        {/* Pending Biodata Reviews */}
        <div
          onClick={() => onNavigateTab('biodata')}
          className="mb-card p-4 sm:p-5 space-y-2 cursor-pointer hover:border-brand/40 transition-all group relative overflow-hidden"
        >
          {stats?.biodata?.pendingReview ? (
            <div className="absolute top-0 right-0 w-2 h-full bg-brand" />
          ) : null}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-3">বায়োডাটা অনুমোদন মুলতবি</span>
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand-ink flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand">
            {stats?.biodata?.pendingReview?.toLocaleString('bn-BD') || '০'}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-brand-ink font-bold">
            <span>অনুমোদিত: {stats?.biodata?.approved?.toLocaleString('bn-BD') || '০'}</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Pending Complaints */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="mb-card p-4 sm:p-5 space-y-2 cursor-pointer hover:border-amber-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-3">মুলতবি অভিযোগ ও রিপোর্ট</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink">
            {stats?.reports?.pending?.toLocaleString('bn-BD') || '০'}
          </div>
          <div className="text-[11px] text-ink-3 font-semibold">
            নিষ্পত্তি সম্পন্ন: {stats?.reports?.resolved?.toLocaleString('bn-BD') || '০'}
          </div>
        </div>

        {/* Interests Sent */}
        <div
          onClick={() => onNavigateTab('interests')}
          className="mb-card p-4 sm:p-5 space-y-2 cursor-pointer hover:border-pink-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-3">মোট বৈবাহিক প্রস্তাব</span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink">
            {stats?.interests?.total?.toLocaleString('bn-BD') || '০'}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            গৃহীত প্রস্তাব: {stats?.interests?.accepted?.toLocaleString('bn-BD') || '০'}
          </div>
        </div>
      </div>

      {/* Secondary Metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-elev p-3 rounded-2xl border border-line text-xs font-semibold text-ink-2">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-brand" />
          <span>নতুন (৭ দিন): <strong>{stats?.users?.newLast7Days || 0}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          <span>নতুন (৩০ দিন): <strong>{stats?.users?.newLast30Days || 0}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-500" />
          <span>মোট বায়োডাটা: <strong>{stats?.biodata?.total || 0}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <FileX className="w-4 h-4 text-red-500" />
          <span>স্থগিত ইউজার: <strong>{stats?.users?.suspended || 0}</strong></span>
        </div>
      </div>

      {/* Public marriage statistics settings */}
      {isSuperAdminOrAdmin && <MarriageStatisticsSettings />}

      {/* Charts & Analytics */}
      <AdminAnalytics />

      {/* Recent Administrative Activity Feed */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="mb-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 text-sm font-black text-ink">
              <History className="w-4 h-4 text-brand" />
              <span>সাম্প্রতিক প্রশাসনিক কার্যক্রম (Audit Trail)</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-brand hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>সম্পূর্ণ লগ দেখুন</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-line">
            {stats.recentActivity.map((log: AuditLogItem) => {
              const actorName = typeof log.actor === 'object' ? log.actor?.name : 'সিস্টেম অ্যাডমিন';
              return (
                <div key={log._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-bold text-ink">
                      {actorName}{' '}
                      <span className="font-mono text-brand font-normal">[{log.action}]</span>
                    </div>
                    {log.details && (
                      <div className="text-ink-3 text-[11px] truncate max-w-md">
                        {JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-3 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('bn-BD', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverviewTab;
