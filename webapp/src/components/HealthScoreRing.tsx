import ProgressRing from './ProgressRing';

interface HealthScoreRingProps {
  score: number;      // 0-100 — see computeHealthScore() for the placeholder formula
  deltaVsLastWeek?: number;
}

function scoreLabel(score: number) {
  if (score >= 80) return { label: 'Good', color: 'var(--color-success)' };
  if (score >= 60) return { label: 'Fair', color: 'var(--color-warning)' };
  return { label: 'Needs Attention', color: 'var(--color-danger)' };
}

const HealthScoreRing = ({ score, deltaVsLastWeek }: HealthScoreRingProps) => {
  const { label, color } = scoreLabel(score);
  return (
    <div className="flex items-center gap-4">
      <ProgressRing value={score} size={96} strokeWidth={8} color={color} label={String(Math.round(score))} sublabel="/ 100" />
      <div>
        <p className="text-sm font-extrabold" style={{ color }}>{label}</p>
        <p className="text-xs text-txt-muted">Daily Health Score</p>
        {typeof deltaVsLastWeek === 'number' && (
          <p className={`text-xs font-semibold mt-1 ${deltaVsLastWeek >= 0 ? 'text-success' : 'text-danger'}`}>
            {deltaVsLastWeek >= 0 ? '▲' : '▼'} {Math.abs(deltaVsLastWeek)} vs last week
          </p>
        )}
      </div>
    </div>
  );
};

export default HealthScoreRing;
