import apiClient from "./client";
import type { ApiResponse, Profile, User } from "../types";
export interface Guardian {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}
export type ReviewStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "rejected";
export type DraftData = Partial<
  Omit<
    Profile,
    | "_id"
    | "user"
    | "age"
    | "isApproved"
    | "isComplete"
    | "completionPercentage"
  >
>;
export interface Application {
  _id: string;
  user: string | User;
  data: DraftData;
  guardian?: Partial<Guardian>;
  guardianRevision: number;
  guardianVerifiedAt?: string;
  guardianConsentedAt?: string;
  status: ReviewStatus;
  revision: number;
  reviewNote?: string;
  reviewedBy?: string;
  assignedReviewer?:string;
  reviewChecklist?:Record<string,boolean>;
  submittedAt?: string;
}
export interface ContactGrant {
  _id: string;
  requester: User | string;
  owner: User | string;
  status: "pending" | "approved" | "rejected" | "revoked";
  requestedAt: string;
}
export const statusLabels: Record<ReviewStatus, string> = {
  draft: "খসড়া",
  submitted: "জমা দেওয়া হয়েছে",
  under_review: "পর্যালোচনা চলছে",
  changes_requested: "সংশোধন প্রয়োজন",
  approved: "অনুমোদিত",
  rejected: "প্রত্যাখ্যাত",
};
export const errorMessage = (error: unknown): string => {
  if (!error) return "কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
  if (typeof error === "string") return error;

  const axiosError = error as {
    response?: {
      data?: {
        message?: string;
        errors?: Array<{ field?: string; message?: string }>;
      };
    };
    message?: string;
  };

  const data = axiosError.response?.data;

  // 1. If detailed field errors exist, display them
  if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    const errorDetails = data.errors
      .map((err) => err.message)
      .filter((msg): msg is string => Boolean(msg && msg.trim()));
    if (errorDetails.length > 0) {
      return [...new Set(errorDetails)].join(" • ");
    }
  }

  // 2. If a specific message exists (not the generic validation failure), return it
  if (data?.message && data.message !== "ভ্যালিডেশন ব্যর্থ হয়েছে।") {
    return data.message;
  }

  // 3. Fallback when only generic validation message was returned
  if (data?.message) {
    return "প্রদত্ত তথ্যে ভুল রয়েছে। অনুগ্রহ করে প্রয়োজনীয় ফিল্ডগুলো সঠিকভাবে পূরণ করুন।";
  }

  return axiosError.message || "কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।";
};
export const workflowApi = {
  async getDraft() {
    return (
      await apiClient.get<ApiResponse<{ application: Application }>>(
        "/biodata/me",
      )
    ).data;
  },
  async saveDraft(
    revision: number,
    data: DraftData,
    guardian?: Partial<Guardian>,
  ) {
    return (
      await apiClient.put<ApiResponse<{ application: Application }>>(
        "/biodata/me",
        { revision, data, guardian },
      )
    ).data;
  },
  async submit(revision: number) {
    return (
      await apiClient.post<ApiResponse<{ application: Application }>>(
        "/biodata/me/submit",
        { revision },
      )
    ).data;
  },
  async requestGuardian() {
    return (
      await apiClient.post<ApiResponse<{ challengeId: string }>>(
        "/biodata/me/guardian/request",
      )
    ).data;
  },
  async confirmGuardian(challengeId: string, code: string, consent: boolean) {
    return (
      await apiClient.post<ApiResponse<{ application: Application }>>(
        "/biodata/me/guardian/confirm",
        { challengeId, code, consent },
      )
    ).data;
  },
  async confirmGuardianConsent() {
    return (
      await apiClient.post<ApiResponse<{ application: Application }>>(
        "/biodata/me/guardian/consent",
      )
    ).data;
  },
  async revokeGuardian() {
    return (
      await apiClient.post<ApiResponse<{ application: Application }>>(
        "/biodata/me/guardian/revoke",
      )
    ).data;
  },
  async listReview(page = 1) {
    return (
      await apiClient.get<ApiResponse<{ applications: Application[] }>>(
        "/biodata/review",
        { params: { page, limit: 20 } },
      )
    ).data;
  },
  async review(
    id: string,
    revision: number,
    decision: Exclude<ReviewStatus, "draft" | "submitted">,
    note?: string,
  ) {
    return (
      await apiClient.post<ApiResponse<{ application: Application }>>(
        "/biodata/" + id + "/review",
        { revision, decision, note },
      )
    ).data;
  },
  async requestVerification(purpose: "email" | "phone", phone?: string) {
    return (
      await apiClient.post<ApiResponse<{ challengeId: string }>>(
        "/auth/verification/request",
        { purpose, phone },
      )
    ).data;
  },
  async confirmVerification(
    purpose: "email" | "phone",
    challengeId: string,
    code: string,
  ) {
    return (
      await apiClient.post("/auth/verification/confirm", {
        purpose,
        challengeId,
        code,
      })
    ).data;
  },
  async forgotPassword(email: string) {
    return (
      await apiClient.post<ApiResponse<{ challengeId: string }>>(
        "/auth/forgot-password",
        { email },
      )
    ).data;
  },
  async resetPassword(
    email: string,
    challengeId: string,
    code: string,
    newPassword: string,
    confirmNewPassword: string,
  ) {
    return (
      await apiClient.post("/auth/reset-password", {
        email,
        challengeId,
        code,
        newPassword,
        confirmNewPassword,
      })
    ).data;
  },
  async listContacts(page = 1) {
    return (
      await apiClient.get<ApiResponse<{ grants: ContactGrant[] }>>(
        "/contacts",
        { params: { page, limit: 20 } },
      )
    ).data;
  },
  async requestContact(ownerId: string) {
    return (await apiClient.post("/contacts", { ownerId })).data;
  },
  async respondContact(
    id: string,
    decision: "approved" | "rejected" | "revoked",
  ) {
    return (await apiClient.put("/contacts/" + id, { decision })).data;
  },
  async revealContact(id: string) {
    return (
      await apiClient.get<ApiResponse<{ guardian: Guardian }>>(
        "/contacts/" + id + "/reveal",
      )
    ).data;
  },
};
