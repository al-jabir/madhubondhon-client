import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  workflowApi,
  statusLabels,
  errorMessage,
} from "../../api/workflow.api";
import type { Application, ReviewStatus } from "../../api/workflow.api";
import { useAuth } from "../../context/useAuth";
function ReviewCard({ app }: { app: Application }) {
  const cache = useQueryClient();
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const mutation = useMutation({
    mutationFn: (decision: Exclude<ReviewStatus, "draft" | "submitted">) =>
      workflowApi.review(app._id, app.revision, decision, note || undefined),
    onSuccess: () => {
      toast.success("সিদ্ধান্ত সংরক্ষিত হয়েছে");
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
        {d.displayName} — {statusLabels[app.status]}
      </h2>
      <p className="text-sm text-ink-2">
        অভিভাবকের সম্মতি: {app.guardianConsentedAt ? "যাচাইকৃত" : "অসম্পূর্ণ"}
      </p>
      <dl className="grid sm:grid-cols-2 gap-4 text-sm text-ink-2">
        <div>
          <dt className="font-bold text-ink">মৌলিক তথ্য</dt>
          <dd>
            {d.gender} · {d.dateOfBirth?.slice(0, 10)} · {d.upazila} ·{" "}
            {d.maritalStatus}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">শিক্ষা ও পেশা</dt>
          <dd>
            {d.education} · {d.educationDetail} · {d.occupation}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">উচ্চতা ও জীবনযাপন</dt>
          <dd>
            {d.height?.feet} ফুট {d.height?.inches} ইঞ্চি · ধূমপান:{" "}
            {d.lifestyle?.smoking ? "হ্যাঁ" : "না"}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">পরিবার</dt>
          <dd>
            {d.familyInfo?.fatherOccupation} / {d.familyInfo?.motherOccupation}{" "}
            · ভাইবোন: {d.familyInfo?.siblings ?? "উল্লেখ নেই"}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">ধর্মীয় তথ্য</dt>
          <dd>
            {d.religiousInfo?.religion} · পাঁচ ওয়াক্ত নামাজ:{" "}
            {d.religiousInfo?.praysFiveTimes ? "হ্যাঁ" : "উল্লেখ নেই"} · হিজাব:{" "}
            {d.religiousInfo?.wearsHijab ? "হ্যাঁ" : "উল্লেখ নেই"}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">প্রত্যাশা</dt>
          <dd>
            {d.preferences?.minAge} – {d.preferences?.maxAge} ·{" "}
            {d.preferences?.preferredUpazilas?.join(", ")}
          </dd>
        </div>
        <div>
          <dt className="font-bold text-ink">অভিভাবক (গোপনীয়)</dt>
          <dd>
            {app.guardian?.name} ({app.guardian?.relationship}) ·{" "}
            {app.guardian?.phone}
          </dd>
        </div>
      </dl>
      <p className="whitespace-pre-wrap text-sm text-ink-2 bg-elev p-4 rounded-xl border border-line">
        {d.bio || "পরিচিতি উল্লেখ নেই"}
      </p>
      {app.status === "submitted" ? (
        <button
          disabled={mutation.isPending}
          onClick={() => mutation.mutate("under_review")}
          className="mb-btn-primary !px-4 !py-2"
        >
          পর্যালোচনা শুরু করুন
        </button>
      ) : otherReviewer ? (
        <p className="text-sm text-ink-2">অন্য একজন মডারেটর পর্যালোচনা করছেন।</p>
      ) : (
        <>
          <label className="mb-label block text-sm">
            পর্যালোচনার মন্তব্য (সংশোধন/প্রত্যাখ্যানে আবশ্যক)
            <textarea
              className="mb-input w-full !border-line rounded-xl p-3"
              rows={3}
              maxLength={1000}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate("approved")}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl disabled:opacity-40"
            >
              অনুমোদন
            </button>
            <button
              disabled={mutation.isPending || note.trim().length < 10}
              onClick={() => mutation.mutate("changes_requested")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-gold-soft text-gold border border-gold/25 rounded-xl disabled:opacity-40"
            >
              সংশোধন চাই
            </button>
            <button
              disabled={mutation.isPending || note.trim().length < 10}
              onClick={() => mutation.mutate("rejected")}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold bg-brand-soft text-brand border border-brand/25 rounded-xl disabled:opacity-40"
            >
              প্রত্যাখ্যান
            </button>
          </div>
        </>
      )}
    </article>
  );
}
export default function ReviewQueue() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["biodata-review", page],
    queryFn: () => workflowApi.listReview(page),
  });
  return (
    <section className="space-y-4">
      {isLoading ? (
        <p className="text-sm text-ink-3">পর্যালোচনার তালিকা লোড হচ্ছে...</p>
      ) : isError ? (
        <p className="text-sm text-ink-3">
          লোড করা যায়নি।{" "}
          <button onClick={() => refetch()}>আবার চেষ্টা করুন</button>
        </p>
      ) : (
        <>
          {!data?.data?.applications.length && (
            <p className="text-sm text-ink-3">পর্যালোচনার অপেক্ষায় কোনো বায়োডাটা নেই।</p>
          )}
          {data?.data?.applications.map((app) => (
            <ReviewCard key={app._id} app={app} />
          ))}
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="mb-btn-secondary disabled:opacity-40"
            >
              আগের পৃষ্ঠা
            </button>
            <span className="text-sm font-bold text-ink-2">{page}</span>
            <button
              disabled={page >= (data?.meta?.totalPages || 1)}
              onClick={() => setPage((p) => p + 1)}
              className="mb-btn-secondary disabled:opacity-40"
            >
              পরের পৃষ্ঠা
            </button>
          </div>
        </>
      )}
    </section>
  );
}
