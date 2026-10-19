import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserCog,
  Plus,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../../api/admin.api';
import { AdminStaffUser, UserRole, AccountStatus } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';
import { useLanguage } from '../../../i18n/LanguageContext';

export const AdminTeamTab: React.FC<{ currentUserId?: string }> = ({ currentUserId }) => {
  const queryClient = useQueryClient();
  const { isBengali } = useLanguage();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.ADMIN);

  // List admins query
  const { data: teamData, isLoading } = useQuery({
    queryKey: ['admin-team'],
    queryFn: () => adminApi.listAdmins(),
  });

  // Create Admin Mutation
  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createAdmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        role,
      }),
    onSuccess: () => {
      toast.success(isBengali ? 'নতুন প্রশাসনিক অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!' : 'New administrative account created successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'অ্যাকাউন্ট তৈরি করা যায়নি।' : 'Could not create account.'));
    },
  });

  // Toggle Admin Status Mutation
  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: AccountStatus }) =>
      adminApi.updateUserStatus(userId, {
        status,
        reason: isBengali ? 'সুপার অ্যাডমিন কর্তৃক স্ট্যাটাস পরিবর্তন' : 'Status updated by Super Admin',
      }),
    onSuccess: () => {
      toast.success(isBengali ? 'স্ট্যাটাস সফলভাবে পরিবর্তিত হয়েছে।' : 'Status updated successfully.');
      queryClient.invalidateQueries({ queryKey: ['admin-team'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || (isBengali ? 'স্ট্যাটাস পরিবর্তন করা যায়নি।' : 'Could not change status.'));
    },
  });

  const closeModal = () => {
    setCreateModalOpen(false);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRole(UserRole.ADMIN);
  };

  const staffList = teamData?.data?.admins || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-ink flex items-center gap-2">
            <UserCog className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>{isBengali ? 'অ্যাডমিন টিম ও ভূমিকা ব্যবস্থাপনা (Admin Team Management)' : 'Admin Team & Role Management'}</span>
          </h2>
          <p className="text-xs text-ink-3">
            {isBengali
              ? 'শুধুমাত্র সুপার অ্যাডমিনের জন্য সংরক্ষিত: নতুন অ্যাডমিন তৈরি ও প্রশাসনিক অধিকার নিয়ন্ত্রণ'
              : 'Restricted to Super Admin: Create admin accounts and manage staff access'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 cursor-pointer shadow-md shadow-purple-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isBengali ? 'নতুন অ্যাডমিন নিয়োগ করুন' : 'Add New Admin'}</span>
        </button>
      </div>

      {/* Staff Table */}
      <div className="mb-card overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" label={isBengali ? 'অ্যাডমিন তালিকা লোড হচ্ছে...' : 'Loading admin team...'} />
          </div>
        ) : staffList.length === 0 ? (
          <div className="py-16 text-center text-ink-3">
            <p className="text-sm font-bold">{isBengali ? 'কোনো কর্মকর্তা তালিকাভুক্ত নেই।' : 'No administrators listed.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-elev/80 text-ink-3 font-bold border-b border-line uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">{isBengali ? 'কর্মকর্তার নাম' : 'Staff Name'}</th>
                  <th className="py-3 px-4">{isBengali ? 'ইমেইল ও ফোন' : 'Email & Phone'}</th>
                  <th className="py-3 px-4">{isBengali ? 'প্রশাসনিক পদবী' : 'Role'}</th>
                  <th className="py-3 px-4">{isBengali ? 'স্ট্যাটাস' : 'Status'}</th>
                  <th className="py-3 px-4">{isBengali ? 'সর্বশেষ সক্রিয়' : 'Last Active'}</th>
                  <th className="py-3 px-4 text-right">{isBengali ? 'পদক্ষেপ' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {staffList.map((st: AdminStaffUser) => {
                  const uid = st._id || st.id || '';
                  const isSelf = uid === currentUserId;
                  const isSuper = st.role === UserRole.SUPER_ADMIN;

                  return (
                    <tr key={uid} className="hover:bg-elev/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-ink">
                        <div className="flex items-center gap-1.5">
                          <span>{st.name}</span>
                          {isSelf && (
                            <span className="text-[10px] font-black text-purple-600 bg-purple-500/10 px-1.5 py-0.2 rounded-sm">
                              {isBengali ? 'আপনি' : 'You'}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-ink-2">{st.email}</div>
                        {st.phone && <div className="text-[11px] font-mono text-ink-3">{st.phone}</div>}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            st.role === UserRole.SUPER_ADMIN
                              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                              : st.role === UserRole.ADMIN
                              ? 'bg-brand-soft text-brand-ink border border-brand/30'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {st.role === UserRole.SUPER_ADMIN && <ShieldAlert className="w-3 h-3" />}
                          {st.role === UserRole.ADMIN && <ShieldCheck className="w-3 h-3" />}
                          {st.role === UserRole.MODERATOR && <UserCheck className="w-3 h-3" />}
                          <span className="uppercase">{st.role}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            st.accountStatus === AccountStatus.ACTIVE
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-amber-500/15 text-amber-600'
                          }`}
                        >
                          <span className="capitalize">{st.accountStatus}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-ink-3 text-[11px]">
                        {st.lastLogin
                          ? new Date(st.lastLogin).toLocaleString(isBengali ? 'bn-BD' : 'en-US', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : (isBengali ? 'কখনো লগইন করেননি' : 'Never logged in')}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isSelf && !isSuper && (
                          <button
                            type="button"
                            onClick={() => {
                              const next =
                                st.accountStatus === AccountStatus.ACTIVE
                                  ? AccountStatus.SUSPENDED
                                  : AccountStatus.ACTIVE;
                              const confirmMsg = isBengali
                                ? 'আপনি কি নিশ্চিতভাবে এই অ্যাকাউন্টের স্ট্যাটাস পরিবর্তন করতে চান?'
                                : 'Are you sure you want to change the status of this account?';
                              if (window.confirm(confirmMsg)) {
                                statusMutation.mutate({ userId: uid, status: next });
                              }
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-line bg-elev hover:bg-card cursor-pointer"
                          >
                            {st.accountStatus === AccountStatus.ACTIVE
                              ? (isBengali ? 'নিষ্ক্রিয় করুন' : 'Deactivate')
                              : (isBengali ? 'সক্রিয় করুন' : 'Activate')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Admin Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="mb-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <UserCog className="w-5 h-5 text-purple-600" />
                <span>{isBengali ? 'নতুন প্রশাসনিক অ্যাকাউন্ট তৈরি' : 'Create Administrative Account'}</span>
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="text-ink-3 hover:text-ink cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'পূর্ণ নাম (Full Name):' : 'Full Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isBengali ? 'যেমন: মোঃ কামরুল ইসলাম' : 'e.g. Kamrul Islam'}
                  className="mb-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'ইমেইল ঠিকানা (Email):' : 'Email Address:'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin2@madhubondhon.com"
                  className="mb-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'ফোন নম্বর (ঐচ্ছিক):' : 'Phone Number (Optional):'}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="mb-input text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'পাসওয়ার্ড (Password):' : 'Password:'}
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isBengali ? 'কমপক্ষে ৮ অক্ষরের শক্তিশালী পাসওয়ার্ড' : 'At least 8 strong characters'}
                  className="mb-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-ink mb-1">
                  {isBengali ? 'প্রশাসনিক ভূমিকা (Role):' : 'Administrative Role:'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="mb-input text-xs"
                >
                  <option value="admin">
                    {isBengali ? 'অ্যাডমিন (Admin - সম্পূর্ণ ব্যবস্থাপনা)' : 'Admin (Full Management)'}
                  </option>
                  <option value="moderator">
                    {isBengali ? 'মডারেটর (Moderator - বায়োডাটা ও রিপোর্ট নিরীক্ষা)' : 'Moderator (Review biodata & reports)'}
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 font-bold rounded-xl border border-line hover:bg-elev cursor-pointer text-ink-2"
                >
                  {isBengali ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || !name.trim() || !email.trim() || !password}
                  className="px-4 py-2 font-bold rounded-xl bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 cursor-pointer shadow-md shadow-purple-600/20"
                >
                  {createMutation.isPending
                    ? (isBengali ? 'তৈরি হচ্ছে...' : 'Creating...')
                    : (isBengali ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeamTab;
