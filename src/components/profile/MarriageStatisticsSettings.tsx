import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { statisticsApi } from '../../api/statistics.api';
import { getApiErrorMessage } from '../../api/errors';
export default function MarriageStatisticsSettings() {
  const cache = useQueryClient();
  const { data, isError, refetch } = useQuery({ queryKey: ['public-statistics'], queryFn: statisticsApi.get });
  const [count, setCount] = useState('');
  const update = useMutation({
    mutationFn: () => statisticsApi.updateMarriages(Number(count)),
    onSuccess: () => { setCount(''); cache.invalidateQueries({queryKey:['public-statistics']}); toast.success('সফল বিবাহের সংখ্যা সংরক্ষণ হয়েছে।'); },
    onError: e => toast.error(getApiErrorMessage(e, 'সংরক্ষণ করা যায়নি।')),
  });
  return <section className="bg-white border border-rose-100 rounded-2xl p-5 space-y-3">
    <h2 className="font-bold text-gray-900">হোমপেজের সফল বিবাহের পরিসংখ্যান</h2>
    <p className="text-sm text-gray-600">শুধু নিশ্চিত করা বিবাহের মোট সংখ্যা দিন। এটি হোমপেজে প্রকাশিত হবে। বর্তমান সংখ্যা: {data?.data?.stats.successfulMarriages.toLocaleString('bn-BD') ?? '—'}</p>
    {isError && <button className="text-rose-700" type="button" onClick={() => refetch()}>তথ্য লোড করতে আবার চেষ্টা করুন</button>}
    <form className="flex flex-wrap gap-3 items-end" onSubmit={e => {e.preventDefault(); if(count.trim() && Number.isInteger(Number(count)) && Number(count)>=0) update.mutate();}}>
      <label className="text-sm text-gray-700">নিশ্চিত সফল বিবাহের মোট সংখ্যা<input className="block mt-2 border border-gray-200 rounded-xl p-2 bg-white" type="number" min="0" max="10000000" step="1" required value={count} onChange={e => setCount(e.target.value)} /></label>
      <button type="submit" disabled={update.isPending || !count.trim()} className="bg-rose-600 text-white rounded-xl px-4 py-2 disabled:opacity-40">{update.isPending ? 'সংরক্ষণ হচ্ছে…' : 'সংরক্ষণ করুন'}</button>
    </form>
  </section>;
}
