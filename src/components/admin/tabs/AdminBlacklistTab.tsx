import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Mail,
  Phone,
  Search,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { BlacklistItem } from '../../../types';
import { useLanguage } from '../../../i18n/LanguageContext';
import ConfirmationModal from '../../common/ConfirmationModal';

export const AdminBlacklistTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali } = useLanguage();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newType, setNewType] = useState<'phone' | 'email'>('phone');
  const [newValue, setNewValue] = useState('');
  const [newReason, setNewReason] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: blacklistData, isLoading } = useQuery({
    queryKey: ['admin-blacklist'],
    queryFn: () => adminApi.getBlacklist(),
  });

  const blacklist: BlacklistItem[] = blacklistData?.data?.blacklist || [];

  const addMutation = useMutation({
    mutationFn: () => adminApi.addToBlacklist({ type: newType, value: newValue, reason: newReason }),
    onSuccess: () => {
      toast.success(isBengali ? 'ব্ল্যাকলিস্টে সফলভাবে যুক্ত হয়েছে!' : 'Added to blacklist!');
      queryClient.invalidateQueries({ queryKey: ['admin-blacklist'] });
      setIsModalOpen(false);
      setNewValue('');
      setNewReason('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'যুক্ত করতে সমস্যা হয়েছে।');
    },
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => adminApi.removeFromBlacklist(id),
    onSuccess: () => {
      toast.success(isBengali ? 'ব্ল্যাকলিস্ট থেকে অপসারণ করা হয়েছে।' : 'Removed from blacklist.');
      queryClient.invalidateQueries({ queryKey: ['admin-blacklist'] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'সমস্যা হয়েছে।');
    },
  });

  const filtered = blacklist.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return item.value.toLowerCase().includes(q) || item.reason.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <span>{isBengali ? 'প্রতারক ও স্প্যাম ব্ল্যাকলিস্ট (Blacklist Control)' : 'Fraud & Spam Blacklist'}</span>
          </h2>
          <p className="text-xs text-ink-3 mt-1">
            {isBengali
              ? 'ভুয়া অ্যাকাউন্ট বা প্রতারক ব্যক্তিদের ফোন ও ইমেইল পার্মানেন্ট ব্লক করুন।'
              : 'Permanently block suspicious phone numbers and emails from registering or submitting.'}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mb-btn-primary !text-xs py-2.5 px-4 rounded-xl cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto bg-rose-600 hover:bg-rose-700 text-white"
        >
          <Plus className="w-4 h-4" />
          <span>{isBengali ? 'নতুন ব্লক এন্ট্রি' : 'Block Number / Email'}</span>
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-line">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBengali ? 'নম্বর বা কারণ দিয়ে খুঁজুন...' : 'Search blocked values...'}
            className="mb-input w-full pl-8 text-xs py-1.5"
          />
        </div>
        <span className="text-xs font-bold text-ink-3 whitespace-nowrap">
          {isBengali ? `মোট ব্লকড: ${filtered.length} টি` : `Total Blocked: ${filtered.length}`}
        </span>
      </div>

      {/* Table / List */}
      <div className="mb-card rounded-2xl border border-line overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-ink-3 text-xs">
            {isBengali ? 'ব্ল্যাকলিস্ট লোড হচ্ছে...' : 'Loading blacklist...'}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-ink-3 space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto opacity-70" />
            <h4 className="text-sm font-bold text-ink">
              {isBengali ? 'ব্ল্যাকলিস্টে কোনো এন্ট্রি নেই' : 'No blacklisted entries'}
            </h4>
            <p className="text-xs">
              {isBengali
                ? 'সন্দেহভাজন কাউকে ব্লক করতে উপরের বাটনে ক্লিক করুন।'
                : 'Click above to block a suspicious contact.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-elev border-b border-line text-ink-3 uppercase text-[10.5px] font-black">
                <tr>
                  <th className="p-3.5 pl-5">{isBengali ? 'টাইপ' : 'Type'}</th>
                  <th className="p-3.5">{isBengali ? 'ব্লকড নম্বর / ইমেইল' : 'Value'}</th>
                  <th className="p-3.5">{isBengali ? 'ব্লকের কারণ' : 'Reason'}</th>
                  <th className="p-3.5">{isBengali ? 'তারিখ' : 'Date'}</th>
                  <th className="p-3.5 text-right pr-5">{isBengali ? 'অ্যাকশন' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((item) => (
                  <tr key={item._id} className="hover:bg-elev/50 transition-colors">
                    <td className="p-3.5 pl-5">
                      <span className="inline-flex items-center gap-1 font-bold text-ink-2">
                        {item.type === 'phone' ? (
                          <Phone className="w-3.5 h-3.5 text-brand" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-gold" />
                        )}
                        <span className="capitalize">{item.type}</span>
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-ink">{item.value}</td>
                    <td className="p-3.5 text-ink-2 max-w-xs">{item.reason}</td>
                    <td className="p-3.5 text-ink-3 font-mono text-[11px]">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right pr-5">
                      <button
                        onClick={() => setDeleteId(item._id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        {isBengali ? 'আনব্লক' : 'Unblock'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-line rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>{isBengali ? 'ব্ল্যাকলিস্টে যুক্ত করুন' : 'Add to Blacklist'}</span>
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
                addMutation.mutate();
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="space-y-1">
                <label className="font-bold text-ink">{isBengali ? 'ব্লকের ধরন' : 'Block Type'}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('phone')}
                    className={`py-2 px-3 rounded-xl font-bold border cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                      newType === 'phone'
                        ? 'bg-brand text-white border-brand'
                        : 'bg-elev border-line text-ink-2'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'মোবাইল নম্বর' : 'Phone'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('email')}
                    className={`py-2 px-3 rounded-xl font-bold border cursor-pointer flex items-center justify-center gap-1.5 transition-all ${
                      newType === 'email'
                        ? 'bg-brand text-white border-brand'
                        : 'bg-elev border-line text-ink-2'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'ইমেইল ঠিকানা' : 'Email'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">
                  {newType === 'phone'
                    ? isBengali
                      ? 'মোবাইল নম্বর (যেমন: 017XXXXXXXX)'
                      : 'Phone Number'
                    : isBengali
                    ? 'ইমেইল ঠিকানা'
                    : 'Email Address'}
                </label>
                <input
                  required
                  type={newType === 'email' ? 'email' : 'text'}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={newType === 'phone' ? '01712345678' : 'scammer@example.com'}
                  className="mb-input w-full font-mono text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">{isBengali ? 'ব্লক করার কারণ' : 'Reason for Blocking'}</label>
                <textarea
                  required
                  rows={3}
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  placeholder={isBengali ? 'যেমন: একাধিক ভুয়া রিপোর্ট, ভুয়া অভিভাবক নম্বর...' : 'State reason...'}
                  className="mb-input w-full text-xs"
                />
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
                  disabled={addMutation.isPending || !newValue.trim() || !newReason.trim()}
                  className="mb-btn-primary px-5 py-2 cursor-pointer bg-rose-600 hover:bg-rose-700"
                >
                  {isBengali ? 'ব্লক করুন' : 'Confirm Block'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmationModal
          isOpen={!!deleteId}
          title={isBengali ? 'আনব্লক করতে চান?' : 'Unblock Contact?'}
          message={isBengali ? 'এই নম্বর/ইমেইলটি আর নিষিদ্ধ থাকবে না।' : 'This contact will be allowed to access again.'}
          confirmText={isBengali ? 'হ্যাঁ, আনব্লক করুন' : 'Unblock'}
          isLoading={removeMutation.isPending}
          onConfirm={() => removeMutation.mutate(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default AdminBlacklistTab;
