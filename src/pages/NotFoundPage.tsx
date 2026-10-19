import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, Compass, Heart, HeartCrack, Search, Sparkles } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [biodataId, setBiodataId] = React.useState('');
  const wrongPath = location.pathname !== '/';

  return (
    <div className="relative overflow-hidden">
      {/* Decorative floating blobs — soft brand glow in both themes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-brand/10 blur-3xl animate-pulse"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl animate-pulse [animation-delay:1200ms]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 left-1/4 w-80 h-80 rounded-full bg-brand/5 blur-3xl"
      />

      <div className="relative max-w-2xl mx-auto px-4 py-20 sm:py-28 flex flex-col items-center text-center">
        {/* 404 hero — giant gradient ৪০৪ with broken-heart badge */}
        <div className="relative">
          <h1 className="text-[6.5rem] sm:text-[9rem] leading-none font-black tracking-tight bg-linear-to-r from-brand via-pink-500 to-brand bg-clip-text text-transparent select-none" dir="ltr">
            404
          </h1>
          <div className="absolute -right-5 sm:-right-8 bottom-2 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-card border border-line shadow-lg flex items-center justify-center rotate-6 animate-pulse [animation-delay:600ms]">
            <HeartCrack className="w-6 h-6 sm:w-7 sm:h-7 text-brand" />
          </div>
          <Heart
            aria-hidden="true"
            className="absolute -left-6 sm:-left-10 -top-3 w-5 h-5 sm:w-6 sm:h-6 text-brand/40 fill-brand/20"
          />
          <Sparkles
            aria-hidden="true"
            className="absolute left-6 sm:left-10 bottom-0 w-4 h-4 sm:w-5 sm:h-5 text-gold/70"
          />
        </div>

        {/* Copy */}
        <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-ink">
          এই পৃষ্ঠাটি কোথাও হারিয়ে গেছে
        </h2>
        <p className="mt-2 text-sm sm:text-base text-ink-2 leading-relaxed max-w-md">
          ভুল ঠিকানা হতে পারে, অথবা পৃষ্ঠাটি সরিয়ে নেওয়া হয়েছে। মন খারাপ করবেন না — আপনার জন্য নিশ্চয়ই কেউ একজন অপেক্ষা করছে মধুবন্ধনে।
        </p>

        {/* Requested path chip */}
        {wrongPath && (
          <p className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-elev px-3 py-1 text-[11px] text-ink-3">
            <Compass className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate font-mono" dir="ltr">
              {location.pathname}
            </span>
          </p>
        )}

        {/* Quick biodata search — a real way back in */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const query = biodataId.trim().toUpperCase();
            navigate(query ? `/search?biodataId=${encodeURIComponent(query)}` : '/search');
          }}
          className="mt-7 w-full max-w-sm"
        >
          <label htmlFor="nf-biodata-id" className="sr-only">
            বায়োডাটা নম্বর দিয়ে খুঁজুন
          </label>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-card p-1.5 shadow-sm focus-within:border-brand/50">
            <div className="pl-2 text-ink-3">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="nf-biodata-id"
              value={biodataId}
              onChange={(event) => setBiodataId(event.target.value.toUpperCase())}
              placeholder="বায়োডাটা নম্বর, যেমন MB-M101"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
              dir="auto"
            />
            <button type="submit" className="mb-btn-primary !px-4 !py-2 !text-xs shrink-0">
              খুঁজুন
            </button>
          </div>
        </form>

        {/* Quick links */}
        <div className="mt-8 pt-6 w-full max-w-sm border-t border-line flex flex-wrap items-center justify-center gap-2.5">
          <Link to="/" className="mb-btn-secondary !text-xs">
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>
          <Link to="/search" className="mb-btn-secondary !text-xs">
            বায়োডাটা অনুসন্ধান
          </Link>
          <Link to="/faq" className="mb-btn-secondary !text-xs">
            সহায়িকা (FAQ)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
