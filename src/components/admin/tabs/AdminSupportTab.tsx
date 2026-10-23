import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Inbox,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Search,
  Trash2,
  Save,
  User,
  RotateCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { SupportMessageItem } from '../../../types';
import { useLanguage } from '../../../i18n/LanguageContext';
import ConfirmationModal from '../../common/ConfirmationModal';

export const AdminSupportTab: React.FC = () => {
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<SupportMessageItem | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: messagesData, isLoading, refetch } = useQuery({
    queryKey: ['admin-support-messages', statusFilter, search],
    queryFn: () =>
      adminApi.adminListSupportMessages({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: search.trim() || undefined,
      }),
  });

  const messages: SupportMessageItem[] = messagesData?.data?.messages || [];
  const pendingCount = messagesData?.data?.pendingCount || 0;

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; status?: 'pending' | 'in_progress' | 'resolved'; adminNote?: string }) =>
      adminApi.adminUpdateSupportMessage(data.id, { status: data.status, adminNote: data.adminNote }),
    onSuccess: () => {
      toast.success(isBengali ? 'মেসেজ আপডেট হয়েছে।' : 'Message updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-support-messages'] });
      if (selectedMessage) {
        setSelectedMessage(null);
      }
    },
    onError: () => toast.error('সমস্যা হয়েছে।'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.adminDeleteSupportMessage(id),
    onSuccess: () => {
      toast.success(isBengali ? 'মেসেজ মুছে ফেলা হয়েছে।' : 'Message deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-support-messages'] });
      setDeleteId(null);
      if (selectedMessage?._id === deleteId) setSelectedMessage(null);
    },
    onError: () => toast.error('সমস্যা হয়েছে।'),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3" />
            {isBengali ? 'নতুন / বাকি' : 'Pending'}
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <RotateCw className="w-3 h-3 animate-spin" />
            {isBengali ? 'চলমান' : 'In Progress'}
          </span>
        );
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            {isBengali ? 'সমাধানকৃত' : 'Resolved'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h2 className="text-xl font-black text-ink flex items-center gap-2">
            <Inbox className="w-5 h-5 text-brand" />
            <span>{isBengali ? 'সাপোর্ট ইনবক্স ও অনুসন্ধান (Helpdesk)' : 'Support Inbox & Inquiries'}</span>
            {pendingCount > 0 && (
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-brand text-white">
                {isBengali ? formatNumber(pendingCount) : pendingCount}
              </span>
            )}
          </h2>
          <p className="text-xs text-ink-3 mt-1">
            {isBengali
              ? 'কন্টাক্ট পেইজ থেকে ইউজার ও অভিভাবকদের পাঠানো বার্তাগুলো দেখুন ও সমাধান করুন।'
              : 'Direct inquiries submitted by visitors from the contact page.'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="mb-btn-secondary !text-xs py-2 px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{isBengali ? 'রিফ্রেশ' : 'Refresh'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-3 rounded-2xl border border-line">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: isBengali ? 'সকল বার্তা' : 'All' },
            { id: 'pending', label: isBengali ? 'বাকি' : 'Pending' },
            { id: 'in_progress', label: isBengali ? 'চলমান' : 'In Progress' },
            { id: 'resolved', label: isBengali ? 'সমাধানকৃত' : 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-brand text-white shadow-sm'
                  : 'text-ink-2 hover:bg-elev hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isBengali ? 'নাম, ইমেইল বা বিষয় খুঁজুন...' : 'Search inquiries...'}
            className="mb-input w-full pl-8 text-xs py-1.5"
          />
        </div>
      </div>

      {/* Messages Grid / Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className={`space-y-3 ${selectedMessage ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          {isLoading ? (
            <div className="py-12 text-center text-ink-3 mb-card rounded-2xl p-6">
              {isBengali ? 'মেসেজ লোড হচ্ছে...' : 'Loading inquiries...'}
            </div>
          ) : messages.length === 0 ? (
            <div className="py-12 text-center text-ink-3 mb-card rounded-2xl p-8 space-y-2">
              <Inbox className="w-10 h-10 text-ink-3 mx-auto opacity-50" />
              <h3 className="text-sm font-bold text-ink">
                {isBengali ? 'কোনো মেসেজ নেই' : 'No inquiries found'}
              </h3>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg._id}
                onClick={() => {
                  setSelectedMessage(msg);
                  setAdminNote(msg.adminNote || '');
                }}
                className={`mb-card rounded-2xl p-4 border transition-all cursor-pointer space-y-2.5 ${
                  selectedMessage?._id === msg._id
                    ? 'border-brand ring-2 ring-brand/20 bg-brand-soft/20'
                    : msg.status === 'pending'
                    ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-950/10 hover:border-brand/40'
                    : 'border-line hover:border-brand/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="text-xs font-bold text-ink truncate">{msg.subject}</h4>
                    <p className="text-[11px] text-ink-3 flex items-center gap-1.5">
                      <User className="w-3 h-3 text-brand" />
                      <span className="font-semibold text-ink-2">{msg.name}</span>
                    </p>
                  </div>
                  {getStatusBadge(msg.status)}
                </div>

                <p className="text-xs text-ink-2 line-clamp-2 leading-relaxed">
                  {msg.message}
                </p>

                <div className="flex items-center justify-between text-[10.5px] text-ink-3 pt-2 border-t border-line/50">
                  <span className="font-mono">{msg.email}</span>
                  <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Selected Message Detail Panel */}
        {selectedMessage && (
          <div className="lg:col-span-2 mb-card rounded-3xl p-6 border border-line space-y-5 self-start sticky top-24">
            <div className="flex items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-3">
                  Inquiry Details
                </span>
                <h3 className="text-base font-black text-ink mt-0.5">{selectedMessage.subject}</h3>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedMessage.status)}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-1 rounded-lg text-ink-3 hover:text-ink cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sender details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-elev/60 p-4 rounded-2xl text-xs">
              <div className="space-y-1">
                <span className="text-ink-3">{isBengali ? 'প্রেরক:' : 'Sender:'}</span>
                <p className="font-bold text-ink">{selectedMessage.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-ink-3">{isBengali ? 'ইমেইল:' : 'Email:'}</span>
                <p className="font-mono font-semibold text-brand">
                  <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
                </p>
              </div>
              {selectedMessage.phone && (
                <div className="space-y-1">
                  <span className="text-ink-3">{isBengali ? 'মোবাইল নম্বর:' : 'Phone:'}</span>
                  <p className="font-mono font-semibold text-ink">
                    <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a>
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-ink-3">{isBengali ? 'তারিখ ও সময়:' : 'Submitted At:'}</span>
                <p className="text-ink-2">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-ink-3">{isBengali ? 'বার্তার বিবরণ:' : 'Full Message:'}</label>
              <div className="bg-card p-4 rounded-2xl border border-line text-xs text-ink leading-relaxed whitespace-pre-wrap">
                {selectedMessage.message}
              </div>
            </div>

            {/* Admin Note & Resolution */}
            <div className="space-y-3 pt-2 border-t border-line">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-brand" />
                <span>{isBengali ? 'অ্যাডমিন রেজ্যুলেশন নোট (অভ্যন্তরীণ):' : 'Admin Resolution Note:'}</span>
              </label>
              <textarea
                rows={2}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder={isBengali ? 'যেমন: ফোনে কথা বলে অ্যাকাউন্ট বুঝিয়ে দেওয়া হয়েছে...' : 'Internal notes...'}
                className="mb-input w-full text-xs"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: selectedMessage._id,
                        status: 'resolved',
                        adminNote,
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'সমাধানকৃত মার্ক করুন' : 'Mark Resolved'}</span>
                  </button>

                  <button
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: selectedMessage._id,
                        status: 'in_progress',
                        adminNote,
                      })
                    }
                    className="mb-btn-secondary !text-xs py-2 px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'চলমান রাখুন' : 'In Progress'}</span>
                  </button>

                  <button
                    disabled={updateMutation.isPending}
                    onClick={() =>
                      updateMutation.mutate({
                        id: selectedMessage._id,
                        adminNote,
                      })
                    }
                    className="mb-btn-secondary !text-xs py-2 px-3 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isBengali ? 'নোট সেভ' : 'Save Note'}</span>
                  </button>
                </div>

                <button
                  onClick={() => setDeleteId(selectedMessage._id)}
                  title={isBengali ? 'মেসেজ মুছুন' : 'Delete'}
                  className="p-2 rounded-xl text-ink-3 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <ConfirmationModal
          isOpen={!!deleteId}
          title={isBengali ? 'মেসেজ মুছে ফেলতে চান?' : 'Delete Message?'}
          message={isBengali ? 'এই সাপোর্ট মেসেজ রেকর্ডটি মুছে ফেলা হবে।' : 'This inquiry record will be deleted.'}
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

export default AdminSupportTab;
