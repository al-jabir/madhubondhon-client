import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  workflowApi,
  errorMessage,
} from "../../api/workflow.api";
import type { Application, ReviewStatus } from "../../api/workflow.api";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../i18n/LanguageContext";
import { getUpazilaDisplayName } from "../../constants/locations";

function ReviewCard({ app }: { app: Application }) {
  const cache = useQueryClient();
  const { user } = useAuth();
  const { isBengali, formatNumber } = useLanguage();
  const [note, setNote] = useState("");

  const statusLabels: Record<string, string> = {
    draft: isBengali ? "খসড়া" : "Draft",
    submitted: isBengali ? "জমা দেওয়া" : "Submitted",
    under_review: isBengali ? "পর্যালোচনাধীন" : "Under Review",
    changes_requested: isBengali ? "সংশোধন চাওয়া হয়েছে" : "Changes Requested",
    approved: isBengali ? "অনুমোদিত" : "Approved",
    rejected: isBengali ? "প্রত্যাখ্যাত" : "Rejected",
  };

  const mutation = useMutation({
    mutationFn: (decision: Exclude<ReviewStatus, "draft" | "submitted">) =>
      workflowApi.review(app._id, app.revision, decision, note || undefined),
    onSuccess: () => {
      toast.success(isBengali ? "সিদ্ধান্ত সংরক্ষিত হয়েছে" : "Decision saved successfully");
      cache.invalidateQueries({ queryKey: ["biodata-review"] });
      cache.invalidateQueries({ queryKey: ["search-profiles"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const d = app.data;
  const otherReviewer =
    app.status === "under_review" &&
    app.reviewedBy &&
    app.reviewedBy !== (user?.id || user?._id);

  return (
    <article className="mb-card p-6 space-y-4">
      <h2 className="text-xl font-bold text-ink">
        {d.displayName} — {statusLabels[app.status] || app.status}
      </h2>
      <p className="text-sm text-ink-2">
        {isBengali ? "অভিভাবকের সম্মতি: " : "Guardian Consent: "}
        <strong className={app.guardianConsentedAt ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
          {app.guardianConsentedAt
            ? (isBengali ? "যাচাইকৃত" : "Verified")
            : (isBengali ? "অসম্পূর্ণ" : "Incomplete")}
        </strong>
      </p>
      <dl className="grid sm:grid-cols-2 gap-4 text-sm text-ink-2">
        <div>
          <dt className="font-bold text-ink">{isBengali ? "মৌলিক তথ্য" : "Basic Information"}</dt>
          <dd>
            {(d.gender === 'male' ? (isBengali ? 'পাত্র' : 'Male') : (isBengali ? 'পাত্রী' : 'Female'))} · {d.dateOfBirth?.slice(0, 10)} · {getUpazilaDisplayName(d.upazila, isBengali)} ·{" "}
            {d.maritalStatus}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">{isBengali ? "শিক্ষা ও পেশা" : "Education & Occupation"}</dt>
          <dd>
            {d.education} · {d.educationDetail} · {d.occupation}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">{isBengali ? "উচ্চতা ও জীবনযাপন" : "Height & Lifestyle"}</dt>
          <dd>
            {formatNumber(d.height?.feet || 0)} {isBengali ? "ফুট" : "ft"} {formatNumber(d.height?.inches || 0)} {isBengali ? "ইঞ্চি" : "in"} · {isBengali ? "ধূমপান: " : "Smoking: "}
            {d.lifestyle?.smoking ? (isBengali ? "হ্যাঁ" : "Yes") : (isBengali ? "না" : "No")}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">{isBengali ? "পরিবার" : "Family Details"}</dt>
          <dd>
            {d.familyInfo?.fatherOccupation} / {d.familyInfo?.motherOccupation}{" "}
            · {isBengali ? "ভাইবোন: " : "Siblings: "}{d.familyInfo?.siblings ?? (isBengali ? "উল্লেখ নেই" : "Not specified")}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">{isBengali ? "ধর্মীয় তথ্য" : "Religious Information"}</dt>
          <dd>
            {d.religiousInfo?.religion} · {isBengali ? "পাঁচ ওয়াক্ত নামাজ: " : "5 Daily Prayers: "}
            {d.religiousInfo?.praysFiveTimes ? (isBengali ? "হ্যাঁ" : "Yes") : (isBengali ? "উল্লেখ নেই" : "Not specified")} · {isBengali ? "হিজাব: " : "Hijab: "}
            {d.religiousInfo?.wearsHijab ? (isBengali ? "হ্যাঁ" : "Yes") : (isBengali ? "উল্লেখ নেই" : "Not specified")}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">{isBengali ? "প্রত্যাশা" : "Expectations"}</dt>
          <dd>
            {formatNumber(d.preferences?.minAge || 0)} – {formatNumber(d.preferences?.maxAge || 0)} {isBengali ? "বছর" : "yrs"} ·{" "}
            {d.preferences?.preferredUpazilas?.map((u) => getUpazilaDisplayName(u, isBengali)).join(", ") || (isBengali ? "যেকোনো" : "Any")}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">{isBengali ? "অভিভাবক (গোপনীয়)" : "Guardian (Confidential)"}</dt>
          <dd>
            {app.guardian?.name} ({app.guardian?.relationship}) ·{" "}
            <span className="font-mono">{app.guardian?.phone}</span>
          </dd>
        </div>
      </dl>
      <p className="whitespace-pre-wrap text-sm text-ink-2 bg-elev p-4 rounded-xl border border-line">
        {d.bio || (isBengali ? "পরিচিতি উল্লেখ নেই" : "No introduction provided.")}
      </p>
      {app.status === "submitted" ? (
        <button
          disabled={mutation.isPending}
          onClick={() => mutation.mutate("under_review")}
          className="mb-btn-primary !px-4 !py-2 cursor-pointer"
        >
          {isBengali ? "পর্যালোচনা শুরু করুন" : "Start Review"}
        </button>
      ) : otherReviewer ? (
        <p className="text-sm text-ink-2">
          {isBengali ? "অন্য একজন মডারেটর পর্যালোচনা করছেন।" : "Another moderator is currently reviewing this application."}
        </p>
      ) : (
        <>
          <label className="mb-label block text-sm">
            {isBengali ? "পর্যালোচনার মন্তব্য (সংশোধন/প্রত্যাখ্যানে আবশ্যক)" : "Review Note / Reason (Required for changes or rejection)"}
            <textarea
              className="mb-input w-full !border-line rounded-xl p-3"
              rows={3}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={isBengali ? "মন্তব্য লিখুন..." : "Enter review notes..."}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("approved")}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-40 cursor-pointer"
            >
              {isBengali ? "অনুমোদন" : "Approve"}
            </button>
            <button
              disabled={mutation.isPending || note.trim().length < 10}
              onClick={() => mutation.mutate("changes_requested")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-gold-soft text-gold border border-gold/25 rounded-xl disabled:opacity-40 cursor-pointer"
            >
              {isBengali ? "সংশোধন চাই" : "Request Changes"}
            </button>
            <button
              disabled={mutation.isPending || note.trim().length < 10}
              onClick={() => mutation.mutate("rejected")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-brand-soft text-brand border border-brand/25 rounded-xl disabled:opacity-40 cursor-pointer"
            >
              {isBengali ? "প্রত্যাখ্যান" : "Reject"}
            </button>
          </div>
        </>
      )}
    </article>
  );
}

export default function ReviewQueue() {
  const { isBengali, formatNumber } = useLanguage();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["biodata-review", page],
    queryFn: () => workflowApi.listReview(page),
  });

  return (
    <section className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-ink-3">
          {isBengali ? "পর্যালোচনার তালিকা লোড হচ্ছে..." : "Loading review queue..."}
        </p>
      ) : isError ? (
        <p className="text-sm text-ink-3">
          {isBengali ? "লোড করা যায়নি। " : "Could not load. "}
          <button className="text-brand font-bold hover:underline cursor-pointer" onClick={() => refetch()}>
            {isBengali ? "আবার চেষ্টা করুন" : "Try again"}
          </button>
        </p>
      ) : (
        <>
          {!data?.data?.applications.length && (
            <p className="text-sm text-ink-3">
              {isBengali ? "পর্যালোচনার অপেক্ষায় কোনো বায়োডাটা নেই।" : "No biodata currently awaiting review."}
            </p>
          )}
          {data?.data?.applications.map((app) => (
            <ReviewCard key={app._id} app={app} />
          ))}
          <div className="flex gap-4 items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="mb-btn-secondary disabled:opacity-40 cursor-pointer text-xs font-bold"
            >
              {isBengali ? "পূর্ববর্তী পৃষ্ঠা" : "Previous"}
            </button>
            <span className="text-sm font-bold text-ink-2">
              {formatNumber(page)} / {formatNumber(data?.meta?.totalPages || 1)}
            </span>
            <button
              disabled={page >= (data?.meta?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="mb-btn-secondary disabled:opacity-40 cursor-pointer text-xs font-bold"
            >
              {isBengali ? "পরবর্তী পৃষ্ঠা" : "Next"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
