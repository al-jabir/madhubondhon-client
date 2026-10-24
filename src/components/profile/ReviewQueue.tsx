import ReviewWork from './ReviewWork';
import { useState } from "react";
import type { ElementType, ReactNode } from "react";
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
import GenderAvatar from "../common/GenderAvatar";
import {
  Inbox,
  RotateCw,
  UserRound,
  GraduationCap,
  Ruler,
  Home,
  MoonStar,
  HeartHandshake,
  Lock,
  ShieldCheck,
  ShieldAlert,
  ClipboardCheck,
  CheckCircle2,
  Check,
  PenLine,
  X,
  Briefcase,
  Clock,
  Eye,
  Printer,
} from "lucide-react";
import PrintBiodataModal from "./PrintBiodataModal";

/* Bengali numeral helper for plain numbers */
const bnDigits = (value: string | number, bn: boolean) =>
  bn ? String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]) : String(value);

/* ─────────── shared class bits ─────────── */
const tileIcon = "w-9 h-9 shrink-0 rounded-xl flex items-center justify-center border border-line bg-elev";
const yn = (v: boolean | undefined, t: string, f: string, na: string) =>
  v === true ? t : v === false ? f : na;

/* ─────────── Info tile ─────────── */
function InfoTile({
  icon: Icon,
  label,
  children,
  tone = "text-brand",
}: {
  icon: ElementType;
  label: string;
  children: ReactNode;
  tone?: string;
}) {
  return (
    <div className="rounded-2xl bg-elev border border-line p-4 space-y-2">
      <div className="flex items-center gap-2.5">
        <div className={tileIcon}>
          <Icon className={`w-4 h-4 ${tone}`} />
        </div>
        <h4 className="text-[11px] font-black text-ink-3 leading-tight">{label}</h4>
      </div>
      <div className="text-xs text-ink-2 leading-relaxed">{children}</div>
    </div>
  );
}

