import apiClient from './client';
import { ApiResponse, User } from '../types';

export interface BlockItem {
  _id: string;
  blocker: string;
  blocked: User;
  reason?: string;
  createdAt: string;
}

export const blocksApi = {
  async blockUser(blockedUserId: string, reason?: string) {
    const res = await apiClient.post<ApiResponse>('/blocks', {
      blockedUserId,
      reason,
    });
    return res.data;
  },

  async unblockUser(userId: string) {
    const res = await apiClient.delete<ApiResponse>(`/blocks/${userId}`);
    return res.data;
  },

  async getBlockList() {
    const res = await apiClient.get<ApiResponse<{ blocks: BlockItem[] }>>('/blocks');
    return res.data;
  },
};
