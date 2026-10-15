import apiClient from './client';
import { ApiResponse, Notification } from '../types';

export const notificationsApi = {
  async getNotifications(params?: { page?: number; limit?: number }) {
    const res = await apiClient.get<ApiResponse<{ notifications: Notification[]; unreadCount?: number }>>(
      '/notifications',
      { params },
    );
    return res.data;
  },

  async markAsRead(notificationId: string) {
    const res = await apiClient.put<ApiResponse>(`/notifications/${notificationId}/read`);
    return res.data;
  },

  async markAllAsRead() {
    const res = await apiClient.put<ApiResponse>('/notifications/read-all');
    return res.data;
  },
};
