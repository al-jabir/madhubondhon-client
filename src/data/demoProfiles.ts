import { Gender, MaritalStatus, EducationLevel, ProfileVisibility } from '../types';
import type { Profile, ApiResponse } from '../types';
import type { SearchProfilesParams } from '../api/profiles.api';

const examples = [
  ['সাদিয়া রহমান', 'female', 'tangail_sadar', '1999-04-12', 'masters', 'শিক্ষিকা', 'বাংলা সাহিত্যে স্নাতকোত্তর'],
  ['রায়হান আহমেদ', 'male', 'madhupur', '1995-02-20', 'bachelors', 'সফটওয়্যার ইঞ্জিনিয়ার', 'কম্পিউটার বিজ্ঞানে স্নাতক'],
  ['নুসরাত জাহান', 'female', 'mirzapur', '2001-07-08', 'bachelors', 'গ্রাফিক ডিজাইনার', 'চারুকলায় স্নাতক'],
  ['তানভীর হাসান', 'male', 'ghatail', '1993-11-15', 'masters', 'ব্যাংক কর্মকর্তা', 'ব্যবসায় প্রশাসনে স্নাতকোত্তর'],
  ['ফারিহা আক্তার', 'female', 'kalihati', '1998-06-22', 'islamic_education', 'আরবি শিক্ষিকা', 'ইসলামিক স্টাডিজ'],
  ['মাহমুদুল ইসলাম', 'male', 'basail', '1997-09-03', 'diploma', 'সিভিল ইঞ্জিনিয়ার', 'সিভিল ইঞ্জিনিয়ারিং ডিপ্লোমা'],
  ['সুমাইয়া সুলতানা', 'female', 'sakhipur', '2000-01-18', 'bachelors', 'উদ্যোক্তা', 'ব্যবসায় শিক্ষায় স্নাতক'],
  ['আব্দুল্লাহ আল মামুন', 'male', 'gopalpur', '1994-05-26', 'masters', 'কলেজ শিক্ষক', 'গণিতে স্নাতকোত্তর'],
  ['মারিয়া তাসনিম', 'female', 'delduar', '1999-12-10', 'bachelors', 'পুষ্টিবিদ', 'খাদ্য ও পুষ্টিবিজ্ঞানে স্নাতক'],
  ['ইমরান হোসেন', 'male', 'nagarpur', '1996-08-14', 'bachelors', 'ব্যবসায়ী', 'হিসাববিজ্ঞানে স্নাতক'],
  ['আয়েশা সিদ্দিকা', 'female', 'dhanbari', '1998-03-04', 'masters', 'গবেষণা সহকারী', 'সমাজবিজ্ঞানে স্নাতকোত্তর'],
  ['সাইফুল ইসলাম', 'male', 'bhuapur', '1992-10-09', 'phd', 'গবেষক', 'পদার্থবিজ্ঞানে পিএইচডি'],
];

function ageOnToday(date: string) {
  const today = new Date();
  const dob = new Date(date);
  let age = today.getFullYear() - dob.getFullYear();
  if (today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())) age--;
  return age;
}

export const demoProfiles: Profile[] = examples.map(([name, gender, upazila, dob, education, occupation, detail], index) => ({
  _id: 'demo-profile-' + (index + 1), user: 'demo-user-' + (index + 1),
  biodataId: (gender === 'male' ? 'MB-M' : 'MB-F') + (100 + index + 1),
  displayName: name, gender: gender as Gender, upazila, dateOfBirth: dob,
  age: ageOnToday(dob), education: education as EducationLevel, educationDetail: detail, occupation,
  maritalStatus: index === 9 ? MaritalStatus.DIVORCED : MaritalStatus.NEVER_MARRIED,
  height: { feet: 5, inches: gender === Gender.MALE ? 8 : 3 },
  bio: 'পরিবার, পারস্পরিক সম্মান ও সুন্দর বোঝাপড়াকে গুরুত্ব দিই। টাঙ্গাইলের একজন দায়িত্বশীল জীবনসঙ্গী প্রত্যাশা করি।',
  religiousInfo: { religion: 'islam', praysFiveTimes: true, wearsHijab: gender === Gender.FEMALE, religiousness: 'practicing' },
  familyInfo: { fatherOccupation: 'অবসরপ্রাপ্ত শিক্ষক', motherOccupation: 'গৃহিণী', siblings: 2 },
  preferences: { minAge: gender === Gender.MALE ? 22 : 27, maxAge: gender === Gender.MALE ? 32 : 38, preferredUpazilas: [upazila, 'tangail_sadar'] },
  photos: [], visibility: ProfileVisibility.PUBLIC, isComplete: true,
  completionPercentage: 100, isApproved: true,
}));

export function searchDemoProfiles(params: SearchProfilesParams = {}): ApiResponse<{ profiles: Profile[] }> {
  const matches = demoProfiles.filter(p =>
    (!params.biodataId || (p.biodataId || '').toLocaleLowerCase().includes(params.biodataId.toLocaleLowerCase().trim())) &&
    (!params.query || (p.displayName + ' ' + (p.occupation || '') + ' ' + (p.biodataId || '')).toLocaleLowerCase().includes(params.query.toLocaleLowerCase().trim())) &&
    (!params.occupation || (p.occupation || '').toLocaleLowerCase().includes(params.occupation.toLocaleLowerCase())) &&
    (!params.gender || p.gender === params.gender) &&
    (!params.upazila || p.upazila === params.upazila) &&
    (!params.education || p.education === params.education) &&
    (!params.maritalStatus || p.maritalStatus === params.maritalStatus) &&
    (!params.minAge || (p.age ?? 0) >= params.minAge) &&
    (!params.maxAge || (p.age ?? 0) <= params.maxAge));
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 9);
  return { success: true, message: 'নমুনা বায়োডাটা', data: { profiles: matches.slice((page - 1) * limit, page * limit) }, meta: { page, limit, total: matches.length, totalPages: Math.ceil(matches.length / limit) } };
}

export function getDemoProfile(userId: string): ApiResponse<{ profile: Profile }> {
  const profile = demoProfiles.find(p => p.user === userId);
  if (!profile) throw new Error('নমুনা বায়োডাটা পাওয়া যায়নি');
  return { success: true, message: 'নমুনা বায়োডাটা', data: { profile } };
}
