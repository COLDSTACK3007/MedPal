import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { UserProfile } from '../context/AuthContext';
import SidebarSection from './SidebarSection';
import SidebarItem, { type SidebarNavItem } from './SidebarItem';
import ProfileMenu from './ProfileMenu';
import Popover from './ui/Popover';
import { TooltipProvider } from './ui/Tooltip';

export interface SidebarGroup {
  title: string;
  items: SidebarNavItem[];
}

interface GlassSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  isMobile: boolean;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  groups: SidebarGroup[];
  currentUser: UserProfile;
  onOpenSettings: () => void;
  onLogout: () => void;
}

const BrandMark = ({ collapsed }: { collapsed: boolean }) => (
  <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-2 h-10`}>
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand to-teal flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-glow relative overflow-hidden group">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white z-10 relative group-hover:scale-110 transition-transform duration-500">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
      <div className="absolute inset-0 bg-white/20 blur-md rounded-full scale-0 group-hover:scale-150 transition-transform duration-700" />
    </div>
    <div className={`flex flex-col whitespace-nowrap transition-all duration-300 overflow-hidden ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
      <h1 className="text-xl tracking-tight leading-none flex items-center">
        <span className="font-light text-txt">Med</span>
        <span className="font-extrabold text-brand">Pal</span>
        <span className="w-1.5 h-1.5 rounded-full bg-brand ml-1 mb-2 shadow-[0_0_8px_var(--color-brand)] animate-pulse" />
      </h1>
      <span className="text-[0.55rem] font-bold uppercase tracking-[0.2em] text-txt-muted mt-1">Enterprise Health</span>
    </div>
  </div>
);

const GlassSidebar = ({
  collapsed, onToggleCollapsed, isMobile, isMobileOpen, onCloseMobile,
  groups, currentUser, onOpenSettings, onLogout,
}: GlassSidebarProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  if (isMobile && !isMobileOpen) return null;

  return (
    <TooltipProvider>
      <aside
        className={`
          glass-panel rounded-3xl flex flex-col transition-[width] duration-[240ms] ease-[cubic-bezier(.2,.8,.2,1)] relative z-40
          ${isMobile ? 'fixed inset-y-4 left-4 w-72' : (collapsed ? 'w-[76px]' : 'w-[264px]')}
        `}
        aria-label="Primary navigation"
      >
        {/* Top edge highlight to sell the glass effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-t-3xl pointer-events-none" aria-hidden="true" />

        {!isMobile && (
          <button
            onClick={onToggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="absolute -right-3 top-8 w-6 h-6 rounded-full glass-panel flex items-center justify-center text-txt-secondary hover:text-brand transition-all z-20"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}

        <div className="p-5 pb-2 pt-6">
          <BrandMark collapsed={collapsed && !isMobile} />
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-3 scrollbar-thin">
          {groups.map(group => (
            <SidebarSection key={group.title} title={group.title} collapsed={collapsed && !isMobile}>
              {group.items.map(item => (
                <SidebarItem key={item.to} {...item} collapsed={collapsed && !isMobile} onNavigate={isMobile ? onCloseMobile : undefined} />
              ))}
            </SidebarSection>
          ))}
        </nav>

        {/* Profile card */}
        <div className="p-4 mt-auto relative">
          <Popover
            open={showProfileMenu}
            onOpenChange={setShowProfileMenu}
            align="start"
            side={isMobile ? 'top' : 'right'}
            trigger={
              <button
                className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${collapsed && !isMobile ? 'justify-center hover:bg-[var(--color-sidebar-hover)]' : 'bg-[var(--color-sidebar-hover)] hover:bg-brand/10'}`}
                aria-label="Open profile menu"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0 ${currentUser.role === 'admin' ? 'bg-gradient-to-br from-brand to-teal' : 'bg-gradient-to-br from-blue-500 to-indigo-500'}`}>
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                {(!collapsed || isMobile) && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-txt truncate">{currentUser.username}</p>
                    <p className="text-[0.65rem] text-brand truncate uppercase tracking-wider font-semibold">{currentUser.role === 'admin' ? 'Administrator' : 'Patient'}</p>
                  </div>
                )}
              </button>
            }
          >
            <ProfileMenu
              user={currentUser}
              onOpenSettings={() => { setShowProfileMenu(false); onOpenSettings(); }}
              onLogout={onLogout}
            />
          </Popover>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default GlassSidebar;
