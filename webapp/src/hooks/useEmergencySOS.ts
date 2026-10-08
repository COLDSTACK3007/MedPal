import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

export type SOSStatus = 'idle' | 'loading' | 'success' | 'error' | 'no-guardian';

// Same request/endpoint/payload as the original inline handler in UserDashboard —
// only the presentation (SOSButton) changed, this is the untouched business logic.
export function useEmergencySOS() {
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<SOSStatus>('idle');

  const trigger = (description?: string) => {
    setStatus('loading');

    const notifyGuardian = async (locString: string) => {
      if (currentUser?.guardians && currentUser.guardians.length > 0) {
        const allGuardianEmails = currentUser.guardians
          .map(g => g.email)
          .filter(email => email && email.trim() !== '')
          .join(',');

        if (!allGuardianEmails) {
          setStatus('no-guardian');
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/emergency/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guardianEmail: allGuardianEmails,
              patientName: currentUser?.fullName || currentUser?.username,
              patientAge: currentUser?.age,
              patientGender: currentUser?.gender,
              patientContact: currentUser?.contact,
              patientEmail: currentUser?.email,
              patientAddress: currentUser?.address,
              locationUrl: locString,
              description: description || undefined,
            }),
          });

          setStatus(response.ok ? 'success' : 'error');
        } catch {
          setStatus('error');
        }
      } else {
        setStatus('no-guardian');
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => notifyGuardian(`https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`),
        () => notifyGuardian('Location sharing denied/unavailable')
      );
    } else {
      notifyGuardian('Location sharing not supported');
    }
  };

  const reset = () => setStatus('idle');

  return { status, trigger, reset, guardianCount: currentUser?.guardians?.length || 0 };
}
