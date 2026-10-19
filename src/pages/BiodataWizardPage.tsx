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
  UPAZILA_DISPLAY_NAMES,
} from "../constants/locations";
import LoadingSpinner from "../components/common/LoadingSpinner";
import DatePicker from "../components/common/DatePicker";

const inputClass =
  "mb-input w-full text-sm";

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
export default function BiodataWizardPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["biodata-draft"],
    queryFn: workflowApi.getDraft,
  });
  if (isLoading) return <LoadingSpinner label="খসড়া লোড হচ্ছে..." />;
  if (isError || !data?.data)
    return (
      <div className="p-8 text-center">
        খসড়া লোড করা যায়নি।{" "}
        <button onClick={() => refetch()}>আবার চেষ্টা করুন</button>
      </div>
    );
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
        .filter(([, item]) => item !== "" && item !== undefined)
        .map(([key, item]) => [key, cleanDraft(item)]),
    );
  return value;
}
function Wizard({ application }: { application: Application }) {
  const navigate = useNavigate();
  const cache = useQueryClient();
  const [data, setData] = useState<DraftData>(application.data || {});
  const [guardian, setGuardian] = useState<Partial<Guardian>>(
    application.guardian || {},
  );
  const [revision, setRevision] = useState(application.revision);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const names = [
    "মৌলিক তথ্য",
    "শিক্ষা ও ব্যক্তিগত তথ্য",
    "পরিবার ও জীবনযাপন",
    "পছন্দ ও অভিভাবক",
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
        Object.entries(guardian).filter(([, v]) => v !== ""),
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
      toast.success("খসড়া সংরক্ষিত হয়েছে");
      return true;
    } catch (error) {
      toast.error(errorMessage(error));
      return false;
    } finally {
      setSaving(false);
    }
  }
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <Link to="/my-profile" className="text-sm text-brand hover:underline">
        ← আমার বায়োডাটা
      </Link>
      <h1 className="text-2xl font-bold text-ink">ধাপে ধাপে বায়োডাটা তৈরি করুন</h1>
      <p className="text-sm text-ink-2">
        যতটুকু পূরণ হয়েছে খসড়া হিসেবে সংরক্ষণ করুন। সম্পাদনা করলে প্রকাশিত
        বায়োডাটা পুনরায় অনুমোদনের অপেক্ষায় যাবে।
      </p>
      <div className="rounded-2xl bg-brand-soft border border-brand/20 p-4 text-sm text-brand-ink">
        অবস্থা: {statusLabels[application.status]}
        {application.reviewNote && (
          <p className="mt-2">মডারেটরের মন্তব্য: {application.reviewNote}</p>
        )}
      </div>
      <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {names.map((name, i) => (
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
        <fieldset
          disabled={saving}
          className="mb-card p-6 space-y-5 text-ink"
        >
          {step === 0 && (
            <>
              <Field label={data.gender === "female" ? "পাত্রীর নাম (বা ডাকনাম)" : data.gender === "male" ? "পাত্রের নাম (বা ডাকনাম)" : "প্রদর্শনের নাম"}>
                <input
                  className={inputClass}
                  value={data.displayName || ""}
                  onChange={(e) => update("displayName", e.target.value)}
                  placeholder={data.gender === "female" ? "যেমন: ফাতেমা আক্তার" : "যেমন: মোহাম্মদ আবদুল্লাহ"}
                />
              </Field>
              <Field label="বায়োডাটার ধরন (পাত্র / পাত্রী)">
                <select
                  className={inputClass}
                  value={data.gender || ""}
                  onChange={(e) => update("gender", e.target.value as Gender)}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="male">পাত্রের বায়োডাটা (বর)</option>
                  <option value="female">পাত্রীর বায়োডাটা (কনে)</option>
                </select>
              </Field>
              <div className="space-y-1">
                <DatePicker
                  label={data.gender === "female" ? "পাত্রীর জন্ম তারিখ (১৮+)" : data.gender === "male" ? "পাত্রের জন্ম তারিখ (১৮+)" : "জন্ম তারিখ (১৮+)"}
                  required
                  value={data.dateOfBirth?.slice(0, 10) || ""}
                  onChange={(val) => update("dateOfBirth", val)}
                  placeholder="জন্ম তারিখ নির্বাচন করুন"
                />
              </div>
              <Field label="স্থায়ী উপজেলা">
                <select
                  className={inputClass}
                  value={data.upazila || ""}
                  onChange={(e) => update("upazila", e.target.value)}
                >
                  <option value="">নির্বাচন করুন</option>
                  {TANGAIL_UPAZILAS.map((up) => (
                    <option key={up} value={up}>
                      {UPAZILA_DISPLAY_NAMES[up]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="বৈবাহিক অবস্থা">
                <select
                  className={inputClass}
                  value={data.maritalStatus || ""}
                  onChange={(e) =>
                    update("maritalStatus", e.target.value as MaritalStatus)
                  }
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="never_married">অবিবাহিত</option>
                  <option value="divorced">ডিভোর্সড</option>
                  {data.gender === "male" ? (
                    <option value="widowed">বিপত্নীক</option>
                  ) : data.gender === "female" ? (
                    <option value="widowed">বিধবা</option>
                  ) : (
                    <option value="widowed">বিধবা / বিপত্নীক</option>
                  )}
                  <option value="separated">বিচ্ছিন্ন</option>
                </select>
              </Field>
            </>
          )}
          {step === 1 && (
            <>
              <Field label="শিক্ষাগত যোগ্যতা">
                <select
                  className={inputClass}
                  value={data.education || ""}
                  onChange={(e) =>
                    update("education", e.target.value as EducationLevel)
                  }
                >
                  <option value="">নির্বাচন করুন</option>
                  {Object.values(EducationLevel).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="বিস্তারিত শিক্ষা">
                <input
                  className={inputClass}
                  value={data.educationDetail || ""}
                  onChange={(e) => update("educationDetail", e.target.value)}
                  placeholder="যেমন: বিএসসি ইন সিএসই / কামিল / ডিগ্রি"
                />
              </Field>
              <Field label={data.gender === "female" ? "পেশা (গৃহিণী / শিক্ষার্থী / কর্মরত)" : "পেশা"}>
                <input
                  className={inputClass}
                  value={data.occupation || ""}
                  onChange={(e) => update("occupation", e.target.value)}
                  placeholder={data.gender === "female" ? "যেমন: গৃহিণী / শিক্ষিকা / অধ্যয়নরত" : "যেমন: সফটওয়্যার ইঞ্জিনিয়ার / ব্যবসায়ী"}
                />
              </Field>
              {data.gender === "male" && (
                <Field label="মাসিক আয় (ঐচ্ছিক)">
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
                    placeholder="যেমন: ৩০,০০০ - ৫০,০০০ টাকা"
                  />
                </Field>
              )}
              <div className="grid grid-cols-2 gap-4">
                <Field label="উচ্চতা (ফুট)">
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
                <Field label="ইঞ্চি">
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
              <Field label="ওজন (কেজি)">
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
              <Field label="গায়ের রং (ঐচ্ছিক)">
                <select
                  className={inputClass}
                  value={data.skinTone || ""}
                  onChange={(e) => update("skinTone", e.target.value)}
                >
                  <option value="">উল্লেখ করতে চাই না</option>
                  <option value="fair">ফর্সা</option>
                  <option value="light_brown">উজ্জ্বল শ্যামলা</option>
                  <option value="brown">শ্যামলা</option>
                  <option value="dark">কৃষ্ণবর্ণ</option>
                </select>
              </Field>
              <Field label={data.gender === "female" ? "পাত্রীর নিজের পরিচিতি" : data.gender === "male" ? "পাত্রের নিজের পরিচিতি" : "নিজের পরিচিতি"}>
                <textarea
                  rows={5}
                  className={inputClass}
                  value={data.bio || ""}
                  onChange={(e) => update("bio", e.target.value)}
                  maxLength={1000}
                  placeholder="নিজের সম্পর্কে সংক্ষেপে কিছু লিখুন (ব্যক্তিত্ব, পছন্দ-অপছন্দ, দ্বীনি দৃষ্টিভঙ্গি ইত্যাদি)"
                />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label="পিতার পেশা">
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
              <Field label="মাতার পেশা">
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
              <Field label="ভাইবোনের সংখ্যা">
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
              <Field label="পরিবারের ধরণ">
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
                  <option value="">নির্বাচন করুন</option>
                  <option value="nuclear">একক পরিবার</option>
                  <option value="joint">যৌথ পরিবার</option>
                </select>
              </Field>
              <div className="pt-4 border-t border-line space-y-4">
                <h3 className="text-base font-bold text-ink">
                  {data.gender === "male"
                    ? "ধর্মীয় তথ্য ও বিশেষ বিবরণ (পাত্রের জন্য)"
                    : data.gender === "female"
                    ? "ধর্মীয় তথ্য ও বিশেষ বিবরণ (পাত্রীর জন্য)"
                    : "ধর্মীয় তথ্য ও জীবনযাপন"}
                </h3>

                {/* Common questions */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-line text-brand focus:ring-brand/30"
                      checked={!!data.religiousInfo?.praysFiveTimes}
                      onChange={(e) =>
                        update("religiousInfo", {
                          ...data.religiousInfo,
                          religion: "islam",
                          praysFiveTimes: e.target.checked,
                        })
                      }
                    />
                    <span>প্রতিদিন পাঁচ ওয়াক্ত নামাজ জামায়াতে/নিয়মিত আদায় করি</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-line text-brand focus:ring-brand/30"
                      checked={!!data.religiousInfo?.canReciteQuran}
                      onChange={(e) =>
                        update("religiousInfo", {
                          ...data.religiousInfo,
                          religion: "islam",
                          canReciteQuran: e.target.checked,
                        })
                      }
                    />
                    <span>শুদ্ধভাবে কুরআন মাজীদ তিলাওয়াত করতে পারি</span>
                  </label>
                </div>

                {/* Male specific */}
                {data.gender === "male" && (
                  <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand focus:ring-brand/30"
                        checked={!!data.religiousInfo?.hasBeard}
                        onChange={(e) =>
                          update("religiousInfo", {
                            ...data.religiousInfo,
                            religion: "islam",
                            hasBeard: e.target.checked,
                          })
                        }
                      />
                      <span>সুন্নতি দাড়ি রয়েছে</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand focus:ring-brand/30"
                        checked={!!data.religiousInfo?.clothesAboveAnkle}
                        onChange={(e) =>
                          update("religiousInfo", {
                            ...data.religiousInfo,
                            religion: "islam",
                            clothesAboveAnkle: e.target.checked,
                          })
                        }
                      />
                      <span>সর্বদা টাখনুর উপরে পোশাক পরিধান করি</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand focus:ring-brand/30"
                        checked={!!data.lifestyle?.willKeepWifeInPurdah}
                        onChange={(e) =>
                          update("lifestyle", {
                            ...data.lifestyle,
                            smoking: !!data.lifestyle?.smoking,
                            willKeepWifeInPurdah: e.target.checked,
                          })
                        }
                      />
                      <span>বিয়ের পর স্ত্রীকে পর্দা করার ব্যাপারে সহযোগিতা করব / পর্দায় রাখব</span>
                    </label>

                    <Field label="বিয়ের পর স্ত্রীকে নিয়ে কোথায় থাকবেন?">
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
                        <option value="">নির্বাচন করুন</option>
                        <option value="joint_family">যৌথ পরিবারে পরিবারের সাথে</option>
                        <option value="separate_home">পৃথক বাসা / ফ্ল্যাট</option>
                        <option value="flexible">পরিস্থিতি ও পারস্পরিক আলোচনা সাপেক্ষে</option>
                      </select>
                    </Field>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand focus:ring-brand/30"
                        checked={!!data.lifestyle?.smoking}
                        onChange={(e) =>
                          update("lifestyle", {
                            ...data.lifestyle,
                            smoking: e.target.checked,
                          })
                        }
                      />
                      <span>ধূমপানের অভ্যাস রয়েছে</span>
                    </label>
                  </div>
                )}

                {/* Female specific */}
                {data.gender === "female" && (
                  <div className="space-y-4 pt-2">
                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand focus:ring-brand/30"
                        checked={!!data.religiousInfo?.wearsHijab}
                        onChange={(e) =>
                          update("religiousInfo", {
                            ...data.religiousInfo,
                            religion: "islam",
                            wearsHijab: e.target.checked,
                          })
                        }
                      />
                      <span>ঘরের বাইরে সাধারণ হিজাব বা শালীন পোশাক পরিধান করি</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand focus:ring-brand/30"
                        checked={!!data.religiousInfo?.wearsNiqab}
                        onChange={(e) =>
                          update("religiousInfo", {
                            ...data.religiousInfo,
                            religion: "islam",
                            wearsNiqab: e.target.checked,
                          })
                        }
                      />
                      <span>নিয়মিত নিকাব বা বোরকা সহকারে পূর্ণাঙ্গ পর্দা করি</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand focus:ring-brand/30"
                        checked={!!data.religiousInfo?.maintainsMahram}
                        onChange={(e) =>
                          update("religiousInfo", {
                            ...data.religiousInfo,
                            religion: "islam",
                            maintainsMahram: e.target.checked,
                          })
                        }
                      />
                      <span>মাহরাম ও গায়রে-মাহরাম বিধান মেনে চলার চেষ্টা করি</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-sm font-medium text-ink-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-line text-brand focus:ring-brand/30"
                        checked={!!data.lifestyle?.canCook}
                        onChange={(e) =>
                          update("lifestyle", {
                            ...data.lifestyle,
                            smoking: !!data.lifestyle?.smoking,
                            canCook: e.target.checked,
                          })
                        }
                      />
                      <span>রান্নাবান্না ও গৃহস্থালি কাজকর্ম করতে পারি</span>
                    </label>

                    <Field label="বিয়ের পর পড়াশোনা চালিয়ে যেতে চান কি?">
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
                        <option value="">নির্বাচন করুন</option>
                        <option value="yes">হ্যাঁ, চালিয়ে যেতে চাই</option>
                        <option value="no">না, প্রয়োজন নেই</option>
                        <option value="family_decision">স্বামী ও পরিবারের সিদ্ধান্ত অনুযায়ী</option>
                      </select>
                    </Field>

                    <Field label="বিয়ের পর চাকরি বা কাজ করতে চান কি?">
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
                        <option value="">নির্বাচন করুন</option>
                        <option value="no">না, গৃহিণী হিসেবে থাকতে চাই</option>
                        <option value="if_shariah_compliant">শরীয়তসম্মত ও পর্দার অনুকূল পরিবেশ পেলে</option>
                        <option value="yes">হ্যাঁ, চাকরি করতে চাই</option>
                        <option value="family_decision">স্বামী ও পরিবারের সম্মতি সাপেক্ষে</option>
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
                      ? "প্রত্যাশিত পাত্রীর ন্যূনতম বয়স"
                      : data.gender === "female"
                      ? "প্রত্যাশিত পাত্রের ন্যূনতম বয়স"
                      : "সঙ্গীর ন্যূনতম বয়স"
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
                <Field label="সর্বোচ্চ বয়স">
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
                <h3 className="font-semibold mb-3 text-ink">পছন্দের উপজেলাসমূহ</h3>
                <div className="flex flex-wrap gap-3">
                  {TANGAIL_UPAZILAS.map((up) => (
                    <label key={up} className="flex items-center gap-2 text-sm text-ink-2">
                      <input
                        type="checkbox"
                        checked={
                          !!data.preferences?.preferredUpazilas?.includes(up)
                        }
                        onChange={(e) =>
                          update("preferences", {
                            ...data.preferences,
                            preferredUpazilas: e.target.checked
                              ? [
                                  ...(data.preferences?.preferredUpazilas ||
                                    []),
                                  up,
                                ]
                              : (
                                  data.preferences?.preferredUpazilas || []
                                ).filter((v) => v !== up),
                          })
                        }
                      />
                      {UPAZILA_DISPLAY_NAMES[up]}
                    </label>
                  ))}
                </div>
              </div>
              <Field label="দৃশ্যমানতা">
                <select
                  className={inputClass}
                  value={data.visibility || "public"}
                  onChange={(e) =>
                    update("visibility", e.target.value as ProfileVisibility)
                  }
                >
                  <option value="public">সবার জন্য</option>
                  <option value="registered_only">নিবন্ধিত সদস্য</option>
                  <option value="private">ব্যক্তিগত</option>
                </select>
              </Field>
              <h2 className="text-lg font-bold text-ink">
                {data.gender === "female"
                  ? "অভিভাবকের (ওয়ালী) যোগাযোগ"
                  : "অভিভাবকের যোগাযোগ"}
              </h2>
              <p className="text-sm text-ink-2">
                {data.gender === "female"
                  ? "পাত্রীর ক্ষেত্রে পিতা বা শরীয়াহসম্মত অভিভাবকের (ওয়ালী) তথ্য প্রদান করা আবশ্যক। এই তথ্য পাবলিক বায়োডাটাতে উন্মুক্ত থাকবে না।"
                  : "এই তথ্য public biodata-তে দেখানো হবে না। অভিভাবকের সম্মতি যাচাইয়ের পর যোগাযোগের অনুমতি দেওয়া যাবে।"}
              </p>
              <Field label="অভিভাবকের নাম">
                <input
                  className={inputClass}
                  value={guardian.name || ""}
                  onChange={(e) => updateGuardian("name", e.target.value)}
                />
              </Field>
              <Field label="সম্পর্ক">
                <input
                  className={inputClass}
                  value={guardian.relationship || ""}
                  placeholder={
                    data.gender === "female"
                      ? "পিতা / ভাই / চাচা (ওয়ালী)"
                      : "পিতা / মাতা / ভাই"
                  }
                  onChange={(e) =>
                    updateGuardian("relationship", e.target.value)
                  }
                />
              </Field>
              <Field label="অভিভাবকের মোবাইল">
                <input
                  type="tel"
                  className={inputClass}
                  value={guardian.phone || ""}
                  placeholder="01XXXXXXXXX"
                  onChange={(e) => updateGuardian("phone", e.target.value)}
                />
              </Field>
              <Field label="অভিভাবকের ইমেইল (ঐচ্ছিক)">
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
            ← আগের ধাপ
          </button>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={saving}
              className="mb-btn-secondary w-full sm:w-auto !px-5 !py-3 disabled:opacity-40 cursor-pointer"
            >
              {saving ? "সংরক্ষণ হচ্ছে..." : "খসড়া সংরক্ষণ"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={async () => {
                if (await save()) {
                  if (step < 3) setStep((v) => v + 1);
                  else navigate("/my-profile");
                }
              }}
              className="mb-btn-primary w-full sm:w-auto !px-6 !py-3 disabled:opacity-40 cursor-pointer"
            >
              {step < 3 ? "সংরক্ষণ করে পরের ধাপ →" : "যাচাই ও জমা দিতে যান →"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
