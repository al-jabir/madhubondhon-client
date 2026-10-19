import type { Profile } from '../../types';
import { getUpazilaDisplayName, type TangailUpazila } from '../../constants/locations';
import { useLanguage } from '../../i18n/LanguageContext';

const labelsBn: Record<string, string> = {
  never_married: 'অবিবাহিত',
  divorced: 'বিবাহবিচ্ছেদ হয়েছে',
  widowed: 'বিধবা / বিপত্নীক',
  separated: 'পৃথক বসবাস',
  ssc: 'এসএসসি',
  hsc: 'এইচএসসি',
  diploma: 'ডিপ্লোমা',
  bachelors: 'স্নাতক / অনার্স',
  masters: 'স্নাতকোত্তর',
  phd: 'পিএইচডি',
  islamic_education: 'ইসলামিক শিক্ষা',
  other: 'অন্যান্য',
  islam: 'ইসলাম',
  practicing: 'নিয়মিত অনুশীলনকারী',
  moderate: 'মধ্যম',
  very_practicing: 'অত্যন্ত নিয়মিত অনুশীলনকারী',
  not_practicing: 'অনুশীলন করেন না',
  joint: 'যৌথ পরিবার',
  nuclear: 'একক পরিবার',
  joint_family: 'যৌথ পরিবারে পরিবারের সাথে',
  separate_home: 'পৃথক বাসা / ফ্ল্যাট',
  flexible: 'পরিস্থিতি ও পারস্পরিক আলোচনা সাপেক্ষে',
  yes: 'হ্যাঁ',
  no: 'না',
  family_decision: 'স্বামী ও পরিবারের সিদ্ধান্ত অনুযায়ী',
  if_shariah_compliant: 'শরীয়তসম্মত ও পর্দার অনুকূল পরিবেশ পেলে',
  upper: 'উচ্চবিত্ত',
  upper_middle: 'উচ্চ মধ্যবিত্ত',
  middle: 'মধ্যবিত্ত',
  lower: 'নিম্নবিত্ত',
  fair: 'ফর্সা',
  light_brown: 'হালকা শ্যামলা',
  brown: 'বাদামি',
  dark: 'কৃষ্ণবর্ণ',
};

const labelsEn: Record<string, string> = {
  never_married: 'Never Married',
  divorced: 'Divorced',
  widowed: 'Widowed',
  separated: 'Separated',
  ssc: 'SSC / Secondary',
  hsc: 'HSC / Higher Secondary',
  diploma: 'Diploma',
  bachelors: "Bachelor's / Honours",
  masters: "Master's",
  phd: 'PhD / Doctorate',
  islamic_education: 'Islamic Education / Madrasa',
  other: 'Other',
  islam: 'Islam',
  practicing: 'Practicing',
  moderate: 'Moderate',
  very_practicing: 'Devout / Highly Practicing',
  not_practicing: 'Non-practicing',
  joint: 'Joint Family',
  nuclear: 'Nuclear Family',
  joint_family: 'With parents in a joint family',
  separate_home: 'Separate home / flat',
  flexible: 'Flexible / Mutual discussion',
  yes: 'Yes',
  no: 'No',
  family_decision: 'According to husband & family decision',
  if_shariah_compliant: 'If Shariah-compliant & respectful of purdah',
  upper: 'Upper Class',
  upper_middle: 'Upper Middle Class',
  middle: 'Middle Class',
  lower: 'Lower Class',
  fair: 'Fair',
  light_brown: 'Light Brown / Wheatish',
  brown: 'Brown',
  dark: 'Dark',
};

type Row = readonly [string, string | number | undefined];

