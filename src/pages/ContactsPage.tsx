import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Coins, ArrowRight } from "lucide-react";
import { workflowApi, errorMessage } from "../api/workflow.api";
import type { Guardian } from "../api/workflow.api";
import { useAuth } from "../context/useAuth";
import type { User } from "../types";
import { useLanguage } from "../i18n/LanguageContext";

const id = (u: string | User) => (typeof u === "string" ? u : u.id || u._id);

export default function ContactsPage() {
  const { user, refreshUser } = useAuth();
  const cache = useQueryClient();
  const { isBengali, formatNumber } = useLanguage();
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<{
    id: string;
    guardian: Guardian;
  } | null>(null);

  const name = (u: string | User) =>
    typeof u === "string" ? (isBengali ? "সদস্য" : "Member") : u.name;

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["contact-grants", page],
    queryFn: () => workflowApi.listContacts(page),
    refetchOnWindowFocus: true,
  });

  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setRevealed(null);
    try {
      await fn();
      await cache.invalidateQueries({ queryKey: ["contact-grants"] });
      await refreshUser();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  const statusLabels: Record<string, string> = {
    pending: isBengali ? "অপেক্ষমান" : "Pending",
    approved: isBengali ? "অনুমোদিত" : "Approved",
    rejected: isBengali ? "প্রত্যাখ্যাত" : "Rejected",
    revoked: isBengali ? "প্রত্যাহৃত" : "Revoked",
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {isBengali ? "যোগাযোগের অনুমতি" : "Contact Permissions"}
          </h1>
          <p className="text-sm text-ink-2">
            {isBengali
              ? "গৃহীত আগ্রহের পর যোগাযোগের অনুরোধ পাঠানো যায়। সংশ্লিষ্ট সদস্য অনুমতি দিলেই যাচাইকৃত অভিভাবকের যোগাযোগ দেখা যাবে।"
              : "Contact requests can be sent after an interest is accepted. Guardian contact details become visible once permission is granted."}
          </p>
        </div>

        {/* Credit Balance Badge & Topup Button */}
        <div className="flex items-center gap-3 bg-gold-soft border border-gold/25 px-4 py-2.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-gold" />
            <div className="text-xs">
              <span className="text-ink-3 block">
                {isBengali ? "অবশিষ্ট ক্রেডিট" : "Credits Available"}
              </span>
              <span className="font-bold text-ink text-sm">
                {isBengali ? formatNumber(user?.contactCredits ?? 0) : user?.contactCredits ?? 0}{" "}
                {isBengali ? "টি" : "credits"}
              </span>
            </div>
          </div>
          <Link
            to="/packages"
            className="ml-2 px-3 py-1.5 text-xs font-bold text-white bg-brand hover:bg-brand/90 rounded-xl transition-colors shadow-2xs flex items-center gap-1 shrink-0"
          >
            <span>{isBengali ? "রিচার্জ করুন" : "Top Up"}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <Link to="/journey" className="text-brand text-sm font-semibold inline-block mr-4">{isBengali?'যোগাযোগের অগ্রগতি দেখুন':'Track connection progress'}</Link>
      <Link to="/interests" className="text-brand text-sm font-semibold inline-block">
        {isBengali ? "← আগ্রহ তালিকা দেখুন" : "← View Interests List"}
      </Link>

      {isLoading ? (
        <p className="text-ink-2">{isBengali ? "লোড হচ্ছে..." : "Loading..."}</p>
      ) : isError ? (
        <p className="text-ink-2">
          {isBengali ? "অনুরোধ লোড করা যায়নি। " : "Failed to load requests. "}
          <button onClick={() => refetch()} className="text-brand underline font-semibold">
            {isBengali ? "আবার চেষ্টা করুন" : "Try again"}
          </button>
        </p>
      ) : (
        <>
          {!data?.data?.grants.length && (
            <p className="p-6 bg-card mb-card rounded-xl text-ink-2">
              {isBengali
                ? "এখনও যোগাযোগের অনুরোধ নেই।"
                : "No contact requests yet."}
            </p>
          )}
          {data?.data?.grants.map((grant) => {
            const incoming = id(grant.owner) === (user?.id || user?._id);
            return (
              <article
                key={grant._id}
                className="bg-card mb-card p-5 space-y-3"
              >
                <h2 className="font-bold text-ink">
                  {incoming
                    ? (isBengali ? "অনুরোধ করেছেন: " : "Requested by: ") + name(grant.requester)
                    : (isBengali ? "অনুরোধ পাঠানো হয়েছে: " : "Request sent to: ") + name(grant.owner)}
                </h2>
                <p className="text-ink-2">
                  {isBengali ? "অবস্থা: " : "Status: "}
                  {statusLabels[grant.status] || grant.status}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {incoming && grant.status === "pending" && (
                    <>
                      <button
                        disabled={busy}
                        className="text-emerald-600 dark:text-emerald-400 font-semibold cursor-pointer"
                        onClick={() =>
                          act(() =>
                            workflowApi.respondContact(grant._id, "approved"),
                          )
                        }
                      >
                        {isBengali ? "যোগাযোগ প্রকাশের অনুমতি দিন" : "Grant Contact Permission"}
                      </button>
                      <button
                        disabled={busy}
                        className="text-brand cursor-pointer font-semibold"
                        onClick={() =>
                          act(() =>
                            workflowApi.respondContact(grant._id, "rejected"),
                          )
                        }
                      >
                        {isBengali ? "প্রত্যাখ্যান করুন" : "Decline"}
                      </button>
                    </>
                  )}
                  {!incoming && grant.status === "approved" && (
                    <button
                      disabled={busy}
                      className="text-brand font-bold cursor-pointer"
                      onClick={() =>
                        act(async () => {
                          const res = await workflowApi.revealContact(
                            grant._id,
                          );
                          setRevealed({
                            id: grant._id,
                            guardian: res.data!.guardian,
                          });
                        })
                      }
                    >
                      {isBengali ? "অভিভাবকের যোগাযোগ দেখুন" : "View Guardian Contact"}
                    </button>
                  )}
                  {["pending", "approved"].includes(grant.status) && (
                    <button
                      disabled={busy}
                      className="text-ink-3 cursor-pointer text-xs"
                      onClick={() =>
                        act(() =>
                          workflowApi.respondContact(grant._id, "revoked"),
                        )
                      }
                    >
                      {isBengali ? "অনুমতি/অনুরোধ প্রত্যাহার" : "Revoke Permission / Request"}
                    </button>
                  )}
                </div>
                {revealed?.id === grant._id && grant.status === "approved" && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1 text-ink">
                    <p>
                      {revealed.guardian.name} ({revealed.guardian.relationship}
                      )
                    </p>
                    <a
                      href={"tel:" + revealed.guardian.phone}
                      className="font-bold text-emerald-600 dark:text-emerald-400"
                    >
                      {revealed.guardian.phone}
                    </a>
                    {revealed.guardian.email && (
                      <p>{revealed.guardian.email}</p>
                    )}
                    <button
                      onClick={() => setRevealed(null)}
                      className="block text-sm underline text-ink-2 cursor-pointer"
                    >
                      {isBengali ? "লুকান" : "Hide"}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          <div className="flex gap-4 items-center">
            <button
              disabled={page === 1}
              className="mb-btn-secondary !px-3 !text-xs disabled:opacity-40"
              onClick={() => {
                setRevealed(null);
                setPage((p) => p - 1);
              }}
            >
              {isBengali ? "আগের পৃষ্ঠা" : "Previous"}
            </button>
            <span className="text-ink-2 text-xs">
              {isBengali ? formatNumber(page) : page}
            </span>
            <button
              disabled={page >= (data?.meta?.totalPages || 1)}
              className="mb-btn-secondary !px-3 !text-xs disabled:opacity-40"
              onClick={() => {
                setRevealed(null);
                setPage((p) => p + 1);
              }}
            >
              {isBengali ? "পরের পৃষ্ঠা" : "Next"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
