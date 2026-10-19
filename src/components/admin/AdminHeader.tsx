import React from 'react';
import { Link } from 'react-router';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  ExternalLink,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { UserRole } from '../../types';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-xs">
            <ShieldAlert className="w-3.5 h-3.5" />
            সুপার অ্যাডমিন (Super Admin)
          </span>
        );
      case UserRole.ADMIN:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-brand-soft text-brand-ink border border-brand/30 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            অ্যাডমিন (Admin)
          </span>
        );
      case UserRole.MODERATOR:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
            <UserCheck className="w-3.5 h-3.5" />
            মডারেটর (Moderator)
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-line px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-brand to-pink-500 flex items-center justify-center text-white shadow-md shadow-brand/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-ink tracking-tight flex items-center gap-2">
              মধুবন্ধন কন্ট্রোল সেন্টার
            </h1>
            <p className="text-[11px] text-ink-3 hidden sm:block">
              টাঙ্গাইল জেলা বৈবাহিক প্ল্যাটফর্ম পরিচালনা প্যানেল
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden md:flex items-center gap-2">
          {getRoleBadge(user?.role)}
        </div>

        <div className="h-6 w-px bg-line hidden sm:block" />

        <div className="flex items-center gap-2 text-right hidden sm:block">
          <div className="text-xs font-bold text-ink leading-tight">{user?.name}</div>
          <div className="text-[10px] text-ink-3 font-mono leading-tight">{user?.email}</div>
        </div>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-line bg-elev hover:bg-brand-soft hover:text-brand-ink text-ink-2 transition-all cursor-pointer shadow-2xs"
          title="মূল ওয়েবসাইট দেখুন"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">মূল সাইট</span>
        </Link>

        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all cursor-pointer"
          title="লগআউট"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden md:inline">লগআউট</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
