'use client';

import { cloneElement, createContext, type MouseEvent, type ReactElement, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialogContext() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('Dialog components must be used inside <Dialog>.');
  return ctx;
}

interface DialogProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Dialog({ children, open, onOpenChange }: DialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const currentOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback((next: boolean) => {
    if (!isControlled) setInternalOpen(next);
    onOpenChange?.(next);
  }, [isControlled, onOpenChange]);

  const value = useMemo(() => ({ open: currentOpen, setOpen }), [currentOpen, setOpen]);
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

interface TriggerProps {
  asChild?: boolean;
  children: ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>;
}

export function DialogTrigger({ asChild, children }: TriggerProps) {
  const { setOpen } = useDialogContext();
  const onClick = (event: MouseEvent<HTMLElement>) => {
    children.props.onClick?.(event);
    if (!event.defaultPrevented) setOpen(true);
  };

  if (asChild) return cloneElement(children, { onClick });
  return cloneElement(children, { onClick });
}

interface ContentProps {
  children: ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: ContentProps) {
  const { open, setOpen } = useDialogContext();
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button className="absolute inset-0 bg-slate-900/55" aria-label="닫기" onClick={() => setOpen(false)} />
      <div className={cn('relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl', className)}>
        <button
          onClick={() => setOpen(false)}
          aria-label="닫기"
          className="absolute right-3 top-3 rounded-md p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
        >
          <X className="h-4 w-4" />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-2', className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h2>;
}
