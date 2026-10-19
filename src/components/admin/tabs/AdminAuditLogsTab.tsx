import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  History,
  Shield,
  Search,
  Filter,
  Clock,
  Terminal,
} from 'lucide-react';
import { adminApi, AuditLogItem } from '../../../api/admin.api';
import LoadingSpinner from '../../common/LoadingSpinner';

export const AdminAuditLogsTab: React.FC = () => {
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', actionFilter, page],
    queryFn: () =>
      adminApi.getAuditLogs({
        action: actionFilter || undefined,
        page,
        limit: 20,
      }),
  });

  const auditLogs = logsData?.data?.auditLogs || [];
  const meta = logsData?.meta;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
            <History className="w-5 h-5 text-brand" />
            <span>প্রশাসনিক অডিট লগ (Administrative Audit Trail)</span>
          </h2>
          <p className="text-xs text-ink-3">
            প্ল্যাটফর্মের সকল স্পর্শকাতর প্রশাসনিক কার্যক্রম, পরিবর্তন ও সিদ্ধান্তের অপরিবর্তনীয় রেকর্ড
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="mb-input text-xs"
          >
            <option value="">সকল কার্যক্রম (All Actions)</option>
            <option value="user.status_change">ইউজার স্ট্যাটাস পরিবর্তন</option>
            <option value="user.role_change">ইউজার রোল পরিবর্তন</option>
            <option value="admin.create">অ্যাডমিন তৈরি</option>
            <option value="announcement.create">ঘোষণা প্রকাশ</option>
            <option value="announcement.update">ঘোষণা আপডেট</option>
            <option value="content.update">কনটেন্ট আপডেট</option>
            <option value="settings.update">সেটিংস পরিবর্তন</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="mb-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label="অডিট লগ লোড হচ্ছে..." />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="py-16 text-center text-ink-3 space-y-2">
            <History className="w-10 h-10 mx-auto text-ink-3/40" />
            <p className="text-sm font-bold">কোনো অডিট লগ রেকর্ড নেই</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-elev/80 text-ink-3 font-bold border-b border-line uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">কর্মকর্তা (Actor)</th>
                  <th className="py-3 px-4">অ্যাকশন</th>
                  <th className="py-3 px-4">টার্গেট ও বিবরণ</th>
                  <th className="py-3 px-4">আইপি ঠিকানা</th>
                  <th className="py-3 px-4">তারিখ ও সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {auditLogs.map((log: AuditLogItem) => {
                  const actor = log.actor;
                  const actorName = typeof actor === 'object' ? actor?.name : 'সিস্টেম';
                  const actorEmail = typeof actor === 'object' ? actor?.email : '';
                  const actorRole = typeof actor === 'object' ? actor?.role : '';

                  return (
                    <tr key={log._id} className="hover:bg-elev/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-ink">{actorName}</div>
                        {actorEmail && <div className="text-[11px] font-mono text-ink-3">{actorEmail}</div>}
                        {actorRole && (
                          <span className="text-[9px] uppercase font-bold text-brand bg-brand-soft px-1 rounded-sm">
                            {actorRole}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] font-bold text-brand bg-elev px-2 py-0.5 rounded-md border border-line">
                          {log.action}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        {log.targetType && (
                          <div className="text-[11px] font-semibold text-ink-2">
                            {log.targetType}: <span className="font-mono text-ink-3">{log.targetId}</span>
                          </div>
                        )}
                        {log.details && (
                          <pre className="text-[10px] text-ink-3 font-mono bg-elev p-1.5 rounded-lg border border-line overflow-x-auto mt-1 max-w-sm">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}
                      </td>

                      <td className="py-3 px-4 text-ink-3 font-mono text-[11px]">
                        {log.ipAddress || '—'}
                      </td>

                      <td className="py-3 px-4 text-ink-3 text-[11px] whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('bn-BD', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-line text-xs">
            <span className="text-ink-3">
              পৃষ্ঠা {meta.page} / {meta.totalPages} (মোট {meta.total} টি)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-line bg-elev disabled:opacity-40 cursor-pointer font-bold"
              >
                পূর্ববর্তী
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-line bg-elev disabled:opacity-40 cursor-pointer font-bold"
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsTab;
