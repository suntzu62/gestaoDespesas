import React, { useEffect, useRef } from 'react';
import { InspectorPanel } from './InspectorPanel';

interface InspectorPaneProps {
  headerHeight: number;
}

export function InspectorPane({ headerHeight }: InspectorPaneProps) {
  const paneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paneRef.current && headerHeight > 0) {
      paneRef.current.style.setProperty('--header-h', `${headerHeight}px`);
    }
  }, [headerHeight]);

  return (
    <div
      ref={paneRef}
      className="lg:sticky lg:top-[var(--header-h)] lg:h-[calc(100vh-var(--header-h))] overflow-y-auto bg-white shadow-lg border border-gray-200 rounded-xl"
      style={{ '--header-h': `${headerHeight}px` } as React.CSSProperties}
    >
      <InspectorPanel />
    </div>
  );
}