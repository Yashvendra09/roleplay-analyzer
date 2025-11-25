'use client';

import { useEffect, useState } from 'react';

/**
 * AnalyticsPanel
 * - Fetches GET /api/analytics
 * - Renders: small KPI cards, simple line chart for timeSeries (overallScore),
 *   and bucket table for averages per day/hour.
 *
 * No external chart libs used; tiny inline SVG line chart.
 */

export default function AnalyticsPanel({ userId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [groupBy, setGroupBy] = useState('day');

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        userId: userId || '',
        limit: '100',
        groupBy,
      });
      const res = await fetch(`/api/analytics?${qs.toString()}`);
      const json = await res.json();
      if (json?.success) setData(json);
      else setData({ success: false });
    } catch (err) {
      console.error('fetchAnalytics err', err);
      setData({ success: false });
    } finally {
      setLoading(false);
    }
  }

  // tiny helper to render KPI card
  function Kpi({ label, value }) {
    return (
      <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className="mt-1 text-lg font-semibold text-slate-900">
          {value ?? '—'}
        </div>
      </div>
    );
  }

  // tiny svg line chart for overallScore timeSeries
  function LineChart({ series = [] }) {
    if (!series || series.length === 0)
      return <div className="text-xs text-slate-500">No data</div>;

    // map scores
    const values = series.map((s) => (s.overallScore == null ? 0 : s.overallScore));
    const max = Math.max(...values, 10);
    const min = Math.min(...values, 0);
    const width = 360;
    const height = 80;
    const pad = 6;
    const step = (width - pad * 2) / Math.max(1, values.length - 1);

    const points = values.map((v, i) => {
      const x = pad + i * step;
      const norm = (v - min) / (max - min || 1);
      const y = pad + (1 - norm) * (height - pad * 2);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;

    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="rounded-md bg-slate-50 border border-slate-100">
        <path d={pathD} fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {values.map((v, i) => {
          const [x, y] = points[i].split(',').map(Number);
          return <circle key={i} cx={x} cy={y} r={2.2} fill="#4f46e5" />;
        })}
      </svg>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-900">Analytics</h3>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Group</label>
          <select
            className="rounded-md border border-slate-200 px-2 py-1 text-xs"
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="hour">Hour</option>
          </select>
        </div>
      </div>

      {loading && <div className="text-xs text-slate-500 mb-3">Loading...</div>}

      {!data && !loading && <div className="text-xs text-slate-500">No data</div>}

      {data?.success && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Kpi label="Avg Overall" value={data.aggregates.avgOverall} />
            <Kpi label="Avg Empathy" value={data.aggregates.avgEmpathy} />
            <Kpi label="Avg Clarity" value={data.aggregates.avgClarity} />
            <Kpi label="Avg Product" value={data.aggregates.avgProductKnowledge} />
          </div>

          <div className="mb-3">
            <div className="text-xs text-slate-500 mb-1">Overall score (time series)</div>
            <LineChart series={data.timeSeries} />
          </div>

          <div className="text-xs text-slate-500 mb-1">Buckets ({groupBy})</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="px-2 py-1">ts</th>
                  <th className="px-2 py-1">count</th>
                  <th className="px-2 py-1">avgOverall</th>
                  <th className="px-2 py-1">avgEmpathy</th>
                  <th className="px-2 py-1">avgClarity</th>
                </tr>
              </thead>
              <tbody>
                {data.buckets.map((b) => (
                  <tr key={b.ts}>
                    <td className="px-2 py-1 text-slate-700">{new Date(b.ts).toLocaleString()}</td>
                    <td className="px-2 py-1 text-slate-700">{b.count}</td>
                    <td className="px-2 py-1 text-slate-700">{b.avgOverall ?? '—'}</td>
                    <td className="px-2 py-1 text-slate-700">{b.avgEmpathy ?? '—'}</td>
                    <td className="px-2 py-1 text-slate-700">{b.avgClarity ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!data?.success && (
        <div className="text-xs text-red-600 mt-3">Failed to load analytics (check server)</div>
      )}
    </div>
  );
}
