import React, { useState } from 'react';
import { Heart, X } from 'lucide-react';
import { toast } from 'sonner';
import { Profile } from '../../types';
import { interestsApi } from '../../api/interests.api';

import { useLanguage } from '../../i18n/LanguageContext';

interface SendInterestModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onSuccess?: () => void;
}

export const SendInterestModal: React.FC<SendInterestModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSuccess,
}) => {
  const { isBengali, formatNumber } = useLanguage();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !profile) return null;

  const targetUserId =
    typeof profile.user === 'string' ? profile.user : profile.user?._id || profile.user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) {
      toast.error(isBengali ? 'প্রোফাইলটি আবার লোড করুন।' : 'Please reload the profile.');
      return;
    }
    try {
      setIsSubmitting(true);
      await interestsApi.sendInterest({
        receiverId: targetUserId,
        message: message.trim() || undefined,
      });
      toast.success(
        isBengali
          ? 'আগ্রহের বার্তা সফলভাবে পাঠানো হয়েছে!'
          : 'Interest request sent successfully!'
      );
      setMessage('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali
          ? 'আগ্রহ পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।'
          : 'Failed to send interest. Please try again.');
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-card border border-line rounded-[1.5rem] max-w-md w-full shadow-[var(--mb-shadow-pop)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-brand/25 bg-brand-soft">
          <div className="flex items-center gap-2 text-brand-ink font-bold text-lg">
            <Heart className="w-5 h-5 fill-brand text-brand" />
            <span>{isBengali ? 'আগ্রহের বার্তা পাঠান' : 'Send Interest Request'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-3 hover:text-ink-2 p-1 rounded-lg hover:bg-brand/10 cursor-pointer"
            aria-label={isBengali ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-ink-2">
            {isBengali ? (
              <>
                আপনি <strong className="text-ink">{profile.displayName}</strong> এর বায়োডাটায় আগ্রহ প্রকাশ
                করছেন। অপর পক্ষ আগ্রহ গ্রহণ করলে তবেই যোগাযোগের তথ্য বিনিময় সম্ভব হবে।
              </>
            ) : (
              <>
                You are expressing interest in the biodata of{' '}
                <strong className="text-ink">{profile.displayName}</strong>. Contact information can only be
                exchanged once the other family accepts your request.
              </>
            )}
          </p>

          <div>
            <label className="mb-label block text-xs font-semibold mb-1">
              {isBengali ? 'বার্তা বা অভিবাদন (ঐচ্ছিক)' : 'Message or Greeting (Optional)'}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isBengali
                  ? 'যেমন: আসসালামু আলাইকুম, আমরা আপনার বায়োডাটা পর্যালোচনা করে আগ্রহী হয়েছি...'
                  : 'e.g., Assalamu Alaikum, we reviewed your profile and would like to propose a discussion...'
              }
              className="mb-input w-full text-sm rounded-xl p-3 transition-all"
              maxLength={300}
            />
            <span className="text-[11px] text-ink-3 block text-right mt-1">
              {isBengali
                ? `${formatNumber(message.length)}/৩০০ অক্ষর`
                : `${message.length}/300 characters`}
            </span>
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
              className="mb-btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? isBengali
                  ? 'পাঠানো হচ্ছে...'
                  : 'Sending...'
                : isBengali
                ? 'আগ্রহ পাঠান'
                : 'Send Interest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendInterestModal;
