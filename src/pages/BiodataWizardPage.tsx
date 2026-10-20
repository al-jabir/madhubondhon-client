import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { workflowApi, statusLabels, errorMessage } from "../api/workflow.api";
import type { Application, DraftData, Guardian } from "../api/workflow.api";
import {
  Gender,
  EducationLevel,
  MaritalStatus,
  ProfileVisibility,
} from "../types";
import {
  TANGAIL_UPAZILAS,
  getUpazilaDisplayName,
} from "../constants/locations";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DatePicker from "../components/common/DatePicker";
import { useLanguage } from "../i18n/LanguageContext";
import { Check, X } from "lucide-react";

const inputClass = "mb-input w-full text-sm";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-ink-2">
      <span>{label}</span>
      {children}
    </label>
  );
}

function YesNoToggle({
  label,
  sublabel,
  value,
  onChange,
  isBengali = true,
}: {
  label: string;
  sublabel?: string;
  value?: boolean | null;
  onChange: (val: boolean) => void;
  isBengali?: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-card border border-line hover:border-brand/40 transition-colors">
      <div className="min-w-0 pr-2 space-y-0.5">
        <p className="text-sm font-semibold text-ink leading-snug">{label}</p>
        {sublabel && <p className="text-[11.5px] text-ink-3">{sublabel}</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0 self-start sm:self-center bg-elev p-1 rounded-xl border border-line">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
            value === true
              ? "bg-brand text-white shadow-xs shadow-brand/25"
              : "text-ink-2 hover:text-ink hover:bg-base"
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>{isBengali ? "হ্যাঁ" : "Yes"}</span>
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
            value === false
              ? "bg-slate-700 dark:bg-slate-600 text-white shadow-xs"
              : "text-ink-2 hover:text-ink hover:bg-base"
          }`}
        >
          <X className="w-3.5 h-3.5" />
          <span>{isBengali ? "না" : "No"}</span>
        </button>
      </div>
    </div>
  );
}

export default function BiodataWizardPage() {
  const { isBengali } = useLanguage();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["biodata-draft"],
    queryFn: workflowApi.getDraft,
  });

  if (isLoading) {
    return (
      <LoadingSpinner
        label={isBengali ? "খসড়া লোড হচ্ছে..." : "Loading draft..."}
      />
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-center text-ink-2">
        {isBengali ? "খসড়া লোড করা যায়নি। " : "Failed to load draft. "}
        <button
          onClick={() => refetch()}
          className="text-brand underline font-semibold cursor-pointer"
        >
          {isBengali ? "আবার চেষ্টা করুন" : "Try again"}
        </button>
      </div>
    );
  }

  return (
    <Wizard
      key={data.data.application._id}
      application={data.data.application}
    />
  );
}

function cleanDraft(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cleanDraft);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== "" && item !== undefined && item !== null)
        .map(([key, item]) => [key, cleanDraft(item)]),
    );
  return value;
}

function Wizard({ application }: { application: Application }) {
  const navigate = useNavigate();
  const cache = useQueryClient();
  const { isBengali } = useLanguage();
  const [data, setData] = useState<DraftData>(application.data || {});
  const [guardian, setGuardian] = useState<Partial<Guardian>>(
    application.guardian || {},
  );
  const [revision, setRevision] = useState(application.revision);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const stepNames = isBengali
    ? [
        "মৌলিক তথ্য",
        "শিক্ষা ও ব্যক্তিগত তথ্য",
        "পরিবার ও জীবনযাপন",
        "পছন্দ ও অভিভাবক",
      ]
    : [
        "Basic Info",
        "Education & Personal",
        "Family & Lifestyle",
        "Preferences & Guardian",
      ];

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  function update<K extends keyof DraftData>(key: K, value: DraftData[K]) {
    setData((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }

  function updateGuardian(key: keyof Guardian, value: string) {
    setGuardian((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }

  async function save() {
    setSaving(true);
    try {
      const cleaned = cleanDraft(data) as DraftData;
      const cleanGuardian = Object.fromEntries(
        Object.entries(guardian).filter(([, v]) => v !== "" && v !== undefined && v !== null),
      );
      const result = await workflowApi.saveDraft(
        revision,
        cleaned,
        cleanGuardian,
      );
      if (!result.data) throw new Error("Missing draft");
      setRevision(result.data.application.revision);
      setDirty(false);
      cache.setQueryData(["biodata-draft"], result);
      cache.removeQueries({ queryKey: ["my-profile"] });
      cache.removeQueries({ queryKey: ["search-profiles"] });
      cache.removeQueries({ queryKey: ["public-profile"] });
      toast.success(
        isBengali ? "খসড়া সংরক্ষিত হয়েছে" : "Draft saved successfully",
      );
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  }

  const statusLabel =
    isBengali
      ? statusLabels[application.status]
      : ({
          draft: "Draft",
          submitted: "Pending Review",
          under_review: "Under Review",
          approved: "Approved",
          changes_requested: "Changes Requested",
          rejected: "Rejected",
        } as Record<string, string>)[application.status] || application.status;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link to="/my-profile" className="text-sm text-brand hover:underline font-semibold">
        {isBengali ? "← আমার বায়োডাটা" : "← My Biodata"}
      </Link>
      <h1 className="text-2xl font-bold text-ink">
        {isBengali ? "ধাপে ধাপে বায়োডাটা তৈরি করুন" : "Create Biodata Step-by-Step"}
      </h1>
      <p className="text-sm text-ink-2">
        {isBengali
          ? "যতটুকু পূরণ হয়েছে খসড়া হিসেবে সংরক্ষণ করুন। সম্পাদনা করলে প্রকাশিত বায়োডাটা পুনরায় অনুমোদনের অপেক্ষায় যাবে।"
          : "Save your progress as draft anytime. Editing an approved profile will submit it for re-approval."}
      </p>

      <div className="rounded-2xl bg-brand-soft border border-brand/20 p-4 text-sm text-brand-ink">
        {isBengali ? "অবস্থা: " : "Status: "}
        <strong>{statusLabel}</strong>
        {application.reviewNote && (
          <p className="mt-2 text-xs">
            <strong>{isBengali ? "মডারেটরের মন্তব্য: " : "Moderator Note: "}</strong>
            {application.reviewNote}
          </p>
        )}
      </div>

      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stepNames.map((name, i) => (
          <li
            key={name}
            className={
              "p-3 rounded-xl text-sm font-semibold " +
              (step === i
                ? "bg-brand text-white"
                : "bg-elev border border-line text-ink-2")
            }
          >
            {i + 1}. {name}
          </li>
        ))}
      </ol>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await save();
        }}
        className="space-y-6"
      >
        <fieldset disabled={saving} className="mb-card p-6 space-y-5 text-ink">
          {step === 0 && (
            <>
              <Field
                label={
                  data.gender === "female"
                    ? isBengali
                      ? "পাত্রীর নাম (বা ডাকনাম)"
                      : "Bride's Name (or Nickname)"
                    : data.gender === "male"
                    ? isBengali
                      ? "পাত্রের নাম (বা ডাকনাম)"
                      : "Groom's Name (or Nickname)"
                    : isBengali
                    ? "প্রদর্শনের নাম"
                    : "Display Name"
                }
              >
                <input
                  className={inputClass}
                  value={data.displayName || ""}
                  onChange={(e) => update("displayName", e.target.value)}
                  placeholder={
                    data.gender === "female"
                      ? isBengali
                        ? "যেমন: ফাতেমা আক্তার"
                        : "e.g. Fatema Akter"
                      : isBengali
                      ? "যেমন: মোহাম্মদ আবদুল্লাহ"
                      : "e.g. Md. Abdullah"
                  }
                />
              </Field>

              <Field
                label={
                  isBengali
                    ? "বায়োডাটার ধরন (পাত্র / পাত্রী)"
                    : "Biodata Type (Groom / Bride)"
                }
              >
                <select
                  className={inputClass}
                  value={data.gender || ""}
                  onChange={(e) => update("gender", e.target.value as Gender)}
                >
                  <option value="">{isBengali ? "নির্বাচন করুন" : "Select Option"}</option>
                  <option value="male">
                    {isBengali ? "পাত্রের বায়োডাটা (বর)" : "Groom's Biodata"}
                  </option>
                  <option value="female">
                    {isBengali ? "পাত্রীর বায়োডাটা (কনে)" : "Bride's Biodata"}
                  </option>
                </select>
              </Field>

              <div className="space-y-1">
                <DatePicker
                  label={
                    data.gender === "female"
                      ? isBengali
                        ? "পাত্রীর জন্ম তারিখ (১৮+)"
                        : "Bride's Date of Birth (18+)"
                      : data.gender === "male"
                      ? isBengali
                        ? "পাত্রের জন্ম তারিখ (১৮+)"
                        : "Groom's Date of Birth (18+)"
                      : isBengali
                      ? "জন্ম তারিখ (১৮+)"
                      : "Date of Birth (18+)"
                  }
                  required
                  value={data.dateOfBirth?.slice(0, 10) || ""}
                  onChange={(val) => update("dateOfBirth", val)}
                  placeholder={
                    isBengali ? "জন্ম তারিখ নির্বাচন করুন" : "Select date of birth"
                  }
                />
              </div>

              <Field label={isBengali ? "স্থায়ী উপজেলা" : "Permanent Upazila (Tangail)"}>
                <select
                  className={inputClass}
                  value={data.upazila || ""}
                  onChange={(e) => update("upazila", e.target.value)}
                >
                  <option value="">{isBengali ? "নির্বাচন করুন" : "Select Upazila"}</option>
                  {TANGAIL_UPAZILAS.map((up) => (
                    <option key={up} value={up}>
                      {getUpazilaDisplayName(up, isBengali)}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={isBengali ? "বৈবাহিক অবস্থা" : "Marital Status"}>
                <select
                  className={inputClass}
                  value={data.maritalStatus || ""}
                  onChange={(e) =>
                    update("maritalStatus", e.target.value as MaritalStatus)
                  }
                >
                  <option value="">{isBengali ? "নির্বাচন করুন" : "Select Marital Status"}</option>
                  <option value="never_married">
                    {isBengali ? "অবিবাহিত" : "Never Married"}
                  </option>
                  <option value="divorced">
                    {isBengali ? "ডিভোর্সড" : "Divorced"}
                  </option>
                  {data.gender === "male" ? (
                    <option value="widowed">{isBengali ? "বিপত্নীক" : "Widower"}</option>
                  ) : data.gender === "female" ? (
                    <option value="widowed">{isBengali ? "বিধবা" : "Widow"}</option>
                  ) : (
                    <option value="widowed">
                      {isBengali ? "বিধবা / বিপত্নীক" : "Widowed"}
                    </option>
                  )}
                  <option value="separated">
                    {isBengali ? "বিচ্ছিন্ন" : "Separated"}
                  </option>
                </select>
              </Field>
            </>
          )}

          {step === 1 && (
            <>
              <Field label={isBengali ? "শিক্ষাগত যোগ্যতা" : "Educational Qualification"}>
                <select
                  className={inputClass}
                  value={data.education || ""}
                  onChange={(e) =>
                    update("education", e.target.value as EducationLevel)
                  }
                >
                  <option value="">{isBengali ? "নির্বাচন করুন" : "Select Education"}</option>
                  {Object.values(EducationLevel).map((v) => (
                    <option key={v} value={v}>
                      {v.toUpperCase()}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label={isBengali ? "বিস্তারিত শিক্ষা" : "Education Details"}>
                <input
                  className={inputClass}
                  value={data.educationDetail || ""}
                  onChange={(e) => update("educationDetail", e.target.value)}
                  placeholder={
                    isBengali
                      ? "যেমন: বিএসসি ইন সিএসই / কামিল / ডিগ্রি"
                      : "e.g. BSc in CSE / Kamil / Honours"
                  }
                />
              </Field>

              <Field
                label={
                  data.gender === "female"
                    ? isBengali
                      ? "পেশা (গৃহিণী / শিক্ষার্থী / কর্মরত)"
                      : "Occupation (Homemaker / Student / Employed)"
                    : isBengali
                    ? "পেশা"
                    : "Occupation"
                }
              >
                <input
                  className={inputClass}
                  value={data.occupation || ""}
                  onChange={(e) => update("occupation", e.target.value)}
                  placeholder={
                    data.gender === "female"
                      ? isBengali
                        ? "যেমন: গৃহিণী / শিক্ষিকা / অধ্যয়নরত"
                        : "e.g. Homemaker / Teacher / Student"
                      : isBengali
                      ? "যেমন: সফটওয়্যার ইঞ্জিনিয়ার / ব্যবসায়ী"
                      : "e.g. Software Engineer / Business"
                  }
                />
              </Field>

              {data.gender === "male" && (
                <Field label={isBengali ? "মাসিক আয় (ঐচ্ছিক)" : "Monthly Income (Optional)"}>
                  <input
                    className={inputClass}
                    value={data.lifestyle?.monthlyIncome || ""}
                    onChange={(e) =>
                      update("lifestyle", {
                        ...data.lifestyle,
                        smoking: !!data.lifestyle?.smoking,
                        monthlyIncome: e.target.value,
                      })
                    }
                    placeholder={
                      isBengali
                        ? "যেমন: ৩০,০০০ - ৫০,০০০ টাকা"
                        : "e.g. 30,000 - 50,000 BDT"
                    }
                  />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Field label={isBengali ? "উচ্চতা (ফুট)" : "Height (Feet)"}>
                  <input
                    type="number"
                    min="3"
                    max="8"
                    className={inputClass}
                    value={data.height?.feet ?? ""}
                    onChange={(e) =>
                      update(
                        "height",
                        e.target.value === ""
                          ? undefined
                          : {
                              feet: Number(e.target.value),
                              inches: data.height?.inches ?? 0,
                            },
                      )
                    }
                  />
                </Field>
                <Field label={isBengali ? "ইঞ্চি" : "Inches"}>
                  <input
                    type="number"
                    min="0"
                    max="11"
                    className={inputClass}
                    value={data.height?.inches ?? ""}
                    onChange={(e) =>
                      update("height", {
                        feet: data.height?.feet ?? 5,
                        inches: Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>

              <Field label={isBengali ? "ওজন (কেজি)" : "Weight (kg)"}>
                <input
                  type="number"
                  min="20"
                  max="300"
                  className={inputClass}
                  value={data.weight ?? ""}
                  onChange={(e) =>
                    update(
                      "weight",
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value),
                    )
                  }
                />
              </Field>

              <Field label={isBengali ? "গায়ের রং (ঐচ্ছিক)" : "Complexion / Skin Tone (Optional)"}>
                <select
                  className={inputClass}
                  value={data.skinTone || ""}
                  onChange={(e) => update("skinTone", e.target.value)}
                >
                  <option value="">
                    {isBengali ? "উল্লেখ করতে চাই না" : "Prefer not to mention"}
                  </option>
                  <option value="fair">{isBengali ? "ফর্সা" : "Fair"}</option>
                  <option value="light_brown">
                    {isBengali ? "উজ্জ্বল শ্যামলা" : "Light Brown / Wheatish"}
                  </option>
                  <option value="brown">{isBengali ? "শ্যামলা" : "Brown"}</option>
                  <option value="dark">{isBengali ? "কৃষ্ণবর্ণ" : "Dark"}</option>
                </select>
              </Field>

              <Field
                label={
                  data.gender === "female"
                    ? isBengali
                      ? "পাত্রীর নিজের পরিচিতি"
                      : "Bride's Bio & Interests"
                    : data.gender === "male"
                    ? isBengali
                      ? "পাত্রের নিজের পরিচিতি"
                      : "Groom's Bio & Interests"
                    : isBengali
                    ? "নিজের পরিচিতি"
                    : "Self Introduction"
                }
              >
                <textarea
                  rows={5}
                  className={inputClass}
                  value={data.bio || ""}
                  onChange={(e) => update("bio", e.target.value)}
                  maxLength={1000}
                  placeholder={
                    isBengali
                      ? "নিজের সম্পর্কে সংক্ষেপে কিছু লিখুন (ব্যক্তিত্ব, পছন্দ-অপছন্দ, দ্বীনি দৃষ্টিভঙ্গি ইত্যাদি)"
                      : "Write briefly about personality, interests, and Islamic outlook..."
                  }
                />
              </Field>
            </>
          )}

          {step === 2 && (
            <>
              <Field label={isBengali ? "পিতার পেশা" : "Father's Occupation"}>
                <input
                  className={inputClass}
                  value={data.familyInfo?.fatherOccupation || ""}
                  onChange={(e) =>
                    update("familyInfo", {
                      ...data.familyInfo,
                      fatherOccupation: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label={isBengali ? "মাতার পেশা" : "Mother's Occupation"}>
                <input
                  className={inputClass}
                  value={data.familyInfo?.motherOccupation || ""}
                  onChange={(e) =>
                    update("familyInfo", {
                      ...data.familyInfo,
                      motherOccupation: e.target.value,
                    })
                  }
                />
              </Field>

              <Field label={isBengali ? "ভাইবোনের সংখ্যা" : "Number of Siblings"}>
                <input
                  type="number"
                  min="0"
                  max="20"
                  className={inputClass}
                  value={data.familyInfo?.siblings ?? ""}
                  onChange={(e) =>
                    update("familyInfo", {
                      ...data.familyInfo,
                      siblings:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                />
              </Field>

              <Field label={isBengali ? "পরিবারের ধরণ" : "Family Type"}>
                <select
                  className={inputClass}
                  value={data.familyInfo?.familyType || ""}
                  onChange={(e) =>
                    update("familyInfo", {
                      ...data.familyInfo,
                      familyType: e.target.value,
                    })
                  }
                >
                  <option value="">{isBengali ? "নির্বাচন করুন" : "Select Family Type"}</option>
                  <option value="nuclear">{isBengali ? "একক পরিবার" : "Nuclear Family"}</option>
                  <option value="joint">{isBengali ? "যৌথ পরিবার" : "Joint Family"}</option>
                </select>
              </Field>

              <div className="pt-4 border-t border-line space-y-4">
                <h3 className="text-base font-bold text-ink">
                  {data.gender === "male"
                    ? isBengali
                      ? "ধর্মীয় তথ্য ও বিশেষ বিবরণ (পাত্রের জন্য)"
                      : "Religious Practice & Lifestyle (For Groom)"
                    : data.gender === "female"
                    ? isBengali
                      ? "ধর্মীয় তথ্য ও বিশেষ বিবরণ (পাত্রীর জন্য)"
                      : "Religious Practice & Lifestyle (For Bride)"
                    : isBengali
                    ? "ধর্মীয় তথ্য ও জীবনযাপন"
                    : "Religious Practice & Lifestyle"}
                </h3>

                {/* Common questions */}
                <div className="space-y-3">
                  <YesNoToggle
                    label={
                      isBengali
                        ? "প্রতিদিন পাঁচ ওয়াক্ত নামাজ নিয়মিত আদায় করেন?"
                        : "Prays five times daily regularly?"
                    }
                    sublabel={
                      isBengali
                        ? "নিয়মিত ওয়াক্তমত ফরজ নামাজ আদায় করা"
                        : "Performing five daily prayers regularly"
                    }
                    value={data.religiousInfo?.praysFiveTimes}
                    isBengali={isBengali}
                    onChange={(val) =>
                      update("religiousInfo", {
                        ...data.religiousInfo,
                        religion: "islam",
                        praysFiveTimes: val,
                      })
                    }
                  />

                  <YesNoToggle
                    label={
                      isBengali
                        ? "শুদ্ধভাবে কুরআন মাজীদ তিলাওয়াত করতে পারেন?"
                        : "Can correctly recite the Holy Quran?"
                    }
                    sublabel={
                      isBengali
                        ? "সহিহ মাখরাজ ও তাজবিদ সহকারে তিলাওয়াত"
                        : "Reciting with proper pronunciation/tajweed"
                    }
                    value={data.religiousInfo?.canReciteQuran}
                    isBengali={isBengali}
                    onChange={(val) =>
                      update("religiousInfo", {
                        ...data.religiousInfo,
                        religion: "islam",
                        canReciteQuran: val,
                      })
                    }
                  />
                </div>

                {/* Male specific */}
                {data.gender === "male" && (
                  <div className="space-y-3 pt-1">
                    <YesNoToggle
                      label={
                        isBengali
                          ? "সুন্নতি দাড়ি রয়েছে কি?"
                          : "Maintains a Sunnah beard?"
                      }
                      sublabel={
                        isBengali
                          ? "রাসূলুল্লাহ (সা.)-এর সুন্নাহ মোতাবেক দাড়ি"
                          : "Sunnah beard according to tradition"
                      }
                      value={data.religiousInfo?.hasBeard}
                      isBengali={isBengali}
                      onChange={(val) =>
                        update("religiousInfo", {
                          ...data.religiousInfo,
                          religion: "islam",
                          hasBeard: val,
                        })
                      }
                    />

                    <YesNoToggle
                      label={
                        isBengali
                          ? "সর্বদা টাখনুর উপরে পোশাক পরিধান করেন?"
                          : "Wears clothing above the ankles?"
                      }
                      sublabel={
                        isBengali
                          ? "প্যান্ট বা পায়জামা সর্বদা টাখনুর উপরে রাখা"
                          : "Always keeping trousers/clothes above ankles"
                      }
                      value={data.religiousInfo?.clothesAboveAnkle}
                      isBengali={isBengali}
                      onChange={(val) =>
                        update("religiousInfo", {
                          ...data.religiousInfo,
                          religion: "islam",
                          clothesAboveAnkle: val,
                        })
                      }
                    />

                    <YesNoToggle
                      label={
                        isBengali
                          ? "বিয়ের পর স্ত্রীকে পর্দা করার ব্যাপারে সহযোগিতা করবেন / পর্দায় রাখবেন?"
                          : "Will support and encourage wife to maintain purdah?"
                      }
                      sublabel={
                        isBengali
                          ? "পারিবারিক জীবনে পূর্ণাঙ্গ পর্দা বজায় রাখার অনুকূল পরিবেশ"
                          : "Providing a supportive environment for Islamic purdah"
                      }
                      value={data.lifestyle?.willKeepWifeInPurdah}
                      isBengali={isBengali}
                      onChange={(val) =>
                        update("lifestyle", {
                          ...data.lifestyle,
                          smoking: !!data.lifestyle?.smoking,
                          willKeepWifeInPurdah: val,
                        })
                      }
                    />

                    <Field
                      label={
                        isBengali
                          ? "বিয়ের পর স্ত্রীকে নিয়ে কোথায় থাকবেন?"
                          : "Living arrangement after marriage"
                      }
                    >
                      <select
                        className={inputClass}
                        value={data.lifestyle?.livingArrangement || ""}
                        onChange={(e) =>
                          update("lifestyle", {
                            ...data.lifestyle,
                            smoking: !!data.lifestyle?.smoking,
                            livingArrangement: e.target.value,
                          })
                        }
                      >
                        <option value="">{isBengali ? "নির্বাচন করুন" : "Select Option"}</option>
                        <option value="joint_family">
                          {isBengali
                            ? "যৌথ পরিবারে পরিবারের সাথে"
                            : "Joint family with parents"}
                        </option>
                        <option value="separate_home">
                          {isBengali ? "পৃথক বাসা / ফ্ল্যাট" : "Separate home / flat"}
                        </option>
                        <option value="flexible">
                          {isBengali
                            ? "পরিস্থিতি ও পারস্পরিক আলোচনা সাপেক্ষে"
                            : "Flexible / Mutual discussion"}
                        </option>
                      </select>
                    </Field>

                    <YesNoToggle
                      label={
                        isBengali
                          ? "ধূমপান বা তামাকজাত পণ্যের কোনো অভ্যাস রয়েছে কি?"
                          : "Do you smoke or have tobacco habits?"
                      }
                      sublabel={
                        isBengali
                          ? "সিগারেট, বিড়ি, গুল, জর্দা বা অন্য কোনো তামাকের অভ্যাস"
                          : "Smoking, vaping, or using any tobacco products"
                      }
                      value={data.lifestyle?.smoking}
                      isBengali={isBengali}
                      onChange={(val) =>
                        update("lifestyle", {
                          ...data.lifestyle,
                          smoking: val,
                        })
                      }
                    />
                  </div>
                )}

                {/* Female specific */}
                {data.gender === "female" && (
                  <div className="space-y-3 pt-1">
                    <YesNoToggle
                      label={
                        isBengali
                          ? "ঘরের বাইরে সাধারণ হিজাব বা শালীন পোশাক পরিধান করেন?"
                          : "Wears Hijab / modest dress outdoors?"
                      }
                      sublabel={
                        isBengali
                          ? "মাথা ও শরীর ঢেকে শালীন মার্জিত পোশাক"
                          : "Wearing headscarf and modest clothing in public"
                      }
                      value={data.religiousInfo?.wearsHijab}
                      isBengali={isBengali}
                      onChange={(val) =>
                        update("religiousInfo", {
                          ...data.religiousInfo,
                          religion: "islam",
                          wearsHijab: val,
                        })
                      }
                    />

                    <YesNoToggle
                      label={
                        isBengali
                          ? "নিয়মিত নিকাব বা বোরকা সহকারে পূর্ণাঙ্গ পর্দা করেন?"
                          : "Observes full Niqab / complete purdah regularly?"
                      }
                      sublabel={
                        isBengali
                          ? "মুখমণ্ডলসহ পূর্ণাঙ্গ নিকাব ও পর্দা"
                          : "Observing complete face veil (Niqab) and abaya/burqa"
                      }
                      value={data.religiousInfo?.wearsNiqab}
                      isBengali={isBengali}
                      onChange={(val) =>
                        update("religiousInfo", {
                          ...data.religiousInfo,
                          religion: "islam",
                          wearsNiqab: val,
                        })
                      }
                    />

                    <YesNoToggle
                      label={
                        isBengali
                          ? "মাহরাম ও গায়রে-মাহরাম বিধান মেনে চলার চেষ্টা করেন?"
                          : "Observes Mahram and non-Mahram boundaries?"
                      }
                      sublabel={
                        isBengali
                          ? "গায়রে-মাহরামদের সাথে অপ্রয়োজনীয় দেখা-সাক্ষাৎ ও কথা থেকে বিরত থাকা"
                          : "Avoiding unnecessary interactions with non-mahram men"
                      }
                      value={data.religiousInfo?.maintainsMahram}
                      isBengali={isBengali}
                      onChange={(val) =>
                        update("religiousInfo", {
                          ...data.religiousInfo,
                          religion: "islam",
                          maintainsMahram: val,
                        })
                      }
                    />

                    <YesNoToggle
                      label={
                        isBengali
                          ? "রান্নাবান্না ও গৃহস্থালি কাজকর্ম করতে পারেন কি?"
                          : "Skilled in cooking and household responsibilities?"
                      }
                      sublabel={
                        isBengali
                          ? "দৈনন্দিন রান্না ও পারিবারিক গৃহস্থালির দায়িত্ব পরিচালনা"
                          : "Cooking daily meals and managing family home"
                      }
                      value={data.lifestyle?.canCook}
                      isBengali={isBengali}
                      onChange={(val) =>
                        update("lifestyle", {
                          ...data.lifestyle,
                          smoking: !!data.lifestyle?.smoking,
                          canCook: val,
                        })
                      }
                    />

                    <Field
                      label={
                        isBengali
                          ? "বিয়ের পর পড়াশোনা চালিয়ে যেতে চান কি?"
                          : "Desire to study after marriage?"
                      }
                    >
                      <select
                        className={inputClass}
                        value={String(data.lifestyle?.studyAfterMarriage ?? "")}
                        onChange={(e) =>
                          update("lifestyle", {
                            ...data.lifestyle,
                            smoking: !!data.lifestyle?.smoking,
                            studyAfterMarriage: e.target.value,
                          })
                        }
                      >
                        <option value="">{isBengali ? "নির্বাচন করুন" : "Select Option"}</option>
                        <option value="yes">
                          {isBengali ? "হ্যাঁ, চালিয়ে যেতে চাই" : "Yes, wish to continue"}
                        </option>
                        <option value="no">
                          {isBengali ? "না, প্রয়োজন নেই" : "No"}
                        </option>
                        <option value="family_decision">
                          {isBengali
                            ? "স্বামী ও পরিবারের সিদ্ধান্ত অনুযায়ী"
                            : "According to husband & family decision"}
                        </option>
                      </select>
                    </Field>

                    <Field
                      label={
                        isBengali
                          ? "বিয়ের পর চাকরি বা কাজ করতে চান কি?"
                          : "Desire to work/job after marriage?"
                      }
                    >
                      <select
                        className={inputClass}
                        value={String(data.lifestyle?.jobAfterMarriage ?? "")}
                        onChange={(e) =>
                          update("lifestyle", {
                            ...data.lifestyle,
                            smoking: !!data.lifestyle?.smoking,
                            jobAfterMarriage: e.target.value,
                          })
                        }
                      >
                        <option value="">{isBengali ? "নির্বাচন করুন" : "Select Option"}</option>
                        <option value="no">
                          {isBengali ? "না, গৃহিণী হিসেবে থাকতে চাই" : "No, prefer homemaking"}
                        </option>
                        <option value="if_shariah_compliant">
                          {isBengali
                            ? "শরীয়তসম্মত ও পর্দার অনুকূল পরিবেশ পেলে"
                            : "If Shariah-compliant & respectful of purdah"}
                        </option>
                        <option value="yes">
                          {isBengali ? "হ্যাঁ, চাকরি করতে চাই" : "Yes, wish to work"}
                        </option>
                        <option value="family_decision">
                          {isBengali
                            ? "স্বামী ও পরিবারের সম্মতি সাপেক্ষে"
                            : "Subject to mutual family agreement"}
                        </option>
                      </select>
                    </Field>
                  </div>
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={
                    data.gender === "male"
                      ? isBengali
                        ? "প্রত্যাশিত পাত্রীর ন্যূনতম বয়স"
                        : "Expected Bride's Min Age"
                      : data.gender === "female"
                      ? isBengali
                        ? "প্রত্যাশিত পাত্রের ন্যূনতম বয়স"
                        : "Expected Groom's Min Age"
                      : isBengali
                      ? "সঙ্গীর ন্যূনতম বয়স"
                      : "Partner's Min Age"
                  }
                >
                  <input
                    type="number"
                    min="18"
                    max="80"
                    className={inputClass}
                    value={data.preferences?.minAge ?? ""}
                    onChange={(e) =>
                      update("preferences", {
                        ...data.preferences,
                        minAge:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </Field>

                <Field label={isBengali ? "সর্বোচ্চ বয়স" : "Maximum Age"}>
                  <input
                    type="number"
                    min="18"
                    max="80"
                    className={inputClass}
                    value={data.preferences?.maxAge ?? ""}
                    onChange={(e) =>
                      update("preferences", {
                        ...data.preferences,
                        maxAge:
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                      })
                    }
                  />
                </Field>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-ink">
                  {isBengali ? "পছন্দের উপজেলাসমূহ" : "Preferred Upazilas"}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {TANGAIL_UPAZILAS.map((up) => (
                    <label key={up} className="flex items-center gap-2 text-sm text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!data.preferences?.preferredUpazilas?.includes(up)}
                        onChange={(e) =>
                          update("preferences", {
                            ...data.preferences,
                            preferredUpazilas: e.target.checked
                              ? [...(data.preferences?.preferredUpazilas || []), up]
                              : (data.preferences?.preferredUpazilas || []).filter(
                                  (v) => v !== up,
                                ),
                          })
                        }
                      />
                      {getUpazilaDisplayName(up, isBengali)}
                    </label>
                  ))}
                </div>
              </div>

              <Field label={isBengali ? "দৃশ্যমানতা" : "Profile Visibility"}>
                <select
                  className={inputClass}
                  value={data.visibility || "public"}
                  onChange={(e) =>
                    update("visibility", e.target.value as ProfileVisibility)
                  }
                >
                  <option value="public">{isBengali ? "সবার জন্য (Public)" : "Public"}</option>
                  <option value="registered_only">
                    {isBengali ? "নিবন্ধিত সদস্য (Registered Only)" : "Registered Members Only"}
                  </option>
                  <option value="private">{isBengali ? "ব্যক্তিগত (Private)" : "Private"}</option>
                </select>
              </Field>

              <h2 className="text-lg font-bold text-ink">
                {data.gender === "female"
                  ? isBengali
                    ? "অভিভাবকের (ওয়ালী) যোগাযোগ"
                    : "Guardian / Wali Contact"
                  : isBengali
                  ? "অভিভাবকের যোগাযোগ"
                  : "Guardian Contact"}
              </h2>
              <p className="text-sm text-ink-2">
                {data.gender === "female"
                  ? isBengali
                    ? "পাত্রীর ক্ষেত্রে পিতা বা শরীয়াহসম্মত অভিভাবকের (ওয়ালী) তথ্য প্রদান করা আবশ্যক। এই তথ্য পাবলিক বায়োডাটাতে উন্মুক্ত থাকবে না।"
                    : "For brides, father or Shariah guardian (Wali) info is required. This contact remains strictly confidential until mutual permission."
                  : isBengali
                  ? "এই তথ্য public biodata-তে দেখানো হবে না। অভিভাবকের সম্মতি যাচাইয়ের পর যোগাযোগের অনুমতি দেওয়া যাবে।"
                  : "This info is never shown publicly. Contact permission is granted only after mutual guardian verification."}
              </p>

              <Field label={isBengali ? "অভিভাবকের নাম" : "Guardian's Name"}>
                <input
                  className={inputClass}
                  value={guardian.name || ""}
                  onChange={(e) => updateGuardian("name", e.target.value)}
                />
              </Field>

              <Field label={isBengali ? "সম্পর্ক" : "Relationship"}>
                <input
                  className={inputClass}
                  value={guardian.relationship || ""}
                  placeholder={
                    data.gender === "female"
                      ? isBengali
                        ? "পিতা / ভাই / চাচা (ওয়ালী)"
                        : "Father / Brother / Uncle (Wali)"
                      : isBengali
                      ? "পিতা / মাতা / ভাই"
                      : "Father / Mother / Brother"
                  }
                  onChange={(e) =>
                    updateGuardian("relationship", e.target.value)
                  }
                />
              </Field>

              <Field label={isBengali ? "অভিভাবকের মোবাইল" : "Guardian's Mobile Number"}>
                <input
                  type="tel"
                  className={inputClass}
                  value={guardian.phone || ""}
                  placeholder="01XXXXXXXXX"
                  onChange={(e) => updateGuardian("phone", e.target.value)}
                />
              </Field>

              <Field label={isBengali ? "অভিভাবকের ইমেইল (ঐচ্ছিক)" : "Guardian's Email (Optional)"}>
                <input
                  type="email"
                  className={inputClass}
                  value={guardian.email || ""}
                  onChange={(e) => updateGuardian("email", e.target.value)}
                />
              </Field>
            </>
          )}
        </fieldset>

        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between pt-4">
          <button
            type="button"
            disabled={saving || step === 0}
            onClick={() => setStep((v) => v - 1)}
            className="mb-btn-secondary w-full sm:w-auto !px-5 !py-3 disabled:opacity-40 cursor-pointer"
          >
            {isBengali ? "← আগের ধাপ" : "← Previous Step"}
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="mb-btn-secondary w-full sm:w-auto !px-5 !py-3 disabled:opacity-40 cursor-pointer"
            >
              {saving
                ? isBengali
                  ? "সংরক্ষণ হচ্ছে..."
                  : "Saving..."
                : isBengali
                ? "খসড়া সংরক্ষণ"
                : "Save Draft"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                if (await save()) {
                  if (step < 3) {
                    setStep((v) => v + 1);
                  } else {
                    toast.success(
                      isBengali
                        ? "বায়োডাটার সকল তথ্য সংরক্ষিত হয়েছে! এবার যাচাই ও জমা সম্পন্ন করুন।"
                        : "Biodata details saved! Now complete verification & submit."
                    );
                    navigate("/my-profile?tab=verification&from=wizard");
                  }
                }
              }}
              className="mb-btn-primary w-full sm:w-auto !px-6 !py-3 disabled:opacity-40 cursor-pointer"
            >
              {step < 3
                ? isBengali
                  ? "সংরক্ষণ করে পরের ধাপ →"
                  : "Save & Next Step →"
                : isBengali
                ? "যাচাই ও জমা দিতে যান →"
                : "Proceed to Review & Submit →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
