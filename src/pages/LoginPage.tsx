import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Heart, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";
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
      setErrorMessage("অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড উভয়ই পূরণ করুন।");
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      toast.success("সফলভাবে লগইন হয়েছে!");
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
        <div className="text-center space-y-2.5">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-linear-to-br from-brand to-pink-500 items-center justify-center text-white shadow-lg shadow-brand/30 mb-1">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">মধুবন্ধনে স্বাগতম</h2>
          <p className="text-xs sm:text-sm text-ink-2">
            আপনার অ্যাকাউন্টে লগইন করে পাত্র-পাত্রীর বায়োডাটা অনুসন্ধান অব্যাহত রাখুন
          </p>
        </div>

        {/* Card */}
        <div className="mb-card p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-brand-soft border border-brand/25 text-xs font-semibold text-brand-ink">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-label">ইমেইল ঠিকানা</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  required
                  className="mb-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-label">পাসওয়ার্ড</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="আপনার গোপন পাসওয়ার্ড"
                  required
                  className="mb-input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer"
                  aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mb-btn-primary w-full mt-1 py-3"
            >
              {isSubmitting ? "লগইন হচ্ছে..." : "লগইন করুন"}
            </button>
          </form>

          <Link
            to="/forgot-password"
            className="mt-4 text-sm font-semibold text-brand hover:text-brand-strong inline-flex items-center gap-1 transition-colors"
          >
            পাসওয়ার্ড ভুলে গেছেন?
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Quick Test Accounts for Instant Verification */}
          {import.meta.env.DEV && import.meta.env.VITE_LOCAL_DEV === 'true' && (
            <div className="mt-6 pt-5 border-t border-line">
              <div className="flex items-center gap-1.5 text-xs font-bold text-ink-2 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span>টেস্ট অ্যাকাউন্টে এক ক্লিকে লগইন পূরণ:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'অ্যাডমিন (Admin)', email: "admin@local.test" },
                  { label: 'মডারেটর (Moderator)', email: "moderator@local.test" },
                  { label: 'পাত্র (Male User)', email: "male@local.test" },
                  { label: 'পাত্রী (Female User)', email: "female@local.test" },
                ].map(({ label, email: mail }) => (
                  <button
                    key={mail}
                    type="button"
                    onClick={() => fillQuickAccount(mail, "Password123!")}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-elev hover:bg-brand-soft text-ink-2 hover:text-brand-ink rounded-lg border border-line hover:border-brand/40 cursor-pointer transition-colors"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-line text-center text-xs text-ink-2">
            নতুন সদস্য?{" "}
            <Link to="/register" className="font-bold text-brand hover:text-brand-strong">
              এখানে বিনামূল্যে নিবন্ধন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
