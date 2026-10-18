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
      setErrorMessage('আইনগত ও প্ল্যাটফর্ম নিয়মানুযায়ী নিবন্ধনের জন্য বয়স ন্যূনতম ১৮ বছর হতে হবে।');
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
      toast.success('নিবন্ধন সফল হয়েছে! অনুগ্রহ করে আপনার বায়োডাটা সম্পন্ন করুন।');
      navigate('/my-profile');
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err, 'নিবন্ধন ব্যর্থ হয়েছে।');
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-600 to-pink-500 items-center justify-center text-white shadow-lg shadow-rose-200 dark:shadow-none mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            বিনামূল্যে অ্যাকাউন্ট খুলুন
          </h2>
          <p className="text-xs sm:text-sm text-gray-550 dark:text-gray-400">
            টাঙ্গাইলের দ্বীনি ও বিশ্বস্ত পাত্র-পাত্রীর সন্ধানে যুক্ত হোন
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#191e28] p-6 sm:p-8 rounded-3xl shadow-xl shadow-rose-100 dark:shadow-none border border-rose-100/80 dark:border-gray-800">
          {errorMessage && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-2.5">
              <div className="flex items-start gap-2.5 font-semibold">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              {isDuplicateEmail && (
                <div className="pt-2 border-t border-rose-200/80 dark:border-rose-900/80 flex flex-wrap items-center gap-2">
                  <Link
                    to="/login"
                    state={{ email }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    সরাসরি লগইন করুন
                  </Link>
                  <Link
                    to="/forgot-password"
                    className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 hover:underline font-medium ml-1"
                  >
                    পাসওয়ার্ড ভুলে গেছেন?
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          )}

          <p className="mb-4 text-xs text-gray-600 dark:text-gray-400">
            টাঙ্গাইলের পাত্র-পাত্রীর সন্ধানে সঠিক তথ্য প্রদান করে আপনার অ্যাকাউন্ট তৈরি করুন।
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                পূর্ণ নাম <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার পূর্ণ নাম লিখুন"
                  required
                  className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                ইমেইল ঠিকানা <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <DatePicker
                  label="জন্ম তারিখ (১৮+)"
                  required
                  value={dateOfBirth}
                  onChange={(val) => setDateOfBirth(val)}
                  placeholder="জন্ম তারিখ নির্বাচন করুন"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                  মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                  পাসওয়ার্ড <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৮ অক্ষর"
                    required
                    minLength={8}
                    className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    aria-label={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 dark:text-gray-300 mb-1.5">
                  নিশ্চিত করুন <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="পুনরায় পাসওয়ার্ড"
                    required
                    minLength={8}
                    className="w-full text-sm border border-gray-250 dark:border-gray-700 rounded-xl pl-10 pr-10 py-2.5 bg-gray-50/50 dark:bg-[#1a202c] text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-[#202736] focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    aria-label={showConfirmPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Live Password Validation Requirements */}
            <div className="p-3.5 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/80 dark:border-gray-700/60 space-y-2 text-xs">
              <div className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                পাসওয়ার্ডের প্রয়োজনীয় শর্তাবলি:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    hasMinLength
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      hasMinLength
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    ✓
                  </span>
                  <span>কমপক্ষে ৮টি অক্ষর</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    hasUpper
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      hasUpper
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    ✓
                  </span>
                  <span>কমপক্ষে ১টি বড় হাতের অক্ষর (A-Z)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    hasLower
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      hasLower
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    ✓
                  </span>
                  <span>কমপক্ষে ১টি ছোট হাতের অক্ষর (a-z)</span>
                </div>

                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    hasNumber
                      ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] ${
                      hasNumber
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    ✓
                  </span>
                  <span>কমপক্ষে ১টি সংখ্যা (০-৯)</span>
                </div>
              </div>

              {confirmPassword.length > 0 && (
                <div
                  className={`pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-1.5 font-medium ${
                    passwordsMatch
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      passwordsMatch
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                    }`}
                  >
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

            <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-1 leading-relaxed">
              নিবন্ধনের মাধ্যমে আপনি মধুবন্ধনের নিরাপত্তা নীতিমালা এবং শুধুমাত্র ১৮+ প্রাপ্তবয়স্কদের
              আইনি বাধ্যবাধকতা মেনে নিচ্ছেন।
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 text-sm font-bold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">
            পূর্বেই অ্যাকাউন্ট রয়েছে?{' '}
            <Link to="/login" className="font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700">
              এখানে লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
