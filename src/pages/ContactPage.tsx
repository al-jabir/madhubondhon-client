import React, { useState } from 'react';
import { Link } from 'react-router';
import { Phone, MessageCircle, Clock, ShieldAlert, Mail, HelpCircle, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '../i18n/LanguageContext';
import { adminApi } from '../api/admin.api';

const HELPLINE_BN = '০১৭০০–০০০০০০';
const HELPLINE_EN = '+880 1700-000000';
const PHONE_LOCAL = '+8801700000000';

export const ContactPage: React.FC = () => {
  const { isBengali } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const submitMutation = useMutation({
    mutationFn: () => adminApi.submitSupportMessage({ name, email, phone, subject, message }),
    onSuccess: () => {
      toast.success(
        isBengali
          ? 'আপনার বার্তা সফলভাবে পৌঁছেছে! অ্যাডমিন টিম শীঘ্রই উত্তর দেবে।'
          : 'Your inquiry has been sent successfully! Our team will reply shortly.'
      );
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || (isBengali ? 'বার্তা পাঠাতে সমস্যা হয়েছে।' : 'Failed to send message.'));
    },
  });

  const whatsappMsg = encodeURIComponent(
    isBengali
      ? 'আসসালামু আলাইকুম, মধুবন্ধন সাপোর্টে যোগাযোগ করতে চাই।'
      : 'Assalamu Alaikum, I would like to contact MadhuBondhon support.'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      toast.error(isBengali ? 'দয়া করে সবগুলো আবশ্যক ঘর পূরণ করুন' : 'Please fill all required fields');
      return;
    }
    submitMutation.mutate();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="mb-badge">{isBengali ? 'যোগাযোগ' : 'Contact Us'}</span>
        <h1 className="text-3xl sm:text-4xl font-black text-ink">
          {isBengali ? 'আমাদের সাথে যোগাযোগ করুন' : 'Get in Touch With Us'}
        </h1>
        <p className="text-sm sm:text-base text-ink-2 max-w-xl mx-auto leading-relaxed">
          {isBengali
            ? 'যেকোনো প্রশ্ন, রিপোর্ট বা সহায়তার প্রয়োজনে হোয়াটসঅ্যাপ হেল্পলাইনে যোগাযোগ করুন — মডারেটর দ্বীনি উপায়ে দ্রুত সহায়তা করেন।'
            : 'For inquiries, verification, or reporting, reach out via our WhatsApp helpline — our moderation team responds promptly and courteously.'}
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* WhatsApp (primary) */}
        <div className="mb-card p-6 space-y-4 sm:row-span-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-ink">
              {isBengali ? 'হোয়াটসঅ্যাপ হেল্পলাইন' : 'WhatsApp Helpline'}
            </h2>
            <p className="text-xs text-ink-2 leading-relaxed">
              {isBengali
                ? 'সবচেয়ে দ্রুত যোগাযোগের মাধ্যম। বায়োডাটা রিপোর্ট, পেমেন্ট যাচাই ও যেকোনো বিষয়ে প্রয়োজনের পাশে আমরা সবসময় আছি।'
                : 'Our fastest support channel. We are always here to assist with profile review, payment verification, and safety concerns.'}
            </p>
          </div>
          <div className="rounded-2xl bg-elev border border-line p-4 text-center space-y-1.5">
            <p className="text-ink-3 text-[11px] font-semibold">{isBengali ? 'নম্বর' : 'Number'}</p>
            <p className="text-lg font-black text-ink tracking-wide" dir="ltr">
              {isBengali ? HELPLINE_BN : HELPLINE_EN}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href={`https://api.whatsapp.com/send?phone=${PHONE_LOCAL.replace(/\D/g, '')}&text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-400 transition-colors"
            >
              <MessageCircle className="w-4.5 h-4.5" />
              <span>{isBengali ? 'WhatsApp-এ কথা বলুন' : 'Chat on WhatsApp'}</span>
            </a>
            <a
              href={`tel:${PHONE_LOCAL}`}
              className="mb-btn-secondary w-full justify-center"
            >
              <Phone className="w-4 h-4" />
              <span>{isBengali ? 'সরাসরি কল করুন' : 'Call Directly'}</span>
            </a>
          </div>
        </div>

        {/* Hours */}
        <div className="mb-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-brand-soft text-brand flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-ink">{isBengali ? 'সহায়তার সময়' : 'Support Hours'}</h3>
          <ul className="text-xs text-ink-2 space-y-1.5 leading-relaxed">
            <li>
              {isBengali
                ? 'শনি – বৃহস্পতি: সকাল ১০টা – রাত ১০টা'
                : 'Sat – Thu: 10:00 AM – 10:00 PM'}
            </li>
            <li>
              {isBengali
                ? 'শুক্রবার: বাদ জুমা, বিকেল ৩টা – রাত ১০টা'
                : 'Friday: Post-Jummah, 3:00 PM – 10:00 PM'}
            </li>
            <li>
              {isBengali
                ? 'রিপোর্ট সংক্রান্ত বিষয় ২৪ ঘণ্টার মধ্যে পর্যালোচিত হয়'
                : 'Safety reports are reviewed within 24 hours'}
            </li>
          </ul>
        </div>

        {/* Other channels */}
        <div className="mb-card p-6 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gold-soft text-gold flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-ink">{isBengali ? 'অন্যান্য চ্যানেল' : 'Other Channels'}</h3>
          <ul className="text-xs text-ink-2 space-y-1.5 leading-relaxed">
            <li>
              {isBengali
                ? 'টাঙ্গাইল শহরের অনুমোদিত স্থানীয় প্রতিনিধিদের সাথে সাক্ষাৎ করা যায়'
                : 'Authorized local representatives available across Tangail'}
            </li>
            <li>
              {isBengali ? 'প্রশাসনিক জিজ্ঞাসা: ' : 'Official queries: '}
              <span className="font-mono text-ink" dir="ltr">
                staff@madhubondhon.com
              </span>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-ink-3" />
              <span>{isBengali ? 'টাঙ্গাইল সদর, টাঙ্গাইল ১৯০০' : 'Tangail Sadar, Tangail 1900'}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Safety note */}
      <div className="rounded-2xl bg-gold-soft border border-gold/25 p-5 flex items-start gap-3 text-xs text-gold leading-relaxed">
        <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
        <p>
          {isBengali
            ? 'সতর্কতা: মডারেটর কখনো আপনাকে টাকা চাইবে না। নিশ্চিত না হয়ে কারো সাথে কোনো অর্থ লেনদেন করবেন না — প্রতারণা এড়াতে সবসময় সতর্ক থাকুন।'
            : 'Advisory: MadhuBondhon moderators will never ask for unauthorized payments. Always stay cautious and avoid monetary transactions before direct family verification.'}
        </p>
      </div>

      {/* Online Contact / Inquiry Form */}
      <div className="mb-card rounded-3xl p-6 sm:p-8 border border-line space-y-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-soft text-brand text-xs font-bold rounded-full">
            <Mail className="w-3.5 h-3.5" />
            <span>{isBengali ? 'সরাসরি বার্তা' : 'Direct Message'}</span>
          </div>
          <h2 className="text-xl font-black text-ink">
            {isBengali ? 'আমাদের কাছে সরাসরি প্রশ্ন বা বার্তা পাঠান' : 'Send Us a Direct Message'}
          </h2>
          <p className="text-xs text-ink-3">
            {isBengali
              ? 'আপনার যেকোনো জিজ্ঞাসা, পরামর্শ বা সহায়তার জন্য নিচের ফর্মটি পূরণ করুন।'
              : 'Fill out the form below and our team will get back to you promptly.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-ink">{isBengali ? 'আপনার নাম *' : 'Your Name *'}</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isBengali ? 'যেমন: মোহাম্মদ সাইফুল' : 'e.g. John Doe'}
                className="mb-input w-full"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-ink">{isBengali ? 'ইমেইল ঠিকানা *' : 'Email Address *'}</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mb-input w-full font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-bold text-ink">{isBengali ? 'মোবাইল নম্বর (ঐচ্ছিক)' : 'Phone (Optional)'}</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="mb-input w-full font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-ink">{isBengali ? 'বার্তার বিষয় *' : 'Subject *'}</label>
              <input
                required
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={isBengali ? 'যেমন: বায়োডাটা সংশোধন বা পেমেন্ট সংক্রান্ত' : 'Subject'}
                className="mb-input w-full"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-ink">{isBengali ? 'আপনার বার্তা *' : 'Message *'}</label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isBengali ? 'বিস্তারিত লিখুন...' : 'Write your inquiry here...'}
              className="mb-input w-full text-xs leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={submitMutation.isPending}
            className="mb-btn-primary px-6 py-2.5 rounded-xl cursor-pointer inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>
              {submitMutation.isPending
                ? isBengali
                  ? 'পাঠানো হচ্ছে...'
                  : 'Sending...'
                : isBengali
                ? 'বার্তা পাঠান'
                : 'Send Message'}
            </span>
          </button>
        </form>
      </div>

      {/* FAQ link */}
      <div className="text-center">
        <Link to="/faq" className="mb-btn-secondary text-xs inline-flex">
          <HelpCircle className="w-4 h-4" />
          <span>{isBengali ? 'সচরাচর জিজ্ঞাসা দেখুন' : 'View Frequently Asked Questions'}</span>
        </Link>
      </div>
    </div>
  );
};

export default ContactPage;
