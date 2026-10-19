import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
  AlertCircle,
  FileText,
  MapPin,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { User, UserRole, AccountStatus } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';
import { TANGAIL_UPAZILAS, getUpazilaDisplayName } from '../../../constants/locations';
import { useLanguage } from '../../../i18n/LanguageContext';
import ConfirmationModal from '../../common/ConfirmationModal';

interface AdminUsersTabProps {
  currentUserRole?: UserRole;
  currentUserId?: string;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  currentUserRole,
  currentUserId,
}) => {
  const queryClient = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();

  const isSuperAdmin = currentUserRole === UserRole.SUPER_ADMIN;

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [upazilaFilter, setUpazilaFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  // Role Change Modal State
  const [roleConfirmTarget, setRoleConfirmTarget] = useState<{ user: User; nextRole: UserRole } | null>(null);

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
      toast.success(isBengali ? 'ইউজারের স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে।' : 'User status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setStatusModalUser(null);
      setStatusReason('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'স্ট্যাটাস আপডেট করা যায়নি।' : 'Could not update status.'));
    },
  });

  // Update Role Mutation
  const roleMutation = useMutation({
    mutationFn: ({ userId, role, reason }: { userId: string; role: UserRole; reason?: string }) =>
      adminApi.updateUserRole(userId, { role, reason }),
    onSuccess: () => {
      toast.success(isBengali ? 'ইউজারের ভূমিকা সফলভাবে পরিবর্তন হয়েছে।' : 'User role updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'ভূমিকা পরিবর্তন করা যায়নি।' : 'Could not update role.'));
    },
  });

  // Delete User State & Mutation
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      toast.success(isBengali ? 'ইউজার অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে।' : 'User account deleted successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setDeleteTarget(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'ইউজার মুছে ফেলা যায়নি।' : 'Could not delete user.'));
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
      reason: statusReason.trim() || (isBengali ? 'প্রশাসনিক সিদ্ধান্ত' : 'Administrative decision'),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="mb-card p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-line pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-ink">
              {isBengali ? 'ইউজার ব্যবস্থাপনা' : 'User Management'}
            </h2>
            <p className="text-xs text-ink-3">
              {isBengali
                ? 'নিবন্ধিত ব্যবহারকারীদের প্রোফাইল নিরীক্ষা, স্ট্যাটাস পরিবর্তন এবং অ্যাক্টিভিটি পর্যবেক্ষণ'
                : 'Monitor registered user profiles, manage statuses, and oversee platform activity'}
            </p>
          </div>
          {meta?.total !== undefined && (
            <span className="text-xs font-bold text-ink-2 bg-elev px-3 py-1 rounded-full border border-line">
              {isBengali ? `মোট: ${formatNumber(meta.total)} জন` : `Total: ${formatNumber(meta.total)} users`}
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
              placeholder={isBengali ? 'নাম, ইমেইল বা ফোন খুঁজুন...' : 'Search name, email, or phone...'}
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
            <option value="">{isBengali ? 'সকল ভূমিকা (All Roles)' : 'All Roles'}</option>
            <option value="customer">{isBengali ? 'কাস্টমার (Customer)' : 'Customer'}</option>
            <option value="moderator">{isBengali ? 'মডারেটর (Moderator)' : 'Moderator'}</option>
            <option value="admin">{isBengali ? 'অ্যাডমিন (Admin)' : 'Admin'}</option>
            <option value="super_admin">{isBengali ? 'সুপার অ্যাডমিন (Super Admin)' : 'Super Admin'}</option>
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
            <option value="">{isBengali ? 'সকল স্ট্যাটাস (All Status)' : 'All Statuses'}</option>
            <option value="active">{isBengali ? 'সক্রিয় (Active)' : 'Active'}</option>
            <option value="pending">{isBengali ? 'অপেক্ষমাণ (Pending)' : 'Pending'}</option>
            <option value="suspended">{isBengali ? 'স্থগিত (Suspended)' : 'Suspended'}</option>
            <option value="banned">{isBengali ? 'নিষিদ্ধ (Banned)' : 'Banned'}</option>
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
            <option value="">{isBengali ? 'সকল উপজেলা (All Upazilas)' : 'All Upazilas'}</option>
            {TANGAIL_UPAZILAS.map((up) => (
              <option key={up} value={up}>
                {getUpazilaDisplayName(up, isBengali)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="mb-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label={isBengali ? 'ইউজার তালিকা লোড হচ্ছে...' : 'Loading user list...'} />
          </div>
        ) : usersList.length === 0 ? (
          <div className="py-16 text-center text-ink-3 space-y-2">
            <UserX className="w-10 h-10 mx-auto text-ink-3/40" />
            <p className="text-sm font-bold">{isBengali ? 'কোনো ইউজার পাওয়া যায়নি' : 'No users found'}</p>
            <p className="text-xs">{isBengali ? 'ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।' : 'Try adjusting your filters.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-elev/80 text-ink-3 font-bold border-b border-line uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">{isBengali ? 'ব্যবহারকারী' : 'User'}</th>
                  <th className="py-3 px-4">{isBengali ? 'যোগাযোগ' : 'Contact'}</th>
                  <th className="py-3 px-4">{isBengali ? 'ভূমিকা (Role)' : 'Role'}</th>
                  <th className="py-3 px-4">{isBengali ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3 px-4">{isBengali ? 'নিবন্ধনের তারিখ' : 'Registered At'}</th>
                  <th className="py-3 px-4 text-right">{isBengali ? 'পদক্ষেপ' : 'Actions'}</th>
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
                              {isBengali ? 'আপনি' : 'You'}
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
                              setRoleConfirmTarget({ user: u, nextRole });
                            }}
                            className="mb-input !text-[11px] font-bold !py-1 !px-2 !rounded-lg border-line bg-elev text-ink cursor-pointer"
                          >
                            <option value="customer">{isBengali ? 'কাস্টমার' : 'Customer'}</option>
                            <option value="moderator">{isBengali ? 'মডারেটর' : 'Moderator'}</option>
                            <option value="admin">{isBengali ? 'অ্যাডমিন' : 'Admin'}</option>
                            <option value="super_admin">{isBengali ? 'সুপার অ্যাডমিন' : 'Super Admin'}</option>
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
                          <span className="capitalize">{u.accountStatus}</span>
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 text-ink-3 text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(isBengali ? 'bn-BD' : 'en-US') : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setDetailUserId(uid)}
                          className="px-2 py-1 text-[11px] font-bold rounded-lg border border-line bg-elev hover:bg-brand-soft hover:text-brand-ink text-ink-2 cursor-pointer transition-colors"
                          title={isBengali ? 'বিস্তারিত তথ্য' : 'View Details'}
                        >
                          <Eye className="w-3.5 h-3.5 inline mr-1" />
                          <span>{isBengali ? 'ডিটেইল' : 'Details'}</span>
                        </button>

                        {!isSelf && (!isUserSuperAdmin || isSuperAdmin) && (
                          <>
                            {u.accountStatus === AccountStatus.ACTIVE ? (
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(u, AccountStatus.SUSPENDED)}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 cursor-pointer transition-colors"
                              >
                                {isBengali ? 'স্থগিত' : 'Suspend'}
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenStatusModal(u, AccountStatus.ACTIVE)}
                                className="px-2 py-1 text-[11px] font-bold rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 cursor-pointer transition-colors"
                              >
                                {isBengali ? 'সক্রিয়' : 'Activate'}
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setDeleteTarget(u)}
                              className="px-2 py-1 text-[11px] font-bold rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 cursor-pointer transition-colors"
                              title={isBengali ? 'ইউজার মুছুন' : 'Delete User'}
                            >
                              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                              <span>{isBengali ? 'মুছুন' : 'Delete'}</span>
                            </button>
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
              {isBengali
                ? `পৃষ্ঠা ${formatNumber(meta.page)} / ${formatNumber(meta.totalPages)} (মোট ${formatNumber(meta.total)} জন)`
                : `Page ${formatNumber(meta.page)} of ${formatNumber(meta.totalPages)} (Total: ${formatNumber(meta.total)})`}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-line bg-elev hover:bg-card disabled:opacity-40 cursor-pointer font-bold text-ink"
              >
                {isBengali ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              <button
                type="button"
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-line bg-elev hover:bg-card disabled:opacity-40 cursor-pointer font-bold text-ink"
              >
                {isBengali ? 'পরবর্তী' : 'Next'}
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
                <span>{isBengali ? 'ইউজার স্ট্যাটাস পরিবর্তন' : 'Change User Account Status'}</span>
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
              {isBengali ? (
                <>
                  আপনি <strong>{statusModalUser.name}</strong> ({statusModalUser.email})-এর অ্যাকাউন্ট স্ট্যাটাস{' '}
                  <strong className="text-brand uppercase">{targetStatus}</strong> এ রূপান্তর করতে যাচ্ছেন।
                </>
              ) : (
                <>
                  You are about to change the account status of{' '}
                  <strong>{statusModalUser.name}</strong> ({statusModalUser.email}) to{' '}
                  <strong className="text-brand uppercase">{targetStatus}</strong>.
                </>
              )}
            </p>

            <form onSubmit={handleConfirmStatusChange} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1">
                  {isBengali ? 'সিদ্ধান্তের কারণ (বাধ্যতামূলক):' : 'Reason for Decision (Required):'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder={isBengali ? 'যেমন: অনুপযুক্ত আচরণ, ভেরিফিকেশন সমস্যা বা অনুরোধ অনুযায়ী...' : 'e.g. Inappropriate conduct, verification failure, requested...'}
                  className="mb-input text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalUser(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-line hover:bg-elev cursor-pointer text-ink-2"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={statusMutation.isPending || !statusReason.trim()}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-brand text-white hover:bg-brand-strong disabled:opacity-50 cursor-pointer shadow-md shadow-brand/20"
                >
                  {statusMutation.isPending ? (isBengali ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBengali ? 'নিশ্চিত করুন' : 'Confirm')}
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
                <span>{isBengali ? 'ব্যবহারকারীর বিস্তারিত রেকর্ড' : 'User Detailed Profile & Activity'}</span>
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
                <LoadingSpinner size="md" label={isBengali ? 'রেকর্ড লোড হচ্ছে...' : 'Loading records...'} />
              </div>
            ) : detailData?.data ? (
              <div className="space-y-5 text-xs">
                {/* Basic User Info */}
                <div className="grid sm:grid-cols-2 gap-3 bg-elev p-4 rounded-xl border border-line">
                  <div>
                    <span className="text-ink-3">{isBengali ? 'নাম:' : 'Name:'}</span>{' '}
                    <strong className="text-ink">{detailData.data.user.name}</strong>
                  </div>
                  <div>
                    <span className="text-ink-3">{isBengali ? 'ইমেইল:' : 'Email:'}</span>{' '}
                    <strong className="text-ink font-mono">{detailData.data.user.email}</strong>
                  </div>
                  <div>
                    <span className="text-ink-3">{isBengali ? 'ফোন:' : 'Phone:'}</span>{' '}
                    <strong className="text-ink font-mono">{detailData.data.user.phone || '—'}</strong>
                  </div>
                  <div>
                    <span className="text-ink-3">{isBengali ? 'ভূমিকা:' : 'Role:'}</span>{' '}
                    <span className="font-bold text-brand uppercase">{detailData.data.user.role}</span>
                  </div>
                  <div>
                    <span className="text-ink-3">{isBengali ? 'স্ট্যাটাস:' : 'Status:'}</span>{' '}
                    <strong className="text-ink capitalize">{detailData.data.user.accountStatus}</strong>
                  </div>
                  <div>
                    <span className="text-ink-3">{isBengali ? 'কন্টাক্ট ক্রেডিট:' : 'Contact Credits:'}</span>{' '}
                    <strong className="text-ink">{formatNumber(detailData.data.user.contactCredits || 0)}</strong>
                  </div>
                </div>

                {/* Profile Details if available */}
                {detailData.data.profile ? (
                  <div className="space-y-2 border border-line rounded-xl p-4">
                    <h4 className="font-bold text-ink flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-brand" />
                      <span>{isBengali ? 'সংযুক্ত বৈবাহিক প্রোফাইল' : 'Linked Matrimonial Biodata'}</span>
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-2 text-ink-2">
                      <div>
                        {isBengali ? 'উপজেলা: ' : 'Upazila: '}
                        {getUpazilaDisplayName(detailData.data.profile.upazila, isBengali)}
                      </div>
                      <div>
                        {isBengali ? 'লিঙ্গ: ' : 'Gender: '}
                        {detailData.data.profile.gender === 'male' ? (isBengali ? 'পাত্র' : 'Male') : (isBengali ? 'পাত্রী' : 'Female')}
                      </div>
                      <div>
                        {isBengali ? 'পেশা: ' : 'Occupation: '}
                        {detailData.data.profile.occupation || '—'}
                      </div>
                      <div>
                        {isBengali ? 'শিক্ষাগত যোগ্যতা: ' : 'Education: '}
                        {detailData.data.profile.education || '—'}
                      </div>
                      <div>
                        {isBengali ? 'অনুমোদনের অবস্থা: ' : 'Approval Status: '}
                        {detailData.data.profile.isApproved
                          ? (isBengali ? 'অনুমোদিত' : 'Approved')
                          : (isBengali ? 'অনুমোদনহীন' : 'Unapproved')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-ink-3 italic">{isBengali ? 'কোনো বায়োডাটা প্রোফাইল তৈরি করা নেই।' : 'No matrimonial biodata created yet.'}</p>
                )}

                {/* Reports against user */}
                {detailData.data.reportsReceived && detailData.data.reportsReceived.length > 0 && (
                  <div className="space-y-2 border border-red-500/20 bg-red-500/5 rounded-xl p-4">
                    <h4 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>
                        {isBengali
                          ? `এই ব্যবহারকারীর বিরুদ্ধে অভিযোগ (${formatNumber(detailData.data.reportsReceived.length)} টি)`
                          : `Reports against this user (${formatNumber(detailData.data.reportsReceived.length)})`}
                      </span>
                    </h4>
                    <div className="divide-y divide-red-500/10">
                      {detailData.data.reportsReceived.map((rep: any) => (
                        <div key={rep._id} className="py-2">
                          <div className="font-bold text-ink">
                            {isBengali ? 'কারণ: ' : 'Reason: '}{rep.reason} ({isBengali ? 'স্ট্যাটাস: ' : 'Status: '}{rep.status})
                          </div>
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

      {/* Role Change Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(roleConfirmTarget)}
        onClose={() => setRoleConfirmTarget(null)}
        onConfirm={() => {
          if (roleConfirmTarget) {
            roleMutation.mutate({
              userId: roleConfirmTarget.user.id || roleConfirmTarget.user._id || '',
              role: roleConfirmTarget.nextRole,
            });
            setRoleConfirmTarget(null);
          }
        }}
        title={isBengali ? 'ইউজার ভূমিকা পরিবর্তন' : 'Change User Role'}
        message={
          roleConfirmTarget ? (
            isBengali ? (
              <>
                আপনি কি নিশ্চিতভাবে <strong>{roleConfirmTarget.user.name}</strong>-এর ভূমিকা{' '}
                <strong className="text-brand uppercase font-black">{roleConfirmTarget.nextRole}</strong>-এ রূপান্তর করতে চান?
              </>
            ) : (
              <>
                Are you sure you want to change <strong>{roleConfirmTarget.user.name}</strong>'s role to{' '}
                <strong className="text-brand uppercase font-black">{roleConfirmTarget.nextRole}</strong>?
              </>
            )
          ) : null
        }
        confirmText={isBengali ? 'হ্যাঁ, পরিবর্তন করুন' : 'Confirm Change'}
        variant="warning"
        isLoading={roleMutation.isPending}
      />

      {/* Delete User Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id || deleteTarget._id || '');
          }
        }}
        title={isBengali ? 'ইউজার অ্যাকাউন্ট মুছে ফেলা' : 'Delete User Account'}
        message={
          deleteTarget ? (
            isBengali ? (
              <>
                আপনি কি নিশ্চিতভাবে <strong>{deleteTarget.name || deleteTarget.email}</strong>-এর অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলতে চান?
                <br />
                <span className="text-red-500 font-semibold mt-1 inline-block">
                  ⚠️ সতর্কবার্তা: ইউজারের সকল বায়োডাটা, আগ্রহ, ও তথ্য ডাটাবেজ থেকে চিরতরে মুছে যাবে।
                </span>
              </>
            ) : (
              <>
                Are you sure you want to permanently delete the account of <strong>{deleteTarget.name || deleteTarget.email}</strong>?
                <br />
                <span className="text-red-500 font-semibold mt-1 inline-block">
                  ⚠️ Warning: All their biodata, interests, and profile records will be permanently erased.
                </span>
              </>
            )
          ) : null
        }
        confirmText={isBengali ? 'স্থায়ীভাবে মুছুন' : 'Delete Permanently'}
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminUsersTab;
