import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { SystemHealthData } from '../../types';
import { useLanguage } from '../../i18n/LanguageContext';

export const SystemHealthDiagnosticsWidget: React.FC = () => {
  const { isBengali, formatNumber } = useLanguage();

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-system-health'],
    queryFn: () => adminApi.getSystemHealth(),
    refetchInterval: 30000, // Auto refresh every 30s
  });

  const health: SystemHealthData | undefined = data?.data;

  const memoryPercent = health
    ? Math.min(100, Math.round((health.memory.heapUsedMB / health.memory.heapTotalMB) * 100))
    : 0;

  return (
    <div className="mb-card p-4 sm:p-5 space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Activity className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink">
              {isBengali ? 'লাইভ সিস্টেম হেলথ ও পারফরম্যান্স ডায়াগনস্টিকস' : 'Live System Health & Diagnostics'}
            </h3>
            <p className="text-[11px] text-ink-3">
              {isBengali
                ? 'সার্ভার মেমরি, মঙ্গোডিবি সংযোগ ও ডাটাবেস মেট্রিক্স'
                : 'Server memory, MongoDB connection ping & collection metrics'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-line bg-elev hover:bg-card text-xs font-semibold text-ink-2 hover:text-ink transition-colors cursor-pointer disabled:opacity-50"
          title={isBengali ? 'রিফ্রেশ করুন' : 'Refresh metrics'}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
          <span className="hidden sm:inline">{isBengali ? 'রিফ্রেশ' : 'Refresh'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-ink-3">
          {isBengali ? 'মেট্রিক্স লোড হচ্ছে...' : 'Loading system metrics...'}
        </div>
      ) : !health ? (
        <div className="py-6 text-center text-xs text-rose-500">
          {isBengali ? 'সিস্টেম মেট্রিক্স পাওয়া যায়নি' : 'System metrics unavailable'}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Main 3-Column Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Server Uptime & Node */}
            <div className="bg-elev border border-line p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-ink-3">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  {isBengali ? 'সার্ভার আপটাইম' : 'Server Uptime'}
                </span>
                <span className="font-mono text-[10px] bg-blue-500/10 text-blue-600 px-1.5 py-0.5 rounded">
                  {health.server.nodeVersion}
                </span>
              </div>
              <div className="font-mono font-bold text-lg text-ink">
                {health.server.uptimeFormatted}
              </div>
              <div className="text-[11px] text-ink-3 flex items-center justify-between">
                <span>
                  {isBengali ? 'পরিবেশ:' : 'Environment:'} {health.server.environment}
                </span>
                <span>PID: {health.server.pid}</span>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-elev border border-line p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-ink-3">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  {isBengali ? 'হিপ মেমরি ব্যবহার' : 'Heap Memory Usage'}
                </span>
                <span className="font-mono text-[10px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded font-bold">
                  {formatNumber(memoryPercent)}%
                </span>
              </div>
              <div className="font-mono font-bold text-lg text-ink">
                {formatNumber(health.memory.heapUsedMB)} MB{' '}
                <span className="text-xs text-ink-3 font-normal">
                  / {formatNumber(health.memory.heapTotalMB)} MB
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    memoryPercent > 85 ? 'bg-rose-500' : memoryPercent > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${memoryPercent}%` }}
                />
              </div>
              <div className="text-[10px] text-ink-3 flex justify-between">
                <span>RSS: {formatNumber(health.memory.rssMB)} MB</span>
                <span>External: {formatNumber(health.memory.externalMB)} MB</span>
              </div>
            </div>

            {/* Database & Latency */}
            <div className="bg-elev border border-line p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between text-ink-3">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  {isBengali ? 'MongoDB সংযোগ' : 'MongoDB Connection'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    health.database.status === 'connected'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : 'bg-rose-500/10 text-rose-600'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {health.database.status === 'connected'
                    ? isBengali
                      ? 'সক্রিয়'
                      : 'Connected'
                    : isBengali
                    ? 'বিচ্ছিন্ন'
                    : 'Disconnected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono font-bold text-lg text-ink">
                  {health.database.pingMs >= 0 ? `${formatNumber(health.database.pingMs)} ms` : '—'}
                </div>
                <span className="text-[10px] text-ink-3 font-mono">
                  DB: {health.database.name}
                </span>
              </div>
              <div className="text-[10px] text-ink-3 truncate">
                {isBengali ? 'হোস্ট:' : 'Host:'} {health.database.host}
              </div>
            </div>
          </div>

          {/* Database Collection Statistics Row */}
          <div className="bg-muted/30 border border-line p-3 rounded-xl flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <div className="flex items-center gap-1.5 text-ink-3 shrink-0">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="font-semibold text-ink">
                {isBengali ? 'রেকর্ড সংখ্যা:' : 'Record Counts:'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-ink-3 text-[11px] shrink-0 font-mono">
              <span>
                {isBengali ? 'ইউজার:' : 'Users:'}{' '}
                <strong className="text-ink">{formatNumber(health.counts.users)}</strong>
              </span>
              <span>
                {isBengali ? 'বায়োডাটা:' : 'Biodata:'}{' '}
                <strong className="text-ink">{formatNumber(health.counts.profiles)}</strong>
              </span>
              <span>
                {isBengali ? 'পেমেন্ট:' : 'Payments:'}{' '}
                <strong className="text-ink">{formatNumber(health.counts.transactions)}</strong>
              </span>
              <span>
                {isBengali ? 'কুপন:' : 'Coupons:'}{' '}
                <strong className="text-ink">{formatNumber(health.counts.coupons)}</strong>
              </span>
              <span>
                {isBengali ? 'অডিট লগ:' : 'Audit Logs:'}{' '}
                <strong className="text-ink">{formatNumber(health.counts.auditLogs)}</strong>
              </span>
              <span>
                {isBengali ? 'সাপোর্ট মেসেজ:' : 'Support Messages:'}{' '}
                <strong className="text-ink">{formatNumber(health.counts.supportMessages)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthDiagnosticsWidget;
