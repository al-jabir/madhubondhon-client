import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  Users,
  HeartHandshake,
  AlertTriangle,
  Megaphone,
  FileEdit,
  CreditCard,
  UserCog,
  Settings,
  History,
  Shield,
  Activity,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export type AdminTab =
  | 'overview'
  | 'biodata'
  | 'users'
  | 'interests'
  | 'reports'
  | 'announcements'
  | 'content'
  | 'demo'
  | 'payments'
  | 'team'
  | 'settings'
  | 'audit';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  userRole?: UserRole;
  pendingBiodataCount?: number;
  pendingReportsCount?: number;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  userRole,
  pendingBiodataCount = 0,
  pendingReportsCount = 0,
}) => {
  const { t, formatNumber, isBengali } = useLanguage();
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
  const isSuperAdminOrAdmin = isSuperAdmin || userRole === UserRole.ADMIN;

  const navItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    section: 'main' | 'cms' | 'superadmin';
    visible: boolean;
  }> = [
    // Main Section
    {
      id: 'overview',
      label: t('admin.tabs.overview'),
      icon: LayoutDashboard,
      section: 'main',
      visible: true,
    },
    {
      id: 'biodata',
      label: t('admin.tabs.biodata'),
      icon: FileCheck2,
      badge: pendingBiodataCount,
      badgeColor: 'bg-brand text-white',
      section: 'main',
      visible: true,
    },
    {
      id: 'users',
      label: t('admin.tabs.users'),
      icon: Users,
      section: 'main',
      visible: isSuperAdminOrAdmin,
    },
    {
      id: 'interests',
      label: t('admin.tabs.interests'),
      icon: HeartHandshake,
      section: 'main',
      visible: isSuperAdminOrAdmin,
    },
    {
      id: 'reports',
      label: t('admin.tabs.reports'),
      icon: AlertTriangle,
      badge: pendingReportsCount,
      badgeColor: 'bg-amber-500 text-white',
      section: 'main',
      visible: true,
    },
    {
      id: 'payments',
      label: t('admin.tabs.payments'),
      icon: CreditCard,
      section: 'main',
      visible: isSuperAdminOrAdmin,
    },

    // CMS & Content
    {
      id: 'announcements',
      label: t('admin.tabs.announcements'),
      icon: Megaphone,
      section: 'cms',
      visible: isSuperAdminOrAdmin,
    },
    {
      id: 'content',
      label: t('admin.tabs.content'),
      icon: FileEdit,
      section: 'cms',
      visible: isSuperAdminOrAdmin,
    },
    {
      id: 'demo',
      label: t('admin.tabs.demo'),
      icon: Sparkles,
      section: 'cms',
      visible: isSuperAdminOrAdmin,
    },

    // Super Admin Only
    {
      id: 'team',
      label: t('admin.tabs.team'),
      icon: UserCog,
      section: 'superadmin',
      visible: isSuperAdmin,
    },
    {
      id: 'settings',
      label: t('admin.tabs.settings'),
      icon: Settings,
      section: 'superadmin',
      visible: isSuperAdmin,
    },
    {
      id: 'audit',
      label: t('admin.tabs.audit'),
      icon: History,
      section: 'superadmin',
      visible: true,
    },
  ];

  const mainItems = navItems.filter((i) => i.section === 'main' && i.visible);
  const cmsItems = navItems.filter((i) => i.section === 'cms' && i.visible);
  const superAdminItems = navItems.filter((i) => i.section === 'superadmin' && i.visible);

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-card border-r border-line p-3 sm:p-4 space-y-6">
      {/* Main modules */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-ink-3">
          {isBengali ? 'মূল পরিচালনা' : 'Core Modules'}
        </div>
        {mainItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand text-white shadow-md shadow-brand/25'
                  : 'text-ink-2 hover:text-ink hover:bg-elev'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-ink-3'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-brand' : item.badgeColor
                  }`}
                >
                  {formatNumber(item.badge)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CMS section */}
      {cmsItems.length > 0 && (
        <div className="space-y-1">
          <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-ink-3">
            {isBengali ? 'পাবলিক কনটেন্ট ও ঘোষণা' : 'Content & Notices'}
          </div>
          {cmsItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand text-white shadow-md shadow-brand/25'
                    : 'text-ink-2 hover:text-ink hover:bg-elev'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-ink-3'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Super Admin section */}
      {superAdminItems.length > 0 && (
        <div className="space-y-1 pt-2 border-t border-line">
          <div className="px-3 py-1 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
            <Shield className="w-3 h-3" />
            <span>{isBengali ? 'সুপার অ্যাডমিন জোন' : 'Super Admin Zone'}</span>
          </div>
          {superAdminItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                    : 'text-ink-2 hover:text-ink hover:bg-elev'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-ink-3'}`} />
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
};

export default AdminSidebar;
