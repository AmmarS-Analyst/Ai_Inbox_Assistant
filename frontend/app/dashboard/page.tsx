"use client";

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Metrics = {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  topIntents: { intent: string; count: number }[];
  trend: { day: string; count: number }[];
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/metrics/summary');
        const data = await res.json();
        if (!data.success) throw new Error(data.error || 'Failed to load metrics');
        setMetrics(data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <div className="p-8">Loading metrics...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!metrics) return <div className="p-8">No metrics available</div>;

  // Prepare chart data
  const openCount = metrics.byStatus['open'] || 0;
  const closedCount = metrics.byStatus['closed'] || 0;
  const prioLow = metrics.byPriority['low'] || 0;
  const prioMedium = metrics.byPriority['medium'] || 0;
  const prioHigh = metrics.byPriority['high'] || 0;
  const prioTotal = prioLow + prioMedium + prioHigh;

  const donutData = [openCount, closedCount];
  const prioData = [prioLow, prioMedium, prioHigh];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
      <div className="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03] -z-10"></div>
      <div className="container mx-auto px-4 py-12 max-w-6xl relative">
        <h1 className="text-5xl sm:text-6xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 dark:from-indigo-300 dark:via-blue-300 dark:to-cyan-300 mb-8 leading-tight tracking-tight">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
            <h2 className="text-xl font-display font-semibold mb-4 text-gray-900 dark:text-white">Open vs Closed</h2>
            <div className="flex items-center gap-6">
              <div>
                <SimpleDonut labels={["Open", "Closed"]} values={donutData} colors={["#2563eb", "#6b7280"]} size={160} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">Total tickets: <strong>{metrics.total}</strong></p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center justify-between"><span>Open</span><span className="font-medium">{openCount}</span></li>
                  <li className="flex items-center justify-between"><span>Closed</span><span className="font-medium">{closedCount}</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="p-6 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
            <h2 className="text-xl font-display font-semibold mb-4 text-gray-900 dark:text-white">Priority distribution</h2>
            <div className="flex items-center gap-6">
              <div style={{ width: 240 }}>
                <SimpleBar labels={["Low","Medium","High"]} values={prioData} colors={["#10b981", "#f59e0b", "#ef4444"]} max={Math.max(...prioData, 1)} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">Total prioritized tickets: <strong>{prioTotal}</strong></p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center justify-between"><span>High</span><span className="font-medium">{prioHigh}</span></li>
                  <li className="flex items-center justify-between"><span>Medium</span><span className="font-medium">{prioMedium}</span></li>
                  <li className="flex items-center justify-between"><span>Low</span><span className="font-medium">{prioLow}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
            <h3 className="text-xl font-display font-semibold mb-3 text-gray-900 dark:text-white">Top intents</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {metrics.topIntents.length === 0 && <li>No intents found</li>}
              {metrics.topIntents.map((t) => (
                <li key={t.intent} className="flex justify-between"><span>{t.intent}</span><span className="font-medium">{t.count}</span></li>
              ))}
            </ol>
          </div>

            <div className="p-6 backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200">
              <h3 className="text-xl font-display font-semibold mb-3 text-gray-900 dark:text-white">Daily tickets — trend & 7-day average</h3>
              {metrics.trend.length === 0 ? (
                <div className="text-sm text-gray-700 dark:text-gray-300">No activity in the last 30 days.</div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 mb-2">
                    <div className="flex-1 min-w-[160px]">
                      <div className="text-xs text-gray-500">Avg / day</div>
                      <div className="text-2xl font-semibold">{Math.round(metrics.trend.reduce((a,b)=>a+b.count,0)/Math.max(metrics.trend.length,1))}</div>
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <div className="text-xs text-gray-500">7-day avg</div>
                      <div className="text-2xl font-semibold">{compute7DayAvg(metrics.trend)}</div>
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <div className="text-xs text-gray-500">Change vs prev 7d</div>
                      <div className="text-2xl font-semibold">{computePercentChange(metrics.trend)}</div>
                    </div>
                  </div>
                  <div className="w-full overflow-hidden">
                    <TrendChart data={metrics.trend} height={160} />
                  </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </div>
  );
}

function SimpleDonut({ labels, values, colors, size = 120 }: { labels: string[]; values: number[]; colors: string[]; size?: number }) {
  const total = values.reduce((a, b) => a + b, 0) || 1;
  const radius = size / 2;
  const thickness = Math.max(12, Math.floor(size * 0.18));
  let angle = -90; // start at top

  const arcs = values.map((v, i) => {
    const portion = v / total;
    const sweep = portion * 360;
    const start = angle;
    const end = angle + sweep;
    angle += sweep;
    return { start, end, color: colors[i] || '#888' };
  });

  // helper to convert angle to SVG path
  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`translate(${radius}, ${radius})`}>
        {arcs.map((a, idx) => (
          <path key={idx}
            d={describeArc(0, 0, radius - thickness / 2, a.start, a.end)}
            stroke={a.color}
            strokeWidth={thickness}
            fill="none"
            strokeLinecap="butt"
          />
        ))}
        <circle cx={0} cy={0} r={radius - thickness - 2} fill="transparent" />
        <text x={0} y={4} textAnchor="middle" fontSize={12} fill="#111" className="dark:text-white">{total}</text>
      </g>
    </svg>
  );
}

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function SimpleBar({ labels, values, colors, max = 1 }: { labels: string[]; values: number[]; colors: string[]; max?: number }) {
  return (
    <div className="space-y-3">
      {labels.map((label, idx) => {
        const val = values[idx] || 0;
        const pct = Math.round((val / Math.max(max, 1)) * 100);
        return (
          <div key={label} className="flex items-center gap-3">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-300">{label}</div>
            <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
              <div style={{ width: `${pct}%`, background: colors[idx] }} className="h-4 rounded-full"></div>
            </div>
            <div className="w-12 text-right text-sm font-medium">{val}</div>
          </div>
        );
      })}
    </div>
  );
}

