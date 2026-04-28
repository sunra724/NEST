'use client';

import { cloneElement, createContext, type MouseEvent, type ReactElement, type ReactNode, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface AlertDialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

function useAlertDialog() {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) throw new Error('AlertDialog components must be used inside <AlertDialog>.');
  return ctx;
}

export function AlertDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <AlertDialogContext.Provider value={value}>{children}</AlertDialogContext.Provider>;
}

interface TriggerProps {
  asChild?: boolean;
  children: ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>;
}

export function AlertDialogTrigger({ asChild, children }: TriggerProps) {
  const { setOpen } = useAlertDialog();
  const onClick = (event: MouseEvent<HTMLElement>) => {
    children.props.onClick?.(event);
    if (!event.defaultPrevented) setOpen(true);
  };

  if (asChild) return cloneElement(children, { onClick });
  return cloneElement(children, { onClick });
}

export function AlertDialogContent({ children, className }: { children: ReactNode; className?: string }) {
  const { open, setOpen } = useAlertDialog();
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button className="absolute inset-0 bg-slate-900/55" aria-label="닫기" onClick={() => setOpen(false)} />
      <div className={cn('relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl', className)}>{children}</div>
    </div>,
    document.body,
  );
}

export function AlertDialogHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('space-y-1.5', className)}>{children}</div>;
}

export function AlertDialogTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('text-lg font-semibold text-slate-900', className)}>{children}</h2>;
}

export function AlertDialogDescription({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm text-slate-600', className)}>{children}</p>;
}

export function AlertDialogFooter({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mt-4 flex justify-end gap-2', className)}>{children}</div>;
}

export function AlertDialogCancel({ children, className }: { children: ReactNode; className?: string }) {
  const { setOpen } = useAlertDialog();
  return (
    <button
      className={cn('inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 hover:bg-slate-100', className)}
      onClick={() => setOpen(false)}
      type="button"
    >
      {children}
    </button>
  );
}

interface ActionProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function AlertDialogAction({ children, className, onClick }: ActionProps) {
  const { setOpen } = useAlertDialog();
  return (
    <button
      className={cn('inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-3 text-sm text-white hover:bg-slate-800', className)}
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      type="button"
    >
      {children}
    </button>
  );
}
