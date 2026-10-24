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
import { Gender } from '../types';
import DatePicker from '../components/common/DatePicker';
import { calculateAge } from '../utils/dates';
import { useLanguage } from '../i18n/LanguageContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { isBengali } = useLanguage();

  const [gender, setGender] = useState<Gender | ''>('');
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
    errorMessage.includes('অ্যাকাউন্ট আছে') ||
    errorMessage.toLowerCase().includes('already exists') ||
    errorMessage.toLowerCase().includes('already registered');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!gender) {
      setErrorMessage(
        isBengali
          ? 'অনুগ্রহ করে পাত্র অথবা পাত্রী নির্বাচন করুন।'
          : 'Please select Groom or Bride.'
      );
      return;
    }

    if (!name.trim() || !email.trim() || !dateOfBirth || !password || !confirmPassword) {
      setErrorMessage(
        isBengali ? 'সবগুলো আবশ্যক তথ্য পূরণ করুন।' : 'Please fill in all required fields.'
      );
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setErrorMessage(
        isBengali
          ? 'আইনগত ও প্ল্যাটফর্ম নিয়মানুযায়ী নিবন্ধনের জন্য বয়স ন্যূনতম ১৮ বছর হতে হবে।'
          : 'According to law and platform policy, minimum age for registration is 18 years.'
      );
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage(
        isBengali
          ? 'পাসওয়ার্ডে অন্তত ৮ অক্ষর, একটি বড় হাতের অক্ষর, একটি ছোট হাতের অক্ষর এবং একটি সংখ্যা দিন।'
          : 'Password must have at least 8 characters, an uppercase letter, a lowercase letter, and a number.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        isBengali
          ? 'পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।'
          : 'Password and confirmation password do not match.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || undefined,
        gender,
        dateOfBirth,
        password,
        confirmPassword,
      });
      toast.success(
        isBengali
          ? 'নিবন্ধন সফল হয়েছে! অনুগ্রহ করে আপনার বায়োডাটা সম্পন্ন করুন।'
          : 'Registration successful! Please complete your biodata.'
      );
      navigate('/my-profile');
    } catch (err: unknown) {
      const defaultErr = isBengali ? 'নিবন্ধন ব্যর্থ হয়েছে।' : 'Registration failed.';
      const msg = getApiErrorMessage(err, defaultErr);
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const rules: { ok: boolean; label: string }[] = [
    { ok: hasMinLength, label: isBengali ? 'কমপক্ষে ৮টি অক্ষর' : 'At least 8 characters' },
    { ok: hasUpper, label: isBengali ? 'বড় হাতের একটি অক্ষর (A-Z)' : 'One uppercase letter (A-Z)' },
    { ok: hasLower, label: isBengali ? 'ছোট হাতের একটি অক্ষর (a-z)' : 'One lowercase letter (a-z)' },
    { ok: hasNumber, label: isBengali ? 'কমপক্ষে একটি সংখ্যা (০-৯)' : 'At least one number (0-9)' },
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
            {isBengali ? (
              <>
                আপনার <span className="text-brand">সুন্দর পরিচয়ের</span> যাত্রা শুরু হোক আজই
              </>
            ) : (
              <>
                Begin your journey to a <span className="text-brand">blessed union</span> today
              </>
            )}
          </h3>
          <ul className="space-y-4 text-sm text-ink-2">
            {[
              {
                icon: User,
                text: isBengali
                  ? 'পরিবার দ্বারা যাচাইকৃত, সম্মানজনক ও ১০০% বিনামূল্যে নিবন্ধন'
                  : 'Family involvement, respectful & free registration',
              },
              {
                icon: ShieldAlert,
                text: isBengali
                  ? 'অভিভাবকের অনুমতি ছাড়া যোগাযোগের তথ্য কারো কাছে প্রকাশ হয় না'
                  : 'Contact details are never disclosed without guardian permission',
              },
              {
                icon: Mail,
                text: isBengali
                  ? 'ইমেইল যাচাই ও অভিভাবকের সম্মতির ঘোষণা দিয়ে বায়োডাটা জমা দিন'
                  : 'Submit after email verification and a guardian consent declaration',
              },
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
            <h2 className="text-2xl sm:text-3xl font-bold text-ink">
              {isBengali ? 'বিনামূল্যে অ্যাকাউন্ট খুলুন' : 'Create a Free Account'}
            </h2>
            <p className="text-xs sm:text-sm text-ink-2">
              {isBengali
                ? 'টাঙ্গাইলের দ্বীনি ও বিশ্বস্ত পাত্র-পাত্রীর সন্ধানে যুক্ত হোন'
                : 'Join to find trusted, pious brides and grooms across Tangail'}
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
                      {isBengali ? 'সরাসরি লগইন করুন' : 'Log in directly'}
                    </Link>
                    <Link
                      to="/forgot-password"
                      className="inline-flex items-center gap-1 text-brand hover:underline font-medium"
                    >
                      {isBengali ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            )}

            <p className="mb-5 text-xs text-ink-3">
              {isBengali
                ? 'টাঙ্গাইলের পাত্র-পাত্রীর সন্ধানে সঠিক তথ্য প্রদান করে আপনার অ্যাকাউন্ট তৈরি করুন।'
                : 'Provide accurate information to create your account and connect with prospective matches.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-label">
                  {isBengali
                    ? 'বায়োডাটার ধরন / কার জন্য নিবন্ধন করছেন?'
                    : 'Biodata Type / Who are you registering for?'}{' '}
                  <span className="text-brand">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setGender(Gender.MALE)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      gender === Gender.MALE
                        ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/25 shadow-xs'
                        : 'border-line bg-elev hover:bg-card hover:border-brand/40 text-ink-2'
                    }`}
                  >
                    <span className="text-xl">🤵‍♂️</span>
                    <span>{isBengali ? 'আমি পাত্র' : 'I am Groom'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGender(Gender.FEMALE)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      gender === Gender.FEMALE
                        ? 'border-brand bg-brand/10 text-brand ring-2 ring-brand/25 shadow-xs'
                        : 'border-line bg-elev hover:bg-card hover:border-brand/40 text-ink-2'
                    }`}
                  >
                    <span className="text-xl">🧕</span>
                    <span>{isBengali ? 'আমি পাত্রী' : 'I am Bride'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-label">
                  {isBengali ? 'পূর্ণ নাম' : 'Full Name'} <span className="text-brand">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isBengali ? 'আপনার পূর্ণ নাম লিখুন' : 'Enter your full name'}
                    required
                    className="mb-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-label">
                  {isBengali ? 'ইমেইল ঠিকানা' : 'Email Address'} <span className="text-brand">*</span>
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
                  label={isBengali ? 'জন্ম তারিখ' : 'Date of Birth'}
                  required
                  value={dateOfBirth}
                  onChange={(val) => setDateOfBirth(val)}
                  placeholder={isBengali ? 'জন্ম তারিখ নির্বাচন করুন' : 'Select date of birth'}
                />

                <div>
                  <label className="mb-label">
                    {isBengali ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Mobile Number (Optional)'}
                  </label>
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
                    {isBengali ? 'পাসওয়ার্ড' : 'Password'} <span className="text-brand">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isBengali ? 'কমপক্ষে ৮ অক্ষর' : 'At least 8 characters'}
                      required
                      minLength={8}
                      className="mb-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer"
                      aria-label={
                        showPassword
                          ? isBengali
                            ? 'পাসওয়ার্ড লুকান'
                            : 'Hide password'
                          : isBengali
                          ? 'পাসওয়ার্ড দেখুন'
                          : 'Show password'
                      }
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-label">
                    {isBengali ? 'নিশ্চিত করুন' : 'Confirm Password'}{' '}
                    <span className="text-brand">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-ink-3 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={isBengali ? 'পুনরায় পাসওয়ার্ড' : 'Re-enter password'}
                      required
                      minLength={8}
                      className="mb-input pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink cursor-pointer"
                      aria-label={
                        showConfirmPassword
                          ? isBengali
                            ? 'পাসওয়ার্ড লুকান'
                            : 'Hide password'
                          : isBengali
                          ? 'পাসওয়ার্ড দেখুন'
                          : 'Show password'
                      }
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password requirement checklist */}
              <div className="p-4 rounded-2xl bg-elev border border-line space-y-2.5 text-xs">
                <div className="text-[11px] font-bold text-ink-2">
                  {isBengali ? 'পাসওয়ার্ডের প্রয়োজনীয় শর্তাবলি:' : 'Password Requirements:'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {rules.map(({ ok, label }) => (
                    <div
                      key={label}
                      className={`flex items-center gap-1.5 transition-colors ${
                        ok ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-ink-3'
                      }`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          ok
                            ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                            : 'bg-strongline text-ink-3'
                        }`}
                      >
                        ✓
                      </span>
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {confirmPassword.length > 0 && (
                  <div
                    className={`pt-2 border-t border-line flex items-center gap-1.5 font-medium ${
                      passwordsMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-brand'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        passwordsMatch
                          ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-brand-soft text-brand'
                      }`}
                    >
                      {passwordsMatch ? '✓' : '✕'}
                    </span>
                    <span>
                      {passwordsMatch
                        ? isBengali
                          ? 'উভয় পাসওয়ার্ড মিলেছে'
                          : 'Both passwords match'
                        : isBengali
                        ? 'পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মিলছে না'
                        : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-ink-3 pt-1 leading-relaxed">
                {isBengali
                  ? 'নিবন্ধনের মাধ্যমে আপনি মধুবন্ধনের নিরাপত্তা নীতিমালা এবং শুধুমাত্র ১৮+ প্রাপ্তবয়স্কদের আইনি বাধ্যবাধকতা মেনে নিচ্ছেন।'
                  : 'By registering, you agree to MadhuBondhon safety guidelines and legally confirm that you are at least 18 years old.'}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mb-btn-primary w-full mt-2 py-3"
              >
                {isSubmitting
                  ? isBengali
                    ? 'প্রসেসিং হচ্ছে...'
                    : 'Processing...'
                  : isBengali
                  ? 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন'
                  : 'Create Free Account'}
              </button>
            </form>

            <div className="mt-5 pt-4 border-t border-line text-center text-xs text-ink-2">
              {isBengali ? 'পূর্বেই অ্যাকাউন্ট রয়েছে? ' : 'Already have an account? '}
              <Link to="/login" className="font-bold text-brand hover:text-brand-strong">
                {isBengali ? 'এখানে লগইন করুন' : 'Log in here'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
