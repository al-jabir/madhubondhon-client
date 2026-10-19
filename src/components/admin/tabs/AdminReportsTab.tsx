import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ShieldAlert,
  UserX,
  X,
  MessageSquare,
} from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi, ReportItem } from '../../../api/reports.api';
import { adminApi } from '../../../api/admin.api';
import { AccountStatus } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';

export const AdminReportsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [page, setPage] = useState(1);

  // Resolution modal
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'resolved' | 'dismissed'>('resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [actionOption, setActionOption] = useState<'none' | 'suspend'>('none');

  // Reports Query
  const { data: reportsData, isLoading } = useQuery({
    queryKey: ['admin-reports', statusFilter, page],
    queryFn: () =>
      reportsApi.listReports({
        status: statusFilter || undefined,
        page,
        limit: 15,
      }),
  });

  // Resolve Mutation
  const resolveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedReport) return;
      // 1. If suspend user is selected, execute suspension
      const reported = selectedReport.reportedUser;
      const reportedUserId = typeof reported === 'object' ? (reported as any)._id || (reported as any).id : reported;

      if (actionOption === 'suspend' && reportedUserId) {
        await adminApi.updateUserStatus(reportedUserId, {
          status: AccountStatus.SUSPENDED,
          reason: `অভিযোগ নিষ্পত্তির প্রেক্ষিতে স্থগিত: ${resolutionNote}`,
        });
      }

      // 2. Resolve the report
      return reportsApi.resolveReport(selectedReport._id, {
        status: resolutionStatus,
        resolutionNote: resolutionNote.trim() || 'প্রশাসনিক পর্যালোচনা সম্পন্ন',
      });
    },
    onSuccess: () => {
      toast.success('অভিযোগটির নিষ্পত্তি সফলভাবে সংরক্ষিত হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedReport(null);
      setResolutionNote('');
      setActionOption('none');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'নিষ্পত্তি সংরক্ষণ করা যায়নি।');
    },
  });

  const reportsList = reportsData?.data?.reports || [];
  const meta = reportsData?.meta;

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="mb-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span>অভিযোগ ও রিপোর্ট ব্যবস্থাপনা (Complaints & Moderation)</span>
            </h2>
            <p className="text-xs text-ink-3">
              সদস্যদের আপত্তিকর আচরণ, ভুয়া বায়োডাটা বা হয়রানির অভিযোগসমূহ দ্রুত তদন্ত ও সমাধান
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="mb-input text-xs"
            >
              <option value="">সকল অভিযোগ</option>
              <option value="pending">মুলতবি (Pending)</option>
              <option value="resolved">নিষ্পত্তিকৃত (Resolved)</option>
              <option value="dismissed">বাতিলকৃত (Dismissed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label="অভিযোগ লোড হচ্ছে..." />
          </div>
        ) : reportsList.length === 0 ? (
          <div className="mb-card py-16 text-center text-ink-3 space-y-2">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
            <p className="text-sm font-bold">এই মুহূর্তে কোনো মুলতবি অভিযোগ নেই</p>
            <p className="text-xs">প্ল্যাটফর্মের সকল অভিযোগ সফলভাবে নিষ্পত্তি করা হয়েছে।</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {reportsList.map((rep: any) => {
              const reporterName = typeof rep.reporter === 'object' ? rep.reporter?.name : 'অভিযোগকারী';
              const reportedUser = rep.reportedUser || rep.reported;
              const reportedName = typeof reportedUser === 'object' ? reportedUser?.name : 'অভিযুক্ত ব্যক্তি';
              const reportedEmail = typeof reportedUser === 'object' ? reportedUser?.email : '';

              return (
                <div
                  key={rep._id}
                  className="mb-card p-5 space-y-4 border-l-4 border-l-amber-500 hover:border-line transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        কারণ: {rep.reason}
                      </span>
                      <span className="text-xs font-bold text-ink">
                        স্ট্যাটাস: <span className="uppercase text-ink-2">{rep.status}</span>
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-3">
                      তারিখ: {new Date(rep.createdAt).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="text-ink-3 font-semibold">অভিযোগকারী:</span>
                      <div className="font-bold text-ink">{reporterName}</div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-ink-3 font-semibold">অভিযুক্ত ব্যক্তি:</span>
                      <div className="font-bold text-ink">{reportedName}</div>
                      {reportedEmail && <div className="text-ink-3 font-mono text-[11px]">{reportedEmail}</div>}
                    </div>
                  </div>

                  <div className="bg-elev p-3 rounded-xl border border-line text-xs space-y-1">
                    <span className="text-ink-3 font-bold block">অভিযোগের বিবরণ:</span>
                    <p className="text-ink-2 whitespace-pre-wrap leading-relaxed">{rep.description}</p>
                  </div>

                  {rep.resolution && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl text-xs space-y-0.5 text-emerald-800 dark:text-emerald-300">
                      <span className="font-bold">নিষ্পত্তির নোট:</span>
                      <p>{rep.resolution}</p>
                    </div>
                  )}

                  {rep.status === 'pending' && (
                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReport(rep);
                          setResolutionStatus('resolved');
                          setResolutionNote('');
                          setActionOption('none');
                        }}
                        className="px-3 py-1.5 text-xs font-bold rounded-xl bg-brand text-white hover:bg-brand-strong cursor-pointer shadow-xs"
                      >
                        তদন্ত ও নিষ্পত্তি করুন
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 mb-card text-xs">
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

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="mb-card max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-brand" />
                <span>অভিযোগ নিষ্পত্তি ও সিদ্ধান্ত</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                resolveMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-ink mb-1">সিদ্ধান্তের ধরন:</label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                  className="mb-input text-xs"
                >
                  <option value="resolved">অভিযোগ প্রমাণিত ও নিষ্পত্তি (Resolved)</option>
                  <option value="dismissed">ভিত্তিহীন বিবেচনায় বাতিল (Dismissed)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">অ্যাকশন (প্রয়োজনে):</label>
                <select
                  value={actionOption}
                  onChange={(e) => setActionOption(e.target.value as any)}
                  className="mb-input text-xs"
                >
                  <option value="none">কোনো অ্যাকাউন্ট অ্যাকশন নয় (সতর্কবার্তা/মৌখিক সমাধান)</option>
                  <option value="suspend">অভিযুক্ত ব্যক্তির অ্যাকাউন্ট অবিলম্বে স্থগিত করুন (Suspend Account)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  নিষ্পত্তির বিবরণ / নোট (বাধ্যতামূলক):
                </label>
                <textarea
                  required
                  rows={3}
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="তদন্তের ফলাফল ও গৃহীত পদক্ষেপ সংক্ষেপে লিখুন..."
                  className="mb-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 font-bold rounded-xl border border-line hover:bg-elev cursor-pointer text-ink-2"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={resolveMutation.isPending || !resolutionNote.trim()}
                  className="px-4 py-2 font-bold rounded-xl bg-brand text-white hover:bg-brand-strong disabled:opacity-50 cursor-pointer shadow-md shadow-brand/20"
                >
                  {resolveMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'সিদ্ধান্ত চূড়ান্ত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsTab;
