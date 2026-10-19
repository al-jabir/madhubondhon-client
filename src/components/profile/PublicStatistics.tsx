import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UsersRound, UserRound, HeartHandshake, Heart } from 'lucide-react';
import { statisticsApi } from '../../api/statistics.api';
import { useLanguage } from '../../i18n/LanguageContext';

export default function PublicStatistics() {
  const { isBengali, formatNumber } = useLanguage();
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['public-statistics'],
    queryFn: statisticsApi.get,
    staleTime: 60000,
  });

  const cards = [
    {
      key: 'totalProfiles' as const,
      label: isBengali ? 'সর্বমোট পাত্র-পাত্রীর বায়োডাটা' : 'Total Grooms & Brides',
      icon: UsersRound,
    },
    {
      key: 'maleProfiles' as const,
      label: isBengali ? 'সর্বমোট পাত্রের বায়োডাটা' : "Grooms' Biodata",
      icon: UserRound,
    },
    {
      key: 'femaleProfiles' as const,
      label: isBengali ? 'সর্বমোট পাত্রীর বায়োডাটা' : "Brides' Biodata",
      icon: Heart,
    },
    {
      key: 'successfulMarriages' as const,
      label: isBengali ? 'সর্বমোট সফল বিবাহ' : 'Successful Marriages',
      icon: HeartHandshake,
    },
  ];

  return (
    <section className="py-10 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-2">
        <span className="mb-badge">
          {isBengali ? 'সংখ্যায় মধুবন্ধন' : 'MadhuBondhon in Numbers'}
        </span>
        <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold mb-section-title">
          {isBengali ? 'মধুবন্ধন সেবা গ্রহীতার পরিসংখ্যান' : 'Live Platform Statistics'}
        </h2>
        <p className="text-xs sm:text-sm text-ink-2">
          {isBengali
            ? 'প্রকাশিত বায়োডাটা ও অ্যাডমিনের নিশ্চিত করা সফল বিবাহের নিয়মিত হালনাগাদ তথ্য'
            : 'Real-time overview of active matrimonial profiles and admin-verified marriages'}
        </p>
      </div>

      {isError ? (
        <div className="p-6 rounded-2xl bg-brand-soft border border-brand/25 text-center text-sm text-brand-ink">
          {isBengali ? 'পরিসংখ্যান লোড করা যায়নি।' : 'Failed to load statistics.'}{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-bold underline ml-1 cursor-pointer"
          >
            {isBengali ? 'আবার চেষ্টা করুন' : 'Try again'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {cards.map(({ key, label, icon: Icon }) => (
            <article
              key={key}
              className="mb-card mb-card-hover p-4 sm:p-6 rounded-2xl flex flex-col items-center text-center space-y-2 sm:space-y-3 group"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-brand-soft border border-brand/20 flex items-center justify-center text-brand group-hover:scale-105 group-hover:-rotate-2 transition-transform">
                <Icon className="w-5 h-5 sm:w-7 sm:h-7 stroke-[1.6]" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-ink-2 leading-snug">{label}</h3>
              <p className="text-xl sm:text-3xl font-bold text-ink tracking-tight bg-linear-to-br from-ink to-brand bg-clip-text text-transparent">
                {isPending ? '—' : data?.data?.stats?.[key] !== undefined ? formatNumber(data.data.stats[key]) : '—'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
