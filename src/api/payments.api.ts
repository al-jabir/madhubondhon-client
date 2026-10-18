import apiClient from './client';
import { ApiResponse, CreditPackage, CreditTransaction } from '../types';

export interface PackagesResponse {
  packages: CreditPackage[];
  instructions: {
    bkashNumber: string;
    bkashType: string;
    nagadNumber: string;
    nagadType: string;
    note: string;
  };
}

export const paymentsApi = {
  async getPackages() {
    const res = await apiClient.get<ApiResponse<PackagesResponse>>('/payments/packages');
    return res.data;
  },

  async getBalance() {
    const res = await apiClient.get<ApiResponse<{ contactCredits: number }>>('/payments/balance');
    return res.data;
  },

  async submitManualPayment(data: {
    packageId: string;
    paymentMethod: 'bkash' | 'nagad' | 'manual';
    senderPhone: string;
    trxId: string;
  }) {
    const res = await apiClient.post<ApiResponse<{ transaction: CreditTransaction }>>(
      '/payments/manual-request',
      data
    );
    return res.data;
  },

  async getUserTransactions(page = 1, limit = 10) {
    const res = await apiClient.get<ApiResponse<CreditTransaction[]>>('/payments/my-transactions', {
      params: { page, limit },
    });
    return res.data;
  },

  async adminListTransactions(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const res = await apiClient.get<ApiResponse<CreditTransaction[]>>(
      '/payments/admin/transactions',
      { params }
    );
    return res.data;
  },

  async adminReviewTransaction(
    id: string,
    data: { status: 'completed' | 'rejected'; reviewNote?: string }
  ) {
    const res = await apiClient.put<ApiResponse<{ transaction: CreditTransaction }>>(
      `/payments/admin/transactions/${id}/review`,
      data
    );
    return res.data;
  },
};
