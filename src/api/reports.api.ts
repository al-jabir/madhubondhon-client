import apiClient from './client';
import { ApiResponse, User, Profile } from '../types';

export interface ReportItem {
  _id: string;
  reporter: User | string;
  reportedUser: User | string;
  reason: string;
  description?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  resolutionNote?: string;
  resolvedBy?: User | string;
  createdAt: string;
  updatedAt: string;
}

export const reportsApi = {
  async createReport(data: { reportedUserId: string; reason: string; description?: string }) {
    const res = await apiClient.post<ApiResponse<{ report: ReportItem }>>('/reports', data);
    return res.data;
  },

  async getMyReports() {
    const res = await apiClient.get<ApiResponse<{ reports: ReportItem[] }>>('/reports/my');
    return res.data;
  },

  async listReports(params?: { status?: string; page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ reports: ReportItem[] }>>('/reports/all', {
      params,
    });
    return res.data;
  },

  async resolveReport(id: string, data: { status: 'resolved' | 'dismissed'; resolutionNote?: string }) {
    const res = await apiClient.put<ApiResponse<{ report: ReportItem }>>(`/reports/${id}/resolve`, { status: data.status, resolution: data.resolutionNote });
    return res.data;
  },

  async listPendingProfiles(page = 1) {
    const res = await apiClient.get<ApiResponse<{ profiles: Profile[] }>>('/reports/profiles/pending', { params: { page, limit: 20 } });
    return res.data;
  },

  async approveProfile(profileId: string) {
    const res = await apiClient.put<ApiResponse>(`/reports/profiles/${profileId}/approve`);
    return res.data;
  },
};
