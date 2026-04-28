'use client';

import { ChevronDown } from 'lucide-react';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

interface AccordionContextValue {
  openValue: string | null;
  setOpenValue: (value: string | null) => void;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

interface AccordionProps {
  type?: 'single';
  collapsible?: boolean;
  defaultValue?: string;
  className?: string;
  children: ReactNode;
}

export function Accordion({ defaultValue = '', className, children }: AccordionProps) {
  const [openValue, setOpenValue] = useState<string | null>(defaultValue || null);
  const value = useMemo(() => ({ openValue, setOpenValue }), [openValue]);
  return <div className={cn('space-y-2', className)}><AccordionContext.Provider value={value}>{children}</AccordionContext.Provider></div>;
}

interface ItemContextValue {
  value: string;
}

const ItemContext = createContext<ItemContextValue | null>(null);

interface AccordionItemProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function AccordionItem({ value, className, children }: AccordionItemProps) {
  return (
    <ItemContext.Provider value={{ value }}>
      <div className={cn('overflow-hidden rounded-lg border border-slate-200', className)}>{children}</div>
    </ItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  className?: string;
  children: ReactNode;
}

export function AccordionTrigger({ className, children }: AccordionTriggerProps) {
  const context = useContext(AccordionContext);
  const item = useContext(ItemContext);
  if (!context || !item) throw new Error('AccordionTrigger must be used in AccordionItem.');

  const isOpen = context.openValue === item.value;
  return (
    <button
      className={cn('flex w-full items-center justify-between bg-white px-4 py-3 text-left text-sm font-semibold text-slate-800', className)}
      onClick={() => context.setOpenValue(isOpen ? null : item.value)}
    >
      {children}
      <ChevronDown className={cn('h-4 w-4 text-slate-500 transition-transform', isOpen && 'rotate-180')} />
    </button>
  );
}

interface AccordionContentProps {
  className?: string;
  children: ReactNode;
}

export function AccordionContent({ className, children }: AccordionContentProps) {
  const context = useContext(AccordionContext);
  const item = useContext(ItemContext);
  if (!context || !item) throw new Error('AccordionContent must be used in AccordionItem.');
  if (context.openValue !== item.value) return null;

  return <div className={cn('border-t border-slate-200 bg-white px-4 py-4', className)}>{children}</div>;
}
