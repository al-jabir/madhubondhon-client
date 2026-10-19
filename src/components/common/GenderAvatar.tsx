import React from 'react';
import { Gender } from '../../types';

interface GenderAvatarProps {
  gender: Gender | string | undefined;
  /** pixel size of the round avatar */
  size?: number;
  className?: string;
}

/**
 * Gender-based illustrated avatar.
 *
 * The platform never shows members' original photographs on public pages —
 * every profile (search cards, detail pages, shortlist, interests, contacts,
 * recommendations) gets one of these instead: a distinct illustration for
 * পাত্র (male) and পাত্রী (female), inline SVG so it renders crisply at any
 * size, stays theme-aware, and adds zero image requests.
 */
export const GenderAvatar: React.FC<GenderAvatarProps> = ({ gender, size = 96, className = '' }) => {
  const isMale =
    gender === Gender.MALE
    || (typeof gender === 'string' && gender.toLowerCase() === 'male');

  const uid = isMale ? 'mb-av-m' : 'mb-av-f';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      role="img"
      aria-label={isMale ? 'পাত্রের প্রোফাইল' : 'পাত্রীর প্রোফাইল'}
      className={`rounded-full ${className}`}
    >
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1">
          {isMale ? (
            <>
              <stop offset="0" stopColor="#10b981" />
              <stop offset="1" stopColor="#0d9488" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#e11d48" />
              <stop offset="1" stopColor="#ec4899" />
            </>
          )}
        </linearGradient>
      </defs>

      {/* soft backdrop wash */}
      <circle cx="48" cy="48" r="48" fill={`url(#${uid}-bg)`} />
      <circle cx="48" cy="30" r="26" fill="#ffffff" opacity="0.08" />

      {isMale ? (
        <g fill="#ffffff">
          {/* short hair cap */}
          <path d="M31 38 q3 -20 17 -20 q14 0 17 20 q-3 -6 -17 -6 q-14 0 -17 6 z" opacity="0.9" />
          {/* head */}
          <circle cx="48" cy="40" r="14" />
          {/* shoulders / suit */}
          <path d="M22 96 q0 -26 26 -26 q26 0 26 26 z" />
          {/* collar V */}
          <path d="M48 74 l-8 -6 l8 16 l8 -16 z" fill="#10b981" opacity="0.85" />
        </g>
      ) : (
        <g fill="#ffffff">
          {/* long hair falling past both shoulders */}
          <path d="M29 44 q-4 -26 19 -26 q23 0 19 26 q2 14 -2 22 q-4 4 -6 -2 q3 -10 -1 -22 v-8 q-10 -8 -20 0 v8 q-4 12 -1 22 q-2 6 -6 2 q-4 -8 -2 -22 z" opacity="0.95" />
          {/* head */}
          <circle cx="48" cy="40" r="12.5" />
          {/* shoulders / modest dress */}
          <path d="M24 96 q0 -24 24 -24 q24 0 24 24 z" />
          {/* scarf line */}
          <path d="M32 84 q16 8 32 0 q-2 -6 -8 -8 q-8 3 -16 0 q-6 2 -8 8 z" fill="#e11d48" opacity="0.7" />
        </g>
      )}
    </svg>
  );
};

export default GenderAvatar;
