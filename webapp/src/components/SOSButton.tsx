import { useRef, useState } from 'react';
import { AlertTriangle, MapPin, Loader2, CheckCircle, XCircle, UserX } from 'lucide-react';
import { useEmergencySOS } from '../hooks/useEmergencySOS';
import Dialog, { DialogTitle, DialogDescription } from './ui/Dialog';

const HOLD_DURATION_MS = 2000;
const TAP_THRESHOLD_MS = 300;

interface SOSButtonProps {
  variant?: 'topbar' | 'fab';
}

const SOSButton = ({ variant = 'topbar' }: SOSButtonProps) => {
  const { status, trigger, reset, guardianCount } = useEmergencySOS();
  const [showConfirm, setShowConfirm] = useState(false);
  const [description, setDescription] = useState('');
  const [isHolding, setIsHolding] = useState(false);

  const pointerDownAt = useRef(0);
  const holdTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const clearHold = () => {
    if (holdTimeout.current) clearTimeout(holdTimeout.current);
    holdTimeout.current = null;
    setIsHolding(false);
  };

  const handlePointerDown = () => {
    pointerDownAt.current = Date.now();
    setIsHolding(true);
    holdTimeout.current = setTimeout(() => {
      setIsHolding(false);
      trigger(description);
    }, HOLD_DURATION_MS);
  };

  const handlePointerUp = () => {
    const elapsed = Date.now() - pointerDownAt.current;
    clearHold();
    if (elapsed < TAP_THRESHOLD_MS) {
      setShowConfirm(true);
    }
  };

  const handleConfirmSend = () => {
    setShowConfirm(false);
    trigger(description);
  };

  const closeStatus = () => {
    reset();
    setDescription('');
  };

  const sizeClasses = variant === 'fab'
    ? 'w-14 h-14 fixed bottom-20 right-4 z-30 shadow-xl md:hidden'
    : 'w-10 h-10';

  return (
    <>
      <button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={clearHold}
        aria-label="Emergency SOS — tap for options, or press and hold 2 seconds to send immediately"
        className={`relative ${sizeClasses} rounded-full bg-danger text-white flex items-center justify-center flex-shrink-0 ${!isHolding ? 'sos-pulse' : ''} hover:brightness-110 transition-[filter] overflow-hidden`}
      >
        {!prefersReducedMotion && isHolding && (
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20" cy="20" r="18" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={0}
              style={{ animation: `sos-hold-fill ${HOLD_DURATION_MS}ms linear forwards` }}
            />
          </svg>
        )}
        <AlertTriangle size={variant === 'fab' ? 24 : 18} className="relative z-10" />
      </button>

      {/* Inline keyframe for the hold-fill ring (scoped, avoids editing global CSS for one-off geometry) */}
      <style>{`
        @keyframes sos-hold-fill {
          from { stroke-dashoffset: ${2 * Math.PI * 18}; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Confirmation dialog (click path) */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-danger-bg text-danger flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <DialogTitle className="text-lg font-extrabold text-txt">Send Emergency Alert?</DialogTitle>
        </div>
        <DialogDescription className="text-sm text-txt-secondary mb-4">
          This notifies {guardianCount > 0 ? `your ${guardianCount} linked guardian${guardianCount > 1 ? 's' : ''}` : 'your guardians'} by email with your live location.
        </DialogDescription>

        <div className="flex items-center gap-2 p-3 rounded-xl bg-success-bg text-success text-sm font-semibold mb-3">
          <MapPin size={16} /> Share location with guardians (required)
        </div>

        <label className="text-xs font-bold text-txt-muted mb-1.5 block">Describe the emergency (optional)</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="e.g. Difficulty breathing, need immediate help..."
          rows={3}
          className="w-full px-3.5 py-2.5 bg-input border border-border rounded-xl text-sm text-txt placeholder:text-txt-muted outline-none focus:border-brand transition-all resize-none mb-4"
        />

        <div className="flex gap-3">
          <button onClick={() => setShowConfirm(false)} className="flex-1 py-2.5 rounded-xl font-bold bg-base border border-border text-txt hover:bg-hover transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirmSend} className="flex-1 py-2.5 rounded-xl font-bold bg-danger text-white hover:brightness-110 transition-[filter] shadow-md shadow-danger/20">
            Send Alert
          </button>
        </div>
      </Dialog>

      {/* Status dialog (loading / success / error / no-guardian) */}
      <Dialog open={status !== 'idle'} onOpenChange={(open) => { if (!open) closeStatus(); }}>
        <div className="flex flex-col items-center text-center py-2">
          {status === 'loading' && (
            <>
              <Loader2 size={56} className="text-brand animate-spin mb-4" />
              <DialogTitle className="text-lg font-extrabold text-txt mb-1">Sending SOS...</DialogTitle>
              <DialogDescription className="text-sm text-txt-muted">Notifying your guardians. Please hold on.</DialogDescription>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle size={56} className="text-success mb-4" />
              <DialogTitle className="text-lg font-extrabold text-txt mb-1">SOS Sent Successfully</DialogTitle>
              <DialogDescription className="text-sm text-txt-muted mb-5">Your guardians have been notified with your live location.</DialogDescription>
              <button onClick={closeStatus} className="w-full bg-base text-txt font-bold py-3 rounded-xl hover:bg-hover transition-colors border border-border">Close</button>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle size={56} className="text-danger mb-4" />
              <DialogTitle className="text-lg font-extrabold text-txt mb-1">Failed to Send</DialogTitle>
              <DialogDescription className="text-sm text-txt-muted mb-5">There was an error communicating with the server.</DialogDescription>
              <button onClick={closeStatus} className="w-full bg-base text-txt font-bold py-3 rounded-xl hover:bg-hover transition-colors border border-border">Close</button>
            </>
          )}
          {status === 'no-guardian' && (
            <>
              <UserX size={56} className="text-warning mb-4" />
              <DialogTitle className="text-lg font-extrabold text-txt mb-1">No Guardian Configured</DialogTitle>
              <DialogDescription className="text-sm text-txt-muted mb-5">Add a guardian email in Settings before using Emergency SOS.</DialogDescription>
              <button onClick={closeStatus} className="w-full bg-base text-txt font-bold py-3 rounded-xl hover:bg-hover transition-colors border border-border">Close</button>
            </>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default SOSButton;
