import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  Shield,
  Trash2,
  AlertCircle,
  Eye,
  EyeOff,
  Megaphone,
  FileEdit,
  Settings,
  UserPlus,
  Search,
  Copy,
  Check,
  UserCheck,
  Globe,
  Layers,
  X,
  Code2,
} from 'lucide-react';
import { adminApi, AuditLogItem } from '../../../api/admin.api';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useLanguage } from '../../../i18n/LanguageContext';

export const AdminAuditLogsTab: React.FC = () => {
  const { isBengali, formatNumber } = useLanguage();
  const [actionFilter, setActionFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [activeJsonModal, setActiveJsonModal] = useState<AuditLogItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', actionFilter, page],
    queryFn: () =>
      adminApi.getAuditLogs({
        action: actionFilter || undefined,
        page,
        limit: 20,
      }),
  });

  const rawAuditLogs = logsData?.data?.auditLogs || [];
  const meta = logsData?.meta;

  // Local search filter
  const auditLogs = rawAuditLogs.filter((log: AuditLogItem) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const actorName = typeof log.actor === 'object' ? log.actor?.name?.toLowerCase() : '';
    const actorEmail = typeof log.actor === 'object' ? log.actor?.email?.toLowerCase() : '';
    const action = log.action?.toLowerCase() || '';
    const targetType = log.targetType?.toLowerCase() || '';
    const targetId = log.targetId?.toLowerCase() || '';
    const ip = log.ipAddress?.toLowerCase() || '';
    const detailsStr = JSON.stringify(log.details || {}).toLowerCase();

    return (
      actorName?.includes(term) ||
      actorEmail?.includes(term) ||
      action.includes(term) ||
      targetType.includes(term) ||
      targetId.includes(term) ||
      ip.includes(term) ||
      detailsStr.includes(term)
    );
  });

  const handleCopyJson = (jsonObj: any, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(jsonObj, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActionBadge = (action: string) => {
    const act = action.toLowerCase();

    if (act.includes('delete') || act.includes('remove')) {
      return {
        label: isBengali ? 'মুছে ফেলা (Delete)' : 'Deleted',
        bg: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25',
        icon: Trash2,
      };
    }
    if (act.includes('status')) {
      return {
        label: isBengali ? 'স্ট্যাটাস পরিবর্তন' : 'Status Changed',
        bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
        icon: AlertCircle,
      };
    }
    if (act.includes('role')) {
      return {
        label: isBengali ? 'ভূমিকা পরিবর্তন' : 'Role Changed',
        bg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25',
        icon: Shield,
      };
    }
    if (act.includes('create') || act.includes('add')) {
      return {
        label: isBengali ? 'তৈরি / যুক্ত' : 'Created',
        bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
        icon: UserPlus,
      };
    }
    if (act.includes('hide')) {
      return {
        label: isBengali ? 'লুকানো (Hide)' : 'Hidden',
        bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
        icon: EyeOff,
      };
    }
    if (act.includes('restore') || act.includes('public')) {
      return {
        label: isBengali ? 'উন্মুক্ত (Restore)' : 'Restored',
        bg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
        icon: Eye,
      };
    }
    if (act.includes('announcement')) {
      return {
        label: isBengali ? 'ঘোষণা' : 'Announcement',
        bg: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/25',
        icon: Megaphone,
      };
    }
    if (act.includes('content')) {
      return {
        label: isBengali ? 'কনটেন্ট' : 'CMS Content',
        bg: 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/25',
        icon: FileEdit,
      };
    }
    if (act.includes('settings')) {
      return {
        label: isBengali ? 'সেটিংস' : 'Settings',
        bg: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/25',
        icon: Settings,
      };
    }

    return {
      label: action,
      bg: 'bg-brand-soft text-brand-ink border-brand/25',
      icon: History,
    };
  };

  const renderDetailsSummary = (details?: Record<string, any>) => {
    if (!details || Object.keys(details).length === 0) {
      return <span className="text-ink-3 italic text-[11px]">{isBengali ? 'কোনো বিবরণ নেই' : 'No details'}</span>;
    }

    const reason = details.reason;
    const name = details.name || details.displayName || details.userName;
    const role = details.role;
    const status = details.status || details.accountStatus;

    return (
      <div className="space-y-1.5 text-xs">
        {reason && (
          <div className="text-[11px] bg-elev px-2 py-1 rounded-lg border border-line text-ink-2 flex items-start gap-1.5">
            <span className="font-bold text-ink shrink-0">{isBengali ? 'কারণ:' : 'Reason:'}</span>
            <span className="italic truncate">&ldquo;{reason}&rdquo;</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5">
          {name && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-elev border border-line text-[10px] font-semibold text-ink-2">
              <span className="text-ink-3">{isBengali ? 'নাম:' : 'Target:'}</span>
              <strong className="text-ink font-bold">{name}</strong>
            </span>
          )}

          {role && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-600 dark:text-purple-400">
              <span className="opacity-75">{isBengali ? 'রোল:' : 'Role:'}</span>
              <span className="uppercase">{role}</span>
            </span>
          )}

          {status && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400">
              <span className="opacity-75">{isBengali ? 'স্ট্যাটাস:' : 'Status:'}</span>
              <span className="uppercase">{status}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="mb-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
              <History className="w-5 h-5 text-brand" />
              <span>{isBengali ? 'প্রশাসনিক অডিট ট্রেইল (Administrative Audit Trail)' : 'Administrative Audit Trail'}</span>
            </h2>
            <p className="text-xs text-ink-3">
              {isBengali
                ? 'প্ল্যাটফর্মের সকল স্পর্শকাতর প্রশাসনিক কার্যক্রম, ডিলিট, পরিবর্তন ও সিদ্ধান্তের অপরিবর্তনীয় রেকর্ড'
                : 'Immutable audit trail of administrative activities, deletions, permissions, and security events'}
            </p>
          </div>

          {meta?.total !== undefined && (
            <span className="text-xs font-bold text-ink-2 bg-elev px-3 py-1 rounded-full border border-line whitespace-nowrap">
              {isBengali ? `মোট রেকর্ড: ${formatNumber(meta.total)} টি` : `Total Logs: ${formatNumber(meta.total)}`}
            </span>
          )}
        </div>

        {/* Filter Controls: Search + Action Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isBengali ? 'কর্মকর্তা, অ্যাকশন বা টার্গেট দিয়ে সার্চ করুন...' : 'Search by actor, action, target...'}
              className="mb-input text-xs pl-9 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="mb-input text-xs w-full cursor-pointer font-medium"
            >
              <option value="">{isBengali ? 'সকল অ্যাকশন (All Actions)' : 'All Actions'}</option>
              <option value="user.delete">{isBengali ? 'ইউজার মুছে ফেলা (user.delete)' : 'User Deleted (user.delete)'}</option>
              <option value="profile.delete">{isBengali ? 'বায়োডাটা মুছে ফেলা (profile.delete)' : 'Biodata Deleted (profile.delete)'}</option>
              <option value="admin.delete">{isBengali ? 'অ্যাডমিন মুছে ফেলা (admin.delete)' : 'Admin Deleted (admin.delete)'}</option>
              <option value="user.status_change">{isBengali ? 'ইউজার স্ট্যাটাস পরিবর্তন' : 'User Status Change'}</option>
              <option value="user.role_change">{isBengali ? 'ইউজার রোল পরিবর্তন' : 'User Role Change'}</option>
              <option value="admin.create">{isBengali ? 'নতুন অ্যাডমিন তৈরি' : 'Admin Creation'}</option>
              <option value="profile.hide">{isBengali ? 'বায়োডাটা লুকানো (Hide)' : 'Biodata Hidden'}</option>
              <option value="profile.restore">{isBengali ? 'বায়োডাটা উন্মুক্ত (Restore)' : 'Biodata Restored'}</option>
              <option value="announcement.create">{isBengali ? 'ঘোষণা তৈরি' : 'Announcement Created'}</option>
              <option value="announcement.update">{isBengali ? 'ঘোষণা আপডেট' : 'Announcement Updated'}</option>
              <option value="announcement.delete">{isBengali ? 'ঘোষণা মুছে ফেলা' : 'Announcement Deleted'}</option>
              <option value="content.update">{isBengali ? 'কনটেন্ট আপডেট (CMS)' : 'Content Updated'}</option>
              <option value="settings.update">{isBengali ? 'সেটিংস পরিবর্তন' : 'Settings Updated'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content View */}
      <div className="mb-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label={isBengali ? 'অডিট লগ লোড হচ্ছে...' : 'Loading audit logs...'} />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-16 text-center text-ink-3 space-y-2">
            <History className="w-10 h-10 mx-auto text-ink-3/40" />
            <p className="text-sm font-bold">{isBengali ? 'কোনো অডিট লগ রেকর্ড পাওয়া যায়নি' : 'No audit log records found'}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (md+) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-elev/80 text-ink-3 font-bold border-b border-line uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">{isBengali ? 'কর্মকর্তা (Actor)' : 'Actor'}</th>
                    <th className="py-3 px-4">{isBengali ? 'অ্যাকশন (Action)' : 'Action'}</th>
                    <th className="py-3 px-4">{isBengali ? 'টার্গেট ও বিবরণ' : 'Target & Summary'}</th>
                    <th className="py-3 px-4">{isBengali ? 'আইপি' : 'IP Address'}</th>
                    <th className="py-3 px-4">{isBengali ? 'তারিখ ও সময়' : 'Timestamp'}</th>
                    <th className="py-3 px-4 text-right">{isBengali ? 'ডিটেইল' : 'Inspect'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {auditLogs.map((log: AuditLogItem) => {
                    const actor = log.actor;
                    const actorName = typeof actor === 'object' ? actor?.name : (isBengali ? 'সিস্টেম' : 'System');
                    const actorEmail = typeof actor === 'object' ? actor?.email : '';
                    const actorRole = typeof actor === 'object' ? actor?.role : '';
                    const actorInitial = actorName?.trim()?.charAt(0)?.toUpperCase() || 'A';
                    const badge = getActionBadge(log.action);
                    const ActionIcon = badge.icon;

                    return (
                      <tr key={log._id} className="hover:bg-elev/40 transition-colors">
                        {/* Actor */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-linear-to-tr from-brand to-pink-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                              {actorInitial}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-ink truncate">{actorName}</div>
                              {actorEmail && <div className="text-[10px] font-mono text-ink-3 truncate">{actorEmail}</div>}
                              {actorRole && (
                                <span className="inline-block mt-0.5 text-[9px] uppercase font-black text-brand bg-brand-soft px-1.5 py-0.2 rounded">
                                  {actorRole}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border shadow-2xs whitespace-nowrap ${badge.bg}`}>
                              <ActionIcon className="w-3.5 h-3.5 shrink-0" />
                              <span>{badge.label}</span>
                            </span>
                            <div className="font-mono text-[10px] text-ink-3">
                              {log.action}
                            </div>
                          </div>
                        </td>

                        {/* Target & Details */}
                        <td className="py-3 px-4 max-w-sm">
                          {log.targetType && (
                            <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-ink">
                              <Layers className="w-3.5 h-3.5 text-brand shrink-0" />
                              <span>{log.targetType}</span>
                              {log.targetId && (
                                <span className="font-mono text-[10px] text-ink-3 bg-elev px-1.5 py-0.2 rounded border border-line truncate max-w-[130px]">
                                  {log.targetId}
                                </span>
                              )}
                            </div>
                          )}
                          {renderDetailsSummary(log.details)}
                        </td>

                        {/* IP Address */}
                        <td className="py-3 px-4 font-mono text-[11px] text-ink-3">
                          <span className="inline-flex items-center gap-1 bg-elev px-2 py-0.5 rounded-md border border-line">
                            <Globe className="w-3 h-3 text-ink-3 shrink-0" />
                            <span>{log.ipAddress || '127.0.0.1'}</span>
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="py-3 px-4 text-ink-3 text-[11px] whitespace-nowrap">
                          <div>
                            {new Date(log.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', {
                              dateStyle: 'medium',
                            })}
                          </div>
                          <div className="font-mono text-[10px]">
                            {new Date(log.createdAt).toLocaleTimeString(isBengali ? 'bn-BD' : 'en-US', {
                              timeStyle: 'short',
                            })}
                          </div>
                        </td>

                        {/* Inspect Raw Button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setActiveJsonModal(log)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg border border-line bg-elev hover:bg-brand-soft hover:text-brand-ink text-ink-2 transition-colors cursor-pointer"
                            title={isBengali ? 'পূর্ণাঙ্গ পেলোড পর্যবেক্ষণ' : 'Inspect JSON Payload'}
                          >
                            <Code2 className="w-3.5 h-3.5" />
                            <span>{isBengali ? 'JSON' : 'Inspect'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (< md) */}
            <div className="block md:hidden divide-y divide-line">
              {auditLogs.map((log: AuditLogItem) => {
                const actor = log.actor;
                const actorName = typeof actor === 'object' ? actor?.name : (isBengali ? 'সিস্টেম' : 'System');
                const actorRole = typeof actor === 'object' ? actor?.role : '';
                const badge = getActionBadge(log.action);
                const ActionIcon = badge.icon;

                return (
                  <div key={log._id} className="p-4 space-y-3 hover:bg-elev/30 transition-colors">
                    {/* Top Row: Actor & Timestamp */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-full bg-linear-to-tr from-brand to-pink-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {actorName?.charAt(0)?.toUpperCase() || 'A'}
                        </span>
                        <div>
                          <div className="font-bold text-xs text-ink">{actorName}</div>
                          {actorRole && (
                            <span className="text-[9px] uppercase font-black text-brand bg-brand-soft px-1.5 py-0.2 rounded">
                              {actorRole}
                            </span>
                          )}
                        </div>
                      </div>

                      <span className="text-[10px] text-ink-3 font-mono">
                        {new Date(log.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    {/* Middle Row: Action Badge + Target */}
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${badge.bg}`}>
                        <ActionIcon className="w-3 h-3 shrink-0" />
                        <span>{badge.label}</span>
                      </span>

                      {log.targetType && (
                        <span className="text-[10px] font-mono text-ink-3 bg-elev px-2 py-0.5 rounded border border-line">
                          {log.targetType}
                        </span>
                      )}
                    </div>

                    {/* Details Summary */}
                    {renderDetailsSummary(log.details)}

                    {/* Bottom Row: IP + Inspect Modal */}
                    <div className="flex items-center justify-between pt-1 border-t border-line/60 text-[10px] text-ink-3">
                      <span className="font-mono">IP: {log.ipAddress || '127.0.0.1'}</span>
                      <button
                        type="button"
                        onClick={() => setActiveJsonModal(log)}
                        className="font-bold text-brand hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>{isBengali ? 'পেলোড দেখুন' : 'View Payload'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-line text-xs">
            <span className="text-ink-3">
              {isBengali
                ? `পৃষ্ঠা ${formatNumber(meta.page)} / ${formatNumber(meta.totalPages)} (মোট ${formatNumber(meta.total)} টি)`
                : `Page ${formatNumber(meta.page)} of ${formatNumber(meta.totalPages)} (Total: ${formatNumber(meta.total)})`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-line bg-elev disabled:opacity-40 cursor-pointer font-bold transition-colors"
              >
                {isBengali ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-line bg-elev disabled:opacity-40 cursor-pointer font-bold transition-colors"
              >
                {isBengali ? 'পরবর্তী' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Raw Payload Inspection Modal */}
      {activeJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="mb-card max-w-xl w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div className="flex items-center gap-2 text-sm font-black text-ink">
                <Code2 className="w-4 h-4 text-brand" />
                <span>{isBengali ? 'অডিট লগ পেলোড ও বিবরণ' : 'Audit Log Full Payload'}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveJsonModal(null)}
                className="p-1 rounded-lg hover:bg-elev text-ink-3 hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Meta summary */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-elev p-3 rounded-xl border border-line">
              <div>
                <span className="text-ink-3 text-[10px] uppercase font-bold block">{isBengali ? 'অ্যাকশন' : 'Action'}</span>
                <span className="font-bold text-ink">{activeJsonModal.action}</span>
              </div>
              <div>
                <span className="text-ink-3 text-[10px] uppercase font-bold block">{isBengali ? 'টার্গেট টাইপ' : 'Target Type'}</span>
                <span className="font-bold text-ink">{activeJsonModal.targetType || '—'}</span>
              </div>
              <div>
                <span className="text-ink-3 text-[10px] uppercase font-bold block">{isBengali ? 'আইপি ঠিকানা' : 'IP Address'}</span>
                <span className="font-mono text-ink-2">{activeJsonModal.ipAddress || '—'}</span>
              </div>
              <div>
                <span className="text-ink-3 text-[10px] uppercase font-bold block">{isBengali ? 'সময়' : 'Timestamp'}</span>
                <span className="font-mono text-ink-2">{new Date(activeJsonModal.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* JSON Code View */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-ink-3 text-[11px] uppercase tracking-wider">{isBengali ? 'বিস্তারিত ডাটা (Details):' : 'Raw Details Object:'}</span>
                <button
                  type="button"
                  onClick={() => handleCopyJson(activeJsonModal, activeJsonModal._id)}
                  className="flex items-center gap-1 text-[11px] font-bold text-brand hover:underline cursor-pointer"
                >
                  {copiedId === activeJsonModal._id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">{isBengali ? 'কপি হয়েছে!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{isBengali ? 'কপি করুন' : 'Copy JSON'}</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="text-xs font-mono bg-elev p-3 rounded-xl border border-line max-h-64 overflow-y-auto text-ink leading-relaxed">
                {JSON.stringify(activeJsonModal.details || {}, null, 2)}
              </pre>
            </div>

            <div className="pt-2 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setActiveJsonModal(null)}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-elev hover:bg-card border border-line text-ink cursor-pointer transition-colors"
              >
                {isBengali ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogsTab;
