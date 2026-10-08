import * as RadixDialog from '@radix-ui/react-dialog';
import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

const Dialog = ({ open, onOpenChange, children, className = '' }: DialogProps) => (
  <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm data-[state=open]:animate-fade-in" />
      <RadixDialog.Content
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
        className={`fixed left-1/2 top-1/2 z-[201] -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 focus:outline-none ${className}`}
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);

export const DialogTitle = RadixDialog.Title;
export const DialogDescription = RadixDialog.Description;
export const DialogClose = RadixDialog.Close;

export default Dialog;
