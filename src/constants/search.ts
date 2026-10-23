import { discoveryOptions } from './discovery';
export const multiSearchFields = [
 {key:'maritalStatuses', profile:'maritalStatus', options:discoveryOptions.maritalStatus, bn:'বৈবাহিক অবস্থা', en:'Marital status'},
 {key:'occupations', profile:'occupationCategory', options:discoveryOptions.occupationCategory, bn:'পেশার ধরন', en:'Occupation category'},
 {key:'educationMedia', profile:'educationMedium', options:discoveryOptions.educationMedium, bn:'শিক্ষার মাধ্যম', en:'Education medium'},
 {key:'qualifications', profile:'religiousQualifications', options:discoveryOptions.religiousQualifications, bn:'দ্বীনি যোগ্যতা', en:'Religious qualifications'},
 {key:'fiqhs', profile:'fiqh', options:discoveryOptions.fiqh, bn:'ফিকহ অনুসরণ', en:'Fiqh'},
 {key:'skinTones', profile:'skinTone', options:discoveryOptions.skinTone, bn:'গাত্রবর্ণ', en:'Skin tone'},
 {key:'financialStatuses', profile:'familyInfo.financialStatus', options:discoveryOptions.financialStatus, bn:'অর্থনৈতিক অবস্থা', en:'Financial status'},
 {key:'categories', profile:'specialCategories', options:discoveryOptions.specialCategories, bn:'বিশেষ ক্যাটাগরি', en:'Special categories'},
] as const;
export type MultiSearchKey = typeof multiSearchFields[number]['key'];
export type MultiSearchValues = Partial<Record<MultiSearchKey,string>>;
export const searchFilterKeys = ['gender','minAge','maxAge','upazila','currentUpazila','education','maritalStatus','occupation','biodataId','query','minHeight','maxHeight','verifiedOnly',...multiSearchFields.map(f=>f.key)];
