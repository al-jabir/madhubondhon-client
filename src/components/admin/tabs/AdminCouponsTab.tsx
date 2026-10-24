import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Ticket,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Copy,
  Calendar,
  Percent,
  Coins,
  Search,
  Sparkles,
  Edit2,
} from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { CouponItem } from '../../../types';
import { ConfirmationModal } from '../../common/ConfirmationModal';
import { toast } from 'sonner';
import { useLanguage } from '../../../i18n/LanguageContext';

export const AdminCouponsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponItem | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minPurchaseBDT, setMinPurchaseBDT] = useState<number>(0);
  const [maxDiscountBDT, setMaxDiscountBDT] = useState<number>(0);
  const [validUntil, setValidUntil] = useState('');
  const [usageLimit, setUsageLimit] = useState<number>(0);
  const [isActive, setIsActive] = useState(true);

  // Query all coupons
  const { data, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminApi.listCoupons(),
  });

  const coupons: CouponItem[] = data?.data?.coupons || [];

  // Filter
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Create / Update mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        minPurchaseBDT: minPurchaseBDT ? Number(minPurchaseBDT) : 0,
        maxDiscountBDT: maxDiscountBDT ? Number(maxDiscountBDT) : undefined,
        validUntil: validUntil || undefined,
        usageLimit: usageLimit ? Number(usageLimit) : undefined,
        isActive,
      };

      if (editingCoupon) {
        return adminApi.updateCoupon(editingCoupon._id, payload);
      } else {
        return adminApi.createCoupon(payload);
      }
    },
    onSuccess: () => {
      toast.success(
        editingCoupon
          ? (isBengali ? 'কুপন আপডেট সম্পন্ন!' : 'Coupon updated successfully!')
          : (isBengali ? 'নতুন কুপন যুক্ত করা হয়েছে!' : 'New coupon added successfully!')
      );
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'কুপন সংরক্ষণ করতে সমস্যা হয়েছে।' : 'Failed to save coupon.'));
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, currentActive }: { id: string; currentActive: boolean }) =>
      adminApi.updateCoupon(id, { isActive: !currentActive }),
    onSuccess: () => {
      toast.success(isBengali ? 'কুপন স্ট্যাটাস পরিবর্তিত হয়েছে' : 'Coupon status updated');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: () => toast.error(isBengali ? 'স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে' : 'Failed to update status'),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteCoupon(id),
    onSuccess: () => {
      toast.success(isBengali ? 'কুপনটি সফলভাবে মুছে ফেলা হয়েছে' : 'Coupon deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setDeleteTarget(null);
    },
    onError: () => toast.error(isBengali ? 'কুপন মুছে ফেলা সম্ভব হয়নি' : 'Could not delete coupon'),
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(10);
    setMinPurchaseBDT(0);
    setMaxDiscountBDT(0);
    setValidUntil('');
    setUsageLimit(0);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (coupon: CouponItem) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue);
    setMinPurchaseBDT(coupon.minPurchaseBDT || 0);
    setMaxDiscountBDT(coupon.maxDiscountBDT || 0);
    setValidUntil(coupon.validUntil ? coupon.validUntil.slice(0, 10) : '');
    setUsageLimit(coupon.usageLimit || 0);
    setIsActive(coupon.isActive);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success(isBengali ? `কুপন কোড "${text}" কপি হয়েছে` : `Coupon code "${text}" copied`);
  };

  // Stats
  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-line p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Ticket className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-ink">
              {isBengali ? 'কুপন ও প্রোমো কোড ম্যানেজমেন্ট' : 'Coupon & Promo Code Management'}
            </h1>
          </div>
          <p className="text-sm text-ink-3 mt-1">
            {isBengali
              ? 'ইউজারদের জন্য ছাড়, প্রমোশনাল অফার এবং ক্যাশব্যাক ভাউচার তৈরি ও নিয়ন্ত্রণ করুন'
              : 'Create and manage promotional discounts and coupon vouchers for users'}
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isBengali ? 'নতুন কুপন যোগ করুন' : 'Add New Coupon'}</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-line p-4 rounded-xl shadow-xs">
          <p className="text-xs text-ink-3">{isBengali ? 'মোট কুপন' : 'Total Coupons'}</p>
          <p className="text-2xl font-bold text-ink mt-1">
            {isBengali ? formatNumber(coupons.length) : coupons.length}
          </p>
        </div>
        <div className="bg-card border border-line p-4 rounded-xl shadow-xs">
          <p className="text-xs text-ink-3">{isBengali ? 'সক্রিয় কুপন' : 'Active Coupons'}</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {isBengali ? formatNumber(activeCount) : activeCount}
          </p>
        </div>
        <div className="bg-card border border-line p-4 rounded-xl shadow-xs">
          <p className="text-xs text-ink-3">{isBengali ? 'মোট ব্যবহার সংখ্যা' : 'Total Redemptions'}</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {isBengali ? `${formatNumber(totalUsed)} বার` : `${totalUsed} times`}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-3 bg-card border border-line px-3.5 py-2 rounded-xl">
        <Search className="w-4 h-4 text-ink-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isBengali ? 'কুপন কোড দিয়ে খুঁজুন...' : 'Search by coupon code...'}
          className="w-full bg-transparent text-sm focus:outline-hidden"
        />
      </div>

      {/* Coupon List Table */}
      <div className="bg-card border border-line rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-12 text-center text-ink-3 text-sm">
            {isBengali ? 'কুপন লোড হচ্ছে...' : 'Loading coupons...'}
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-12 text-center text-ink-3 text-sm">
            {isBengali ? 'কোনো কুপন কোড পাওয়া যায়নি।' : 'No coupons found.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/40 text-xs font-semibold text-ink-2 border-b border-line">
                <tr>
                  <th className="px-5 py-3.5">{isBengali ? 'কুপন কোড' : 'Coupon Code'}</th>
                  <th className="px-4 py-3.5">{isBengali ? 'ছাড়ের ধরন ও পরিমাণ' : 'Discount'}</th>
                  <th className="px-4 py-3.5">{isBengali ? 'শর্তসমূহ' : 'Conditions'}</th>
                  <th className="px-4 py-3.5">{isBengali ? 'মেয়াদ' : 'Validity'}</th>
                  <th className="px-4 py-3.5">{isBengali ? 'ব্যবহার' : 'Usage'}</th>
                  <th className="px-4 py-3.5">{isBengali ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="px-5 py-3.5 text-right">{isBengali ? 'অ্যাকশন' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredCoupons.map((coupon) => (
                  <tr key={coupon._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md tracking-wider">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyToClipboard(coupon.code)}
                          title={isBengali ? 'কোড কপি করুন' : 'Copy code'}
                          className="text-ink-3 hover:text-ink p-1 rounded-md cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 font-medium text-ink">
                        {coupon.discountType === 'percentage' ? (
                          <>
                            <Percent className="w-4 h-4 text-amber-500" />
                            <span>
                              {isBengali
                                ? `${formatNumber(coupon.discountValue)}% ছাড়`
                                : `${coupon.discountValue}% off`}
                            </span>
                          </>
                        ) : (
                          <>
                            <Coins className="w-4 h-4 text-emerald-500" />
                            <span>
                              {isBengali
                                ? `৳${formatNumber(coupon.discountValue)} ফ্ল্যাট ছাড়`
                                : `৳${coupon.discountValue} flat off`}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-3 space-y-0.5">
                      {coupon.minPurchaseBDT ? (
                        <div>
                          {isBengali
                            ? `ন্যূনতম প্যাকেজ: ৳${formatNumber(coupon.minPurchaseBDT)}`
                            : `Min order: ৳${coupon.minPurchaseBDT}`}
                        </div>
                      ) : (
                        <div>{isBengali ? 'কোনো ন্যূনতম লিমিট নেই' : 'No min order limit'}</div>
                      )}
                      {coupon.maxDiscountBDT && coupon.discountType === 'percentage' && (
                        <div>
                          {isBengali
                            ? `সর্বোচ্চ ছাড়: ৳${formatNumber(coupon.maxDiscountBDT)}`
                            : `Max discount: ৳${coupon.maxDiscountBDT}`}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-ink-3">
                      {coupon.validUntil ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {new Date(coupon.validUntil).toLocaleDateString(
                              isBengali ? 'bn-BD' : 'en-US'
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="text-emerald-600 font-medium">
                          {isBengali ? 'আজীবন কার্যকর' : 'Lifetime Valid'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <span className="font-semibold text-ink">
                        {isBengali ? formatNumber(coupon.usedCount || 0) : coupon.usedCount || 0}
                      </span>
                      {coupon.usageLimit ? (
                        <span className="text-ink-3">
                          {' '}
                          / {isBengali ? formatNumber(coupon.usageLimit) : coupon.usageLimit}{' '}
                          {isBengali ? 'বার' : 'times'}
                        </span>
                      ) : (
                        <span className="text-ink-3">
                          {' '}
                          ({isBengali ? 'সীমাহীন' : 'unlimited'})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() =>
                          toggleActiveMutation.mutate({
                            id: coupon._id,
                            currentActive: coupon.isActive,
                          })
                        }
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-colors cursor-pointer ${
                          coupon.isActive
                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500/20'
                        }`}
                      >
                        {coupon.isActive ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                            {isBengali ? 'সক্রিয়' : 'Active'}
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />{' '}
                            {isBengali ? 'নিষ্ক্রিয়' : 'Inactive'}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(coupon)}
                          className="p-1.5 rounded-lg text-ink-3 hover:text-ink hover:bg-muted cursor-pointer"
                          title={isBengali ? 'সম্পাদনা করুন' : 'Edit coupon'}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(coupon)}
                          className="p-1.5 rounded-lg text-ink-3 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                          title={isBengali ? 'মুছে ফেলুন' : 'Delete coupon'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create / Edit Coupon */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-card border border-line rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-lg font-bold text-ink flex items-center gap-2">
                <Ticket className="w-5 h-5 text-primary" />
                {editingCoupon
                  ? isBengali
                    ? 'কুপন সম্পাদনা'
                    : 'Edit Coupon'
                  : isBengali
                  ? 'নতুন কুপন তৈরি'
                  : 'Create New Coupon'}
              </h2>
              <button onClick={closeModal} className="text-ink-3 hover:text-ink cursor-pointer">
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali
                    ? 'কুপন কোড (যেমন: EID2026, SPECIAL50)'
                    : 'Coupon Code (e.g. EID2026, SPECIAL50)'}
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="PROMO10"
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 uppercase font-mono tracking-wider focus:outline-hidden focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1">
                    {isBengali ? 'ছাড়ের ধরন' : 'Discount Type'}
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-base border border-line rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary"
                  >
                    <option value="percentage">{isBengali ? 'শতাংশ (%)' : 'Percentage (%)'}</option>
                    <option value="fixed">{isBengali ? 'নির্দিষ্ট টাকা (৳)' : 'Fixed Amount (৳)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1">
                    {isBengali
                      ? `ছাড়ের মান ${discountType === 'percentage' ? '(%)' : '(৳)'}`
                      : `Discount Value ${discountType === 'percentage' ? '(%)' : '(৳)'}`}
                  </label>
                  <input
                    type="number"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    min="1"
                    className="w-full bg-base border border-line rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1">
                    {isBengali ? 'ন্যূনতম প্যাকেজ মূল্য (৳)' : 'Min Order Amount (৳)'}
                  </label>
                  <input
                    type="number"
                    value={minPurchaseBDT}
                    onChange={(e) => setMinPurchaseBDT(Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    className="w-full bg-base border border-line rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1">
                    {isBengali ? 'সর্বোচ্চ ছাড়ের সীমা (৳)' : 'Max Discount Cap (৳)'}
                  </label>
                  <input
                    type="number"
                    value={maxDiscountBDT}
                    onChange={(e) => setMaxDiscountBDT(Number(e.target.value))}
                    placeholder={isBengali ? 'ঐচ্ছিক' : 'Optional'}
                    min="0"
                    disabled={discountType === 'fixed'}
                    className="w-full bg-base border border-line rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1">
                    {isBengali ? 'মেয়াদ শেষ হওয়ার তারিখ' : 'Expiry Date'}
                  </label>
                  <input
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-base border border-line rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink-2 mb-1">
                    {isBengali ? 'ব্যবহারের সর্বোচ্চ সীমা' : 'Usage Limit'}
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(Number(e.target.value))}
                    placeholder={isBengali ? 'অসীম হলে 0' : '0 for unlimited'}
                    min="0"
                    className="w-full bg-base border border-line rounded-xl px-3 py-2 focus:outline-hidden focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-medium text-ink cursor-pointer">
                  {isBengali ? 'তৈরি হওয়ার সাথে সাথে সক্রিয় থাকবে' : 'Activate immediately upon creation'}
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-ink-3 hover:text-ink hover:bg-muted text-sm font-medium cursor-pointer"
              >
                {isBengali ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || !code.trim() || !discountValue}
                className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {saveMutation.isPending
                  ? isBengali
                    ? 'সংরক্ষণ হচ্ছে...'
                    : 'Saving...'
                  : editingCoupon
                  ? isBengali
                    ? 'আপডেট করুন'
                    : 'Update'
                  : isBengali
                  ? 'তৈরি করুন'
                  : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        title={isBengali ? 'কুপন মুছে ফেলা নিশ্চিত করুন' : 'Confirm Delete Coupon'}
        message={
          isBengali
            ? `আপনি কি নিশ্চিতভাবে "${deleteTarget?.code}" কুপনটি মুছে ফেলতে চান?`
            : `Are you sure you want to permanently delete coupon "${deleteTarget?.code}"?`
        }
        confirmText={isBengali ? 'মুছে ফেলুন' : 'Delete'}
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget._id)}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
