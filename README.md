# MadhuBondhon (মধুবন্ধন) — Frontend Client

আধুনিক, দ্বীনি ও নিরাপদ টাঙ্গাইল জেলা ভিত্তিক বৈবাহিক পাত্র-পাত্রী সন্ধান প্ল্যাটফর্ম (**MadhuBondhon — Tangail Matrimony**)।

---

## 🛠️ প্রযুক্তিগত স্ট্যাক (Tech Stack)

- **UI Framework:** React 19 + TypeScript
- **Bundler:** Vite 8
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`)
- **Routing:** React Router v8
- **Server State Management:** TanStack Query v5 (React Query)
- **HTTP Client:** Axios with JWT Interceptor & automatic token refresh
- **Toast Notifications:** Sonner
- **Icons:** Lucide React

---

## 🚀 রান করার নির্দেশিকা (How to Run)

### ১. পরিবেশ পরিবর্তনশীল (Environment Variables)
`client/.env` ফাইলে API URL কনফিগার করা আছে:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### ২. ডিপেন্ডেন্সি ইনস্টল ও সার্ভার চালু:
```bash
# ইনস্টল
npm install

# ডেভেলপমেন্ট সার্ভার চালু
npm run dev

# প্রোডাকশন বিল্ড টেস্ট
npm run build
```

---

## 🔑 টেস্ট অ্যাকাউন্ট তালিকা (Test Login Credentials)

সব টেস্ট অ্যাকাউন্টের ডিফল্ট পাসওয়ার্ড: `Password123!`

| রোল (Role) | ইমেইল (Email) | পাসওয়ার্ড | বিবরণ |
|---|---|---|---|
| **Super Admin** | `superadmin@madhubondhon.com` | `Password123!` | সকল পারমিশন ও রোল ম্যানেজমেন্ট |
| **Admin** | `admin@madhubondhon.com` | `Password123!` | ইউজার নিয়ন্ত্রণ ও স্ট্যাটাস আপডেট |
| **Moderator** | `moderator@madhubondhon.com` | `Password123!` | রিপোর্ট সমাধান ও প্রোফাইল অনুমোদন |
| **Customer (Male)** | `customer.male@madhubondhon.com` | `Password123!` | পাত্রের টেস্ট অ্যাকাউন্ট (টাঙ্গাইল সদর) |
| **Customer (Female)** | `customer.female@madhubondhon.com` | `Password123!` | পাত্রীর টেস্ট অ্যাকাউন্ট (মধুপুর) |

> **টিপস:** লগইন পৃষ্ঠায় এক-ক্লিকে টেস্ট অ্যাকাউন্টের ক্রেডেনশিয়াল পূরণ করার জন্য কুইক-ফিল বাটন যুক্ত করা হয়েছে।

---

## 📍 টাঙ্গাইল জেলার ১২টি উপজেলা (Single Source of Truth)

1. টাঙ্গাইল সদর (`tangail_sadar`)
2. বাসাইল (`basail`)
3. ভূঞাপুর (`bhuapur`)
4. দেলদুয়ার (`delduar`)
5. ধনবাড়ী (`dhanbari`)
6. ঘাটাইল (`ghatail`)
7. গোপালপুর (`gopalpur`)
8. কালিহাতী (`kalihati`)
9. মধুপুর (`madhupur`)
10. মির্জাপুর (`mirzapur`)
11. নাগরপুর (`nagarpur`)
12. সখীপুর (`sakhipur`)

---

## 📁 প্রজেক্ট আর্কিটেকচার (Architecture)

```
client/src/
├── api/             # Axios API ক্লায়েন্ট এবং এন্ডপয়েন্ট মেথড
│   ├── auth.api.ts
│   ├── profiles.api.ts
│   ├── interests.api.ts
│   ├── notifications.api.ts
│   ├── blocks.api.ts
│   ├── reports.api.ts
│   ├── admin.api.ts
│   └── locations.api.ts
├── components/      # রিইউজেবল UI কম্পোনেন্টস
│   ├── common/      # Navbar, Footer, ProtectedRoute, LoadingSpinner
│   └── profile/     # ProfileCard, SendInterestModal, ReportModal
├── constants/       # টাঙ্গাইলের ১২টি উপজেলা এবং কনস্ট্যান্ট
├── context/         # AuthContext (authentication & session management)
├── pages/           # রাউটভিত্তিক পেজসমূহ
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── SearchPage.tsx
│   ├── ProfileDetailPage.tsx
│   ├── MyProfilePage.tsx
│   ├── EditProfilePage.tsx
│   ├── InterestsPage.tsx
│   ├── NotificationsPage.tsx
│   ├── AdminDashboardPage.tsx
│   └── NotFoundPage.tsx
├── types/           # সেন্ট্রাল টাইপস্ক্রিপ্ট ইন্টারফেস ও এনাম
├── App.tsx          # রাউটিং ও প্রোভাইডার সেটআপ
└── main.tsx         # এন্ট্রি পয়েন্ট
```

## Deployed API

Production builds use .env.production: https://madhubondhon-server-742j.onrender.com/api/v1. Local npm run dev continues to use the local API proxy. A hosting environment VITE_API_URL overrides the file; set it to this same API URL if configured. Rebuild after changing it.

The Render API must allow the actual frontend origin in CORS_ORIGIN. For the current local UI: http://127.0.0.1:5174,http://localhost:5174. Add the hosted frontend origin when one is deployed. Do not add /api/v1 or a trailing slash to an origin. Render Environment changes must be saved and deployed. No local demo accounts or data are copied to the hosted database.

## Live frontend

Frontend: https://madhubondhon-client.vercel.app
Backend: https://madhubondhon-server-742j.onrender.com

Render CORS_ORIGIN must include https://madhubondhon-client.vercel.app (plus any local origins needed). Set VITE_API_URL=https://madhubondhon-server-742j.onrender.com/api/v1 in Vercel if an environment override exists, then redeploy. The included vercel.json serves index.html for client routes such as /search and /login on direct navigation.
