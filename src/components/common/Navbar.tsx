import ThemeToggle from './ThemeToggle';
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
  HelpCircle,
  ChevronDown,
  Phone,
} from "lucide-react";
import { notificationsApi } from "../../api/notifications.api";
import { useAuth } from "../../context/useAuth";
import { UserRole } from "../../types";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

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

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#191e28]/95 backdrop-blur-md border-b border-rose-100 dark:border-gray-800 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 dark:shadow-none group-hover:scale-105 transition-transform shrink-0">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight bg-linear-to-r from-rose-700 via-rose-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                মধুবন্ধন
              </span>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium -mt-1 tracking-wider uppercase whitespace-nowrap">
                Tangail Matrimony
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/search"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                isActive("/search")
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold"
                  : "text-gray-700 dark:text-gray-250 hover:bg-rose-50/70 hover:text-rose-600 dark:hover:bg-gray-800/60 dark:hover:text-rose-300"
              }`}
            >
              <Search className="w-4 h-4 shrink-0 text-rose-500" />
              <span>বায়োডাটা খুঁজুন</span>
            </Link>

            <Link
              to="/faq"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                isActive("/faq")
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold"
                  : "text-gray-700 dark:text-gray-250 hover:bg-rose-50/70 hover:text-rose-600 dark:hover:bg-gray-800/60 dark:hover:text-rose-300"
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>সহায়িকা ও FAQ</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/shortlist"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                  isActive("/shortlist")
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold"
                    : "text-gray-700 dark:text-gray-250 hover:bg-rose-50/70 hover:text-rose-600 dark:hover:bg-gray-800/60 dark:hover:text-rose-300"
                }`}
              >
                <Bookmark className="w-4 h-4 shrink-0 text-rose-500" />
                <span>পছন্দের তালিকা</span>
              </Link>
            )}
          </nav>

          {/* Desktop Right Side Actions */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Contact Credits Pill */}
                <Link
                  to="/packages"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-2xs shrink-0 ${
                    isActive("/packages")
                      ? "bg-amber-500 text-white shadow-amber-200"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                  }`}
                  title="যোগাযোগ ক্রেডিট দেখুন বা রিচার্জ করুন"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-amber-400 shrink-0" />
                  <span>{user?.contactCredits ?? 0} ক্রেডিট</span>
                </Link>

                {/* Notifications Bell */}
                <Link
                  to="/notifications"
                  aria-label="বিজ্ঞপ্তি"
                  className={`relative p-2 rounded-xl transition-all shrink-0 ${
                    isActive("/notifications")
                      ? "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
                      : "text-gray-650 dark:text-gray-300 hover:bg-rose-50/70 hover:text-rose-600 dark:hover:bg-gray-800/60 dark:hover:text-rose-300"
                  }`}
                  title="বিজ্ঞপ্তি"
                >
                  <Bell className="w-5 h-5 shrink-0" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white dark:ring-gray-900 shadow-xs">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                {/* User Dropdown Menu */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer select-none shrink-0 ${
                      userDropdownOpen
                        ? "bg-rose-50/90 dark:bg-gray-800 border-rose-300 dark:border-rose-900 ring-2 ring-rose-200 dark:ring-rose-950"
                        : "bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50/40 dark:hover:bg-gray-800"
                    }`}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {user?.name ? user.name.trim().charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div className="flex flex-col text-left max-w-[110px] xl:max-w-[140px]">
                      <span className="text-xs font-bold text-gray-900 dark:text-gray-100 truncate whitespace-nowrap">
                        {user?.name || "ইউজার"}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate whitespace-nowrap">
                        {isAdminOrMod ? (
                          <span className="text-amber-600 dark:text-amber-400 font-semibold">
                            {user?.role === UserRole.SUPER_ADMIN ? "সুপার অ্যাডমিন" : user?.role === UserRole.ADMIN ? "অ্যাডমিন" : "মডারেটর"}
                          </span>
                        ) : (
                          "সদস্য"
                        )}
                      </span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
                        userDropdownOpen ? "rotate-180 text-rose-600" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu Box */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#1a202c] border border-rose-100 dark:border-gray-750 shadow-2xl py-2 z-50">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-750">
                        <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {user?.email}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isAdminOrMod
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300"
                              : "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300"
                          }`}>
                            {user?.role === UserRole.SUPER_ADMIN
                              ? "সুপার অ্যাডমিন"
                              : user?.role === UserRole.ADMIN
                              ? "অ্যাডমিন"
                              : user?.role === UserRole.MODERATOR
                              ? "মডারেটর"
                              : "সাধারণ সদস্য"}
                          </span>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            🪙 {user?.contactCredits ?? 0} ক্রেডিট
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Navigation Links */}
                      <div className="py-1.5 space-y-0.5">
                        {isAdminOrMod && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors whitespace-nowrap"
                          >
                            <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                            <span>অ্যাডমিন প্যানেল</span>
                          </Link>
                        )}

                        <Link
                          to="/my-profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                            isActive("/my-profile")
                              ? "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 font-semibold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-rose-50/50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400"
                          }`}
                        >
                          <UserIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>আমার বায়োডাটা / প্রোফাইল</span>
                        </Link>

                        <Link
                          to="/interests"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                            isActive("/interests")
                              ? "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 font-semibold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-rose-50/50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400"
                          }`}
                        >
                          <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                          <span>আগ্রহ তালিকা</span>
                        </Link>

                        <Link
                          to="/contacts"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                            isActive("/contacts")
                              ? "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 font-semibold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-rose-50/50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400"
                          }`}
                        >
                          <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>যোগাযোগের তথ্য</span>
                        </Link>

                        <Link
                          to="/packages"
                          onClick={() => setUserDropdownOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                            isActive("/packages")
                              ? "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/40 font-semibold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-rose-50/50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400"
                          }`}
                        >
                          <Coins className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>প্যাকেজ ও রিচার্জ</span>
                        </Link>
                      </div>

                      {/* Logout Action */}
                      <div className="pt-1.5 mt-1 border-t border-gray-100 dark:border-gray-750">
                        <button
                          type="button"
                          onClick={() => {
                            setUserDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer text-left whitespace-nowrap"
                        >
                          <LogOut className="w-4 h-4 shrink-0" />
                          <span>লগআউট করুন</span>
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
                  className="px-4 py-2 text-sm font-semibold text-rose-700 dark:text-rose-300 hover:text-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors whitespace-nowrap"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-xs shadow-rose-200 dark:shadow-none transition-all hover:shadow-md whitespace-nowrap"
                >
                  নিবন্ধন করুন (ফ্রি)
                </Link>
              </div>
            )}
          </div>

          {/* Mobile & Tablet controls */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative p-2 rounded-xl text-gray-750 hover:bg-rose-50"
                aria-label="বিজ্ঞপ্তি"
              >
                <Bell className="w-5 h-5 shrink-0" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-750 hover:text-rose-600 hover:bg-rose-50 rounded-xl focus:outline-hidden cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-rose-100 dark:border-gray-800 bg-white dark:bg-[#1a202c] px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in fade-in duration-150 max-h-[calc(100vh-4rem)] overflow-y-auto">
          {isAuthenticated && user && (
            <div className="p-3 mb-2 rounded-xl bg-rose-50/60 dark:bg-gray-800/80 border border-rose-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-linear-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {user.name ? user.name.trim().charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400">
                    {user.email}
                  </span>
                </div>
              </div>
              {isAdminOrMod && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                  {user.role === UserRole.SUPER_ADMIN ? "সুপার অ্যাডমিন" : user.role === UserRole.ADMIN ? "অ্যাডমিন" : "মডারেটর"}
                </span>
              )}
            </div>
          )}

          {isAuthenticated && isAdminOrMod && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-amber-100/70 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
            >
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>🛡️ অ্যাডমিন কন্ট্রোল প্যানেল</span>
            </Link>
          )}

          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600"
          >
            <Search className="w-5 h-5 text-rose-500 shrink-0" />
            <span>বায়োডাটা খুঁজুন</span>
          </Link>

          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600"
          >
            <HelpCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>সহায়িকা ও FAQ</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/packages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border border-amber-200 dark:border-amber-800"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400 fill-amber-400 shrink-0" />
                  <span>কন্টাক্ট ক্রেডিট</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 text-xs">
                  {user?.contactCredits ?? 0} টি বাকি
                </span>
              </Link>

              <Link
                to="/shortlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600"
              >
                <Bookmark className="w-5 h-5 text-rose-500 shrink-0" />
                <span>পছন্দের তালিকা</span>
              </Link>

              <Link
                to="/interests"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600"
              >
                <Heart className="w-5 h-5 text-rose-500 shrink-0" />
                <span>আগ্রহ তালিকা</span>
              </Link>

              <Link
                to="/contacts"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600"
              >
                <Phone className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>যোগাযোগের তথ্য</span>
              </Link>

              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>বিজ্ঞপ্তি</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                    {unreadCount} নতুন
                  </span>
                )}
              </Link>

              <Link
                to="/my-profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600"
              >
                <UserIcon className="w-5 h-5 text-gray-500 shrink-0" />
                <span>আমার প্রোফাইল</span>
              </Link>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-gray-800 cursor-pointer"
                >
                  <LogOut className="w-5 h-5 shrink-0" />
                  <span>লগআউট</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-sm font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 rounded-xl"
              >
                লগইন
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-sm font-semibold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-sm"
              >
                নিবন্ধন করুন (ফ্রি)
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
