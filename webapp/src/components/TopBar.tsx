import { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, Laptop } from 'lucide-react';
import type { UserProfile } from '../context/AuthContext';
import Popover from './ui/Popover';
import ProfileMenu from './ProfileMenu';
import SOSButton from './SOSButton';
import { useTheme } from '../context/ThemeContext';

interface NotificationGroup {
  label: string;
  items: { text: string; tone: 'info' | 'warning' | 'danger' | 'success' }[];
}

interface TopBarProps {
  pageTitle: string;
  isDashboard: boolean;
  isMobile: boolean;
  onOpenMobileSidebar: () => void;
  onOpenSearch: () => void;
  currentUser: UserProfile;
  onOpenSettings: () => void;
  onLogout: () => void;
  notifications: NotificationGroup[];
}

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatToday = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const toneDot: Record<string, string> = {
  info: 'bg-info', warning: 'bg-warning', danger: 'bg-danger', success: 'bg-success',
};

const TopBar = ({
  pageTitle, isDashboard, isMobile, onOpenMobileSidebar, onOpenSearch,
  currentUser, onOpenSettings, onLogout, notifications,
}: TopBarProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { mode, setMode } = useTheme();
  const unreadCount = notifications.reduce((sum, g) => sum + g.items.length, 0);

  const cycleTheme = () => {
    const order: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
    setMode(order[(order.indexOf(mode) + 1) % order.length]);
  };
  const ThemeIcon = mode === 'light' ? Sun : mode === 'dark' ? Moon : Laptop;

  return (
    <header className="glass-topbar rounded-2xl h-16 flex items-center justify-between px-4 sm:px-5 md:px-6 mb-3 sm:mb-4 flex-shrink-0 relative z-30">
      <div className="flex items-center gap-3 min-w-0">
        {isMobile && (
          <button className="p-2 -ml-1 rounded-lg text-txt-secondary hover:bg-hover transition-colors flex-shrink-0" onClick={onOpenMobileSidebar} aria-label="Open navigation">
            <Menu size={20} />
          </button>
        )}
        {isDashboard ? (
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-bold text-txt truncate">{getGreeting()}, {currentUser.fullName?.split(' ')[0] || currentUser.username}</h2>
            <p className="text-xs text-txt-muted hidden sm:block">{formatToday()}</p>
          </div>
        ) : (
          <h2 className="text-sm sm:text-base font-bold text-txt truncate">{pageTitle}</h2>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <button
          onClick={onOpenSearch}
          className="hidden sm:flex items-center gap-2 bg-base border border-border rounded-full px-4 py-2 min-w-[220px] lg:min-w-[280px] text-sm text-txt-muted hover:border-brand/50 transition-colors"
        >
          <Search size={15} />
          <span className="flex-1 text-left truncate">Search records, medications, doctors...</span>
          <kbd className="text-[0.6rem] font-bold bg-elevated border border-border-subtle rounded px-1.5 py-0.5">Ctrl K</kbd>
        </button>
        <button onClick={onOpenSearch} className="sm:hidden p-2 rounded-xl text-txt-secondary hover:bg-hover transition-colors" aria-label="Search">
          <Search size={18} />
        </button>

        <button onClick={cycleTheme} aria-label={`Theme: ${mode}. Click to change.`} className="p-2 rounded-xl text-txt-secondary hover:bg-hover hover:text-txt transition-all">
          <ThemeIcon size={18} />
        </button>

        <Popover
          open={showNotifications}
          onOpenChange={setShowNotifications}
          trigger={
            <button className="relative p-2 rounded-xl text-txt-secondary hover:bg-hover hover:text-txt transition-all" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}>
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger rounded-full shadow-[0_0_6px_var(--color-danger)]" />}
            </button>
          }
          className="w-80"
        >
          <div className="p-3 border-b border-border-subtle bg-base">
            <h3 className="font-bold text-txt text-sm">Notifications</h3>
          </div>
          <div className="p-2 space-y-3 max-h-[320px] overflow-y-auto scrollbar-thin">
            {notifications.length === 0 && <p className="text-xs text-txt-muted text-center py-6">You're all caught up.</p>}
            {notifications.map(group => (
              <div key={group.label}>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-txt-muted px-2 mb-1">{group.label}</p>
                {group.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg hover:bg-hover transition-colors">
                    <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${toneDot[item.tone]}`} />
                    <p className="text-sm text-txt-secondary">{item.text}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Popover>

        <SOSButton variant="topbar" />

        <Popover
          open={showProfile}
          onOpenChange={setShowProfile}
          trigger={
            <button className={`hidden sm:flex w-9 h-9 rounded-full items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0 ${currentUser.role === 'admin' ? 'bg-gradient-to-br from-brand to-teal' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`} aria-label="Account menu">
              {currentUser.username.substring(0, 2).toUpperCase()}
            </button>
          }
        >
          <ProfileMenu user={currentUser} onOpenSettings={() => { setShowProfile(false); onOpenSettings(); }} onLogout={onLogout} />
        </Popover>
      </div>
    </header>
  );
};

export default TopBar;
