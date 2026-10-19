import type { Profile } from '../../types';
import { UPAZILA_DISPLAY_NAMES, type TangailUpazila } from '../../constants/locations';

const labels: Record<string, string> = {
  never_married: 'অবিবাহিত', divorced: 'বিবাহবিচ্ছেদ হয়েছে', widowed: 'বিধবা / বিপত্নীক', separated: 'পৃথক বসবাস',
  ssc: 'এসএসসি', hsc: 'এইচএসসি', diploma: 'ডিপ্লোমা', bachelors: 'স্নাতক / অনার্স', masters: 'স্নাতকোত্তর', phd: 'পিএইচডি', islamic_education: 'ইসলামিক শিক্ষা', other: 'অন্যান্য',
  islam: 'ইসলাম', practicing: 'নিয়মিত অনুশীলনকারী', moderate: 'মধ্যম', very_practicing: 'অত্যন্ত নিয়মিত অনুশীলনকারী', not_practicing: 'অনুশীলন করেন না',
  joint: 'যৌথ পরিবার', nuclear: 'একক পরিবার', upper: 'উচ্চবিত্ত', upper_middle: 'উচ্চ মধ্যবিত্ত', middle: 'মধ্যবিত্ত', lower: 'নিম্নবিত্ত',
  fair: 'ফর্সা', light_brown: 'হালকা শ্যামলা', brown: 'বাদামি', dark: 'কৃষ্ণবর্ণ',
};
const text = (value?: string) => value ? labels[value] || value : 'উল্লেখ করা হয়নি';
const yesNo = (value?: boolean) => value === undefined ? 'উল্লেখ করা হয়নি' : value ? 'হ্যাঁ' : 'না';
const location = (value: string) => UPAZILA_DISPLAY_NAMES[value as TangailUpazila] || value;
const number = (value: number) => value.toLocaleString('bn-BD');
type Row = readonly [string, string | number | undefined];
function InfoTable({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--mb-shadow-card)]">
      <table className="w-full table-fixed border-collapse text-sm leading-7">
        <caption className="bg-brand-soft px-4 py-4 text-left text-base font-bold text-brand-ink sm:px-6 border-b border-brand/15">
          {title}
        </caption>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-t border-line even:bg-elev/40">
              <th scope="row" className="w-2/5 border-r border-line px-3 py-3 text-left align-top font-semibold text-ink-2 sm:w-1/3 sm:px-6">{label}</th>
              <td className="whitespace-pre-wrap wrap-break-word px-3 py-3 align-top text-ink sm:px-6">{value === undefined || value === '' ? <span className="text-ink-3">উল্লেখ করা হয়নি</span> : value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
export default function BiodataInfoTables({ profile: p }: { profile: Profile }) {
  const preferences = p.preferences;
  const min = preferences?.minAge;
  const max = preferences?.maxAge;
  const ageRange = min !== undefined && max !== undefined ? number(min) + '–' + number(max) + ' বছর' : min !== undefined ? 'অন্তত ' + number(min) + ' বছর' : max !== undefined ? 'সর্বোচ্চ ' + number(max) + ' বছর' : undefined;
  return (
    <div className="space-y-6">
      <InfoTable title="সাধারণ ও ব্যক্তিগত তথ্য" rows={[
        ['বায়োডাটার ধরন', p.gender === 'male' ? 'পাত্রের বায়োডাটা' : 'পাত্রীর বায়োডাটা'],
        ['বয়স', p.age !== undefined ? number(p.age) + ' বছর' : undefined],
        ['বৈবাহিক অবস্থা', text(p.maritalStatus)], ['উপজেলা', location(p.upazila)], ['জেলা', 'টাঙ্গাইল'],
        ['উচ্চতা', p.height?.feet ? number(p.height.feet) + ' ফুট ' + number(p.height.inches ?? 0) + ' ইঞ্চি' : undefined],
        ['ওজন', p.weight !== undefined ? number(p.weight) + ' কেজি' : undefined], ['গায়ের রং', text(p.skinTone)],
      ]} />
      <InfoTable title="শিক্ষা ও পেশা" rows={[
        ['শিক্ষাগত যোগ্যতা', text(p.education)], ['শিক্ষার বিস্তারিত', p.educationDetail], ['পেশা', p.occupation],
      ]} />
      <InfoTable title="ধর্মীয় তথ্য ও জীবনযাপন" rows={[
        ['ধর্ম', text(p.religiousInfo?.religion)], ['ধর্মীয় অনুশীলন', text(p.religiousInfo?.religiousness)],
        ['পাঁচ ওয়াক্ত নামাজ পড়েন', yesNo(p.religiousInfo?.praysFiveTimes)],
        ...(p.gender === 'female' ? [['হিজাব পরিধান করেন', yesNo(p.religiousInfo?.wearsHijab)] as Row] : []),
        ...(p.gender === 'male' ? [['ধূমপান করেন', yesNo(p.lifestyle?.smoking)] as Row] : []), ['খাদ্যাভ্যাস', p.lifestyle?.diet],
      ]} />
      <InfoTable title="পারিবারিক তথ্য" rows={[
        ['পিতার পেশা', p.familyInfo?.fatherOccupation], ['মাতার পেশা', p.familyInfo?.motherOccupation],
        ['ভাই-বোনের সংখ্যা', p.familyInfo?.siblings !== undefined ? number(p.familyInfo.siblings) + ' জন' : undefined],
        ['পরিবারের ধরন', text(p.familyInfo?.familyType)], ['আর্থিক অবস্থা', text(p.familyInfo?.financialStatus)],
      ]} />
      <InfoTable title="নিজের সম্পর্কে" rows={[
        ['পরিচিতি ও আগ্রহ', p.bio],
      ]} />
      <InfoTable title="প্রত্যাশিত জীবনসঙ্গী" rows={[
        ['প্রত্যাশিত বয়স', ageRange], ['পছন্দের উপজেলা', preferences?.preferredUpazilas?.map(location).join(', ')],
        ['শিক্ষাগত যোগ্যতা', preferences?.preferredEducation?.map(text).join(', ')],
        ['বৈবাহিক অবস্থা', preferences?.preferredMaritalStatus?.map(text).join(', ')],
      ]} />
    </div>
  );
}
