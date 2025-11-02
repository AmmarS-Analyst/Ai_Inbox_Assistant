"use client";

import { useEffect, useState } from 'react';

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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 card bg-white/60 dark:bg-slate-800/60 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Open vs Closed</h2>
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

          <div className="p-6 card bg-white/60 dark:bg-slate-800/60 rounded-xl">
            <h2 className="text-lg font-semibold mb-4">Priority distribution</h2>
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
          <div className="p-6 card bg-white/60 dark:bg-slate-800/60 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Top intents</h3>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {metrics.topIntents.length === 0 && <li>No intents found</li>}
              {metrics.topIntents.map((t) => (
                <li key={t.intent} className="flex justify-between"><span>{t.intent}</span><span className="font-medium">{t.count}</span></li>
              ))}
            </ol>
          </div>

          <div className="p-6 card bg-white/60 dark:bg-slate-800/60 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Last 30 days (tickets/day)</h3>
            <div className="text-sm text-gray-700 dark:text-gray-300">
              {metrics.trend.length === 0 ? (
                <div>No activity in the last 30 days.</div>
              ) : (
                <div className="overflow-auto">
                  <TrendSpark data={metrics.trend} />
                </div>
              )}
            </div>
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

function TrendSpark({ data }: { data: { day: string; count: number }[] }) {
  // Small sparkline using polyline
  const width = Math.max(300, data.length * 10);
  const height = 60;
  const max = Math.max(...data.map(d => d.count), 1);
  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - (d.count / max) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke="#2563eb" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}
