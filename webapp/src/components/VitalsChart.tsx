import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceArea,
} from 'recharts';
import type { StoredVitalEntry } from '../utils/healthStore';

interface VitalsChartProps {
  entries: StoredVitalEntry[];
  onLogReading: () => void;
}

type MetricKey = 'bp' | 'hr' | 'sugar' | 'temp';

// Approximate clinical "normal" bands used only to shade the chart — not a diagnostic claim.
const METRIC_CONFIG: Record<MetricKey, { label: string; unit: string; band?: [number, number]; lines: { key: keyof StoredVitalEntry; name: string; color: string }[] }> = {
  bp: { label: 'Blood Pressure', unit: 'mmHg', band: [90, 120], lines: [{ key: 'systolic', name: 'Systolic', color: '#0EA5A4' }, { key: 'diastolic', name: 'Diastolic', color: '#60A5FA' }] },
  hr: { label: 'Heart Rate', unit: 'bpm', band: [60, 100], lines: [{ key: 'hr', name: 'Heart Rate', color: '#EC4899' }] },
  sugar: { label: 'Blood Sugar', unit: 'mg/dL', band: [70, 100], lines: [{ key: 'sugar', name: 'Blood Sugar', color: '#F59E0B' }] },
  temp: { label: 'Temperature', unit: '°F', band: [97, 99], lines: [{ key: 'temp', name: 'Temperature', color: '#F97316' }] },
};

const RANGE_OPTIONS: { key: '7D' | '30D' | '90D'; days: number }[] = [
  { key: '7D', days: 7 }, { key: '30D', days: 30 }, { key: '90D', days: 90 },
];

const VitalsChart = ({ entries, onLogReading }: VitalsChartProps) => {
  const [metric, setMetric] = useState<MetricKey>('bp');
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('7D');

  // Entries aren't reliably timestamped (seeded rows use weekday labels, logged
  // rows use real dates) so "time range" takes the most recent N entries as a
  // stand-in for calendar days rather than a strict date filter.
  const visibleData = useMemo(() => {
    const days = RANGE_OPTIONS.find(r => r.key === range)?.days || 7;
    return entries.slice(-days);
  }, [entries, range]);

  const config = METRIC_CONFIG[metric];

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-base font-bold text-txt">Vitals Overview</h3>
        <button onClick={onLogReading} className="flex items-center gap-1.5 text-xs font-bold text-brand bg-brand-glow px-3 py-1.5 rounded-full hover:bg-brand hover:text-white transition-colors">
          <Plus size={13} /> Log a Reading
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex gap-1.5 flex-wrap">
          {(Object.keys(METRIC_CONFIG) as MetricKey[]).map(k => (
            <button
              key={k}
              onClick={() => setMetric(k)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${metric === k ? 'bg-brand text-white' : 'bg-base border border-border text-txt-secondary hover:text-txt'}`}
            >
              {METRIC_CONFIG[k].label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 bg-base border border-border rounded-full p-1">
          {RANGE_OPTIONS.map(r => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`px-2.5 py-1 rounded-full text-[0.65rem] font-bold transition-colors ${range === r.key ? 'bg-brand text-white' : 'text-txt-muted hover:text-txt'}`}
            >
              {r.key}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visibleData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="date" stroke="var(--color-txt-muted)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="var(--color-txt-muted)" fontSize={11} tickLine={false} axisLine={false} unit={` ${config.unit}`} width={70} />
            <Tooltip contentStyle={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)', borderRadius: 10, fontSize: 12 }} />
            {config.band && (
              <ReferenceArea y1={config.band[0]} y2={config.band[1]} fill="var(--color-success)" fillOpacity={0.08} ifOverflow="extendDomain" />
            )}
            {config.lines.map(line => (
              <Line key={String(line.key)} type="monotone" dataKey={line.key} name={line.name} stroke={line.color} strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {config.band && (
        <p className="text-[0.65rem] text-txt-muted mt-2">Shaded band = typical normal range ({config.band[0]}–{config.band[1]} {config.unit}). Not a diagnosis.</p>
      )}
    </div>
  );
};

export default VitalsChart;
