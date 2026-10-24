import apiClient from './client';
import { ApiResponse, User, Gender } from '../types';

export const authApi = {
  async register(data: {
    name: string;
    email: string;
    phone?: string;
    gender?: Gender;
    password: string;
    confirmPassword: string;
    dateOfBirth: string;
  }) {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/register',
      data,
    );
    return res.data;
  },

  async login(data: { email: string; password: string }) {
    const res = await apiClient.post<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>(
      '/auth/login',
      data,
    );
    return res.data;
  },

  async logout(refreshToken?: string) {
    const res = await apiClient.post<ApiResponse>('/auth/logout', { refreshToken });
    return res.data;
  },

  async getMe() {
    const res = await apiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmNewPassword: string }) {
    const res = await apiClient.post<ApiResponse>('/auth/change-password', data);
    return res.data;
  },
};
