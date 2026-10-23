import apiClient from './client';
import {
  ApiResponse,
  User,
  UserRole,
  AccountStatus,
  AnnouncementItem,
  SiteContentItem,
  PlatformSettings,
  AdminInterestItem,
  AdminStaffUser,
} from '../types';

export interface AdminStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    newLast7Days: number;
    newLast30Days: number;
  };
  biodata: {
    total: number;
    complete: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    changesRequested: number;
  };
  reports: {
    pending: number;
    resolved: number;
  };
  interests: {
    total: number;
    accepted: number;
  };
  recentActivity: AuditLogItem[];
}

export interface AuditLogItem {
  _id: string;
  actor: { _id: string; name: string; email: string; role?: string } | string;
  action: string;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminAnalyticsDailyPoint {
  date: string;
  newUsers: number;
  newBiodata: number;
  interestsSent: number;
}

export interface AdminAnalyticsStatusCount {
  status: string;
  count: number;
}

export interface AdminAnalytics {
  daily: AdminAnalyticsDailyPoint[];
  biodataByStatus: AdminAnalyticsStatusCount[];
  interestsByStatus: AdminAnalyticsStatusCount[];
  revenue: { totalPaid: number; paidCount: number; pendingCount: number };
  topDistricts: Array<{ name: string; count: number }>;
  totals: { users: number; biodata: number; interests: number };
}

export const adminApi = {
  // ─── Users ─────────────────────────────────────────────────────────
  async listUsers(params?: {
    role?: UserRole;
    status?: AccountStatus;
    search?: string;
    upazila?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<{ users: User[] }>>('/admin/users', {
      params: { ...params, accountStatus: params?.status },
    });
    return res.data;
  },

  async getUserDetails(userId: string) {
    const res = await apiClient.get<ApiResponse<{
      user: User;
      profile?: any;
      application?: any;
      reportsReceived: any[];
      reportsFiled: any[];
      auditLogs: AuditLogItem[];
    }>>(`/admin/users/${userId}`);
    return res.data;
  },

  async updateUserStatus(userId: string, data: { status: AccountStatus; reason?: string }) {
    const res = await apiClient.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`, {
      accountStatus: data.status,
      reason: data.reason,
    });
    return res.data;
  },

  async updateUserRole(userId: string, data: { role: UserRole; reason?: string }) {
    const res = await apiClient.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}/role`, data);
    return res.data;
  },

  async deleteUser(userId: string, reason?: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/admin/users/${userId}`, {
      data: { reason },
    });
    return res.data;
  },

  // ─── Admin Team (Super Admin) ──────────────────────────────────────
  async listAdmins() {
    const res = await apiClient.get<ApiResponse<{ admins: AdminStaffUser[] }>>('/admin/admins');
    return res.data;
  },

  async createAdmin(data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone?: string;
  }) {
    const res = await apiClient.post<ApiResponse<{ admin: AdminStaffUser }>>('/admin/admins', data);
    return res.data;
  },

  async deleteAdmin(adminId: string, reason?: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/admin/admins/${adminId}`, {
      data: { reason },
    });
    return res.data;
  },

  // ─── Interests Monitoring ──────────────────────────────────────────
  async listInterests(params?: { status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ interests: AdminInterestItem[] }>>('/admin/interests', {
      params,
    });
    return res.data;
  },

  // ─── Profile Visibility & Deletion ─────────────────────────────────
  async toggleProfileVisibility(profileId: string, data: { isHidden: boolean; reason?: string }) {
    const res = await apiClient.put<ApiResponse<{ profile: any }>>(`/admin/profiles/${profileId}/visibility`, data);
    return res.data;
  },

