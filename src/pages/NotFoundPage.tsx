import React from 'react';
import { Link } from 'react-router';
import { Heart, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <Heart className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-black text-gray-900">৪০৪ — পৃষ্ঠাটি পাওয়া যায়নি</h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা বিদ্যমান নেই।
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-linear-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 rounded-xl shadow-md shadow-rose-200 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
