import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Filter,
  Eye,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  Phone,
  Mail,
  History,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { User, UserRole, AccountStatus } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES } from '../../../constants/locations';

interface AdminUsersTabProps {
  currentUserRole?: UserRole;
  currentUserId?: string;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  currentUserRole,
  currentUserId,
}) => {
  const queryClient = useQueryClient();

  const isSuperAdmin = currentUserRole === UserRole.SUPER_ADMIN;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [upazilaFilter, setUpazilaFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Status Change Modal State
  const [statusModalUser, setStatusModalUser] = useState<User | null>(null);
  const [targetStatus, setTargetStatus] = useState<AccountStatus>(AccountStatus.ACTIVE);
  const [statusReason, setStatusReason] = useState('');

  // User Detail Modal State
  const [detailUserId, setDetailUserId] = useState<string | null>(null);

  // Users Query
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', search, roleFilter, statusFilter, upazilaFilter, page],
    queryFn: () =>
      adminApi.listUsers({
        search: search.trim() || undefined,
        role: (roleFilter as UserRole) || undefined,
        status: (statusFilter as AccountStatus) || undefined,
        upazila: upazilaFilter || undefined,
        page,
        limit: 15,
      }),
  });

  // User Detail Query
  const { data: detailData, isLoading: isDetailLoading } = useQuery({
    queryKey: ['admin-user-detail', detailUserId],
    enabled: Boolean(detailUserId),
    queryFn: () => (detailUserId ? adminApi.getUserDetails(detailUserId) : null),
  });

  // Update Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: AccountStatus; reason: string }) =>
      adminApi.updateUserStatus(userId, { status, reason }),
    onSuccess: () => {
      toast.success('ইউজারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setStatusModalUser(null);
      setStatusReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'স্ট্যাটাস আপডেট করা যায়নি।');
    },
  });

  // Update Role Mutation
  const roleMutation = useMutation({
    mutationFn: ({ userId, role, reason }: { userId: string; role: UserRole; reason?: string }) =>
      adminApi.updateUserRole(userId, { role, reason }),
    onSuccess: () => {
      toast.success('ইউজারের ভূমিকা সফলভাবে পরিবর্তন হয়েছে।');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'ভূমিকা পরিবর্তন করা যায়নি।');
    },
  });

  const usersList = usersData?.data?.users || [];
  const meta = usersData?.meta;

  const handleOpenStatusModal = (user: User, nextStatus: AccountStatus) => {
    setStatusModalUser(user);
    setTargetStatus(nextStatus);
    setStatusReason('');
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalUser) return;
    statusMutation.mutate({
      userId: statusModalUser.id || statusModalUser._id || '',
      status: targetStatus,
      reason: statusReason.trim() || 'প্রশাসনিক সিদ্ধান্ত',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="mb-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink">ইউজার ব্যবস্থাপনা</h2>
            <p className="text-xs text-ink-3">
              নিবন্ধিত ব্যবহারকারীদের প্রোফাইল নিরীক্ষা, স্ট্যাটাস পরিবর্তন এবং অ্যাক্টিভিটি পর্যবেক্ষণ
            </p>
          </div>
          {meta?.total !== undefined && (
            <span className="text-xs font-bold text-ink-2 bg-elev px-3 py-1 rounded-full border border-line">
              মোট: {meta.total.toLocaleString('bn-BD')} জন
            </span>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="নাম, ইমেইল বা ফোন খুঁজুন..."
              className="mb-input pl-9 text-xs"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="mb-input text-xs"
          >
            <option value="">সকল ভূমিকা (All Roles)</option>
            <option value="customer">কাস্টমার (Customer)</option>
            <option value="moderator">মডারেটর (Moderator)</option>
            <option value="admin">অ্যাডমিন (Admin)</option>
            <option value="super_admin">সুপার অ্যাডমিন (Super Admin)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="mb-input text-xs"
          >
            <option value="">সকল স্ট্যাটাস (All Status)</option>
            <option value="active">সক্রিয় (Active)</option>
            <option value="pending">অপেক্ষমাণ (Pending)</option>
            <option value="suspended">স্থগিত (Suspended)</option>
            <option value="banned">নিষিদ্ধ (Banned)</option>
          </select>

          {/* Upazila Filter */}
          <select
            value={upazilaFilter}
            onChange={(e) => {
              setUpazilaFilter(e.target.value);
              setPage(1);
            }}
            className="mb-input text-xs"
          >
            <option value="">সকল উপজেলা (All Upazilas)</option>
            {TANGAIL_UPAZILAS.map((up) => (
              <option key={up} value={up}>
                {UPAZILA_DISPLAY_NAMES[up]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="mb-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label="ইউজার তালিকা লোড হচ্ছে..." />
          </div>
        ) : usersList.length === 0 ? (
          <div className="py-16 text-center text-ink-3 space-y-2">
            <UserX className="w-10 h-10 mx-auto text-ink-3/40" />
            <p className="text-sm font-bold">কোনো ইউজার পাওয়া যায়নি</p>
            <p className="text-xs">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-elev/80 text-ink-3 font-bold border-b border-line uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">ব্যবহারকারী</th>
                  <th className="py-3 px-4">যোগাযোগ</th>
                  <th className="py-3 px-4">ভূমিকা (Role)</th>
                  <th className="py-3 px-4">স্ট্যাটাস</th>
                  <th className="py-3 px-4">নিবন্ধনের তারিখ</th>
                  <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {usersList.map((u: User) => {
                  const uid = u.id || u._id || '';
                  const isSelf = uid === currentUserId;
                  const isUserSuperAdmin = u.role === UserRole.SUPER_ADMIN;

                  return (
                    <tr key={uid} className="hover:bg-elev/40 transition-colors">
                      {/* Name & ID */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-ink flex items-center gap-1.5">
                          <span>{u.name}</span>
                          {isSelf && (
                            <span className="text-[10px] font-black text-brand bg-brand-soft px-1.5 py-0.2 rounded-sm">
                              আপনি
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-ink-3 truncate max-w-[120px]">
                          ID: {uid}
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-3 px-4 space-y-0.5">
                        <div className="font-mono text-ink-2">{u.email}</div>
                        {u.phone && (
                          <div className="text-[11px] text-ink-3 font-mono">{u.phone}</div>
                        )}
                      </td>

                      {/* Role selection */}
                      <td className="py-3 px-4">
                        {isSuperAdmin && !isSelf ? (
                          <select
                            value={u.role}
                            disabled={roleMutation.isPending}
                            onChange={(e) => {
                              const nextRole = e.target.value as UserRole;
                              if (window.confirm(`আপনি কি নিশ্চিতভাবে ${u.name}-এর ভূমিকা ${nextRole}-এ পরিবর্তন করতে চান?`)) {
                                roleMutation.mutate({ userId: uid, role: nextRole });
                              }
                            }}
                            className="mb-input !text-[11px] font-bold !py-1 !px-2 !rounded-lg border-line bg-elev text-ink cursor-pointer"
                          >
                            <option value="customer">কাস্টমার</option>
                            <option value="moderator">মডারেটর</option>
                            <option value="admin">অ্যাডমিন</option>
                            <option value="super_admin">সুপার অ্যাডমিন</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              u.role === UserRole.SUPER_ADMIN
                                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                                : u.role === UserRole.ADMIN
                                ? 'bg-brand-soft text-brand-ink border border-brand/30'
                                : u.role === UserRole.MODERATOR
                                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                                : 'bg-elev text-ink-2'
                            }`}
                          >
                            {u.role}
                          </span>
                        )}
                      </td>

                      {/* Account Status Badge & Action */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.accountStatus === AccountStatus.ACTIVE
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : u.accountStatus === AccountStatus.SUSPENDED
                              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400'
                              : u.accountStatus === AccountStatus.BANNED
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400'
                              : 'bg-elev text-ink-3'
                          }`}
                        >
                          {u.accountStatus === AccountStatus.ACTIVE && <UserCheck className="w-3 h-3" />}
                          {u.accountStatus === AccountStatus.SUSPENDED && <AlertCircle className="w-3 h-3" />}
                          {u.accountStatus === AccountStatus.BANNED && <UserX className="w-3 h-3" />}
                          <span>{u.accountStatus}</span>
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 text-ink-3 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('bn-BD') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDetailUserId(uid)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-line bg-elev hover:bg-brand-soft hover:text-brand-ink text-ink-2 cursor-pointer transition-colors"
                          title="বিস্তারিত তথ্য"
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          <span>ডিটেইল</span>
                        </button>

                        {!isSelf && (!isUserSuperAdmin || isSuperAdmin) && (
                          <>
                            {u.accountStatus === AccountStatus.ACTIVE ? (
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(u, AccountStatus.SUSPENDED)}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 cursor-pointer transition-colors"
                              >
                                স্থগিত
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(u, AccountStatus.ACTIVE)}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
                              >
                                সক্রিয়
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-line text-xs">
            <span className="text-ink-3">
              পৃষ্ঠা {meta.page} / {meta.totalPages} (মোট {meta.total} জন)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-line bg-elev hover:bg-card disabled:opacity-40 cursor-pointer font-bold text-ink"
              >
                পূর্ববর্তী
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-line bg-elev hover:bg-card disabled:opacity-40 cursor-pointer font-bold text-ink"
              >
                পরবর্তী
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status Confirmation Modal */}
      {statusModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="mb-card max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>ইউজার স্ট্যাটাস পরিবর্তন</span>
              </h3>
              <button
                type="button"
                onClick={() => setStatusModalUser(null)}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-2 leading-relaxed">
              আপনি <strong>{statusModalUser.name}</strong> ({statusModalUser.email})-এর অ্যাকাউন্ট স্ট্যাটাস{' '}
              <strong className="text-brand uppercase">{targetStatus}</strong> এ রূপান্তর করতে যাচ্ছেন।
            </p>

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  সিদ্ধান্তের কারণ (বাধ্যতামূলক):
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="যেমন: অনুপযুক্ত আচরণ, ভেরিফিকেশন সমস্যা বা অনুরোধ অনুযায়ী..."
                  className="mb-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalUser(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-line hover:bg-elev cursor-pointer text-ink-2"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={statusMutation.isPending || !statusReason.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:bg-brand-strong disabled:opacity-50 cursor-pointer shadow-md shadow-brand/20"
                >
                  {statusMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Detail Drawer / Modal */}
      {detailUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="mb-card max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <FileText className="w-5 h-5 text-brand" />
                <span>ব্যবহারকারীর বিস্তারিত রেকর্ড</span>
              </h3>
              <button
                type="button"
                onClick={() => setDetailUserId(null)}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="py-12 flex justify-center">
                <LoadingSpinner size="md" label="রেকর্ড লোড হচ্ছে..." />
              </div>
            ) : detailData?.data ? (
              <div className="space-y-5 text-xs">
                {/* Basic User Info */}
                <div className="grid sm:grid-cols-2 gap-3 bg-elev p-4 rounded-xl border border-line">
                  <div>
                    <span className="text-ink-3">নাম:</span>{' '}
                    <strong className="text-ink">{detailData.data.user.name}</strong>
                  </div>
                  <div>
                    <span className="text-ink-3">ইমেইল:</span>{' '}
                    <strong className="text-ink font-mono">{detailData.data.user.email}</strong>
                  </div>
                  <div>
                    <span className="text-ink-3">ফোন:</span>{' '}
                    <strong className="text-ink font-mono">{detailData.data.user.phone || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-ink-3">ভূমিকা:</span>{' '}
                    <span className="font-bold text-brand uppercase">{detailData.data.user.role}</span>
                  </div>
                  <div>
                    <span className="text-ink-3">স্ট্যাটাস:</span>{' '}
                    <strong className="text-ink">{detailData.data.user.accountStatus}</strong>
                  </div>
                  <div>
                    <span className="text-ink-3">কন্টাক্ট ক্রেডিট:</span>{' '}
                    <strong className="text-ink">{detailData.data.user.contactCredits || 0}</strong>
                  </div>
                </div>

                {/* Profile Details if available */}
                {detailData.data.profile ? (
                  <div className="space-y-2 border border-line rounded-xl p-4">
                    <h4 className="font-bold text-ink flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand" />
                      <span>সংযুক্ত বৈবাহিক প্রোফাইল</span>
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-ink-2">
                      <div>উপজেলা: {UPAZILA_DISPLAY_NAMES[detailData.data.profile.upazila as keyof typeof UPAZILA_DISPLAY_NAMES] || detailData.data.profile.upazila}</div>
                      <div>লিঙ্গ: {detailData.data.profile.gender === 'male' ? 'পাত্র' : 'পাত্রী'}</div>
                      <div>পেশা: {detailData.data.profile.occupation || '—'}</div>
                      <div>শিক্ষাগত যোগ্যতা: {detailData.data.profile.education || '—'}</div>
                      <div>অনুমোদনের অবস্থা: {detailData.data.profile.isApproved ? 'অনুমোদিত' : 'অনুমোদনহীন'}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-ink-3 italic">কোনো বায়োডাটা প্রোফাইল তৈরি করা নেই।</p>
                )}

                {/* Reports against user */}
                {detailData.data.reportsReceived && detailData.data.reportsReceived.length > 0 && (
                  <div className="space-y-2 border border-red-500/20 bg-red-500/5 rounded-xl p-4">
                    <h4 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>এই ব্যবহারকারীর বিরুদ্ধে অভিযোগ ({detailData.data.reportsReceived.length} টি)</span>
                    </h4>
                    <div className="divide-y divide-red-500/10">
                      {detailData.data.reportsReceived.map((rep: any) => (
                        <div key={rep._id} className="py-2">
                          <div className="font-bold text-ink">কারণ: {rep.reason} (স্ট্যাটাস: {rep.status})</div>
                          <div className="text-ink-3 text-[11px]">{rep.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTab;
