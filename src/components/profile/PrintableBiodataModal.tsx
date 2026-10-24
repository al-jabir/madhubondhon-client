import React from 'react';
import {
  Printer,
  X,
  Heart,
  CheckCircle2,
  MapPin,
  GraduationCap,
  Briefcase,
  Users,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { Profile } from '../../types';
import { getUpazilaDisplayName } from '../../constants/locations';
import { useLanguage } from '../../i18n/LanguageContext';

interface PrintableBiodataModalProps {
  profile: Profile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableBiodataModal: React.FC<PrintableBiodataModalProps> = ({
  profile,
  isOpen,
  onClose,
}) => {
  const { isBengali, formatNumber } = useLanguage();

  if (!isOpen || !profile) return null;

  const isMale = profile.gender === 'male';
  const upazilaName = getUpazilaDisplayName(profile.upazila, isBengali);
  const currentUpazilaName = profile.currentUpazila
    ? getUpazilaDisplayName(profile.currentUpazila, isBengali)
    : upazilaName;

  const handlePrint = () => {
    window.print();
  };

  const getMaritalStatusLabel = (status: string) => {
    switch (status) {
      case 'never_married':
        return isBengali ? 'অবিবাহিত' : 'Never Married';
      case 'divorced':
        return isBengali ? 'ডিভোর্সড' : 'Divorced';
      case 'widowed':
        return isBengali ? 'বিধবা / বিপত্নীক' : 'Widowed';
      case 'separated':
        return isBengali ? 'পৃথক বসবাসরত' : 'Separated';
      default:
        return status;
    }
  };

  const getEducationLabel = (edu?: string) => {
    switch (edu) {
      case 'ssc':
        return isBengali ? 'এসএসসি / সমমান' : 'SSC / Equivalent';
      case 'hsc':
        return isBengali ? 'এইচএসসি / আলিম' : 'HSC / Alim';
      case 'diploma':
        return isBengali ? 'ডিপ্লোমা' : 'Diploma';
      case 'bachelors':
        return isBengali ? 'স্নাতক / অনার্স / ফাজিল' : 'Bachelors / Honors';
      case 'masters':
        return isBengali ? 'মাস্টার্স / কামিল' : 'Masters / Kamil';
      case 'islamic_education':
        return isBengali ? 'কওমি মাদ্রাসা (দাওরায়ে হাদিস)' : 'Qawmi Madrasah (Dawra)';
      case 'other':
        return isBengali ? 'অন্যান্য' : 'Other';
      default:
        return edu || '—';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div className="bg-card border border-line rounded-3xl w-full max-w-4xl my-4 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:m-0">
        {/* Top Floating Action Bar (Hidden on print) */}
        <div className="flex items-center justify-between p-4 border-b border-line bg-elev print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-ink">
                {isBengali ? 'প্রিন্ট ও PDF সংরক্ষণ প্রিভিউ' : 'Print & PDF Preview'}
              </h3>
              <p className="text-[11px] text-ink-3">
                {isBengali
                  ? 'পারিবারিক আলোচনার জন্য সুন্দর A4 পাতায় প্রিন্ট বা সেভ করুন'
                  : 'Ready for A4 printing and saving as physical family document'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{isBengali ? 'প্রিন্ট / PDF সেভ করুন' : 'Print / Save as PDF'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-ink-3 hover:text-ink hover:bg-muted cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div
          id="printable-biodata-document"
          className="p-6 sm:p-10 overflow-y-auto space-y-6 text-ink bg-white text-gray-900 print:p-0 print:overflow-visible print:bg-white print:text-black"
        >
          {/* Islamic Header & Watermark */}
          <div className="text-center space-y-1.5 border-b-2 border-rose-900/20 pb-4">
            <p className="font-serif text-sm tracking-wider text-rose-800">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-rose-600 text-white flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 fill-current" />
              </span>
              <h1 className="text-2xl font-black text-rose-950 tracking-tight">
                {isBengali ? 'মধুবন্ধন বৈবাহিক বায়োডাটা' : 'MadhuBondhon Matrimonial Biodata'}
              </h1>
            </div>
            <p className="text-xs text-gray-600">
              {isBengali
                ? 'টাঙ্গাইল জেলা ও প্রবাসীদের জন্য শরীয়াহ সম্মত পারিবারিক বৈবাহিক প্ল্যাটফর্ম'
                : 'Shariah-compliant family matrimonial platform for Tangail'}
            </p>

            <div className="flex items-center justify-center gap-4 text-[11px] font-mono text-gray-700 pt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold border border-rose-300">
                {isBengali ? 'বায়োডাটা কোড:' : 'Biodata ID:'}{' '}
                {profile.biodataId || (isBengali ? 'যাচাইকৃত' : 'VERIFIED')}
              </span>
              <span>
                {isBengali ? 'তারিখ:' : 'Date:'}{' '}
                {new Date().toLocaleDateString(isBengali ? 'bn-BD' : 'en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Section 1: Basic Identity */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2 border-b border-rose-200 pb-1.5">
              <Users className="w-4 h-4 text-rose-700" />
              <span>
                {isBengali
                  ? isMale ? 'পাত্রের ব্যক্তিগত পরিচয়' : 'পাত্রীর ব্যক্তিগত পরিচয়'
                  : isMale ? "Groom's Personal Identity" : "Bride's Personal Identity"}
              </span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'নাম' : 'Name'}</span>
                <strong className="text-gray-900 text-sm">{profile.displayName}</strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'বায়োডাটার ধরন' : 'Category'}</span>
                <strong className="text-gray-900 text-sm">
                  {isMale ? (isBengali ? 'পাত্রের বায়োডাটা' : 'Groom') : (isBengali ? 'পাত্রীর বায়োডাটা' : 'Bride')}
                </strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'বয়স' : 'Age'}</span>
                <strong className="text-gray-900 text-sm">
                  {profile.age ? `${formatNumber(profile.age)} ${isBengali ? 'বছর' : 'years'}` : '—'}
                </strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'বৈবাহিক অবস্থা' : 'Marital Status'}</span>
                <strong className="text-gray-900 text-sm">{getMaritalStatusLabel(profile.maritalStatus)}</strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'উচ্চতা' : 'Height'}</span>
                <strong className="text-gray-900 text-sm">
                  {profile.height
                    ? `${formatNumber(profile.height.feet)} ${isBengali ? 'ফুট' : 'ft'} ${formatNumber(profile.height.inches)} ${isBengali ? 'ইঞ্চি' : 'in'}`
                    : '—'}
                </strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'ওজন' : 'Weight'}</span>
                <strong className="text-gray-900 text-sm">
                  {profile.weight ? `${formatNumber(profile.weight)} ${isBengali ? 'কেজি' : 'kg'}` : '—'}
                </strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'গায়ের রং' : 'Complexion'}</span>
                <strong className="text-gray-900 text-sm">{profile.skinTone || (isBengali ? 'উজ্জ্বল' : 'Fair')}</strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'স্থায়ী ঠিকানা' : 'Permanent Upazila'}</span>
                <strong className="text-gray-900 text-sm">{upazilaName}, {isBengali ? 'টাঙ্গাইল' : 'Tangail'}</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Education & Occupation */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2 border-b border-rose-200 pb-1.5">
              <GraduationCap className="w-4 h-4 text-rose-700" />
              <span>{isBengali ? 'শিক্ষাগত যোগ্যতা ও পেশাগত বিবরণ' : 'Education & Career Details'}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg space-y-1">
                <span className="text-gray-500 text-[11px] block">{isBengali ? 'সর্বোচ্চ শিক্ষাগত স্তর:' : 'Education Level:'}</span>
                <p className="font-bold text-gray-900">{getEducationLabel(profile.education)}</p>
                {profile.educationDetail && (
                  <p className="text-gray-700 text-[11px] mt-1 italic">
                    {profile.educationDetail}
                  </p>
                )}
              </div>

              <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg space-y-1">
                <span className="text-gray-500 text-[11px] block">{isBengali ? 'বর্তমান পেশা ও কর্মক্ষেত্র:' : 'Occupation:'}</span>
                <p className="font-bold text-gray-900">{profile.occupation || (isBengali ? 'উল্লেখ নেই' : 'Not specified')}</p>
                {profile.lifestyle?.monthlyIncome && (
                  <p className="text-gray-700 text-[11px]">
                    {isBengali ? 'মাসিক আয়:' : 'Monthly Income:'} {profile.lifestyle.monthlyIncome}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Family Information */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2 border-b border-rose-200 pb-1.5">
              <Users className="w-4 h-4 text-rose-700" />
              <span>{isBengali ? 'পারিবারিক তথ্য' : 'Family Background'}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'পিতার পেশা' : "Father's Profession"}</span>
                <strong className="text-gray-900 text-sm">
                  {profile.familyInfo?.fatherOccupation || (isBengali ? 'ব্যবসায়ী / অবসরপ্রাপ্ত' : 'Businessman / Retired')}
                </strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'মাতার পেশা' : "Mother's Profession"}</span>
                <strong className="text-gray-900 text-sm">
                  {profile.familyInfo?.motherOccupation || (isBengali ? 'গৃহিণী' : 'Homemaker')}
                </strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'ভাই-বোন' : 'Siblings'}</span>
                <strong className="text-gray-900 text-sm">
                  {profile.familyInfo?.siblings !== undefined ? `${formatNumber(profile.familyInfo.siblings)} ${isBengali ? 'জন' : ''}` : '—'}
                </strong>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-2.5 rounded-lg">
                <span className="text-gray-500 block text-[11px]">{isBengali ? 'অর্থনৈতিক অবস্থা' : 'Financial Class'}</span>
                <strong className="text-gray-900 text-sm">
                  {profile.familyInfo?.financialStatus || (isBengali ? 'মধ্যবিত্ত' : 'Middle Class')}
                </strong>
              </div>
            </div>
          </div>

          {/* Section 4: Religious & Islamic Practice */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center gap-2 border-b border-rose-200 pb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{isBengali ? 'দ্বীনি ও ইসলামিক জীবনধারা' : 'Religious & Islamic Lifestyle'}</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isBengali ? '৫ ওয়াক্ত নামাজ আদায়' : '5 Times Prayer'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isBengali ? 'সহীহ কুরআন তিলাওয়াত' : 'Quran Recitation'}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {isMale
                    ? isBengali ? 'সুন্নত দাড়ি রয়েছে' : 'Sunnah Beard'
                    : isBengali ? 'শরয়ী পর্দা / হিজাব' : 'Wears Hijab / Purdah'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isBengali ? 'মাহরাম রক্ষা করেন' : 'Maintains Mahram'}</span>
              </div>
            </div>
          </div>

          {/* Section 5: Expectations & Bio */}
          {profile.bio && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-rose-900 uppercase tracking-wider border-b border-rose-200 pb-1.5">
                {isBengali ? 'নিজের সম্পর্কে ও জীবনসঙ্গী প্রত্যাশা' : 'Candidate Bio & Partner Expectations'}
              </h2>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs leading-relaxed text-gray-800 whitespace-pre-wrap">
                {profile.bio}
              </div>
            </div>
          )}

          {/* Verification & Official Notice */}
          <div className="border-t-2 border-dashed border-gray-300 pt-4 text-[10px] text-gray-600 space-y-1">
            <p className="font-bold text-gray-800">
              {isBengali ? 'পারিবারিক সতর্কবার্তা ও দিকনির্দেশনা:' : 'Official Safety Notice for Families:'}
            </p>
            <p>
              {isBengali
                ? '১. মধুবন্ধন কোনো ঘটক বা ঘটকালি প্রতিষ্ঠান নয়। এটি টাঙ্গাইলবাসীর জন্য সরাসরি পারিবারিক উদ্যোগে পাত্র-পাত্রী খোঁজার উন্মুক্ত মাধ্যম।'
                : '1. MadhuBondhon is not an agency. It is a direct family-initiated matrimonial platform for Tangail.'}
            </p>
            <p>
              {isBengali
                ? '২. কোনো আর্থিক লেনদেন করবেন না। বিবাহের প্রাথমিক আলোচনা ও সিদ্ধান্ত নেওয়ার আগে উভয় পরিবারের অভিভাবকগণ স্বশরীরে সাক্ষাৎ করে সমস্ত তথ্য সরাসরি যাচাই করুন।'
                : '2. Do not engage in financial transactions. Guardians must verify all credentials directly in person prior to marriage.'}
            </p>
            <div className="flex items-center justify-between pt-3 text-gray-500 text-[10px]">
              <span>www.madhubondhon.com</span>
              <span>{isBengali ? 'টাঙ্গাইল জেলা, বাংলাদেশ' : 'Tangail District, Bangladesh'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintableBiodataModal;
