import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../../context/useAuth';
import { useLanguage } from '../../i18n/LanguageContext';
import { discoveryApi } from '../../api/discovery.api';
import { getApiErrorMessage } from '../../api/errors';
import { searchFilterKeys as keys } from '../../constants/search';
export default function SaveSearchControl(){
 const {isAuthenticated}=useAuth();const {isBengali}=useLanguage();const [params]=useSearchParams();const [name,setName]=useState('');const cache=useQueryClient();
 const save=useMutation({mutationFn:()=>discoveryApi.saveSearch(name.trim(),Object.fromEntries(keys.filter(k=>params.has(k)&&params.get(k)!=='').map(k=>[k,params.get(k)!]))),onSuccess:()=>{setName('');cache.invalidateQueries({queryKey:['saved-searches']});toast.success(isBengali?'পছন্দ সংরক্ষণ হয়েছে।':'Search saved.');},onError:e=>toast.error(getApiErrorMessage(e,'Search could not be saved.'))});
 if(!isAuthenticated)return <p className="text-xs text-ink-3"><Link className="text-brand underline" to="/login">{isBengali?'লগইন করুন':'Sign in'}</Link>{isBengali?'—এই পছন্দ সংরক্ষণ করে পরে আবার খুঁজতে পারবেন।':' to save your search and use it again.'}</p>;
 return <div className="mb-card p-4 flex flex-wrap gap-3 justify-between items-start"><details><summary className="cursor-pointer text-sm font-semibold text-brand">{isBengali?'এই search সংরক্ষণ করুন':'Save this search'}</summary><form className="flex flex-wrap gap-2 mt-3" onSubmit={e=>{e.preventDefault();if(name.trim())save.mutate();}}><label className="text-xs text-ink-2">{isBengali?'পরে চেনার জন্য একটি নাম দিন':'Give it a name'}<input required maxLength={60} value={name} onChange={e=>setName(e.target.value)} className="mb-input mt-1" placeholder={isBengali?'যেমন: টাঙ্গাইলের পাত্র':'e.g. Groom in Tangail'} /></label><button className="mb-btn-primary self-end" disabled={save.isPending||!name.trim()}>{isBengali?'সংরক্ষণ':'Save'}</button></form><p className="text-xs text-ink-3 mt-2">{isBengali?'শেষবার প্রয়োগ করা পছন্দ সংরক্ষিত হবে। সর্বোচ্চ ২০টি।':'Saves the last applied filters. Up to 20 searches.'}</p></details><Link className="text-sm text-brand underline" to="/saved-searches">{isBengali?'আমার সংরক্ষিত search':'My saved searches'}</Link></div>;
}
