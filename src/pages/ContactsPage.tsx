import { useState } from "react";
import { Link } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Coins, Sparkles, ArrowRight } from "lucide-react";
import { workflowApi, errorMessage } from "../api/workflow.api";
import type { Guardian } from "../api/workflow.api";
import { useAuth } from "../context/useAuth";
import type { User } from "../types";
const id = (u: string | User) => (typeof u === "string" ? u : u.id || u._id);
const name = (u: string | User) => (typeof u === "string" ? "সদস্য" : u.name);
export default function ContactsPage() {
  const { user, refreshUser } = useAuth();
  const cache = useQueryClient();
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState<{
    id: string;
    guardian: Guardian;
  } | null>(null);
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
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold">যোগাযোগের অনুমতি</h1>
          <p className="text-sm text-gray-600">
            গৃহীত আগ্রহের পর যোগাযোগের অনুরোধ পাঠানো যায়। সংশ্লিষ্ট সদস্য অনুমতি
            দিলেই যাচাইকৃত অভিভাবকের যোগাযোগ দেখা যাবে।
          </p>
        </div>

        {/* Credit Balance Badge & Topup Button */}
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-600 fill-amber-400" />
            <div className="text-xs">
              <span className="text-gray-600 block">অবশিষ্ট ক্রেডিট</span>
              <span className="font-bold text-gray-900 text-sm">{user?.contactCredits ?? 0} টি</span>
            </div>
          </div>
          <Link
            to="/packages"
            className="ml-2 px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-2xs flex items-center gap-1 shrink-0"
          >
            <span>রিচার্জ করুন</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <Link to="/interests" className="text-rose-700 text-sm font-semibold">
        ← আগ্রহ তালিকা দেখুন
      </Link>
      {isLoading ? (
        <p>লোড হচ্ছে...</p>
      ) : isError ? (
        <p>
          অনুরোধ লোড করা যায়নি।{" "}
          <button onClick={() => refetch()}>আবার চেষ্টা করুন</button>
        </p>
      ) : (
        <>
          {!data?.data?.grants.length && (
            <p className="p-6 bg-white rounded-xl border">
              এখনও যোগাযোগের অনুরোধ নেই।
            </p>
          )}
          {data?.data?.grants.map((grant) => {
            const incoming = id(grant.owner) === (user?.id || user?._id);
            return (
              <article
                key={grant._id}
                className="bg-white p-5 border rounded-xl space-y-3"
              >
                <h2 className="font-bold">
                  {incoming
                    ? "অনুরোধ করেছেন: " + name(grant.requester)
                    : "অনুরোধ পাঠানো হয়েছে: " + name(grant.owner)}
                </h2>
                <p>
                  অবস্থা:{" "}
                  {
                    {
                      pending: "অপেক্ষমান",
                      approved: "অনুমোদিত",
                      rejected: "প্রত্যাখ্যাত",
                      revoked: "প্রত্যাহৃত",
                    }[grant.status]
                  }
                </p>
                <div className="flex gap-3 flex-wrap">
                  {incoming && grant.status === "pending" && (
                    <>
                      <button
                        disabled={busy}
                        className="text-emerald-700 font-semibold"
                        onClick={() =>
                          act(() =>
                            workflowApi.respondContact(grant._id, "approved"),
                          )
                        }
                      >
                        যোগাযোগ প্রকাশের অনুমতি দিন
                      </button>
                      <button
                        disabled={busy}
                        className="text-rose-700"
                        onClick={() =>
                          act(() =>
                            workflowApi.respondContact(grant._id, "rejected"),
                          )
                        }
                      >
                        প্রত্যাখ্যান করুন
                      </button>
                    </>
                  )}
                  {!incoming && grant.status === "approved" && (
                    <button
                      disabled={busy}
                      className="text-rose-700 font-bold"
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
                      অভিভাবকের যোগাযোগ দেখুন
                    </button>
                  )}
                  {["pending", "approved"].includes(grant.status) && (
                    <button
                      disabled={busy}
                      className="text-gray-600"
                      onClick={() =>
                        act(() =>
                          workflowApi.respondContact(grant._id, "revoked"),
                        )
                      }
                    >
                      অনুমতি/অনুরোধ প্রত্যাহার
                    </button>
                  )}
                </div>
                {revealed?.id === grant._id && grant.status === "approved" && (
                  <div className="p-4 bg-emerald-50 rounded-xl space-y-1">
                    <p>
                      {revealed.guardian.name} ({revealed.guardian.relationship}
                      )
                    </p>
                    <a
                      href={"tel:" + revealed.guardian.phone}
                      className="font-bold"
                    >
                      {revealed.guardian.phone}
                    </a>
                    {revealed.guardian.email && (
                      <p>{revealed.guardian.email}</p>
                    )}
                    <button
                      onClick={() => setRevealed(null)}
                      className="block text-sm underline"
                    >
                      লুকান
                    </button>
                  </div>
                )}
              </article>
            );
          })}
          <div className="flex gap-4">
            <button
              disabled={page === 1}
              onClick={() => {
                setRevealed(null);
                setPage((p) => p - 1);
              }}
            >
              আগের পৃষ্ঠা
            </button>
            <span>{page}</span>
            <button
              disabled={page >= (data?.meta?.totalPages || 1)}
              onClick={() => {
                setRevealed(null);
                setPage((p) => p + 1);
              }}
            >
              পরের পৃষ্ঠা
            </button>
          </div>
        </>
      )}
    </div>
  );
}
