import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi } from '../../api/reports.api';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId: string;
  targetName: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetUserId,
  targetName,
}) => {
  const [reason, setReason] = useState('fake_profile');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await reportsApi.createReport({
        reportedUserId: targetUserId,
        reason,
        description: description.trim() || undefined,
      });
      toast.success('অভিযোগ সফলভাবে গ্রহণ করা হয়েছে। মডারেটর টিম পর্যালোচনা করবেন।');
      setDescription('');
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'রিপোর্ট পাঠাতে ব্যর্থ হয়েছে।';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-card border border-line rounded-[1.5rem] max-w-md w-full shadow-[var(--mb-shadow-pop)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-gold/25 bg-gold-soft">
          <div className="flex items-center gap-2 text-gold font-bold text-lg">
            <AlertTriangle className="w-5 h-5 text-gold" />
            <span>বায়োডাটা সম্পর্কে রিপোর্ট করুন</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink-2 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-ink-2">
            আপনি <strong className="text-ink">{targetName}</strong> এর বিরুদ্ধে অভিযোগ দাখিল করছেন।
            যথাযথ তথ্য প্রদান করুন যাতে অ্যাডমিন টিম সঠিক ব্যবস্থা নিতে পারে।
          </p>

          <div>
            <label className="mb-label block text-xs font-semibold mb-1.5">
              অভিযোগের কারণ নির্বাচন করুন
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mb-input w-full text-sm rounded-xl p-2.5"
            >
              <option value="fake_profile">নকল বা মিথ্যা তথ্যের বায়োডাটা</option>
              <option value="inappropriate_behavior">অশোভন আচরণ বা অসংগত বার্তা</option>
              <option value="already_married">ইতিমধ্যে বিবাহিত কিন্তু গোপন করা হয়েছে</option>
              <option value="financial_fraud">আর্থিক প্রতারণা বা টাকা দাবি</option>
              <option value="other">অন্যান্য কারণ</option>
            </select>
          </div>

          <div>
            <label className="mb-label block text-xs font-semibold mb-1.5">
              বিস্তারিত বিবরণ (ঐচ্ছিক)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ঘটনাটির সংক্ষিপ্ত বিবরণ লিখুন..."
              className="mb-input w-full text-sm rounded-xl p-3"
              maxLength={500}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="mb-btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mb-btn-primary px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'দাখিল হচ্ছে...' : 'রিপোর্ট জমা দিন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
