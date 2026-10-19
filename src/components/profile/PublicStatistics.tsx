import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UsersRound, UserRound, HeartHandshake, Heart } from 'lucide-react';
import { statisticsApi } from '../../api/statistics.api';

const cards = [
  { key: 'totalProfiles', label: 'সর্বমোট পাত্র-পাত্রীর বায়োডাটা', icon: UsersRound },
  { key: 'maleProfiles', label: 'সর্বমোট পাত্রের বায়োডাটা', icon: UserRound },
  { key: 'femaleProfiles', label: 'সর্বমোট পাত্রীর বায়োডাটা', icon: Heart },
  { key: 'successfulMarriages', label: 'সর্বমোট সফল বিবাহ', icon: HeartHandshake },
] as const;

export default function PublicStatistics() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ['public-statistics'],
    queryFn: statisticsApi.get,
    staleTime: 60000,
  });

  return (
    <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2.5">
        <span className="mb-badge">সংখ্যায় মধুবন্ধন</span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-section-title">
          মধুবন্ধন সেবা গ্রহীতার পরিসংখ্যান
        </h2>
        <p className="text-xs sm:text-sm text-ink-2">
          প্রকাশিত বায়োডাটা ও অ্যাডমিনের নিশ্চিত করা সফল বিবাহের নিয়মিত হালনাগাদ তথ্য
        </p>
      </div>

      {isError ? (
        <div className="p-6 rounded-2xl bg-brand-soft border border-brand/25 text-center text-sm text-brand-ink">
          পরিসংখ্যান লোড করা যায়নি।{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-bold underline ml-1 cursor-pointer"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ key, label, icon: Icon }) => (
            <article
              key={key}
              className="mb-card mb-card-hover p-6 flex flex-col items-center text-center space-y-3 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-soft border border-brand/20 flex items-center justify-center text-brand group-hover:scale-105 group-hover:-rotate-2 transition-transform">
                <Icon className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-ink-2">{label}</h3>
              <p className="text-3xl font-bold text-ink tracking-tight bg-linear-to-br from-ink to-brand bg-clip-text text-transparent">
                {isPending ? '—' : data?.data?.stats[key]?.toLocaleString('bn-BD') ?? '—'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
