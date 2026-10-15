import React, { useState } from 'react';
import { Heart, X } from 'lucide-react';
import { toast } from 'sonner';
import { Profile } from '../../types';
import { interestsApi } from '../../api/interests.api';

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
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !profile) return null;

  const targetUserId =
    typeof profile.user === 'string' ? profile.user : profile.user?._id || profile.user?.id;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) {
      toast.error('প্রোফাইলটি আবার লোড করুন।');
      return;
    }
    try {
      setIsSubmitting(true);
      await interestsApi.sendInterest({
        receiverId: targetUserId,
        message: message.trim() || undefined,
      });
      toast.success('আগ্রহের বার্তা সফলভাবে পাঠানো হয়েছে!');
      setMessage('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'আগ্রহ পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-rose-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-rose-100 bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700 font-bold text-lg">
            <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
            <span>আগ্রহের বার্তা পাঠান</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-rose-100/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            আপনি <strong className="text-gray-900">{profile.displayName}</strong> এর বায়োডাটায় আগ্রহ প্রকাশ
            করছেন। অপর পক্ষ আগ্রহ গ্রহণ করলে তবেই যোগাযোগের তথ্য বিনিময় সম্ভব হবে।
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              বার্তা বা অভিবাদন (ঐচ্ছিক)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="যেমন: আসসালামু আলাইকুম, আমরা আপনার বায়োডাটা পর্যালোচনা করে আগ্রহী হয়েছি..."
              className="w-full text-sm border border-gray-300 rounded-xl p-3 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
              maxLength={300}
            />
            <span className="text-[11px] text-gray-400 block text-right mt-1">
              {message.length}/৩০০ অক্ষর
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'পাঠানো হচ্ছে...' : 'আগ্রহ পাঠান'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendInterestModal;
