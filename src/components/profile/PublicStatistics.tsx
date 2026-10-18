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
  const { data, isPending, isError, refetch } = useQuery({ queryKey: ['public-statistics'], queryFn: statisticsApi.get, staleTime: 60000 });
  return <section className="mb-statistics"><div className="mb-shell">
    <div className="mb-statistics-heading"><span className="mb-kicker">সংখ্যায় মধুবন্ধন</span><h2>মধুবন্ধন সেবা গ্রহীতার পরিসংখ্যান</h2><p>প্রকাশিত বায়োডাটা ও অ্যাডমিনের নিশ্চিত করা সফল বিবাহের তথ্য</p></div>
    {isError ? <div className="mb-statistics-error" role="status">পরিসংখ্যান লোড করা যায়নি। <button type="button" onClick={() => refetch()}>আবার চেষ্টা করুন</button></div> : <div className="mb-statistics-grid" aria-busy={isPending}>{cards.map(({key,label,icon:Icon}) => <article className="mb-statistic" key={key}><div className="mb-statistic-icon"><Icon size={34} strokeWidth={1.4} aria-hidden="true" /></div><h3>{label}</h3><p className="mb-statistic-value">{isPending ? <span aria-label="লোড হচ্ছে">—</span> : data?.data?.stats[key].toLocaleString('bn-BD') ?? '—'}</p></article>)}</div>}
  </div></section>;
}
