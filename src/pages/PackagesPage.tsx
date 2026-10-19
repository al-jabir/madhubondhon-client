import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Coins, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  XCircle, 
  PhoneCall, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { paymentsApi } from '../api/payments.api';
import { CreditPackage, CreditTransaction } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/useAuth';

export const PackagesPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [selectedPkg, setSelectedPkg] = useState<CreditPackage | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [senderPhone, setSenderPhone] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Fetch Packages
  const { data: pkgData, isLoading: isPkgLoading } = useQuery({
    queryKey: ['credit-packages'],
    queryFn: () => paymentsApi.getPackages(),
  });

  // Fetch Transactions
  const { data: trxData, isLoading: isTrxLoading } = useQuery({
    queryKey: ['my-transactions'],
    queryFn: () => paymentsApi.getUserTransactions(1, 10),
  });

  // Submit Mutation
  const submitMutation = useMutation({
    mutationFn: paymentsApi.submitManualPayment,
    onSuccess: () => {
      toast.success('পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন শীঘ্রই যাচাই করবেন।');
      setSelectedPkg(null);
      setSenderPhone('');
      setTrxId('');
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      refreshUser();
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'পেমেন্ট রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে। তথ্য সঠিক কিনা যাচাই করুন।';
      toast.error(errorMsg);
    },
  });

  const packages = pkgData?.data?.packages || [];
  const instructions = pkgData?.data?.instructions || {
    bkashNumber: '01700000000',
    bkashType: 'Send Money (Personal)',
    nagadNumber: '01700000000',
    nagadType: 'Send Money (Personal)',
    note: 'Send Money করার পর প্রেরক নম্বর ও TrxID প্রদান করুন।',
  };

  const transactions: CreditTransaction[] = trxData?.data || [];

  const handleCopyNumber = (num: string, type: string) => {
    navigator.clipboard.writeText(num);
    setCopiedType(type);
    toast.success(`${type} নম্বর কপি করা হয়েছে!`);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) {
      toast.error('দয়া করে একটি প্যাকেজ নির্বাচন করুন');
      return;
    }
    if (!senderPhone.trim() || senderPhone.length < 11) {
      toast.error('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন');
      return;
    }
    if (!trxId.trim() || trxId.length < 6) {
      toast.error('সঠিক TrxID প্রদান করুন');
      return;
    }

    submitMutation.mutate({
      packageId: selectedPkg.id,
      paymentMethod,
      senderPhone: senderPhone.trim(),
      trxId: trxId.trim().toUpperCase(),
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header & Balance Banner */}
      <div className="bg-linear-to-r from-brand to-pink-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-brand/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-rose-100">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>সহজ ও বিশ্বস্ত মাধ্যম</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              যোগাযোগ ক্রেডিট প্যাকেজ
            </h1>
            <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
              পছন্দের পাত্র বা পাত্রীর অভিভাবকের সাথে সরাসরি ফোনে কথা বলতে ক্রেডিট ব্যবহার করুন। ১টি
              বায়োডাটার অভিভাবকের ফোন নম্বর দেখতে ১টি ক্রেডিট প্রয়োজন হয়।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-5 text-center sm:min-w-[200px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center mb-2 shadow-md">
              <Coins className="w-6 h-6 fill-current" />
            </div>
            <span className="text-xs uppercase tracking-wider text-rose-100 font-medium">
              আপনার অবশিষ্ট ক্রেডিট
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold mt-1 text-white">
              {user?.contactCredits ?? 0} <span className="text-base font-normal text-rose-200">টি</span>
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Packages Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-ink">সাশ্রয়ী মূল্যে ক্রেডিট কিনুন</h2>
          <p className="text-sm text-ink-3">
            আপনার সুবিধামত প্যাকেজ নির্বাচন করে bKash বা Nagad এ সহজে পেমেন্ট সম্পন্ন করুন।
          </p>
        </div>

        {isPkgLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" label="প্যাকেজ লোড হচ্ছে..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packages.map((pkg) => {
              const isSelected = selectedPkg?.id === pkg.id;
              const perCredit = Math.round(pkg.priceBDT / pkg.credits);

              return (
                <div
                  key={pkg.id}
                  className={`relative rounded-3xl bg-card border-2 transition-all p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-xl cursor-pointer ${
                    isSelected
                      ? 'border-brand ring-4 ring-brand/20 shadow-md scale-100'
                      : pkg.popular
                      ? 'border-brand/40 ring-2 ring-brand scale-100'
                      : 'border-line hover:border-strongline'
                  }`}
                  onClick={() => setSelectedPkg(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3.5 right-6 px-3 py-1 bg-linear-to-r from-brand to-pink-500 text-white text-[11px] font-black rounded-full shadow-sm tracking-wide uppercase">
                      জনপ্রিয়
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-ink">{pkg.title}</span>
                      <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center text-brand">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="pt-1 pb-3 border-b border-line">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-brand">
                          ৳{pkg.priceBDT}
                        </span>
                        <span className="text-xs text-ink-3">/ সর্বমোট</span>
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        {pkg.savings || `প্রতি বায়োডাটা মাত্র ৳${perCredit}`}
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-ink-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span><strong>{pkg.credits} টি</strong> অভিভাবকের সরাসরি মোবাইল নম্বর</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>লাইফটাইম মেয়াদ (ক্রেডিট কখনো নষ্ট হয় না)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>ভেরিফাইড অভিভাবক কন্টাক্ট ইনফো</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'mb-btn-primary'
                          : 'bg-brand-soft text-brand hover:bg-brand/15'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>নির্বাচিত হয়েছে</span>
                        </>
                      ) : (
                        <>
                          <span>প্যাকেজটি বেছে নিন</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Instructions & Submission Form */}
      {selectedPkg && (
        <div className="bg-card mb-card rounded-3xl border-brand/25 p-6 sm:p-9 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-b border-line pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">
                  ধাপ ২: পেমেন্ট সম্পন্ন করুন
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-ink mt-1">
                  {selectedPkg.title} — ৳{selectedPkg.priceBDT} ({selectedPkg.credits} ক্রেডিট)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPkg(null)}
                className="text-xs text-ink-3 hover:text-ink underline self-start sm:self-auto cursor-pointer"
              >
                প্যাকেজ পরিবর্তন করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step 1: Send Money Instructions */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-black">
                  ১
                </span>
                <span>মোবাইল ব্যাংকিং এ সেন্ড মানি করুন</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'bkash'
                      ? 'border-brand bg-brand-soft ring-2 ring-brand/20'
                      : 'border-line hover:border-strongline'
                  }`}
                >
                  <span className="font-bold text-sm block text-brand">bKash (বিকাশ)</span>
                  <span className="text-[11px] text-ink-3">পার্সোনাল সেন্ড মানি</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-gold bg-gold-soft ring-2 ring-gold/20'
                      : 'border-line hover:border-strongline'
                  }`}
                >
                  <span className="font-bold text-sm block text-gold">Nagad (নগদ)</span>
                  <span className="text-[11px] text-ink-3">পার্সোনাল সেন্ড মানি</span>
                </button>
              </div>

              {/* Account Number Box */}
              <div className="bg-elev text-ink rounded-2xl p-5 space-y-3 border border-line">
                <div className="flex items-center justify-between text-xs text-ink-3">
                  <span>
                    {paymentMethod === 'bkash' ? 'বিকাশ নম্বর' : 'নগদ নম্বর'} ({instructions.bkashType})
                  </span>
                  <span className="text-gold font-bold">৳{selectedPkg.priceBDT} পাঠান</span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-brand-soft p-3 rounded-xl border border-brand/25">
                  <span className="font-mono text-lg sm:text-xl font-bold tracking-wider text-ink">
                    {paymentMethod === 'bkash' ? instructions.bkashNumber : instructions.nagadNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyNumber(
                        paymentMethod === 'bkash'
                          ? instructions.bkashNumber
                          : instructions.nagadNumber,
                        paymentMethod === 'bkash' ? 'বিকাশ' : 'নগদ'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedType ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-ink-3 leading-relaxed">
                  * {instructions.note}
                </p>
              </div>
            </div>

            {/* Step 2: Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-black">
                  ২
                </span>
                <span>পেমেন্টের তথ্য জমা দিন</span>
              </h4>

              <div className="space-y-1.5">
                <label className="mb-label block">
                  যে নম্বর থেকে টাকা পাঠিয়েছেন (প্রেরক নম্বর) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="mb-input w-full"
                />
              </div>

              <div className="space-y-1.5">
                <label className="mb-label block">
                  ট্রানজেকশন আইডি (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: BKL99A2D81"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  className="mb-input w-full uppercase font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="mb-btn-primary w-full py-3 px-4 text-sm"
              >
                {submitMutation.isPending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>পেমেন্ট নিশ্চিত করুন</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-ink-3 text-center">
                তথ্য সাবমিট করার পর আমাদের টিম ১০-১৫ মিনিটের মধ্যে যাচাই করে আপনার অ্যাকাউন্টে ক্রেডিট যুক্ত করবে।
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="space-y-4 pt-4 border-t border-line">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">আমার লেনদেনের ইতিহাস</h3>
            <p className="text-xs text-ink-3">আপনার প্রেরিত ক্রেডিট রিকোয়েস্ট ও স্ট্যাটাস</p>
          </div>
        </div>

        {isTrxLoading ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-card mb-card rounded-2xl p-8 text-center text-xs text-ink-3">
            এখনও কোনো লেনদেনের তথ্য নেই।
          </div>
        ) : (
          <div className="bg-card mb-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-elev border-b border-line text-ink-3 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">প্যাকেজ</th>
                    <th className="px-4 py-3">টাকার পরিমাণ</th>
                    <th className="px-4 py-3">মাধ্যম ও TrxID</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {transactions.map((trx) => {
                    const statusColor =
                      trx.status === 'completed'
                        ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : trx.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-gold-soft text-gold border-gold/25';

                    const statusText =
                      trx.status === 'completed'
                        ? 'অনুমোদিত'
                        : trx.status === 'rejected'
                        ? 'প্রত্যাখ্যাত'
                        : 'অপেক্ষমান';

                    return (
                      <tr key={trx._id} className="hover:bg-brand-soft/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-ink-2">
                          {trx.createdAt ? new Date(trx.createdAt).toLocaleDateString('bn-BD') : '-'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink">
                          {trx.credits} ক্রেডিট
                        </td>
                        <td className="px-4 py-3 font-bold text-brand">
                          ৳{trx.amountBDT}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <span className="uppercase font-semibold text-ink-2">{trx.paymentMethod}</span>
                          <span className="text-ink-3 mx-1">•</span>
                          <span className="text-ink-2">{trx.trxId}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusColor}`}
                          >
                            {trx.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                            {trx.status === 'pending' && <Clock className="w-3 h-3" />}
                            {trx.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            <span>{statusText}</span>
                          </span>
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
    </div>
  );
};

export default PackagesPage;
