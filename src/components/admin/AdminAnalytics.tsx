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
import { getUpazilaDisplayName } from "../../constants/locations";
import { useLanguage } from "../../i18n/LanguageContext";

type SeriesKey = "newUsers" | "newBiodata" | "interestsSent";

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

const ActivityChart: React.FC<{
  daily: Array<{ date: string; newUsers: number; newBiodata: number; interestsSent: number }>;
}> = ({ daily }) => {
  const { isBengali, formatNumber } = useLanguage();
  const [series, setSeries] = useState<SeriesKey>("newUsers");

  const seriesList: Array<{ key: SeriesKey; label: string; color: string }> = [
    { key: "newUsers", label: isBengali ? "নতুন ইউজার" : "New Users", color: "var(--mb-brand)" },
    { key: "newBiodata", label: isBengali ? "নতুন বায়োডাটা" : "New Biodata", color: "var(--mb-gold)" },
    { key: "interestsSent", label: isBengali ? "আগ্রহ" : "Interests", color: "var(--color-emerald-600, #059669)" },
  ];

  const active = seriesList.find((s) => s.key === series) ?? seriesList[0];

  const formatDate = (iso: string): string => {
    try {
      return new Date(iso).toLocaleDateString(isBengali ? "bn-BD" : "en-US", { day: "numeric", month: "short" });
    } catch {
      return iso;
    }
  };

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
        {seriesList.map((s) => (
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
              {formatNumber(Math.round(bar.yMax * f))}
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
                  <title>{`${formatDate(b.date)} — ${formatNumber(b.v)}`}</title>
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
                {formatDate(b.date)}
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
  const { isBengali, formatNumber } = useLanguage();
  const max = Math.max(...items.map((i) => i.count), 0);
  const total = items.reduce((sum, i) => sum + i.count, 0);
  return (
    <div className="mb-card p-5 space-y-3">
      <h3 className="mb-section-title text-sm">{title}</h3>
      {total === 0 ? (
        <p className="text-xs text-ink-3">
          {isBengali ? "এখনো কোনো তথ্য নেই।" : "No data available yet."}
        </p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.status} className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-ink-2">{labels[item.status] ?? item.status}</span>
                <span className="font-black text-ink">{formatNumber(item.count)}</span>
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

export const AdminAnalytics: React.FC = () => {
  const { isBengali, formatNumber } = useLanguage();
  const { data: analyticsData, isLoading, isError } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: () => adminApi.getAnalytics(),
  });

  const analytics = analyticsData?.data?.analytics;

  const biodataStatusLabels: Record<string, string> = {
    draft: isBengali ? "খসড়া" : "Draft",
    submitted: isBengali ? "জমা দেওয়া" : "Submitted",
    under_review: isBengali ? "পর্যালোচনাধীন" : "Under Review",
    changes_requested: isBengali ? "পরিবর্তন চাওয়া হয়েছে" : "Changes Requested",
    approved: isBengali ? "অনুমোদিত" : "Approved",
    rejected: isBengali ? "প্রত্যাখ্যাত" : "Rejected",
  };

  const interestStatusLabels: Record<string, string> = {
    pending: isBengali ? "অপেক্ষমান" : "Pending",
    accepted: isBengali ? "গৃহীত" : "Accepted",
    declined: isBengali ? "প্রত্যাখ্যাত" : "Declined",
    withdrawn: isBengali ? "প্রত্যাহার" : "Withdrawn",
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center">
        <LoadingSpinner size="lg" label={isBengali ? "বিশ্লেষণ লোড হচ্ছে..." : "Loading analytics..."} />
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="mb-card py-16 text-center text-xs text-ink-3">
        {isBengali
          ? "বিশ্লেষণ ডেটা লোড করা যায়নি। পরে আবার চেষ্টা করুন।"
          : "Could not load analytics data. Please try again later."}
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
      label: isBengali ? "মোট বায়োডাটা" : "Total Biodata",
      value: formatNumber(analytics.totals.biodata),
      icon: FileText,
      chip: "bg-brand-soft border-brand/25 text-brand",
    },
    {
      label: isBengali ? "অনুমোদিত" : "Approved",
      value: formatNumber(approvedCount),
      icon: CheckCircle,
      chip: "bg-gold-soft border-gold/25 text-gold",
    },
    {
      label: isBengali ? "অপেক্ষমান" : "Pending Review",
      value: formatNumber(pendingReviewCount),
      icon: Clock,
      chip: "bg-gold-soft border-gold/25 text-gold",
    },
    {
      label: isBengali ? "মোট আয়" : "Total Revenue",
      value: `৳${formatNumber(analytics.revenue.totalPaid)}`,
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
          <h3 className="mb-section-title text-sm">
            {isBengali ? "শেষ ৩০ দিনের কার্যক্রম" : "Last 30 Days Activity"}
          </h3>
        </div>
        <ActivityChart daily={analytics.daily} />
      </div>

      {/* Status breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatusBars
          title={isBengali ? "বায়োডাটা অনুমোদনের অবস্থা" : "Biodata Review Status"}
          items={analytics.biodataByStatus}
          labels={biodataStatusLabels}
        />
        <StatusBars
          title={isBengali ? "আগ্রহের অবস্থা" : "Interest Requests Status"}
          items={analytics.interestsByStatus}
          labels={interestStatusLabels}
        />
      </div>

      {/* Top districts (upazilas of Tangail) */}
      <div className="mb-card p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand" />
          <h3 className="mb-section-title text-sm">
            {isBengali ? "উপজেলা অনুযায়ী বায়োডাটা" : "Biodata by Upazila"}
          </h3>
        </div>
        {analytics.topDistricts.length === 0 ? (
          <p className="text-xs text-ink-3">
            {isBengali ? "এখনো কোনো তথ্য নেই।" : "No data available yet."}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {analytics.topDistricts.map((d) => (
              <span
                key={d.name}
                className="mb-badge flex items-center gap-1.5"
              >
                <BarChart3 className="w-3 h-3 text-brand" />
                {getUpazilaDisplayName(d.name, isBengali)}
                <span className="font-black text-ink">{formatNumber(d.count)}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
