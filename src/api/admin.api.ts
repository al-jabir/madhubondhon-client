import apiClient from './client';
import { ApiResponse, User, UserRole, AccountStatus } from '../types';

export interface AdminStats {
  totalUsers: number;
  totalProfiles: number;
  totalInterests: number;
  activeUsers: number;
  pendingReports: number;
  usersByRole?: Record<string, number>;
  upazilaDistribution?: Record<string, number>;
}

export interface AuditLogItem {
  _id: string;
  adminId: User | string;
  action: string;
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
  async listUsers(params?: {
    role?: UserRole;
    status?: AccountStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<{ users: User[] }>>('/admin/users', {
      params: { ...params, accountStatus: params?.status },
    });
    return res.data;
  },

  async updateUserStatus(userId: string, data: { status: AccountStatus; reason?: string }) {
    const res = await apiClient.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`, { accountStatus: data.status, reason: data.reason });
    return res.data;
  },

  async updateUserRole(userId: string, data: { role: UserRole }) {
    const res = await apiClient.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}/role`, data);
    return res.data;
  },

  async getStats() {
    const res = await apiClient.get<ApiResponse<{ stats: { users: { total: number; active: number }; profiles: { total: number }; interests: { total: number }; reports: { pending: number } } }>>('/admin/stats');
    const stats = res.data.data?.stats;
    return { ...res.data, data: stats ? { stats: { totalUsers: stats.users.total, activeUsers: stats.users.active, totalProfiles: stats.profiles.total, totalInterests: stats.interests.total, pendingReports: stats.reports.pending } } : undefined };
  },

  async getAnalytics() {
    const res = await apiClient.get<ApiResponse<{ analytics: AdminAnalytics }>>('/admin/analytics');
    return res.data;
  },

  async getAuditLogs(params?: { page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ logs: AuditLogItem[] }>>('/admin/audit-logs', {
      params,
    });
    return { ...res.data, data: { auditLogs: res.data.data?.logs || [] } };
  },
};
