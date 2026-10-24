import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Heart, Lock, Mail, Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "../api/errors";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../i18n/LanguageContext";
import { UserRole } from "../types";

export const LoginPage: React.FC = () => {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const { t, isBengali } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [secondFactor, setSecondFactor] = useState('');
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/my-profile";

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const isAdminRole =
        user.role === UserRole.ADMIN ||
        user.role === UserRole.SUPER_ADMIN ||
        user.role === UserRole.MODERATOR;

      if (isAdminRole) {
        navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
      } else {
        const safeDestination = from.startsWith("/admin") ? "/my-profile" : from;
        navigate(safeDestination, { replace: true });
      }
    }
  }, [user, isAuthenticated, isLoading, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage(t('auth.errorEmpty'));
      return;
    }

    try {
      setIsSubmitting(true);
      const loggedInUser = await login({ email: email.trim(), password, secondFactor: secondFactor.trim() || undefined });
      toast.success(t('auth.loginSuccess'));

      const isAdminRole =
        loggedInUser?.role === UserRole.ADMIN ||
        loggedInUser?.role === UserRole.SUPER_ADMIN ||
        loggedInUser?.role === UserRole.MODERATOR;

      if (isAdminRole) {
        navigate(from.startsWith("/admin") ? from : "/admin", { replace: true });
      } else {
        const safeDestination = from.startsWith("/admin") ? "/my-profile" : from;
        navigate(safeDestination, { replace: true });
      }
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, t('auth.loginFailed'));
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-linear-to-br from-brand to-pink-500 items-center justify-center text-white shadow-lg shadow-brand/30 mb-1">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">{t('auth.welcome')}</h2>
          <p className="text-xs sm:text-sm text-ink-2">
            {t('auth.loginSubtitle')}
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
              <label className="mb-label">{t('auth.emailLabel')}</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  required
                  className="mb-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="mb-label">{t('auth.passwordLabel')}</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
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
<label className="block text-sm">{isBengali?'Authenticator / recovery code (ঐচ্ছিক)':'Authenticator / recovery code (optional)'}<input className="mb-input mt-2" value={secondFactor} onChange={e=>setSecondFactor(e.target.value)} autoComplete="one-time-code" maxLength={32} placeholder={isBengali?'শুধু 2FA চালু থাকলে দিন':'Only if 2FA is enabled'} /></label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mb-btn-primary w-full mt-1 py-3"
            >
              {isSubmitting ? t('auth.loggingIn') : t('auth.loginButton')}
            </button>
          </form>

          <Link
            to="/forgot-password"
            className="mt-4 text-sm font-semibold text-brand hover:text-brand-strong inline-flex items-center gap-1 transition-colors"
          >
            {t('auth.forgotPassword')}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <div className="mt-5 pt-4 border-t border-line text-center text-xs text-ink-2">
            {t('auth.newMember')}{" "}
            <Link to="/register" className="font-bold text-brand hover:text-brand-strong">
              {t('auth.registerHere')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
