'use client';

import { cloneElement, createContext, type MouseEvent, type ReactElement, type ReactNode, useContext, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);

function useSheetContext(): SheetContextValue {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error('Sheet components must be used inside <Sheet>.');
  return ctx;
}

interface SheetProps {
  children: ReactNode;
}

export function Sheet({ children }: SheetProps) {
  const [open, setOpen] = useState(false);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

interface SheetTriggerProps {
  asChild?: boolean;
  children: ReactElement<{ onClick?: (event: MouseEvent<HTMLElement>) => void }>;
}

export function SheetTrigger({ asChild, children }: SheetTriggerProps) {
  const { setOpen } = useSheetContext();

  const onClick = (event: MouseEvent<HTMLElement>) => {
    children.props.onClick?.(event);
    if (!event.defaultPrevented) setOpen(true);
  };

  if (asChild) {
    return cloneElement(children, { onClick });
  }

  return cloneElement(children, { onClick });
}

interface SheetContentProps {
  children: ReactNode;
  side?: 'left' | 'right';
  className?: string;
}

export function SheetContent({ children, side = 'right', className }: SheetContentProps) {
  const { open, setOpen } = useSheetContext();
  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-slate-900/55"
        onClick={() => setOpen(false)}
        aria-label="오버레이 닫기"
      />
      <div
        className={cn(
          'absolute top-0 h-full w-[280px] bg-white shadow-xl transition-transform',
          side === 'left' ? 'left-0' : 'right-0',
          className,
        )}
      >
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

export function SheetClose({ children, asChild }: SheetTriggerProps) {
  const { setOpen } = useSheetContext();

  const onClick = (event: MouseEvent<HTMLElement>) => {
    children.props.onClick?.(event);
    if (!event.defaultPrevented) setOpen(false);
  };

  if (asChild) {
    return cloneElement(children, { onClick });
  }

  return cloneElement(children, { onClick });
}
