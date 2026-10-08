import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Calendar, FileText, Activity, MapPin, FileDigit, Search,
  Stethoscope,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMedications, setMedications as persistMedications, getVitalsLog, type StoredMedication, type StoredVitalEntry } from '../utils/healthStore';
import { buildTodayDoses } from '../utils/medicationSchedule';

import StatCard from '../components/StatCard';
import ProgressRing from '../components/ProgressRing';
import Sparkline from '../components/Sparkline';
import VitalsChart from '../components/VitalsChart';
import MedicationTimeline from '../components/MedicationTimeline';
import HealthScoreRing from '../components/HealthScoreRing';
import AIBriefingCard from '../components/AIBriefingCard';
import GuardianCard from '../components/GuardianCard';
import EmptyState from '../components/EmptyState';

// Dev-only flag — mirrors the old "(108 Dialing Disabled for Testing)" chip,
// now hidden in production builds unless explicitly enabled.
const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true';

const SPECIALTY_CHIPS = ['Cardiology', 'Diabetes', 'General Medicine', 'Pediatrics', 'Orthopedics'];

// Sample lab flags mirroring the Health Vault's own mock reports, surfaced
// here as a dashboard preview — not a separate/fabricated data source.
const RECENT_LAB_FLAGS = [
  { title: 'Complete Blood Count', date: '2026-07-28', flag: 'Platelets slightly low (140, normal 150–450)', tone: 'warning' as const },
  { title: 'Lipid Panel', date: '2026-06-20', flag: 'LDL Cholesterol high (110, normal < 100)', tone: 'warning' as const },
];

// PLACEHOLDER scoring model — combines medication adherence and how many
// latest vitals fall inside a typical normal range into one 0-100 number.
// This is not a validated clinical score; replace with a real model when
// one exists.
function computeHealthScore(medications: StoredMedication[], latest?: StoredVitalEntry): number {
  let adherenceScore = 100;
  if (medications.length > 0) {
    const ratios = medications.map(m => (m.total > 0 ? m.count / m.total : 1));
    adherenceScore = Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 100);
  }

  let vitalsScore = 100;
  if (latest) {
    let inRange = 0, checked = 0;
    if (latest.systolic != null) { checked++; if (latest.systolic >= 90 && latest.systolic <= 130) inRange++; }
    if (latest.diastolic != null) { checked++; if (latest.diastolic >= 60 && latest.diastolic <= 85) inRange++; }
    if (latest.sugar != null) { checked++; if (latest.sugar >= 70 && latest.sugar <= 110) inRange++; }
    if (latest.hr != null) { checked++; if (latest.hr >= 60 && latest.hr <= 100) inRange++; }
    if (checked > 0) vitalsScore = Math.round((inRange / checked) * 100);
  }

  return Math.round(adherenceScore * 0.5 + vitalsScore * 0.5);
}

interface UserDashboardProps {
  onOpenSettings: () => void;
}

