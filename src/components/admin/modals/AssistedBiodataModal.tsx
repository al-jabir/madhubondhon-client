import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  X,
  ShieldCheck,
  Heart,
  Phone,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { TANGAIL_UPAZILAS, getUpazilaDisplayName } from '../../../constants/locations';
import { toast } from 'sonner';
import { useLanguage } from '../../../i18n/LanguageContext';

interface AssistedBiodataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistedBiodataModal: React.FC<AssistedBiodataModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();
  const { isBengali } = useLanguage();

  // Form states
  const [candidateName, setCandidateName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dateOfBirth, setDateOfBirth] = useState('1998-01-01');
  const [upazila, setUpazila] = useState<string>(TANGAIL_UPAZILAS[0]);
  const [maritalStatus, setMaritalStatus] = useState('never_married');
  const [heightFeet, setHeightFeet] = useState(5);
  const [heightInches, setHeightInches] = useState(6);
  const [education, setEducation] = useState('bachelors');
  const [educationDetail, setEducationDetail] = useState('');
  const [occupation, setOccupation] = useState('');

  // Guardian info
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('father');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');

  // Religious & lifestyle
  const [praysFiveTimes, setPraysFiveTimes] = useState(true);
  const [canReciteQuran, setCanReciteQuran] = useState(true);
  const [wearsHijab, setWearsHijab] = useState(false);
  const [hasBeard, setHasBeard] = useState(false);
  const [maintainsMahram, setMaintainsMahram] = useState(true);

  // Expectations
  const [partnerExpectations, setPartnerExpectations] = useState('');
  const [bio, setBio] = useState('');

  const createMutation = useMutation({
    mutationFn: async () => {
      return adminApi.createAssistedBiodata({
        candidateName,
        gender,
        dateOfBirth,
        upazila,
        maritalStatus,
        heightFeet,
        heightInches,
        education,
        educationDetail,
        occupation,
        guardianName,
        guardianRelationship:
          guardianRelationship === 'father'
            ? 'পিতা'
            : guardianRelationship === 'mother'
            ? 'মাতা'
            : guardianRelationship === 'brother'
            ? 'বড় ভাই'
            : guardianRelationship === 'uncle'
            ? 'চাচা / মামা'
            : 'আইনগত অভিভাবক',
        guardianPhone,
        guardianEmail,
        praysFiveTimes,
        canReciteQuran,
        wearsHijab: gender === 'female' ? wearsHijab : undefined,
        hasBeard: gender === 'male' ? hasBeard : undefined,
        maintainsMahram,
        partnerExpectations,
        bio,
      });
    },
    onSuccess: (res) => {
      const bioId = res.data?.profile?.biodataId || 'MB';
      toast.success(
        isBengali
          ? `বায়োডাটা (${bioId}) সফলভাবে সিস্টেমে যুক্ত ও প্রকাশিত হয়েছে!`
          : `Biodata (${bioId}) created and published successfully!`
      );
      queryClient.invalidateQueries({ queryKey: ['admin-published-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message ||
          (isBengali ? 'বায়োডাটা এন্ট্রি করতে সমস্যা হয়েছে।' : 'Failed to create assisted biodata.')
      );
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      toast.error(isBengali ? 'প্রার্থীর নাম আবশ্যক' : 'Candidate name is required');
      return;
    }
    if (!guardianPhone.trim() || guardianPhone.length < 11) {
      toast.error(
        isBengali
          ? 'অভিভাবকের সঠিক ১১ ডিজিট মোবাইল নম্বর প্রদান করুন'
          : 'Please provide a valid 11-digit guardian phone number'
      );
      return;
    }
    createMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="bg-card border border-line rounded-2xl w-full max-w-3xl my-8 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <UserPlus className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink">
                {isBengali
                  ? 'অফলাইন / অভিভাবক অ্যাসিস্টেড বায়োডাটা এন্ট্রি'
                  : 'Offline / Assisted Biodata Entry'}
              </h2>
              <p className="text-xs text-ink-3">
                {isBengali
                  ? 'বয়োবৃদ্ধ বা স্মার্টফোন ব্যবহারে অনভ্যস্ত অভিভাবকদের পক্ষে অ্যাডমিন টিম কর্তৃক সরাসরি বায়োডাটা নিবন্ধন'
                  : 'Direct profile entry on behalf of elders and guardians assisted by the admin team'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-ink-3 hover:text-ink hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 text-sm">
          {/* Section 1: Candidate Basic Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-4 h-4" />{' '}
              <span>{isBengali ? 'প্রার্থীর মৌলিক তথ্য' : 'Candidate Basic Information'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'প্রার্থীর নাম *' : "Candidate's Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder={isBengali ? 'যেমন: মুহাম্মদ আবদুল্লাহ' : 'e.g. Muhammad Abdullah'}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'বায়োডাটার ধরন *' : 'Biodata Type *'}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="male">{isBengali ? 'পাত্রের বায়োডাটা (Groom)' : "Groom's Biodata (Male)"}</option>
                  <option value="female">{isBengali ? 'পাত্রীর বায়োডাটা (Bride)' : "Bride's Biodata (Female)"}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'জন্ম তারিখ *' : 'Date of Birth *'}
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'উপজেলা (টাঙ্গাইল) *' : 'Upazila (Tangail) *'}
                </label>
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  {TANGAIL_UPAZILAS.map((u) => (
                    <option key={u} value={u}>
                      {getUpazilaDisplayName(u, isBengali)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'বৈবাহিক অবস্থা' : 'Marital Status'}
                </label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="never_married">{isBengali ? 'অবিবাহিত' : 'Never Married'}</option>
                  <option value="divorced">{isBengali ? 'ডিভোর্সড' : 'Divorced'}</option>
                  <option value="widowed">{isBengali ? 'বিধবা / বিপত্নীক' : 'Widowed'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'উচ্চতা' : 'Height'}
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(Number(e.target.value))}
                    className="bg-base border border-line rounded-xl px-2 py-2 text-xs"
                  >
                    {[4, 5, 6, 7].map((f) => (
                      <option key={f} value={f}>
                        {f} {isBengali ? 'ফুট' : 'ft'}
                      </option>
                    ))}
                  </select>
                  <select
                    value={heightInches}
                    onChange={(e) => setHeightInches(Number(e.target.value))}
                    className="bg-base border border-line rounded-xl px-2 py-2 text-xs"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
                      <option key={i} value={i}>
                        {i} {isBengali ? 'ইঞ্চি' : 'in'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'শিক্ষাগত যোগ্যতা' : 'Educational Qualification'}
                </label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="ssc">{isBengali ? 'এসএসসি / দাখিল' : 'SSC / Dakhil'}</option>
                  <option value="hsc">{isBengali ? 'এইচএসসি / আলিম' : 'HSC / Alim'}</option>
                  <option value="diploma">{isBengali ? 'ডিপ্লোমা' : 'Diploma'}</option>
                  <option value="bachelors">{isBengali ? 'স্নাতক / অনার্স / ফাজিল' : 'Bachelors / Fazil'}</option>
                  <option value="masters">{isBengali ? 'মাস্টার্স / কামিল' : 'Masters / Kamil'}</option>
                  <option value="islamic_education">{isBengali ? 'কওমি মাদ্রাসা (দাওরায়ে হাদিস)' : 'Qawmi Madrasah (Dawra)'}</option>
                  <option value="other">{isBengali ? 'অন্যান্য' : 'Other'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'পেশা ও কর্মক্ষেত্র' : 'Occupation'}
                </label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder={isBengali ? 'যেমন: সফটওয়্যার ইঞ্জিনিয়ার / ব্যবসায়ী / শিক্ষক' : 'e.g. Software Engineer / Businessman / Teacher'}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Guardian Info */}
          <div className="space-y-3 pt-3 border-t border-line">
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4" />{' '}
              <span>{isBengali ? 'অভিভাবকের তথ্য (যাচাইকৃত)' : 'Verified Guardian Information'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'অভিভাবকের নাম *' : "Guardian's Name *"}
                </label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder={isBengali ? 'যেমন: হাজী মোঃ রফিকুল ইসলাম' : 'e.g. Md. Rafiqul Islam'}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'সম্পর্ক *' : 'Relationship *'}
                </label>
                <select
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="father">{isBengali ? 'পিতা' : 'Father'}</option>
                  <option value="mother">{isBengali ? 'মাতা' : 'Mother'}</option>
                  <option value="brother">{isBengali ? 'বড় ভাই' : 'Elder Brother'}</option>
                  <option value="uncle">{isBengali ? 'চাচা / মামা' : 'Uncle'}</option>
                  <option value="guardian">{isBengali ? 'আইনগত অভিভাবক' : 'Legal Guardian'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">
                  {isBengali ? 'অভিভাবকের মোবাইল *' : "Guardian's Mobile *"}
                </label>
                <input
                  type="text"
                  required
                  value={guardianPhone}
                  onChange={(e) => setGuardianPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Religious Practice */}
          <div className="space-y-3 pt-3 border-t border-line">
            <h3 className="text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />{' '}
              <span>{isBengali ? 'দ্বীনি ও ইসলামিক তথ্য' : 'Religious & Islamic Details'}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-xl border border-line">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={praysFiveTimes}
                  onChange={(e) => setPraysFiveTimes(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs text-ink">
                  {isBengali ? '৫ ওয়াক্ত নামাজি' : '5 Times Prayers'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canReciteQuran}
                  onChange={(e) => setCanReciteQuran(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs text-ink">
                  {isBengali ? 'সহীহ কুরআন পাঠ' : 'Quran Recitation'}
                </span>
              </label>

              {gender === 'female' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wearsHijab}
                    onChange={(e) => setWearsHijab(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-xs text-ink">
                    {isBengali ? 'পর্দা / হিজাব করেন' : 'Wears Hijab / Niqab'}
                  </span>
                </label>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBeard}
                    onChange={(e) => setHasBeard(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-xs text-ink">
                    {isBengali ? 'সুন্নত দাড়ি আছে' : 'Has Sunnah Beard'}
                  </span>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintainsMahram}
                  onChange={(e) => setMaintainsMahram(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs text-ink">
                  {isBengali ? 'মাহরাম রক্ষা করেন' : 'Maintains Mahram'}
                </span>
              </label>
            </div>
          </div>

          {/* Section 4: Partner Expectations */}
          <div className="space-y-3 pt-3 border-t border-line">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />{' '}
              <span>{isBengali ? 'জীবনসঙ্গী সম্পর্কে প্রত্যাশা ও অতিরিক্ত বিবরণ' : 'Partner Expectations & Details'}</span>
            </h3>
            <textarea
              rows={2}
              value={partnerExpectations}
              onChange={(e) => setPartnerExpectations(e.target.value)}
              placeholder={
                isBengali
                  ? 'যেমন: ধার্মিক, সৎ, নামাজি এবং ভদ্র পরিবারের পাত্র/পাত্রী প্রত্যাশা...'
                  : 'e.g. Practicing Muslim, pious, honest and from a respectable family...'
              }
              className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-ink-3 hover:text-ink hover:bg-muted text-xs font-semibold cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover disabled:opacity-50 shadow-sm transition-all cursor-pointer"
            >
              {createMutation.isPending
                ? (isBengali ? 'নিবন্ধন ও প্রকাশ হচ্ছে...' : 'Registering & Publishing...')
                : (isBengali ? 'বায়োডাটা তৈরি ও অনুমোদন করুন' : 'Create & Publish Biodata')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssistedBiodataModal;
