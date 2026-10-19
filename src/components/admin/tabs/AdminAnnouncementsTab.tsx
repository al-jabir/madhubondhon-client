import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  Pin,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { AnnouncementItem } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';
import ConfirmationModal from '../../common/ConfirmationModal';
import { useLanguage } from '../../../i18n/LanguageContext';

export const AdminAnnouncementsTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali } = useLanguage();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AnnouncementItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [targetAudience, setTargetAudience] = useState<'all' | 'customer' | 'unregistered'>('all');
  const [isPinned, setIsPinned] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Query
  const { data: annData, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: () => adminApi.listAnnouncements(),
  });

  // Save Mutation (Create or Update)
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        priority,
        targetAudience,
        isPinned,
        isActive,
      };

      if (editingItem) {
        return adminApi.updateAnnouncement(editingItem._id, payload);
      } else {
        return adminApi.createAnnouncement(payload);
      }
    },
    onSuccess: () => {
      toast.success(
        editingItem
          ? (isBengali ? 'ঘোষণা সফলভাবে আপডেট হয়েছে।' : 'Announcement updated successfully.')
          : (isBengali ? 'নতুন ঘোষণা সফলভাবে প্রকাশিত হয়েছে।' : 'New announcement published successfully.')
      );
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['public-announcements'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save announcement.'));
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteAnnouncement(id),
    onSuccess: () => {
      toast.success(isBengali ? 'ঘোষণাটি সফলভাবে মুছে ফেলা হয়েছে।' : 'Announcement deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['public-announcements'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'মুছে ফেলা যায়নি।' : 'Could not delete announcement.'));
    },
  });

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setContent('');
    setPriority('medium');
    setTargetAudience('all');
    setIsPinned(false);
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (item: AnnouncementItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setContent(item.content);
    setPriority(item.priority);
    setTargetAudience(item.targetAudience);
    setIsPinned(item.isPinned);
    setIsActive(item.isActive);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const announcementsList = annData?.data?.announcements || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-brand" />
            <span>{isBengali ? 'নোটিশ ও ঘোষণা ব্যবস্থাপনা (Announcements & Alerts)' : 'Announcements & Alerts Management'}</span>
          </h2>
          <p className="text-xs text-ink-3">
            {isBengali
              ? 'ওয়েবসাইটের শীর্ষ ব্যানার ও সদস্যদের জন্য নোটিশবোর্ডে জরুরি বার্তা প্রকাশ করুন'
              : 'Publish urgent alerts, banner messages, and member notices across the website'}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:bg-brand-strong cursor-pointer shadow-md shadow-brand/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isBengali ? 'নতুন ঘোষণা তৈরি করুন' : 'Create Announcement'}</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label={isBengali ? 'ঘোষণা লোড হচ্ছে...' : 'Loading announcements...'} />
          </div>
        ) : announcementsList.length === 0 ? (
          <div className="mb-card py-16 text-center text-ink-3 space-y-2">
            <Megaphone className="w-10 h-10 mx-auto text-ink-3/40" />
            <p className="text-sm font-bold">{isBengali ? 'বর্তমানে কোনো সক্রিয় ঘোষণা নেই' : 'No announcements currently'}</p>
            <p className="text-xs">{isBengali ? 'নতুন বার্তা প্রকাশ করতে উপরের বাটনে ক্লিক করুন।' : 'Click the button above to publish an announcement.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {announcementsList.map((ann: AnnouncementItem) => (
              <div
                key={ann._id}
                className={`mb-card p-5 space-y-3 border-l-4 transition-all ${
                  ann.priority === 'urgent'
                    ? 'border-l-red-500'
                    : ann.priority === 'high'
                    ? 'border-l-amber-500'
                    : 'border-l-brand'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    {ann.isPinned && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        <Pin className="w-3 h-3 fill-current" />
                        {isBengali ? 'পিন করা' : 'Pinned'}
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        ann.priority === 'urgent'
                          ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                          : ann.priority === 'high'
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                          : 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      {ann.priority}
                    </span>
                    <span className="text-[11px] text-ink-3 font-semibold">
                      {isBengali ? 'প্রাপক: ' : 'Audience: '}
                      <strong>{ann.targetAudience === 'all' ? (isBengali ? 'সকল ভিজিটর' : 'All Visitors') : ann.targetAudience}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        ann.isActive
                          ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                          : 'bg-elev text-ink-3'
                      }`}
                    >
                      {ann.isActive
                        ? (isBengali ? 'প্রকাশিত (Active)' : 'Active')
                        : (isBengali ? 'খসড়া (Inactive)' : 'Inactive')}
                    </span>

                    <button
                      type="button"
                      onClick={() => openEditModal(ann)}
                      className="p-1.5 rounded-lg border border-line bg-elev hover:bg-brand-soft hover:text-brand-ink text-ink-2 cursor-pointer transition-colors"
                      title={isBengali ? 'সম্পাদনা' : 'Edit'}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(ann)}
                      className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
                      title={isBengali ? 'মুছে ফেলুন' : 'Delete'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-ink">{ann.title}</h3>
                  <p className="text-xs text-ink-2 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                </div>

                <div className="text-[10px] text-ink-3 pt-2">
                  {isBengali ? 'প্রকাশ: ' : 'Published: '}
                  {new Date(ann.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="mb-card max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-brand" />
                <span>
                  {editingItem
                    ? (isBengali ? 'ঘোষণা সম্পাদনা' : 'Edit Announcement')
                    : (isBengali ? 'নতুন ঘোষণা প্রকাশ' : 'Publish New Announcement')}
                </span>
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'শিরোনাম (Title):' : 'Title:'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={isBengali ? 'যেমন: ঈদ উপলক্ষে নতুন অফার বা সিস্টেম মেইন্টেন্যান্স...' : 'e.g. System maintenance notice or greetings...'}
                  className="mb-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'বিবরণ (Content):' : 'Content:'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={isBengali ? 'বিস্তারিত ঘোষণা লিখুন...' : 'Enter announcement content...'}
                  className="mb-input text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-ink mb-1">
                    {isBengali ? 'গুরুত্ব (Priority):' : 'Priority:'}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mb-input text-xs"
                  >
                    <option value="low">{isBengali ? 'সাধারণ (Low)' : 'Low'}</option>
                    <option value="medium">{isBengali ? 'মাঝারি (Medium)' : 'Medium'}</option>
                    <option value="high">{isBengali ? 'উচ্চ (High)' : 'High'}</option>
                    <option value="urgent">{isBengali ? 'জরুরি সতর্কতা (Urgent)' : 'Urgent'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-ink mb-1">
                    {isBengali ? 'লক্ষ্য দর্শক (Audience):' : 'Audience:'}
                  </label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="mb-input text-xs"
                  >
                    <option value="all">{isBengali ? 'সকল ভিজিটর (All)' : 'All Visitors'}</option>
                    <option value="customer">{isBengali ? 'কেবল নিবন্ধিত পাত্র-পাত্রী' : 'Registered Members Only'}</option>
                    <option value="unregistered">{isBengali ? 'অনিবন্ধিত ভিজিটর' : 'Unregistered Visitors'}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={isPinned}
                    onChange={(e) => setIsPinned(e.target.checked)}
                    className="rounded text-brand"
                  />
                  <span>{isBengali ? 'শীর্ষে পিন করে রাখুন' : 'Pin to Top'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-semibold text-ink">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-brand"
                  />
                  <span>{isBengali ? 'সরাসরি প্রকাশ করুন (Active)' : 'Active (Published)'}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 font-bold rounded-xl border border-line hover:bg-elev cursor-pointer text-ink-2"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending || !title.trim() || !content.trim()}
                  className="px-4 py-2 font-bold rounded-xl bg-brand text-white hover:bg-brand-strong disabled:opacity-50 cursor-pointer shadow-md shadow-brand/20"
                >
                  {saveMutation.isPending
                    ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                    : editingItem
                    ? (isBengali ? 'আপডেট করুন' : 'Update')
                    : (isBengali ? 'প্রকাশ করুন' : 'Publish')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget._id, {
              onSettled: () => setDeleteTarget(null),
            });
          }
        }}
        title={isBengali ? 'ঘোষণা মুছে ফেলা' : 'Delete Announcement'}
        message={
          isBengali
            ? `আপনি কি নিশ্চিতভাবে "${deleteTarget?.title}" ঘোষণাটি মুছে ফেলতে চান? এটি আর ওয়েবসাইটে দেখা যাবে না।`
            : `Are you sure you want to delete the announcement "${deleteTarget?.title}"? It will no longer appear on the website.`
        }
        confirmText={isBengali ? 'মুছে ফেলুন' : 'Delete'}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminAnnouncementsTab;
