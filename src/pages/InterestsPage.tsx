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
import { useLanguage } from '../i18n/LanguageContext';

export const InterestsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();
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
          ? isBengali
            ? 'আগ্রহের বার্তা গ্রহণ করা হয়েছে! যোগাযোগের তথ্য দৃশ্যমান।'
            : 'Interest accepted! Contact details are now visible.'
          : isBengali
          ? 'আগ্রহ প্রত্যাখ্যান করা হয়েছে।'
          : 'Interest declined.'
      );
      queryClient.invalidateQueries({ queryKey: ['interests-received'] });
      queryClient.invalidateQueries({ queryKey: ['interests-sent'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'প্রতিক্রিয়া জানাতে সমস্যা হয়েছে।' : 'Failed to update interest status.');
      toast.error(msg);
    },
  });

  // Withdraw Mutation
  const withdrawMutation = useMutation({
    mutationFn: (id: string) => interestsApi.withdrawInterest(id),
    onSuccess: () => {
      toast.success(
        isBengali ? 'আগ্রহের বার্তা প্রত্যাহার করা হয়েছে।' : 'Interest withdrawn successfully.'
      );
      queryClient.invalidateQueries({ queryKey: ['interests-sent'] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (isBengali ? 'প্রত্যাহার করতে সমস্যা হয়েছে।' : 'Failed to withdraw interest.');
      toast.error(msg);
    },
  });

  const receivedList = receivedData?.data?.interests || [];
  const sentList = sentData?.data?.interests || [];

  const renderStatusBadge = (status: InterestStatus) => {
    switch (status) {
      case InterestStatus.ACCEPTED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isBengali ? 'গৃহীত হয়েছে (Accepted)' : 'Accepted'}
          </span>
        );
      case InterestStatus.DECLINED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-elev text-ink-2 border border-line">
            <XCircle className="w-3.5 h-3.5" />
            {isBengali ? 'প্রত্যাখ্যাত (Declined)' : 'Declined'}
          </span>
        );
      case InterestStatus.WITHDRAWN:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gold-soft text-gold border border-gold/25">
            <RotateCcw className="w-3.5 h-3.5" />
            {isBengali ? 'প্রত্যাহারকৃত (Withdrawn)' : 'Withdrawn'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-brand-soft text-brand-ink border border-brand/25">
            <Clock className="w-3.5 h-3.5" />
            {isBengali ? 'বিবেচনাধীন (Pending)' : 'Pending'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="border-b border-line pb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink flex items-center gap-2.5">
          <Heart className="w-7 h-7 text-brand fill-brand-soft" />
          <span>{isBengali ? 'আগ্রহ তালিকা ও ম্যাচমেকিং' : 'Interests & Matchmaking'}</span>
        </h1>
        <p className="text-sm text-ink-3 mt-1">
          {isBengali
            ? 'আপনার বায়োডাটায় আসা এবং পাঠানো সকল আগ্রহের স্থিতি পর্যালোচনা করুন'
            : 'Track and manage all received and sent interest requests'}
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-elev rounded-full p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'received' ? 'bg-brand text-white' : 'text-ink-2 hover:bg-card'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>
            {isBengali
              ? `আগত আগ্রহ (${formatNumber(receivedList.length)})`
              : `Received (${receivedList.length})`}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
            activeTab === 'sent' ? 'bg-brand text-white' : 'text-ink-2 hover:bg-card'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>
            {isBengali
              ? `প্রেরিত আগ্রহ (${formatNumber(sentList.length)})`
              : `Sent (${sentList.length})`}
          </span>
        </button>
      </div>

      {/* Content for Received Tab */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {isReceivedLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner
                size="lg"
                label={isBengali ? 'আগত অনুরোধ লোড হচ্ছে...' : 'Loading received interests...'}
              />
            </div>
          ) : receivedList.length === 0 ? (
            <div className="py-16 text-center mb-card p-8 space-y-3">
              <Inbox className="w-12 h-12 text-ink-3 mx-auto" />
              <h3 className="font-bold text-ink">
                {isBengali ? 'এখনও কোনো আগ্রহ আসেনি' : 'No received interests yet'}
              </h3>
              <p className="text-xs text-ink-3 max-w-sm mx-auto">
                {isBengali
                  ? 'অন্য কোনো সদস্য আপনার বায়োডাটায় পছন্দ প্রকাশ করলে আপনি তা এই তালিকায় দেখতে পাবেন।'
                  : 'When other members send interest to your biodata, you will see them here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {receivedList.map((interest: Interest) => {
                const senderObj = typeof interest.sender === 'object' ? interest.sender : null;
                const senderName =
                  senderObj?.name || (isBengali ? 'বায়োডাটা সদস্য' : 'Biodata Member');
                const senderId =
                  senderObj?._id || (typeof interest.sender === 'string' ? interest.sender : '');

                return (
                  <div key={interest._id} className="mb-card p-5 sm:p-6 transition-shadow space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-lg">
                          {senderName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-ink">{senderName}</h3>
                            {renderStatusBadge(interest.status)}
                          </div>
                          <span className="text-[11px] text-ink-3">
                            {isBengali ? 'তারিখ: ' : 'Date: '}
                            {interest.createdAt
                              ? new Date(interest.createdAt).toLocaleDateString(
                                  isBengali ? 'bn-BD' : 'en-US'
                                )
                              : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {senderId && (
                          <Link
                            to={`/profiles/${senderId}`}
                            className="px-3 py-1.5 text-xs font-semibold text-brand bg-brand-soft hover:bg-brand/15 rounded-lg border border-brand/25 transition-colors"
                          >
                            {isBengali ? 'বায়োডাটা দেখুন' : 'View Biodata'}
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
                              {isBengali ? 'গ্রহণ করুন' : 'Accept'}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                respondMutation.mutate({ id: interest._id, action: 'declined' })
                              }
                              className="px-3.5 py-1.5 text-xs font-semibold text-ink-2 hover:bg-elev rounded-lg border border-line transition-colors cursor-pointer"
                            >
                              {isBengali ? 'প্রত্যাখ্যান' : 'Decline'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {interest.message && (
                      <div className="p-3 bg-elev rounded-xl text-xs text-ink-2 italic border border-line">
                        "{interest.message}"
                      </div>
                    )}

                    {/* Contact details revealed upon mutual acceptance */}
                    {interest.status === InterestStatus.ACCEPTED && senderObj && (
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-wrap items-center gap-4 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="font-bold">
                          {isBengali
                            ? 'যোগাযোগের বিবরণ (উভয় পক্ষ সম্মত):'
                            : 'Contact Details (Mutual Consent):'}
                        </span>
                        {senderObj.email && (
                          <span className="flex items-center gap-1 font-mono">
                            <Mail className="w-3.5 h-3.5" />
                            {senderObj.email}
                          </span>
                        )}
                        {senderObj.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5" />
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
              <LoadingSpinner
                size="lg"
                label={isBengali ? 'প্রেরিত অনুরোধ লোড হচ্ছে...' : 'Loading sent interests...'}
              />
            </div>
          ) : sentList.length === 0 ? (
            <div className="py-16 text-center mb-card p-8 space-y-3">
              <Send className="w-12 h-12 text-ink-3 mx-auto" />
              <h3 className="font-bold text-ink">
                {isBengali ? 'এখনও কোনো আগ্রহ পাঠাননি' : 'No sent interests yet'}
              </h3>
              <p className="text-xs text-ink-3 max-w-sm mx-auto">
                {isBengali
                  ? 'পছন্দের পাত্র বা পাত্রীর বায়োডাটা খুঁজে পেতে অনুসন্ধান পাতায় যান।'
                  : 'Search prospective grooms or brides to express interest.'}
              </p>
              <div>
                <Link
                  to="/search"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-brand bg-brand-soft hover:bg-brand/15 rounded-xl border border-brand/25"
                >
                  {isBengali ? 'বায়োডাটা অনুসন্ধান করুন' : 'Search Profiles'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sentList.map((interest: Interest) => {
                const receiverObj = typeof interest.receiver === 'object' ? interest.receiver : null;
                const receiverName =
                  receiverObj?.name || (isBengali ? 'বায়োডাটা সদস্য' : 'Biodata Member');
                const receiverId =
                  receiverObj?._id || (typeof interest.receiver === 'string' ? interest.receiver : '');

                return (
                  <div key={interest._id} className="mb-card p-5 sm:p-6 transition-shadow space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-brand-soft text-brand flex items-center justify-center font-bold text-lg">
                          {receiverName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-ink">{receiverName}</h3>
                            {renderStatusBadge(interest.status)}
                          </div>
                          <span className="text-[11px] text-ink-3">
                            {isBengali ? 'প্রেরণের তারিখ: ' : 'Sent Date: '}
                            {interest.createdAt
                              ? new Date(interest.createdAt).toLocaleDateString(
                                  isBengali ? 'bn-BD' : 'en-US'
                                )
                              : '-'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {receiverId && (
                          <Link
                            to={`/profiles/${receiverId}`}
                            className="px-3 py-1.5 text-xs font-semibold text-brand bg-brand-soft hover:bg-brand/15 rounded-lg border border-brand/25 transition-colors"
                          >
                            {isBengali ? 'বায়োডাটা দেখুন' : 'View Biodata'}
                          </Link>
                        )}
                        {interest.status === InterestStatus.PENDING && (
                          <button
                            type="button"
                            onClick={() => withdrawMutation.mutate(interest._id)}
                            className="px-3.5 py-1.5 text-xs font-semibold text-gold bg-gold-soft hover:bg-gold/20 rounded-lg border border-gold/25 transition-colors cursor-pointer"
                          >
                            {isBengali ? 'প্রত্যাহার করুন' : 'Withdraw'}
                          </button>
                        )}
                      </div>
                    </div>

                    {interest.message && (
                      <div className="p-3 bg-elev rounded-xl text-xs text-ink-2 italic border border-line">
                        {isBengali ? 'বার্তা: ' : 'Message: '}"{interest.message}"
                      </div>
                    )}

                    {/* Contact revealed upon acceptance */}
                    {interest.status === InterestStatus.ACCEPTED && receiverObj && (
                      <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-wrap items-center gap-4 text-xs text-emerald-600 dark:text-emerald-400">
                        <span className="font-bold">
                          {isBengali
                            ? 'অভিনন্দন! অপর পক্ষ আগ্রহ গ্রহণ করেছেন:'
                            : 'Congratulations! The recipient accepted your interest:'}
                        </span>
                        {receiverObj.email && (
                          <span className="flex items-center gap-1 font-mono">
                            <Mail className="w-3.5 h-3.5" />
                            {receiverObj.email}
                          </span>
                        )}
                        {receiverObj.phone && (
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="w-3.5 h-3.5" />
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
