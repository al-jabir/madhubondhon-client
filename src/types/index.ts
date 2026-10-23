export const UserRole = {
  CUSTOMER: 'customer',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const Gender = {
  MALE: 'male',
  FEMALE: 'female',
} as const;
export type Gender = (typeof Gender)[keyof typeof Gender];

export const MaritalStatus = {
  NEVER_MARRIED: 'never_married',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed',
  SEPARATED: 'separated',
} as const;
export type MaritalStatus = (typeof MaritalStatus)[keyof typeof MaritalStatus];

export const AccountStatus = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  DEACTIVATED: 'deactivated',
  BANNED: 'banned',
} as const;
export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];

export const EducationLevel = {
  SSC: 'ssc',
  HSC: 'hsc',
  DIPLOMA: 'diploma',
  BACHELORS: 'bachelors',
  MASTERS: 'masters',
  PHD: 'phd',
  ISLAMIC_EDUCATION: 'islamic_education',
  OTHER: 'other',
} as const;
export type EducationLevel = (typeof EducationLevel)[keyof typeof EducationLevel];

export const InterestStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  WITHDRAWN: 'withdrawn',
} as const;
export type InterestStatus = (typeof InterestStatus)[keyof typeof InterestStatus];

export const ProfileVisibility = {
  PUBLIC: 'public',
  REGISTERED_ONLY: 'registered_only',
  PRIVATE: 'private',
} as const;
export type ProfileVisibility = (typeof ProfileVisibility)[keyof typeof ProfileVisibility];

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  gender?: Gender;
  role: UserRole;
  accountStatus: AccountStatus;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  contactCredits?: number;
  createdAt?: string;
}

export interface ProfilePhoto {
  url: string;
  key?: string;
  isProfilePhoto: boolean;
  blurPhoto?: boolean;
  uploadedAt?: string;
}

export interface Profile {
  _id: string;
  biodataId?: string;
  user: string | User;
  displayName: string;
  dateOfBirth: string;
  gender: Gender;
  upazila: string;
  currentUpazila?: string;
  educationMedium?: string;
  religiousQualifications?: string[];
  occupationCategory?: string;
  fiqh?: string;
  specialCategories?: string[];
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
    canReciteQuran?: boolean;
    wearsHijab?: boolean;
    wearsNiqab?: boolean;
    maintainsMahram?: boolean;
    hasBeard?: boolean;
    clothesAboveAnkle?: boolean;
  };
  lifestyle?: {
    smoking: boolean;
    diet?: string;
    monthlyIncome?: string;
    willKeepWifeInPurdah?: boolean;
    livingArrangement?: string;
    studyAfterMarriage?: boolean | string;
    jobAfterMarriage?: boolean | string;
    canCook?: boolean;
  };
  bio?: string;
  photos?: ProfilePhoto[];
  photoPrivacy?: 'public' | 'registered_only' | 'on_interest_accepted' | 'hidden';
  preferences?: {
    minAge?: number;
    maxAge?: number;
    preferredUpazilas?: string[];
    preferredEducation?: EducationLevel[];
    preferredMaritalStatus?: MaritalStatus[];
  };
  visibility: ProfileVisibility;
  isComplete: boolean;
  completionPercentage: number;
  isApproved: boolean;
  age?: number;
  createdAt?: string;
}

export interface ShortlistItem {
  _id: string;
  biodataId?: string;
  displayName: string;
  gender: Gender;
  upazila: string;
  education?: EducationLevel;
  educationDetail?: string;
  occupation?: string;
  maritalStatus: MaritalStatus;
  dateOfBirth: string;
  age?: number;
  height?: { feet: number; inches: number };
  photos?: ProfilePhoto[];
  shortlistedAt: string;
  shortlistNote?: string;
}

export interface CreditPackage {
  id: string;
  title: string;
  credits: number;
  priceBDT: number;
  popular?: boolean;
  savings?: string;
}

export interface CreditTransaction {
  _id: string;
  user?: string | User;
  type: 'purchase' | 'spend' | 'bonus';
  credits: number;
  amountBDT: number;
  paymentMethod: string;
  senderPhone?: string;
  trxId?: string;
  packageTitle?: string;
  status: 'pending' | 'completed' | 'rejected';
  reviewNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Interest {
  _id: string;
  sender: User | string;
  receiver: User | string;
  status: InterestStatus;
  message?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  errors?: Array<{ field?: string; message: string }>;
}

export interface AnnouncementItem {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetAudience: 'all' | 'customer' | 'unregistered';
  isActive: boolean;
  isPinned: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdBy: { _id: string; name: string; email: string } | string;
  updatedBy?: { _id: string; name: string; email: string } | string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteContentItem {
  _id: string;
  slug: string;
  title: string;
  content: string;
  isPublished: boolean;
  version: number;
  metaDescription?: string;
  updatedBy?: { _id: string; name: string; email: string } | string;
  updatedAt: string;
}

export interface PlatformSettings {
  _id?: string;
  key: string;
  siteName: string;
  siteTagline: string;
  contactEmail: string;
  contactPhone: string;
  supportWhatsApp: string;
  registrationOpen: boolean;
  requireBiodataApproval: boolean;
  maintenanceMode: boolean;
  showDemoProfiles?: boolean;
  allowedUpazilas: string[];
  maxPhotosPerUser: number;
  contactCreditCost: number;
  updatedBy?: { _id: string; name: string; email: string };
  updatedAt?: string;
}

export interface AdminInterestItem {
  _id: string;
  sender: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    accountStatus: string;
  };
  recipient: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    accountStatus: string;
  };
  status: InterestStatus;
  message?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface AdminStaffUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  isEmailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
}
