import { useSearchParams } from 'react-router';
import { multiSearchFields, searchFilterKeys } from '../../constants/search';
import { discoveryOptions } from '../../constants/discovery';
import { getUpazilaDisplayName } from '../../constants/locations';
import { useLanguage } from '../../i18n/LanguageContext';
const labels:Record<string,[string,string]>={query:['খোঁজ','Keyword'],biodataId:['কোড','Code'],upazila:['স্থায়ী উপজেলা','Permanent upazila'],currentUpazila:['বর্তমান উপজেলা','Current upazila'],minAge:['সর্বনিম্ন বয়স','Min age'],maxAge:['সর্বোচ্চ বয়স','Max age'],minHeight:['সর্বনিম্ন উচ্চতা (সেমি)','Min height (cm)'],maxHeight:['সর্বোচ্চ উচ্চতা (সেমি)','Max height (cm)'],gender:['আমি খুঁজছি','Looking for'],education:['শিক্ষা','Education'],maritalStatus:['বৈবাহিক অবস্থা','Marital status'],occupation:['পেশা','Occupation'],verifiedOnly:['প্রকাশিত','Published']};
const educationLabels:Record<string,[string,string]>={ssc:['এসএসসি','SSC'],hsc:['এইচএসসি','HSC'],diploma:['ডিপ্লোমা','Diploma'],bachelors:['স্নাতক','Bachelors'],masters:['স্নাতকোত্তর','Masters'],phd:['পিএইচডি','PhD'],islamic_education:['ইসলামিক শিক্ষা','Islamic education'],other:['অন্যান্য','Other']};
export default function AppliedSearchFilters(){
 const [params,setParams]=useSearchParams();const {isBengali,formatNumber}=useLanguage();const index=isBengali?0:1;
 const active=searchFilterKeys.filter(k=>params.get(k));
 if(!active.length)return null;
 function remove(key:string,value:string){const next=new URLSearchParams(params);const remaining=next.get(key)!.split(',').filter(v=>v!==value);if(remaining.length)next.set(key,remaining.join(','));else next.delete(key);next.delete('page');setParams(next);}
 return <div className="mb-card p-3 flex flex-wrap gap-2" aria-label={isBengali?'নির্বাচিত ফিল্টার':'Applied filters'}>{active.flatMap(key=>(params.get(key)||'').split(',').map(value=>{
  const field=multiSearchFields.find(f=>f.key===key);const option=field?.options.find(o=>o[0]===value);
  let display=option?.[isBengali?1:2]||value;
  if(key.toLowerCase().includes('upazila'))display=getUpazilaDisplayName(value,isBengali);
  if(key==='gender')display=value==='male'?(isBengali?'পাত্র':'Groom'):(isBengali?'পাত্রী':'Bride');
  if(key==='education')display=educationLabels[value]?.[index]||value;
  if(key==='maritalStatus')display=discoveryOptions.maritalStatus.find(o=>o[0]===value)?.[isBengali?1:2]||value;
  if(key==='verifiedOnly')display=value==='true'?(isBengali?'হ্যাঁ':'Yes'):(isBengali?'না':'No');
  if(['minAge','maxAge','minHeight','maxHeight'].includes(key))display=formatNumber(Number(value));
  const label=field?(isBengali?field.bn:field.en):labels[key]?.[index]||key;
  return <button key={key+value} type="button" className="mb-badge cursor-pointer !text-xs" onClick={()=>remove(key,value)} aria-label={(isBengali?'সরান: ':'Remove: ')+display}>{label}: {display} ×</button>;
 }))}<button type="button" className="text-xs text-brand underline" onClick={()=>setParams(new URLSearchParams())}>{isBengali?'সব মুছুন':'Clear all'}</button></div>;
}