const UserDashboard = ({ onOpenSettings }: UserDashboardProps) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const username = currentUser?.username || '';

  const [loading, setLoading] = useState(true);
  // Lazily seeded from the store once — username is stable for the
  // component's lifetime since App fully remounts on login/logout.
  const [medications, setMedicationsState] = useState<StoredMedication[]>(() => getMedications(username) || []);
  const [vitalsLog] = useState<StoredVitalEntry[]>(() => getVitalsLog(username) || []);
  const [specialtySearch, setSpecialtySearch] = useState('');

  // Brief skeleton on first paint (purely cosmetic — all data above is
  // already loaded synchronously from localStorage).
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const markDoseTaken = (medId: string) => {
    const next = medications.map(m => (m.id === medId ? { ...m, count: Math.max(0, m.count - 1) } : m));
    setMedicationsState(next);
    if (username) persistMedications(username, next);
  };

  const doses = useMemo(() => buildTodayDoses(medications), [medications]);
  const takenCount = doses.filter(d => d.state === 'taken').length;
  const totalCount = doses.length;
  const nextDose = doses.find(d => d.state === 'upcoming');

  const latestVital = vitalsLog[vitalsLog.length - 1];
  const prevVital = vitalsLog[vitalsLog.length - 2];
  const sparklineData = vitalsLog.slice(-7).map(v => v.systolic || 0).filter(v => v > 0);
  const bpDelta = latestVital?.systolic != null && prevVital?.systolic != null ? latestVital.systolic - prevVital.systolic : undefined;
  const bpNormal = latestVital?.systolic != null ? latestVital.systolic < 130 && (latestVital.diastolic ?? 0) < 85 : true;

  const healthScore = computeHealthScore(medications, latestVital);
  const weekAgoVital = vitalsLog.length > 7 ? vitalsLog[vitalsLog.length - 8] : undefined;
  const prevScore = weekAgoVital ? computeHealthScore(medications, weekAgoVital) : undefined;

  const guardianCount = currentUser?.guardians?.length || 0;

  const briefingMessage = useMemo(() => {
    const parts: string[] = [];
    if (latestVital?.systolic != null) {
      parts.push(`Your blood pressure is ${bpNormal ? 'steady' : 'a bit elevated'} (${latestVital.systolic}/${latestVital.diastolic ?? '--'}).`);
    } else {
      parts.push("You haven't logged any vitals yet — log a reading to get sharper insights here.");
    }
    if (totalCount > 0) {
      const remaining = totalCount - takenCount;
      parts.push(remaining > 0
        ? `You have ${remaining} dose${remaining > 1 ? 's' : ''} left today${nextDose ? `. Next: ${nextDose.medName} at ${nextDose.time}` : ''}.`
        : "You're all caught up on today's medications.");
    }
    return parts.join(' ');
  }, [latestVital, bpNormal, totalCount, takenCount, nextDose]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto space-y-5 sm:space-y-6">

      {/* Guardian status line (replaces the old full-width red banner) */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />
        <span className="text-xs text-txt-secondary font-medium">
          Guardians: {guardianCount} linked, location sharing ready
        </span>
        {TEST_MODE && (
          <span className="text-[0.6rem] font-bold uppercase px-2 py-0.5 rounded-full bg-warning-bg text-warning">
            Dev mode: 108 dialing disabled for testing
          </span>
        )}
      </div>

      {/* Hero row: AI briefing + Health Score */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <AIBriefingCard
            message={briefingMessage}
            nextDoseLabel={nextDose?.medName}
            onMarkTaken={nextDose ? () => markDoseTaken(nextDose.medId) : undefined}
          />
        </div>
        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5 flex items-center justify-center">
          <HealthScoreRing score={healthScore} deltaVsLastWeek={prevScore !== undefined ? healthScore - prevScore : undefined} />
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard loading={loading} to="/tracker" icon={<Bell size={18} className="text-brand" />} iconBg="bg-brand/10" title="Medications">
          <div className="flex items-center gap-3 mb-2">
            <ProgressRing value={totalCount ? (takenCount / totalCount) * 100 : 0} size={52} strokeWidth={5} label={`${takenCount}/${totalCount}`} />
            <div className="min-w-0 flex-1">
              {nextDose ? (
                <>
                  <p className="text-xs font-bold text-txt truncate">{nextDose.medName}</p>
                  <p className="text-[0.65rem] text-txt-muted">Next at {nextDose.time}</p>
                </>
              ) : (
                <p className="text-xs text-txt-muted">{totalCount ? 'All doses done' : 'No medications yet'}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex gap-1">
              {doses.slice(0, 6).map((d, i) => (
                <span key={i} className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${d.state === 'taken' ? 'bg-success' : d.state === 'missed' ? 'bg-warning' : 'border-2 border-brand bg-transparent'}`} />
              ))}
            </div>
            {nextDose && (
              <button
                onClick={(e) => { e.stopPropagation(); markDoseTaken(nextDose.medId); }}
                className="text-[0.6rem] font-bold text-brand bg-brand-glow px-2 py-1 rounded-lg hover:bg-brand hover:text-white transition-colors"
              >
                Mark taken
              </button>
            )}
          </div>
        </StatCard>

        <StatCard loading={loading} to="/appointments" icon={<Calendar size={18} className="text-teal" />} iconBg="bg-teal/10" title="Appointments">
          <EmptyState icon={<Calendar size={18} />} title="No upcoming visits" actionLabel="Book a visit" onAction={() => navigate('/appointments')} />
        </StatCard>

        <StatCard loading={loading} to="/vault" icon={<FileText size={18} className="text-blue-500" />} iconBg="bg-blue-500/10" title="Health Vault">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-txt truncate">Lipid Panel Results</p>
            <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full bg-info-bg text-info flex-shrink-0">3 new</span>
          </div>
          <div className="flex -space-x-2 mt-auto">
            {[FileDigit, FileText, FileDigit].map((Icon, i) => (
              <div key={i} className="w-7 h-7 rounded-lg bg-elevated border-2 border-card flex items-center justify-center text-txt-muted">
                <Icon size={13} />
              </div>
            ))}
          </div>
        </StatCard>

        <StatCard loading={loading} to="/vitals" icon={<Activity size={18} className="text-orange-500" />} iconBg="bg-orange-500/10" title="Vitals">
          <div className="flex items-center justify-between mb-1">
            <p className="text-lg font-extrabold text-txt">{latestVital?.systolic ? `${latestVital.systolic}/${latestVital.diastolic}` : '--/--'}</p>
            <span className={`text-[0.6rem] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${bpNormal ? 'bg-success-bg text-success' : 'bg-warning-bg text-warning'}`}>
              {bpNormal ? 'Normal' : 'Elevated'}
            </span>
          </div>
          {sparklineData.length > 1 && <Sparkline data={sparklineData} color="#F97316" />}
          {bpDelta !== undefined && (
            <p className={`text-[0.65rem] font-semibold mt-1 ${bpDelta <= 0 ? 'text-success' : 'text-warning'}`}>
              {bpDelta <= 0 ? '▼' : '▲'} {Math.abs(bpDelta)} vs last reading
            </p>
          )}
        </StatCard>
      </div>

      {/* Main row: Vitals chart + Medication timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <VitalsChart entries={vitalsLog} onLogReading={() => navigate('/vitals')} />
        </div>
        <div className="lg:col-span-4">
          <MedicationTimeline medications={medications} onMarkTaken={markDoseTaken} />
        </div>
      </div>

      {/* Secondary row: Find a specialist (compact) + Recent labs + Guardian circle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-5 flex flex-col">
          <h3 className="text-sm font-bold text-txt mb-3 flex items-center gap-2"><Stethoscope size={16} className="text-brand" /> Find a Specialist</h3>
          <div className="flex items-center gap-2 bg-base border border-border rounded-xl px-3 py-2 mb-3">
            <Search size={14} className="text-txt-muted flex-shrink-0" />
            <input
              value={specialtySearch}
              onChange={e => setSpecialtySearch(e.target.value)}
              placeholder="Search specialty or doctor..."
              className="flex-1 bg-transparent outline-none text-sm text-txt placeholder:text-txt-muted"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {SPECIALTY_CHIPS.map(s => (
              <button
                key={s}
                onClick={() => setSpecialtySearch(s)}
                className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold transition-colors ${specialtySearch === s ? 'bg-brand text-white' : 'bg-base border border-border text-txt-secondary hover:text-txt'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/hospitals')} className="mt-auto w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand to-teal text-white font-bold text-sm py-2.5 rounded-xl hover:shadow-lg hover:shadow-brand/20 transition-all">
            <MapPin size={15} /> Find Hospitals
          </button>
        </div>

        <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-bold text-txt mb-3 flex items-center gap-2"><FileDigit size={16} className="text-brand" /> Recent Lab Reports</h3>
          <div className="space-y-3">
            {RECENT_LAB_FLAGS.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-txt">{r.title} <span className="text-txt-muted font-normal">· {r.date}</span></p>
                  <p className="text-xs text-warning">{r.flag}</p>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/vault')} className="mt-3 text-xs font-bold text-brand hover:underline">View all in Health Vault →</button>
        </div>

        <div className="lg:col-span-3">
          <GuardianCard guardians={currentUser?.guardians} onAddGuardian={onOpenSettings} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
