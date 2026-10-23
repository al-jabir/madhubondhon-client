import React from 'react';
import { Printer, X, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Profile } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';
import { getUpazilaDisplayName } from '../../constants/locations';
import GenderAvatar from '../common/GenderAvatar';

interface PrintBiodataModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Partial<Profile>;
  guardian?: { name?: string; phone?: string; relationship?: string };
}

export const PrintBiodataModal: React.FC<PrintBiodataModalProps> = ({
  isOpen,
  onClose,
  profile,
  guardian,
}) => {
  const { isBengali, formatNumber } = useLanguage();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const p = profile;
  const isFemale = p.gender === 'female';
  const upazila = p.upazila ? getUpazilaDisplayName(p.upazila, isBengali) : 'টাঙ্গাইল';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-slate-900 rounded-3xl max-w-3xl w-full shadow-2xl p-6 sm:p-10 space-y-6 my-auto print:shadow-none print:p-6 print:max-w-none print:w-full print:border-none print:m-0">
        {/* Print controls (hidden in print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {isBengali ? 'প্রিন্ট ও PDF প্রিভিউ' : 'Print / PDF Preview'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>{isBengali ? 'প্রিন্ট / PDF সংরক্ষণ' : 'Print / Save PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="space-y-6 print:space-y-4">
          {/* Islamic Header */}
          <div className="text-center space-y-1.5 pb-4 border-b-2 border-emerald-800">
            <p className="font-serif text-sm font-semibold text-emerald-800 tracking-widest">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {isBengali ? 'মধুবন্ধন ইসলামিক বৈবাহিক বায়োডাটা' : 'MadhuBondhon Matrimonial Biodata'}
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              {isBengali ? 'টাঙ্গাইল জেলা · বিশ্বস্ত ও শালীন প্ল্যাটফর্ম' : 'Tangail District · Trusted Platform'}
            </p>
          </div>

          {/* Profile Overview Header Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div className="w-20 h-20 rounded-2xl border-2 border-emerald-700/30 overflow-hidden shrink-0 shadow-sm">
              <GenderAvatar gender={p.gender} size={80} className="w-full h-full" />
            </div>
            <div className="space-y-1.5 text-center sm:text-left min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-black text-slate-900">{p.displayName || 'নাম প্রকাশে অনিচ্ছুক'}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-700 text-white">
                  {isFemale ? (isBengali ? 'পাত্রীর বায়োডাটা' : 'Bride') : (isBengali ? 'পাত্রের বায়োডাটা' : 'Groom')}
                </span>
                {p.biodataId && (
                  <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2 py-0.5 rounded-md border border-slate-300">
                    ID: {p.biodataId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                <span>{upazila}, टाঙ্গাইল</span> ·{' '}
                <span>
                  {p.gender === 'male' ? 'পাত্র' : 'পাত্রী'} ·{' '}
                  {p.maritalStatus === 'never_married'
                    ? 'অবিবাহিত'
                    : p.maritalStatus === 'divorced'
                    ? 'ডিভোর্সড'
                    : 'বিধবা/বিপত্নীক'}
                </span>
              </p>
            </div>
          </div>

          {/* Section 1: Basic Info */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
              ১. সাধারণ ও শারীরিক বিবরণ
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">জন্ম তারিখ:</span>
                <strong className="text-slate-900">{p.dateOfBirth ? String(p.dateOfBirth).slice(0, 10) : '—'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">উচ্চতা:</span>
                <strong className="text-slate-900">
                  {p.height?.feet ? `${p.height.feet} ফুট ${p.height.inches || 0} ইঞ্চি` : '—'}
                </strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">গায়ের রং:</span>
                <strong className="text-slate-900">{p.skinTone || '—'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">ওজন:</span>
                <strong className="text-slate-900">{p.weight ? `${p.weight} কেজি` : '—'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">স্থায়ী ঠিকানা:</span>
                <strong className="text-slate-900">{upazila}, টাঙ্গাইল</strong>
              </div>
            </div>
          </div>

          {/* Section 2: Education & Profession */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
              ২. শিক্ষা ও পেশাগত বিবরণ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">শিক্ষাগত যোগ্যতা:</span>
                <strong className="text-slate-900">{p.education ? String(p.education).toUpperCase() : '—'}</strong>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block">পেশা:</span>
                <strong className="text-slate-900">{p.occupation || '—'}</strong>
              </div>
              {p.educationDetail && (
                <div className="col-span-full p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">বিস্তারিত শিক্ষা:</span>
                  <span className="text-slate-900">{p.educationDetail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Family Info */}
          {p.familyInfo && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
                ৩. পারিবারিক তথ্য
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">পিতার পেশা:</span>
                  <strong className="text-slate-900">{p.familyInfo.fatherOccupation || '—'}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">মাতার পেশা:</span>
                  <strong className="text-slate-900">{p.familyInfo.motherOccupation || '—'}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">ভাই-বোন সংখ্যা:</span>
                  <strong className="text-slate-900">{p.familyInfo.siblings ?? '—'} জন</strong>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Religious Info */}
          {p.religiousInfo && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
                ৪. দ্বীনি ও ধর্মীয় অবস্থা
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">দৈনিক ৫ ওয়াক্ত নামাজ:</span>
                  <strong className="text-slate-900">{p.religiousInfo.praysFiveTimes ? 'হ্যাঁ' : 'না'}</strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">পর্দা / মাহরাম রক্ষা:</span>
                  <strong className="text-slate-900">
                    {p.religiousInfo.wearsHijab || p.religiousInfo.maintainsMahram ? 'হ্যাঁ' : 'না'}
                  </strong>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block">কুরআন তিলাওয়াত:</span>
                  <strong className="text-slate-900">{p.religiousInfo.canReciteQuran ? 'হ্যাঁ' : 'না'}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Partner Expectations & Bio */}
          {(p.bio || p.preferences) && (
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 border-b border-emerald-200 pb-1">
                ৫. নিজের সম্পর্কে ও জীবনসঙ্গী প্রত্যাশা
              </h3>
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                {p.bio || 'দ্বীনদার, সৎচরিত্রবান ও দায়িত্বশীল জীবনসঙ্গী কামনা করেন।'}
              </div>
            </div>
          )}

          {/* Guardian details if available */}
          {guardian && guardian.name && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800">
                অভিভাবকের তথ্যাবলী (যাচাইকৃত)
              </h3>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">অভিভাবকের নাম ও সম্পর্ক: </span>
                  <strong className="text-slate-900">{guardian.name} ({guardian.relationship})</strong>
                </div>
                {guardian.phone && (
                  <div className="font-mono font-bold text-emerald-800">
                    ফোন: {guardian.phone}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer Watermark */}
          <div className="pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400">
            <p>প্রিন্ট ও যাচাইয়ের তারিখ: {new Date().toLocaleDateString('bn-BD')} · মধুবন্ধন (madhubondhon.com) টাঙ্গাইল</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBiodataModal;
