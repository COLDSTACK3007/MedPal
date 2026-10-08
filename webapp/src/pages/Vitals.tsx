import { useState, type ReactNode } from 'react';
import { Activity, Heart, Droplet, Thermometer, Plus, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getVitalsLog, addVitalsEntry, type StoredVitalEntry } from '../utils/healthStore';

const DEFAULT_VITALS: StoredVitalEntry[] = [
  { date: 'Mon', systolic: 120, diastolic: 80, sugar: 95, hr: 72 },
  { date: 'Tue', systolic: 118, diastolic: 79, sugar: 92, hr: 70 },
  { date: 'Wed', systolic: 122, diastolic: 82, sugar: 105, hr: 75 },
  { date: 'Thu', systolic: 119, diastolic: 80, sugar: 98, hr: 71 },
  { date: 'Fri', systolic: 125, diastolic: 85, sugar: 110, hr: 78 },
  { date: 'Sat', systolic: 121, diastolic: 81, sugar: 96, hr: 74 },
  { date: 'Sun', systolic: 118, diastolic: 78, sugar: 90, hr: 72 },
];

interface VitalMetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: ReactNode;
  colorClass: string;
  isActive: boolean;
  onClick: () => void;
}

const VitalMetricCard = ({ title, value, unit, icon, colorClass, isActive, onClick }: VitalMetricCardProps) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${isActive ? 'bg-surface border-brand shadow-md shadow-brand/10' : 'bg-base border-border-dark hover:border-brand/50'}`}
  >
    <div className="flex items-center justify-between mb-3">
      <div className={`p-2 rounded-lg ${colorClass}`}>
        {icon}
      </div>
      {isActive && <div className="w-2 h-2 rounded-full bg-brand" />}
    </div>
    <p className="text-sm text-txt-secondary font-medium">{title}</p>
    <h3 className="text-2xl font-bold text-txt mt-1">{value} <span className="text-sm font-normal text-txt-muted">{unit}</span></h3>
  </div>
);

const Vitals = () => {
  const { currentUser } = useAuth();
  const username = currentUser?.username || '';

  const [activeMetric, setActiveMetric] = useState<'BP' | 'Sugar' | 'HR'>('BP');
  // Lazily seeded from the store once — username is stable for the
  // component's lifetime since App fully remounts on login/logout.
  const [vitalsLog, setVitalsLogState] = useState<StoredVitalEntry[]>(() => {
    if (!username) return DEFAULT_VITALS;
    const stored = getVitalsLog(username);
    return stored && stored.length > 0 ? stored : DEFAULT_VITALS;
  });
  const [showLogModal, setShowLogModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ systolic: '', diastolic: '', sugar: '', hr: '', temp: '' });

  const latest = vitalsLog[vitalsLog.length - 1] || {};

  const handleLogVitals = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: StoredVitalEntry = {
      date: new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      systolic: newEntry.systolic ? Number(newEntry.systolic) : undefined,
      diastolic: newEntry.diastolic ? Number(newEntry.diastolic) : undefined,
      sugar: newEntry.sugar ? Number(newEntry.sugar) : undefined,
      hr: newEntry.hr ? Number(newEntry.hr) : undefined,
      temp: newEntry.temp ? Number(newEntry.temp) : undefined,
    };
    const hasAny = entry.systolic || entry.diastolic || entry.sugar || entry.hr || entry.temp;
    if (!hasAny) { setShowLogModal(false); return; }

    const next = username ? addVitalsEntry(username, entry) : [...vitalsLog, entry];
    setVitalsLogState(next);
    setNewEntry({ systolic: '', diastolic: '', sugar: '', hr: '', temp: '' });
    setShowLogModal(false);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-teal flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <Activity size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-txt">Vital Signs Monitor</h1>
            <p className="text-sm text-txt-muted">Log and track your health trends</p>
          </div>
        </div>

        <button onClick={() => setShowLogModal(true)} className="flex items-center justify-center gap-2 bg-brand text-white px-5 py-2.5 rounded-xl font-bold shadow-md shadow-brand/20 hover:bg-brand-hover transition-colors">
          <Plus size={18} />
          Log Vitals
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <VitalMetricCard
          title="Blood Pressure"
          value={latest.systolic ? `${latest.systolic}/${latest.diastolic}` : '--/--'}
          unit="mmHg"
          icon={<Activity size={20} />}
          colorClass="bg-blue-500/10 text-blue-500"
          isActive={activeMetric === 'BP'}
          onClick={() => setActiveMetric('BP')}
        />
        <VitalMetricCard
          title="Blood Sugar"
          value={latest.sugar ?? '--'}
          unit="mg/dL"
          icon={<Droplet size={20} />}
          colorClass="bg-red-500/10 text-red-500"
          isActive={activeMetric === 'Sugar'}
          onClick={() => setActiveMetric('Sugar')}
        />
        <VitalMetricCard
          title="Heart Rate"
          value={latest.hr ?? '--'}
          unit="bpm"
          icon={<Heart size={20} />}
          colorClass="bg-pink-500/10 text-pink-500"
          isActive={activeMetric === 'HR'}
          onClick={() => setActiveMetric('HR')}
        />
        <VitalMetricCard
          title="Temperature"
          value={latest.temp ?? '98.6'}
          unit="°F"
          icon={<Thermometer size={20} />}
          colorClass="bg-orange-500/10 text-orange-500"
          isActive={false}
          onClick={() => {}} // Non-interactive for this demo
        />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-txt mb-6">
          {activeMetric === 'BP' ? 'Blood Pressure Trends' :
           activeMetric === 'Sugar' ? 'Blood Sugar Trends' : 'Heart Rate Trends'}
        </h2>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={vitalsLog} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-dark)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--color-txt-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-txt-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />

              {activeMetric === 'BP' && (
                <>
                  <Line type="monotone" dataKey="systolic" name="Systolic" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4 }} />
                </>
              )}
              {activeMetric === 'Sugar' && (
                <Line type="monotone" dataKey="sugar" name="Blood Sugar" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              )}
              {activeMetric === 'HR' && (
                <Line type="monotone" dataKey="hr" name="Heart Rate" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Log Vitals Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border-dark flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-border-dark bg-base">
              <h3 className="font-bold text-txt flex items-center gap-2"><Activity size={18} className="text-brand" /> Log New Vitals</h3>
              <button onClick={() => setShowLogModal(false)} className="p-1.5 rounded-lg text-txt-secondary hover:bg-danger/10 hover:text-danger transition-colors"><X size={18} /></button>
            </div>
            <form onSubmit={handleLogVitals} className="p-5 space-y-4 bg-base">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-muted ml-1">Systolic (mmHg)</label>
                  <input type="number" value={newEntry.systolic} onChange={e => setNewEntry({ ...newEntry, systolic: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-muted ml-1">Diastolic (mmHg)</label>
                  <input type="number" value={newEntry.diastolic} onChange={e => setNewEntry({ ...newEntry, diastolic: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-muted ml-1">Blood Sugar (mg/dL)</label>
                  <input type="number" value={newEntry.sugar} onChange={e => setNewEntry({ ...newEntry, sugar: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-muted ml-1">Heart Rate (bpm)</label>
                  <input type="number" value={newEntry.hr} onChange={e => setNewEntry({ ...newEntry, hr: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-bold text-txt-muted ml-1">Temperature (°F)</label>
                  <input type="number" step="0.1" value={newEntry.temp} onChange={e => setNewEntry({ ...newEntry, temp: e.target.value })} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowLogModal(false)} className="flex-1 py-2.5 rounded-xl font-bold bg-surface border border-border-dark text-txt hover:bg-base transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold bg-brand text-white hover:bg-brand-hover transition-colors shadow-md shadow-brand/20">Save Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vitals;
