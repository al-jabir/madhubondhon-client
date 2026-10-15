import axios from 'axios';
export function getApiErrorMessage(error: unknown, fallback = 'কাজটি সম্পন্ন করা যায়নি। আবার চেষ্টা করুন।'): string {
  if (!axios.isAxiosError(error)) return error instanceof Error ? error.message : fallback;
  if (!error.response) return import.meta.env.DEV
    ? 'Local server-এর সঙ্গে সংযোগ হচ্ছে না। প্রজেক্টের মূল ফোল্ডারে npm run dev চালু আছে কি দেখুন।'
    : 'সার্ভারের সঙ্গে সংযোগ হচ্ছে না। কিছুক্ষণ পরে আবার চেষ্টা করুন।';
  const body = error.response.data as { message?: string; errors?: Array<{message?: string}> };
  const details = body?.errors?.map(item => item.message).filter(Boolean);
  return details?.length ? [...new Set(details)].join(' ') : body?.message || fallback;
}
