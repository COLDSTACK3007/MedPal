import { useEffect, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Command } from 'cmdk';
import { Search, LayoutDashboard, Activity, Bell, FileText, Calendar, Video, MapPin, Dumbbell, Bot, Microscope, Users } from 'lucide-react';
import type { SidebarGroup } from './GlassSidebar';

interface CommandPaletteProps {
  groups: SidebarGroup[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ICONS: Record<string, React.ReactNode> = {
  '/': <LayoutDashboard size={16} />,
  '/vitals': <Activity size={16} />,
  '/tracker': <Bell size={16} />,
  '/vault': <FileText size={16} />,
  '/appointments': <Calendar size={16} />,
  '/telemedicine': <Video size={16} />,
  '/hospitals': <MapPin size={16} />,
  '/fitness': <Dumbbell size={16} />,
  '/companion': <Bot size={16} />,
  '/medtrace': <Microscope size={16} />,
  '/records': <Users size={16} />,
};

const CommandPalette = ({ groups, open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const go = (to: string) => {
    navigate(to);
    onOpenChange(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-start justify-center pt-[12vh] px-4 bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <Command
        shouldFilter
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fade-in"
        onClick={(e: MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
          <Search size={16} className="text-txt-muted flex-shrink-0" />
          <Command.Input
            autoFocus
            placeholder="Search records, medications, doctors..."
            className="flex-1 bg-transparent outline-none text-sm text-txt placeholder:text-txt-muted"
          />
          <kbd className="text-[0.65rem] font-bold text-txt-muted bg-base border border-border rounded px-1.5 py-0.5 flex-shrink-0">Esc</kbd>
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="py-8 text-center text-sm text-txt-muted">No results found.</Command.Empty>
          {groups.map(group => (
            <Command.Group key={group.title} heading={group.title} className="[&_[cmdk-group-heading]]:text-[0.65rem] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-txt-muted [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5">
              {group.items.map(item => (
                <Command.Item
                  key={item.to}
                  value={item.label}
                  onSelect={() => go(item.to)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-txt cursor-pointer data-[selected=true]:bg-brand-glow data-[selected=true]:text-brand"
                >
                  {ICONS[item.to] || item.icon}
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
};

export default CommandPalette;
