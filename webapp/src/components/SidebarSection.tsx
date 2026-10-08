import type { ReactNode } from 'react';

interface SidebarSectionProps {
  title: string;
  collapsed: boolean;
  children: ReactNode;
}

const SidebarSection = ({ title, collapsed, children }: SidebarSectionProps) => (
  <div className="mb-1">
    {collapsed ? (
      <div className="w-8 mx-auto h-px bg-border my-3" />
    ) : (
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.08em] text-txt-muted px-3 mb-1.5 mt-4 first:mt-1">{title}</p>
    )}
    <div className="flex flex-col gap-0.5">{children}</div>
  </div>
);

export default SidebarSection;
