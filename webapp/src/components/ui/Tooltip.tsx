import * as RadixTooltip from '@radix-ui/react-tooltip';
import type { ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  disabled?: boolean;
}

export const TooltipProvider = RadixTooltip.Provider;

export const Tooltip = ({ content, children, side = 'right', disabled }: TooltipProps) => {
  if (disabled) return <>{children}</>;
  return (
    <RadixTooltip.Root delayDuration={200}>
      <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
      <RadixTooltip.Portal>
        <RadixTooltip.Content
          side={side}
          sideOffset={8}
          className="z-[200] px-2.5 py-1.5 rounded-lg bg-card border border-border text-txt text-xs font-semibold shadow-lg animate-fade-in"
        >
          {content}
          <RadixTooltip.Arrow className="fill-card" />
        </RadixTooltip.Content>
      </RadixTooltip.Portal>
    </RadixTooltip.Root>
  );
};
