import { CheckCircle2, Circle, AlertCircle, Pill } from 'lucide-react';
import type { StoredMedication } from '../utils/healthStore';
import { buildTodayDoses, type TodayDose } from '../utils/medicationSchedule';
import EmptyState from './EmptyState';

interface MedicationTimelineProps {
  medications: StoredMedication[];
  onMarkTaken: (medId: string) => void;
}

const STATE_STYLE: Record<TodayDose['state'], { icon: typeof CheckCircle2; color: string; bg: string }> = {
  taken: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success-bg' },
  upcoming: { icon: Circle, color: 'text-brand', bg: 'bg-brand-glow' },
  missed: { icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-bg' },
};

const MedicationTimeline = ({ medications, onMarkTaken }: MedicationTimelineProps) => {
  const doses = buildTodayDoses(medications);

  if (doses.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 h-full flex items-center justify-center">
        <EmptyState icon={<Pill size={20} />} title="No medications scheduled" description="Add a medication in the Tracker to see today's timeline here." />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
      <h3 className="text-base font-bold text-txt mb-4">Today's Medication Timeline</h3>
      <div className="flex-1 space-y-3 overflow-y-auto scrollbar-thin max-h-[320px]">
        {doses.map((dose, i) => {
          const style = STATE_STYLE[dose.state];
          const Icon = style.icon;
          return (
            <div key={`${dose.medId}-${dose.time}-${i}`} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full ${style.bg} ${style.color} flex items-center justify-center flex-shrink-0`}>
                <Icon size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-txt truncate">{dose.medName} <span className="text-txt-muted font-normal">{dose.dosage}</span></p>
                <p className="text-[0.7rem] text-txt-muted">{dose.time}</p>
              </div>
              {dose.state !== 'taken' && (
                <button
                  onClick={() => onMarkTaken(dose.medId)}
                  className="text-[0.65rem] font-bold px-2.5 py-1.5 rounded-lg bg-base border border-border text-txt-secondary hover:bg-brand hover:text-white hover:border-brand transition-colors flex-shrink-0"
                >
                  Mark taken
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MedicationTimeline;