function InfoTable({
  title,
  rows,
  notSpecifiedLabel,
}: {
  title: string;
  rows: Row[];
  notSpecifiedLabel: string;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--mb-shadow-card)]">
      <table className="w-full table-fixed border-collapse text-sm leading-7">
        <caption className="bg-brand-soft px-4 py-4 text-left text-base font-bold text-brand-ink sm:px-6 border-b border-brand/15">
          {title}
        </caption>
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label} className="border-t border-line even:bg-elev/40">
              <th
                scope="row"
                className="w-2/5 border-r border-line px-3 py-3 text-left align-top font-semibold text-ink-2 sm:w-1/3 sm:px-6"
              >
                {label}
              </th>
              <td className="whitespace-pre-wrap wrap-break-word px-3 py-3 align-top text-ink sm:px-6">
                {value === undefined || value === '' ? (
                  <span className="text-ink-3">{notSpecifiedLabel}</span>
                ) : (
                  value
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function BiodataInfoTables({ profile: p }: { profile: Profile }) {
  const { isBengali, formatNumber } = useLanguage();
  const labels = isBengali ? labelsBn : labelsEn;
  const notSpecified = isBengali ? 'উল্লেখ করা হয়নি' : 'Not specified';

  const text = (value?: string) => (value ? labels[value] || value : notSpecified);
  const yesNo = (value?: boolean) =>
    value === undefined ? notSpecified : value ? (isBengali ? 'হ্যাঁ' : 'Yes') : isBengali ? 'না' : 'No';
  const loc = (value?: string) => getUpazilaDisplayName(value as TangailUpazila, isBengali);
  const num = (value: number) => (isBengali ? formatNumber(value) : String(value));

  const formatMarital = (status?: string, gender?: string) => {
    if (!status) return notSpecified;
    if (status === 'widowed') {
      if (isBengali) {
        return gender === 'male' ? 'বিপত্নীক' : 'বিধবা';
      }
      return gender === 'male' ? 'Widower' : 'Widow';
    }
    return labels[status] || status;
  };

  const preferences = p.preferences;
  const min = preferences?.minAge;
  const max = preferences?.maxAge;
  const ageRange =
    min !== undefined && max !== undefined
      ? isBengali
        ? `${num(min)}–${num(max)} বছর`
        : `${min}–${max} years`
      : min !== undefined
      ? isBengali
        ? `অন্তত ${num(min)} বছর`
        : `At least ${min} years`
      : max !== undefined
      ? isBengali
        ? `সর্বোচ্চ ${num(max)} বছর`
        : `Up to ${max} years`
      : undefined;

  return (
    <div className="space-y-6">
      <InfoTable
        title={isBengali ? 'সাধারণ ও ব্যক্তিগত তথ্য' : 'General & Personal Information'}
        notSpecifiedLabel={notSpecified}
        rows={[
          [
            isBengali ? 'বায়োডাটার ধরন' : 'Biodata Type',
            p.gender === 'male'
              ? isBengali
                ? 'পাত্রের বায়োডাটা (বর)'
                : "Groom's Biodata"
              : isBengali
              ? 'পাত্রীর বায়োডাটা (কনে)'
              : "Bride's Biodata",
          ],
          [
            isBengali ? 'বয়স' : 'Age',
            p.age !== undefined ? (isBengali ? `${num(p.age)} বছর` : `${p.age} years`) : undefined,
          ],
          [isBengali ? 'বৈবাহিক অবস্থা' : 'Marital Status', formatMarital(p.maritalStatus, p.gender)],
          [isBengali ? 'উপজেলা' : 'Upazila', loc(p.upazila)],
          [isBengali ? 'জেলা' : 'District', isBengali ? 'টাঙ্গাইল' : 'Tangail'],
          [
            isBengali ? 'উচ্চতা' : 'Height',
            p.height?.feet
              ? isBengali
                ? `${num(p.height.feet)} ফুট ${num(p.height.inches ?? 0)} ইঞ্চি`
                : `${p.height.feet} ft ${p.height.inches ?? 0} in`
              : undefined,
          ],
          [
            isBengali ? 'ওজন' : 'Weight',
            p.weight !== undefined ? (isBengali ? `${num(p.weight)} কেজি` : `${p.weight} kg`) : undefined,
          ],
          [isBengali ? 'গায়ের রং' : 'Skin Tone', text(p.skinTone)],
        ]}
      />

      <InfoTable
        title={isBengali ? 'শিক্ষা ও পেশা' : 'Education & Profession'}
        notSpecifiedLabel={notSpecified}
        rows={[
          [isBengali ? 'শিক্ষাগত যোগ্যতা' : 'Educational Qualification', text(p.education)],
          [isBengali ? 'শিক্ষার বিস্তারিত' : 'Education Details', p.educationDetail],
          [isBengali ? 'পেশা' : 'Occupation', p.occupation],
          ...(p.lifestyle?.monthlyIncome
            ? ([[isBengali ? 'মাসিক আয়' : 'Monthly Income', p.lifestyle.monthlyIncome]] as Row[])
            : []),
        ]}
      />

      <InfoTable
        title={isBengali ? 'ধর্মীয় তথ্য ও জীবনযাপন' : 'Religious Practice & Lifestyle'}
        notSpecifiedLabel={notSpecified}
        rows={[
          [isBengali ? 'ধর্ম' : 'Religion', text(p.religiousInfo?.religion)],
          [isBengali ? 'ধর্মীয় অনুশীলন' : 'Religiousness', text(p.religiousInfo?.religiousness)],
          [isBengali ? 'পাঁচ ওয়াক্ত নামাজ পড়েন' : 'Prays 5 times daily', yesNo(p.religiousInfo?.praysFiveTimes)],
          [isBengali ? 'কুরআন তিলাওয়াত করতে পারেন' : 'Can recite Quran', yesNo(p.religiousInfo?.canReciteQuran)],
          ...(p.gender === 'male'
            ? ([
                [isBengali ? 'সুন্নতি দাড়ি রয়েছে' : 'Has Sunnah Beard', yesNo(p.religiousInfo?.hasBeard)],
                [
                  isBengali ? 'টাখনুর উপরে পোশাক পরিধান করেন' : 'Wears clothes above ankles',
                  yesNo(p.religiousInfo?.clothesAboveAnkle),
                ],
                [
                  isBengali ? 'বিয়ের পর স্ত্রীকে পর্দায় রাখবেন' : 'Will encourage wife in Purdah',
                  yesNo(p.lifestyle?.willKeepWifeInPurdah),
                ],
                [
                  isBengali ? 'বিয়ের পর থাকার ব্যবস্থা' : 'Post-marriage living arrangement',
                  text(p.lifestyle?.livingArrangement),
                ],
                [isBengali ? 'ধূমপান করেন' : 'Smokes', yesNo(p.lifestyle?.smoking)],
              ] as Row[])
            : ([
                [
                  isBengali ? 'হিজাব বা শালীন পোশাক পরিধান করেন' : 'Wears Hijab / modest dress',
                  yesNo(p.religiousInfo?.wearsHijab),
                ],
                [
                  isBengali ? 'নিকাব সহকারে পূর্ণাঙ্গ পর্দা করেন' : 'Wears Niqab / complete purdah',
                  yesNo(p.religiousInfo?.wearsNiqab),
                ],
                [
                  isBengali ? 'মাহরাম বিধান মেনে চলেন' : 'Observes Mahram rules',
                  yesNo(p.religiousInfo?.maintainsMahram),
                ],
                [isBengali ? 'রান্নাবান্না ও গৃহস্থালি কাজ পারেন' : 'Skilled in cooking', yesNo(p.lifestyle?.canCook)],
                [
                  isBengali ? 'বিয়ের পর পড়াশোনা চালিয়ে যেতে চান' : 'Wishes to study after marriage',
                  typeof p.lifestyle?.studyAfterMarriage === 'boolean'
                    ? yesNo(p.lifestyle.studyAfterMarriage)
                    : text(p.lifestyle?.studyAfterMarriage),
                ],
                [
                  isBengali ? 'বিয়ের পর চাকরি বা কাজ করতে চান' : 'Wishes to work after marriage',
                  typeof p.lifestyle?.jobAfterMarriage === 'boolean'
                    ? yesNo(p.lifestyle.jobAfterMarriage)
                    : text(p.lifestyle?.jobAfterMarriage),
                ],
              ] as Row[])),
          [isBengali ? 'খাদ্যাভ্যাস' : 'Dietary Habits', p.lifestyle?.diet],
        ]}
      />

      <InfoTable
        title={isBengali ? 'পারিবারিক তথ্য' : 'Family Information'}
        notSpecifiedLabel={notSpecified}
        rows={[
          [isBengali ? 'পিতার পেশা' : "Father's Occupation", p.familyInfo?.fatherOccupation],
          [isBengali ? 'মাতার পেশা' : "Mother's Occupation", p.familyInfo?.motherOccupation],
          [
            isBengali ? 'ভাই-বোনের সংখ্যা' : 'Number of Siblings',
            p.familyInfo?.siblings !== undefined
              ? isBengali
                ? `${num(p.familyInfo.siblings)} জন`
                : `${p.familyInfo.siblings}`
              : undefined,
          ],
          [isBengali ? 'পরিবারের ধরন' : 'Family Type', text(p.familyInfo?.familyType)],
          [isBengali ? 'আর্থিক অবস্থা' : 'Financial Status', text(p.familyInfo?.financialStatus)],
        ]}
      />

      <InfoTable
        title={isBengali ? 'নিজের সম্পর্কে' : 'About Myself'}
        notSpecifiedLabel={notSpecified}
        rows={[[isBengali ? 'পরিচিতি ও আগ্রহ' : 'Introduction & Bio', p.bio]]}
      />

      <InfoTable
        title={
          p.gender === 'male'
            ? isBengali
              ? 'প্রত্যাশিত জীবনসঙ্গিনী (পাত্রী)'
              : 'Expected Partner (Bride)'
            : isBengali
            ? 'প্রত্যাশিত জীবনসঙ্গী (পাত্র)'
            : 'Expected Partner (Groom)'
        }
        notSpecifiedLabel={notSpecified}
        rows={[
          [isBengali ? 'প্রত্যাশিত বয়স' : 'Expected Age', ageRange],
          [isBengali ? 'পছন্দের উপজেলা' : 'Preferred Upazilas', preferences?.preferredUpazilas?.map(loc).join(', ')],
          [
            isBengali ? 'শিক্ষাগত যোগ্যতা' : 'Preferred Education',
            preferences?.preferredEducation?.map(text).join(', '),
          ],
          [
            isBengali ? 'বৈবাহিক অবস্থা' : 'Preferred Marital Status',
            preferences?.preferredMaritalStatus
              ?.map((s) =>
                s === 'widowed'
                  ? isBengali
                    ? p.gender === 'male'
                      ? 'বিধবা'
                      : 'বিপত্নীক'
                    : p.gender === 'male'
                    ? 'Widow'
                    : 'Widower'
                  : text(s),
              )
              .join(', '),
          ],
        ]}
      />
    </div>
  );
}
