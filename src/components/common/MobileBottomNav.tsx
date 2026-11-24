import React from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Search, Heart, Bookmark, User } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../i18n/LanguageContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { isBengali } = useLanguage();

  const pathname = location.pathname;

  // Hide on admin routes
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    {
      to: '/',
      label: isBengali ? 'হোম' : 'Home',
      icon: Home,
      isActive: pathname === '/',
    },
    {
      to: '/search',
      label: isBengali ? 'খুঁজুন' : 'Search',
      icon: Search,
      isActive: pathname === '/search' || pathname.startsWith('/profiles'),
    },
    {
      to: isAuthenticated ? '/interests' : '/login',
      label: isBengali ? 'প্রস্তাব' : 'Interests',
      icon: Heart,
      isActive: pathname === '/interests',
    },
    {
      to: isAuthenticated ? '/shortlist' : '/login',
      label: isBengali ? 'পছন্দ' : 'Saved',
      icon: Bookmark,
      isActive: pathname === '/shortlist',
    },
    {
      to: isAuthenticated ? '/my-profile' : '/login',
      label: isAuthenticated ? (isBengali ? 'বায়োডাটা' : 'Profile') : (isBengali ? 'লগইন' : 'Login'),
      icon: User,
      isActive: pathname === '/my-profile' || pathname === '/edit-profile' || pathname === '/login',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-lg border-t border-line shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 transition-colors"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to + item.label}
              to={item.to}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all select-none ${
                item.isActive
                  ? 'text-brand font-bold'
                  : 'text-ink-3 hover:text-ink-2 font-medium'
              }`}
            >
              <div
                className={`relative p-1 rounded-xl transition-all ${
                  item.isActive ? 'bg-brand-soft text-brand scale-110' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-brand rounded-full ring-2 ring-card" />
                )}
              </div>
              <span className="text-[11px] leading-tight mt-0.5 tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
