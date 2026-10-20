import axios from 'axios';
export function getApiErrorMessage(error: unknown, fallback = 'কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।'): string {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : fallback;
  if (!error.response) return import.meta.env.DEV
    ? 'Local server-এর সঙ্গে সংযোগ হচ্ছে না। প্রজেক্টের মূল ফোল্ডারে npm run dev চালু আছে কি দেখুন।'
    : 'সার্ভারের সঙ্গে সংযোগ হচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।';
  const body = error.response.data as { message?: string; errors?: Array<{ field?: string; message?: string }> };
  const details = body?.errors?.map(item => item.message).filter((m): m is string => Boolean(m && m.trim()));
  if (details?.length) {
    return [...new Set(details)].join(' • ');
  }
  if (body?.message && body.message !== 'ভ্যালিডেশন ব্যর্থ হয়েছে।') {
    return body.message;
  }
  if (body?.message) {
    return 'প্রদত্ত তথ্যে ভুল রয়েছে। অনুগ্রহ করে প্রয়োজনীয় ফিল্ডগুলো সঠিকভাবে পূরণ করুন।';
  }
  return fallback;
}
