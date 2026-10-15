import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Heart, Search, ShieldCheck, MapPin, Users, Sparkles, ArrowRight } from 'lucide-react';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES, TangailUpazila } from '../constants/locations';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedGender, setSelectedGender] = useState<string>('female');
  const [selectedUpazila, setSelectedUpazila] = useState<string>('');

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedGender) params.append('gender', selectedGender);
    if (selectedUpazila) params.append('upazila', selectedUpazila);
    navigate(`/search?${params.toString()}`);
  };


  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-rose-50 via-pink-50/40 to-white py-16 lg:py-24 border-b border-rose-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>টাঙ্গাইলবাসীর একনিষ্ঠ ও বিশ্বস্ত পাত্র-পাত্রী সন্ধান</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-tight">
              টাঙ্গাইলের মানুষের জন্য টাঙ্গাইলেই{' '}
              <span className="bg-linear-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                খাঁটি জীবনসঙ্গী
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-650 max-w-2xl mx-auto leading-relaxed">
              মধুবন্ধন আপনাকে সাহায্য করবে আপনার নিজ সংস্কৃতি, মূল্যবোধ ও টাঙ্গাইল জেলার উপযুক্ত ও
              ভেরিফাইড পরিবারের সাথে শুভ পরিণয়ে আবদ্ধ হতে।
            </p>
          </div>

          {/* Quick Search Widget */}
          <div className="mt-10 max-w-3xl mx-auto bg-white p-5 sm:p-7 rounded-3xl shadow-xl shadow-rose-200/50 border border-rose-100">
            <form onSubmit={handleQuickSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1.5">আমি খুঁজছি</label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full text-sm font-medium border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-rose-500 transition-colors"
                >
                  <option value="female">পাত্রীর বায়োডাটা</option>
                  <option value="male">পাত্রের বায়োডাটা</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-750 mb-1.5">উপজেলা নির্বাচন</label>
                <select
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  className="w-full text-sm font-medium border border-gray-200 rounded-xl p-3 bg-gray-50 focus:bg-white focus:outline-hidden focus:border-rose-500 transition-colors"
                >
                  <option value="">টাঙ্গাইলের সকল উপজেলা</option>
                  {TANGAIL_UPAZILAS.map((upazila) => (
                    <option key={upazila} value={upazila}>
                      {UPAZILA_DISPLAY_NAMES[upazila]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 px-5 text-sm font-bold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>বায়োডাটা খুঁজুন</span>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Features banner */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-3.5 p-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-rose-100/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">শুধুমাত্র টাঙ্গাইল জেলা</h4>
                <p className="text-xs text-gray-550">১২টি উপজেলার স্থানীয় পাত্র-পাত্রী</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-rose-100/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">গোপনীয়তা ও নিরাপত্তা</h4>
                <p className="text-xs text-gray-550">অনুমতি ছাড়া যোগাযোগের তথ্য অপ্রকাশ্য</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-4 bg-white/70 backdrop-blur-xs rounded-2xl border border-rose-100/60 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">১৮+ প্রাপ্তবয়স্ক যাচাই</h4>
                <p className="text-xs text-gray-550">আইনি ও ধর্মীয় অনুশাসনের শতভাগ মান্যতা</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upazila Explorer Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            টাঙ্গাইলের উপজেলাভিত্তিক পাত্র-পাত্রী
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            আপনার পছন্দের নির্দিষ্ট উপজেলা থেকে পাত্র অথবা পাত্রীর সন্ধান শুরু করুন
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {TANGAIL_UPAZILAS.map((upazila) => (
            <Link
              key={upazila}
              to={`/search?upazila=${upazila}`}
              className="p-3.5 bg-white hover:bg-rose-50 border border-gray-200 hover:border-rose-300 rounded-xl text-center group transition-all duration-200 shadow-2xs hover:shadow-sm"
            >
              <span className="block text-sm font-bold text-gray-800 group-hover:text-rose-600">
                {UPAZILA_DISPLAY_NAMES[upazila as TangailUpazila]}
              </span>
              <span className="text-[11px] text-gray-400 group-hover:text-rose-500 flex items-center justify-center gap-1 mt-1">
                <span>অনুসন্ধান</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to action section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-linear-to-r from-rose-600 via-rose-500 to-pink-600 rounded-3xl p-8 sm:p-14 text-white text-center shadow-xl shadow-rose-200">
          <div className="max-w-2xl mx-auto space-y-4">
            <Heart className="w-12 h-12 mx-auto text-rose-200 fill-current animate-pulse" />
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              আপনার বায়োডাটাও যুক্ত করুন মধুবন্ধনে
            </h2>
            <p className="text-sm sm:text-base text-rose-100 leading-relaxed">
              সম্পূর্ণ বিনামূল্যে আপনার বা আপনার সন্তানের বায়োডাটা তৈরি করুন এবং টাঙ্গাইল জেলার
              মনমতো জীবনসঙ্গী খুঁজে নিন।
            </p>
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-rose-700 font-bold text-sm shadow-md hover:bg-rose-50 transition-colors"
              >
                বায়োডাটা তৈরি করুন (ফ্রি)
              </Link>
              <Link
                to="/search"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-rose-700/60 hover:bg-rose-700 text-white font-bold text-sm border border-rose-400 transition-colors"
              >
                বায়োডাটা অনুসন্ধান করুন
              </Link>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default HomePage;
