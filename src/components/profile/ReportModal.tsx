import React, { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi } from '../../api/reports.api';

import { useLanguage } from '../../i18n/LanguageContext';

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
  const { isBengali } = useLanguage();
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
      toast.success(
        isBengali
          ? 'অভিযোগ সফলভাবে গ্রহণ করা হয়েছে। মডারেটর টিম পর্যালোচনা করবেন।'
          : 'Report submitted successfully. Our moderation team will investigate.'
      );
      setDescription('');
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'রিপোর্ট পাঠাতে ব্যর্থ হয়েছে।' : 'Failed to submit report.');
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
            <span>{isBengali ? 'বায়োডাটা সম্পর্কে রিপোর্ট করুন' : 'Report this Biodata'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink-2 p-1 rounded-lg cursor-pointer"
            aria-label={isBengali ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-ink-2">
            {isBengali ? (
              <>
                আপনি <strong className="text-ink">{targetName}</strong> এর বিরুদ্ধে অভিযোগ দাখিল করছেন।
                যথাযথ তথ্য প্রদান করুন যাতে অ্যাডমিন টিম সঠিক ব্যবস্থা নিতে পারে।
              </>
            ) : (
              <>
                You are submitting a complaint against <strong className="text-ink">{targetName}</strong>.
                Please provide accurate details so the admin team can take appropriate action.
              </>
            )}
          </p>

          <div>
            <label className="mb-label block text-xs font-semibold mb-1.5">
              {isBengali ? 'অভিযোগের কারণ নির্বাচন করুন' : 'Select Reason for Report'}
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mb-input w-full text-sm rounded-xl p-2.5"
            >
              <option value="fake_profile">
                {isBengali ? 'নকল বা মিথ্যা তথ্যের বায়োডাটা' : 'Fake or misleading biodata'}
              </option>
              <option value="inappropriate_behavior">
                {isBengali ? 'অশোভন আচরণ বা অসংগত বার্তা' : 'Inappropriate behavior or abusive remarks'}
              </option>
              <option value="already_married">
                {isBengali ? 'ইতিমধ্যে বিবাহিত কিন্তু গোপন করা হয়েছে' : 'Already married (undisclosed status)'}
              </option>
              <option value="financial_fraud">
                {isBengali ? 'আর্থিক প্রতারণা বা টাকা দাবি' : 'Financial fraud or money solicitation'}
              </option>
              <option value="other">
                {isBengali ? 'অন্যান্য কারণ' : 'Other reasons'}
              </option>
            </select>
          </div>

          <div>
            <label className="mb-label block text-xs font-semibold mb-1.5">
              {isBengali ? 'বিস্তারিত বিবরণ (ঐচ্ছিক)' : 'Detailed Description (Optional)'}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                isBengali
                  ? 'ঘটনাটির সংক্ষিপ্ত বিবরণ লিখুন...'
                  : 'Briefly describe the incident or reason for reporting...'
              }
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
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mb-btn-primary px-5 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? isBengali
                  ? 'দাখিল হচ্ছে...'
                  : 'Submitting...'
                : isBengali
                ? 'রিপোর্ট জমা দিন'
                : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
