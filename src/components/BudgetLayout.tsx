import React, { useEffect, useRef } from 'react';

interface BudgetLayoutProps {
  children: React.ReactNode;
  headerHeight: number;
}

export function BudgetLayout({ children, headerHeight }: BudgetLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && headerHeight > 0) {
      containerRef.current.style.setProperty('--header-h', `${headerHeight}px`);
    }
  }, [headerHeight]);

  return (
    <div
      ref={containerRef}
      className="grid lg:grid-cols-[minmax(0,1fr)_380px] grid-cols-1 gap-6 h-[calc(100vh-var(--header-h))] px-4 sm:px-6 lg:px-8 py-6"
      style={{ '--header-h': `${headerHeight}px` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}