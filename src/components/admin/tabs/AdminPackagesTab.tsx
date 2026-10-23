import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  XCircle,
  Coins,
  CreditCard,
  Sparkles,
  Smartphone,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { AdminPackageItem } from '../../../types';
import { useLanguage } from '../../../i18n/LanguageContext';
import ConfirmationModal from '../../common/ConfirmationModal';

export const AdminPackagesTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();

  // State for package modal
  const [editingPkg, setEditingPkg] = useState<Partial<AdminPackageItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // State for payment instructions
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [bkashNum, setBkashNum] = useState('');
  const [bkashType, setBkashType] = useState('');
  const [nagadNum, setNagadNum] = useState('');
  const [nagadType, setNagadType] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  // Fetch Packages
  const { data: pkgData, isLoading } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => adminApi.adminListPackages(),
  });

  // Fetch Settings for Instructions
  const { data: settingsData } = useQuery({
    queryKey: ['admin-settings-instructions'],
    queryFn: async () => {
      const res = await adminApi.getSettings();
      const s = res.data?.settings;
      if (s) {
        setBkashNum(s.bkashNumber || '01700-000000');
        setBkashType(s.bkashType || 'Send Money / Personal');
        setNagadNum(s.nagadNumber || '01700-000000');
        setNagadType(s.nagadType || 'Send Money / Personal');
        setPaymentNote(s.paymentInstructions || '');
      }
      return s;
    },
  });

  const packages = pkgData?.data?.packages || [];

  // Create/Update Package Mutation
  const savePkgMutation = useMutation({
    mutationFn: (pkg: Partial<AdminPackageItem>) => {
      if (pkg._id) {
        return adminApi.adminUpdatePackage(pkg._id, pkg);
      }
      return adminApi.adminCreatePackage(pkg);
    },
    onSuccess: () => {
      toast.success(isBengali ? 'প্যাকেজ সফলভাবে সংরক্ষিত হয়েছে!' : 'Package saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      queryClient.invalidateQueries({ queryKey: ['credit-packages'] });
      setIsModalOpen(false);
      setEditingPkg(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    },
  });

  // Delete Package Mutation
  const deletePkgMutation = useMutation({
    mutationFn: (id: string) => adminApi.adminDeletePackage(id),
    onSuccess: () => {
      toast.success(isBengali ? 'প্যাকেজ মুছে ফেলা হয়েছে।' : 'Package deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      queryClient.invalidateQueries({ queryKey: ['credit-packages'] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'সমস্যা হয়েছে।');
    },
  });

  // Save Instructions Mutation
  const saveInstructionsMutation = useMutation({
    mutationFn: () =>
      adminApi.adminUpdatePaymentInstructions({
        bkashNumber: bkashNum,
        bkashType,
        nagadNumber: nagadNum,
        nagadType,
        paymentInstructions: paymentNote,
      }),
    onSuccess: () => {
      toast.success(isBengali ? 'পেমেন্ট নম্বর ও নির্দেশনা আপডেট হয়েছে!' : 'Payment instructions updated!');
      queryClient.invalidateQueries({ queryKey: ['admin-settings-instructions'] });
      queryClient.invalidateQueries({ queryKey: ['credit-packages'] });
      setIsEditingInstructions(false);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'সমস্যা হয়েছে।');
    },
  });

  const openNewPackageModal = () => {
    setEditingPkg({
      packageId: '',
      title: '',
      credits: 5,
      priceBDT: 350,
      savings: '',
      badge: '',
      features: ['আজীবন মেয়াদ', 'যেকোনো সময় ব্যবহারযোগ্য'],
      isActive: true,
      sortOrder: packages.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditPackageModal = (p: AdminPackageItem) => {
    setEditingPkg({ ...p });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <Coins className="w-5 h-5 text-brand" />
            <span>{isBengali ? 'যোগাযোগ ক্রেডিট ও প্যাকেজ ব্যবস্থাপনা' : 'Credit Packages & Pricing'}</span>
          </h2>
          <p className="text-xs text-ink-3 mt-1">
            {isBengali
              ? 'ইউজারদের অভিভাবকের যোগাযোগ নম্বর দেখতে প্রয়োজনীয় ক্রেডিট প্যাকেজ এবং মূল্য নির্ধারণ করুন।'
              : 'Manage credit packages, prices, and receiver payment methods.'}
          </p>
        </div>
        <button
          onClick={openNewPackageModal}
          className="mb-btn-primary !text-xs py-2.5 px-4 rounded-xl cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isBengali ? 'নতুন প্যাকেজ যোগ করুন' : 'Add New Package'}</span>
        </button>
      </div>

      {/* Package Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-ink-3">
            {isBengali ? 'প্যাকেজ লোড হচ্ছে...' : 'Loading packages...'}
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-full py-12 text-center text-ink-3 mb-card rounded-2xl p-8">
            {isBengali ? 'কোনো প্যাকেজ নেই। নতুন প্যাকেজ যোগ করুন।' : 'No packages found.'}
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`mb-card rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                pkg.isActive ? 'border-line hover:border-brand/30' : 'border-line/60 opacity-60 bg-elev/30'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <span className="text-[10.5px] font-mono text-ink-3 uppercase tracking-wider">
                      ID: {pkg.packageId}
                    </span>
                    <h3 className="text-base font-bold text-ink">{pkg.title}</h3>
                  </div>
                  {pkg.badge && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-soft text-gold border border-gold/30">
                      <Sparkles className="w-3 h-3" />
                      {pkg.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2 py-2 border-y border-line/60">
                  <span className="text-2xl font-black text-brand">
                    ৳{isBengali ? formatNumber(pkg.priceBDT) : pkg.priceBDT}
                  </span>
                  <span className="text-xs font-semibold text-ink-2">
                    / {isBengali ? formatNumber(pkg.credits) : pkg.credits} {isBengali ? 'ক্রেডিট' : 'credits'}
                  </span>
                </div>

                {pkg.savings && (
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    ✓ {pkg.savings}
                  </p>
                )}

                {pkg.features && pkg.features.length > 0 && (
                  <ul className="text-xs text-ink-2 space-y-1 pt-1">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand/60 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-line/60">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                    pkg.isActive
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {pkg.isActive ? (isBengali ? 'চালু' : 'Active') : (isBengali ? 'বন্ধ' : 'Inactive')}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditPackageModal(pkg)}
                    title={isBengali ? 'সম্পাদনা' : 'Edit'}
                    className="p-1.5 rounded-lg text-ink-2 hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(pkg._id)}
                    title={isBengali ? 'মুছে ফেলুন' : 'Delete'}
                    className="p-1.5 rounded-lg text-ink-3 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Receiver Instructions Config */}
      <div className="mb-card rounded-2xl p-6 space-y-5 border border-line">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-line">
          <div>
            <h3 className="text-base font-bold text-ink flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-brand" />
              <span>{isBengali ? 'পেমেন্ট গ্রহণের নম্বর ও নির্দেশনা' : 'Payment Receiving Details'}</span>
            </h3>
            <p className="text-xs text-ink-3 mt-0.5">
              {isBengali
                ? 'ইউজাররা যে বিকাশ ও নগদ নম্বরে টাকা পাঠাবে তা এখানে আপডেট করুন।'
                : 'Configure official bKash/Nagad accounts displayed on the purchase page.'}
            </p>
          </div>
          {!isEditingInstructions ? (
            <button
              onClick={() => setIsEditingInstructions(true)}
              className="mb-btn-secondary !text-xs py-2 px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{isBengali ? 'নম্বর পরিবর্তন করুন' : 'Edit Details'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                disabled={saveInstructionsMutation.isPending}
                onClick={() => saveInstructionsMutation.mutate()}
                className="mb-btn-primary !text-xs py-2 px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isBengali ? 'সংরক্ষণ' : 'Save'}</span>
              </button>
              <button
                onClick={() => setIsEditingInstructions(false)}
                className="mb-btn-secondary !text-xs py-2 px-3 rounded-xl cursor-pointer"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-2">{isBengali ? 'বিকাশ নম্বর:' : 'bKash Number:'}</label>
            <input
              disabled={!isEditingInstructions}
              type="text"
              value={bkashNum}
              onChange={(e) => setBkashNum(e.target.value)}
              className="mb-input w-full text-xs font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-2">{isBengali ? 'বিকাশ টাইপ:' : 'bKash Type:'}</label>
            <input
              disabled={!isEditingInstructions}
              type="text"
              value={bkashType}
              onChange={(e) => setBkashType(e.target.value)}
              className="mb-input w-full text-xs"
              placeholder="Send Money / Personal"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-2">{isBengali ? 'নগদ নম্বর:' : 'Nagad Number:'}</label>
            <input
              disabled={!isEditingInstructions}
              type="text"
              value={nagadNum}
              onChange={(e) => setNagadNum(e.target.value)}
              className="mb-input w-full text-xs font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-ink-2">{isBengali ? 'নগদ টাইপ:' : 'Nagad Type:'}</label>
            <input
              disabled={!isEditingInstructions}
              type="text"
              value={nagadType}
              onChange={(e) => setNagadType(e.target.value)}
              className="mb-input w-full text-xs"
              placeholder="Send Money / Personal"
            />
          </div>
          <div className="col-span-full space-y-1.5">
            <label className="text-xs font-bold text-ink-2">{isBengali ? 'পেমেন্ট নির্দেশনা বার্তা:' : 'Instructions Note:'}</label>
            <textarea
              disabled={!isEditingInstructions}
              rows={2}
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              className="mb-input w-full text-xs"
            />
          </div>
        </div>
      </div>

      {/* Package Create/Edit Modal */}
      {isModalOpen && editingPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-line rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-ink">
                {editingPkg._id
                  ? isBengali
                    ? 'প্যাকেজ সম্পাদনা'
                    : 'Edit Package'
                  : isBengali
                  ? 'নতুন প্যাকেজ যোগ'
                  : 'Add Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-ink-3 hover:text-ink cursor-pointer p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                savePkgMutation.mutate(editingPkg);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'প্যাকেজ Slug ID' : 'Package ID'}</label>
                  <input
                    required
                    disabled={!!editingPkg._id}
                    type="text"
                    value={editingPkg.packageId || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, packageId: e.target.value })}
                    placeholder="e.g. starter, premium"
                    className="mb-input w-full font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'প্যাকেজের নাম' : 'Title'}</label>
                  <input
                    required
                    type="text"
                    value={editingPkg.title || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, title: e.target.value })}
                    placeholder="e.g. প্রিমিয়াম প্যাক"
                    className="mb-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'ক্রেডিট সংখ্যা' : 'Credits'}</label>
                  <input
                    required
                    min={1}
                    type="number"
                    value={editingPkg.credits || 0}
                    onChange={(e) => setEditingPkg({ ...editingPkg, credits: Number(e.target.value) })}
                    className="mb-input w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'মূল্য (টাকা)' : 'Price (BDT)'}</label>
                  <input
                    required
                    min={0}
                    type="number"
                    value={editingPkg.priceBDT || 0}
                    onChange={(e) => setEditingPkg({ ...editingPkg, priceBDT: Number(e.target.value) })}
                    className="mb-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'ব্যাজ (ঐচ্ছিক)' : 'Badge (Optional)'}</label>
                  <input
                    type="text"
                    value={editingPkg.badge || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, badge: e.target.value })}
                    placeholder="e.g. জনপ্রিয়, সেরা মান"
                    className="mb-input w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'সেভিংস টেক্সট' : 'Savings Note'}</label>
                  <input
                    type="text"
                    value={editingPkg.savings || ''}
                    onChange={(e) => setEditingPkg({ ...editingPkg, savings: e.target.value })}
                    placeholder="e.g. ৫০ টাকা প্রতি যোগাযোগ"
                    className="mb-input w-full"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">
                  {isBengali ? 'ফিচারসমূহ (কমা দিয়ে আলাদা করুন)' : 'Features (comma separated)'}
                </label>
                <input
                  type="text"
                  value={(editingPkg.features || []).join(', ')}
                  onChange={(e) =>
                    setEditingPkg({
                      ...editingPkg,
                      features: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  placeholder="৫টি বায়োডাটার নম্বর, আজীবন মেয়াদ"
                  className="mb-input w-full"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-ink">
                  <input
                    type="checkbox"
                    checked={editingPkg.isActive !== false}
                    onChange={(e) => setEditingPkg({ ...editingPkg, isActive: e.target.checked })}
                    className="rounded text-brand focus:ring-brand"
                  />
                  <span>{isBengali ? 'প্যাকেজটি সক্রিয় রাখুন' : 'Active'}</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mb-btn-secondary px-4 py-2 cursor-pointer"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={savePkgMutation.isPending}
                  className="mb-btn-primary px-5 py-2 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isBengali ? 'সংরক্ষণ করুন' : 'Save Package'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <ConfirmationModal
          isOpen={!!deleteId}
          title={isBengali ? 'প্যাকেজ মুছে ফেলতে চান?' : 'Delete Package?'}
          message={isBengali ? 'এই প্যাকেজটি ডিলিট করলে ইউজাররা আর এটি কিনতে পারবেন না।' : 'Users will no longer be able to purchase this package.'}
          confirmText={isBengali ? 'হ্যাঁ, মুছুন' : 'Delete'}
          variant="danger"
          isLoading={deletePkgMutation.isPending}
          onConfirm={() => deletePkgMutation.mutate(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default AdminPackagesTab;
