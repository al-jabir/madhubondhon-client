import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { workflowApi, errorMessage } from "../api/workflow.api";
export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="max-w-md mx-auto my-12 p-6 bg-white border rounded-2xl space-y-5">
      <h1 className="text-2xl font-bold">পাসওয়ার্ড পুনরুদ্ধার</h1>
      <form
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            if (!challenge) {
              const res = await workflowApi.forgotPassword(email);
              setChallenge(res.data!.challengeId);
              toast.success(res.message);
            } else {
              await workflowApi.resetPassword(
                email,
                challenge,
                code,
                password,
                confirm,
              );
              toast.success("পাসওয়ার্ড পরিবর্তিত হয়েছে");
              navigate("/login");
            }
          } catch (error) {
            toast.error(errorMessage(error));
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="block text-sm">
          ইমেইল
          <input
            type="email"
            required
            disabled={!!challenge || busy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-xl p-3"
          />
        </label>
        {challenge && (
          <>
            <p className="text-sm">
              অ্যাকাউন্টটি থাকলে ইমেইলে কোড পাঠানো হবে। কোডের মেয়াদ ১০ মিনিট।
            </p>
            <label className="block text-sm">
              ৬ সংখ্যার কোড
              <input
                required
                pattern="[0-9]{6}"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border rounded-xl p-3"
              />
            </label>
            <label className="block text-sm">
              নতুন পাসওয়ার্ড
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded-xl p-3"
              />
            </label>
            <p className="text-xs text-gray-600">
              অন্তত ৮ অক্ষর, বড় ও ছোট হাতের অক্ষর এবং সংখ্যা দিন।
            </p>
            <label className="block text-sm">
              পাসওয়ার্ড নিশ্চিত করুন
              <input
                type="password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border rounded-xl p-3"
              />
            </label>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setChallenge("");
                setCode("");
              }}
              className="text-rose-700"
            >
              অন্য ইমেইল / নতুন কোড
            </button>
          </>
        )}
        <button
          disabled={busy}
          className="w-full p-3 bg-rose-600 rounded-xl text-white disabled:opacity-40"
        >
          {busy
            ? "অপেক্ষা করুন..."
            : challenge
              ? "পাসওয়ার্ড পরিবর্তন করুন"
              : "পুনরুদ্ধার কোড নিন"}
        </button>
      </form>
      <Link to="/login" className="text-rose-700">
        লগইনে ফিরুন
      </Link>
    </div>
  );
}