/* ─────────── Review card ─────────── */
function ReviewCard({ app }: { app: Application }) {
  const cache = useQueryClient();
  const { user } = useAuth();
  const { isBengali, formatNumber } = useLanguage();
  const [note, setNote] = useState("");
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  const statusMeta: Record<string, { label: string; cls: string; icon: ElementType }> = {
    draft: {
      label: isBengali ? "খসড়া" : "Draft",
      cls: "bg-elev text-ink-2 border-line",
      icon: Clock,
    },
    submitted: {
      label: isBengali ? "জমা দেওয়া" : "Submitted",
      cls: "bg-gold-soft text-gold border border-gold/25",
      icon: Clock,
    },
    under_review: {
      label: isBengali ? "পর্যালোচনাধীন" : "Under Review",
      cls: "bg-brand-soft text-brand border border-brand/25",
      icon: Eye,
    },
    changes_requested: {
      label: isBengali ? "সংশোধন চাওয়া হয়েছে" : "Changes Requested",
      cls: "bg-gold-soft text-gold border border-gold/25",
      icon: PenLine,
    },
    approved: {
      label: isBengali ? "অনুমোদিত" : "Approved",
      cls: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800",
      icon: CheckCircle2,
    },
    rejected: {
      label: isBengali ? "প্রত্যাখ্যাত" : "Rejected",
      cls: "bg-brand-soft text-brand border border-brand/25",
      icon: X,
    },
  };
  const status = statusMeta[app.status] || statusMeta.draft;
  const StatusIcon = status.icon;

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
  const otherReviewer = (app.assignedReviewer && app.assignedReviewer !== (user?.id || user?._id)) ||
    app.status === "under_review" &&
    app.reviewedBy &&
    app.reviewedBy !== (user?.id || user?._id);

  const education =
    [d.education, d.educationDetail].filter(Boolean).join(isBengali ? " — " : " — ") ||
    (isBengali ? "উল্লেখ নেই" : "Not specified");

  return (
    <article className="mb-card rounded-[1.75rem] overflow-hidden">
      {/* ── Header strip ── */}
      <header className="relative bg-linear-to-r from-brand/10 via-transparent to-gold-soft/40 dark:to-gold-soft/10 border-b border-line px-5 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-full border-2 border-card shadow-sm overflow-hidden">
              <GenderAvatar gender={d.gender} size={48} className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-black text-ink truncate">{d.displayName}</h2>
              <p className="text-[11px] text-ink-3 flex flex-wrap items-center gap-x-2">
                <span>{d.gender === "male" ? (isBengali ? "পাত্র" : "Male") : isBengali ? "পাত্রী" : "Female"}</span>
                <span aria-hidden="true">·</span>
                <span>{d.dateOfBirth?.slice(0, 10)}</span>
                <span aria-hidden="true">·</span>
                <span>{getUpazilaDisplayName(d.upazila, isBengali)}</span>
              </p>
            </div>
          </div>

          <div className="sm:ml-auto flex items-center gap-2 shrink-0">
            {/* guardian consent mini-chip */}
            {app.guardianConsentedAt ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" />
                <span>{isBengali ? "অভিভাবক যাচাইকৃত" : "Guardian verified"}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-bold bg-gold-soft text-gold border border-gold/25">
                <ShieldAlert className="w-3 h-3" />
                <span>{isBengali ? "অভিভাবক অসম্পূর্ণ" : "Guardian incomplete"}</span>
              </span>
            )}
            {/* print preview button */}
            <button
              onClick={() => setIsPrintOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-elev text-ink-2 hover:bg-brand-soft hover:text-brand border border-line transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isBengali ? "প্রিন্ট / PDF" : "Print PDF"}</span>
            </button>
            {/* status pill */}
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${status.cls}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{status.label}</span>
            </span>
          </div>
        </div>
      </header><ReviewWork key={app._id+app.revision} app={app}/>

      {/* ── Body ── */}
      <div className="px-5 sm:px-6 py-5 space-y-4">
        {/* bio highlight */}
        <div className="rounded-2xl bg-elev border border-line p-4">
          <div className="flex items-center gap-2 pb-2">
            <div className={tileIcon + " !w-7 !h-7"}>
              <UserRound className="w-3.5 h-3.5 text-brand" />
            </div>
            <h4 className="text-[11px] font-black text-ink-3">{isBengali ? "নিজের সম্পর্কে" : "About"}</h4>
          </div>
          <p className="text-xs text-ink-2 leading-relaxed whitespace-pre-wrap">
            {d.bio || (isBengali ? "পরিচিতি উল্লেখ নেই।" : "No introduction provided.")}
          </p>
        </div>

        {/* info tiles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <InfoTile icon={GraduationCap} label={isBengali ? "শিক্ষা ও পেশা" : "Education & Occupation"}>
            <p className="font-bold text-ink">{education}</p>
            {d.occupation && (
              <p className="flex items-center gap-1.5 text-ink-3">
                <Briefcase className="w-3 h-3" />
                {d.occupation}
              </p>
            )}
          </InfoTile>

          <InfoTile icon={Ruler} label={isBengali ? "উচ্চতা ও জীবনযাপন" : "Height & Lifestyle"}>
            <p className="font-bold text-ink">
              {formatNumber(d.height?.feet || 0)} {isBengali ? "ফুট" : "ft"} {formatNumber(d.height?.inches || 0)}{" "}
              {isBengali ? "ইঞ্চি" : "in"}
            </p>
            <p className="text-ink-3">
              {isBengali ? "ধূমপান: " : "Smoking: "}
              <strong className="text-ink-2">{yn(d.lifestyle?.smoking, isBengali ? "হ্যাঁ" : "Yes", isBengali ? "না" : "No", isBengali ? "উল্লেখ নেই" : "Not specified")}</strong>
            </p>
          </InfoTile>

          <InfoTile icon={Home} label={isBengali ? "পরিবার" : "Family Details"}>
            <p className="font-bold text-ink">
              {d.familyInfo?.fatherOccupation || (isBengali ? "বাবা: উল্লেখ নেই" : "Father: not specified")} ·{" "}
              {d.familyInfo?.motherOccupation || (isBengali ? "মা: উল্লেখ নেই" : "Mother: not specified")}
            </p>
            <p className="text-ink-3">
              {isBengali ? "ভাইবোন: " : "Siblings: "}
              {d.familyInfo?.siblings != null
                ? bnDigits(d.familyInfo.siblings, isBengali)
                : isBengali
                  ? "উল্লেখ নেই"
                  : "Not specified"}
            </p>
          </InfoTile>

          <InfoTile icon={MoonStar} label={isBengali ? "ধর্মীয় তথ্য" : "Religious Information"} tone="text-gold">
            <p className="font-bold text-ink">{d.religiousInfo?.religion || (isBengali ? "উল্লেখ নেই" : "Not specified")}</p>
            <p className="text-ink-3">
              {isBengali ? "পাঁচ ওয়াক্ত নামাজ: " : "5 Daily Prayers: "}
              <strong className="text-ink-2">
                {yn(d.religiousInfo?.praysFiveTimes, isBengali ? "হ্যাঁ" : "Yes", isBengali ? "না" : "No", isBengali ? "উল্লেখ নেই" : "Not specified")}
              </strong>
              {d.gender === "female" && (
                <>
                  {" · "}
                  {isBengali ? "হিজাব: " : "Hijab: "}
                  <strong className="text-ink-2">
                    {yn(d.religiousInfo?.wearsHijab, isBengali ? "হ্যাঁ" : "Yes", isBengali ? "না" : "No", isBengali ? "উল্লেখ নেই" : "Not specified")}
                  </strong>
                </>
              )}
              {d.gender === "male" && (
                <>
                  {" · "}
                  {isBengali ? "দাড়ি: " : "Beard: "}
                  <strong className="text-ink-2">
                    {yn(d.religiousInfo?.hasBeard, isBengali ? "হ্যাঁ" : "Yes", isBengali ? "না" : "No", isBengali ? "উল্লেখ নেই" : "Not specified")}
                  </strong>
                </>
              )}
            </p>
          </InfoTile>

          <InfoTile icon={HeartHandshake} label={isBengali ? "প্রত্যাশা" : "Expectations"} tone="text-gold">
            <p className="font-bold text-ink">
              {formatNumber(d.preferences?.minAge || 0)} – {formatNumber(d.preferences?.maxAge || 0)}{" "}
              {isBengali ? "বছর" : "yrs"}
            </p>
            <p className="text-ink-3">
              {d.preferences?.preferredUpazilas?.map((u) => getUpazilaDisplayName(u, isBengali)).join(", ") ||
                (isBengali ? "যেকোনো উপজেলা" : "Any upazila")}
            </p>
          </InfoTile>

          <InfoTile icon={Lock} label={isBengali ? "অভিভাবক (গোপনীয়)" : "Guardian (Confidential)"} tone="text-brand-ink">
            {app.guardian?.name ? (
              <>
                <p className="font-bold text-ink">
                  {app.guardian.name}{" "}
                  <span className="font-normal text-ink-3">({app.guardian.relationship})</span>
                </p>
                <p className="font-mono text-ink-2" dir="ltr">
                  {app.guardian.phone}
                </p>
              </>
            ) : (
              <p className="text-ink-3">{isBengali ? "তথ্য পাওয়া যায়নি" : "Details not available"}</p>
            )}
          </InfoTile>
        </div>

        {/* ── decision area ── */}
        <div className="pt-1">
          <div className="border-t border-dashed border-line" />
        </div>

        {app.status === "submitted" ? (
          <div className="rounded-2xl bg-brand-soft/60 dark:bg-brand-soft/40 border border-brand/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-xs text-ink-2 leading-relaxed max-w-md">
              {isBengali
                ? "পর্যালোচনা শুরু করলে এটি আপনার নামে লক হবে, অথবা সরাসরি যাচাই করে অনুমোদন করুন।"
                : "Start full review to lock under your name, or directly approve."}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate("approved")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{isBengali ? "সরাসরি অনুমোদন" : "Direct Approve"}</span>
              </button>
              <button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate("under_review")}
                className="mb-btn-primary !px-4 !py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-2 shrink-0"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>{isBengali ? "পর্যালোচনা শুরু করুন" : "Start Review"}</span>
              </button>
            </div>
          </div>
        ) : otherReviewer ? (
          <div className="rounded-2xl bg-elev border border-line p-4 flex items-start gap-2.5">
            <Eye className="w-4 h-4 text-ink-3 shrink-0 mt-0.5" />
            <p className="text-xs text-ink-2 leading-relaxed">
              {isBengali
                ? "অন্য একজন মডারেটর বর্তমানে এটি পর্যালোচনা করছেন।"
                : "Another moderator is currently reviewing this application."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-[11px] font-black text-ink-3">
                {isBengali
                  ? "পর্যালোচনার মন্তব্য (সংশোধন/প্রত্যাখ্যানে আবশ্যক)"
                  : "Review Note / Reason (Required for changes or rejection)"}
              </span>
              <textarea
                className="mb-input w-full rounded-xl"
                rows={3}
                maxLength={1000}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={isBengali ? "মন্তব্য লিখুন..." : "Enter review notes..."}
              />
            </label>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                disabled={mutation.isPending}
                onClick={() => mutation.mutate("approved")}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 disabled:opacity-40 cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>{isBengali ? "অনুমোদন" : "Approve"}</span>
              </button>
              <button
                disabled={mutation.isPending || note.trim().length < 10}
                onClick={() => mutation.mutate("changes_requested")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-gold-soft text-gold border border-gold/25 rounded-xl disabled:opacity-40 cursor-pointer transition-colors hover:bg-gold/15"
              >
                <PenLine className="w-4 h-4" />
                <span>{isBengali ? "সংশোধন চাই" : "Request Changes"}</span>
              </button>
              <button
                disabled={mutation.isPending || note.trim().length < 10}
                onClick={() => mutation.mutate("rejected")}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-brand-soft text-brand border border-brand/25 rounded-xl disabled:opacity-40 cursor-pointer transition-colors hover:bg-brand/15"
              >
                <X className="w-4 h-4" />
                <span>{isBengali ? "প্রত্যাখ্যান" : "Reject"}</span>
              </button>
              {note.trim().length > 0 && note.trim().length < 10 && (
                <span className="text-[10.5px] text-gold font-bold">
                  {isBengali ? "আরও অন্তত " : "At least "}
                  {bnDigits(10 - note.trim().length, isBengali)}
                  {isBengali ? " অক্ষর লিখুন" : " more characters needed"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {isPrintOpen && (
        <PrintBiodataModal
          isOpen={isPrintOpen}
          onClose={() => setIsPrintOpen(false)}
          profile={app.data as any}
          guardian={app.guardian}
        />
      )}
    </article>
  );
}

/* ─────────── Queue ─────────── */
export default function ReviewQueue() {
  const { isBengali, formatNumber } = useLanguage();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["biodata-review", page],
    queryFn: () => workflowApi.listReview(page),
  });

  const applications = data?.data?.applications || [];
  const totalPages = data?.meta?.totalPages || 1;
  const total = data?.meta?.total ?? applications.length;

  return (
    <section className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="mb-card rounded-[1.75rem] overflow-hidden">
              <div className="h-20 border-b border-line bg-elev/60 animate-pulse" />
              <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {[0, 1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-20 rounded-2xl bg-elev animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="mb-card rounded-[1.75rem] p-10 text-center space-y-4">
          <p className="text-sm text-ink-2">
            {isBengali ? "পর্যালোচনার তালিকা লোড করা যায়নি।" : "Could not load the review queue."}
          </p>
          <button
            onClick={() => refetch()}
            className="mb-btn-secondary !text-xs py-2.5 px-5 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isBengali ? "আবার চেষ্টা করুন" : "Try again"}</span>
          </button>
        </div>
      ) : applications.length === 0 ? (
        /* ── Empty state ── */
        <div className="mb-card rounded-[1.75rem] p-10 sm:p-12 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-brand-soft text-brand flex items-center justify-center mx-auto border border-brand/20">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-black text-ink">
              {isBengali ? "পর্যালোচনার অপেক্ষায় কোনো বায়োডাটা নেই" : "No biodata currently awaiting review"}
            </h3>
            <p className="text-xs text-ink-3 max-w-md mx-auto leading-relaxed">
              {isBengali
                ? "সদস্যরা নতুন বায়োডাটা জমা দিলে বা সংশোধন করলে সেগুলো এখানে দেখা যাবে। ততক্ষণ পর্যন্ত প্রকাশিত বায়োডাটা ব্যবস্থাপনা দেখে নিতে পারেন।"
                : "New or revised biodata submissions will appear here for verification. Meanwhile, you can manage already published biodata."}
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="mb-btn-secondary !text-xs py-2.5 px-5 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isBengali ? "কিউ রিফ্রেশ করুন" : "Refresh queue"}</span>
          </button>
        </div>
      ) : (
        <>
          {/* count strip */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold text-ink-2 flex items-center gap-2">
              <span>{isBengali ? "অপেক্ষমান বায়োডাটা" : "Pending biodata"}</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] font-black bg-brand-soft text-brand border border-brand/25">
                {formatNumber(total)}
              </span>
            </p>
            <button
              onClick={() => refetch()}
              title={isBengali ? "রিফ্রেশ" : "Refresh"}
              className="text-ink-3 hover:text-brand transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-elev"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {applications.map((app) => (
            <ReviewCard key={app._id} app={app} />
          ))}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="mb-btn-secondary disabled:opacity-40 cursor-pointer text-xs font-bold px-4"
              >
                {isBengali ? "পূর্ববর্তী পৃষ্ঠা" : "Previous"}
              </button>
              <span className="text-sm font-bold text-ink-2 tabular-nums">
                {formatNumber(page)} / {formatNumber(totalPages)}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="mb-btn-secondary disabled:opacity-40 cursor-pointer text-xs font-bold px-4"
              >
                {isBengali ? "পরবর্তী পৃষ্ঠা" : "Next"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
