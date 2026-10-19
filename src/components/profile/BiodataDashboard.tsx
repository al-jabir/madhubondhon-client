import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  workflowApi,
  statusLabels,
  errorMessage,
} from "../../api/workflow.api";
import { useAuth } from "../../context/useAuth";
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
} from "lucide-react";

const input = "mb-input w-full";

/* Bengali numerals for the "x/৩" counter */
const bnDigits = (value: string | number) =>
  String(value).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[Number(d)]);

/* ─────────── Verification mini-card ─────────── */
function VerificationCard({
  purpose,
  verified,
}: {
  purpose: "email" | "phone";
  verified: boolean;
}) {
  const { user, refreshUser } = useAuth();
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
      toast.success("যাচাই কোড পাঠানো হয়েছে");
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
      toast.success("যাচাই সম্পূর্ণ");
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
            {isEmail ? "ইমেইল যাচাই" : "মোবাইল যাচাই"}
          </h3>
        </div>
        {verified ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            সম্পন্ন
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-gold-soft text-gold border border-gold/25">
            <CircleAlert className="w-3 h-3" />
            বাকি আছে
          </span>
        )}
      </div>

      {isEmail ? (
        <p className="text-sm text-ink-2 bg-card rounded-xl px-3 py-2 border border-line">{user?.email}</p>
      ) : (
        <input
          className={input}
          type="tel"
          placeholder="আপনার মোবাইল নম্বর"
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
            <span>{challenge ? "আবার কোড নিন (১ মিনিট পর)" : "যাচাই কোড নিন"}</span>
          </button>
          {challenge && (
            <div className="space-y-2.5">
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={`${input} text-center tracking-[0.35em] font-mono font-bold`}
                placeholder="৬ সংখ্যার কোড"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                disabled={busy || code.length !== 6}
                onClick={confirm}
                className="mb-btn-primary px-4 py-2 text-xs w-full cursor-pointer disabled:opacity-50"
              >
                যাচাই করুন
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
  const { user } = useAuth();
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

  const stepCount =
    (emailVerified ? 1 : 0) + (phoneVerified ? 1 : 0) + (guardianConsented ? 1 : 0) + (app?.status === "approved" ? 1 : 0);

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

  return (
    <div className="space-y-6">
      {/* ── Progress header ── */}
      <div className="mb-card rounded-[2rem] p-6 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand flex items-center justify-center border border-brand/20">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-ink leading-tight">যাচাই ও জমা প্রক্রিয়া</h2>
              <p className="text-xs text-ink-3 mt-0.5">
                ইমেইল → মোবাইল → অভিভাবকের সম্মতি → পর্যালোচনায় জমা
              </p>
            </div>
          </div>

          {/* step counter */}
          <div className="flex items-center gap-2 shrink-0">
            {[false, false, false].map((_, idx) => {
              const done = idx < stepCount;
              return (
                <span
                  key={idx}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                    done
                      ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                      : "bg-elev text-ink-3 border border-line"
                  }`}
                >
                  {done ? <CheckCircle2 className="w-4 h-4" /> : bnDigits(idx + 1)}
                </span>
              );
            })}
            <span className="text-[11px] font-bold text-ink-2 ml-1">{bnDigits(stepCount)}/৩ সম্পন্ন</span>
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
          <p className="text-sm text-ink-2 animate-pulse">বায়োডাটার অবস্থা লোড হচ্ছে...</p>
        </div>
      ) : isError ? (
        <div className="mb-card rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm text-ink-2">তথ্য লোড করা যায়নি।</p>
          <button
            onClick={() => refetch()}
            className="mb-btn-secondary !text-xs py-2 px-4 rounded-xl cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>আবার চেষ্টা করুন</span>
          </button>
        </div>
      ) : (
        app && (
          <section className="mb-card rounded-[2rem] p-6 sm:p-7 space-y-5">
            {/* status row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black text-ink">বায়োডাটার অবস্থা</h3>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${tone.bg} ${tone.text} border ${tone.border}`}>
                  {statusLabels[app.status]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/edit-profile"
                  className="mb-btn-secondary !text-xs py-2 px-4 rounded-xl inline-flex items-center gap-1.5 bg-elev"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>খসড়া সম্পাদনা করুন</span>
                </Link>
                <Link
                  to="/contacts"
                  className="text-xs font-bold text-brand hover:text-brand/80 inline-flex items-center gap-1.5"
                >
                  <span>যোগাযোগের অনুরোধ</span>
                </Link>
              </div>
            </div>

            {app.reviewNote && (
              <div className="bg-gold-soft text-gold border border-gold/25 p-4 rounded-xl text-xs leading-relaxed flex gap-2">
                <DoorOpen className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>মডারেটরের মন্তব্য:</strong> {app.reviewNote}
                </p>
              </div>
            )}

            {/* Guardian consent */}
            <div className="rounded-2xl bg-elev border border-line p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-line">
                  <Users className="w-4 h-4 text-brand" />
                </div>
                <h4 className="font-bold text-sm text-ink">অভিভাবকের সম্মতি</h4>
                {guardianConsented && (
                  <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3" />
                    যাচাই সম্পূর্ণ
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
                  খসড়ায় অভিভাবকের নাম, সম্পর্ক ও মোবাইল সংরক্ষণ করুন।
                </p>
              )}

              {guardianConsented ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  মোবাইল ও সম্মতি যাচাই সম্পূর্ণ ✓
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-[11px] text-ink-2 leading-relaxed">
                    অভিভাবককে উদ্দেশ্য বুঝিয়ে সম্মতি নিন। কোডটি তাঁর মোবাইলে যাবে; তিনি সম্মত হলেই কোডটি দেবেন।
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
                    <span>অভিভাবকের মোবাইলে কোড পাঠান</span>
                  </button>

                  {challenge && (
                    <div className="space-y-2.5 pt-1">
                      <input
                        className={`${input} text-center tracking-[0.35em] font-mono font-bold`}
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="অভিভাবকের সম্মতির কোড"
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
                        অভিভাবক তথ্য সংরক্ষণ ও অনুমতি অনুযায়ী যোগাযোগ প্রকাশে সম্মতি দিয়েছেন
                      </label>
                      <button
                        disabled={busy || !consent || code.length !== 6}
                        className="mb-btn-primary px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
                        onClick={() =>
                          action(async () => {
                            await workflowApi.confirmGuardian(challenge, code, consent);
                            setChallenge("");
                            toast.success("সম্মতি যাচাই হয়েছে");
                          })
                        }
                      >
                        সম্মতি নিশ্চিত করুন
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* submit area */}
            <div className="rounded-2xl bg-brand-soft/60 dark:bg-brand-soft/40 border border-brand/15 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-ink-2 leading-relaxed max-w-md">
                জমা দিতে ইমেইল, মোবাইল, অভিভাবকের সম্মতি ও বায়োডাটার আবশ্যক তথ্য পূরণ করুন।
              </p>
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
                    toast.success("পর্যালোচনার জন্য জমা হয়েছে");
                  })
                }
                className="mb-btn-primary px-6 py-3 text-sm rounded-xl shrink-0 cursor-pointer disabled:opacity-50"
              >
                পর্যালোচনার জন্য জমা দিন
              </button>
            </div>
          </section>
        )
      )}
    </div>
  );
}
