import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Heart,
  Search,
  User as UserIcon,
  Bell,
  Menu,
  X,
  Shield,
  LogOut,
  Bookmark,
  Coins,
  Compass,
  Info,
  HelpCircle,
  ChevronDown,
  Sparkles,
  Phone,
  Home,
  Settings,
} from "lucide-react";
import { notificationsApi } from "../../api/notifications.api";
import { adminApi } from "../../api/admin.api";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../i18n/LanguageContext";
import { UserRole } from "../../types";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, formatNumber, isBengali } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const isAdminOrMod =
    user?.role === UserRole.ADMIN ||
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.MODERATOR;

  // Auto-close dropdowns on route change
  useEffect(() => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for user dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const { data: notificationsData } = useQuery({
    queryKey: ['my-notifications-count'],
    queryFn: () => notificationsApi.getNotifications({ page: 1, limit: 1 }),
    enabled: isAuthenticated,
    refetchInterval: 1000 * 60,
  });
  const unreadCount = notificationsData?.data?.unreadCount || 0;

  // Public Platform Settings (for controlling demo data visibility)
  const { data: publicSettingsData } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => adminApi.getPublicSettings(),
    staleTime: 1000 * 60 * 5,
  });
  const showDemo = publicSettingsData?.data?.settings?.showDemoProfiles !== false;

  const menuLinks = [
    { to: "/", icon: Home, label: t('nav.home') },
    { to: "/search", icon: Search, label: t('nav.search') },
    ...(showDemo ? [{ to: "/demo", icon: Sparkles, label: t('nav.demo') }] : []),
    { to: "/about", icon: Info, label: t('nav.about') },
    { to: "/faq", icon: HelpCircle, label: t('nav.faq') },
    { to: "/guide", icon: Compass, label: t('nav.guide') },
    { to: "/contact", icon: Phone, label: t('nav.contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-card/90 backdrop-blur-md border-b border-line shadow-[0_1px_0_0_var(--mb-line)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-3">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0 min-w-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-br from-brand to-pink-500 flex items-center justify-center text-white shadow-md shadow-brand/30 group-hover:scale-105 transition-transform shrink-0">
              <Heart className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" />
              <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-card border-2 border-brand/30" />
            </div>
            <div className="flex flex-col leading-none min-w-0">
              <span className="font-bold text-lg sm:text-xl tracking-tight text-brand truncate">
                {t('nav.brandName')}
              </span>
              <span className="text-[8px] sm:text-[9px] text-ink-3 font-semibold mt-0.5 tracking-[0.14em] sm:tracking-[0.18em] uppercase whitespace-nowrap">
                Tangail Matrimony
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 h-16">
            {menuLinks.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive(to)
                    ? "bg-brand-soft text-brand-ink"
                    : "text-ink-2 hover:text-brand hover:bg-brand-soft/60"
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive(to) ? "text-brand" : ""}`} />
                <span>{label}</span>
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <LanguageToggle />
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Credits pill */}
                <Link
                  to="/packages"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gold-soft text-gold border border-gold/25 hover:border-gold/50 transition-all whitespace-nowrap"
                  title="যোগাযোগ ক্রেডিট দেখুন বা রিচার্জ করুন"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>{formatNumber(user?.contactCredits ?? 0)} {t('nav.credits')}</span>
                </Link>

                {/* Notifications */}
                <Link
                  to="/notifications"
                  aria-label="বিজ্ঞপ্তি"
                  className={`relative p-2 rounded-full transition-all ${
                    isActive("/notifications")
                      ? "bg-brand-soft text-brand"
                      : "text-ink-2 hover:bg-brand-soft hover:text-brand"
                  }`}
                  title="বিজ্ঞপ্তি"
                >
                  <Bell className="w-5 h-5 shrink-0" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-card">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border transition-all cursor-pointer select-none shrink-0 ${
                      userDropdownOpen
                        ? "border-brand/50 bg-brand-soft"
                        : "border-line bg-elev hover:border-strongline"
                    }`}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <span className="w-8 h-8 rounded-full bg-linear-to-br from-brand to-pink-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {user?.name ? user.name.trim().charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </span>
                    <span className="flex flex-col text-left max-w-[110px] xl:max-w-[140px] leading-tight">
                      <span className="text-xs font-bold text-ink truncate whitespace-nowrap">
                        {user?.name || "ইউজার"}
                      </span>
                      <span className="text-[10px] truncate whitespace-nowrap">
                        {isAdminOrMod ? (
                          <span className="text-gold font-semibold">
                            {user?.role === UserRole.SUPER_ADMIN ? "সুপার অ্যাডমিন" : user?.role === UserRole.ADMIN ? "অ্যাডমিন" : "মডারেটর"}
                          </span>
                        ) : (
                          <span className="text-ink-3">সদস্য</span>
                        )}
                      </span>
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-ink-3 transition-transform duration-200 shrink-0 ${userDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-line shadow-[var(--mb-shadow-pop)] py-2 z-50 overflow-hidden">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-line">
                        <p className="text-sm font-bold text-ink truncate">{user?.name}</p>
                        <p className="text-xs text-ink-3 truncate mt-0.5">{user?.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isAdminOrMod
                              ? "bg-gold-soft text-gold"
                              : "bg-brand-soft text-brand-ink"
                          }`}>
                            {user?.role === UserRole.SUPER_ADMIN
                              ? "সুপার অ্যাডমিন"
                              : user?.role === UserRole.ADMIN
                              ? "অ্যাডমিন"
                              : user?.role === UserRole.MODERATOR
                              ? "মডারেটর"
                              : "সাধারণ সদস্য"}
                          </span>
                          <span className="text-[11px] text-ink-3 whitespace-nowrap flex items-center gap-1">
                            <Coins className="w-3 h-3 text-gold" />
                            {formatNumber(user?.contactCredits ?? 0)} {t('nav.credits')}
                          </span>
                        </div>
                      </div>

                      {/* Links */}
                      <div className="py-1.5 px-1.5 space-y-0.5">
                        {isAdminOrMod && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-3 py-2 text-sm font-bold text-gold bg-gold-soft/70 rounded-lg hover:bg-gold-soft transition-colors whitespace-nowrap"
                          >
                            <Shield className="w-4 h-4 shrink-0" />
                            <span>{t('nav.adminPanel')}</span>
                          </Link>
                        )}
                        {[
                          { to: "/my-profile", icon: UserIcon, label: t('nav.myProfile') },
                          { to: "/edit-profile", icon: Settings, label: t('nav.editProfile') },
                          { to: "/interests", icon: Heart, label: t('nav.interests') },
                          { to: "/contacts", icon: Phone, label: t('nav.contacts') },
                          { to: "/packages", icon: Coins, label: t('nav.packages') },
                          { to: "/notifications", icon: Bell, label: t('nav.notifications') },
                        ].map(({ to, icon: Icon, label }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setUserDropdownOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                              isActive(to)
                                ? "text-brand-ink bg-brand-soft font-semibold"
                                : "text-ink-2 hover:bg-brand-soft/60 hover:text-brand"
                            }`}
                          >
                            <Icon className="w-4 h-4 shrink-0 opacity-70" />
                            <span>{label}</span>
                          </Link>
                        ))}
                      </div>

                      {/* Logout */}
                      <div className="pt-1.5 mt-1 border-t border-line px-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-brand hover:bg-brand-soft rounded-lg transition-colors cursor-pointer text-left whitespace-nowrap"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>{t('nav.logout')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2 whitespace-nowrap">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-ink-2 hover:text-brand rounded-full border border-line hover:border-brand/50 hover:bg-brand-soft/50 transition-all"
                >
                  {t('nav.login')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & tablet controls */}
          <div className="flex lg:hidden items-center gap-1 sm:gap-2 shrink-0">
            {/* Language & Theme in header only on screens >767px (md+); hidden on mobile phones (<=767px) because they appear inside the mobile drawer */}
            <div className="hidden md:flex items-center gap-1.5">
              <LanguageToggle compact />
              <ThemeToggle compact />
            </div>
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-1.5 sm:p-2 rounded-xl text-ink-2 hover:bg-brand-soft hover:text-brand transition-colors"
                aria-label={t('nav.notifications')}
              >
                <Bell className="w-4.5 h-4.5 sm:w-5 sm:h-5 shrink-0" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-card">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 sm:p-2 text-ink-2 hover:text-brand hover:bg-brand-soft rounded-xl cursor-pointer transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-line bg-card px-4 pt-3 pb-6 space-y-1 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
          {isAuthenticated && user && (
            <div className="p-3 mb-2 rounded-2xl bg-elev border border-line flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-9 h-9 rounded-full bg-linear-to-br from-brand to-pink-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name ? user.name.trim().charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-ink truncate">{user.name}</span>
                  <span className="text-[11px] text-ink-3 truncate">{user.email}</span>
                </div>
              </div>
              {isAdminOrMod && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gold-soft text-gold shrink-0">
                  {user.role === UserRole.SUPER_ADMIN ? (isBengali ? "সুপার অ্যাডমিন" : "Super Admin") : user.role === UserRole.ADMIN ? (isBengali ? "অ্যাডমিন" : "Admin") : (isBengali ? "মডারেটর" : "Moderator")}
                </span>
              )}
            </div>
          )}

          {/* Quick Settings Bar in Mobile Drawer: Only shown on mobile (<768px), removed on 768px+ (md:hidden) */}
          <div className="grid grid-cols-2 gap-2 mb-3 pt-1 md:hidden">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-elev border border-line">
              <span className="text-xs font-bold text-ink-2">{isBengali ? 'ভাষা' : 'Language'}</span>
              <LanguageToggle compact />
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-elev border border-line">
              <span className="text-xs font-bold text-ink-2">{isBengali ? 'থিম' : 'Theme'}</span>
              <ThemeToggle compact />
            </div>
          </div>

          <div className="space-y-0.5">
            {[...menuLinks, ...(isAuthenticated ? [
              { to: "/shortlist", icon: Bookmark, label: isBengali ? "পছন্দের তালিকা" : "Shortlist" },
              { to: "/interests", icon: Heart, label: isBengali ? "আগ্রহ তালিকা" : "Interests" },
              { to: "/contacts", icon: Phone, label: isBengali ? "যোগাযোগের তথ্য" : "Contacts" },
              { to: "/my-profile", icon: UserIcon, label: isBengali ? "আমার প্রোফাইল" : "My Profile" },
              { to: "/edit-profile", icon: Settings, label: isBengali ? "বায়োডাটা সম্পাদনা" : "Edit Biodata" },
              { to: "/notifications", icon: Bell, label: isBengali ? "বিজ্ঞপ্তি" : "Notifications" },
            ] : [])].map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to)
                    ? "bg-brand-soft text-brand-ink font-semibold"
                    : "text-ink-2 hover:bg-brand-soft/60 hover:text-brand"
                }`}
              >
                <Icon className="w-4.5 h-4.5 shrink-0 opacity-75" />
                <span>{label}</span>
                {to === "/notifications" && unreadCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 rounded-full bg-brand text-white text-[10px] font-bold">
                    {unreadCount} {isBengali ? 'নতুন' : 'New'}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {isAuthenticated && (
            <>
              <Link
                to="/packages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold bg-gold-soft text-gold border border-gold/20 mt-2"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4" />
                  <span>{isBengali ? 'কন্টাক্ট ক্রেডিট' : 'Contact Credits'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-card text-xs">
                  {formatNumber(user?.contactCredits ?? 0)} {isBengali ? 'টি বাকি' : 'remaining'}
                </span>
              </Link>

              {isAdminOrMod && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-gold-soft text-gold border border-gold/20"
                >
                  <Shield className="w-5 h-5 shrink-0" />
                  <span>{isBengali ? 'অ্যাডমিন কন্ট্রোল প্যানেল' : 'Admin Control Panel'}</span>
                </Link>
              )}

              <div className="pt-2 border-t border-line">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-brand hover:bg-brand-soft cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5 shrink-0" />
                  <span>{isBengali ? 'লগআউট' : 'Logout'}</span>
                </button>
              </div>
            </>
          )}

          {!isAuthenticated && (
            <div className="pt-3 border-t border-line">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-sm font-semibold text-brand bg-brand-soft rounded-xl"
              >
                {isBengali ? 'লগইন করুন' : 'Login'}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
