import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Skeleton from './Skeleton';

interface StatCardProps {
  icon: ReactNode;
  iconBg: string;   // tailwind classes for the 40px icon tile
  title: string;
  to?: string;
  loading?: boolean;
  children: ReactNode; // the card's main content (ring / sparkline / value / action)
}

const StatCard = ({ icon, iconBg, title, to, loading, children }: StatCardProps) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-20 h-3" />
        <Skeleton className="w-full h-8" />
      </div>
    );
  }

  const content = (
    <div className={`count-up bg-card border border-border rounded-2xl p-5 h-full flex flex-col transition-all duration-200 ${to ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]' : ''}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>{icon}</div>
        <span className="text-[0.75rem] font-semibold text-txt-muted">{title}</span>
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );

  if (!to) return content;

  // A div (not a <button>) because some cards nest their own interactive
  // buttons (e.g. "Mark taken") — a <button> inside a <button> is invalid
  // HTML and breaks click handling in browsers.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(to)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(to); } }}
      className="text-left w-full h-full focus-visible:outline-2 focus-visible:outline-brand rounded-2xl"
      aria-label={title}
    >
      {content}
    </div>
  );
};

export default StatCard;
