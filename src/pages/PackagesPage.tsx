import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Coins, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
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
import { useLanguage } from '../i18n/LanguageContext';

export const PackagesPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();

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
      toast.success(
        isBengali
          ? 'পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে! অ্যাডমিন শীঘ্রই যাচাই করবেন।'
          : 'Payment request submitted successfully! Admin will verify shortly.'
      );
      setSelectedPkg(null);
      setSenderPhone('');
      setTrxId('');
      queryClient.invalidateQueries({ queryKey: ['my-transactions'] });
      refreshUser();
    },
    onError: (err: unknown) => {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali
          ? 'পেমেন্ট রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে। তথ্য সঠিক কিনা যাচাই করুন।'
          : 'Failed to submit payment request. Please verify the information.');
      toast.error(errorMsg);
    },
  });

  const packages = pkgData?.data?.packages || [];
  const instructions = pkgData?.data?.instructions || {
    bkashNumber: '01700000000',
    bkashType: 'Send Money (Personal)',
    nagadNumber: '01700000000',
    nagadType: 'Send Money (Personal)',
    note: isBengali
      ? 'Send Money করার পর প্রেরক নম্বর ও TrxID প্রদান করুন।'
      : 'After sending money, provide sender number and TrxID.',
  };

  const transactions: CreditTransaction[] = trxData?.data || [];

  const handleCopyNumber = (num: string, type: string) => {
    navigator.clipboard.writeText(num);
    setCopiedType(type);
    toast.success(
      isBengali ? `${type} নম্বর কপি করা হয়েছে!` : `${type} number copied!`
    );
    setTimeout(() => setCopiedType(null), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPkg) {
      toast.error(isBengali ? 'দয়া করে একটি প্যাকেজ নির্বাচন করুন' : 'Please select a package');
      return;
    }
    if (!senderPhone.trim() || senderPhone.length < 11) {
      toast.error(isBengali ? 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন' : 'Enter a valid 11-digit mobile number');
      return;
    }
    if (!trxId.trim() || trxId.length < 6) {
      toast.error(isBengali ? 'সঠিক TrxID প্রদান করুন' : 'Enter a valid TrxID');
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
              <span>{isBengali ? 'সহজ ও বিশ্বস্ত মাধ্যম' : 'Simple & Secure'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {isBengali ? 'যোগাযোগ ক্রেডিট প্যাকেজ' : 'Contact Credit Packages'}
            </h1>
            <p className="text-rose-100 text-sm sm:text-base leading-relaxed">
              {isBengali
                ? 'পছন্দের পাত্র বা পাত্রীর অভিভাবকের সাথে সরাসরি ফোনে কথা বলতে ক্রেডিট ব্যবহার করুন। ১টি বায়োডাটার অভিভাবকের ফোন নম্বর দেখতে ১টি ক্রেডিট প্রয়োজন হয়।'
                : 'Use credits to unlock guardian contact details for prospective grooms or brides. 1 credit is required to view 1 guardian contact.'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/25 rounded-2xl p-5 text-center sm:min-w-[200px] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gold text-white flex items-center justify-center mb-2 shadow-md">
              <Coins className="w-6 h-6 fill-current" />
            </div>
            <span className="text-xs text-rose-100 font-medium">
              {isBengali ? 'আপনার অবশিষ্ট ক্রেডিট' : 'Your Available Credits'}
            </span>
            <span className="text-3xl sm:text-4xl font-extrabold mt-1 text-white">
              {isBengali ? formatNumber(user?.contactCredits ?? 0) : user?.contactCredits ?? 0}{' '}
              <span className="text-base font-normal text-rose-200">
                {isBengali ? 'টি' : 'credits'}
              </span>
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Packages Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold text-ink">
            {isBengali ? 'সাশ্রয়ী মূল্যে ক্রেডিট কিনুন' : 'Purchase Affordable Credit Bundles'}
          </h2>
          <p className="text-sm text-ink-3">
            {isBengali
              ? 'আপনার সুবিধামত প্যাকেজ নির্বাচন করে bKash বা Nagad এ সহজে পেমেন্ট সম্পন্ন করুন।'
              : 'Select your preferred bundle and easily pay via bKash or Nagad.'}
          </p>
        </div>

        {isPkgLoading ? (
          <div className="py-16 flex justify-center">
            <LoadingSpinner size="lg" label={isBengali ? "প্যাকেজ লোড হচ্ছে..." : "Loading packages..."} />
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
                      {isBengali ? 'জনপ্রিয়' : 'Popular'}
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
                          ৳{isBengali ? formatNumber(pkg.priceBDT) : pkg.priceBDT}
                        </span>
                        <span className="text-xs text-ink-3">
                          {isBengali ? '/ সর্বমোট' : '/ total'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        {pkg.savings ||
                          (isBengali
                            ? `প্রতি বায়োডাটা মাত্র ৳${formatNumber(perCredit)}`
                            : `Only ৳${perCredit} per contact`)}
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-ink-2">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>
                          <strong>
                            {isBengali ? formatNumber(pkg.credits) : pkg.credits}{' '}
                            {isBengali ? 'টি' : 'guardian'}
                          </strong>{' '}
                          {isBengali ? 'অভিভাবকের সরাসরি মোবাইল নম্বর' : 'direct contact numbers'}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{isBengali ? 'লাইফটাইম মেয়াদ (ক্রেডিট নষ্ট হয় না)' : 'Lifetime validity (credits never expire)'}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{isBengali ? 'ভেরিফাইড অভিভাবক কন্টাক্ট ইনফো' : 'Verified guardian contact info'}</span>
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
                          <span>{isBengali ? 'নির্বাচিত হয়েছে' : 'Selected'}</span>
                        </>
                      ) : (
                        <>
                          <span>{isBengali ? 'প্যাকেজটি বেছে নিন' : 'Choose Package'}</span>
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
                <span className="text-xs font-bold text-brand">
                  {isBengali ? 'ধাপ ২: পেমেন্ট সম্পন্ন করুন' : 'Step 2: Complete Payment'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-ink mt-1">
                  {selectedPkg.title} — ৳
                  {isBengali ? formatNumber(selectedPkg.priceBDT) : selectedPkg.priceBDT} (
                  {isBengali ? formatNumber(selectedPkg.credits) : selectedPkg.credits}{' '}
                  {isBengali ? 'ক্রেডিট' : 'credits'})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPkg(null)}
                className="text-xs text-ink-3 hover:text-ink underline self-start sm:self-auto cursor-pointer"
              >
                {isBengali ? 'প্যাকেজ পরিবর্তন করুন' : 'Change Package'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Step 1: Send Money Instructions */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand text-white text-xs flex items-center justify-center font-black">
                  1
                </span>
                <span>
                  {isBengali
                    ? 'মোবাইল ব্যাংকিং এ সেন্ড মানি করুন'
                    : 'Send Money via Mobile Banking'}
                </span>
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
                  <span className="font-bold text-sm block text-brand">
                    {isBengali ? 'bKash (বিকাশ)' : 'bKash'}
                  </span>
                  <span className="text-[11px] text-ink-3">
                    {isBengali ? 'পার্সোনাল সেন্ড মানি' : 'Personal Send Money'}
                  </span>
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
                  <span className="font-bold text-sm block text-gold">
                    {isBengali ? 'Nagad (নগদ)' : 'Nagad'}
                  </span>
                  <span className="text-[11px] text-ink-3">
                    {isBengali ? 'পার্সোনাল সেন্ড মানি' : 'Personal Send Money'}
                  </span>
                </button>
              </div>

              {/* Account Number Box */}
              <div className="bg-elev text-ink rounded-2xl p-5 space-y-3 border border-line">
                <div className="flex items-center justify-between text-xs text-ink-3">
                  <span>
                    {paymentMethod === 'bkash'
                      ? isBengali
                        ? 'বিকাশ নম্বর'
                        : 'bKash Number'
                      : isBengali
                      ? 'নগদ নম্বর'
                      : 'Nagad Number'}{' '}
                    ({instructions.bkashType})
                  </span>
                  <span className="text-gold font-bold">
                    {isBengali
                      ? `৳${formatNumber(selectedPkg.priceBDT)} পাঠান`
                      : `Send ৳${selectedPkg.priceBDT}`}
                  </span>
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
                        paymentMethod === 'bkash' ? 'bKash' : 'Nagad'
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-brand hover:bg-brand/90 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    {copiedType ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType ? (isBengali ? 'কপি হয়েছে' : 'Copied') : isBengali ? 'কপি করুন' : 'Copy'}</span>
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
                  2
                </span>
                <span>
                  {isBengali ? 'পেমেন্টের তথ্য জমা দিন' : 'Submit Payment Details'}
                </span>
              </h4>

              <div className="space-y-1.5">
                <label className="mb-label block">
                  {isBengali
                    ? 'যে নম্বর থেকে টাকা পাঠিয়েছেন (প্রেরক নম্বর) *'
                    : 'Sender Mobile Number *'}
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
                  {isBengali ? 'ট্রানজেকশন আইডি (TrxID) *' : 'Transaction ID (TrxID) *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isBengali ? 'যেমন: BKL99A2D81' : 'e.g. BKL99A2D81'}
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
                    <span>{isBengali ? 'পেমেন্ট নিশ্চিত করুন' : 'Confirm Payment'}</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-ink-3 text-center">
                {isBengali
                  ? 'তথ্য সাবমিট করার পর আমাদের টিম ১০-১৫ মিনিটের মধ্যে যাচাই করে আপনার অ্যাকাউন্টে ক্রেডিট যুক্ত করবে।'
                  : 'After submission, our team verifies and adds credits to your account within 10-15 minutes.'}
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div className="space-y-4 pt-4 border-t border-line">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-ink">
              {isBengali ? 'আমার লেনদেনের ইতিহাস' : 'Transaction History'}
            </h3>
            <p className="text-xs text-ink-3">
              {isBengali
                ? 'আপনার প্রেরিত ক্রেডিট রিকোয়েস্ট ও স্ট্যাটাস'
                : 'Your submitted payment requests and approval status'}
            </p>
          </div>
        </div>

        {isTrxLoading ? (
          <div className="py-8 flex justify-center">
            <LoadingSpinner size="md" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-card mb-card rounded-2xl p-8 text-center text-xs text-ink-3">
            {isBengali ? 'এখনও কোনো লেনদেনের তথ্য নেই।' : 'No transaction records found.'}
          </div>
        ) : (
          <div className="bg-card mb-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-elev border-b border-line text-ink-3 font-semibold">
                  <tr>
                    <th className="px-4 py-3">{isBengali ? 'তারিখ' : 'Date'}</th>
                    <th className="px-4 py-3">{isBengali ? 'প্যাকেজ' : 'Package'}</th>
                    <th className="px-4 py-3">{isBengali ? 'টাকার পরিমাণ' : 'Amount'}</th>
                    <th className="px-4 py-3">{isBengali ? 'মাধ্যম ও TrxID' : 'Method & TrxID'}</th>
                    <th className="px-4 py-3">{isBengali ? 'স্ট্যাটাস' : 'Status'}</th>
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
                        ? isBengali
                          ? 'অনুমোদিত'
                          : 'Completed'
                        : trx.status === 'rejected'
                        ? isBengali
                          ? 'প্রত্যাখ্যাত'
                          : 'Rejected'
                        : isBengali
                        ? 'অপেক্ষমান'
                        : 'Pending';

                    return (
                      <tr key={trx._id} className="hover:bg-brand-soft/40 transition-colors">
                        <td className="px-4 py-3 font-medium text-ink-2">
                          {trx.createdAt
                            ? new Date(trx.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US')
                            : '-'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-ink">
                          {isBengali ? formatNumber(trx.credits) : trx.credits}{' '}
                          {isBengali ? 'ক্রেডিট' : 'credits'}
                        </td>
                        <td className="px-4 py-3 font-bold text-brand">
                          ৳{isBengali ? formatNumber(trx.amountBDT) : trx.amountBDT}
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
