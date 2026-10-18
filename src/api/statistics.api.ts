import apiClient from './client';
import type { ApiResponse } from '../types';
export interface PublicStatistics { totalProfiles: number; maleProfiles: number; femaleProfiles: number; successfulMarriages: number; }
export const statisticsApi = {
  async get() { return (await apiClient.get<ApiResponse<{ stats: PublicStatistics }>>('/statistics')).data; },
  async updateMarriages(successfulMarriages: number) { return (await apiClient.put<ApiResponse<{ stats: PublicStatistics }>>('/statistics', { successfulMarriages })).data; },
};
