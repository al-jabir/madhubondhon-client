import apiClient from './client';
import { ApiResponse, Profile, Gender, MaritalStatus, EducationLevel, ProfileVisibility, ProfilePhoto } from '../types';

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
  minHeight?: number;
  maxHeight?: number;
  verifiedOnly?: boolean;
  upazila?: string;
  education?: EducationLevel;
  maritalStatus?: MaritalStatus;
  religion?: string;
  biodataId?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface ProfileCompletion {
  percent: number;
  missing: Array<{ key: string; label: string }>;
}

export const profilesApi = {
  async getOwnProfile() {
    const res = await apiClient.get<ApiResponse<{ profile: Profile }>>('/profiles/me');
    return res.data;
  },

  async getCompletion() {
    const res = await apiClient.get<ApiResponse<{ completion: ProfileCompletion }>>(
      '/profiles/me/completion'
    );
    return res.data;
  },

  async getRecommendations() {
    const res = await apiClient.get<ApiResponse<{ profiles: Profile[] }>>(
      '/profiles/recommendations'
    );
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

  async uploadPhoto(file: File, isProfilePhoto = false, blurPhoto = false) {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('isProfilePhoto', String(isProfilePhoto));
    formData.append('blurPhoto', String(blurPhoto));

    const res = await apiClient.post<ApiResponse<{ photos: ProfilePhoto[] }>>(
      '/profiles/me/photos',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return res.data;
  },

  async deletePhoto(photoKey: string) {
    const res = await apiClient.delete<ApiResponse<{ photos: ProfilePhoto[] }>>(
      `/profiles/me/photos/${photoKey}`
    );
    return res.data;
  },

  async updatePhotoPrivacy(photoPrivacy: string, blurAllPhotos = false) {
    const res = await apiClient.put<ApiResponse<{ photoPrivacy: string; photos: ProfilePhoto[] }>>(
      '/profiles/me/photos/privacy',
      { photoPrivacy, blurAllPhotos }
    );
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
