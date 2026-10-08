import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AIBriefingCardProps {
  message: string;
  nextDoseLabel?: string;
  onMarkTaken?: () => void;
}

const AIBriefingCard = ({ message, nextDoseLabel, onMarkTaken }: AIBriefingCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-accent/10 via-brand-glow to-teal-glow border border-border rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-brand flex items-center justify-center flex-shrink-0">
          <Sparkles size={15} className="text-white" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider text-accent">Daily AI Briefing</span>
      </div>
      <p className="text-sm text-txt-secondary leading-relaxed flex-1">{message}</p>
      <div className="flex gap-2 mt-4">
        {nextDoseLabel && onMarkTaken && (
          <button onClick={onMarkTaken} className="text-xs font-bold px-3.5 py-2 rounded-xl bg-card border border-border text-txt hover:border-brand transition-colors">
            Mark taken
          </button>
        )}
        <button onClick={() => navigate('/companion')} className="text-xs font-bold px-3.5 py-2 rounded-xl bg-gradient-to-r from-accent to-brand text-white hover:brightness-110 transition-[filter]">
          Ask MedPal
        </button>
      </div>
    </div>
  );
};

export default AIBriefingCard;