  async deleteProfile(profileId: string, reason?: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/admin/profiles/${profileId}`, {
      data: { reason },
    });
    return res.data;
  },

  // ─── Announcements ────────────────────────────────────────────────
  async listAnnouncements(params?: { isActive?: boolean; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ announcements: AnnouncementItem[] }>>('/announcements/admin', {
      params,
    });
    return res.data;
  },

  async createAnnouncement(data: Partial<AnnouncementItem>) {
    const res = await apiClient.post<ApiResponse<{ announcement: AnnouncementItem }>>('/announcements/admin', data);
    return res.data;
  },

  async updateAnnouncement(id: string, data: Partial<AnnouncementItem>) {
    const res = await apiClient.put<ApiResponse<{ announcement: AnnouncementItem }>>(`/announcements/admin/${id}`, data);
    return res.data;
  },

  async deleteAnnouncement(id: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/announcements/admin/${id}`);
    return res.data;
  },

  async getPublicAnnouncements() {
    const res = await apiClient.get<ApiResponse<{ announcements: AnnouncementItem[] }>>('/announcements/public');
    return res.data;
  },

  // ─── Site Content CMS ─────────────────────────────────────────────
  async listContentPages() {
    const res = await apiClient.get<ApiResponse<{ pages: SiteContentItem[] }>>('/content/admin/all');
    return res.data;
  },

  async updateContentPage(slug: string, data: { title: string; content: string; isPublished?: boolean }) {
    const res = await apiClient.put<ApiResponse<{ page: SiteContentItem }>>(`/content/admin/${slug}`, data);
    return res.data;
  },

  async getPublicContent(slug: string) {
    const res = await apiClient.get<ApiResponse<{ content: SiteContentItem }>>(`/content/${slug}`);
    return res.data;
  },

  // ─── Platform Settings ────────────────────────────────────────────
  async getSettings() {
    const res = await apiClient.get<ApiResponse<{ settings: PlatformSettings }>>('/settings/admin');
    return res.data;
  },

  async updateSettings(data: Partial<PlatformSettings>) {
    const res = await apiClient.put<ApiResponse<{ settings: PlatformSettings }>>('/settings/admin', data);
    return res.data;
  },

  async getPublicSettings() {
    const res = await apiClient.get<ApiResponse<{ settings: PlatformSettings }>>('/settings/public');
    return res.data;
  },

  // ─── Stats & Analytics ────────────────────────────────────────────
  async getStats() {
    const res = await apiClient.get<ApiResponse<{ stats: AdminStats }>>('/admin/stats');
    return res.data;
  },

  async getAnalytics() {
    const res = await apiClient.get<ApiResponse<{ analytics: AdminAnalytics }>>('/admin/analytics');
    return res.data;
  },

  async getAuditLogs(params?: { action?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ logs: AuditLogItem[] }>>('/admin/audit-logs', {
      params,
    });
    const logs =
      res.data?.data?.logs ||
      (res.data as any)?.logs ||
      (Array.isArray(res.data?.data) ? res.data.data : []) ||
      [];
    return {
      ...res.data,
      data: {
        auditLogs: logs,
        logs,
      },
      meta: res.data?.meta,
    };
  },

  // ─── Credit Package Management ─────────────────────────────────────
  async adminListPackages() {
    const res = await apiClient.get<ApiResponse<{ packages: import('../types').AdminPackageItem[] }>>('/payments/admin/packages');
    return res.data;
  },

  async adminCreatePackage(data: Partial<import('../types').AdminPackageItem>) {
    const res = await apiClient.post<ApiResponse<{ package: import('../types').AdminPackageItem }>>('/payments/admin/packages', data);
    return res.data;
  },

  async adminUpdatePackage(id: string, data: Partial<import('../types').AdminPackageItem>) {
    const res = await apiClient.put<ApiResponse<{ package: import('../types').AdminPackageItem }>>(`/payments/admin/packages/${id}`, data);
    return res.data;
  },

  async adminDeletePackage(id: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/payments/admin/packages/${id}`);
    return res.data;
  },

  async adminUpdatePaymentInstructions(data: {
    bkashNumber?: string;
    bkashType?: string;
    nagadNumber?: string;
    nagadType?: string;
    rocketNumber?: string;
    paymentInstructions?: string;
  }) {
    const res = await apiClient.put<ApiResponse<{ setting: import('../types').PlatformSettings }>>('/payments/admin/instructions', data);
    return res.data;
  },

  // ─── Success Stories Management ───────────────────────────────────
  async getPublicSuccessStories() {
    const res = await apiClient.get<ApiResponse<{ stories: import('../types').SuccessStoryItem[] }>>('/success-stories');
    return res.data;
  },

  async adminListSuccessStories() {
    const res = await apiClient.get<ApiResponse<{ stories: import('../types').SuccessStoryItem[] }>>('/success-stories/admin');
    return res.data;
  },

  async adminCreateSuccessStory(data: Partial<import('../types').SuccessStoryItem>) {
    const res = await apiClient.post<ApiResponse<{ story: import('../types').SuccessStoryItem }>>('/success-stories/admin', data);
    return res.data;
  },

  async adminUpdateSuccessStory(id: string, data: Partial<import('../types').SuccessStoryItem>) {
    const res = await apiClient.put<ApiResponse<{ story: import('../types').SuccessStoryItem }>>(`/success-stories/admin/${id}`, data);
    return res.data;
  },

  async adminDeleteSuccessStory(id: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/success-stories/admin/${id}`);
    return res.data;
  },

  // ─── Support Messages & Inquiries ─────────────────────────────────
  async submitSupportMessage(data: { name: string; email: string; phone?: string; subject: string; message: string }) {
    const res = await apiClient.post<ApiResponse<{ message: import('../types').SupportMessageItem }>>('/support/messages', data);
    return res.data;
  },

  async adminListSupportMessages(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ messages: import('../types').SupportMessageItem[]; pendingCount?: number }>>('/support/admin/messages', {
      params,
    });
    return res.data;
  },

  async adminUpdateSupportMessage(id: string, data: { status?: 'pending' | 'in_progress' | 'resolved'; adminNote?: string }) {
    const res = await apiClient.put<ApiResponse<{ message: import('../types').SupportMessageItem }>>(`/support/admin/messages/${id}`, data);
    return res.data;
  },

  async adminDeleteSupportMessage(id: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/support/admin/messages/${id}`);
    return res.data;
  },

  // ─── Tangail Upazila Analytics & CSV Export ────────────────────────
  async getUpazilaAnalytics() {
    const res = await apiClient.get<ApiResponse<{
      upazilas: import('../types').UpazilaAnalyticsItem[];
      summary: { totalProfiles: number; totalGrooms: number; totalBrides: number; totalApproved: number };
    }>>('/admin/analytics/upazilas');
    return res.data;
  },

  async exportDataCsv(type: 'users' | 'biodata' | 'transactions') {
    const res = await apiClient.get(`/admin/export/${type}`, {
      responseType: 'blob',
    });
    const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `madhubondhon-${type}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  // ─── Fraud & Blacklist Management ──────────────────────────────────
  async getBlacklist() {
    const res = await apiClient.get<ApiResponse<{ blacklist: import('../types').BlacklistItem[] }>>('/admin/blacklist');
    return res.data;
  },

  async addToBlacklist(data: { type: 'phone' | 'email'; value: string; reason: string }) {
    const res = await apiClient.post<ApiResponse<{ item: import('../types').BlacklistItem }>>('/admin/blacklist', data);
    return res.data;
  },

  async removeFromBlacklist(id: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/admin/blacklist/${id}`);
    return res.data;
  },

  // ─── Coupons & Promo Codes ─────────────────────────────────────────
  async listCoupons() {
    const res = await apiClient.get<ApiResponse<{ coupons: import('../types').CouponItem[] }>>('/admin/coupons');
    return res.data;
  },

  async createCoupon(data: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minPurchaseBDT?: number;
    maxDiscountBDT?: number;
    validUntil?: string;
    usageLimit?: number;
    isActive?: boolean;
  }) {
    const res = await apiClient.post<ApiResponse<{ coupon: import('../types').CouponItem }>>('/admin/coupons', data);
    return res.data;
  },

  async updateCoupon(
    id: string,
    data: Partial<{
      discountType: 'percentage' | 'fixed';
      discountValue: number;
      minPurchaseBDT: number;
      maxDiscountBDT: number;
      validUntil: string;
      usageLimit: number;
      isActive: boolean;
    }>
  ) {
    const res = await apiClient.put<ApiResponse<{ coupon: import('../types').CouponItem }>>(`/admin/coupons/${id}`, data);
    return res.data;
  },

  async deleteCoupon(id: string) {
    const res = await apiClient.delete<ApiResponse<unknown>>(`/admin/coupons/${id}`);
    return res.data;
  },

  // ─── Assisted / Offline Biodata Registration ───────────────────────
  async createAssistedBiodata(data: any) {
    const res = await apiClient.post<ApiResponse<{ user: User; profile: any }>>('/admin/assisted-biodata', data);
    return res.data;
  },

  // ─── Mass Broadcast Notifications ──────────────────────────────────
  async sendBroadcastNotification(data: {
    target: 'all' | 'groom' | 'bride' | 'active';
    title: string;
    message: string;
    link?: string;
  }) {
    const res = await apiClient.post<ApiResponse<{ sentCount: number }>>('/admin/broadcast', data);
    return res.data;
  },

  // ─── User 360° Profile Inspector & Activity Timeline ───────────────
  async getUserTimeline(userId: string) {
    const res = await apiClient.get<ApiResponse<import('../types').User360Data>>(`/admin/users/${userId}/timeline`);
    return res.data;
  },

  // ─── Live System Health & Performance Diagnostics ──────────────────
  async getSystemHealth() {
    const res = await apiClient.get<ApiResponse<import('../types').SystemHealthData>>('/admin/system-health');
    return res.data;
  },
};
