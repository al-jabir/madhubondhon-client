import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  Coins,
  TrendingUp,
  MapPin,
} from "lucide-react";
import { adminApi } from "../../api/admin.api";
import LoadingSpinner from "../common/LoadingSpinner";
import { TANGAIL_UPAZILAS, UPAZILA_DISPLAY_NAMES, TangailUpazila } from "../../constants/locations";

type SeriesKey = "newUsers" | "newBiodata" | "interestsSent";

const SERIES: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: "newUsers", label: "নতুন ইউজার", color: "var(--mb-brand)" },
  { key: "newBiodata", label: "নতুন বায়োডাটা", color: "var(--mb-gold)" },
  { key: "interestsSent", label: "আগ্রহ", color: "var(--color-emerald-600, #059669)" },
];

const BIODATA_STATUS_LABELS: Record<string, string> = {
  draft: "খসড়া",
  submitted: "জমা দেওয়া",
  under_review: "পর্যালোচনাধীন",
  changes_requested: "পরিবর্তন চাওয়া হয়েছে",
  approved: "অনুমোদিত",
  rejected: "প্রত্যাখ্যাত",
};

const INTEREST_STATUS_LABELS: Record<string, string> = {
  pending: "অপেক্ষমান",
  accepted: "গৃহীত",
  declined: "প্রত্যাখ্যাত",
  withdrawn: "প্রত্যাহার",
};

const STATUS_COLORS: Record<string, string> = {
  approved: "var(--color-emerald-600, #059669)",
  accepted: "var(--color-emerald-600, #059669)",
  submitted: "var(--mb-gold)",
  under_review: "var(--mb-gold)",
  pending: "var(--mb-gold)",
  changes_requested: "var(--mb-brand)",
  draft: "var(--mb-ink-3)",
  rejected: "var(--mb-ink-3)",
  declined: "var(--mb-ink-3)",
  withdrawn: "var(--mb-ink-3)",
};

function niceMax(v: number): number {
  if (v <= 4) return 4;
  const steps = Math.ceil(v / 4) * 4;
  return steps;
}

const upazilaName = (key: string): string => {
  if ((TANGAIL_UPAZILAS as readonly string[]).includes(key)) {
    return UPAZILA_DISPLAY_NAMES[key as TangailUpazila];
  }
  return key;
};

const bnDate = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "short" });
  } catch {
    return iso;
  }
};

