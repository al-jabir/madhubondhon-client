import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UserPlus,
  X,
  ShieldCheck,
  Heart,
  Phone,
  UserCheck,
  Sparkles,
} from 'lucide-react';
import { adminApi } from '../../../api/admin.api';
import { TANGAIL_UPAZILAS, getUpazilaDisplayName } from '../../../constants/locations';
import { toast } from 'sonner';

interface AssistedBiodataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssistedBiodataModal: React.FC<AssistedBiodataModalProps> = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

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
  const [guardianRelationship, setGuardianRelationship] = useState('পিতা');
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
        guardianRelationship,
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
      toast.success(`বায়োডাটা (${bioId}) সফলভাবে সিস্টেমে যুক্ত ও প্রকাশিত হয়েছে!`);
      queryClient.invalidateQueries({ queryKey: ['admin-published-profiles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'বায়োডাটা এন্ট্রি করতে সমস্যা হয়েছে।');
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim()) {
      toast.error('প্রার্থীর নাম আবশ্যক');
      return;
    }
    if (!guardianPhone.trim() || guardianPhone.length < 11) {
      toast.error('অভিভাবকের সঠিক ১১ ডিজিট মোবাইল নম্বর প্রদান করুন');
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
              <h2 className="text-lg font-bold text-ink">অফলাইন / অভিভাবক অ্যাসিস্টেড বায়োডাটা এন্ট্রি</h2>
              <p className="text-xs text-ink-3">
                বয়োবৃদ্ধ বা স্মার্টফোন ব্যবহারে অনভ্যস্ত অভিভাবকদের পক্ষে অ্যাডমিন টিম কর্তৃক সরাসরি বায়োডাটা নিবন্ধন
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
              <Heart className="w-4 h-4" /> প্রার্থীর মৌলিক তথ্য
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">প্রার্থীর নাম *</label>
                <input
                  type="text"
                  required
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  placeholder="যেমন: মুহাম্মদ আবদুল্লাহ"
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">বায়োডাটার ধরন *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="male">পাত্রের বায়োডাটা (Groom)</option>
                  <option value="female">পাত্রীর বায়োডাটা (Bride)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">জন্ম তারিখ *</label>
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
                <label className="block text-xs font-semibold text-ink-2 mb-1">উপজেলা (টাঙ্গাইল) *</label>
                <select
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  {TANGAIL_UPAZILAS.map((u) => (
                    <option key={u} value={u}>
                      {getUpazilaDisplayName(u)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">বৈবাহিক অবস্থা</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="never_married">অবিবাহিত</option>
                  <option value="divorced">ডিভোর্সড</option>
                  <option value="widowed">বিধবা / বিপত্নীক</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">উচ্চতা</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <select
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(Number(e.target.value))}
                    className="bg-base border border-line rounded-xl px-2 py-2 text-xs"
                  >
                    {[4, 5, 6, 7].map((f) => (
                      <option key={f} value={f}>
                        {f} ফুট
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
                        {i} ইঞ্চি
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">শিক্ষাগত যোগ্যতা</label>
                <select
                  value={education}
                  onChange={(e) => setEducation(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="ssc">এসএসসি / দাখিল</option>
                  <option value="hsc">এইচএসসি / আলিম</option>
                  <option value="diploma">ডিপ্লোমা</option>
                  <option value="bachelors">স্নাতক / অনার্স / ফাজিল</option>
                  <option value="masters">মাস্টার্স / কামিল</option>
                  <option value="islamic_education">কওমি মাদ্রাসা (দাওরায়ে হাদিস)</option>
                  <option value="other">অন্যান্য</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">পেশা ও কর্মক্ষেত্র</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার / ব্যবসায়ী / শিক্ষক"
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Guardian Info */}
          <div className="space-y-3 pt-3 border-t border-line">
            <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> অভিভাবকের তথ্য (যাচাইকৃত)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">অভিভাবকের নাম *</label>
                <input
                  type="text"
                  required
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="যেমন: হাজী মোঃ রফিকুল ইসলাম"
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">সম্পর্ক *</label>
                <select
                  value={guardianRelationship}
                  onChange={(e) => setGuardianRelationship(e.target.value)}
                  className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
                >
                  <option value="পিতা">পিতা</option>
                  <option value="মাতা">মাতা</option>
                  <option value="ভাই">বড় ভাই</option>
                  <option value="চাচা">চাচা / মামা</option>
                  <option value="অভিভাবক">আইনগত অভিভাবক</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-2 mb-1">অভিভাবকের মোবাইল *</label>
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
              <ShieldCheck className="w-4 h-4" /> দ্বীনি ও ইসলামিক তথ্য
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/40 p-3 rounded-xl border border-line">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={praysFiveTimes}
                  onChange={(e) => setPraysFiveTimes(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs text-ink">৫ ওয়াক্ত নামাজি</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canReciteQuran}
                  onChange={(e) => setCanReciteQuran(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs text-ink">সহীহ কুরআন পাঠ</span>
              </label>

              {gender === 'female' ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wearsHijab}
                    onChange={(e) => setWearsHijab(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-xs text-ink">পর্দা / হিজাব করেন</span>
                </label>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBeard}
                    onChange={(e) => setHasBeard(e.target.checked)}
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                  />
                  <span className="text-xs text-ink">সুন্নত দাড়ি আছে</span>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintainsMahram}
                  onChange={(e) => setMaintainsMahram(e.target.checked)}
                  className="rounded text-primary focus:ring-primary w-4 h-4"
                />
                <span className="text-xs text-ink">মাহরাম রক্ষা করেন</span>
              </label>
            </div>
          </div>

          {/* Section 4: Partner Expectations */}
          <div className="space-y-3 pt-3 border-t border-line">
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" /> জীবনসঙ্গী সম্পর্কে প্রত্যাশা ও অতিরিক্ত বিবরণ
            </h3>
            <textarea
              rows={2}
              value={partnerExpectations}
              onChange={(e) => setPartnerExpectations(e.target.value)}
              placeholder="যেমন: ধার্মিক, সৎ, নামাজি এবং ভদ্র পরিবারের পাত্র/পাত্রী প্রত্যাশা..."
              className="w-full bg-base border border-line rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-primary"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-ink-3 hover:text-ink hover:bg-muted text-xs font-semibold"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover disabled:opacity-50 shadow-sm transition-all"
            >
              {createMutation.isPending ? 'নিবন্ধন ও প্রকাশ হচ্ছে...' : 'বায়োডাটা তৈরি ও অনুমোদন করুন'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AssistedBiodataModal;
