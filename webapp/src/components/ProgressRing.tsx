interface ProgressRingProps {
  value: number;      // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;      // CSS color/var
  trackColor?: string;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

const ProgressRing = ({
  value, size = 72, strokeWidth = 7, color = 'var(--color-brand)', trackColor = 'var(--color-border)',
  label, sublabel, animate = true,
}: ProgressRingProps) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: animate ? 'stroke-dashoffset 0.8s cubic-bezier(.2,.8,.2,1)' : undefined }}
        />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {label && <span className="text-sm font-extrabold text-txt leading-none">{label}</span>}
          {sublabel && <span className="text-[0.6rem] text-txt-muted font-semibold">{sublabel}</span>}
        </div>
      )}
    </div>
  );
};

export default ProgressRing;
