import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Heart, Lock, Mail, Eye, EyeOff, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/errors";
import { useAuth } from "../context/useAuth";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/my-profile";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড উভয়ই পূরণ করুন।");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      toast.success("সফলভাবে লগইন হয়েছে!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "লগইন করা যায়নি।");
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillQuickAccount = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setErrorMessage("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-600 to-pink-500 items-center justify-center text-white shadow-lg shadow-rose-200 dark:shadow-none mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            মধুবন্ধনে স্বাগতম
          </h2>
          <p className="text-xs sm:text-sm text-gray-550 dark:text-gray-400">
            আপনার অ্যাকাউন্টে লগইন করে পাত্র-পাত্রীর বায়োডাটা অনুসন্ধান অব্যাহত
            রাখুন
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#191e28] p-6 sm:p-8 rounded-3xl shadow-xl shadow-rose-100 dark:shadow-none border border-rose-100/80 dark:border-gray-800">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {errorMessage}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  required
                  className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                পাসওয়ার্ড
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার গোপন পাসওয়ার্ড"
                  required
                  className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 text-sm font-bold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>

          <Link
            to="/forgot-password"
            className="block mt-4 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700"
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
          {/* Quick Test Accounts for Instant Verification */}
          {import.meta.env.DEV && import.meta.env.VITE_LOCAL_DEV === 'true' && (
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-600 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>টেস্ট অ্যাকাউন্টে এক ক্লিকে লগইন পূরণ:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    fillQuickAccount("admin@local.test", "Password123!")
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 cursor-pointer transition-colors"
                >
                  অ্যাডমিন (Admin)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fillQuickAccount(
                      "moderator@local.test",
                      "Password123!",
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 cursor-pointer transition-colors"
                >
                  মডারেটর (Moderator)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fillQuickAccount(
                      "male@local.test",
                      "Password123!",
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 cursor-pointer transition-colors"
                >
                  পাত্র (Male User)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    fillQuickAccount(
                      "female@local.test",
                      "Password123!",
                    )
                  }
                  className="px-2.5 py-1 text-[11px] font-semibold bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-lg border border-pink-200 cursor-pointer transition-colors"
                >
                  পাত্রী (Female User)
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 text-center text-xs text-gray-500">
            নতুন সদস্য?{" "}
            <Link
              to="/register"
              className="font-bold text-rose-600 hover:text-rose-700"
            >
              এখানে বিনামূল্যে নিবন্ধন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
