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
const inputClass =
  "w-full rounded-xl border border-gray-200 p-3 bg-white text-sm";
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm font-semibold text-gray-700">
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
      <Link to="/my-profile" className="text-sm text-rose-700">
        ← আমার বায়োডাটা
      </Link>
      <h1 className="text-2xl font-bold">ধাপে ধাপে বায়োডাটা তৈরি করুন</h1>
      <p className="text-sm text-gray-600">
        যতটুকু পূরণ হয়েছে খসড়া হিসেবে সংরক্ষণ করুন। সম্পাদনা করলে প্রকাশিত
        বায়োডাটা পুনরায় অনুমোদনের অপেক্ষায় যাবে।
      </p>
      <div className="rounded-xl bg-rose-50 p-4 text-sm">
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
              "p-3 rounded-xl text-sm " +
              (step === i ? "bg-rose-600 text-white" : "bg-white border")
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
          className="bg-white p-6 rounded-2xl border space-y-5"
        >
          {step === 0 && (
            <>
              <Field label="প্রদর্শনের নাম">
                <input
                  className={inputClass}
                  value={data.displayName || ""}
                  onChange={(e) => update("displayName", e.target.value)}
                />
              </Field>
              <Field label="পাত্র / পাত্রী">
                <select
                  className={inputClass}
                  value={data.gender || ""}
                  onChange={(e) => update("gender", e.target.value as Gender)}
                >
                  <option value="">নির্বাচন করুন</option>
                  <option value="male">পাত্র</option>
                  <option value="female">পাত্রী</option>
                </select>
              </Field>
              <Field label="জন্ম তারিখ (১৮+)">
                <input
                  type="date"
                  className={inputClass}
                  value={data.dateOfBirth?.slice(0, 10) || ""}
                  onChange={(e) => update("dateOfBirth", e.target.value)}
                />
              </Field>
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
                  <option value="widowed">বিধবা / বিপত্নীক</option>
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
                />
              </Field>
              <Field label="পেশা">
                <input
                  className={inputClass}
                  value={data.occupation || ""}
                  onChange={(e) => update("occupation", e.target.value)}
                />
              </Field>
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
              <Field label="নিজের পরিচিতি">
                <textarea
                  rows={5}
                  className={inputClass}
                  value={data.bio || ""}
                  onChange={(e) => update("bio", e.target.value)}
                  maxLength={1000}
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
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={!!data.religiousInfo?.praysFiveTimes}
                  onChange={(e) =>
                    update("religiousInfo", {
                      ...data.religiousInfo,
                      religion: "islam",
                      praysFiveTimes: e.target.checked,
                    })
                  }
                />
                পাঁচ ওয়াক্ত নামাজ পড়ি
              </label>
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={!!data.religiousInfo?.wearsHijab}
                  onChange={(e) =>
                    update("religiousInfo", {
                      ...data.religiousInfo,
                      religion: "islam",
                      wearsHijab: e.target.checked,
                    })
                  }
                />
                হিজাব পরিধান করি
              </label>
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  checked={!!data.lifestyle?.smoking}
                  onChange={(e) =>
                    update("lifestyle", {
                      ...data.lifestyle,
                      smoking: e.target.checked,
                    })
                  }
                />
                ধূমপান করি
              </label>
            </>
          )}
          {step === 3 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <Field label="সঙ্গীর ন্যূনতম বয়স">
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
                <h3 className="font-semibold mb-3">পছন্দের উপজেলাসমূহ</h3>
                <div className="flex flex-wrap gap-3">
                  {TANGAIL_UPAZILAS.map((up) => (
                    <label key={up} className="flex items-center gap-2 text-sm">
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
              <h2 className="text-lg font-bold">অভিভাবকের যোগাযোগ</h2>
              <p className="text-sm text-gray-600">
                এই তথ্য public biodata-তে দেখানো হবে না। অভিভাবকের সম্মতি
                যাচাইয়ের পর যোগাযোগের অনুমতি দেওয়া যাবে।
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
                  placeholder="পিতা / মাতা / ভাই"
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
        <div className="flex flex-wrap gap-3 justify-between">
          <button
            type="button"
            disabled={saving || step === 0}
            onClick={() => setStep((v) => v - 1)}
            className="px-4 py-3 border rounded-xl disabled:opacity-40"
          >
            আগের ধাপ
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-3 border border-rose-300 rounded-xl text-rose-700 disabled:opacity-40"
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
            className="px-4 py-3 rounded-xl bg-rose-600 text-white disabled:opacity-40"
          >
            {step < 3 ? "সংরক্ষণ করে পরের ধাপ" : "যাচাই ও জমা দিতে যান"}
          </button>
        </div>
      </form>
    </div>
  );
}
