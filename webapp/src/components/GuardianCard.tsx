import { ShieldCheck, Plus } from 'lucide-react';
import type { UserProfile } from '../context/AuthContext';
import EmptyState from './EmptyState';

interface GuardianCardProps {
  guardians: UserProfile['guardians'];
  onAddGuardian: () => void;
}

const GuardianCard = ({ guardians = [], onAddGuardian }: GuardianCardProps) => (
  <div className="bg-card border border-border rounded-2xl p-5 h-full flex flex-col">
    <h3 className="text-sm font-bold text-txt mb-3 flex items-center gap-2"><ShieldCheck size={16} className="text-brand" /> Guardian Circle</h3>

    {guardians.length === 0 ? (
      <div className="flex-1 flex items-center justify-center">
        <EmptyState icon={<ShieldCheck size={20} />} title="No guardians linked" description="Add a guardian so Emergency SOS has someone to notify." actionLabel="Add Guardian" onAction={onAddGuardian} />
      </div>
    ) : (
      <>
        <div className="flex items-center gap-2 mb-4">
          <div className="flex -space-x-2">
            {guardians.slice(0, 4).map((g, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-brand to-teal border-2 border-card flex items-center justify-center text-white text-xs font-bold" title={g.name}>
                {g.name?.substring(0, 2).toUpperCase() || '?'}
              </div>
            ))}
          </div>
          <span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0 ml-1" />
          <span className="text-xs text-success font-semibold">Location sharing ready</span>
        </div>
        <ul className="space-y-1.5 flex-1">
          {guardians.map((g, i) => (
            <li key={i} className="text-xs text-txt-secondary truncate">{g.name} · {g.email}</li>
          ))}
        </ul>
        <button onClick={onAddGuardian} className="mt-3 flex items-center justify-center gap-1.5 text-xs font-bold text-brand bg-brand-glow px-3 py-2 rounded-xl hover:bg-brand hover:text-white transition-colors">
          <Plus size={13} /> Add Guardian
        </button>
      </>
    )}
  </div>
);

export default GuardianCard;
