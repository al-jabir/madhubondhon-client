import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Megaphone, X, Pin, AlertTriangle, Info } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { AnnouncementItem } from '../../types';

export const AnnouncementBanner: React.FC = () => {
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const stored = sessionStorage.getItem('dismissed_announcements');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { data: annData } = useQuery({
    queryKey: ['public-announcements'],
    queryFn: () => adminApi.getPublicAnnouncements(),
    staleTime: 60 * 1000,
  });

  const announcements = annData?.data?.announcements || [];
  const visibleAnnouncements = announcements.filter((a) => !dismissedIds.includes(a._id));

  if (visibleAnnouncements.length === 0) return null;

  const currentAnnouncement = visibleAnnouncements[0];

  const handleDismiss = (id: string) => {
    const next = [...dismissedIds, id];
    setDismissedIds(next);
    try {
      sessionStorage.setItem('dismissed_announcements', JSON.stringify(next));
    } catch {
      // ignore storage error
    }
  };

  const isUrgent = currentAnnouncement.priority === 'urgent';
  const isHigh = currentAnnouncement.priority === 'high';

  return (
    <div
      role="region"
      aria-label="Announcement Banner"
      className={`relative z-40 border-b text-xs sm:text-sm transition-colors py-2.5 px-4 sm:px-6 ${
        isUrgent
          ? 'bg-red-500/15 border-red-500/30 text-red-950 dark:text-red-200'
          : isHigh
          ? 'bg-amber-500/15 border-amber-500/30 text-amber-950 dark:text-amber-200'
          : 'bg-brand/10 border-brand/20 text-brand-ink dark:text-brand-soft'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="shrink-0 p-1 rounded-lg bg-card/60 shadow-2xs">
            {isUrgent ? (
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 animate-pulse" />
            ) : isHigh ? (
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            ) : (
              <Megaphone className="w-4 h-4 text-brand shrink-0" />
            )}
          </div>

          <div className="truncate">
            <span className="font-black mr-2">
              {currentAnnouncement.isPinned && <Pin className="w-3.5 h-3.5 inline mr-1 fill-current" />}
              {currentAnnouncement.title}:
            </span>
            <span className="opacity-90">{currentAnnouncement.content}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleDismiss(currentAnnouncement._id)}
          className="shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-ink-3 hover:text-ink cursor-pointer transition-colors"
          title="বাতিল করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
