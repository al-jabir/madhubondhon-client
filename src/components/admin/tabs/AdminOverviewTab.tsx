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
import { SystemHealthDiagnosticsWidget } from '../SystemHealthDiagnosticsWidget';
import { useLanguage } from '../../../i18n/LanguageContext';

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
  const { isBengali, formatNumber } = useLanguage();
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
            <span className="text-xs font-bold text-ink-3">
              {isBengali ? 'মোট নিবন্ধিত ইউজার' : 'Total Registered Users'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink">
            {formatNumber(stats?.users?.total || 0)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>
              {isBengali
                ? `সক্রিয়: ${formatNumber(stats?.users?.active || 0)} জন`
                : `Active: ${formatNumber(stats?.users?.active || 0)} users`}
            </span>
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
            <span className="text-xs font-bold text-ink-3">
              {isBengali ? 'বায়োডাটা অনুমোদন মুলতবি' : 'Pending Biodata Reviews'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-brand-soft text-brand-ink flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-brand">
            {formatNumber(stats?.biodata?.pendingReview || 0)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-brand-ink font-bold">
            <span>
              {isBengali ? 'অনুমোদিত:' : 'Approved:'} {formatNumber(stats?.biodata?.approved || 0)}
            </span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Pending Complaints */}
        <div
          onClick={() => onNavigateTab('reports')}
          className="mb-card p-4 sm:p-5 space-y-2 cursor-pointer hover:border-amber-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-3">
              {isBengali ? 'মুলতবি অভিযোগ ও রিপোর্ট' : 'Pending Complaints & Reports'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink">
            {formatNumber(stats?.reports?.pending || 0)}
          </div>
          <div className="text-[11px] text-ink-3 font-semibold">
            {isBengali ? 'নিষ্পত্তি সম্পন্ন:' : 'Resolved:'}{' '}
            {formatNumber(stats?.reports?.resolved || 0)}
          </div>
        </div>

        {/* Interests Sent */}
        <div
          onClick={() => onNavigateTab('interests')}
          className="mb-card p-4 sm:p-5 space-y-2 cursor-pointer hover:border-pink-500/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-3">
              {isBengali ? 'মোট বৈবাহিক প্রস্তাব' : 'Total Interest Requests'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-ink">
            {formatNumber(stats?.interests?.total || 0)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            {isBengali ? 'গৃহীত প্রস্তাব:' : 'Accepted Requests:'}{' '}
            {formatNumber(stats?.interests?.accepted || 0)}
          </div>
        </div>
      </div>

      {/* Secondary Metrics strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-elev p-3 rounded-2xl border border-line text-xs font-semibold text-ink-2">
        <div className="flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-brand" />
          <span>
            {isBengali ? 'নতুন (৭ দিন):' : 'New (7d):'}{' '}
            <strong>{formatNumber(stats?.users?.newLast7Days || 0)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-purple-500" />
          <span>
            {isBengali ? 'নতুন (৩০ দিন):' : 'New (30d):'}{' '}
            <strong>{formatNumber(stats?.users?.newLast30Days || 0)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-500" />
          <span>
            {isBengali ? 'মোট বায়োডাটা:' : 'Total Biodata:'}{' '}
            <strong>{formatNumber(stats?.biodata?.total || 0)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <FileX className="w-4 h-4 text-red-500" />
          <span>
            {isBengali ? 'স্থগিত ইউজার:' : 'Suspended Users:'}{' '}
            <strong>{formatNumber(stats?.users?.suspended || 0)}</strong>
          </span>
        </div>
      </div>

      {/* Public marriage statistics settings */}
      {isSuperAdminOrAdmin && <MarriageStatisticsSettings />}

      {/* Live System Diagnostics */}
      {isSuperAdminOrAdmin && <SystemHealthDiagnosticsWidget />}

      {/* Charts & Analytics */}
      <AdminAnalytics />

      {/* Recent Administrative Activity Feed */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="mb-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 text-sm font-black text-ink">
              <History className="w-4 h-4 text-brand" />
              <span>
                {isBengali
                  ? 'সাম্প্রতিক প্রশাসনিক কার্যক্রম (Audit Trail)'
                  : 'Recent Administrative Activity (Audit Trail)'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('audit')}
              className="text-xs font-bold text-brand hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{isBengali ? 'সম্পূর্ণ লগ দেখুন' : 'View Full Logs'}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-line">
            {stats.recentActivity.map((log: AuditLogItem) => {
              const actorName =
                typeof log.actor === 'object'
                  ? log.actor?.name
                  : isBengali
                  ? 'সিস্টেম অ্যাডমিন'
                  : 'System Admin';

              const act = (log.action || '').toLowerCase();
              let badgeColor = 'bg-brand-soft text-brand-ink border-brand/25';
              let badgeLabel = log.action;

              if (act.includes('delete') || act.includes('remove')) {
                badgeColor = 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25';
                badgeLabel = isBengali ? 'মুছে ফেলা' : 'Deleted';
              } else if (act.includes('status')) {
                badgeColor = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25';
                badgeLabel = isBengali ? 'স্ট্যাটাস' : 'Status';
              } else if (act.includes('role')) {
                badgeColor = 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25';
                badgeLabel = isBengali ? 'ভূমিকা' : 'Role';
              } else if (act.includes('create') || act.includes('add')) {
                badgeColor = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
                badgeLabel = isBengali ? 'যুক্ত' : 'Created';
              } else if (act.includes('hide')) {
                badgeColor = 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25';
                badgeLabel = isBengali ? 'লুকানো' : 'Hidden';
              } else if (act.includes('announcement')) {
                badgeColor = 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25';
                badgeLabel = isBengali ? 'ঘোষণা' : 'Announcement';
              }

              const details = (log.details || {}) as Record<string, any>;
              const reason = details.reason;
              const targetName =
                details.name || details.userName || details.displayName || details.targetName || details.title;

              return (
                <div key={log._id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-ink">{actorName}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeColor}`}>
                        {badgeLabel}
                      </span>
                      {log.targetType && (
                        <span className="text-[11px] font-medium text-ink-3">
                          • {log.targetType}
                        </span>
                      )}
                    </div>
                    {(targetName || reason) && (
                      <div className="flex items-center gap-1.5 text-[11px] text-ink-3 flex-wrap">
                        {targetName && (
                          <span className="font-semibold text-ink-2 truncate max-w-[200px]">
                            {targetName}
                          </span>
                        )}
                        {reason && (
                          <span className="italic truncate max-w-xs text-ink-3">
                            💬 &ldquo;{reason}&rdquo;
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] text-ink-3 sm:text-right shrink-0">
                    {new Date(log.createdAt).toLocaleString(isBengali ? 'bn-BD' : 'en-US', {
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
