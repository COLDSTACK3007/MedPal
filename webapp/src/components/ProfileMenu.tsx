import { LogOut, Settings, Sun, Moon, Laptop, Globe } from 'lucide-react';
import type { UserProfile } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface ProfileMenuProps {
  user: UserProfile;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const ProfileMenu = ({ user, onOpenSettings, onLogout }: ProfileMenuProps) => {
  const { mode, setMode } = useTheme();

  const themeOptions: { value: 'light' | 'dark' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Laptop, label: 'System' },
  ];

  return (
    <div className="w-60 py-2">
      <div className="px-4 py-2.5 border-b border-border-subtle mb-1">
        <p className="text-sm font-bold text-txt truncate">{user.fullName || user.username}</p>
        <p className="text-xs text-txt-muted uppercase tracking-wider font-semibold">{user.role === 'admin' ? 'Administrator' : 'Patient'}</p>
      </div>

      <button
        onClick={onOpenSettings}
        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-txt-secondary hover:bg-hover hover:text-txt transition-colors"
      >
        <Settings size={16} className="text-brand" /> Account Settings
      </button>

      <div className="px-4 py-2.5">
        <p className="text-[0.65rem] font-bold uppercase tracking-wider text-txt-muted mb-2 flex items-center gap-1.5"><Globe size={11} /> Theme</p>
        <div className="flex gap-1.5 bg-base rounded-xl p-1 border border-border-subtle">
          {themeOptions.map(opt => {
            const Icon = opt.icon;
            const active = mode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                aria-pressed={active}
                className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-lg text-[0.65rem] font-bold transition-colors ${active ? 'bg-brand text-white shadow-sm' : 'text-txt-muted hover:text-txt'}`}
              >
                <Icon size={13} /> {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border-subtle mt-1 pt-1">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-danger hover:bg-danger-bg transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileMenu;
