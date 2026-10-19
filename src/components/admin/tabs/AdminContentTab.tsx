import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileEdit,
  Save,
  Eye,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useLanguage } from '../../../i18n/LanguageContext';

export const AdminContentTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali } = useLanguage();

  const [selectedSlug, setSelectedSlug] = useState<string>('about');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  // Query pages
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ['admin-content-pages'],
    queryFn: () => adminApi.listContentPages(),
  });

  const pagesList = pagesData?.data?.pages || [];
  const currentPage = pagesList.find((p) => p.slug === selectedSlug);

  // Sync state when page changes
  React.useEffect(() => {
    if (currentPage) {
      setTitle(currentPage.title);
      setContent(currentPage.content);
      setIsPublished(currentPage.isPublished);
    }
  }, [currentPage, selectedSlug]);

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updateContentPage(selectedSlug, {
        title: title.trim(),
        content: content.trim(),
        isPublished,
      }),
    onSuccess: () => {
      toast.success(isBengali ? 'কনটেন্ট সফলভাবে সংরক্ষিত ও প্রকাশিত হয়েছে।' : 'Content saved and published successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-content-pages'] });
      queryClient.invalidateQueries({ queryKey: ['public-content', selectedSlug] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'সংরক্ষণ ব্যর্থ হয়েছে।' : 'Failed to save content.'));
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-brand" />
            <span>{isBengali ? 'ওয়েবসাইট কনটেন্ট ব্যবস্থাপনা (Content Management)' : 'Site Content Management (CMS)'}</span>
          </h2>
          <p className="text-xs text-ink-3">
            {isBengali
              ? 'আমাদের সম্পর্কে, সাধারণ জিজ্ঞাসা, প্রাইভেসি পলিসি ও ব্যবহারের শর্তাবলী সম্পাদনা করুন'
              : 'Edit About Us, FAQ, Privacy Policy, and Terms & Conditions'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-line cursor-pointer transition-colors ${
              previewMode ? 'bg-brand text-white' : 'bg-elev text-ink-2 hover:bg-card'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>
              {previewMode
                ? (isBengali ? 'এডিটর দেখুন' : 'Switch to Editor')
                : (isBengali ? 'প্রিভিউ দেখুন' : 'Preview')}
            </span>
          </button>

          <button
            type="button"
            disabled={updateMutation.isPending || !title.trim() || !content.trim()}
            onClick={() => updateMutation.mutate()}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:bg-brand-strong disabled:opacity-50 cursor-pointer shadow-md shadow-brand/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>
              {updateMutation.isPending
                ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                : (isBengali ? 'সংরক্ষণ করুন' : 'Save Content')}
            </span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center mb-card">
          <LoadingSpinner size="lg" label={isBengali ? 'পৃষ্ঠা লোড হচ্ছে...' : 'Loading pages...'} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Page Selector Sidebar */}
          <div className="lg:col-span-1 mb-card p-3 sm:p-4 space-y-1">
            <div className="px-3 py-1 text-[11px] font-black uppercase text-ink-3">
              {isBengali ? 'সম্পাদনাযোগ্য পৃষ্ঠাসমূহ' : 'Editable Pages'}
            </div>
            {pagesList.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => {
                  setSelectedSlug(p.slug);
                  setPreviewMode(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSlug === p.slug
                    ? 'bg-brand text-white shadow-xs'
                    : 'text-ink-2 hover:text-ink hover:bg-elev'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{p.title}</span>
                </div>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md ${
                    p.isPublished
                      ? selectedSlug === p.slug
                        ? 'bg-white/20 text-white'
                        : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/15 text-amber-600'
                  }`}
                >
                  v{p.version}
                </span>
              </button>
            ))}
          </div>

          {/* Editor & Preview Area */}
          <div className="lg:col-span-3 mb-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <span className="text-xs font-bold text-ink-3">
                {isBengali ? 'স্লাগ: ' : 'Slug: '}<strong className="font-mono text-brand">/content/{selectedSlug}</strong>
              </span>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-ink">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-brand"
                />
                <span>{isBengali ? 'পাবলিকভাবে দৃশ্যমান (Published)' : 'Publicly Visible (Published)'}</span>
              </label>
            </div>

            {previewMode ? (
              <div className="space-y-4 p-4 bg-elev/50 rounded-xl border border-line min-h-[350px]">
                <h2 className="text-xl font-bold text-ink">{title}</h2>
                <div className="text-xs sm:text-sm text-ink-2 whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    {isBengali ? 'পৃষ্ঠার শিরোনাম (Page Title):' : 'Page Title:'}
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mb-input text-xs"
                    placeholder={isBengali ? 'শিরোনাম লিখুন...' : 'Enter page title...'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-ink mb-1">
                    {isBengali ? 'পৃষ্ঠার বিবরণ (Content / Body):' : 'Content / Body:'}
                  </label>
                  <textarea
                    rows={14}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="mb-input font-sans text-xs leading-relaxed"
                    placeholder={isBengali ? 'বিস্তারিত কনটেন্ট লিখুন...' : 'Write page content...'}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentTab;
