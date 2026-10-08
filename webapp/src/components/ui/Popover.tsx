import * as RadixPopover from '@radix-ui/react-popover';
import type { ReactNode } from 'react';

interface PopoverProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const Popover = ({ trigger, children, align = 'end', side = 'bottom', open, onOpenChange, className = '' }: PopoverProps) => (
  <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
    <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
    <RadixPopover.Portal>
      <RadixPopover.Content
        align={align}
        side={side}
        sideOffset={10}
        className={`z-[150] rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-fade-in ${className}`}
      >
        {children}
      </RadixPopover.Content>
    </RadixPopover.Portal>
  </RadixPopover.Root>
);

export default Popover;
