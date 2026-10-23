import {useState,type ReactNode} from 'react';
import {Link,useLocation} from 'react-router';
import {toast} from 'sonner';
import {CompareContext,type CompareItem} from '../../context/CompareContext';
import {useAuth} from '../../context/useAuth';
import {useLanguage} from '../../i18n/LanguageContext';
function ScopedComparison({children}:{children:ReactNode}){
 const [items,setItems]=useState<CompareItem[]>([]);const {isBengali}=useLanguage();const location=useLocation();
 function toggle(item:CompareItem){if(items.some(i=>i.id===item.id)){setItems(items.filter(i=>i.id!==item.id));return;}if(items.length>=3){toast.info(isBengali?'সর্বোচ্চ ৩টি বায়োডাটা তুলনা করা যাবে।':'Compare up to 3 biodatas.');return;}setItems([...items,item]);}
 return <CompareContext.Provider value={{items,toggle,clear:()=>setItems([])}}>{children}{items.length>0 && !location.pathname.startsWith('/admin') && location.pathname!=='/compare' && <aside aria-label={isBengali?'তুলনার জন্য বাছাই':'Comparison selection'} className="fixed z-40 bottom-4 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:w-[min(650px,90vw)] bg-card border border-brand/40 rounded-2xl shadow-xl p-4"><div className="flex flex-wrap items-center gap-3"><strong className="text-sm">{isBengali?'তুলনা':'Compare'} ({items.length}/3)</strong>{items.map(i=><button key={i.id} className="text-xs border border-line rounded-lg px-2 py-1 max-w-36 truncate" onClick={()=>toggle(i)} title={isBengali?'বাছাই থেকে সরান':'Remove selection'}>{i.label} ×</button>)}<button className="text-xs text-ink-3 underline" onClick={()=>setItems([])}>{isBengali?'সব সরান':'Clear'}</button>{items.length>=2?<Link className="mb-btn-primary !text-xs ml-auto" to={'/compare?ids='+items.map(i=>encodeURIComponent(i.id)).join(',')}>{isBengali?'পাশাপাশি দেখুন':'Compare now'}</Link>:<span className="text-xs text-ink-3">{isBengali?'আরও ১টি বেছে নিন':'Select one more'}</span>}</div></aside>}</CompareContext.Provider>;
}
export default function CompareProvider({children}:{children:ReactNode}){const {user}=useAuth();return <ScopedComparison key={user?.id||user?._id||'guest'}>{children}</ScopedComparison>;}
