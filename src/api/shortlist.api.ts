import apiClient from './client';
import { ApiResponse, ShortlistItem } from '../types';

export const shortlistApi = {
  async addToShortlist(profileId: string, notes?: string) {
    const res = await apiClient.post<ApiResponse<{ item: unknown }>>(`/shortlist/${profileId}`, {
      notes,
    });
    return res.data;
  },

  async removeFromShortlist(profileId: string) {
    const res = await apiClient.delete<ApiResponse>(`/shortlist/${profileId}`);
    return res.data;
  },

  async getShortlist(page = 1, limit = 20) {
    const res = await apiClient.get<ApiResponse<ShortlistItem[]>>('/shortlist', {
      params: { page, limit },
    });
    return res.data;
  },

  async checkIsShortlisted(profileId: string) {
    const res = await apiClient.get<ApiResponse<{ isShortlisted: boolean }>>(
      `/shortlist/${profileId}/check`
    );
    return res.data;
  },
};
