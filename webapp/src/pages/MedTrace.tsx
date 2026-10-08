import { useState, useRef, useEffect } from 'react';
import {
  Search, AlertTriangle, Plus, X, ChevronDown, Microscope,
  ClipboardList, Pill, History, Loader2, ShieldAlert, FlaskConical,
  Activity, FileSearch, Sparkles, Users, Wand2, Paperclip, FileText,
  Clock3, Save
} from 'lucide-react';
import { API_BASE_URL } from '../config';
import { useAuth } from '../context/AuthContext';
import { getMedications, getVitalsLog } from '../utils/healthStore';

interface TimelineEntry { date: string; event: string; }
interface LabEntry { test: string; value: string; unit: string; range: string; flag: string; }
interface MedEntry { name: string; dosage: string; startDate: string; }
interface Attachment { name: string; mimeType: string; data: string; sizeKB: number; }

interface Differential {
  diagnosis: string;
  probability: number;
  reasoning: string;
  supporting_evidence?: string[];
  unexplained_by_this?: string[];
  missing_investigations?: string[];
}

interface MedTraceAnalysis {
  timeline_summary: string;
  red_flags?: string[];
  contradictions?: string[];
  differentials: Differential[];
  recommended_next_steps: string[];
  data_sufficiency_note?: string;
}

interface CaseHistoryInput {
  symptoms?: string;
  history?: string;
  timeline?: TimelineEntry[];
  labs?: LabEntry[];
  medications?: MedEntry[];
  pastDiagnoses?: string[];
}

interface CaseHistoryItem {
  id: string;
  patientId: string;
  patientName?: string | null;
  input: CaseHistoryInput;
  output: MedTraceAnalysis;
  source: string;
  createdAt: string;
}

const emptyTimeline = (): TimelineEntry => ({ date: '', event: '' });
const emptyLab = (): LabEntry => ({ test: '', value: '', unit: '', range: '', flag: '' });
const emptyMed = (): MedEntry => ({ name: '', dosage: '', startDate: '' });

const PROB_COLORS = [
  'from-brand to-teal',
  'from-info to-blue-400',
  'from-warning to-amber-400',
  'from-txt-muted to-gray-400',
];

const ALLOWED_ATTACHMENT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_MB = 8;

const SectionCard = ({ icon, title, subtitle, children, onAdd, addLabel }: {
  icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode; onAdd?: () => void; addLabel?: string;
}) => (
  <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand-glow text-brand-light flex items-center justify-center">{icon}</div>
        <div>
          <h3 className="text-sm font-bold text-txt">{title}</h3>
          {subtitle && <p className="text-xs text-txt-muted">{subtitle}</p>}
        </div>
      </div>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-1 text-xs font-semibold text-brand-light hover:text-brand bg-brand-glow px-3 py-1.5 rounded-full transition-colors">
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

const RowInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full px-3 py-2 bg-input border border-border rounded-lg text-xs text-txt placeholder:text-txt-muted outline-none focus:border-brand transition-all" />
);

