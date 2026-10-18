import ThemeToggle from './ThemeToggle';
import React, { useState } from "react";
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
} from "lucide-react";
import { notificationsApi } from "../../api/notifications.api";
import { useAuth } from "../../context/useAuth";
import { UserRole } from "../../types";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  const { data: notificationsData } = useQuery({
    queryKey: ['my-notifications-count'],
    queryFn: () => notificationsApi.getNotifications({ page: 1, limit: 1 }),
    enabled: isAuthenticated,
    refetchInterval: 1000 * 60,
  });
  const unreadCount = notificationsData?.data?.unreadCount || 0;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-rose-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200 group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-rose-700 via-rose-600 to-pink-600 bg-clip-text text-transparent">
                মধুবন্ধন
              </span>
              <span className="text-[10px] text-gray-500 font-medium -mt-1 tracking-wider uppercase">
                Tangail Matrimony
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1.5">
            <ThemeToggle />
            <Link
              to="/search"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/search")
                  ? "bg-rose-50 text-rose-700 font-semibold"
                  : "text-gray-750 hover:bg-rose-50/50 hover:text-rose-600"
              }`}
            >
              <Search className="w-4 h-4" />
              <span>বায়োডাটা খুঁজুন</span>
            </Link>

            <Link
              to="/faq"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/faq")
                  ? "bg-rose-50 text-rose-700 font-semibold"
                  : "text-gray-750 hover:bg-rose-50/50 hover:text-rose-600"
              }`}
            >
              <HelpCircle className="w-4 h-4 text-rose-500" />
              <span>সহায়িকা ও FAQ</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/contacts"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/contacts")
                    ? "bg-rose-50 text-rose-700 font-semibold"
                    : "text-gray-750 hover:bg-rose-50/50 hover:text-rose-600"
                }`}
              >
                যোগাযোগ
              </Link>
            )}
            {isAuthenticated ? (
              <>
                <Link
                  to="/shortlist"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/shortlist")
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "text-gray-750 hover:bg-rose-50/50 hover:text-rose-600"
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>পছন্দের তালিকা</span>
                </Link>

                <Link
                  to="/interests"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/interests")
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "text-gray-750 hover:bg-rose-50/50 hover:text-rose-600"
                  }`}
                >
                  <Heart className="w-4 h-4" />
                  <span>আগ্রহ তালিকা</span>
                </Link>

                <Link
                  to="/packages"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-2xs ${
                    isActive("/packages")
                      ? "bg-amber-500 text-white shadow-amber-200 shadow-sm"
                      : "bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                  }`}
                  title="যোগাযোগ ক্রেডিট দেখুন বা রিচার্জ করুন"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                  <span>{user?.contactCredits ?? 0} ক্রেডিট</span>
                </Link>

                <Link
                  to="/notifications"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/notifications")
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "text-gray-750 hover:bg-rose-50/50 hover:text-rose-600"
                  }`}
                >
                  <div className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>বিজ্ঞপ্তি</span>
                </Link>

                {isAdminOrMod && (
                  <Link
                    to="/admin"
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/admin")
                        ? "bg-rose-50 text-rose-700 font-semibold"
                        : "text-gray-750 hover:bg-rose-50/50 hover:text-rose-600"
                    }`}
                  >
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>অ্যাডমিন প্যানেল</span>
                  </Link>
                )}

                <Link
                  to="/my-profile"
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive("/my-profile")
                      ? "bg-rose-50 text-rose-700 font-semibold"
                      : "text-gray-750 hover:bg-rose-50/50 hover:text-rose-600"
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>আমার প্রোফাইল</span>
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 ml-2 px-3 py-2 text-sm font-medium text-gray-500 hover:text-rose-600 hover:bg-rose-50/50 rounded-lg transition-colors cursor-pointer"
                  title="লগআউট"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগআউট</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3 ml-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  লগইন
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-lg shadow-sm shadow-rose-200 transition-all hover:shadow-md"
                >
                  নিবন্ধন করুন (ফ্রি)
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex xl:hidden items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-650 hover:text-rose-600 hover:bg-rose-50 rounded-lg focus:outline-hidden"
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

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-rose-100 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg">
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600"
          >
            <Search className="w-5 h-5 text-gray-500" />
            <span>বায়োডাটা খুঁজুন</span>
          </Link>

          <Link
            to="/faq"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600"
          >
            <HelpCircle className="w-5 h-5 text-gray-500" />
            <span>সহায়িকা ও জিজ্ঞাসা (FAQ)</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/contacts"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-rose-700"
            >
              যোগাযোগ
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link
                to="/packages"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-bold bg-amber-50 text-amber-950 border border-amber-200"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-600 fill-amber-400" />
                  <span>কন্টাক্ট ক্রেডিট</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-xs">
                  {user?.contactCredits ?? 0} টি বাকি
                </span>
              </Link>

              <Link
                to="/shortlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600"
              >
                <Bookmark className="w-5 h-5 text-gray-500" />
                <span>পছন্দের তালিকা</span>
              </Link>

              <Link
                to="/interests"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600"
              >
                <Heart className="w-5 h-5 text-gray-500" />
                <span>আগ্রহ তালিকা</span>
              </Link>

              <Link
                to="/notifications"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600"
              >
                <div className="flex items-center gap-2.5">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span>বিজ্ঞপ্তি</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                    {unreadCount} নতুন
                  </span>
                )}
              </Link>

              {isAdminOrMod && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Shield className="w-5 h-5 text-amber-600" />
                  <span>অ্যাডমিন প্যানেল</span>
                </Link>
              )}

              <Link
                to="/my-profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-800 hover:bg-rose-50 hover:text-rose-600"
              >
                <UserIcon className="w-5 h-5 text-gray-500" />
                <span>আমার প্রোফাইল</span>
              </Link>

              <div className="pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>লগআউট</span>
                </button>
              </div>
            </>
          ) : (
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg"
              >
                লগইন
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center w-full py-2.5 text-sm font-semibold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-lg shadow-sm"
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
