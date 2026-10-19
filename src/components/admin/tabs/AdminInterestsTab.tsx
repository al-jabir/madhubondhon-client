import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  HeartHandshake,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { AdminInterestItem } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';

export const AdminInterestsTab: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  const { data: interestsData, isLoading } = useQuery({
    queryKey: ['admin-interests', statusFilter, page],
    queryFn: () =>
      adminApi.listInterests({
        status: statusFilter || undefined,
        page,
        limit: 15,
      }),
  });

  const interestsList = interestsData?.data?.interests || [];
  const meta = interestsData?.meta;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            গৃহীত (Accepted)
          </span>
        );
      case 'declined':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
            <XCircle className="w-3 h-3" />
            প্রত্যাখ্যাত (Declined)
          </span>
        );
      case 'withdrawn':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-elev text-ink-3">
            <RotateCcw className="w-3 h-3" />
            প্রত্যাহার (Withdrawn)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            অপেক্ষমাণ (Pending)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Safety Notice */}
      <div className="mb-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-pink-500" />
              <span>বৈবাহিক প্রস্তাব পর্যবেক্ষণ (Interest Monitoring)</span>
            </h2>
            <p className="text-xs text-ink-3">
              সদস্যদের পারস্পরিক যোগাযোগের গতিবিধি এবং সম্ভাব্য অনাকাঙ্ক্ষিত স্প্যামিং পর্যবেক্ষণ
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-xl text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>প্রশাসনিক নিয়ম: ব্যবহারকারীর পক্ষ থেকে সিদ্ধান্ত দেওয়া নিষিদ্ধ</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="mb-input text-xs max-w-xs"
          >
            <option value="">সকল প্রস্তাব (All Status)</option>
            <option value="pending">অপেক্ষমাণ (Pending)</option>
            <option value="accepted">গৃহীত (Accepted)</option>
            <option value="declined">প্রত্যাখ্যাত (Declined)</option>
            <option value="withdrawn">প্রত্যাহারকৃত (Withdrawn)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mb-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label="প্রস্তাবের তথ্য লোড হচ্ছে..." />
          </div>
        ) : interestsList.length === 0 ? (
          <div className="py-16 text-center text-ink-3 space-y-2">
            <Heart className="w-10 h-10 mx-auto text-ink-3/40" />
            <p className="text-sm font-bold">কোনো প্রস্তাবের রেকর্ড পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-elev/80 text-ink-3 font-bold border-b border-line uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">প্রেরক (Sender)</th>
                  <th className="py-3 px-4">প্রাপক (Recipient)</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4">তারিখ ও সময়</th>
                  <th className="py-3 px-4">সাড়া দেওয়ার সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {interestsList.map((item: AdminInterestItem) => (
                  <tr key={item._id} className="hover:bg-elev/40 transition-colors">
                    {/* Sender */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink">{item.sender?.name || 'অজ্ঞাত'}</div>
                      <div className="text-[11px] font-mono text-ink-3">{item.sender?.email}</div>
                    </td>

                    {/* Recipient */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-ink">{item.recipient?.name || 'অজ্ঞাত'}</div>
                      <div className="text-[11px] font-mono text-ink-3">{item.recipient?.email}</div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Sent At */}
                    <td className="py-3 px-4 text-ink-3 text-[11px]">
                      {new Date(item.createdAt).toLocaleString('bn-BD', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>

                    {/* Responded At */}
                    <td className="py-3 px-4 text-ink-3 text-[11px]">
                      {item.respondedAt
                        ? new Date(item.respondedAt).toLocaleString('bn-BD', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                  </tr>
                ))}
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

export default AdminInterestsTab;
