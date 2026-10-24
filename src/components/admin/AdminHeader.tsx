import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  LogOut,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../i18n/LanguageContext';
import { UserRole } from '../../types';
import ThemeToggle from '../common/ThemeToggle';
import LanguageToggle from '../common/LanguageToggle';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const { user, logout } = useAuth();
  const { t, isBengali } = useLanguage();
  const navigate = useNavigate();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await logout();
    navigate('/admin/login', { replace: true });
  };

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return t('admin.superAdmin');
      case UserRole.ADMIN:
        return t('admin.adminRole');
      case UserRole.MODERATOR:
        return t('admin.moderatorRole');
      default:
        return isBengali ? 'প্রশাসক' : 'Administrator';
    }
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
            <ShieldAlert className="w-3 h-3" />
            {t('admin.superAdmin')}
          </span>
        );
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-brand-soft text-brand-ink border border-brand/30">
            <ShieldCheck className="w-3 h-3" />
            {t('admin.adminRole')}
          </span>
        );
      case UserRole.MODERATOR:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            <UserCheck className="w-3 h-3" />
            {t('admin.moderatorRole')}
          </span>
        );
      default:
        return null;
    }
  };

  // Avatar gradient based on role
  const getAvatarGradient = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'from-purple-600 to-indigo-600';
      case UserRole.ADMIN:
        return 'from-brand to-pink-500';
      case UserRole.MODERATOR:
        return 'from-amber-500 to-amber-600';
      default:
        return 'from-brand to-pink-500';
    }
  };

  const displayName = user?.name || getRoleLabel(user?.role);
  const avatarLetter = (user?.name || user?.email || 'A').trim().charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-line px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-2 transition-colors">
      {/* Brand & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-linear-to-tr from-brand to-pink-500 flex items-center justify-center text-white shadow-md shadow-brand/20 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base lg:text-lg font-black text-ink tracking-tight truncate whitespace-nowrap">
            {t('admin.controlCenter')}
          </h1>
          <p className="text-[11px] text-ink-3 hidden sm:block truncate">
            {t('admin.controlCenterSubtitle')}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Language Toggle: compact on mobile, full segmented switch on desktop */}
        <LanguageToggle compact className="sm:hidden" />
        <LanguageToggle className="hidden sm:inline-flex" />

        {/* Theme Toggle: compact 32px circular icon button on mobile, 64px switch on desktop */}
        <ThemeToggle compact className="sm:hidden" />
        <ThemeToggle className="hidden sm:inline-flex" />

        {/* User / Admin Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1.5 rounded-full border transition-all cursor-pointer select-none shrink-0 ${
              userDropdownOpen
                ? 'border-brand/50 bg-brand-soft ring-2 ring-brand/20'
                : 'border-line bg-elev hover:border-strongline'
            }`}
            aria-expanded={userDropdownOpen}
            aria-haspopup="true"
            aria-label="User profile menu"
          >
            <span
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-br ${getAvatarGradient(
                user?.role
              )} text-white flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 shadow-xs`}
            >
              {avatarLetter}
            </span>
            <div className="hidden sm:flex flex-col text-left max-w-[120px] lg:max-w-[160px] leading-tight">
              <span className="text-xs font-bold text-ink truncate whitespace-nowrap">
                {displayName}
              </span>
              <span className="text-[10px] text-ink-3 truncate whitespace-nowrap">
                {getRoleLabel(user?.role)}
              </span>
            </div>
            <ChevronDown
              className={`w-3.5 h-3.5 text-ink-3 transition-transform duration-200 shrink-0 ${
                userDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* User Dropdown Menu */}
          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-card border border-line shadow-[var(--mb-shadow-pop)] py-2 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              {/* User Details Header */}
              <div className="px-4 py-3 border-b border-line bg-elev/30">
                <div className="flex items-center gap-2.5 mb-2">
                  <span
                    className={`w-9 h-9 rounded-full bg-linear-to-br ${getAvatarGradient(
                      user?.role
                    )} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}
                  >
                    {avatarLetter}
                  </span>
                  <div className="overflow-hidden min-w-0">
                    <p className="text-xs font-bold text-ink truncate">{displayName}</p>
                    <p className="text-[11px] text-ink-3 font-mono truncate">{user?.email}</p>
                  </div>
                </div>
                <div>{getRoleBadge(user?.role)}</div>
              </div>

              <Link to="/admin/security" onClick={()=>setUserDropdownOpen(false)} className="block px-4 py-3 text-sm hover:bg-elev">{isBengali?'অ্যাকাউন্ট নিরাপত্তা':'Account security'}</Link>
{/* Action Links */}
              <div className="py-1.5 px-1.5 space-y-0.5 text-xs">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('admin.logout')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
