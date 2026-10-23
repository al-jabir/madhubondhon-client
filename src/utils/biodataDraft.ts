import type {DraftData, Guardian} from '../api/workflow.api';
export function cleanDraft(value:unknown):unknown {
 if(Array.isArray(value))return value.map(cleanDraft);
 if(value && typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([,v])=>v!=='' && v!==undefined && v!==null).map(([k,v])=>[k,cleanDraft(v)]));
 return value;
}
export function normalizeDraft(data:DraftData):DraftData {
 const lifestyle=data.lifestyle ? {...data.lifestyle} : undefined;
 if(lifestyle){for(const key of ['studyAfterMarriage','jobAfterMarriage'] as const){if(typeof lifestyle[key]==='boolean')lifestyle[key]=lifestyle[key]?'yes':'no';}}
 return {...data,...(lifestyle?{lifestyle}:{})};
}
export function draftErrors(data:DraftData,guardian:Partial<Guardian>,bn:boolean,complete=false):string[] {
 const errors:string[]=[];const add=(b:string,e:string)=>errors.push(bn?b:e);
 const limits:[string|undefined,number,string,string][]=[[data.displayName,50,'নাম','Name'],[data.educationDetail,200,'শিক্ষার বিবরণ','Education details'],[data.occupation,100,'পেশা','Occupation'],[data.bio,1000,'নিজের পরিচিতি','Bio']];
 for(const [value,max,b,e] of limits)if(value && value.trim().length>max)add(b+' সর্বোচ্চ '+max+' অক্ষরের হতে পারে।',e+' must be at most '+max+' characters.');
 if(data.displayName && data.displayName.trim().length<2)add('নাম কমপক্ষে ২ অক্ষরের হতে হবে।','Name must have at least 2 characters.');
 if(data.dateOfBirth){const dob=new Date(data.dateOfBirth);const now=new Date();let age=now.getFullYear()-dob.getFullYear();if(now.getMonth()<dob.getMonth() || (now.getMonth()===dob.getMonth() && now.getDate()<dob.getDate()))age--;if(!/^\d{4}-\d{2}-\d{2}$/.test(data.dateOfBirth) || isNaN(dob.getTime()) || dob.toISOString().slice(0,10)!==data.dateOfBirth || age<18)add('সঠিক জন্ম তারিখ দিন; বয়স কমপক্ষে ১৮ হতে হবে।','Enter a valid birth date; age must be at least 18.');}
 const numbers:[number|undefined,number,number,boolean,string,string][]=[[data.height?.feet,3,8,true,'উচ্চতার ফুট','Height feet'],[data.height?.inches,0,11,true,'উচ্চতার ইঞ্চি','Height inches'],[data.weight,20,300,false,'ওজন','Weight'],[data.familyInfo?.siblings,0,20,true,'ভাইবোনের সংখ্যা','Sibling count'],[data.preferences?.minAge,18,80,true,'সঙ্গীর সর্বনিম্ন বয়স','Partner minimum age'],[data.preferences?.maxAge,18,80,true,'সঙ্গীর সর্বোচ্চ বয়স','Partner maximum age']];
 for(const [value,min,max,integer,b,e] of numbers)if(value!==undefined && (!Number.isFinite(value)||value<min||value>max||(integer&&!Number.isInteger(value))))add(b+' '+min+'–'+max+' এর মধ্যে '+(integer?'পূর্ণসংখ্যা ':'')+'হতে হবে।',e+' must be '+(integer?'a whole number ':'')+'between '+min+' and '+max+'.');
 if(data.preferences?.minAge!==undefined && data.preferences?.maxAge!==undefined && data.preferences.minAge>data.preferences.maxAge)add('সঙ্গীর সর্বোচ্চ বয়স সর্বনিম্ন বয়সের কম হতে পারে না।','Partner maximum age cannot be below minimum age.');
 if(complete){if(!data.displayName||!data.gender||!data.dateOfBirth||!data.upazila||!data.maritalStatus)add('প্রথম ধাপের নাম, ধরন, জন্ম তারিখ, স্থায়ী উপজেলা ও বৈবাহিক অবস্থা পূরণ করুন।','Complete name, type, birth date, permanent upazila and marital status in step 1.');
 const count=[data.displayName,data.dateOfBirth,data.gender,data.upazila,data.maritalStatus,data.education,data.occupation,data.bio,data.height?.feet].filter(Boolean).length;
 if(count<6)add('শিক্ষা, পেশা, পরিচিতি বা উচ্চতার অন্তত একটি পূরণ করুন।','Add at least one of education, occupation, bio or height.');
 if((guardian.name?.trim().length||0)<2 || (guardian.relationship?.trim().length||0)<2)add('অভিভাবকের সঠিক নাম ও সম্পর্ক দিন।','Enter guardian name and relationship.');
 const phone=guardian.phone?.replace(/[\s-]/g,'')||'';if(!/^(?:\+?88)?01[3-9]\d{8}$/.test(phone))add('অভিভাবকের সঠিক বাংলাদেশি মোবাইল নম্বর দিন।','Enter a valid Bangladeshi guardian mobile number.');
 if(guardian.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardian.email.trim()))add('অভিভাবকের ইমেইল ঠিকানা সঠিক নয়।','Guardian email address is invalid.');}
 return errors;
}
