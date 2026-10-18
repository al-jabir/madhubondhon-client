import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Heart, Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { workflowApi, errorMessage } from "../api/workflow.api";

export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!challenge) {
        const res = await workflowApi.forgotPassword(email);
        setChallenge(res.data!.challengeId);
        toast.success(res.message);
      } else {
        if (password !== confirm) {
          setError("নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।");
          setBusy(false);
          return;
        }
        await workflowApi.resetPassword(
          email,
          challenge,
          code,
          password,
          confirm
        );
        toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।");
        navigate("/login");
      }
    } catch (err) {
      const msg = errorMessage(err);
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-600 to-pink-500 items-center justify-center text-white shadow-lg shadow-rose-200 dark:shadow-none mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            পাসওয়ার্ড পুনরুদ্ধার
          </h1>
          <p className="text-xs sm:text-sm text-gray-550 dark:text-gray-400">
            আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইলে ভেরিফিকেশন কোড পাঠানো হবে
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#191e28] p-6 sm:p-8 rounded-3xl shadow-xl shadow-rose-100 dark:shadow-none border border-rose-100/80 dark:border-gray-800">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                ইমেইল ঠিকানা
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={!!challenge || busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400 disabled:opacity-60"
                />
              </div>
            </div>

            {challenge && (
              <>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  ইমেইলে পাঠানো ৬ সংখ্যার কোডটি লিখুন (মেয়াদ ১০ মিনিট)।
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                    ৬ সংখ্যার সিকিউরিটি কোড
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="যেমন: 123456"
                      className="w-full text-sm font-mono tracking-widest border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                    নতুন পাসওয়ার্ড
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="কমপক্ষে ৮ অক্ষর"
                      className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    অন্তত ৮ অক্ষর, বড় ও ছোট হাতের অক্ষর এবং সংখ্যা দিন।
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                    পাসওয়ার্ড নিশ্চিত করুন
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      minLength={8}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="পুনরায় পাসওয়ার্ড"
                      className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setChallenge("");
                    setCode("");
                  }}
                  className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  ← অন্য ইমেইল ঠিকানা বা নতুন কোড পাঠান
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 py-3 px-4 text-sm font-bold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50"
            >
              {busy
                ? "অপেক্ষা করুন..."
                : challenge
                ? "পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন"
                : "পুনরুদ্ধার কোড পাঠান"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>লগইনে ফিরে যান</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
