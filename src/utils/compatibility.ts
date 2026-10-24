import { Profile, Gender } from '../types';

export interface CompatibilityCategory {
  score: number;
  max: number;
  name: string;
  matched: boolean;
}

export interface CompatibilityResult {
  score: number;
  label: string;
  reasons: string[];
  categories: {
    religious: CompatibilityCategory;
    age: CompatibilityCategory;
    location: CompatibilityCategory;
    education: CompatibilityCategory;
    marital: CompatibilityCategory;
  };
}

/**
 * Calculates a Shariah & matrimonial compatibility score (percentage) between
 * the current user's profile and a target candidate's profile based on preferences,
 * lifestyle, and religious attributes.
 */
export function calculateCompatibility(
  myProfile?: Profile | null,
  candidate?: Profile | null,
  isBengali: boolean = true
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

  // 1. Religious & Deeni Compatibility (25 pts)
  let relScore = 15;
  let relMatched = false;
  const myRel = myProfile.religiousInfo;
  const candRel = candidate.religiousInfo;
  if (myRel && candRel) {
    let matches = 0;
    if (myRel.praysFiveTimes && candRel.praysFiveTimes) matches++;
    if (myRel.canReciteQuran && candRel.canReciteQuran) matches++;
    if (myRel.maintainsMahram && candRel.maintainsMahram) matches++;
    if (candRel.wearsHijab || candRel.hasBeard) matches++;

    if (matches >= 3) {
      relScore = 25;
      relMatched = true;
      reasons.push(isBengali ? 'দ্বীনি ও ইসলামিক মূল্যবোধের পূর্ণ মিল' : 'High Islamic lifestyle alignment');
    } else if (matches >= 1) {
      relScore = 20;
      relMatched = true;
      reasons.push(isBengali ? 'দ্বীনি দৃষ্টিভঙ্গি ও অভ্যাসের মিল' : 'Moderate religious alignment');
    }
  } else if (candRel?.praysFiveTimes) {
    relScore = 22;
    relMatched = true;
    reasons.push(isBengali ? '৫ ওয়াক্ত নামাজি পাত্র/পাত্রী' : 'Practicing 5-time prayer');
  }
  totalScore += relScore;

  // 2. Age Compatibility (20 pts)
  let ageScore = 12;
  let ageMatched = false;
  const candidateAge = candidate.age;
  if (candidateAge) {
    const minAge = prefs.minAge || (myProfile.gender === Gender.FEMALE ? (myProfile.age || 20) : (myProfile.age || 25) - 5);
    const maxAge = prefs.maxAge || (myProfile.gender === Gender.FEMALE ? (myProfile.age || 20) + 8 : (myProfile.age || 25) + 3);

    if (candidateAge >= minAge && candidateAge <= maxAge) {
      ageScore = 20;
      ageMatched = true;
      reasons.push(isBengali ? 'কাঙ্ক্ষিত বয়সসীমা সম্পূর্ণ মিলেছে' : 'Age within expected range');
    } else if (Math.abs(candidateAge - minAge) <= 2 || Math.abs(candidateAge - maxAge) <= 2) {
      ageScore = 16;
      ageMatched = true;
      reasons.push(isBengali ? 'বয়সসীমা কাছাকাছি' : 'Age is close to preference');
    }
  } else {
    ageScore = 15;
  }
  totalScore += ageScore;

  // 3. Upazila / Location (20 pts)
  let locScore = 12;
  let locMatched = false;
  if (prefs.preferredUpazilas && prefs.preferredUpazilas.length > 0) {
    if (prefs.preferredUpazilas.includes(candidate.upazila)) {
      locScore = 20;
      locMatched = true;
      reasons.push(isBengali ? 'পছন্দের উপজেলা মিলেছে' : 'Preferred Upazila matched');
    } else {
      locScore = 14;
      reasons.push(isBengali ? 'টাঙ্গাইল জেলার অভ্যন্তরে' : 'Within Tangail district');
    }
  } else {
    if (myProfile.upazila && candidate.upazila && myProfile.upazila === candidate.upazila) {
      locScore = 20;
      locMatched = true;
      reasons.push(isBengali ? 'নিজ উপজেলার পাত্র/পাত্রী' : 'Same native Upazila');
    } else {
      locScore = 15;
    }
  }
  totalScore += locScore;

  // 4. Education Compatibility (20 pts)
  let eduScore = 12;
  let eduMatched = false;
  if (prefs.preferredEducation && prefs.preferredEducation.length > 0) {
    if (candidate.education && prefs.preferredEducation.includes(candidate.education)) {
      eduScore = 20;
      eduMatched = true;
      reasons.push(isBengali ? 'পছন্দের শিক্ষাগত যোগ্যতা মিলেছে' : 'Preferred education matched');
    } else {
      eduScore = 14;
    }
  } else {
    if (myProfile.education && candidate.education) {
      eduScore = 18;
      eduMatched = true;
      reasons.push(isBengali ? 'শিক্ষাগত সমতা রয়েছে' : 'Comparable educational level');
    } else {
      eduScore = 14;
    }
  }
  totalScore += eduScore;

  // 5. Marital Status (15 pts)
  let marScore = 10;
  let marMatched = false;
  if (prefs.preferredMaritalStatus && prefs.preferredMaritalStatus.length > 0) {
    if (candidate.maritalStatus && prefs.preferredMaritalStatus.includes(candidate.maritalStatus)) {
      marScore = 15;
      marMatched = true;
      reasons.push(isBengali ? 'পছন্দের বৈবাহিক অবস্থা' : 'Preferred marital status matched');
    }
  } else {
    if (myProfile.maritalStatus && candidate.maritalStatus && myProfile.maritalStatus === candidate.maritalStatus) {
      marScore = 15;
      marMatched = true;
      reasons.push(isBengali ? 'একই বৈবাহিক অবস্থান' : 'Same marital status');
    } else {
      marScore = 12;
    }
  }
  totalScore += marScore;

  // Cap between 60% and 98%
  const finalScore = Math.min(Math.max(totalScore, 60), 98);

  let label = isBengali ? 'সাধারণ মিল' : 'Moderate Match';
  if (finalScore >= 88) {
    label = isBengali ? 'অসাধারণ মিল' : 'Exceptional Match';
  } else if (finalScore >= 78) {
    label = isBengali ? 'উত্তম মিল' : 'Great Match';
  }

  return {
    score: finalScore,
    label,
    reasons,
    categories: {
      religious: {
        score: relScore,
        max: 25,
        name: isBengali ? 'দ্বীনি অভ্যাস ও মূল্যবোধ' : 'Islamic Lifestyle',
        matched: relMatched,
      },
      age: {
        score: ageScore,
        max: 20,
        name: isBengali ? 'বয়স সামঞ্জস্য' : 'Age Compatibility',
        matched: ageMatched,
      },
      location: {
        score: locScore,
        max: 20,
        name: isBengali ? 'উপজেলা ও এলাকা' : 'Location & Upazila',
        matched: locMatched,
      },
      education: {
        score: eduScore,
        max: 20,
        name: isBengali ? 'শিক্ষাগত মিল' : 'Education Match',
        matched: eduMatched,
      },
      marital: {
        score: marScore,
        max: 15,
        name: isBengali ? 'বৈবাহিক অবস্থান' : 'Marital Status',
        matched: marMatched,
      },
    },
  };
}
