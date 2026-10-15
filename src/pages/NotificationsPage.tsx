import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck, CheckCircle2, Heart, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { notificationsApi } from '../api/notifications.api';
import { Notification } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      toast.success('সকল বিজ্ঞপ্তি পড়া হয়েছে চিহ্নিত করা হলো');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIconForType = (type: string) => {
    switch (type) {
      case 'interest_received':
      case 'interest_accepted':
        return <Heart className="w-5 h-5 text-rose-500 fill-rose-50" />;
      case 'profile_approved':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'account_warning':
      case 'report_update':
        return <ShieldAlert className="w-5 h-5 text-amber-500" />;
      default:
        return <Bell className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-rose-600" />
            <span>বিজ্ঞপ্তিসমূহ</span>
          </h1>
          <p className="text-sm text-gray-550 mt-1">
            আপনার অ্যাকাউন্টের সাম্প্রতিক সকল আপডেট ও গুরুত্বপূর্ণ নোটিফিকেশন
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => markAllMutation.mutate()}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>সব পড়া হয়েছে চিহ্নিত করুন</span>
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="বিজ্ঞপ্তি লোড হচ্ছে..." />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-gray-200/80 p-8 space-y-3">
          <Bell className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800">কোনো বিজ্ঞপ্তি নেই</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            আপনার বায়োডাটায় কোনো নতুন আপডেট বা আগ্রহ প্রকাশ করা হলে আপনি অবিলম্বে জানতে পারবেন।
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: Notification) => (
            <div
              key={n._id}
              onClick={() => {
                if (!n.isRead) markOneMutation.mutate(n._id);
              }}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-gray-150 hover:border-gray-300'
                  : 'bg-rose-50/50 border-rose-200 shadow-2xs hover:bg-rose-50'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-white shadow-2xs shrink-0 border border-gray-100">
                {getIconForType(n.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className={`text-sm ${n.isRead ? 'font-semibold text-gray-800' : 'font-bold text-gray-950'}`}>
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {new Date(n.createdAt).toLocaleDateString('bn-BD', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
              </div>

              {!n.isRead && (
                <div className="w-2.5 h-2.5 rounded-full bg-rose-600 mt-2 shrink-0" title="অপঠিত" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
