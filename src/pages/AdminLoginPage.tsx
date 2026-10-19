import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  KeyRound,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/errors";
import { useAuth } from "../context/useAuth";
import { UserRole } from "../types";
import ThemeToggle from "../components/common/ThemeToggle";

export const AdminLoginPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/admin";

  // If already authenticated with an administrative role, redirect to /admin directly
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isAdminRole =
        user.role === UserRole.ADMIN ||
        user.role === UserRole.SUPER_ADMIN ||
        user.role === UserRole.MODERATOR;

      if (isAdminRole) {
        navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("অনুগ্রহ করে প্রশাসনিক ইমেইল ও পাসওয়ার্ড প্রদান করুন।");
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedInUser = await login({ email: cleanEmail, password });

      const isAdminRole =
        loggedInUser?.role === UserRole.ADMIN ||
        loggedInUser?.role === UserRole.SUPER_ADMIN ||
        loggedInUser?.role === UserRole.MODERATOR;

      if (!isAdminRole) {
        // If a regular customer accidentally logged in here, revoke and reject
        await logout();
        const err =
          "অননুমোদিত প্রবেশ! এই পোর্টালটি শুধুমাত্র অ্যাডমিনিস্ট্রেটরদের জন্য সংরক্ষিত। সাধারণ অ্যাকাউন্টের জন্য মূল সাইটে লগইন করুন।";
        setErrorMessage(err);
        toast.error(err);
        return;
      }

      toast.success(
        loggedInUser.role === UserRole.SUPER_ADMIN
          ? "সুপার অ্যাডমিন হিসেবে সফলভাবে প্রবেশ করেছেন!"
          : "অ্যাডমিন প্যানেলে সফলভাবে প্রবেশ করেছেন!"
      );

      navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, "প্রশাসনিক লগইন সম্পন্ন করা যায়নি।");
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base text-ink flex flex-col justify-between selection:bg-brand selection:text-white transition-colors">
      {/* Top Bar */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-ink-2 hover:text-brand transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>মূল সাইটে ফিরুন</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono uppercase tracking-wider text-ink-3 hidden sm:inline">
            Admin Auth Gateway v2.0
          </span>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-6">
        <div className="max-w-md w-full space-y-6">
          {/* Header & Emblem */}
          <div className="text-center space-y-3">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-purple-600 via-brand to-pink-500 text-white flex items-center justify-center shadow-xl shadow-brand/25 ring-4 ring-card">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-card border-2 border-brand/40 flex items-center justify-center text-brand">
                <KeyRound className="w-3 h-3" />
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Security Clearance Required</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-ink tracking-tight">
                মধুবন্ধন কন্ট্রোল সেন্টার
              </h1>
              <p className="text-xs sm:text-sm text-ink-2 mt-1">
                টাঙ্গাইল জেলা বৈবাহিক প্ল্যাটফর্ম পরিচালনা ও প্রশাসনিক পোর্টাল
              </p>
            </div>
          </div>

          {/* Form Card */}
          <div className="mb-card p-6 sm:p-8 rounded-3xl border border-line bg-card/90 shadow-xl backdrop-blur-md">
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 text-xs font-semibold text-red-600 dark:text-red-400 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  প্রশাসনিক ইমেইল ঠিকানা
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@admin.com"
                    required
                    autoFocus
                    autoComplete="username"
                    className="mb-input pl-10 text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  সিকিউরিটি পাসওয়ার্ড
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                    className="mb-input pl-10 pr-10 text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer p-0.5"
                    aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-linear-to-r from-brand via-purple-600 to-pink-600 hover:opacity-95 shadow-lg shadow-brand/25 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>প্রমাণীকরণ যাচাই হচ্ছে...</span>
                ) : (
                  <>
                    <span>কন্ট্রোল সেন্টারে প্রবেশ করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Warning Notice */}
            <div className="mt-6 pt-4 border-t border-line text-[11px] text-ink-3 leading-relaxed flex items-start gap-2 bg-elev/50 p-3 rounded-xl border border-line/60">
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gold" />
              <span>
                <strong>নিরাপত্তা সতর্কতা:</strong> এই পোর্টালে প্রতিটি প্রশাসনিক কার্যকলাপ, আইপি ঠিকানা ও টাইমস্ট্যাম্প অডিট লগে রেকর্ড করা হয়। অননুমোদিত অ্যাক্সেস নিষিদ্ধ।
              </span>
            </div>
          </div>

          {/* Quick links & public login redirect */}
          <div className="text-center text-xs text-ink-3">
            সাধারণ সদস্য হিসেবে লগইন করতে চান?{" "}
            <Link
              to="/login"
              className="font-bold text-brand hover:underline inline-flex items-center gap-1"
            >
              মূল ওয়েবসাইটে লগইন করুন
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-[11px] text-ink-3 border-t border-line/60">
        মধুবন্ধন ম্যাট্রিমনি অ্যাডমিনিস্ট্রেশন &bull; সুরক্ষিত ও এনক্রিপ্টেড সেশন
      </footer>
    </div>
  );
};

export default AdminLoginPage;