const MedTrace = () => {
  const { allUsers } = useAuth();
  const patients = allUsers.filter(u => u.role === 'user');

  const [selectedPatient, setSelectedPatient] = useState('');
  const [caseHistory, setCaseHistory] = useState<CaseHistoryItem[]>([]);
  const [expandedCaseId, setExpandedCaseId] = useState<string | null>(null);

  const [symptoms, setSymptoms] = useState('');
  const [history, setHistory] = useState('');
  const [timeline, setTimeline] = useState<TimelineEntry[]>([emptyTimeline()]);
  const [labs, setLabs] = useState<LabEntry[]>([emptyLab()]);
  const [medications, setMedications] = useState<MedEntry[]>([emptyMed()]);
  const [pastDiagnoses, setPastDiagnoses] = useState<string[]>(['']);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<MedTraceAnalysis | null>(null);
  const [source, setSource] = useState('');
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [saveNote, setSaveNote] = useState('');

  const updateList = <T,>(list: T[], setList: (v: T[]) => void, idx: number, patch: Partial<T>) => {
    const next = [...list];
    next[idx] = { ...next[idx], ...patch };
    setList(next);
  };

  // Fetch saved case history whenever the selected patient changes
  useEffect(() => {
    (async () => {
      if (!selectedPatient) { setCaseHistory([]); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/api/medtrace/cases/${encodeURIComponent(selectedPatient)}`);
        if (res.ok) {
          const data = await res.json();
          setCaseHistory(data.cases || []);
        }
      } catch {
        // Case history is a nice-to-have; silently ignore if backend/DB is unavailable
      }
    })();
  }, [selectedPatient]);

  const handleAutofill = () => {
    if (!selectedPatient) return;
    const profile = patients.find(p => p.username === selectedPatient);
    if (!profile) return;

    const notes: string[] = [];
    if (profile.age) notes.push(`${profile.age} years old`);
    if (profile.gender) notes.push(profile.gender);
    if (profile.height) notes.push(`Height: ${profile.height} cm`);
    if (profile.weight) notes.push(`Weight: ${profile.weight} kg`);
    if (profile.village || profile.address) notes.push(`Location: ${profile.address || profile.village}`);
    if (notes.length) setHistory(prev => prev.trim() ? prev : notes.join(', '));

    const storedMeds = getMedications(selectedPatient);
    if (storedMeds && storedMeds.length) {
      setMedications(storedMeds.map(m => ({ name: `${m.name} (${m.dosage})`, dosage: m.frequency, startDate: m.condition })));
    }

    const vitalsLog = getVitalsLog(selectedPatient);
    if (vitalsLog && vitalsLog.length) {
      const latest = vitalsLog[vitalsLog.length - 1];
      const labRows: LabEntry[] = [];
      if (latest.systolic && latest.diastolic) {
        labRows.push({
          test: 'Blood Pressure', value: `${latest.systolic}/${latest.diastolic}`, unit: 'mmHg', range: '90-120/60-80',
          flag: latest.systolic >= 140 || latest.diastolic >= 90 ? 'High' : ''
        });
      }
      if (latest.sugar) labRows.push({ test: 'Blood Sugar', value: String(latest.sugar), unit: 'mg/dL', range: '70-100', flag: latest.sugar > 125 ? 'High' : latest.sugar < 70 ? 'Low' : '' });
      if (latest.hr) labRows.push({ test: 'Heart Rate', value: String(latest.hr), unit: 'bpm', range: '60-100', flag: latest.hr > 100 ? 'High' : latest.hr < 60 ? 'Low' : '' });
      if (latest.temp) labRows.push({ test: 'Temperature', value: String(latest.temp), unit: '°F', range: '97-99', flag: latest.temp > 100.4 ? 'High' : '' });
      if (labRows.length) setLabs(labRows);
    }

    setSaveNote(`Auto-filled from ${profile.fullName || profile.username}'s records.`);
    setTimeout(() => setSaveNote(''), 4000);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    if (remainingSlots <= 0) { setError(`You can attach up to ${MAX_ATTACHMENTS} documents.`); return; }

    Array.from(files).slice(0, remainingSlots).forEach(file => {
      if (!ALLOWED_ATTACHMENT_TYPES.includes(file.type)) {
        setError(`${file.name}: unsupported file type. Only PDF, PNG, JPG, or WEBP are accepted.`);
        return;
      }
      if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
        setError(`${file.name} exceeds the ${MAX_ATTACHMENT_MB}MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        setAttachments(prev => [...prev, { name: file.name, mimeType: file.type, data: base64, sizeKB: Math.round(file.size / 1024) }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAnalyze = async () => {
    setError('');
    const hasSomething = symptoms.trim() || history.trim() ||
      timeline.some(t => t.date || t.event) ||
      labs.some(l => l.test) ||
      medications.some(m => m.name) ||
      attachments.length > 0;

    if (!hasSomething) {
      setError('Please provide at least symptoms, a timeline entry, a lab result, history, or an attached document before analyzing.');
      return;
    }

    setIsLoading(true);
    setAnalysis(null);

    const requestBody = {
      symptoms,
      history,
      timeline: timeline.filter(t => t.date || t.event),
      labs: labs.filter(l => l.test),
      medications: medications.filter(m => m.name),
      pastDiagnoses: pastDiagnoses.filter(d => d.trim()),
      attachments: attachments.map(a => ({ mimeType: a.mimeType, data: a.data })),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/medtrace/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Analysis failed.');
      }

      const data = await res.json();
      setAnalysis(data.analysis);
      setSource(data.source);
      setExpandedIdx(0);

      // Persist this investigation to the selected patient's case history
      if (selectedPatient) {
        try {
          const patientProfile = patients.find(p => p.username === selectedPatient);
          await fetch(`${API_BASE_URL}/api/medtrace/cases`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              patientId: selectedPatient,
              patientName: patientProfile?.fullName || selectedPatient,
              input: { symptoms, history, timeline: requestBody.timeline, labs: requestBody.labs, medications: requestBody.medications, pastDiagnoses: requestBody.pastDiagnoses },
              output: data.analysis,
              source: data.source,
            }),
          });
          const histRes = await fetch(`${API_BASE_URL}/api/medtrace/cases/${encodeURIComponent(selectedPatient)}`);
          if (histRes.ok) setCaseHistory((await histRes.json()).cases || []);
          setSaveNote('Investigation saved to patient case history.');
          setTimeout(() => setSaveNote(''), 4000);
        } catch {
          // Non-fatal — the analysis still displays even if saving history failed
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Server unreachable. Please ensure the backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">

      {/* Hero */}
      <div className="bg-gradient-to-r from-slate-800 via-brand to-teal rounded-2xl p-7 relative overflow-hidden shadow-sm">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-white/10 rounded-full" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
            <Microscope size={28} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-1 drop-shadow-sm">MedTrace — Find the Missing Diagnosis</h2>
            <p className="text-white/90 text-sm max-w-xl font-medium drop-shadow-sm">
              Feed in symptoms, labs, medications, and history. MedTrace doesn't just ask "what disease is this?" — it looks for contradictions and surfaces what might be missing.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-warning-bg border border-warning/20 rounded-xl p-3.5 text-xs text-warning flex items-start gap-2">
        <ShieldAlert size={16} className="flex-shrink-0 mt-0.5" />
        <span><strong>Clinical reasoning support only.</strong> MedTrace produces AI-generated hypotheses based solely on the data you provide — it is not a diagnosis and does not replace professional clinical judgment. Always verify against direct patient evaluation.</span>
      </div>

      {/* Patient Selector + Autofill + Case History */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-[260px]">
            <div className="w-9 h-9 rounded-xl bg-brand-glow text-brand-light flex items-center justify-center flex-shrink-0"><Users size={18} /></div>
            <select
              value={selectedPatient}
              onChange={e => setSelectedPatient(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm font-medium text-txt outline-none focus:border-brand transition-all"
            >
              <option value="">— No patient linked (ad-hoc investigation) —</option>
              {patients.map(p => (
                <option key={p.username} value={p.username}>{p.fullName || p.username}{p.age ? ` · ${p.age}y` : ''}{p.gender ? ` · ${p.gender}` : ''}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAutofill}
            disabled={!selectedPatient}
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-xl bg-brand/10 text-brand hover:bg-brand hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Wand2 size={15} /> Auto-fill from Patient Records
          </button>
        </div>

        {selectedPatient && caseHistory.length > 0 && (
          <div className="pt-3 border-t border-border-subtle space-y-2">
            <p className="text-[0.65rem] font-bold uppercase tracking-wider text-txt-muted flex items-center gap-1.5"><Clock3 size={12} /> Past Investigations for This Patient</p>
            {caseHistory.map(c => {
              const topDx = c.output?.differentials?.[0];
              const isOpen = expandedCaseId === c.id;
              return (
                <div key={c.id} className="bg-elevated border border-border-subtle rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedCaseId(isOpen ? null : c.id)} className="w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-base/50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-txt truncate">{topDx ? `${topDx.diagnosis} (${topDx.probability}%)` : 'Investigation'}</p>
                      <p className="text-[0.65rem] text-txt-muted">{new Date(c.createdAt).toLocaleString()} · {c.source === 'gemini-ai' ? 'Gemini AI' : 'Local Engine'}</p>
                    </div>
                    <ChevronDown size={14} className={`text-txt-muted flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3 space-y-2 border-t border-border-subtle pt-2">
                      <p className="text-xs text-txt-secondary leading-relaxed">{c.output?.timeline_summary}</p>
                      <div className="space-y-1">
                        {(c.output?.differentials || []).slice(0, 4).map((d: Differential, i: number) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <span className="text-txt-secondary">{i + 1}. {d.diagnosis}</span>
                            <span className="font-bold text-brand-light">{d.probability}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Symptoms */}
        <SectionCard icon={<Activity size={18} />} title="Current Symptoms" subtitle="Describe what the patient is presenting with">
          <textarea
            value={symptoms}
            onChange={e => setSymptoms(e.target.value)}
            rows={4}
            placeholder="e.g. Persistent low-grade fever for 10 days, joint pain migrating between knees and wrists, new skin rash on trunk..."
            className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm text-txt placeholder:text-txt-muted outline-none focus:border-brand transition-all resize-none"
          />
        </SectionCard>

        {/* History */}
        <SectionCard icon={<History size={18} />} title="Medical History / Notes" subtitle="Relevant background, comorbidities, prior episodes">
          <textarea
            value={history}
            onChange={e => setHistory(e.target.value)}
            rows={4}
            placeholder="e.g. Type 2 diabetic for 8 years, previous TB treatment completed 2019, family history of autoimmune disease..."
            className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm text-txt placeholder:text-txt-muted outline-none focus:border-brand transition-all resize-none"
          />
        </SectionCard>

        {/* Timeline */}
        <SectionCard icon={<Activity size={18} />} title="Case Timeline" subtitle="Key dated events in chronological order"
          onAdd={() => setTimeline([...timeline, emptyTimeline()])} addLabel="Add Entry">
          <div className="space-y-2">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-2 items-center">
                <RowInput placeholder="Date (e.g. 2026-09-01)" value={t.date} onChange={e => updateList(timeline, setTimeline, i, { date: e.target.value })} className="w-32" />
                <RowInput placeholder="Event (e.g. Started amoxicillin, fever onset, ER visit...)" value={t.event} onChange={e => updateList(timeline, setTimeline, i, { event: e.target.value })} />
                {timeline.length > 1 && (
                  <button onClick={() => setTimeline(timeline.filter((_, idx) => idx !== i))} className="text-txt-muted hover:text-danger transition-colors flex-shrink-0">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Labs */}
        <SectionCard icon={<FlaskConical size={18} />} title="Lab / Test Results" subtitle="Any abnormal or relevant values"
          onAdd={() => setLabs([...labs, emptyLab()])} addLabel="Add Result">
          <div className="space-y-2">
            {labs.map((l, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-center">
                <RowInput placeholder="Test" value={l.test} onChange={e => updateList(labs, setLabs, i, { test: e.target.value })} className="col-span-2" />
                <RowInput placeholder="Value" value={l.value} onChange={e => updateList(labs, setLabs, i, { value: e.target.value })} />
                <RowInput placeholder="Range" value={l.range} onChange={e => updateList(labs, setLabs, i, { range: e.target.value })} />
                <div className="flex items-center gap-1">
                  <select value={l.flag} onChange={e => updateList(labs, setLabs, i, { flag: e.target.value })}
                    className="w-full px-2 py-2 bg-input border border-border rounded-lg text-xs text-txt outline-none focus:border-brand">
                    <option value="">Normal</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                    <option value="Critical">Critical</option>
                  </select>
                  {labs.length > 1 && (
                    <button onClick={() => setLabs(labs.filter((_, idx) => idx !== i))} className="text-txt-muted hover:text-danger transition-colors flex-shrink-0">
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Medications */}
        <SectionCard icon={<Pill size={18} />} title="Current / Recent Medications" subtitle="Include dosage and start date where known"
          onAdd={() => setMedications([...medications, emptyMed()])} addLabel="Add Medication">
          <div className="space-y-2">
            {medications.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <RowInput placeholder="Name" value={m.name} onChange={e => updateList(medications, setMedications, i, { name: e.target.value })} />
                <RowInput placeholder="Dosage" value={m.dosage} onChange={e => updateList(medications, setMedications, i, { dosage: e.target.value })} className="w-28" />
                <RowInput placeholder="Since" value={m.startDate} onChange={e => updateList(medications, setMedications, i, { startDate: e.target.value })} className="w-28" />
                {medications.length > 1 && (
                  <button onClick={() => setMedications(medications.filter((_, idx) => idx !== i))} className="text-txt-muted hover:text-danger transition-colors flex-shrink-0">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Past Diagnoses */}
        <SectionCard icon={<ClipboardList size={18} />} title="Previous / Working Diagnoses" subtitle="What has this case already been labeled as?"
          onAdd={() => setPastDiagnoses([...pastDiagnoses, ''])} addLabel="Add Diagnosis">
          <div className="space-y-2">
            {pastDiagnoses.map((d, i) => (
              <div key={i} className="flex gap-2 items-center">
                <RowInput placeholder="e.g. Viral fever (unresolved)" value={d} onChange={e => {
                  const next = [...pastDiagnoses]; next[i] = e.target.value; setPastDiagnoses(next);
                }} />
                {pastDiagnoses.length > 1 && (
                  <button onClick={() => setPastDiagnoses(pastDiagnoses.filter((_, idx) => idx !== i))} className="text-txt-muted hover:text-danger transition-colors flex-shrink-0">
                    <X size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Attachments */}
        <SectionCard icon={<Paperclip size={18} />} title="Attach Lab Reports / Imaging" subtitle="PDF, PNG, JPG, WEBP — the AI reads these directly">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-brand/50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
              className="hidden"
            />
            <FileText size={24} className="mx-auto text-txt-muted mb-1.5" />
            <p className="text-xs font-semibold text-txt">Click to attach up to {MAX_ATTACHMENTS} documents</p>
            <p className="text-[0.65rem] text-txt-muted mt-0.5">Max {MAX_ATTACHMENT_MB}MB each</p>
          </div>
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map((a, i) => (
                <div key={i} className="flex items-center justify-between gap-2 bg-elevated border border-border-subtle rounded-lg px-3 py-1.5">
                  <span className="text-xs text-txt-secondary truncate flex items-center gap-1.5"><FileText size={12} className="flex-shrink-0" /> {a.name} <span className="text-txt-muted">({a.sizeKB} KB)</span></span>
                  <button onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))} className="text-txt-muted hover:text-danger transition-colors flex-shrink-0">
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {saveNote && <div className="p-3 bg-success-bg border border-success/20 text-success text-xs rounded-xl font-semibold flex items-center gap-2"><Save size={14} /> {saveNote}</div>}
      {error && <div className="p-3.5 bg-danger-bg border border-danger/20 text-danger text-sm rounded-xl font-semibold">{error}</div>}

      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2.5 py-4 rounded-xl bg-gradient-to-r from-slate-800 via-brand to-teal text-white font-bold text-sm hover:-translate-y-0.5 hover:shadow-[0_8px_24px_var(--color-brand-glow)] transition-all duration-300 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isLoading ? <><Loader2 size={18} className="animate-spin" /> Investigating case...</> : <><FileSearch size={18} /> Run MedTrace Investigation</>}
      </button>

      {/* Results */}
      {analysis && (
        <div className="space-y-5 animate-fade-in">

          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-txt">Investigation Results</h3>
            <span className="text-xs font-semibold text-txt-muted bg-elevated px-3 py-1.5 rounded-full">
              {source === 'gemini-ai' ? '✨ Powered by Gemini AI' : '🔧 Local Engine'}
            </span>
          </div>

          {/* Timeline Summary */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h4 className="text-sm font-bold text-txt mb-2 flex items-center gap-2"><Activity size={16} className="text-brand-light" /> Reconstructed Timeline</h4>
            <p className="text-sm text-txt-secondary leading-relaxed">{analysis.timeline_summary}</p>
          </div>

          {/* Red Flags */}
          {analysis.red_flags && analysis.red_flags.length > 0 && (
            <div className="bg-danger-bg border border-danger/30 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-danger mb-2 flex items-center gap-2"><AlertTriangle size={16} /> Red Flags — Urgent Attention Needed</h4>
              <ul className="space-y-1.5">
                {analysis.red_flags.map((f, i) => (
                  <li key={i} className="text-sm text-danger/90 flex gap-2"><span>⚠️</span>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Contradictions */}
          {analysis.contradictions && analysis.contradictions.length > 0 && (
            <div className="bg-warning-bg border border-warning/20 rounded-2xl p-5">
              <h4 className="text-sm font-bold text-warning mb-2 flex items-center gap-2"><Search size={16} /> Contradictions & Unexplained Findings</h4>
              <ul className="space-y-1.5">
                {analysis.contradictions.map((c, i) => (
                  <li key={i} className="text-sm text-warning/90 flex gap-2"><span>•</span>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Differentials */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-txt flex items-center gap-2"><Sparkles size={16} className="text-brand-light" /> Differential Diagnoses — Why Each Is Being Considered</h4>
            {analysis.differentials.map((d, i) => {
              const expanded = expandedIdx === i;
              const colorClass = PROB_COLORS[Math.min(i, PROB_COLORS.length - 1)];
              return (
                <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedIdx(expanded ? null : i)}
                    className="w-full flex items-center justify-between gap-4 p-4 hover:bg-elevated/50 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-sm font-bold text-txt">{i + 1}. {d.diagnosis}</span>
                        <span className="text-xs font-bold text-brand-light bg-brand-glow px-2 py-0.5 rounded-full flex-shrink-0">{d.probability}%</span>
                      </div>
                      <div className="w-full h-2 bg-elevated rounded-full overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${colorClass} rounded-full transition-all`} style={{ width: `${Math.min(100, Math.max(2, d.probability))}%` }} />
                      </div>
                    </div>
                    <ChevronDown size={18} className={`text-txt-muted flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                  </button>

                  {expanded && (
                    <div className="px-4 pb-4 space-y-3 border-t border-border-subtle pt-3">
                      <div>
                        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-txt-muted mb-1">Why is this being considered?</p>
                        <p className="text-sm text-txt-secondary leading-relaxed">{d.reasoning}</p>
                      </div>
                      {d.supporting_evidence && d.supporting_evidence.length > 0 && (
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-success mb-1">Supporting Evidence</p>
                          <ul className="space-y-1">
                            {d.supporting_evidence.map((e, ei) => <li key={ei} className="text-xs text-txt-secondary flex gap-1.5"><span className="text-success">✓</span>{e}</li>)}
                          </ul>
                        </div>
                      )}
                      {d.unexplained_by_this && d.unexplained_by_this.length > 0 && (
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-warning mb-1">Doesn't Fully Explain</p>
                          <ul className="space-y-1">
                            {d.unexplained_by_this.map((e, ei) => <li key={ei} className="text-xs text-txt-secondary flex gap-1.5"><span className="text-warning">✗</span>{e}</li>)}
                          </ul>
                        </div>
                      )}
                      {d.missing_investigations && d.missing_investigations.length > 0 && (
                        <div>
                          <p className="text-[0.65rem] font-bold uppercase tracking-wider text-info mb-1">Investigations to Confirm/Rule Out</p>
                          <div className="flex flex-wrap gap-1.5">
                            {d.missing_investigations.map((inv, ii) => (
                              <span key={ii} className="text-xs font-semibold bg-info-bg text-info px-2.5 py-1 rounded-full">{inv}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Next steps */}
          {analysis.recommended_next_steps && analysis.recommended_next_steps.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <h4 className="text-sm font-bold text-txt mb-2 flex items-center gap-2"><ClipboardList size={16} className="text-brand-light" /> Recommended Next Steps</h4>
              <ul className="space-y-1.5">
                {analysis.recommended_next_steps.map((s, i) => (
                  <li key={i} className="text-sm text-txt-secondary flex gap-2"><span className="text-brand-light font-bold">{i + 1}.</span>{s}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.data_sufficiency_note && (
            <div className="text-xs text-txt-muted bg-elevated border border-border-subtle rounded-xl p-3.5">
              <strong className="text-txt-secondary">Data sufficiency note:</strong> {analysis.data_sufficiency_note}
            </div>
          )}

          <div className="text-xs text-txt-muted bg-elevated border border-border-subtle rounded-xl p-3.5">
            ⚠️ <em>Disclaimer: This is an AI-generated clinical reasoning aid based only on the data entered above. It is not a diagnosis and must be verified by a qualified healthcare professional.</em>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedTrace;
