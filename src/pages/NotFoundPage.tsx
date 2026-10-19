import React from 'react';
import { Link } from 'react-router';
import { Heart, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 text-center">
      <div className="max-w-md w-full space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-brand-soft text-brand border border-brand/20 flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 fill-brand/10" />
        </div>
        <h1 className="text-4xl font-bold text-ink">৪০৪ — পৃষ্ঠাটি পাওয়া যায়নি</h1>
        <p className="text-sm text-ink-2 leading-relaxed">
          দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন তা স্থানান্তরিত হয়েছে অথবা বিদ্যমান নেই।
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="mb-btn-primary px-6 py-3 text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>
          <Link to="/search" className="mb-btn-secondary text-xs">
            বায়োডাটা খুঁজুন
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
