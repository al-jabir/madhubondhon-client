import apiClient from './client';
import { ApiResponse } from '../types';

export interface TangailLocationResponse {
  district: string;
  upazilas: Array<{
    id: string;
    nameBn: string;
    nameEn: string;
  }>;
}

export const locationsApi = {
  async getTangailLocations() {
    const res = await apiClient.get<ApiResponse<TangailLocationResponse>>('/locations/tangail');
    return res.data;
  },
};
