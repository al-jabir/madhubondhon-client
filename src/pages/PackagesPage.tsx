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
      <div className="bg-linear-to-r from-rose-700 via-rose-600 to-pink-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-rose-200 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold text-rose-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
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
            <div className="w-12 h-12 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center mb-2 shadow-md">
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
          <h2 className="text-2xl font-bold text-gray-900">সাশ্রয়ী মূল্যে ক্রেডিট কিনুন</h2>
          <p className="text-sm text-gray-500">
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
                  className={`relative rounded-3xl bg-white border-2 transition-all p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:shadow-xl cursor-pointer ${
                    isSelected
                      ? 'border-rose-600 ring-4 ring-rose-100 shadow-md scale-[1.02]'
                      : 'border-rose-100 hover:border-rose-300'
                  }`}
                  onClick={() => setSelectedPkg(pkg)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3.5 right-6 px-3 py-1 bg-linear-to-r from-amber-500 to-rose-500 text-white text-[11px] font-black rounded-full shadow-sm tracking-wide uppercase">
                      জনপ্রিয়
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">{pkg.title}</span>
                      <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
                        <PhoneCall className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="pt-1 pb-3 border-b border-gray-100">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-rose-600">
                          ৳{pkg.priceBDT}
                        </span>
                        <span className="text-xs text-gray-500">/ সর্বমোট</span>
                      </div>
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        {pkg.savings || `প্রতি বায়োডাটা মাত্র ৳${perCredit}`}
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-gray-650">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span><strong>{pkg.credits} টি</strong> অভিভাবকের সরাসরি মোবাইল নম্বর</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>লাইফটাইম মেয়াদ (ক্রেডিট কখনো নষ্ট হয় না)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>ভেরিফাইড অভিভাবক কন্টাক্ট ইনফো</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
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
        <div className="bg-white rounded-3xl border-2 border-rose-200 p-6 sm:p-9 shadow-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-b border-gray-100 pb-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                  ধাপ ২: পেমেন্ট সম্পন্ন করুন
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                  {selectedPkg.title} — ৳{selectedPkg.priceBDT} ({selectedPkg.credits} ক্রেডিট)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPkg(null)}
                className="text-xs text-gray-500 hover:text-gray-800 underline self-start sm:self-auto cursor-pointer"
              >
                প্যাকেজ পরিবর্তন করুন
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step 1: Send Money Instructions */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-black">
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
                      ? 'border-pink-500 bg-pink-50/50 ring-2 ring-pink-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-bold text-sm block text-pink-700">bKash (বিকাশ)</span>
                  <span className="text-[11px] text-gray-500">পার্সোনাল সেন্ড মানি</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'nagad'
                      ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-bold text-sm block text-orange-700">Nagad (নগদ)</span>
                  <span className="text-[11px] text-gray-500">পার্সোনাল সেন্ড মানি</span>
                </button>
              </div>

              {/* Account Number Box */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-300">
                  <span>
                    {paymentMethod === 'bkash' ? 'বিকাশ নম্বর' : 'নগদ নম্বর'} ({instructions.bkashType})
                  </span>
                  <span className="text-amber-400 font-bold">৳{selectedPkg.priceBDT} পাঠান</span>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white/10 p-3 rounded-xl border border-white/15">
                  <span className="font-mono text-lg sm:text-xl font-bold tracking-wider">
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
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedType ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  * {instructions.note}
                </p>
              </div>
            </div>

            {/* Step 2: Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-xs flex items-center justify-center font-black">
                  ২
                </span>
                <span>পেমেন্টের তথ্য জমা দিন</span>
              </h4>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  যে নম্বর থেকে টাকা পাঠিয়েছেন (প্রেরক নম্বর) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="01XXXXXXXXX"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 block">
                  ট্রানজেকশন আইডি (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: BKL99A2D81"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 text-sm uppercase font-mono rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
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
              <p className="text-[11px] text-gray-500 text-center">
                তথ্য সাবমিট করার পর আমাদের টিম ১০-১৫ মিনিটের মধ্যে যাচাই করে আপনার অ্যাকাউন্টে ক্রেডিট যুক্ত করবে।
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">আমার লেনদেনের ইতিহাস</h3>
            <p className="text-xs text-gray-500">আপনার প্রেরিত ক্রেডিট রিকোয়েস্ট ও স্ট্যাটাস</p>
          </div>
        </div>

        {isTrxLoading ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200/80 p-8 text-center text-xs text-gray-500">
            এখনও কোনো লেনদেনের তথ্য নেই।
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">তারিখ</th>
                    <th className="px-4 py-3">প্যাকেজ</th>
                    <th className="px-4 py-3">টাকার পরিমাণ</th>
                    <th className="px-4 py-3">মাধ্যম ও TrxID</th>
                    <th className="px-4 py-3">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((trx) => {
                    const statusColor =
                      trx.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : trx.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200';

                    const statusText =
                      trx.status === 'completed'
                        ? 'অনুমোদিত'
                        : trx.status === 'rejected'
                        ? 'প্রত্যাখ্যাত'
                        : 'অপেক্ষমান';

                    return (
                      <tr key={trx._id} className="hover:bg-rose-50/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {trx.createdAt ? new Date(trx.createdAt).toLocaleDateString('bn-BD') : '-'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">
                          {trx.credits} ক্রেডিট
                        </td>
                        <td className="px-4 py-3 font-bold text-rose-600">
                          ৳{trx.amountBDT}
                        </td>
                        <td className="px-4 py-3 font-mono">
                          <span className="uppercase font-semibold text-gray-800">{trx.paymentMethod}</span>
                          <span className="text-gray-400 mx-1">•</span>
                          <span className="text-gray-600">{trx.trxId}</span>
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
