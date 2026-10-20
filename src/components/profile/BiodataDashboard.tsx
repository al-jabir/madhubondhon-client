import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  workflowApi,
  statusLabels,
  errorMessage,
} from "../../api/workflow.api";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../i18n/LanguageContext";
import {
  Mail,
  Phone,
  DoorOpen,
  ClipboardCheck,
  CheckCircle2,
  CircleAlert,
  Edit3,
  RotateCw,
  ShieldCheck,
  Users,
  Sparkles,
  Clock,
  ArrowRight,
} from "lucide-react";

const input = "mb-input w-full";

/* ─────────── Verification mini-card ─────────── */
function VerificationCard({
  purpose,
  verified,
}: {
  purpose: "email" | "phone";
  verified: boolean;
}) {
  const { user, refreshUser } = useAuth();
  const { isBengali } = useLanguage();
  const [phone, setPhone] = useState(user?.phone || "");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function request() {
    setBusy(true);
    try {
      const res = await workflowApi.requestVerification(purpose, phone);
      setChallenge(res.data!.challengeId);
      setCode("");
      toast.success(
        isBengali ? "যাচাই কোড পাঠানো হয়েছে" : "Verification code sent"
      );
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    try {
      await workflowApi.confirmVerification(purpose, challenge, code);
      await refreshUser();
      setChallenge("");
      setCode("");
      toast.success(isBengali ? "যাচাই সম্পূর্ণ" : "Verification successful");
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const isEmail = purpose === "email";
  const Icon = isEmail ? Mail : Phone;

  return (
    <section className="rounded-2xl bg-elev border border-line p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              verified
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400"
                : "bg-brand-soft text-brand"
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-ink">
            {isEmail
              ? isBengali
                ? "ইমেইল যাচাই"
                : "Email Verification"
              : isBengali
              ? "মোবাইল যাচাই"
              : "Phone Verification"}
          </h3>
        </div>
        {verified ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            {isBengali ? "সম্পন্ন" : "Verified"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gold-soft text-gold border border-gold/25">
            <CircleAlert className="w-3 h-3" />
            {isBengali ? "বাকি আছে" : "Pending"}
          </span>
        )}
      </div>

      {isEmail ? (
        <p className="text-sm text-ink-2 bg-card rounded-xl px-3 py-2 border border-line">
          {user?.email}
        </p>
      ) : (
        <input
          className={input}
          type="tel"
          placeholder={isBengali ? "আপনার মোবাইল নম্বর" : "Your mobile number"}
          value={phone}
          disabled={verified || busy}
          onChange={(e) => setPhone(e.target.value)}
        />
      )}

      {!verified && (
        <>
          <button
            disabled={busy}
            onClick={request}
            className="text-brand text-xs font-bold hover:underline disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCw className={`w-3 h-3 ${busy ? "animate-spin" : ""}`} />
            <span>
              {challenge
                ? isBengali
                  ? "আবার কোড নিন (১ মিনিট পর)"
                  : "Resend Code"
                : isBengali
                ? "যাচাই কোড নিন"
                : "Send Verification Code"}
            </span>
          </button>
          {challenge && (
            <div className="space-y-2.5">
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={`${input} text-center tracking-[0.35em] font-mono font-bold`}
                placeholder={isBengali ? "৬ সংখ্যার কোড" : "6-digit code"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                disabled={busy || code.length !== 6}
                onClick={confirm}
                className="mb-btn-primary px-4 py-2 text-xs w-full cursor-pointer disabled:opacity-50"
              >
                {isBengali ? "যাচাই করুন" : "Verify"}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ─────────── Dashboard ─────────── */
export default function BiodataDashboard() {
  const cache = useQueryClient();
  const [searchParams] = useSearchParams();
  const isFromWizard = searchParams.get('from') === 'wizard';
  const { user } = useAuth();
  const { isBengali, formatNumber } = useLanguage();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["biodata-draft"],
    queryFn: workflowApi.getDraft,
  });
  const app = data?.data?.application;
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function action(fn: () => Promise<unknown>) {
    setBusy(true);
    try {
      await fn();
      await cache.invalidateQueries({ queryKey: ["biodata-draft"] });
      await cache.invalidateQueries({ queryKey: ["my-profile"] });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const emailVerified = !!user?.isEmailVerified;
  const phoneVerified = !!user?.isPhoneVerified;
  const guardianConsented = !!app?.guardianConsentedAt;
  const submissible = !!(app && ["draft", "changes_requested", "rejected"].includes(app.status));

  const verificationCompletedCount =
    (emailVerified ? 1 : 0) +
    (phoneVerified ? 1 : 0) +
    (guardianConsented ? 1 : 0);

  const statusTone: Record<string, { bg: string; text: string; border: string }> = {
    approved: {
      bg: "bg-emerald-100 dark:bg-emerald-900/60",
      text: "text-emerald-600 dark:text-emerald-400",
      border: "border-emerald-200 dark:border-emerald-800",
    },
    draft: { bg: "bg-gold-soft", text: "text-gold", border: "border-gold/25" },
  };
  const tone =
    (app ? statusTone[app.status] : undefined) || {
      bg: "bg-brand-soft",
      text: "text-brand",
      border: "border-brand/25",
    };

  const statusLabel = app
    ? isBengali
      ? statusLabels[app.status]
      : ({
          draft: "Draft",
          submitted: "Pending Review",
          under_review: "Under Review",
          approved: "Approved",
          changes_requested: "Changes Requested",
          rejected: "Rejected",
        } as Record<string, string>)[app.status] || app.status
    : "";

  return (
    <div className="space-y-6">
      {/* ── Wizard completion notice ── */}
      {isFromWizard && submissible && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
              {isBengali
                ? "অভিনন্দন! বায়োডাটার সকল তথ্য সংরক্ষিত হয়েছে।"
                : "Congratulations! Your biodata details have been saved."}
            </h4>
            <p className="text-xs text-ink-2 leading-relaxed">
              {isBengali
                ? "এবার প্ল্যাটফর্মে বায়োডাটা প্রকাশের জন্য নিচের ৩টি ছোট যাচাই (ইমেইল, মোবাইল ও অভিভাবক সম্মতি) সম্পন্ন করে নিচে 'পর্যালোচনার জন্য জমা দিন' বাটনে ক্লিক করুন।"
                : "Now complete the 3 quick verifications below (email, phone, and guardian consent) and click 'Submit for Review' at the bottom to submit for approval."}
            </p>
          </div>
        </div>
      )}

      {/* ── Progress header ── */}
      <div className="mb-card rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center border border-brand/20">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-ink leading-tight">
                {isBengali ? "যাচাই ও জমা প্রক্রিয়া" : "Verification & Submission Process"}
              </h2>
              <p className="text-xs text-ink-3 mt-0.5">
                {isBengali
                  ? "ইমেইল → মোবাইল → অভিভাবকের সম্মতি → পর্যালোচনায় জমা"
                  : "Email → Phone → Guardian Consent → Review Submission"}
              </p>
            </div>
          </div>

          {/* step counter */}
          <div className="flex items-center gap-2 shrink-0">
            {[0, 1, 2].map((idx) => {
              const done = idx < verificationCompletedCount;
              return (
                <span
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    done
                      ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-elev text-ink-3 border border-line"
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isBengali ? (
                    formatNumber(idx + 1)
                  ) : (
                    idx + 1
                  )}
                </span>
              );
            })}
            <span className="text-[11px] font-bold text-ink-2 ml-1">
              {isBengali
                ? `${formatNumber(verificationCompletedCount)}/৩ সম্পন্ন`
                : `${verificationCompletedCount}/3 Completed`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Verification cards ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <VerificationCard purpose="email" verified={emailVerified} />
        <VerificationCard purpose="phone" verified={phoneVerified} />
      </div>

      {/* ── Application status ── */}
      {isLoading ? (
        <div className="mb-card rounded-2xl p-8 text-center">
          <p className="text-sm text-ink-2 animate-pulse">
            {isBengali ? "বায়োডাটার অবস্থা লোড হচ্ছে..." : "Loading biodata status..."}
          </p>
        </div>
      ) : isError ? (
        <div className="mb-card rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-ink-2">
            {isBengali ? "তথ্য লোড করা যায়নি।" : "Failed to load details."}
          </p>
          <button
            onClick={() => refetch()}
            className="mb-btn-secondary !text-xs py-2 px-4 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isBengali ? "আবার চেষ্টা করুন" : "Try again"}</span>
          </button>
        </div>
      ) : (
        app && (
          <section className="mb-card rounded-[2rem] p-6 sm:p-7 space-y-5">
            {/* status row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black text-ink">
                  {isBengali ? "বায়োডাটার অবস্থা" : "Biodata Status"}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${tone.bg} ${tone.text} border ${tone.border}`}
                >
                  {statusLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/edit-profile"
                  className="mb-btn-secondary !text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5 bg-elev"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isBengali ? "খসড়া সম্পাদনা করুন" : "Edit Draft"}</span>
                </Link>
                <Link
                  to="/contacts"
                  className="text-xs font-bold text-brand hover:text-brand/80 inline-flex items-center gap-1.5"
                >
                  <span>{isBengali ? "যোগাযোগের অনুরোধ" : "Contact Requests"}</span>
                </Link>
              </div>
            </div>

            {app.reviewNote && (
              <div className="bg-gold-soft text-gold border border-gold/25 p-4 rounded-xl text-xs leading-relaxed flex gap-2">
                <DoorOpen className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>{isBengali ? "মডারেটরের মন্তব্য:" : "Moderator Note:"}</strong>{" "}
                  {app.reviewNote}
                </p>
              </div>
            )}

            {/* Guardian consent */}
            <div className="rounded-2xl bg-elev border border-line p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-line">
                  <Users className="w-4 h-4 text-brand" />
                </div>
                <h4 className="font-bold text-sm text-ink">
                  {isBengali ? "অভিভাবকের সম্মতি" : "Guardian Consent"}
                </h4>
                {guardianConsented && (
                  <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    {isBengali ? "যাচাই সম্পূর্ণ" : "Verified"}
                  </span>
                )}
              </div>

              {app.guardian?.phone ? (
                <div className="bg-card rounded-xl px-3.5 py-2.5 border border-line text-sm text-ink-2 flex flex-wrap items-center gap-x-2">
                  <strong className="text-ink">{app.guardian.name}</strong>
                  <span className="text-ink-3">({app.guardian.relationship})</span>
                  <span className="text-ink-3">•</span>
                  <span className="font-mono">{app.guardian.phone}</span>
                </div>
              ) : (
                <p className="text-xs text-ink-2 leading-relaxed">
                  {isBengali
                    ? "খসড়ায় অভিভাবকের নাম, সম্পর্ক ও মোবাইল সংরক্ষণ করুন।"
                    : "Please provide guardian name, relationship, and mobile number in the draft."}
                </p>
              )}

              {guardianConsented ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  {isBengali
                    ? "মোবাইল ও সম্মতি যাচাই সম্পূর্ণ ✓"
                    : "Mobile & Guardian Consent Verified ✓"}
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-ink-2 leading-relaxed">
                    {isBengali
                      ? "অভিভাবককে উদ্দেশ্য বুঝিয়ে সম্মতি নিন। কোডটি তাঁর মোবাইলে যাবে; তিনি সম্মত হলেই কোডটি দেবেন।"
                      : "Obtain consent from your guardian. A verification code will be sent to their mobile number."}
                  </p>
                  <button
                    disabled={busy || !app.guardian?.phone}
                    className="mb-btn-secondary !text-xs py-2 px-4 rounded-xl cursor-pointer disabled:opacity-40 inline-flex items-center gap-1.5 bg-card"
                    onClick={() =>
                      action(async () => {
                        const res = await workflowApi.requestGuardian();
                        setChallenge(res.data!.challengeId);
                        setCode("");
                      })
                    }
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>
                      {isBengali
                        ? "অভিভাবকের মোবাইলে কোড পাঠান"
                        : "Send Code to Guardian"}
                    </span>
                  </button>

                  {challenge && (
                    <div className="space-y-2.5 pt-1">
                      <input
                        className={`${input} text-center tracking-[0.35em] font-mono font-bold`}
                        maxLength={6}
                        inputMode="numeric"
                        placeholder={
                          isBengali ? "অভিভাবকের সম্মতির কোড" : "Guardian Consent Code"
                        }
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <label className="flex items-start gap-2 text-[11px] text-ink-2 leading-relaxed cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-[color:var(--mb-brand)]"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        <span>
                          {isBengali
                            ? "অভিভাবক তথ্য সংরক্ষণ ও অনুমতি অনুযায়ী যোগাযোগ প্রকাশে সম্মতি দিয়েছেন"
                            : "Guardian has consented to data storage and contact release upon approval"}
                        </span>
                      </label>
                      <button
                        disabled={busy || !consent || code.length !== 6}
                        className="mb-btn-primary px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
                        onClick={() =>
                          action(async () => {
                            await workflowApi.confirmGuardian(challenge, code, consent);
                            setChallenge("");
                            toast.success(
                              isBengali ? "সম্মতি যাচাই হয়েছে" : "Consent confirmed"
                            );
                          })
                        }
                      >
                        {isBengali ? "সম্মতি নিশ্চিত করুন" : "Confirm Consent"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* submit area / status tracker */}
            {app.status === "submitted" || app.status === "under_review" ? (
              <div className="rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 p-5 sm:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{isBengali ? "পর্যালোচনা প্রক্রিয়াধীন" : "Review In Progress"}</span>
                      </div>
                      <h4 className="text-base font-bold text-ink">
                        {isBengali ? "আপনার বায়োডাটা সফলভাবে জমা হয়েছে!" : "Your Biodata Has Been Submitted!"}
                      </h4>
                      <p className="text-xs text-ink-2 leading-relaxed max-w-xl">
                        {isBengali
                          ? "আপনার আবেদনটি আমাদের মডারেশন টিমের কাছে পৌঁছেছে। সাধারণত ২ থেকে ৬ ঘণ্টার মধ্যে তথ্য ও অভিভাবক সম্মতি পুঙ্খানুপুঙ্খভাবে যাচাই করে বায়োডাটা সক্রিয় করা হয়।"
                          : "Your biodata and guardian verification have been submitted to the moderation team. Reviews are completed within 2 to 6 hours. Upon approval, your profile is published."}
                      </p>
                    </div>
                  </div>

                  <Link
                    to="/edit-profile"
                    className="mb-btn-secondary !text-xs py-2.5 px-4 rounded-xl shrink-0 inline-flex items-center gap-1.5 bg-card"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isBengali ? "খসড়া তথ্য সম্পাদনা" : "Edit Submitted Draft"}</span>
                  </Link>
                </div>

                {/* 4-step progress tracker */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-emerald-500/20 text-xs">
                  <div className="bg-card/80 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isBengali ? "১. তথ্য পূরণ" : "1. Info Entry"}</span>
                    </div>
                    <p className="text-[11px] text-ink-3">{isBengali ? "সম্পন্ন হয়েছে" : "Completed"}</p>
                  </div>

                  <div className="bg-card/80 p-2.5 rounded-xl border border-emerald-500/20 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isBengali ? "২. অভিভাবক সম্মতি" : "2. Consent"}</span>
                    </div>
                    <p className="text-[11px] text-ink-3">{isBengali ? "যাচাইকৃত" : "Verified"}</p>
                  </div>

                  <div className="bg-emerald-500/15 p-2.5 rounded-xl border border-emerald-500/40 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>{isBengali ? "৩. মডারেশন" : "3. Moderation"}</span>
                    </div>
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-200 font-semibold">
                      {isBengali ? "পর্যালোচনা চলছে" : "Under Review"}
                    </p>
                  </div>

                  <div className="bg-card/80 p-2.5 rounded-xl border border-line space-y-1 opacity-70">
                    <div className="flex items-center gap-1.5 text-ink-3 font-bold">
                      <span>{isBengali ? "৪. প্রকাশনা" : "4. Published"}</span>
                    </div>
                    <p className="text-[11px] text-ink-3">{isBengali ? "অনুমোদনের পর" : "After Approval"}</p>
                  </div>
                </div>
              </div>
            ) : app.status === "approved" ? (
              <div className="rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-ink">
                      {isBengali ? "আলহামদুলিল্লাহ! আপনার বায়োডাটা অনুমোদিত হয়েছে।" : "Alhamdulillah! Your Biodata is Approved."}
                    </h4>
                    <p className="text-xs text-ink-2 mt-0.5">
                      {isBengali ? "আপনার বায়োডাটা এখন প্ল্যাটফর্মে সক্রিয় এবং পাত্র-পাত্রীরা অনুসন্ধান করতে পারবেন।" : "Your biodata is active on the platform and discoverable by potential matches."}
                    </p>
                  </div>
                </div>
                <Link to="/my-profile?tab=overview" className="mb-btn-primary px-5 py-2.5 text-xs rounded-xl shrink-0 inline-flex items-center gap-1.5">
                  <span>{isBengali ? "সারসংক্ষেপ দেখুন" : "View Overview"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl bg-brand-soft/60 dark:bg-brand-soft/40 border border-brand/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 max-w-md">
                  <p className="text-xs font-bold text-ink">
                    {isBengali ? "চূড়ান্ত জমা দেওয়ার প্রয়োজনীয় ধাপ:" : "Required Steps Before Submission:"}
                  </p>
                  <p className="text-xs text-ink-2 leading-relaxed">
                    {!emailVerified || !phoneVerified || !guardianConsented ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold">
                        {isBengali ? "বাকি আছে: " : "Missing: "}
                        {[
                          !emailVerified && (isBengali ? "ইমেইল যাচাই" : "Email verification"),
                          !phoneVerified && (isBengali ? "মোবাইল যাচাই" : "Phone verification"),
                          !guardianConsented && (isBengali ? "অভিভাবকের ওটিপি সম্মতি" : "Guardian consent"),
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {isBengali
                          ? "সকল ৩টি যাচাই সম্পন্ন হয়েছে! এবার পর্যালোচনার জন্য জমা দিন।"
                          : "All 3 verifications complete! You can now submit for moderation review."}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  disabled={
                    busy ||
                    !emailVerified ||
                    !phoneVerified ||
                    !guardianConsented ||
                    !submissible
                  }
                  onClick={() =>
                    action(async () => {
                      await workflowApi.submit(app.revision);
                      toast.success(
                        isBengali
                          ? "বায়োডাটা পর্যালোচনার জন্য সফলভাবে জমা হয়েছে!"
                          : "Biodata submitted for moderation review successfully!"
                      );
                    })
                  }
                  className="mb-btn-primary px-6 py-3 text-sm rounded-xl shrink-0 cursor-pointer disabled:opacity-40"
                >
                  {isBengali ? "পর্যালোচনার জন্য জমা দিন" : "Submit for Review"}
                </button>
              </div>
            )}
          </section>
        )
      )}
    </div>
  );
}
