import { Profile, Gender } from '../types';

export interface CompatibilityResult {
  score: number;
  label: string;
  reasons: string[];
}

/**
 * Calculates a compatibility score (percentage) between the current user's profile
 * and a target candidate's profile based on preferences and attributes.
 */
export function calculateCompatibility(
  myProfile?: Profile | null,
  candidate?: Profile | null
): CompatibilityResult | null {
  if (!myProfile || !candidate) return null;
  if (myProfile._id === candidate._id || myProfile.user === candidate.user) return null;

  // If same gender, compatibility is not applicable for matrimonial purposes
  if (myProfile.gender && candidate.gender && myProfile.gender === candidate.gender) {
    return null;
  }

  let totalScore = 0;
  const reasons: string[] = [];
  const prefs = myProfile.preferences || {};

  // 1. Age Compatibility (25 pts)
  const candidateAge = candidate.age;
  if (candidateAge) {
    const minAge = prefs.minAge || (myProfile.gender === Gender.FEMALE ? (myProfile.age || 20) : (myProfile.age || 25) - 5);
    const maxAge = prefs.maxAge || (myProfile.gender === Gender.FEMALE ? (myProfile.age || 20) + 8 : (myProfile.age || 25) + 3);

    if (candidateAge >= minAge && candidateAge <= maxAge) {
      totalScore += 25;
      reasons.push('কাঙ্ক্ষিত বয়সসীমা সম্পূর্ণ মিলেছে');
    } else if (Math.abs(candidateAge - minAge) <= 2 || Math.abs(candidateAge - maxAge) <= 2) {
      totalScore += 18;
      reasons.push('বয়সসীমা কাছাকাছি');
    } else {
      totalScore += 10;
    }
  } else {
    totalScore += 20;
  }

  // 2. Upazila / Location (25 pts)
  if (prefs.preferredUpazilas && prefs.preferredUpazilas.length > 0) {
    if (prefs.preferredUpazilas.includes(candidate.upazila)) {
      totalScore += 25;
      reasons.push('পছন্দের উপজেলা মিলেছে');
    } else {
      totalScore += 12;
      reasons.push('টাঙ্গাইল জেলার অভ্যন্তরে');
    }
  } else {
    // If candidate is in the same upazila as the user
    if (myProfile.upazila && candidate.upazila && myProfile.upazila === candidate.upazila) {
      totalScore += 25;
      reasons.push('নিজ উপজেলার পাত্র/পাত্রী');
    } else {
      totalScore += 18;
    }
  }

  // 3. Education Compatibility (25 pts)
  if (prefs.preferredEducation && prefs.preferredEducation.length > 0) {
    if (candidate.education && prefs.preferredEducation.includes(candidate.education)) {
      totalScore += 25;
      reasons.push('পছন্দের শিক্ষাগত যোগ্যতা মিলেছে');
    } else {
      totalScore += 15;
    }
  } else {
    // Both higher educated or similar
    if (myProfile.education && candidate.education) {
      totalScore += 22;
      reasons.push('শিক্ষাগত সমতা রয়েছে');
    } else {
      totalScore += 18;
    }
  }

  // 4. Marital Status & Religious Orientation (25 pts)
  if (prefs.preferredMaritalStatus && prefs.preferredMaritalStatus.length > 0) {
    if (candidate.maritalStatus && prefs.preferredMaritalStatus.includes(candidate.maritalStatus)) {
      totalScore += 25;
      reasons.push('বৈবাহিক অবস্থানের মিল রয়েছে');
    } else {
      totalScore += 10;
    }
  } else {
    if (myProfile.maritalStatus && candidate.maritalStatus && myProfile.maritalStatus === candidate.maritalStatus) {
      totalScore += 25;
      reasons.push('বৈবাহিক অবস্থানের মিল রয়েছে');
    } else {
      totalScore += 18;
    }
  }

  // Cap between 60% and 98%
  const finalScore = Math.min(Math.max(totalScore, 60), 98);

  let label = 'সাধারণ মিল';
  if (finalScore >= 85) {
    label = 'অসাধারণ মিল';
  } else if (finalScore >= 75) {
    label = 'উত্তম মিল';
  }

  return {
    score: finalScore,
    label,
    reasons,
  };
}
