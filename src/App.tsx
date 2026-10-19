import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import { AuthProvider } from './context/AuthContext';
import { UserRole } from './types';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SearchPage from './pages/SearchPage';
import ProfileDetailPage from './pages/ProfileDetailPage';
import MyProfilePage from './pages/MyProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import InterestsPage from './pages/InterestsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PasswordRecoveryPage from './pages/PasswordRecoveryPage';
import ContactsPage from './pages/ContactsPage';
import ShortlistPage from './pages/ShortlistPage';
import PackagesPage from './pages/PackagesPage';
import FAQPage from './pages/FAQPage';
import WhatsAppSupportWidget from './components/common/WhatsAppSupportWidget';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 3, // 3 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-base text-ink font-sans antialiased selection:bg-brand selection:text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/forgot-password" element={<PasswordRecoveryPage />} />
                <Route path="/contacts" element={<ProtectedRoute><ContactsPage /></ProtectedRoute>} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/profiles/:userId" element={<ProfileDetailPage />} />

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

                {/* Protected Admin & Moderator Routes */}
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

                {/* 404 Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <WhatsAppSupportWidget />
            <Footer />
            <Toaster position="top-right" richColors />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
