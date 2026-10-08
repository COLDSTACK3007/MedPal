import type { StoredMedication } from './healthStore';

export interface TodayDose {
  medId: string;
  medName: string;
  dosage: string;
  time: string;
  state: 'taken' | 'upcoming' | 'missed';
}

// Derives a simple taken/upcoming/missed schedule from each medication's
// scheduled times vs. the current clock and remaining pill count. This is a
// presentational approximation — there is no per-dose log in the data model
// yet, so a med's earliest N slots are shown as "taken" proportional to how
// many pills have been taken off its running count today.
export function buildTodayDoses(medications: StoredMedication[]): TodayDose[] {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const doses: TodayDose[] = [];

  medications.forEach(med => {
    const takenToday = med.times.length > 0 ? Math.max(0, med.total - med.count) % med.times.length : 0;
    med.times.forEach((time, idx) => {
      const [h, m] = time.split(':').map(Number);
      const slotMinutes = (h || 0) * 60 + (m || 0);
      let state: TodayDose['state'];
      if (idx < takenToday) state = 'taken';
      else if (slotMinutes < nowMinutes) state = 'missed';
      else state = 'upcoming';
      doses.push({ medId: med.id, medName: med.name, dosage: med.dosage, time, state });
    });
  });

  return doses.sort((a, b) => a.time.localeCompare(b.time));
}
