import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Coins,
  Check,
  X,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Phone,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { paymentsApi } from '../../api/payments.api';
import { CreditTransaction, User } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';

export const AdminPaymentsQueue: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', statusFilter, searchTerm],
    queryFn: () =>
      paymentsApi.adminListTransactions({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm.trim() || undefined,
        limit: 30,
      }),
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: 'completed' | 'rejected';
      note?: string;
    }) => paymentsApi.adminReviewTransaction(id, { status, reviewNote: note }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.status === 'completed'
          ? 'পেমেন্ট অনুমোদিত হয়েছে এবং ক্রেডিট যোগ করা হয়েছে!'
          : 'পেমেন্ট রিকোয়েস্ট বাতিল করা হয়েছে।'
      );
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'রিভিউ সংরক্ষণ করতে সমস্যা হয়েছে';
      toast.error(msg);
    },
  });

  const transactions: CreditTransaction[] = data?.data || [];

  const handleApprove = (trx: CreditTransaction) => {
    if (
      window.confirm(
        `আপনি কি নিশ্চিত যে TrxID: ${trx.trxId} এর পেমেন্ট অনুমোদন করবেন? এর ফলে ব্যবহারকারী ${trx.credits} টি কন্টাক্ট ক্রেডিট পাবেন।`
      )
    ) {
      reviewMutation.mutate({ id: trx._id, status: 'completed' });
    }
  };

  const handleReject = (trx: CreditTransaction) => {
    const reason = window.prompt(
      'বাতিলের কারণ লিখুন (ঐচ্ছিক):',
      'প্রদত্ত TrxID অথবা টাকার পরিমাণ সঠিক নয়'
    );
    if (reason !== null) {
      reviewMutation.mutate({
        id: trx._id,
        status: 'rejected',
        note: reason.trim() || undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Header */}
      <div className="mb-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold-soft border border-gold/25 text-gold flex items-center justify-center">
            <Coins className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">
              পেমেন্ট ও ক্রেডিট অনুমোদন কিউ
            </h3>
            <p className="text-xs text-ink-3">
              ব্যবহারকারীদের প্রেরিত bKash ও Nagad পেমেন্ট ভেরিফাই করুন
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="TrxID বা প্রেরক ফোন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-input !text-xs !bg-elev !border-line !rounded-xl pl-8 pr-3 py-2"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-ink-3" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mb-input !text-xs !bg-elev !border-line !rounded-xl py-2 font-semibold cursor-pointer"
            >
              <option value="pending">অপেক্ষমান (Pending)</option>
              <option value="completed">অনুমোদিত (Completed)</option>
              <option value="rejected">বাতিল (Rejected)</option>
              <option value="all">সকল লেনদেন (All)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="md" label="পেমেন্ট রিকোয়েস্ট লোড হচ্ছে..." />
        </div>
      ) : transactions.length === 0 ? (
        <div className="mb-card p-12 text-center space-y-2">
          <Coins className="w-8 h-8 text-ink-3 mx-auto" />
          <p className="text-sm font-semibold text-ink-2">কোনো লেনদেন পাওয়া যায়নি</p>
          <p className="text-xs text-ink-3">এই ফিল্টারে বর্তমানে কোনো পেমেন্ট রিকোয়েস্ট নেই।</p>
        </div>
      ) : (
        <div className="mb-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-elev border-b border-line text-ink-2 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">তারিখ</th>
                  <th className="px-4 py-3">ব্যবহারকারী</th>
                  <th className="px-4 py-3">প্যাকেজ ও ক্রেডিট</th>
                  <th className="px-4 py-3">টাকার পরিমাণ</th>
                  <th className="px-4 py-3">মাধ্যম ও প্রেরক নম্বর</th>
                  <th className="px-4 py-3">TrxID</th>
                  <th className="px-4 py-3">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-right">কার্যক্রম</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => {
                  const userObj = typeof trx.user === 'object' ? (trx.user as User) : null;
                  const isPending = trx.status === 'pending';

                  return (
                    <tr key={trx._id} className="border-t border-line hover:bg-elev/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink-2">
                        {trx.createdAt ? new Date(trx.createdAt).toLocaleDateString('bn-BD') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-ink">{userObj?.name || 'ব্যবহারকারী'}</div>
                        <div className="text-[11px] text-ink-3">{userObj?.email || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-ink">{trx.credits} ক্রেডিট</span>
                        <span className="text-[11px] text-ink-3 block">
                          {trx.packageTitle || 'প্যাকেজ'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-brand text-sm">
                        ৳{trx.amountBDT}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold uppercase text-ink block">
                          {trx.paymentMethod}
                        </span>
                        <span className="font-mono text-ink-2 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-ink-3" />
                          {trx.senderPhone}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-ink bg-elev px-2 py-0.5 rounded-sm select-all">
                          {trx.trxId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {trx.status === 'completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            অনুমোদিত
                          </span>
                        )}
                        {trx.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gold-soft text-gold border border-gold/25">
                            <Clock className="w-3 h-3" />
                            অপেক্ষমান
                          </span>
                        )}
                        {trx.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                            <XCircle className="w-3 h-3" />
                            বাতিল
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleApprove(trx)}
                              disabled={reviewMutation.isPending}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                              title="অনুমোদন করুন"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>অনুমোদন</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(trx)}
                              disabled={reviewMutation.isPending}
                              className="mb-btn-secondary !px-2.5 !py-1.5 font-bold flex items-center gap-1 hover:!text-red-600 dark:hover:!text-red-400 border border-red-200 dark:border-red-800"
                              title="বাতিল করুন"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>বাতিল</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-ink-3">পর্যালোচিত</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentsQueue;
