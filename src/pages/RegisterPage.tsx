import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, Lock, Mail, User, Phone, Calendar, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { getApiErrorMessage } from '../api/errors';
import { useAuth } from '../context/useAuth';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Calculate age from DOB
  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !dateOfBirth || !password || !confirmPassword) {
      setErrorMessage('সবগুলো আবশ্যক তথ্য পূরণ করুন।');
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setErrorMessage('আইনগত ও প্ল্যাটফর্ম নিয়মানুযায়ী নিবন্ধনের জন্য বয়স ন্যূনতম ১৮ বছর হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।');
      return;
    }

    if (password.length < 8 || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setErrorMessage('পাসওয়ার্ডে অন্তত ৮ অক্ষর, একটি বড় হাতের অক্ষর, একটি ছোট হাতের অক্ষর এবং একটি সংখ্যা দিন।');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        name: name.trim(),
        email: email.trim(),
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
          <div className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-tr from-rose-600 to-pink-500 items-center justify-center text-white shadow-lg shadow-rose-200 mb-1">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            বিনামূল্যে অ্যাকাউন্ট খুলুন
          </h2>
          <p className="text-xs sm:text-sm text-gray-550">
            টাঙ্গাইলের দ্বীনি ও বিশ্বস্ত পাত্র-পাত্রীর সন্ধানে যুক্ত হোন
          </p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-rose-100 border border-rose-100/80">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="mb-4 text-xs text-gray-600">পাসওয়ার্ডে অন্তত ৮ অক্ষর, বড় ও ছোট হাতের ইংরেজি অক্ষর এবং সংখ্যা দিন।</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-750 mb-1.5">
                পূর্ণ নাম <span className="text-rose-600">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  required
                  className="w-full text-sm border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-750 mb-1.5">
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
                  className="w-full text-sm border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1.5">
                  জন্ম তারিখ (১৮+) <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                    className="w-full text-sm border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1.5">
                  মোবাইল নম্বর (ঐচ্ছিক)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full text-sm border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1.5">
                  পাসওয়ার্ড <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৮ অক্ষর"
                    required
                    minLength={8}
                    className="w-full text-sm border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1.5">
                  নিশ্চিত করুন <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="পুনরায় পাসওয়ার্ড"
                    required
                    minLength={8}
                    className="w-full text-sm border border-gray-250 rounded-xl pl-10 pr-4 py-2.5 bg-gray-50/50 focus:bg-white focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 pt-1 leading-relaxed">
              নিবন্ধনের মাধ্যমে আপনি মধুবন্ধনের নিরাপত্তা নীতিমালা এবং শুধুমাত্র ১৮+ প্রাপ্তবয়স্কদের
              আইনি বাধ্যবাধকতা মেনে নিচ্ছেন।
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 text-sm font-bold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'প্রসেসিং হচ্ছে...' : 'বিনামূল্যে অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-gray-500">
            পূর্বেই অ্যাকাউন্ট রয়েছে?{' '}
            <Link to="/login" className="font-bold text-rose-600 hover:text-rose-700">
              এখানে লগইন করুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