// TrendChart using Chart.js
function TrendChart({ data, height = 140 }: { data: { day: string; count: number }[]; height?: number }) {
  const labels = data.map(d => d.day);
  const counts = data.map(d => d.count);

  // compute 7-day moving average
  const ma = counts.map((_, i) => {
    const slice = counts.slice(Math.max(0, i - 6), i + 1);
    const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
    return Math.round(avg * 100) / 100;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Tickets',
        data: counts,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37,99,235,0.12)',
        tension: 0.25,
        fill: true,
        pointRadius: 2,
      },
      {
        label: '7-day avg',
        data: ma,
        borderColor: '#10b981',
        borderDash: [6, 4],
        tension: 0.2,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { mode: 'index' as const, intersect: false },
      title: { display: false },
    },
    scales: {
      x: { ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 } },
      y: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };

  return (
    <div style={{ height }}>
      <Line data={chartData} options={options} />
    </div>
  );
}

function compute7DayAvg(data: { day: string; count: number }[]) {
  const last7 = data.slice(-7);
  if (last7.length === 0) return 0;
  const avg = Math.round(last7.reduce((s, d) => s + d.count, 0) / last7.length);
  return avg;
}

function computePercentChange(data: { day: string; count: number }[]) {
  const len = data.length;
  if (len < 14) return '–';
  const recent = data.slice(-7).reduce((s,d)=>s+d.count,0) / 7;
  const prev = data.slice(-14, -7).reduce((s,d)=>s+d.count,0) / 7;
  if (prev === 0) return recent === 0 ? '0%' : '↑ 100%';
  const pct = Math.round(((recent - prev) / prev) * 100);
  return `${pct > 0 ? '↑' : pct < 0 ? '↓' : ''} ${Math.abs(pct)}%`;
}

function TrendLine({ data, height = 140 }: { data: { day: string; count: number }[]; height?: number }) {
  // Responsive width via viewBox; we'll use 600 units width
  const width = Math.max(300, data.length * 18);
  const max = Math.max(...data.map(d => d.count), 1);
  // compute 7-day moving average
  const ma: number[] = data.map((_, i) => {
    const slice = data.slice(Math.max(0, i - 6), i + 1);
    const avg = slice.reduce((s, d) => s + d.count, 0) / slice.length;
    return avg;
  });

  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - (d.count / max) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  const maPoints = ma.map((v, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - (v / max) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="rounded-lg">
      <defs>
        <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* area under main line */}
      <polyline points={`${points} ${width},${height} 0,${height}`} fill="url(#grad)" stroke="none" />
      <polyline points={points} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {/* moving average */}
      <polyline points={maPoints} fill="none" stroke="#10b981" strokeWidth={2} strokeDasharray="6 4" strokeLinejoin="round" strokeLinecap="round" />
      {/* dots */}
      {data.map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * width;
        const y = height - (d.count / max) * (height - 8) - 4;
        return (
          <circle key={d.day} cx={x} cy={y} r={2} fill="#2563eb" />
        );
      })}
      {/* x labels (sparse) */}
      {data.map((d, i) => {
        if (i % Math.ceil(Math.max(1, data.length / 6)) !== 0) return null;
        const x = (i / Math.max(1, data.length - 1)) * width;
        return (
          <text key={`l-${i}`} x={x} y={height - 2} fontSize={10} fill="#6b7280" textAnchor="middle">{d.day}</text>
        );
      })}
    </svg>
  );
}
