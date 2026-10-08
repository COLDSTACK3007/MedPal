import { useState } from 'react';
import { Clock, Pill, CalendarClock, Plus, AlertCircle, CheckCircle2, Coffee } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getMedications, setMedications as persistMedications, type StoredMedication } from '../utils/healthStore';

type Medication = StoredMedication;

interface Checkup {
  id: string;
  hospital: string;
  date: string;
  time: string;
  department: string;
}

const DEFAULT_MEDICATIONS: Medication[] = [
  {
    id: '1', name: 'Metformin', dosage: '500mg',
    frequency: '2x/day', times: ['08:00', '20:00'],
    condition: 'After Food', count: 12, total: 30
  },
  {
    id: '2', name: 'Aspirin', dosage: '75mg',
    frequency: '1x/day', times: ['20:00'],
    condition: 'Anytime', count: 4, total: 30 // Low count
  },
  {
    id: '3', name: 'Amoxicillin', dosage: '250mg',
    frequency: '3x/day', times: ['08:00', '14:00', '20:00'],
    condition: 'Before Food', count: 21, total: 30
  },
];

const Tracker = () => {
  const { currentUser } = useAuth();
  const username = currentUser?.username || '';

  const [activeTab, setActiveTab] = useState<'meds' | 'checkups'>('meds');

  // Lazily load this patient's saved medications (or seed with defaults) once
  // on first render — username is stable for the component's lifetime since
  // App fully remounts on login/logout.
  const [medications, setMedicationsState] = useState<Medication[]>(() => {
    if (!username) return DEFAULT_MEDICATIONS;
    const stored = getMedications(username);
    if (stored && stored.length > 0) return stored;
    persistMedications(username, DEFAULT_MEDICATIONS);
    return DEFAULT_MEDICATIONS;
  });

  // Persist any change to medications for this patient so it can be read
  // elsewhere (e.g. MedTrace auto-fill)
  const setMedications = (next: Medication[]) => {
    setMedicationsState(next);
    if (username) persistMedications(username, next);
  };

  const [checkups] = useState<Checkup[]>([
    { id: '1', hospital: 'City Care Hospital', date: '2026-08-15', time: '10:00', department: 'Cardiology' }
  ]);

  const [showAddMed, setShowAddMed] = useState(false);
  const [showAddCheckup, setShowAddCheckup] = useState(false);

  // New Medication Form State
  const [newMed, setNewMed] = useState({ 
    name: '', dosage: '', frequency: '1x/day', 
    time1: '', time2: '', time3: '', condition: 'Anytime', total: '' 
  });

  const handleAddMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMed.name && newMed.time1) {
      const times = [newMed.time1];
      if (newMed.frequency === '2x/day' && newMed.time2) times.push(newMed.time2);
      if (newMed.frequency === '3x/day' && newMed.time2 && newMed.time3) {
        times.push(newMed.time2, newMed.time3);
      }

      setMedications([...medications, { 
        id: Date.now().toString(), 
        name: newMed.name, 
        dosage: newMed.dosage,
        frequency: newMed.frequency,
        times,
        condition: newMed.condition,
        count: parseInt(newMed.total) || 30,
        total: parseInt(newMed.total) || 30 
      }]);
      setNewMed({ name: '', dosage: '', frequency: '1x/day', time1: '', time2: '', time3: '', condition: 'Anytime', total: '' });
      setShowAddMed(false);
    }
  };

  const takePill = (id: string) => {
    // In a real app we'd track exactly which pill was taken today.
    // For demo, just decrement count.
    setMedications(medications.map(med => 
      med.id === id ? { ...med, count: Math.max(0, med.count - 1) } : med
    ));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand to-teal flex items-center justify-center text-white shadow-lg shadow-brand/20">
          <Clock size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-txt">Smart Medical Tracker</h1>
          <p className="text-sm text-txt-muted">Manage your daily medications and upcoming check-ups</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface border border-border rounded-xl p-1 w-full max-w-md shadow-sm">
        <button 
          onClick={() => setActiveTab('meds')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'meds' ? 'bg-brand text-white shadow' : 'text-txt-secondary hover:text-txt'}`}
        >
          <Pill size={16} /> Daily Medications
        </button>
        <button 
          onClick={() => setActiveTab('checkups')}
          className={`flex-1 py-2 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'checkups' ? 'bg-brand text-white shadow' : 'text-txt-secondary hover:text-txt'}`}
        >
          <CalendarClock size={16} /> Hospital Check-ups
        </button>
      </div>

      <div className="w-full">
        {/* Medication Tracker */}
        {activeTab === 'meds' && (
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-border-dark pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-txt">
                <Pill className="text-brand" size={20} />
                Your Prescription Schedule
              </h2>
              <button onClick={() => setShowAddMed(!showAddMed)} className="px-4 py-2 rounded-xl bg-brand/10 text-brand font-bold flex items-center gap-2 hover:bg-brand hover:text-white transition-colors">
                <Plus size={16} /> Add Pill
              </button>
            </div>

            {showAddMed && (
              <form onSubmit={handleAddMed} className="mb-6 bg-base p-5 rounded-xl border border-border-dark space-y-4 shadow-inner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-muted ml-1">Pill Name</label>
                    <input type="text" placeholder="e.g. Paracetamol" value={newMed.name} onChange={e => setNewMed({...newMed, name: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-muted ml-1">Dosage</label>
                    <input type="text" placeholder="e.g. 500mg" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" required />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-muted ml-1">Frequency</label>
                    <select value={newMed.frequency} onChange={e => setNewMed({...newMed, frequency: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand cursor-pointer">
                      <option value="1x/day">1 time a day</option>
                      <option value="2x/day">2 times a day</option>
                      <option value="3x/day">3 times a day</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-txt-muted ml-1">Condition (Food)</label>
                    <select value={newMed.condition} onChange={e => setNewMed({...newMed, condition: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand cursor-pointer">
                      <option value="Anytime">Anytime</option>
                      <option value="Before Food">Before Food</option>
                      <option value="After Food">After Food</option>
                      <option value="With Food">With Food</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-muted ml-1">Alarm Times</label>
                  <div className="flex gap-2">
                    <input type="time" value={newMed.time1} onChange={e => setNewMed({...newMed, time1: e.target.value})} className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" required />
                    {newMed.frequency !== '1x/day' && (
                      <input type="time" value={newMed.time2} onChange={e => setNewMed({...newMed, time2: e.target.value})} className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" required />
                    )}
                    {newMed.frequency === '3x/day' && (
                      <input type="time" value={newMed.time3} onChange={e => setNewMed({...newMed, time3: e.target.value})} className="flex-1 bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" required />
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-txt-muted ml-1">Total Pills in Bottle (for refill alerts)</label>
                  <input type="number" placeholder="e.g. 30" value={newMed.total} onChange={e => setNewMed({...newMed, total: e.target.value})} className="w-full bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-txt outline-none focus:border-brand" />
                </div>
                
                <button type="submit" className="w-full bg-brand text-white font-bold py-3 rounded-xl text-sm hover:bg-brand-hover transition-colors shadow-md shadow-brand/20">Save Medication Schedule</button>
              </form>
            )}

            <div className="space-y-4">
              {medications.map(med => {
                const needsRefill = med.count <= 5;
                return (
                  <div key={med.id} className={`flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border transition-all shadow-sm ${needsRefill ? 'bg-danger/5 border-danger/20' : 'bg-base border-border'}`}>
                    
                    {/* Left: Info */}
                    <div className="flex items-start gap-4 mb-4 md:mb-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${needsRefill ? 'bg-danger/10 text-danger' : 'bg-brand/10 text-brand'}`}>
                        {needsRefill ? <AlertCircle size={24} /> : <Pill size={24} />}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-txt flex items-center gap-2">
                          {med.name} 
                          <span className="text-sm font-normal text-txt-secondary">{med.dosage}</span>
                          <span className="bg-surface border border-border-dark px-2 py-0.5 rounded text-[0.65rem] uppercase tracking-wider font-bold text-txt-muted">{med.frequency}</span>
                        </h3>
                        
                        <div className="flex items-center gap-3 mt-1 text-sm font-medium">
                          <span className={`flex items-center gap-1 ${med.condition.includes('Food') ? 'text-orange-500' : 'text-teal'}`}>
                            <Coffee size={14} /> {med.condition}
                          </span>
                          <span className="text-border-dark">|</span>
                          <span className={`${needsRefill ? 'text-danger' : 'text-txt-secondary'}`}>
                            {needsRefill ? `Refill Alert: Only ${med.count} left!` : `${med.count} pills remaining`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Times */}
                    <div className="flex flex-wrap items-center gap-3 md:justify-end border-t md:border-none border-border-dark pt-4 md:pt-0">
                      {med.times.map((t, index) => (
                        <div key={index} className="flex flex-col items-center bg-surface border border-border-dark rounded-xl p-2 min-w-[80px]">
                          <p className="text-sm font-bold text-txt mb-1">{t}</p>
                          <button 
                            onClick={() => takePill(med.id)} 
                            className="w-full py-1.5 rounded-lg bg-teal/10 text-teal hover:bg-teal hover:text-white transition-colors text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <CheckCircle2 size={14} /> Take
                          </button>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hospital Checkups */}
        {activeTab === 'checkups' && (
          <div className="bg-surface border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-border-dark pb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-txt">
                <CalendarClock className="text-brand" size={20} />
                Upcoming Hospital Visits
              </h2>
              <button onClick={() => setShowAddCheckup(!showAddCheckup)} className="px-4 py-2 rounded-xl bg-brand/10 text-brand font-bold flex items-center gap-2 hover:bg-brand hover:text-white transition-colors">
                <Plus size={16} /> Schedule
              </button>
            </div>
            
            {showAddCheckup && (
              <div className="mb-6 bg-base p-6 rounded-xl border border-border-dark text-center shadow-inner">
                <p className="text-txt-secondary font-medium mb-4">You can browse and book appointments directly from our integrated hospital network.</p>
                <button className="bg-brand text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-hover shadow-md shadow-brand/20 transition-all hover:-translate-y-0.5">Go to Appointments Section</button>
              </div>
            )}

            <div className="space-y-3">
              {checkups.map(checkup => (
                <div key={checkup.id} className="p-5 rounded-2xl border border-border bg-base flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                      <CalendarClock size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-txt">{checkup.hospital}</h3>
                      <p className="text-sm text-txt-secondary font-medium">{checkup.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 bg-surface border border-border-dark px-4 py-3 rounded-xl">
                    <div className="text-center">
                      <p className="text-[0.65rem] uppercase tracking-wider font-bold text-txt-muted mb-0.5">Date</p>
                      <p className="text-sm font-bold text-txt">{checkup.date}</p>
                    </div>
                    <div className="w-px h-8 bg-border-dark" />
                    <div className="text-center">
                      <p className="text-[0.65rem] uppercase tracking-wider font-bold text-txt-muted mb-0.5">Time</p>
                      <p className="text-sm font-bold text-txt">{checkup.time}</p>
                    </div>
                  </div>
                </div>
              ))}
              {checkups.length === 0 && (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                  <CalendarClock size={48} className="text-border-dark mb-4" />
                  <p className="text-lg font-bold text-txt">No upcoming check-ups</p>
                  <p className="text-sm text-txt-muted mt-1">Your schedule is completely clear.</p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Tracker;
