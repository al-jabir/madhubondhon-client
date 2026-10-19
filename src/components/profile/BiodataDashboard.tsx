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
const input = "mb-input w-full";
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
  return (
    <section className="rounded-2xl bg-elev border border-line p-4 space-y-3">
      <h3 className="font-bold text-ink">
        {purpose === "email" ? "ইমেইল" : "মোবাইল"} যাচাই {verified ? "✓" : ""}
      </h3>
      {purpose === "email" ? (
        <p className="text-sm text-ink-2">{user?.email}</p>
      ) : (
        <label className="block text-sm text-ink-2">
          আপনার মোবাইল
          <input
            className={input}
            type="tel"
            value={phone}
            disabled={verified || busy}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
      )}
      {!verified && (
        <>
          <button
            disabled={busy}
            onClick={request}
            className="text-brand font-semibold hover:underline disabled:opacity-40 cursor-pointer"
          >
            {challenge ? "আবার কোড নিন (১ মিনিট পর)" : "যাচাই কোড নিন"}
          </button>
          {challenge && (
            <>
              <label className="block text-sm text-ink-2">
                ৬ সংখ্যার কোড
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  className={input}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
              </label>
              <button
                disabled={busy || code.length !== 6}
                onClick={confirm}
                className="mb-btn-primary px-4 py-2 text-sm"
              >
                যাচাই করুন
              </button>
            </>
          )}
        </>
      )}
    </section>
  );
}
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
  return (
    <div className="max-w-5xl mx-auto px-4 pt-10 space-y-6">
      <h1 className="text-2xl font-bold text-ink">বায়োডাটা ও যাচাই ড্যাশবোর্ড</h1>
      <div className="grid md:grid-cols-2 gap-4 mb-card p-5 rounded-2xl">
        <VerificationCard purpose="email" verified={!!user?.isEmailVerified} />
        <VerificationCard purpose="phone" verified={!!user?.isPhoneVerified} />
      </div>
      {isLoading ? (
        <p className="text-ink-2">বায়োডাটার অবস্থা লোড হচ্ছে...</p>
      ) : isError ? (
        <p className="text-ink-2">
          তথ্য লোড করা যায়নি।{" "}
          <button onClick={() => refetch()} className="text-brand font-semibold hover:underline cursor-pointer">আবার চেষ্টা করুন</button>
        </p>
      ) : (
        app && (
          <section className="mb-card p-6 rounded-2xl space-y-4">
            <h2 className="font-bold text-xl text-ink">
              অবস্থা: {statusLabels[app.status]}
            </h2>
            {app.reviewNote && (
              <p className="bg-gold-soft text-gold border border-gold/25 p-4 rounded-xl">
                মডারেটরের মন্তব্য: {app.reviewNote}
              </p>
            )}
            <div className="flex gap-4">
              <Link to="/edit-profile" className="text-brand font-semibold hover:underline">
                খসড়া সম্পাদনা করুন
              </Link>
              <Link to="/contacts" className="text-brand font-semibold hover:underline">
                যোগাযোগের অনুরোধ
              </Link>
            </div>
            <div className="border-t border-line pt-4 space-y-3">
              <h3 className="font-bold text-ink">অভিভাবকের সম্মতি</h3>
              {app.guardian?.phone ? (
                <p className="text-sm text-ink-2">
                  {app.guardian.name} ({app.guardian.relationship}) ·{" "}
                  {app.guardian.phone}
                </p>
              ) : (
                <p className="text-sm text-ink-2">
                  খসড়ায় অভিভাবকের নাম, সম্পর্ক ও মোবাইল সংরক্ষণ করুন।
                </p>
              )}
              {app.guardianConsentedAt ? (
                <>
                  <p className="text-emerald-600 dark:text-emerald-400">
                    মোবাইল ও সম্মতি যাচাই সম্পূর্ণ ✓
                  </p>
                  <button
                    disabled={busy}
                    className="text-brand hover:underline cursor-pointer"
                    onClick={() =>
                      action(async () => {
                        await workflowApi.revokeGuardian();
                        setChallenge("");
                        toast.success("সম্মতি প্রত্যাহার করা হয়েছে");
                      })
                    }
                  >
                    সম্মতি প্রত্যাহার করুন
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-ink-2">
                    অভিভাবককে উদ্দেশ্য বুঝিয়ে সম্মতি নিন। কোডটি তাঁর মোবাইলে
                    যাবে; তিনি সম্মত হলেই কোডটি দেবেন।
                  </p>
                  <button
                    disabled={busy || !app.guardian?.phone}
                    className="text-brand font-semibold hover:underline disabled:opacity-40 cursor-pointer"
                    onClick={() =>
                      action(async () => {
                        const res = await workflowApi.requestGuardian();
                        setChallenge(res.data!.challengeId);
                        setCode("");
                      })
                    }
                  >
                    অভিভাবকের মোবাইলে কোড পাঠান
                  </button>
                  {challenge && (
                    <>
                      <label className="block text-sm text-ink-2">
                        অভিভাবকের সম্মতির কোড
                        <input
                          className={input}
                          maxLength={6}
                          inputMode="numeric"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                        />
                      </label>
                      <label className="flex gap-2 text-sm text-ink-2">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(e) => setConsent(e.target.checked)}
                        />
                        অভিভাবক তথ্য সংরক্ষণ ও অনুমতি অনুযায়ী যোগাযোগ প্রকাশে
                        সম্মতি দিয়েছেন
                      </label>
                      <button
                        disabled={busy || !consent || code.length !== 6}
                        className="mb-btn-primary px-4 py-2 text-sm"
                        onClick={() =>
                          action(async () => {
                            await workflowApi.confirmGuardian(
                              challenge,
                              code,
                              consent,
                            );
                            setChallenge("");
                            toast.success("সম্মতি যাচাই হয়েছে");
                          })
                        }
                      >
                        সম্মতি নিশ্চিত করুন
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="border-t border-line pt-4 space-y-2">
              <p className="text-sm text-ink-2">
                জমা দিতে ইমেইল, মোবাইল, অভিভাবকের সম্মতি ও বায়োডাটার আবশ্যক
                তথ্য পূরণ করুন।
              </p>
              <button
                disabled={
                  busy ||
                  !user?.isEmailVerified ||
                  !user?.isPhoneVerified ||
                  !app.guardianConsentedAt ||
                  !["draft", "changes_requested", "rejected"].includes(
                    app.status,
                  )
                }
                onClick={() =>
                  action(async () => {
                    await workflowApi.submit(app.revision);
                    toast.success("পর্যালোচনার জন্য জমা হয়েছে");
                  })
                }
                className="mb-btn-primary px-5 py-3 text-sm"
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
