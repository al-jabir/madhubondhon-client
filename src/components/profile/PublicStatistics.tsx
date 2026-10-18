import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { UsersRound, UserRound, HeartHandshake, Heart } from 'lucide-react';
import { statisticsApi } from '../../api/statistics.api';

const cards = [
  { key: 'totalProfiles', label: 'সর্বমোট পাত্র-পাত্রীর বায়োডাটা', icon: UsersRound },
  { key: 'maleProfiles', label: 'সর্বমোট পাত্রের বায়োডাটা', icon: UserRound },
  { key: 'femaleProfiles', label: 'সর্বমোট পাত্রীর বায়োডাটা', icon: Heart },
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
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <span className="text-xs font-bold text-rose-400 tracking-wider uppercase bg-rose-950/60 px-3 py-1 rounded-full border border-rose-900/50 inline-block">
          সংখ্যায় মধুবন্ধন
        </span>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
          মধুবন্ধন সেবা গ্রহীতার পরিসংখ্যান
        </h2>
        <p className="text-xs sm:text-sm text-gray-400">
          প্রকাশিত বায়োডাটা ও অ্যাডমিনের নিশ্চিত করা সফল বিবাহের নিয়মিত হালনাগাদ তথ্য
        </p>
      </div>

      {isError ? (
        <div className="p-6 rounded-2xl bg-[#1d121c] border border-rose-900/50 text-center text-sm text-rose-300">
          পরিসংখ্যান লোড করা যায়নি।{' '}
          <button
            type="button"
            onClick={() => refetch()}
            className="font-bold underline ml-1 hover:text-white cursor-pointer"
          >
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map(({ key, label, icon: Icon }) => (
            <article
              key={key}
              className="p-6 rounded-3xl bg-[#16101c]/80 border border-[#2b1b30] hover:border-rose-900/60 transition-all flex flex-col items-center text-center space-y-3 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-950/60 border border-rose-900/50 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform">
                <Icon className="w-7 h-7 stroke-[1.5]" />
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-300">{label}</h3>
              <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isPending ? '—' : data?.data?.stats[key]?.toLocaleString('bn-BD') ?? '—'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
