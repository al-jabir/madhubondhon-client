import MarriageStatisticsSettings from '../components/profile/MarriageStatisticsSettings';
import ReviewQueue from "../components/profile/ReviewQueue";
import AdminPaymentsQueue from "../components/admin/AdminPaymentsQueue";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  Activity,
  Search,
  CheckCircle,
  History,
  Coins,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "../api/admin.api";
import { reportsApi, ReportItem } from "../api/reports.api";
import { useAuth } from "../context/useAuth";
import { User, UserRole, AccountStatus } from "../types";
import LoadingSpinner from "../components/common/LoadingSpinner";

export const AdminDashboardPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<
    "users" | "reports" | "audit" | "profiles" | "payments"
  >(currentUser?.role === UserRole.MODERATOR ? "profiles" : "users");
  const [userSearch, setUserSearch] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("");

  // Stats Query
  const { data: statsData } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminApi.getStats(),
  });

  // Users Query
  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: [
      "admin-users",
      userSearch,
      selectedRoleFilter,
      selectedStatusFilter,
    ],
    enabled:
      currentUser?.role === UserRole.ADMIN ||
      currentUser?.role === UserRole.SUPER_ADMIN,
    queryFn: () =>
      adminApi.listUsers({
        search: userSearch || undefined,
        role: (selectedRoleFilter as UserRole) || undefined,
        status: (selectedStatusFilter as AccountStatus) || undefined,
        limit: 20,
      }),
  });

  // Reports Query
  const { data: reportsData, isLoading: isReportsLoading } = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => reportsApi.listReports(),
  });

  // Audit Logs Query
  const { data: auditData, isLoading: isAuditLoading } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => adminApi.getAuditLogs({ limit: 20 }),
    enabled:
      activeTab === "audit" &&
      (currentUser?.role === UserRole.ADMIN ||
        currentUser?.role === UserRole.SUPER_ADMIN),
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: AccountStatus;
    }) => adminApi.updateUserStatus(userId, { status }),
    onSuccess: () => {
      toast.success("ইউজার স্ট্যাটাস সফলভাবে আপডেট করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে";
      toast.error(msg);
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminApi.updateUserRole(userId, { role }),
    onSuccess: () => {
      toast.success("ইউজার রোল সফলভাবে আপডেট করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "রোল পরিবর্তন ব্যর্থ হয়েছে";
      toast.error(msg);
    },
  });

  const resolveReportMutation = useMutation({
    mutationFn: ({
      id,
      status,
      resolutionNote,
    }: {
      id: string;
      status: "resolved" | "dismissed";
      resolutionNote?: string;
    }) => reportsApi.resolveReport(id, { status, resolutionNote }),
    onSuccess: () => {
      toast.success("রিপোর্ট নিষ্পত্তি করা হয়েছে");
      queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "রিপোর্ট নিষ্পত্তি করতে সমস্যা হয়েছে";
      toast.error(msg);
    },
  });

  const stats = statsData?.data?.stats;
  const usersList = usersData?.data?.users || [];
  const reportsList = reportsData?.data?.reports || [];
  const auditLogs = auditData?.data?.auditLogs || [];

  const isSuperAdminOrAdmin =
    currentUser?.role === UserRole.ADMIN ||
    currentUser?.role === UserRole.SUPER_ADMIN;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-line pb-5">
        <div className="flex items-center gap-2.5">
          <Shield className="w-8 h-8 text-brand" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
              অ্যাডমিন ও মডারেশন কন্ট্রোল প্যানেল
            </h1>
            <p className="text-xs sm:text-sm text-ink-3 mt-0.5">
              মধুবন্ধন টাঙ্গাইল মেট্রিমনি প্ল্যাটফর্মের সার্বিক নিয়ন্ত্রণ ও
              নিরাপত্তা পর্যবেক্ষণ
            </p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="mb-card p-5 space-y-1">
            <div className="flex items-center justify-between text-ink-3">
              <span className="text-xs font-bold">মোট ইউজার</span>
              <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand/25 flex items-center justify-center">
                <Users className="w-4 h-4 text-brand" />
              </div>
            </div>
            <div className="text-2xl font-black text-ink">
              {stats.totalUsers || 0}
            </div>
          </div>

          <div className="mb-card p-5 space-y-1">
            <div className="flex items-center justify-between text-ink-3">
              <span className="text-xs font-bold">মোট বায়োডাটা</span>
              <div className="w-8 h-8 rounded-lg bg-brand-soft border border-brand/25 flex items-center justify-center">
                <FileText className="w-4 h-4 text-brand" />
              </div>
            </div>
            <div className="text-2xl font-black text-ink">
              {stats.totalProfiles || 0}
            </div>
          </div>

          <div className="mb-card p-5 space-y-1">
            <div className="flex items-center justify-between text-ink-3">
              <span className="text-xs font-bold">সক্রিয় অ্যাকাউন্ট</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div className="text-2xl font-black text-ink">
              {stats.activeUsers || 0}
            </div>
          </div>

          <div className="mb-card p-5 space-y-1">
            <div className="flex items-center justify-between text-ink-3">
              <span className="text-xs font-bold">মুলতবি রিপোর্ট</span>
              <div className="w-8 h-8 rounded-lg bg-gold-soft border border-gold/25 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-gold" />
              </div>
            </div>
            <div className="text-2xl font-black text-ink">
              {stats.pendingReports || 0}
            </div>
          </div>
        </div>
      )}

      {isSuperAdminOrAdmin && <MarriageStatisticsSettings />}

      {/* Tab Navigation */}
      <div className="bg-elev rounded-full p-1 flex overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab("profiles")}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "profiles"
              ? "bg-card text-brand shadow-sm scale-100"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>বায়োডাটা অনুমোদন</span>
        </button>
        <button
          type="button"
          disabled={!isSuperAdminOrAdmin}
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer disabled:opacity-40 whitespace-nowrap ${
            activeTab === "users"
              ? "bg-card text-brand shadow-sm scale-100"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>ইউজার ব্যবস্থাপনা</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "reports"
              ? "bg-card text-brand shadow-sm scale-100"
              : "text-ink-2 hover:text-ink"
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>অভিযোগ ও মডারেশন ({reportsList.length})</span>
        </button>

        {isSuperAdminOrAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "audit"
                ? "bg-card text-brand shadow-sm scale-100"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            <History className="w-4 h-4" />
            <span>সিকিউরিটি অডিট লগ</span>
          </button>
        )}

        {isSuperAdminOrAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "payments"
                ? "bg-card text-brand shadow-sm scale-100"
                : "text-ink-2 hover:text-ink"
            }`}
          >
            <Coins className="w-4 h-4 text-gold fill-gold/30" />
            <span>পেমেন্ট ও ক্রেডিট</span>
          </button>
        )}
      </div>

      {activeTab === "profiles" && <ReviewQueue />}
      {activeTab === "payments" && <AdminPaymentsQueue />}

      {/* Tab 1: User Management */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-card p-4 rounded-2xl border border-line flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-ink-3 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নাম বা ইমেইল দিয়ে খুঁজুন..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="mb-input w-full !text-xs !bg-elev !border-line !rounded-xl pl-9 pr-3 py-2"
              />
            </div>

            <select
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="mb-input !text-xs !bg-elev !border-line !rounded-xl py-2"
            >
              <option value="">সকল রোল</option>
              <option value="customer">কাস্টমার (Customer)</option>
              <option value="moderator">মডারেটর (Moderator)</option>
              <option value="admin">অ্যাডমিন (Admin)</option>
              <option value="super_admin">সুপার অ্যাডমিন</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="mb-input !text-xs !bg-elev !border-line !rounded-xl py-2"
            >
              <option value="">সকল স্ট্যাটাস</option>
              <option value="active">সক্রিয় (Active)</option>
              <option value="pending">বিবেচনাধীন (Pending)</option>
              <option value="suspended">সাময়িক বরখাস্ত (Suspended)</option>
              <option value="banned">নিষিদ্ধ (Banned)</option>
            </select>
          </div>

          {/* Table */}
          {isUsersLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" label="ইউজার তালিকা লোড হচ্ছে..." />
            </div>
          ) : (
            <div className="mb-card overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-elev border-b border-line text-ink-2 font-bold">
                  <tr>
                    <th className="py-3 px-4">ইউজার</th>
                    <th className="py-3 px-4">ইমেইল</th>
                    <th className="py-3 px-4">রোল (Role)</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u: User) => (
                    <tr
                      key={u.id || u._id}
                      className="border-t border-line hover:bg-elev/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-ink">
                        {u.name}
                      </td>
                      <td className="py-3 px-4 text-ink-2 font-mono">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        {isSuperAdminOrAdmin ? (
                          <select
                            value={u.role}
                            onChange={(e) =>
                              updateRoleMutation.mutate({
                                userId: u.id || u._id || "",
                                role: e.target.value as UserRole,
                              })
                            }
                            className="mb-input !text-xs font-semibold !border-line !rounded-lg p-1 !bg-elev !text-ink"
                          >
                            <option value="customer">customer</option>
                            <option value="moderator">moderator</option>
                            <option value="admin">admin</option>
                            <option value="super_admin">super_admin</option>
                          </select>
                        ) : (
                          <span className="font-semibold uppercase text-ink-2">
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.accountStatus}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              userId: u.id || u._id || "",
                              status: e.target.value as AccountStatus,
                            })
                          }
                          className="mb-input !text-xs font-semibold !border-line !rounded-lg p-1 !bg-elev !text-ink"
                        >
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                          <option value="banned">Banned</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[11px] text-ink-3">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("bn-BD")
                            : "উল্লেখ নেই"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Reports & Moderation */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {isReportsLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" label="রিপোর্ট তালিকা লোড হচ্ছে..." />
            </div>
          ) : reportsList.length === 0 ? (
            <div className="mb-card py-16 text-center p-8 space-y-2">
              <CheckCircle className="w-12 h-12 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h3 className="font-bold text-ink">
                কোনো মুলতবি অভিযোগ নেই
              </h3>
              <p className="text-xs text-ink-3">
                সকল অভিযোগ সফলভাবে নিষ্পত্তি করা হয়েছে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {reportsList.map((rep: ReportItem) => (
                <div
                  key={rep._id}
                  className="mb-card p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-gold-soft text-gold border border-gold/25">
                        কারণ: {rep.reason}
                      </span>
                      <span className="text-xs text-ink-3">
                        স্ট্যাটাস: {rep.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-ink-3">
                      তারিখ:{" "}
                      {new Date(rep.createdAt).toLocaleDateString("bn-BD")}
                    </span>
                  </div>

                  {rep.description && (
                    <p className="text-xs text-ink-2 leading-relaxed bg-elev p-3 rounded-xl">
                      "{rep.description}"
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        resolveReportMutation.mutate({
                          id: rep._id,
                          status: "resolved",
                          resolutionNote:
                            "মডারেটর দ্বারা ব্যবস্থা গ্রহণ করে সমাধান করা হয়েছে",
                        })
                      }
                      className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                    >
                      সমাধান (Resolve)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        resolveReportMutation.mutate({
                          id: rep._id,
                          status: "dismissed",
                          resolutionNote:
                            "তদন্তে তথ্য মিথ্যা বা অমূলক প্রমাণিত হওয়ায় খারিজ করা হয়েছে",
                        })
                      }
                      className="mb-btn-secondary !text-xs !px-3.5"
                    >
                      খারিজ (Dismiss)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Security Audit Log */}
      {activeTab === "audit" && isSuperAdminOrAdmin && (
        <div className="space-y-4">
          {isAuditLoading ? (
            <div className="py-16 flex justify-center">
              <LoadingSpinner size="lg" label="অডিট লগ লোড হচ্ছে..." />
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="mb-card py-16 text-center text-xs text-ink-3">
              কোনো সাম্প্রতিক অডিট লগ পাওয়া যায়নি।
            </div>
          ) : (
            <div className="mb-card overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-elev border-b border-line text-ink-2 font-bold">
                  <tr>
                    <th className="py-3 px-4">পদক্ষেপ (Action)</th>
                    <th className="py-3 px-4">লক্ষ্য (Target ID)</th>
                    <th className="py-3 px-4">আইপি (IP)</th>
                    <th className="py-3 px-4 text-right">সময়</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t border-line hover:bg-elev/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-brand">
                        {log.action}
                      </td>
                      <td className="py-3 px-4 font-mono text-ink-2">
                        {log.targetId || "-"}
                      </td>
                      <td className="py-3 px-4 font-mono text-ink-3">
                        {log.ipAddress || "-"}
                      </td>
                      <td className="py-3 px-4 text-right text-ink-3">
                        {new Date(log.createdAt).toLocaleString("bn-BD")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
