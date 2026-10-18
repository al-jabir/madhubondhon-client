import PublicStatistics from '../components/profile/PublicStatistics';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowDown, ArrowRight, Check, Heart, MapPin, Search, ShieldCheck, Sparkles, UserRoundPlus, FileCheck2, MessagesSquare, Handshake } from 'lucide-react';
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES } from '../constants/locations';
import './HomePage.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [gender, setGender] = useState('female');
  const [upazila, setUpazila] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ gender });
    if (upazila) params.set('upazila', upazila);
    if (maritalStatus) params.set('maritalStatus', maritalStatus);
    navigate('/search?' + params.toString());
  };
  return (
    <div className="mb-home">
      <section className="mb-hero">
        <div className="mb-shell mb-hero-grid">
          <div className="mb-hero-copy">
            <span className="mb-eyebrow"><span className="mb-status-dot" /> টাঙ্গাইলের মানুষের জন্য, আন্তরিক এক উদ্যোগ</span>
            <h1>একই শিকড়ের টানে,<br className="hidden sm:inline" /> শুরু হোক <span>নতুন গল্প।</span></h1>
            <p className="mb-intro">পরিচিত সংস্কৃতি, কাছের মানুষ আর মিল থাকা মূল্যবোধ। টাঙ্গাইলের মধ্যেই খুঁজে নিন আপনার উপযুক্ত জীবনসঙ্গী।</p>
            <div className="mb-hero-links">
              <Link to="/register" className="mb-primary">বিনামূল্যে বায়োডাটা তৈরি করুন <ArrowRight size={17} /></Link>
              <a href="#how-it-works" className="mb-text-link">যেভাবে কাজ করে <ArrowDown size={16} /></a>
            </div>
            <div className="mb-small-proof"><ShieldCheck size={18} /><span>আপনার অনুমতি ছাড়া যোগাযোগের তথ্য প্রকাশ করা হয় না</span></div>
            <div className="mb-flower" aria-hidden="true">
              <svg viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="68" /><ellipse cx="90" cy="90" rx="28" ry="68" /><ellipse cx="90" cy="90" rx="28" ry="68" transform="rotate(60 90 90)" /><ellipse cx="90" cy="90" rx="28" ry="68" transform="rotate(120 90 90)" /><circle cx="90" cy="90" r="11" /></svg>
            </div>
          </div>
          <div className="mb-search-wrap">
            <div className="mb-search-topline"><Heart size={16} /> একটি সুন্দর পরিচয়ের প্রথম ধাপ</div>
            <div className="mb-search-card">
              <div className="mb-card-heading"><div><span className="mb-kicker">আপনার পছন্দ, আপনার অনুসন্ধান</span><h2>কেমন জীবনসঙ্গী খুঁজছেন?</h2></div><div className="mb-search-icon"><Search size={23} /></div></div>
              <form onSubmit={search} className="mb-search-form">
                <fieldset><legend>আমি খুঁজছি</legend><div className="mb-gender-options">{[['female', 'পাত্রীর বায়োডাটা'], ['male', 'পাত্রের বায়োডাটা']].map(([value, label]) => <label key={value} className={gender === value ? 'is-selected' : ''}><input type="radio" name="gender" value={value} checked={gender === value} onChange={() => setGender(value)} /><span>{label}</span>{gender === value && <Check size={15} />}</label>)}</div></fieldset>
                <div><label className="mb-field-label" htmlFor="home-upazila">কোন উপজেলায় খুঁজতে চান?</label><div className="mb-select-wrap"><MapPin size={18} /><select id="home-upazila" value={upazila} onChange={e => setUpazila(e.target.value)}><option value="">টাঙ্গাইলের সকল উপজেলা</option>{TANGAIL_UPAZILAS.map(up => <option key={up} value={up}>{UPAZILA_DISPLAY_NAMES[up]}</option>)}</select></div></div>
                <div><label className="mb-field-label" htmlFor="home-marital-status">বৈবাহিক অবস্থা</label><div className="mb-select-wrap"><Heart size={18} aria-hidden="true" /><select id="home-marital-status" value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)}><option value="">সকল অবস্থা</option><option value="never_married">অবিবাহিত</option><option value="divorced">বিবাহবিচ্ছেদ হয়েছে</option><option value="widowed">বিধবা / বিপত্নীক</option><option value="separated">পৃথক বসবাস</option></select></div></div>
                <button className="mb-search-button" type="submit"><Search size={18} /> বায়োডাটা খুঁজুন <ArrowRight size={18} /></button>
              </form>
              <p className="mb-search-note">আপনার পছন্দের সঙ্গে মিলে যাওয়া বায়োডাটা পরের পেজে দেখুন</p>
            </div>
            <div className="mb-search-bottom"><span><Check size={14} /> শুধু টাঙ্গাইলের ১২ উপজেলা</span><span><Check size={14} /> ১৮ বছর বা তার বেশি</span></div>
          </div>
        </div>
      </section>

      <section className="mb-principles mb-shell" aria-label="আমাদের অঙ্গীকার">
        {[{icon:MapPin,title:'কাছের মানুষ, পরিচিত পরিবেশ',description:'টাঙ্গাইলের ১২ উপজেলাকে ঘিরে জীবনসঙ্গীর সন্ধান।'}, {icon:ShieldCheck,title:'গোপনীয়তায় আপনার নিয়ন্ত্রণ',description:'অনুমতি অনুযায়ী অভিভাবকের সঙ্গে যোগাযোগ।'}, {icon:FileCheck2,title:'পর্যালোচনার পর প্রকাশ',description:'জমা দেওয়া বায়োডাটা যাচাই করেন মডারেটর।'}].map(({icon:Icon,title,description}) => <div className="mb-principle" key={title}><div className="mb-line-icon"><Icon size={24} strokeWidth={1.5} /></div><div><h3>{title}</h3><p>{description}</p></div></div>)}
      </section>

      <PublicStatistics />

      <section className="mb-section mb-shell" id="how-it-works">
        <div className="mb-section-heading"><div><span className="mb-kicker">সহজ চারটি ধাপ</span><h2>পরিচয় থেকে পরিণয়ের পথে</h2></div><p>নিজের তথ্য দিয়ে শুরু করুন। সময় নিয়ে জানুন, পরিবারের সঙ্গে আলোচনা করে সিদ্ধান্ত নিন।</p></div>
        <div className="mb-steps">{[{icon:UserRoundPlus,n:'০১',title:'নিজের বায়োডাটা তৈরি',body:'অ্যাকাউন্ট খুলে নিজের পরিচয়, পরিবার ও প্রত্যাশার তথ্য পূরণ করুন।'}, {icon:Search,n:'০২',title:'পছন্দ মিলিয়ে অনুসন্ধান',body:'উপজেলা, বয়স, শিক্ষা ও পেশার ফিল্টারে উপযুক্ত বায়োডাটা খুঁজুন।'}, {icon:MessagesSquare,n:'০৩',title:'পরিবারের সঙ্গে যোগাযোগ',body:'আগ্রহ প্রকাশ করুন। অনুমতি পেলে অভিভাবকের সঙ্গে কথা এগিয়ে নিন।'}, {icon:Handshake,n:'০৪',title:'বিবাহের সুন্দর পরিণয়',body:'তথ্য যাচাই ও পারিবারিক আলোচনার পর উভয় পক্ষের সম্মতিতে বিবাহের সিদ্ধান্ত নিন।'}].map(({icon:Icon,n,title,body}) => <article className="mb-step" key={n}><div className="mb-step-top"><Icon size={25} strokeWidth={1.5} /><span>{n}</span></div><h3>{title}</h3><p>{body}</p></article>)}</div>
      </section>

      <section className="mb-local-section">
        <div className="mb-shell"><div className="mb-section-heading"><div><span className="mb-kicker">নিজের এলাকার মানুষ</span><h2>এক জেলা, বারোটি পরিচিত ঠিকানা</h2></div><p>আপনার পছন্দের উপজেলা বেছে নিন। সেই এলাকার বায়োডাটা দেখুন অনুসন্ধান পেজে।</p></div><div className="mb-locations">{TANGAIL_UPAZILAS.map((up, i) => <Link key={up} to={'/search?upazila=' + up}><span className="mb-location-number">{(i + 1).toLocaleString('bn-BD', {minimumIntegerDigits:2})}</span><span>{UPAZILA_DISPLAY_NAMES[up]}</span><ArrowRight size={17} /></Link>)}</div></div>
      </section>

      <section className="mb-section mb-shell"><div className="mb-invitation"><div className="mb-invitation-art" aria-hidden="true"><Heart size={62} strokeWidth={1} /><Sparkles size={23} /></div><div><span className="mb-kicker">আপনার গল্পের অপেক্ষায়</span><h2>সুন্দর শুরুর প্রথম পদক্ষেপ নিন।</h2><p>আপনার বায়োডাটা তৈরি করুন। টাঙ্গাইলের মানুষের সঙ্গে পরিচয়ের নতুন দরজা খুলুন।</p></div><Link to="/register" className="mb-primary">বায়োডাটা তৈরি করুন <ArrowRight size={18} /></Link></div></section>
    </div>
  );
};
export default HomePage;
