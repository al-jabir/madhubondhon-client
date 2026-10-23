import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Radio,
  Send,
  X,
  Users,
  UserCheck,
  Heart,
  Link as LinkIcon,
  AlertCircle,
  Bell,
} from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { toast } from 'sonner';

interface BroadcastNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BroadcastNotificationModal: React.FC<BroadcastNotificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [target, setTarget] = useState<'all' | 'groom' | 'bride' | 'active'>('all');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');

  const broadcastMutation = useMutation({
    mutationFn: () =>
      adminApi.sendBroadcastNotification({
        target,
        title: title.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
      }),
    onSuccess: (res) => {
      const count = res.data?.sentCount || 0;
      toast.success(`সফলভাবে ${count} জন ব্যবহারকারীর ইনবক্সে নোটিফিকেশন পৌঁছে গেছে!`);
      setTitle('');
      setMessage('');
      setLink('');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'ব্রডকাস্ট পাঠাতে সমস্যা হয়েছে।');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error('শিরোনাম ও বার্তা উভয়ই আবশ্যক');
      return;
    }
    broadcastMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-card border border-line rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Radio className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-ink">ম্যাস ব্রডকাস্ট নোটিফিকেশন পাঠান</h2>
              <p className="text-xs text-ink-3">
                এক ক্লিকে সকল বা নির্দিষ্ট ক্যাটাগরির ইউজারদের ইনবক্সে সরাসরি নোটিফিকেশন পাঠান
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-3 hover:text-ink hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1.5">
              প্রাপক নির্বাচন (Target Audience) *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'all', label: 'সকল সদস্য', desc: 'সকল সক্রিয় অ্যাকাউন্ট', icon: Users },
                { id: 'groom', label: 'শুধুমাত্র পাত্র', desc: 'সকল পাত্রের বায়োডাটা', icon: Heart },
                { id: 'bride', label: 'শুধুমাত্র পাত্রী', desc: 'সকল পাত্রীর বায়োডাটা', icon: Heart },
                { id: 'active', label: 'সক্রিয় সদস্যবৃন্দ', desc: 'যাচাইকৃত ইউজার', icon: UserCheck },
              ].map((opt) => {
                const Icon = opt.icon;
                const isSelected = target === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setTarget(opt.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-line hover:border-ink-3/40 bg-base'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-ink">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                      <span>{opt.label}</span>
                    </div>
                    <span className="text-[10px] text-ink-3 block mt-0.5">{opt.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1">
              নোটিফিকেশন শিরোনাম *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: বিশেষ অফার! সকল প্যাকেজে ২০% ছাড় চলছে"
              className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1">
              বিস্তারিত বার্তা *
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="সদস্যদের জন্য আপনার বার্তা লিখুন..."
              className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Action Link */}
          <div>
            <label className="block text-xs font-semibold text-ink-2 mb-1">
              নেভিগেশন লিঙ্ক (ঐচ্ছিক)
            </label>
            <div className="flex items-center gap-2 bg-base border border-line rounded-xl px-3 py-2">
              <LinkIcon className="w-3.5 h-3.5 text-ink-3" />
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/packages বা /announcements"
                className="w-full bg-transparent text-xs focus:outline-hidden"
              />
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl text-xs text-amber-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              সতর্কতা: এই বার্তাটি নির্বাচিত সকল ইউজারের ব্যক্তিগত ইনবক্সে তাৎক্ষণিক নোটিফিকেশন হিসেবে পৌঁছে যাবে।
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-ink-3 hover:text-ink hover:bg-muted text-xs font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={broadcastMutation.isPending || !title.trim() || !message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover disabled:opacity-50 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              {broadcastMutation.isPending ? 'পাঠানো হচ্ছে...' : 'ব্রডকাস্ট প্রেরণ করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default BroadcastNotificationModal;
