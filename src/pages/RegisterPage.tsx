import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Heart,
  Lock,
  Mail,
  User,
  Phone,
  ShieldAlert,
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../api/errors';
import { useAuth } from '../context/useAuth';
import DatePicker, { calculateAge } from '../components/common/DatePicker';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber;
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const isDuplicateEmail =
    errorMessage.includes('ইতিমধ্যে') ||
    errorMessage.includes('ইতোমধ্যে') ||
    errorMessage.includes('একউন্ট আছে') ||
    errorMessage.includes('অ্যাকাউন্ট আছে');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !dateOfBirth || !password || !confirmPassword) {
      setErrorMessage('সবগুলো আবশ্যক তথ্য পূরণ করুন।');
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setErrorMessage('আইনগত ও প্ল্যাটফর্ম নিয়মানুযায়ী নিবন্ধনের জন্য বয়স ন্যূনতম ১৮ বছর হতে হবে।');
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage('পাসওয়ার্ডে অন্তত ৮ অক্ষর, একটি বড় হাতের অক্ষর, একটি ছোট হাতের অক্ষর এবং একটি সংখ্যা দিন।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        dateOfBirth,
        password,
        confirmPassword,
      });
      toast.success('নিবন্ধন সফল হয়েছে! অনুগ্রহ করে আপনার বায়োডাটা সম্পন্ন করুন।');
      navigate('/my-profile');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'নিবন্ধন ব্যর্থ হয়েছে।');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rules: { ok: boolean; label: string }[] = [
    { ok: hasMinLength, label: 'কমপক্ষে ৮টি অক্ষর' },
    { ok: hasUpper, label: 'বড় হাতের একটি অক্ষর (A-Z)' },
    { ok: hasLower, label: 'ছোট হাতের একটি অক্ষর (a-z)' },
    { ok: hasNumber, label: 'কমপক্ষে একটি সংখ্যা (০-৯)' },
  ];

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex items-start justify-center gap-12 xl:gap-16">
        {/* Left: brand pitch */}
        <div className="hidden lg:block max-w-md pt-10 space-y-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-linear-to-br from-brand to-pink-500 items-center justify-center text-white shadow-lg shadow-brand/30">
            <Heart className="w-7 h-7 fill-current" />
          </div>
          <h3 className="text-3xl font-bold text-ink leading-snug">
            আপনার <span className="text-brand">সুন্দর পরিচয়ের</span> যাত্রা শুরু হোক আজই
          </h3>
          <ul className="space-y-4 text-sm text-ink-2">
            {[
              { icon: User, text: 'পরিবার দ্বারা যাচাইকৃত, সম্মানজনক ও ১০০% বিনামূল্যে নিবন্ধন' },
              { icon: ShieldAlert, text: 'অভিভাবকের অনুমতি ছাড়া যোগাযোগের তথ্য কারো কাছে প্রকাশ হয় না' },
              { icon: Mail, text: 'মডারেটরের নিরীক্ষার পরেই বায়োডাটা প্রকাশ পায় — ভুয়া প্রোফাইলের সুযোগ কম' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="mt-0.5 w-8 h-8 rounded-xl bg-brand-soft border border-brand/20 flex items-center justify-center text-brand shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <span className="leading-relaxed pt-1">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: form card */}
        <div className="w-full max-w-2xl space-y-5">
          <div className="text-center lg:text-left space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">বিনামূল্যে অ্যাকাউন্ট খুলুন</h2>
            <p className="text-xs sm:text-sm text-ink-2">
              টাঙ্গাইলের দ্বীনি ও বিশ্বস্ত পাত্র-পাত্রীর সন্ধানে যুক্ত হোন
            </p>
          </div>

          <div className="mb-card p-6 sm:p-8">
            {errorMessage && (
              <div className="mb-5 p-4 rounded-2xl bg-brand-soft border border-brand/25 text-xs text-brand-ink space-y-2.5">
                <div className="flex items-start gap-2.5 font-semibold">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-brand" />
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
                {isDuplicateEmail && (
                  <div className="pt-2 border-t border-brand/20 flex flex-wrap items-center gap-2">
                    <Link
                      to="/login"
                      state={{ email }}
                      className="mb-btn-primary px-3 py-1.5 text-xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      সরাসরি লগইন করুন
                    </Link>
                    <Link
                      to="/forgot-password"
                      className="inline-flex items-center gap-1 text-brand hover:underline font-medium"
                    >
                      পাসওয়ার্ড ভুলে গেছেন?
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            <p className="mb-5 text-xs text-ink-3">
              টাঙ্গাইলের পাত্র-পাত্রীর সন্ধানে সঠিক তথ্য প্রদান করে আপনার অ্যাকাউন্ট তৈরি করুন।
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-label">
                  পূর্ণ নাম <span className="text-brand">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                    required
                    className="mb-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-label">
                  ইমেইল ঠিকানা <span className="text-brand">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="mb-input pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DatePicker
                  label="জন্ম তারিখ (১৮+)"
                  required
                  value={dateOfBirth}
                  onChange={(val) => setDateOfBirth(val)}
                  placeholder="জন্ম তারিখ নির্বাচন করুন"
                />

                <div>
                  <label className="mb-label">মোবাইল নম্বর (ঐচ্ছিক)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="017XXXXXXXX"
                      className="mb-input pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-label">
                    পাসওয়ার্ড <span className="text-brand">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="কমপক্ষে ৮ অক্ষর"
                      required
                      minLength={8}
                      className="mb-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer"
                      aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-label">
                    নিশ্চিত করুন <span className="text-brand">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পুনরায় পাসওয়ার্ড"
                      required
                      minLength={8}
                      className="mb-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer"
                      aria-label={showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password requirement checklist */}
              <div className="p-4 rounded-2xl bg-elev border border-line space-y-2.5 text-xs">
                <div className="text-[11px] font-bold text-ink-2">
                  পাসওয়ার্ডের প্রয়োজনীয় শর্তাবলি:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {rules.map(({ ok, label }) => (
                    <div key={label} className={`flex items-center gap-1.5 transition-colors ${ok ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-ink-3'}`}>
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        ok ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400' : 'bg-strongline text-ink-3'
                      }`}>
                        ✓
                      </span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {confirmPassword.length > 0 && (
                  <div className={`pt-2 border-t border-line flex items-center gap-1.5 font-medium ${
                    passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand'
                  }`}>
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      passwordsMatch
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                        : 'bg-brand-soft text-brand'
                    }`}>
                      {passwordsMatch ? '✓' : '✕'}
                    </span>
                    <span>
                      {passwordsMatch
                        ? 'উভয় পাসওয়ার্ড মিলেছে'
                        : 'পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না'}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-ink-3 pt-1 leading-relaxed">
                নিবন্ধনের মাধ্যমে আপনি মধুবন্ধনের নিরাপত্তা নীতিমালা এবং শুধুমাত্র ১৮+ প্রাপ্তবয়স্কদের
                আইনি বাধ্যবাধকতা মেনে নিচ্ছেন।
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mb-btn-primary w-full mt-2 py-3"
              >
                {isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-line text-center text-xs text-ink-2">
              পূর্বেই অ্যাকাউন্ট রয়েছে?{' '}
              <Link to="/login" className="font-bold text-brand hover:text-brand-strong">
                এখানে লগইন করুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
