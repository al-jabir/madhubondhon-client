export const TANGAIL_DISTRICT = 'tangail' as const;

export const TANGAIL_UPAZILAS = [
  'tangail_sadar',
  'basail',
  'bhuapur',
  'delduar',
  'dhanbari',
  'ghatail',
  'gopalpur',
  'kalihati',
  'madhupur',
  'mirzapur',
  'nagarpur',
  'sakhipur',
] as const;

export type TangailUpazila = (typeof TANGAIL_UPAZILAS)[number];

export const UPAZILA_DISPLAY_NAMES: Record<TangailUpazila, string> = {
  tangail_sadar: 'টাঙ্গাইল সদর',
  basail: 'বাসাইল',
  bhuapur: 'ভূঞাপুর',
  delduar: 'দেলদুয়ার',
  dhanbari: 'ধনবাড়ী',
  ghatail: 'ঘাটাইল',
  gopalpur: 'গোপালপুর',
  kalihati: 'কালিহাতী',
  madhupur: 'মধুপুর',
  mirzapur: 'মির্জাপুর',
  nagarpur: 'নাগরপুর',
  sakhipur: 'সখীপুর',
};

export const UPAZILA_EN_DISPLAY_NAMES: Record<TangailUpazila, string> = {
  tangail_sadar: 'Tangail Sadar',
  basail: 'Basail',
  bhuapur: 'Bhuapur',
  delduar: 'Delduar',
  dhanbari: 'Dhanbari',
  ghatail: 'Ghatail',
  gopalpur: 'Gopalpur',
  kalihati: 'Kalihati',
  madhupur: 'Madhupur',
  mirzapur: 'Mirzapur',
  nagarpur: 'Nagarpur',
  sakhipur: 'Sakhipur',
};

export const getUpazilaDisplayName = (key?: string, isBengali = true): string => {
  if (!key) return '';
  const up = key as TangailUpazila;
  if (!isBengali && UPAZILA_EN_DISPLAY_NAMES[up]) {
    return UPAZILA_EN_DISPLAY_NAMES[up];
  }
  return UPAZILA_DISPLAY_NAMES[up] || key;
};
