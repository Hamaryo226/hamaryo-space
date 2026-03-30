import React from 'react';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

const joinClasses = (...classes: Array<string | undefined>) => classes.filter(Boolean).join(' ');

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div
      role="group"
      className={joinClasses(
        'inline-flex isolate overflow-hidden rounded-md border border-[var(--border)] bg-[var(--bg-card)]',
        className
      )}
    >
      {children}
    </div>
  );
}
