import {Link,useSearchParams} from 'react-router';
import {useQueries} from '@tanstack/react-query';
import {profilesApi} from '../api/profiles.api';
import {useLanguage} from '../i18n/LanguageContext';
import {useAuth} from '../context/useAuth';
import {getUpazilaDisplayName} from '../constants/locations';
import type {Profile} from '../types';
const education:Record<string,string>={ssc:'এসএসসি',hsc:'এইচএসসি',diploma:'ডিপ্লোমা',bachelors:'স্নাতক',masters:'স্নাতকোত্তর',phd:'পিএইচডি',islamic_education:'ইসলামিক শিক্ষা',other:'অন্যান্য'};
const marital:Record<string,string>={never_married:'অবিবাহিত',divorced:'বিবাহবিচ্ছেদ হয়েছে',widowed:'বিধবা / বিপত্নীক',separated:'পৃথক বসবাস'};
export default function ComparePage(){
 const [params]=useSearchParams();const {isBengali,formatNumber}=useLanguage();const {user}=useAuth();const raw=(params.get('ids')||'').split(',').filter(Boolean);const ids=[...new Set(raw)];const valid=ids.length>=2&&ids.length<=3&&ids.every(id=>/^[a-zA-Z0-9-]{1,40}$/.test(id));
 const queries=useQueries({queries:(valid?ids:[]).map(id=>({queryKey:['comparison-profile',user?.id||user?._id||'guest',id],queryFn:()=>profilesApi.getPublicProfile(id),staleTime:0,refetchOnWindowFocus:true,retry:1}))});
 const rows:{label:string;value:(p:Profile)=>string|undefined}[]=[
  {label:isBengali?'পাত্র / পাত্রী':'Bride / Groom',value:p=>p.gender==='male'?(isBengali?'পাত্র':'Groom'):(isBengali?'পাত্রী':'Bride')},
  {label:isBengali?'বয়স':'Age',value:p=>p.age?formatNumber(p.age)+(isBengali?' বছর':' years'):undefined},
  {label:isBengali?'উপজেলা':'Upazila',value:p=>getUpazilaDisplayName(p.upazila,isBengali)},
  {label:isBengali?'বৈবাহিক অবস্থা':'Marital status',value:p=>isBengali?marital[p.maritalStatus]:p.maritalStatus.replaceAll('_',' ')},
  {label:isBengali?'শিক্ষা':'Education',value:p=>isBengali?education[p.education||'']:p.education?.replaceAll('_',' ')},
  {label:isBengali?'পেশা':'Occupation',value:p=>p.occupation},
  {label:isBengali?'উচ্চতা':'Height',value:p=>p.height?formatNumber(p.height.feet)+(isBengali?' ফুট ':' ft ')+formatNumber(p.height.inches)+(isBengali?' ইঞ্চি':' in'):undefined},
  {label:isBengali?'পরিচিতি':'About',value:p=>p.bio},
  {label:isBengali?'প্রত্যাশিত বয়স':'Preferred age',value:p=>p.preferences?.minAge&&p.preferences.maxAge?formatNumber(p.preferences.minAge)+'–'+formatNumber(p.preferences.maxAge):undefined},
 ];
 return <div className="max-w-6xl mx-auto px-4 py-10 space-y-5"><h1 className="text-2xl font-bold">{isBengali?'পাশাপাশি বায়োডাটা তুলনা':'Compare biodatas side by side'}</h1><p className="text-sm text-ink-2">{isBengali?'এটি তথ্য দেখার সুবিধা; কাউকে রেটিং দেওয়া হচ্ছে না। যোগাযোগের তথ্য এখানে প্রকাশ করা হয় না।':'Compare information without ranking people. Contact details are never displayed here.'}</p><Link className="mb-btn-secondary" to="/search">{isBengali?'বায়োডাটা খুঁজুন':'Find biodata'}</Link>{!valid?<p className="mb-card p-6">{isBengali?'ফলাফলের তালিকা থেকে ২–৩টি বায়োডাটা বেছে নিন।':'Select 2–3 biodatas from the search results.'}</p>:<div className="overflow-x-auto rounded-2xl border border-line"><table className="w-full min-w-[650px] table-fixed text-sm"><caption className="sr-only">{isBengali?'বায়োডাটার তথ্য পাশাপাশি':'Biodata comparison'}</caption><thead><tr><th className="w-36 bg-elev p-4 text-left">{isBengali?'তথ্য':'Information'}</th>{queries.map((q,i)=><th key={ids[i]} className="bg-elev p-4 text-left border-l border-line">{q.isPending?(isBengali?'লোড হচ্ছে…':'Loading…'):!q.isError&&q.data?.data?.profile?<Link className="text-brand underline" to={'/profiles/'+ids[i]}>{q.data.data.profile.biodataId||q.data.data.profile.displayName}</Link>:<span>{isBengali?'বর্তমানে দেখা যাচ্ছে না':'Currently unavailable'} <button className="underline text-brand" onClick={()=>q.refetch()}>{isBengali?'আবার চেষ্টা':'Retry'}</button></span>}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row.label} className="border-t border-line"><th scope="row" className="bg-elev p-4 text-left align-top font-semibold">{row.label}</th>{queries.map((q,i)=><td key={ids[i]} className="bg-card p-4 border-l border-line align-top break-words whitespace-pre-wrap">{!q.isError&&q.data?.data?.profile?row.value(q.data.data.profile)||(isBengali?'উল্লেখ নেই':'Not provided'):'—'}</td>)}</tr>)}</tbody></table></div>}</div>;
}
