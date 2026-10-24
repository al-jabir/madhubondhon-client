import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  Plus,
  Edit2,
  Trash2,
  Save,
  CheckCircle2,
  Calendar,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { SuccessStoryItem } from '../../../types';
import { useLanguage } from '../../../i18n/LanguageContext';
import { TANGAIL_UPAZILAS, getUpazilaDisplayName } from '../../../constants/locations';
import ConfirmationModal from '../../common/ConfirmationModal';

export const AdminSuccessStoriesTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali } = useLanguage();

  const [editingStory, setEditingStory] = useState<Partial<SuccessStoryItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: storiesData, isLoading } = useQuery({
    queryKey: ['admin-success-stories'],
    queryFn: () => adminApi.adminListSuccessStories(),
  });

  const stories = storiesData?.data?.stories || [];

  const saveMutation = useMutation({
    mutationFn: (story: Partial<SuccessStoryItem>) => {
      if (story._id) {
        return adminApi.adminUpdateSuccessStory(story._id, story);
      }
      return adminApi.adminCreateSuccessStory(story);
    },
    onSuccess: () => {
      toast.success(isBengali ? 'সফল বিবাহের রেকর্ড সংরক্ষিত হয়েছে!' : 'Success story saved!');
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      setIsModalOpen(false);
      setEditingStory(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || (isBengali ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save.'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.adminDeleteSuccessStory(id),
    onSuccess: () => {
      toast.success(isBengali ? 'রেকর্ড মুছে ফেলা হয়েছে।' : 'Record deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-success-stories'] });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || (isBengali ? 'সমস্যা হয়েছে।' : 'An error occurred.'));
    },
  });

  const openNewStoryModal = () => {
    setEditingStory({
      groomName: '',
      brideName: '',
      groomBiodataId: '',
      brideBiodataId: '',
      marriageDate: new Date().toISOString().slice(0, 10),
      upazila: 'tangail_sadar',
      story: '',
      isPublished: true,
      sortOrder: 1,
    });
    setIsModalOpen(true);
  };

  const openEditStoryModal = (s: SuccessStoryItem) => {
    setEditingStory({
      ...s,
      marriageDate: s.marriageDate ? new Date(s.marriageDate).toISOString().slice(0, 10) : '',
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <span>{isBengali ? 'সফল বিবাহ ও গল্পসমূহ (Success Stories)' : 'Success Stories & Match Records'}</span>
          </h2>
          <p className="text-xs text-ink-3 mt-1">
            {isBengali
              ? 'মধুবন্ধনের মাধ্যমে বিবাহ সম্পন্ন হওয়া পাত্র-পাত্রীদের রেকর্ড ও অনুভূতি প্রকাশ করুন।'
              : 'Record confirmed marriages and testimonials achieved through MadhuBondhon.'}
          </p>
        </div>
        <button
          onClick={openNewStoryModal}
          className="mb-btn-primary !text-xs py-2.5 px-4 rounded-xl cursor-pointer inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isBengali ? 'নতুন সফল বিবাহ রেকর্ড' : 'Record New Match'}</span>
        </button>
      </div>

      {/* Stories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-ink-3">
            {isBengali ? 'রেকর্ড লোড হচ্ছে...' : 'Loading records...'}
          </div>
        ) : stories.length === 0 ? (
          <div className="col-span-full py-12 text-center text-ink-3 mb-card rounded-2xl p-8 space-y-2">
            <Heart className="w-10 h-10 text-rose-300 mx-auto" />
            <h3 className="text-sm font-bold text-ink">
              {isBengali ? 'কোনো সফল বিবাহের রেকর্ড যোগ করা হয়নি' : 'No success stories yet'}
            </h3>
            <p className="text-xs">
              {isBengali
                ? 'উপরের বাটনে ক্লিক করে প্রথম সফল বিবাহের গল্প যোগ করুন।'
                : 'Click above to record your first success story.'}
            </p>
          </div>
        ) : (
          stories.map((item) => (
            <div
              key={item._id}
              className="mb-card rounded-2xl p-5 flex flex-col justify-between border border-line hover:border-brand/30 transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center font-bold text-sm">
                      💍
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-ink">
                        {item.groomName} & {item.brideName}
                      </h3>
                      <p className="text-[11px] text-ink-3 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3 h-3 text-brand" />
                        <span>{getUpazilaDisplayName(item.upazila, isBengali)}</span>
                        {item.marriageDate && (
                          <>
                            <span>•</span>
                            <Calendar className="w-3 h-3 text-ink-3" />
                            <span>{new Date(item.marriageDate).toLocaleDateString()}</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.isPublished
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-elev text-ink-3'
                    }`}
                  >
                    {item.isPublished ? (isBengali ? 'প্রকাশিত' : 'Published') : (isBengali ? 'অপ্রকাশিত' : 'Draft')}
                  </span>
                </div>

                <p className="text-xs text-ink-2 line-clamp-4 leading-relaxed bg-elev/50 p-3 rounded-xl italic">
                  "{item.story}"
                </p>

                {(item.groomBiodataId || item.brideBiodataId) && (
                  <div className="flex gap-2 text-[10.5px] font-mono text-ink-3">
                    {item.groomBiodataId && <span>{isBengali ? 'পাত্র:' : 'Groom:'} {item.groomBiodataId}</span>}
                    {item.brideBiodataId && <span>{isBengali ? 'পাত্রী:' : 'Bride:'} {item.brideBiodataId}</span>}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line/60">
                <button
                  onClick={() => openEditStoryModal(item)}
                  title={isBengali ? 'সম্পাদনা' : 'Edit'}
                  className="p-1.5 rounded-lg text-ink-2 hover:text-brand hover:bg-brand-soft transition-colors cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteId(item._id)}
                  title={isBengali ? 'মুছে ফেলুন' : 'Delete'}
                  className="p-1.5 rounded-lg text-ink-3 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && editingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-card border border-line rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-ink">
                {editingStory._id
                  ? isBengali
                    ? 'সফল বিবাহ সম্পাদনা'
                    : 'Edit Match Record'
                  : isBengali
                  ? 'নতুন সফল বিবাহ রেকর্ড'
                  : 'Record New Match'}
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
                saveMutation.mutate(editingStory);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'পাত্রের নাম' : 'Groom Name'}</label>
                  <input
                    required
                    type="text"
                    value={editingStory.groomName || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, groomName: e.target.value })}
                    placeholder="e.g. মোহাম্মদ আব্দুল্লাহ"
                    className="mb-input w-full"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'পাত্রীর নাম' : 'Bride Name'}</label>
                  <input
                    required
                    type="text"
                    value={editingStory.brideName || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, brideName: e.target.value })}
                    placeholder="e.g. ফাতেমা আক্তার"
                    className="mb-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'উপজেলা' : 'Upazila'}</label>
                  <select
                    value={editingStory.upazila || 'tangail_sadar'}
                    onChange={(e) => setEditingStory({ ...editingStory, upazila: e.target.value })}
                    className="mb-input w-full"
                  >
                    {TANGAIL_UPAZILAS.map((u) => (
                      <option key={u} value={u}>
                        {getUpazilaDisplayName(u, isBengali)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'বিবাহের তারিখ' : 'Marriage Date'}</label>
                  <input
                    type="date"
                    value={editingStory.marriageDate ? String(editingStory.marriageDate).slice(0, 10) : ''}
                    onChange={(e) => setEditingStory({ ...editingStory, marriageDate: e.target.value })}
                    className="mb-input w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'পাত্রের বায়োডাটা ID (ঐচ্ছিক)' : 'Groom Biodata ID'}</label>
                  <input
                    type="text"
                    value={editingStory.groomBiodataId || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, groomBiodataId: e.target.value })}
                    placeholder="MB-G102"
                    className="mb-input w-full font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-ink">{isBengali ? 'পাত্রীর বায়োডাটা ID (ঐচ্ছিক)' : 'Bride Biodata ID'}</label>
                  <input
                    type="text"
                    value={editingStory.brideBiodataId || ''}
                    onChange={(e) => setEditingStory({ ...editingStory, brideBiodataId: e.target.value })}
                    placeholder="MB-B205"
                    className="mb-input w-full font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-ink">{isBengali ? 'বিবাহের গল্প ও অনুভূতি' : 'Story & Testimonial'}</label>
                <textarea
                  required
                  rows={4}
                  value={editingStory.story || ''}
                  onChange={(e) => setEditingStory({ ...editingStory, story: e.target.value })}
                  placeholder="আলহামদুলিল্লাহ, মধুবন্ধনের মাধ্যমে খুব সহজেই আমরা পছন্দের পাত্রী পেয়েছি..."
                  className="mb-input w-full text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-ink">
                  <input
                    type="checkbox"
                    checked={editingStory.isPublished !== false}
                    onChange={(e) => setEditingStory({ ...editingStory, isPublished: e.target.checked })}
                    className="rounded text-brand focus:ring-brand"
                  />
                  <span>{isBengali ? 'ওয়েবসাইটে সরাসরি প্রকাশ করুন' : 'Publish publicly'}</span>
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
                  disabled={saveMutation.isPending}
                  className="mb-btn-primary px-5 py-2 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isBengali ? 'সংরক্ষণ করুন' : 'Save Record'}</span>
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
          title={isBengali ? 'রেকর্ড মুছে ফেলতে চান?' : 'Delete Record?'}
          message={isBengali ? 'এই সফল বিবাহের রেকর্ডটি মুছে ফেলা হবে।' : 'This record will be permanently deleted.'}
          confirmText={isBengali ? 'হ্যাঁ, মুছুন' : 'Delete'}
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deleteId)}
          onClose={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};

export default AdminSuccessStoriesTab;
