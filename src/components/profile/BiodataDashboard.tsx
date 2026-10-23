import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  workflowApi,
  errorMessage,
} from "../../api/workflow.api";
import { useAuth } from "../../context/useAuth";
import { useLanguage } from "../../i18n/LanguageContext";
import {Mail, CheckCircle2, CircleAlert, RotateCw} from "lucide-react";

const input = "mb-input w-full";

/* ─────────── Email Verification Card ─────────── */
function EmailVerificationCard({ verified }: { verified: boolean }) {
  const { user, refreshUser } = useAuth();
  const { isBengali } = useLanguage();
  const [challenge, setChallenge] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function request() {
    setBusy(true);
    try {
      const res = await workflowApi.requestVerification("email");
      setChallenge(res.data!.challengeId);
      setCode("");
      toast.success(
        isBengali
          ? "আপনার ইমেইলে যাচাই কোড পাঠানো হয়েছে।"
          : "Verification code sent to your email."
      );
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function confirm() {
    setBusy(true);
    try {
      await workflowApi.confirmVerification("email", challenge, code);
      await refreshUser();
      setChallenge("");
      setCode("");
      toast.success(
        isBengali
          ? "ইমেইল সফলভাবে যাচাই সম্পন্ন হয়েছে!"
          : "Email verification successful!"
      );
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl bg-elev border border-line p-5 space-y-3.5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              verified
                ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400"
                : "bg-brand-soft text-brand"
            }`}
          >
            <Mail className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink">
              {isBengali ? "ইমেইল যাচাই" : "Email Verification"}
            </h3>
            <p className="text-[11px] text-ink-3">
              {isBengali
                ? "অ্যাকাউন্টের একমাত্র আবশ্যক যাচাইকরণ (কোনো SMS প্রয়োজন নেই)"
                : "Primary required verification (No SMS required)"}
            </p>
          </div>
        </div>
        {verified ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isBengali ? "যাচাইকৃত" : "Verified"}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gold-soft text-gold border border-gold/25">
            <CircleAlert className="w-3.5 h-3.5" />
            <span>{isBengali ? "যাচাই বাকি" : "Pending"}</span>
          </span>
        )}
      </div>

      <div className="bg-card rounded-xl p-3 border border-line flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div>
          <span className="text-ink-3 mr-2">{isBengali ? "অ্যাকাউন্ট ইমেইল:" : "Account Email:"}</span>
          <strong className="text-ink font-mono">{user?.email}</strong>
        </div>
        {user?.phone && (
          <div className="text-ink-3">
            <span className="mr-1">{isBengali ? "সংরক্ষিত মোবাইল:" : "Saved Phone:"}</span>
            <span className="font-mono text-ink-2">{user.phone}</span>
          </div>
        )}
      </div>

      {!verified && (
        <div className="space-y-3 pt-1">
          <p className="text-xs text-ink-2 leading-relaxed">
            {isBengali
              ? "বায়োডাটা জমা দেওয়া এবং যোগাযোগের জন্য আপনার ইমেইলটি যাচাই করে নিন। নিচের বাটনে চাপলে আপনার ইমেইলে একটি ৬-সংখ্যার ওটিপি কোড পাঠানো হবে।"
              : "Verify your email to submit your biodata and receive notifications. A 6-digit code will be sent to your email."}
          </p>
          <button
            disabled={busy}
            onClick={request}
            className="mb-btn-secondary !text-xs py-2 px-4 rounded-xl cursor-pointer disabled:opacity-40 inline-flex items-center gap-1.5 bg-card"
          >
            <RotateCw className={`w-3.5 h-3.5 ${busy ? "animate-spin" : ""}`} />
            <span>
              {challenge
                ? isBengali
                  ? "আবার কোড পাঠান (১ মিনিট পর)"
                  : "Resend Code"
                : isBengali
                ? "ইমেইলে যাচাই কোড পাঠান"
                : "Send Code to Email"}
            </span>
          </button>

          {challenge && (
            <div className="space-y-2.5 max-w-sm pt-1">
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                className={`${input} text-center tracking-[0.35em] font-mono font-bold`}
                placeholder={isBengali ? "৬ সংখ্যার কোড" : "6-digit code"}
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                disabled={busy || code.length !== 6}
                onClick={confirm}
                className="mb-btn-primary px-4 py-2 text-xs w-full cursor-pointer disabled:opacity-50"
              >
                {isBengali ? "ইমেইল কোড যাচাই সম্পন্ন করুন" : "Confirm Email Verification"}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/** User tasks only: verify own email, declare consent, submit and edit. */
export default function BiodataDashboard(){
 const cache=useQueryClient();const [params]=useSearchParams();const {user}=useAuth();const {isBengali}=useLanguage();
 const {data,isLoading,isError,refetch}=useQuery({queryKey:['biodata-draft'],queryFn:workflowApi.getDraft});
 const app=data?.data?.application;const [consentChecked,setConsentChecked]=useState(false);const [busy,setBusy]=useState(false);
 const emailVerified=!!user?.isEmailVerified;const consent=!!app?.guardianConsentedAt;
 const canSubmit=!!app && ['draft','changes_requested','rejected'].includes(app.status);
 async function action(fn:()=>Promise<unknown>){setBusy(true);try{await fn();setConsentChecked(false);await Promise.all([cache.invalidateQueries({queryKey:['biodata-draft']}),cache.invalidateQueries({queryKey:['my-profile']}),cache.invalidateQueries({queryKey:['search-profiles']})]);}catch(e){toast.error(errorMessage(e));}finally{setBusy(false);}}
 return <div className="space-y-5">
  <section className="mb-card p-5 space-y-2"><h2 className="text-lg font-bold">{isBengali?'বায়োডাটা জমা দিন':'Submit your biodata'}</h2><p className="text-sm text-ink-2">{isBengali?'নিজের ইমেইল যাচাই করুন, অভিভাবকের সম্মতি ঘোষণা করুন এবং তথ্য জমা দিন।':'Verify your email, declare guardian consent and submit your details.'}</p>{params.get('from')==='wizard'&&<p className="text-sm text-brand">{isBengali?'আপনার তথ্য সংরক্ষিত হয়েছে। নিচের বাকি ধাপগুলো সম্পন্ন করুন।':'Your details are saved. Complete the remaining steps below.'}</p>}</section>
  <EmailVerificationCard verified={emailVerified}/>
  {isLoading?<p className="text-ink-2">{isBengali?'লোড হচ্ছে…':'Loading…'}</p>:isError||!app?<section className="mb-card p-5 space-y-3"><p>{isBengali?'তথ্য লোড করা যায়নি।':'Could not load your information.'}</p><button className="mb-btn-secondary" onClick={()=>refetch()}>{isBengali?'আবার চেষ্টা করুন':'Try again'}</button></section>:<>
  <section className="mb-card p-5 space-y-4"><h3 className="font-bold">{isBengali?'অভিভাবকের সম্মতি':'Guardian consent'}</h3><p className="text-sm text-ink-2">{isBengali?'এই ঘোষণা আপনার দেওয়া সম্মতির তথ্য; এটি পরিচয় বা অভিভাবকের স্বাধীন যাচাই নয়।':'This records your consent declaration; it is not independent identity or guardian verification.'}</p>
  {app.guardian?.name&&app.guardian?.phone?<p className="text-sm">{app.guardian.name} · {app.guardian.relationship} · <span className="font-mono">{app.guardian.phone}</span></p>:<p className="text-sm text-ink-2">{isBengali?'আগে বায়োডাটায় অভিভাবকের নাম, সম্পর্ক ও মোবাইল যোগ করুন।':'Add guardian name, relationship and mobile to your biodata first.'}</p>}
  {consent?<div className="flex flex-wrap gap-3 items-center"><p className="text-sm text-brand">{isBengali?'আপনার সম্মতির ঘোষণা সংরক্ষিত আছে।':'Your consent declaration is saved.'}</p><button disabled={busy} className="mb-btn-secondary" onClick={()=>action(()=>workflowApi.revokeGuardian())}>{isBengali?'সম্মতি প্রত্যাহার করুন':'Withdraw consent'}</button></div>:<><label className="flex gap-2 items-start text-sm"><input className="mt-1" type="checkbox" checked={consentChecked} onChange={e=>setConsentChecked(e.target.checked)}/><span>{isBengali?'আমার অভিভাবক এই বায়োডাটা প্রকাশের বিষয়ে অবগত এবং সম্মত আছেন।':'My guardian knows about and agrees to publishing this biodata.'}</span></label><button className="mb-btn-primary" disabled={busy||!consentChecked||!app.guardian?.name||!app.guardian?.phone} onClick={()=>action(()=>workflowApi.confirmGuardianConsent())}>{isBengali?'আমার ঘোষণা সংরক্ষণ করুন':'Save my declaration'}</button></>}
  </section>
  <section className="mb-card p-5 space-y-4">
   {canSubmit?<><p className="text-sm text-ink-2">{isBengali?'সব প্রয়োজনীয় তথ্য পূরণ করে নিচের বাটনে জমা দিন।':'Complete the required information, then submit below.'}</p>{(!emailVerified||!consent)&&<p className="text-sm text-ink-2">{isBengali?'বাকি আছে: ':'Still needed: '}{[!emailVerified&&(isBengali?'ইমেইল যাচাই':'email verification'),!consent&&(isBengali?'সম্মতির ঘোষণা':'consent declaration')].filter(Boolean).join(', ')}</p>}<button className="mb-btn-primary" disabled={busy||!emailVerified||!consent} onClick={()=>action(async()=>{await workflowApi.submit(app.revision);toast.success(isBengali?'বায়োডাটা জমা হয়েছে।':'Biodata submitted.');})}>{isBengali?'বায়োডাটা জমা দিন':'Submit biodata'}</button></>:<p className="text-sm">{app.status==='approved'?(app.data.visibility==='private'?(isBengali?'আপনার বায়োডাটা ব্যক্তিগত রাখা আছে।':'Your biodata is kept private.'):(isBengali?'আপনার বায়োডাটা দৃশ্যমানতার পছন্দ অনুযায়ী দেখা যাবে।':'Your biodata is available according to your visibility preferences.')):(isBengali?'আপনার বায়োডাটা জমা হয়েছে। পরবর্তী পরিবর্তন হলে জানানো হবে।':'Your biodata has been submitted. You will be notified of changes.')}</p>}
   <Link className="mb-btn-secondary inline-flex" to="/edit-profile">{isBengali?'বায়োডাটা সম্পাদনা করুন':'Edit biodata'}</Link>
  </section>
  </>}
 </div>;
}
