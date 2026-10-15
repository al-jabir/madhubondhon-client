import apiClient from './client';
import { ApiResponse, Interest, InterestStatus } from '../types';

export interface SendInterestData {
  receiverId: string;
  message?: string;
}

export interface RespondInterestData {
  action: 'accepted' | 'declined';
}

export interface InterestQueryParams {
  status?: InterestStatus;
  page?: number;
  limit?: number;
}

export const interestsApi = {
  async sendInterest(data: SendInterestData) {
    const res = await apiClient.post<ApiResponse<{ interest: Interest }>>('/interests', data);
    return res.data;
  },

  async respondToInterest(interestId: string, data: RespondInterestData) {
    const res = await apiClient.put<ApiResponse<{ interest: Interest }>>(`/interests/${interestId}/respond`, data);
    return res.data;
  },

  async withdrawInterest(interestId: string) {
    const res = await apiClient.put<ApiResponse<{ interest: Interest }>>(`/interests/${interestId}/withdraw`);
    return res.data;
  },

  async getReceivedInterests(params?: InterestQueryParams) {
    const res = await apiClient.get<ApiResponse<{ interests: Interest[] }>>('/interests/received', {
      params,
    });
    return res.data;
  },

  async getSentInterests(params?: InterestQueryParams) {
    const res = await apiClient.get<ApiResponse<{ interests: Interest[] }>>('/interests/sent', {
      params,
    });
    return res.data;
  },
};
