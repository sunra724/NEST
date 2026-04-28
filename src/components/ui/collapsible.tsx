'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

interface CollapsibleContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
}

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

interface CollapsibleProps {
  defaultOpen?: boolean;
  children: ReactNode;
}

export function Collapsible({ defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);
  const value = useMemo(() => ({ open, setOpen }), [open]);
  return <CollapsibleContext.Provider value={value}>{children}</CollapsibleContext.Provider>;
}

export function CollapsibleTrigger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error('CollapsibleTrigger must be used within Collapsible.');
  return (
    <button onClick={() => ctx.setOpen(!ctx.open)} className={className}>
      {children}
    </button>
  );
}

export function CollapsibleContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error('CollapsibleContent must be used within Collapsible.');
  if (!ctx.open) return null;
  return <div className={className}>{children}</div>;
}
