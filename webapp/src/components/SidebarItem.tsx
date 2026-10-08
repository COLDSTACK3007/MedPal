import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Tooltip } from './ui/Tooltip';

export interface SidebarNavItem {
  to: string;
  icon: ReactNode;
  label: string;
  end?: boolean;
  aiBadge?: boolean;
  countBadge?: string;
}

interface SidebarItemProps extends SidebarNavItem {
  collapsed: boolean;
  onNavigate?: () => void;
}

const SidebarItem = ({ to, icon, label, end, aiBadge, countBadge, collapsed, onNavigate }: SidebarItemProps) => {
  const link = (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) => `
        group relative flex items-center gap-3 h-11 px-3 rounded-xl text-sm font-medium transition-colors duration-150
        ${isActive
          ? 'bg-[var(--color-brand-glow)] text-brand border border-[color-mix(in_srgb,var(--color-brand)_25%,transparent)]'
          : 'text-txt-secondary border border-transparent hover:bg-[var(--color-sidebar-hover)] hover:text-txt'}
        ${collapsed ? 'justify-center px-0' : ''}
      `}
      aria-label={label}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-brand" aria-hidden="true" />
          )}
          <span className={`flex-shrink-0 transition-transform duration-150 ${isActive ? 'text-brand' : 'group-hover:translate-x-[1px]'}`}>
            {icon}
          </span>
          {!collapsed && (
            <span className="flex-1 min-w-0 truncate flex items-center gap-1.5">
              {label}
              {aiBadge && (
                <span className="text-[0.55rem] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-gradient-to-r from-accent to-brand text-white flex-shrink-0">AI</span>
              )}
            </span>
          )}
          {!collapsed && countBadge && (
            <span className="text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full bg-brand/15 text-brand flex-shrink-0">{countBadge}</span>
          )}
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return <Tooltip content={label} side="right">{link}</Tooltip>;
  }
  return link;
};

export default SidebarItem;
