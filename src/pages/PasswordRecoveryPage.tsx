import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Heart, Mail, Lock, KeyRound, ArrowLeft, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { workflowApi, errorMessage } from "../api/workflow.api";
import { useLanguage } from "../i18n/LanguageContext";

export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const { isBengali } = useLanguage();
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
          setError(
            isBengali
              ? "নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।"
              : "New password and confirm password do not match."
          );
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
        toast.success(
          isBengali
            ? "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে। নতুন পাসওয়ার্ড দিয়ে লগইন করুন।"
            : "Password has been reset successfully. Please sign in with your new password."
        );
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
          <div className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-tr from-brand to-pink-500 items-center justify-center text-white shadow-lg shadow-brand/20 dark:shadow-none mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">
            {isBengali ? "পাসওয়ার্ড পুনরুদ্ধার" : "Password Recovery"}
          </h1>
          <p className="text-xs sm:text-sm text-ink-2">
            {isBengali
              ? "আপনার অ্যাকাউন্টের নিবন্ধিত ইমেইলে ভেরিফিকেশন কোড পাঠানো হবে"
              : "A verification security code will be sent to your registered account email"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card mb-card p-6 sm:p-8 border-brand/25">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-brand-soft border border-brand/25 text-xs font-semibold text-brand flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-label block mb-1.5">
                {isBengali ? "ইমেইল ঠিকানা" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  disabled={!!challenge || busy}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="mb-input w-full !text-sm !bg-elev pl-10 pr-4 py-2.5 disabled:opacity-60"
                />
              </div>
            </div>

            {challenge && (
              <>
                <div className="p-3 bg-gold-soft border border-gold/25 rounded-xl text-xs text-gold">
                  {isBengali
                    ? "ইমেইলে পাঠানো ৬ সংখ্যার কোডটি লিখুন (মেয়াদ ১০ মিনিট)।"
                    : "Enter the 6-digit code sent to your email (valid for 10 minutes)."}
                </div>

                <div>
                  <label className="mb-label block mb-1.5">
                    {isBengali ? "৬ সংখ্যার সিকিউরিটি কোড" : "6-Digit Security Code"}
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      required
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder={isBengali ? "যেমন: 123456" : "e.g. 123456"}
                      className="mb-input w-full !text-sm !bg-elev font-mono tracking-widest pl-10 pr-4 py-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-label block mb-1.5">
                    {isBengali ? "নতুন পাসওয়ার্ড" : "New Password"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isBengali ? "কমপক্ষে ৮ অক্ষর" : "At least 8 characters"}
                      className="mb-input w-full !text-sm !bg-elev pl-10 pr-10 py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer"
                      aria-label={showPassword ? (isBengali ? "পাসওয়ার্ড লুকান" : "Hide password") : (isBengali ? "পাসওয়ার্ড দেখুন" : "Show password")}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-ink-3 mt-1">
                    {isBengali
                      ? "অন্তত ৮ অক্ষর, বড় ও ছোট হাতের অক্ষর এবং সংখ্যা দিন।"
                      : "Minimum 8 characters with letters, uppercase, and numbers."}
                  </p>
                </div>

                <div>
                  <label className="mb-label block mb-1.5">
                    {isBengali ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      minLength={8}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder={isBengali ? "পুনরায় পাসওয়ার্ড" : "Re-enter password"}
                      className="mb-input w-full !text-sm !bg-elev pl-10 pr-10 py-2.5"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer"
                      aria-label={showConfirm ? (isBengali ? "পাসওয়ার্ড লুকান" : "Hide password") : (isBengali ? "পাসওয়ার্ড দেখুন" : "Show password")}
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
                  className="text-xs font-semibold text-brand hover:underline cursor-pointer"
                >
                  {isBengali
                    ? "← অন্য ইমেইল ঠিকানা বা নতুন কোড পাঠান"
                    : "← Use different email or request a new code"}
                </button>
              </>
            )}

            <button
              type="submit"
              disabled={busy}
              className="mb-btn-primary w-full mt-2 py-3 px-4 text-sm disabled:opacity-50"
            >
              {busy
                ? isBengali
                  ? "অপেক্ষা করুন..."
                  : "Please wait..."
                : challenge
                ? isBengali
                  ? "পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন"
                  : "Complete Password Reset"
                : isBengali
                ? "পুনরুদ্ধার কোড পাঠান"
                : "Send Recovery Code"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-2 hover:text-brand transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{isBengali ? "লগইনে ফিরে যান" : "Back to Login"}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