const ActivityChart: React.FC<{
  daily: Array<{ date: string; newUsers: number; newBiodata: number; interestsSent: number }>;
}> = ({ daily }) => {
  const [series, setSeries] = useState<SeriesKey>("newUsers");
  const active = SERIES.find((s) => s.key === series) ?? SERIES[0];

  const bar = useMemo(() => {
    const W = 720;
    const H = 220;
    const padL = 30;
    const padR = 8;
    const padT = 8;
    const padB = 26;
    const values = daily.map((d) => d[series]);
    const max = Math.max(...values, 0);
    const yMax2 = niceMax(max);
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const slot = plotW / Math.max(daily.length, 1);
    const barW = Math.max(slot * 0.55, 2);
    const x0 = padL;
    const baseline = padT + plotH;
    const computed = daily.map((d, i) => {
      const v = d[series];
      const h = yMax2 > 0 ? (v / yMax2) * plotH : 0;
      return {
        x: x0 + slot * i + (slot - barW) / 2,
        y: baseline - h,
        w: barW,
        h: Math.max(h, v > 0 ? 2 : 0),
        v,
        date: d.date,
      };
    });
    return { bars: computed, yMax: yMax2, padL, padT, padB, plotW, plotH, baseline, slot };
  }, [daily, series]);

  const gridYs = [0, 0.25, 0.5, 0.75, 1].map((f) => bar.padT + bar.plotH * (1 - f));
  const labelEvery = Math.ceil(30 / 6);

  return (
    <div>
      {/* Series toggles */}
      <div className="bg-elev rounded-full p-1 flex gap-1 flex-wrap w-fit max-w-full">
        {SERIES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSeries(s.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] sm:text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
              series === s.key
                ? "bg-card shadow-sm border border-line"
                : "text-ink-3 hover:text-ink border border-transparent"
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: s.color }}
              aria-hidden="true"
            />
            <span className={series === s.key ? "text-brand" : ""}>{s.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 w-full">
        <svg viewBox="0 0 720 220" className="w-full h-auto" role="img" aria-label={active.label}>
          {/* Grid lines */}
          {gridYs.map((y, i) => (
            <line
              key={`grid-${i}`}
              x1={bar.padL}
              x2={bar.padL + bar.plotW}
              y1={y}
              y2={y}
              stroke="var(--mb-line)"
              strokeWidth="1"
            />
          ))}
          {/* Y axis labels */}
          {[1, 0.5, 0].map((f, i) => (
            <text
              key={`ylab-${i}`}
              x={bar.padL - 6}
              y={bar.padT + bar.plotH * (1 - f) + 3}
              textAnchor="end"
              fontSize="9"
              fill="var(--mb-ink-3)"
            >
              {Math.round(bar.yMax * f)}
            </text>
          ))}
          {/* Tracks + bars */}
          {bar.bars.map((b, i) => (
            <g key={`bar-${i}`}>
              <rect
                x={b.x}
                y={bar.padT}
                width={b.w}
                height={bar.plotH}
                fill="var(--mb-ink-3)"
                fillOpacity="0.07"
                rx="3"
              />
              {b.h > 0 && (
                <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={active.color} rx="2">
                  <title>{`${bnDate(b.date)} — ${b.v}`}</title>
                </rect>
              )}
            </g>
          ))}
          {/* Baseline */}
          <line
            x1={bar.padL}
            x2={bar.padL + bar.plotW}
            y1={bar.baseline}
            y2={bar.baseline}
            stroke="var(--mb-line-strong)"
            strokeWidth="1"
          />
          {/* X labels (every few days) */}
          {bar.bars.map((b, i) =>
            i % labelEvery === 0 && i < bar.bars.length - 1 ? (
              <text
                key={`xlab-${i}`}
                x={b.x + b.w / 2}
                y={bar.padT + bar.plotH + 14}
                textAnchor="middle"
                fontSize="9"
                fill="var(--mb-ink-3)"
              >
                {bnDate(b.date)}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  );
};

const StatusBars: React.FC<{
  title: string;
  items: Array<{ status: string; count: number }>;
  labels: Record<string, string>;
}> = ({ title, items, labels }) => {
  const max = Math.max(...items.map((i) => i.count), 0);
  const total = items.reduce((sum, i) => sum + i.count, 0);
  return (
    <div className="mb-card p-5 space-y-3">
      <h3 className="mb-section-title text-sm">{title}</h3>
      {total === 0 ? (
        <p className="text-xs text-ink-3">এখনো কোনো তথ্য নেই।</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.status} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-ink-2">{labels[item.status] ?? item.status}</span>
                <span className="font-black text-ink">{item.count}</span>
              </div>
              <div className="h-2 rounded-full bg-elev border border-line overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${max > 0 ? (item.count / max) * 100 : 0}%`,
                    backgroundColor:
                      STATUS_COLORS[item.status] ?? "var(--mb-ink-3)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const AdminAnalytics: React.FC = () => {
  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics(),
  });

  const analytics = analyticsData?.data?.analytics;

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <LoadingSpinner size="lg" label="বিশ্লেষণ লোড হচ্ছে..." />
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="mb-card py-16 text-center text-xs text-ink-3">
        বিশ্লেষণ ডেটা লোড করা যায়নি। পরে আবার চেষ্টা করুন।
      </div>
    );
  }

  const approvedCount =
    analytics.biodataByStatus.find((s) => s.status === "approved")?.count ?? 0;
  const pendingReviewCount =
    analytics.biodataByStatus
      .filter((s) => ["submitted", "under_review", "changes_requested"].includes(s.status))
      .reduce((sum, s) => sum + s.count, 0);

  const kpis = [
    {
      label: "মোট বায়োডাটা",
      value: analytics.totals.biodata,
      icon: FileText,
      chip: "bg-brand-soft border-brand/25 text-brand",
    },
    {
      label: "অনুমোদিত",
      value: approvedCount,
      icon: CheckCircle,
      chip: "bg-gold-soft border-gold/25 text-gold",
    },
    {
      label: "অপেক্ষমান",
      value: pendingReviewCount,
      icon: Clock,
      chip: "bg-gold-soft border-gold/25 text-gold",
    },
    {
      label: "মোট আয়",
      value: `৳${analytics.revenue.totalPaid}`,
      icon: Coins,
      chip: "bg-brand-soft border-brand/25 text-brand",
    },
  ];

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="mb-card p-5 space-y-1">
              <div className="flex items-center justify-between text-ink-3">
                <span className="text-xs font-bold">{k.label}</span>
                <div
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center ${k.chip}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-ink">{k.value}</div>
            </div>
          );
        })}
      </div>

      {/* 30-day chart */}
      <div className="mb-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-brand" />
          <h3 className="mb-section-title text-sm">শেষ ৩০ দিনের কার্যক্রম</h3>
        </div>
        <ActivityChart daily={analytics.daily} />
      </div>

      {/* Status breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusBars
          title="বায়োডাটা অনুমোদনের অবস্থা"
          items={analytics.biodataByStatus}
          labels={BIODATA_STATUS_LABELS}
        />
        <StatusBars
          title="আগ্রহের অবস্থা"
          items={analytics.interestsByStatus}
          labels={INTEREST_STATUS_LABELS}
        />
      </div>

      {/* Top districts (upazilas of Tangail) */}
      <div className="mb-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand" />
          <h3 className="mb-section-title text-sm">উপজেলা অনুযায়ী বায়োডাটা</h3>
        </div>
        {analytics.topDistricts.length === 0 ? (
          <p className="text-xs text-ink-3">এখনো কোনো তথ্য নেই।</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {analytics.topDistricts.map((d) => (
              <span
                key={d.name}
                className="mb-badge flex items-center gap-1.5"
              >
                <BarChart3 className="w-3 h-3 text-brand" />
                {upazilaName(d.name)}
                <span className="font-black text-ink">{d.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
