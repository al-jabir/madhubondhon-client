import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider } from './context/AuthContext';
import { UserRole } from './types';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import WhatsAppSupportWidget from './components/common/WhatsAppSupportWidget';
import AnnouncementBanner from './components/common/AnnouncementBanner';

// Route-level code splitting — every page is a separate chunk, loaded on demand.
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const ProfileDetailPage = lazy(() => import('./pages/ProfileDetailPage'));
const MyProfilePage = lazy(() => import('./pages/MyProfilePage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const InterestsPage = lazy(() => import('./pages/InterestsPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const PasswordRecoveryPage = lazy(() => import('./pages/PasswordRecoveryPage'));
const ContactsPage = lazy(() => import('./pages/ContactsPage'));
const ShortlistPage = lazy(() => import('./pages/ShortlistPage'));
const PackagesPage = lazy(() => import('./pages/PackagesPage'));
const FAQPage = lazy(() => import('./pages/FAQPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 3, // 3 minutes
    },
  },
});

const PageFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const AppShell: React.FC = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen flex flex-col bg-base text-ink font-sans antialiased selection:bg-brand selection:text-white">
      {/* Public Navbar & Announcement Banner are hidden on Admin routes */}
      {!isAdminRoute && <Navbar />}
      {!isAdminRoute && <AnnouncementBanner />}
      <main className="flex-1">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
            <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profiles/:userId" element={<ProfileDetailPage />} />

            {/* Sample biodata demo routes (fictional profiles, no database needed) */}
            <Route path="/demo" element={<SearchPage demo />} />
            <Route path="/demo/profiles/:userId" element={<ProfileDetailPage demo />} />

            {/* Protected User Routes */}
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <ProtectedRoute>
                  <EditProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/interests"
              element={
                <ProtectedRoute>
                  <InterestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shortlist"
              element={
                <ProtectedRoute>
                  <ShortlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/packages"
              element={
                <ProtectedRoute>
                  <PackagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Dedicated Admin Login Route */}
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Protected Admin & Moderator Routes (Admin-Only Dashboard) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.MODERATOR,
                    UserRole.ADMIN,
                    UserRole.SUPER_ADMIN,
                  ]}
                >
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute
                  allowedRoles={[
                    UserRole.MODERATOR,
                    UserRole.ADMIN,
                    UserRole.SUPER_ADMIN,
                  ]}
                >
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
      {/* Public Support & Footer are hidden on Admin routes */}
      {!isAdminRoute && <WhatsAppSupportWidget />}
      {!isAdminRoute && <Footer />}
      <Toaster position="top-right" richColors />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppShell />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
