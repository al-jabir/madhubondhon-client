import apiClient from './client';
import { ApiResponse, Profile, Gender, MaritalStatus, EducationLevel, ProfileVisibility } from '../types';

export interface CreateProfileData {
  displayName: string;
  dateOfBirth: string;
  gender: Gender;
  upazila: string;
  education?: EducationLevel;
  educationDetail?: string;
  occupation?: string;
  maritalStatus: MaritalStatus;
  height?: { feet: number; inches: number };
  weight?: number;
  skinTone?: string;
  familyInfo?: {
    fatherOccupation?: string;
    motherOccupation?: string;
    siblings?: number;
    familyType?: string;
    financialStatus?: string;
  };
  religiousInfo?: {
    religion: string;
    religiousness?: string;
    praysFiveTimes?: boolean;
    wearsHijab?: boolean;
  };
  lifestyle?: {
    smoking: boolean;
    diet?: string;
  };
  bio?: string;
  visibility?: ProfileVisibility;
}

export type UpdateProfileData = Partial<CreateProfileData>;

export interface UpdatePreferencesData {
  minAge?: number;
  maxAge?: number;
  preferredUpazilas?: string[];
  preferredEducation?: EducationLevel[];
  preferredMaritalStatus?: MaritalStatus[];
}

export interface SearchProfilesParams {
  occupation?: string;
  gender?: Gender;
  minAge?: number;
  maxAge?: number;
  upazila?: string;
  education?: EducationLevel;
  maritalStatus?: MaritalStatus;
  religion?: string;
  page?: number;
  limit?: number;
}

export const profilesApi = {
  async getOwnProfile() {
    const res = await apiClient.get<ApiResponse<{ profile: Profile }>>('/profiles/me');
    return res.data;
  },

  async createProfile(data: CreateProfileData) {
    const res = await apiClient.post<ApiResponse<{ profile: Profile }>>('/profiles', data);
    return res.data;
  },

  async updateProfile(data: UpdateProfileData) {
    const res = await apiClient.put<ApiResponse<{ profile: Profile }>>('/profiles/me', data);
    return res.data;
  },

  async updatePreferences(data: UpdatePreferencesData) {
    const res = await apiClient.put<ApiResponse<{ profile: Profile }>>('/profiles/me/preferences', data);
    return res.data;
  },

  async getPublicProfile(userId: string) {
    const res = await apiClient.get<ApiResponse<{ profile: Profile }>>(`/profiles/${userId}`);
    return res.data;
  },

  async searchProfiles(params?: SearchProfilesParams) {
    const res = await apiClient.get<ApiResponse<{ profiles: Profile[] }>>('/search/profiles', {
      params,
    });
    return res.data;
  },

  async deactivateAccount() {
    const res = await apiClient.post<ApiResponse>('/profiles/me/deactivate');
    return res.data;
  },

  async deleteAccount() {
    const res = await apiClient.delete<ApiResponse>('/profiles/me');
    return res.data;
  },
};
