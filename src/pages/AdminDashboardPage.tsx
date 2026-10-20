import React from 'react';
import { Navigate, useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/useAuth';
import { useLanguage } from '../i18n/LanguageContext';
import { UserRole } from '../types';
import { adminApi } from '../api/admin.api';

// Admin Components
import AdminHeader from '../components/admin/AdminHeader';
import AdminSidebar, { AdminTab } from '../components/admin/AdminSidebar';
import AdminPaymentsQueue from '../components/admin/AdminPaymentsQueue';

// Tabs
import AdminOverviewTab from '../components/admin/tabs/AdminOverviewTab';
import AdminBiodataTab from '../components/admin/tabs/AdminBiodataTab';
import AdminUsersTab from '../components/admin/tabs/AdminUsersTab';
import AdminInterestsTab from '../components/admin/tabs/AdminInterestsTab';
import AdminReportsTab from '../components/admin/tabs/AdminReportsTab';
import AdminAnnouncementsTab from '../components/admin/tabs/AdminAnnouncementsTab';
import AdminContentTab from '../components/admin/tabs/AdminContentTab';
import AdminDemoTab from '../components/admin/tabs/AdminDemoTab';
import AdminTeamTab from '../components/admin/tabs/AdminTeamTab';
import AdminSettingsTab from '../components/admin/tabs/AdminSettingsTab';
import AdminAuditLogsTab from '../components/admin/tabs/AdminAuditLogsTab';

const validAdminTabs: AdminTab[] = [
  'overview',
  'biodata',
  'users',
  'interests',
  'reports',
  'announcements',
  'content',
  'demo',
  'payments',
  'team',
  'settings',
  'audit',
];

export const AdminDashboardPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isSuperAdminOrAdmin = isSuperAdmin || currentUser?.role === UserRole.ADMIN;
  const isAdminOrMod = isSuperAdminOrAdmin || currentUser?.role === UserRole.MODERATOR;

  // Strict In-Component Role Protection Guard:
  // If not authenticated or role is customer/undefined, immediately redirect to admin login
  if (!currentUser || !isAdminOrMod) {
    return <Navigate to="/admin/login" replace />;
  }

  // Initial tab based on role and URL query param
  const defaultTab: AdminTab =
    currentUser?.role === UserRole.MODERATOR ? 'biodata' : 'overview';
  const tabFromUrl = searchParams.get('tab') as AdminTab | null;

  let activeTab: AdminTab =
    tabFromUrl && validAdminTabs.includes(tabFromUrl) ? tabFromUrl : defaultTab;

  // Role-based privilege validation for active tab
  if (['team', 'settings'].includes(activeTab) && !isSuperAdmin) {
    activeTab = defaultTab;
  } else if (
    ['users', 'interests', 'payments', 'announcements', 'content', 'demo'].includes(activeTab) &&
    !isSuperAdminOrAdmin
  ) {
    activeTab = defaultTab;
  }

  const handleSelectTab = (tab: AdminTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', tab);
        return next;
      },
      { replace: true }
    );
  };

  // Real Stats Query (only enabled for verified administrative accounts)
  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats(),
    enabled: !!currentUser && isAdminOrMod,
    refetchInterval: 30000, // Refresh every 30s
  });

  const stats = statsData?.data?.stats;
  const pendingBiodata = stats?.biodata?.pendingReview || 0;
  const pendingReports = stats?.reports?.pending || 0;

  return (
    <div className="min-h-screen bg-base text-ink flex flex-col transition-colors">
      {/* Top Admin Header */}
      <AdminHeader />

      {/* Main Admin Body: Sidebar + Active Tab Content */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col lg:flex-row">
        {/* Sidebar Navigation */}
        <AdminSidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          userRole={currentUser?.role}
          pendingBiodataCount={pendingBiodata}
          pendingReportsCount={pendingReports}
        />

        {/* Dynamic Content Panel */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'overview' && (
            <AdminOverviewTab
              stats={stats}
              onNavigateTab={handleSelectTab}
              isSuperAdminOrAdmin={isSuperAdminOrAdmin}
            />
          )}

          {activeTab === 'biodata' && <AdminBiodataTab />}

          {activeTab === 'users' && isSuperAdminOrAdmin && (
            <AdminUsersTab
              currentUserRole={currentUser?.role}
              currentUserId={currentUser?.id || (currentUser as any)?._id}
            />
          )}

          {activeTab === 'interests' && isSuperAdminOrAdmin && <AdminInterestsTab />}

          {activeTab === 'reports' && <AdminReportsTab />}

          {activeTab === 'payments' && isSuperAdminOrAdmin && <AdminPaymentsQueue />}

          {activeTab === 'announcements' && isSuperAdminOrAdmin && <AdminAnnouncementsTab />}

          {activeTab === 'content' && isSuperAdminOrAdmin && <AdminContentTab />}

          {activeTab === 'demo' && isSuperAdminOrAdmin && <AdminDemoTab />}

          {activeTab === 'team' && isSuperAdmin && (
            <AdminTeamTab currentUserId={currentUser?.id || (currentUser as any)?._id} />
          )}

          {activeTab === 'settings' && isSuperAdmin && <AdminSettingsTab />}

          {activeTab === 'audit' && <AdminAuditLogsTab />}
        </main>
      </div>

      {/* Minimal Admin Control Footer */}
      <footer className="py-2.5 px-4 sm:px-8 border-t border-line text-center text-[11px] text-ink-3 bg-card/30">
        {t('admin.adminFooterText')}
      </footer>
    </div>
  );
};

export default AdminDashboardPage;
