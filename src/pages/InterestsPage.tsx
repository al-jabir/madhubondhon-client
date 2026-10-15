import React, { useState } from 'react';
import { Link } from 'react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart,
  Inbox,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { interestsApi } from '../api/interests.api';
import { Interest, InterestStatus } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

export const InterestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  // Queries
  const { data: receivedData, isLoading: isReceivedLoading } = useQuery({
    queryKey: ['interests-received'],
    queryFn: () => interestsApi.getReceivedInterests(),
  });

  const { data: sentData, isLoading: isSentLoading } = useQuery({
    queryKey: ['interests-sent'],
    queryFn: () => interestsApi.getSentInterests(),
  });

  // Respond Mutation (Accept / Decline)
  const respondMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'accepted' | 'declined' }) =>
      interestsApi.respondToInterest(id, { action }),
    onSuccess: (_, variables) => {
      toast.success(
        variables.action === 'accepted'
          ? 'আগ্রহের বার্তা গ্রহণ করা হয়েছে! যোগাযোগের তথ্য দৃশ্যমান।'
          : 'আগ্রহ প্রত্যাখ্যান করা হয়েছে।',
      );
      queryClient.invalidateQueries({ queryKey: ['interests-received'] });
      queryClient.invalidateQueries({ queryKey: ['interests-sent'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'প্রতিক্রিয়া জানাতে সমস্যা হয়েছে।';
      toast.error(msg);
    },
  });

  // Withdraw Mutation
  const withdrawMutation = useMutation({
    mutationFn: (id: string) => interestsApi.withdrawInterest(id),
    onSuccess: () => {
      toast.success('আগ্রহের বার্তা প্রত্যাহার করা হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['interests-sent'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'প্রত্যাহার করতে সমস্যা হয়েছে।';
      toast.error(msg);
    },
  });

  const receivedList = receivedData?.data?.interests || [];
  const sentList = sentData?.data?.interests || [];

  const renderStatusBadge = (status: InterestStatus) => {
    switch (status) {
      case InterestStatus.ACCEPTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            গৃহীত হয়েছে (Accepted)
          </span>
        );
      case InterestStatus.DECLINED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
            <XCircle className="w-3.5 h-3.5" />
            প্রত্যাখ্যাত (Declined)
          </span>
        );
      case InterestStatus.WITHDRAWN:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <RotateCcw className="w-3.5 h-3.5" />
            প্রত্যাহারকৃত (Withdrawn)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <Clock className="w-3.5 h-3.5" />
            বিবেচনাধীন (Pending)
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="border-b border-rose-100 pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-2.5">
          <Heart className="w-7 h-7 text-rose-600 fill-rose-50" />
          <span>আগ্রহ তালিকা ও ম্যাচমেকিং</span>
        </h1>
        <p className="text-sm text-gray-550 mt-1">
          আপনার বায়োডাটায় আসা এবং পাঠানো সকল আগ্রহের স্থিতি পর্যালোচনা করুন
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-gray-200 gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 pb-3.5 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'received'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>আগত আগ্রহ ({receivedList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 pb-3.5 px-2 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'sent'
              ? 'border-rose-600 text-rose-700'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>প্রেরিত আগ্রহ ({sentList.length})</span>
        </button>
      </div>

      {/* Content for Received Tab */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {isReceivedLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" label="আগত অনুরোধ লোড হচ্ছে..." />
            </div>
          ) : receivedList.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200/80 p-8 space-y-3">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800">এখনও কোনো আগ্রহ আসেনি</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                অন্য কোনো সদস্য আপনার বায়োডাটায় পছন্দ প্রকাশ করলে আপনি তা এই তালিকায় দেখতে পাবেন।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {receivedList.map((interest: Interest) => {
                const senderObj = typeof interest.sender === 'object' ? interest.sender : null;
                const senderName = senderObj?.name || 'বায়োডাটা সদস্য';
                const senderId = senderObj?._id || (typeof interest.sender === 'string' ? interest.sender : '');

                return (
                  <div
                    key={interest._id}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                          {senderName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{senderName}</h3>
                            {renderStatusBadge(interest.status)}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            তারিখ: {new Date(interest.createdAt).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {senderId && (
                          <Link
                            to={`/profiles/${senderId}`}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                          >
                            বায়োডাটা দেখুন
                          </Link>
                        )}
                        {interest.status === InterestStatus.PENDING && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                respondMutation.mutate({ id: interest._id, action: 'accepted' })
                              }
                              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors cursor-pointer"
                            >
                              গ্রহণ করুন
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                respondMutation.mutate({ id: interest._id, action: 'declined' })
                              }
                              className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-250 transition-colors cursor-pointer"
                            >
                              প্রত্যাখ্যান
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {interest.message && (
                      <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 italic border border-gray-100">
                        "{interest.message}"
                      </div>
                    )}

                    {/* Contact details revealed upon mutual acceptance */}
                    {interest.status === InterestStatus.ACCEPTED && senderObj && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-wrap items-center gap-4 text-xs text-emerald-900">
                        <span className="font-bold">যোগাযোগের বিবরণ (উভয় পক্ষ সম্মত):</span>
                        {senderObj.email && (
                          <span className="flex items-center gap-1 font-mono">
                            <Mail className="w-3.5 h-3.5 text-emerald-700" />
                            {senderObj.email}
                          </span>
                        )}
                        {senderObj.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5 text-emerald-700" />
                            {senderObj.phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Content for Sent Tab */}
      {activeTab === 'sent' && (
        <div className="space-y-4">
          {isSentLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" label="প্রেরিত অনুরোধ লোড হচ্ছে..." />
            </div>
          ) : sentList.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-2xl border border-gray-200/80 p-8 space-y-3">
              <Send className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="font-bold text-gray-800">এখনও কোনো আগ্রহ পাঠাননি</h3>
              <p className="text-xs text-gray-550 max-w-sm mx-auto">
                পছন্দের পাত্র বা পাত্রীর বায়োডাটা খুঁজে পেতে অনুসন্ধান পাতায় যান।
              </p>
              <div>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200"
                >
                  বায়োডাটা অনুসন্ধান করুন
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sentList.map((interest: Interest) => {
                const receiverObj = typeof interest.receiver === 'object' ? interest.receiver : null;
                const receiverName = receiverObj?.name || 'বায়োডাটা সদস্য';
                const receiverId = receiverObj?._id || (typeof interest.receiver === 'string' ? interest.receiver : '');

                return (
                  <div
                    key={interest._id}
                    className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-2xs hover:shadow-xs transition-shadow space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center font-bold text-lg">
                          {receiverName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900">{receiverName}</h3>
                            {renderStatusBadge(interest.status)}
                          </div>
                          <span className="text-[11px] text-gray-400">
                            প্রেরণের তারিখ: {new Date(interest.createdAt).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {receiverId && (
                          <Link
                            to={`/profiles/${receiverId}`}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                          >
                            বায়োডাটা দেখুন
                          </Link>
                        )}
                        {interest.status === InterestStatus.PENDING && (
                          <button
                            type="button"
                            onClick={() => withdrawMutation.mutate(interest._id)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                          >
                            প্রত্যাহার করুন
                          </button>
                        )}
                      </div>
                    </div>

                    {interest.message && (
                      <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-700 italic border border-gray-100">
                        বার্তা: "{interest.message}"
                      </div>
                    )}

                    {/* Contact revealed upon acceptance */}
                    {interest.status === InterestStatus.ACCEPTED && receiverObj && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex flex-wrap items-center gap-4 text-xs text-emerald-900">
                        <span className="font-bold">অভিনন্দন! অপর পক্ষ আগ্রহ গ্রহণ করেছেন:</span>
                        {receiverObj.email && (
                          <span className="flex items-center gap-1 font-mono">
                            <Mail className="w-3.5 h-3.5 text-emerald-700" />
                            {receiverObj.email}
                          </span>
                        )}
                        {receiverObj.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5 text-emerald-700" />
                            {receiverObj.phone}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterestsPage;
