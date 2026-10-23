import { Link } from 'react-router';
import { useMutation,useQuery,useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { discoveryApi,savedSearchUrl } from '../api/discovery.api';
import { useLanguage } from '../i18n/LanguageContext';
import { getApiErrorMessage } from '../api/errors';
export default function SavedSearchesPage(){
 const {isBengali}=useLanguage();const cache=useQueryClient();const {data,isPending,isError,refetch}=useQuery({queryKey:['saved-searches'],queryFn:discoveryApi.listSearches});
 const remove=useMutation({mutationFn:discoveryApi.deleteSearch,onSuccess:()=>cache.invalidateQueries({queryKey:['saved-searches']}),onError:e=>toast.error(getApiErrorMessage(e,'Could not remove search.'))});
 return <div className="max-w-3xl mx-auto px-4 py-10 space-y-5"><h1 className="text-2xl font-bold">{isBengali?'আমার সংরক্ষিত search':'My saved searches'}</h1><p className="text-ink-2">{isBengali?'পছন্দগুলো আবার না দিয়ে, নামের পাশে “আবার খুঁজুন” চাপুন। নতুন search ফলাফলের পেজ থেকে সংরক্ষণ করতে পারবেন।':'Use your saved preferences without selecting them again. Save a new search from the results page.'}</p><Link className="mb-btn-primary" to="/search">{isBengali?'নতুন করে খুঁজুন':'Start a new search'}</Link>{isPending?<p role="status">{isBengali?'লোড হচ্ছে…':'Loading…'}</p>:isError?<button className="mb-btn-secondary" onClick={()=>refetch()}>{isBengali?'আবার চেষ্টা করুন':'Try again'}</button>:!data?.data?.searches.length?<p className="mb-card p-6">{isBengali?'এখনও কোনো search সংরক্ষণ করেননি।':'No searches saved yet.'}</p>:data.data.searches.map(item=><article key={item._id} className="mb-card p-5 flex flex-wrap items-center justify-between gap-4"><h2 className="font-semibold break-words">{item.name}</h2><div className="flex gap-3"><Link className="mb-btn-primary !text-xs" to={savedSearchUrl(item.filters)}>{isBengali?'আবার খুঁজুন':'Search again'}</Link><button className="mb-btn-secondary !text-xs" disabled={remove.isPending} onClick={()=>remove.mutate(item._id)}>{isBengali?'সরান':'Remove'}</button></div></article>)}</div>;
}
