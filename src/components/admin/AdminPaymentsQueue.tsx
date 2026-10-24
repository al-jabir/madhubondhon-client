import PaymentReconciliation from './PaymentReconciliation';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { paymentsApi } from '../../api/payments.api';
import { CreditTransaction, User } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import ConfirmationModal from '../common/ConfirmationModal';
import { useLanguage } from '../../i18n/LanguageContext';

export const AdminPaymentsQueue: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [approveTarget, setApproveTarget] = useState<CreditTransaction | null>(null);
  const [rejectTarget, setRejectTarget] = useState<CreditTransaction | null>(null);

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
          ? (isBengali ? 'পেমেন্ট অনুমোদিত হয়েছে এবং ক্রেডিট যোগ করা হয়েছে!' : 'Payment approved and credits credited!')
          : (isBengali ? 'পেমেন্ট রিকোয়েস্ট বাতিল করা হয়েছে।' : 'Payment request has been rejected.')
      );
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({queryKey:['payment-reconciliation']});
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'রিভিউ সংরক্ষণ করতে সমস্যা হয়েছে' : 'Failed to save review');
      toast.error(msg);
    },
  });

  const transactions: CreditTransaction[] = data?.data || [];

  const handleApprove = (trx: CreditTransaction) => {
    setApproveTarget(trx);
  };

  const handleReject = (trx: CreditTransaction) => {
    setRejectTarget(trx);
  };

  return (
    <div className="space-y-6"><PaymentReconciliation />
      {/* Filters and Header */}
      <div className="mb-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gold-soft border border-gold/25 text-gold flex items-center justify-center">
            <Coins className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">
              {isBengali ? 'পেমেন্ট ও ক্রেডিট অনুমোদন কিউ' : 'Payment & Credits Verification Queue'}
            </h3>
            <p className="text-xs text-ink-3">
              {isBengali ? 'ব্যবহারকারীদের প্রেরিত bKash ও Nagad পেমেন্ট ভেরিফাই করুন' : 'Verify bKash and Nagad payment submissions from users'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isBengali ? 'TrxID বা প্রেরক ফোন...' : 'TrxID or sender phone...'}
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
              <option value="all">{isBengali ? 'সকল লেনদেন (All)' : 'All Transactions'}</option>
              <option value="pending">{isBengali ? 'অপেক্ষমান (Pending)' : 'Pending'}</option>
              <option value="completed">{isBengali ? 'অনুমোদিত (Completed)' : 'Completed'}</option>
              <option value="rejected">{isBengali ? 'বাতিল (Rejected)' : 'Rejected'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="md" label={isBengali ? 'পেমেন্ট রিকোয়েস্ট লোড হচ্ছে...' : 'Loading payment requests...'} />
        </div>
      ) : transactions.length === 0 ? (
        <div className="mb-card p-12 text-center space-y-2">
          <Coins className="w-8 h-8 text-ink-3 mx-auto" />
          <p className="text-sm font-semibold text-ink-2">{isBengali ? 'কোনো লেনদেন পাওয়া যায়নি' : 'No transactions found'}</p>
          <p className="text-xs text-ink-3">
            {isBengali ? 'এই ফিল্টারে বর্তমানে কোনো পেমেন্ট রিকোয়েস্ট নেই।' : 'There are no payment requests matching this filter.'}
          </p>
        </div>
      ) : (
        <div className="mb-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-elev border-b border-line text-ink-2 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">{isBengali ? 'তারিখ' : 'Date'}</th>
                  <th className="px-4 py-3">{isBengali ? 'ব্যবহারকারী' : 'User'}</th>
                  <th className="px-4 py-3">{isBengali ? 'প্যাকেজ ও ক্রেডিট' : 'Package & Credits'}</th>
                  <th className="px-4 py-3">{isBengali ? 'টাকার পরিমাণ' : 'Amount'}</th>
                  <th className="px-4 py-3">{isBengali ? 'মাধ্যম ও প্রেরক নম্বর' : 'Method & Sender Phone'}</th>
                  <th className="px-4 py-3">{isBengali ? 'TrxID' : 'TrxID'}</th>
                  <th className="px-4 py-3">{isBengali ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="px-4 py-3 text-right">{isBengali ? 'কার্যক্রম' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((trx) => {
                  const userObj = typeof trx.user === 'object' ? (trx.user as User) : null;
                  const isPending = trx.status === 'pending';

                  return (
                    <tr key={trx._id} className="border-t border-line hover:bg-elev/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink-2">
                        {trx.createdAt ? new Date(trx.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US') : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-ink">{userObj?.name || (isBengali ? 'ব্যবহারকারী' : 'User')}</div>
                        <div className="text-[11px] text-ink-3">{userObj?.email || '-'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-ink">
                          {formatNumber(trx.credits)} {isBengali ? 'ক্রেডিট' : 'Credits'}
                        </span>
                        <span className="text-[11px] text-ink-3 block">
                          {trx.packageTitle || (isBengali ? 'প্যাকেজ' : 'Package')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-brand text-sm">
                        ৳{formatNumber(trx.amountBDT)}
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
                            {isBengali ? 'অনুমোদিত' : 'Approved'}
                          </span>
                        )}
                        {trx.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gold-soft text-gold border border-gold/25">
                            <Clock className="w-3 h-3" />
                            {isBengali ? 'অপেক্ষমান' : 'Pending'}
                          </span>
                        )}
                        {trx.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800">
                            <XCircle className="w-3 h-3" />
                            {isBengali ? 'বাতিল' : 'Rejected'}
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
                              title={isBengali ? 'অনুমোদন করুন' : 'Approve'}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>{isBengali ? 'অনুমোদন' : 'Approve'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReject(trx)}
                              disabled={reviewMutation.isPending}
                              className="mb-btn-secondary !px-2.5 !py-1.5 font-bold flex items-center gap-1 hover:!text-red-600 dark:hover:!text-red-400 border border-red-200 dark:border-red-800 cursor-pointer"
                              title={isBengali ? 'বাতিল করুন' : 'Reject'}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>{isBengali ? 'বাতিল' : 'Reject'}</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-ink-3">
                            {isBengali ? 'পর্যালোচিত' : 'Reviewed'}
                          </span>
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

      {/* Approve Payment Modal */}
      <ConfirmationModal
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={() => {
          if (approveTarget) {
            reviewMutation.mutate(
              { id: approveTarget._id, status: 'completed' },
              { onSettled: () => setApproveTarget(null) }
            );
          }
        }}
        title={isBengali ? 'পেমেন্ট অনুমোদন' : 'Approve Payment'}
        message={
          isBengali
            ? `আপনি কি নিশ্চিত যে TrxID: ${approveTarget?.trxId} এর পেমেন্ট অনুমোদন করবেন? এর ফলে ব্যবহারকারী ${formatNumber(approveTarget?.credits || 0)} টি কন্টাক্ট ক্রেডিট পাবেন।`
            : `Are you sure you want to approve the payment for TrxID: ${approveTarget?.trxId}? This will grant ${formatNumber(approveTarget?.credits || 0)} contact credits to the user.`
        }
        confirmText={isBengali ? 'অনুমোদন করুন' : 'Approve'}
        variant="success"
        isLoading={reviewMutation.isPending}
      />

      {/* Reject Payment Modal */}
      <ConfirmationModal
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={(reason) => {
          if (rejectTarget) {
            reviewMutation.mutate(
              {
                id: rejectTarget._id,
                status: 'rejected',
                note: reason?.trim() || undefined,
              },
              { onSettled: () => setRejectTarget(null) }
            );
          }
        }}
        title={isBengali ? 'পেমেন্ট বাতিল' : 'Reject Payment'}
        message={
          isBengali
            ? `আপনি কি নিশ্চিত যে TrxID: ${rejectTarget?.trxId} এর পেমেন্ট বাতিল করতে চান?`
            : `Are you sure you want to reject the payment for TrxID: ${rejectTarget?.trxId}?`
        }
        confirmText={isBengali ? 'বাতিল করুন' : 'Reject'}
        variant="danger"
        hasInput={true}
        inputLabel={isBengali ? 'বাতিলের কারণ লিখুন (ঐচ্ছিক):' : 'Rejection Reason (optional):'}
        inputDefaultValue={
          isBengali
            ? 'প্রদত্ত TrxID অথবা টাকার পরিমাণ সঠিক নয়'
            : 'Invalid TrxID or mismatched amount'
        }
        isLoading={reviewMutation.isPending}
      />
    </div>
  );
};

export default AdminPaymentsQueue;
