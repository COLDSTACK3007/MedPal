import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ icon, title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center text-center py-8 px-4">
    <div className="w-12 h-12 rounded-xl bg-brand-glow text-brand flex items-center justify-center mb-3">
      {icon}
    </div>
    <p className="text-sm font-bold text-txt">{title}</p>
    {description && <p className="text-xs text-txt-muted mt-1 max-w-[220px]">{description}</p>}
    {actionLabel && onAction && (
      <button onClick={onAction} className="mt-4 text-xs font-bold text-brand bg-brand-glow px-4 py-2 rounded-full hover:bg-brand hover:text-white transition-colors">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
