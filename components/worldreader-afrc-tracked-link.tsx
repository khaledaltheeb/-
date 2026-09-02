'use client';

import type { ReactNode } from 'react';

type Placement = 'hero' | 'official_page' | 'vroom' | 'footer_cta';
type Destination = 'campaign' | 'worldreader';

type Props = {
  href: string;
  placement: Placement;
  destination: Destination;
  className?: string;
  children: ReactNode;
};

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export default function WorldreaderAfrcTrackedLink({ href, placement, destination, className, children }: Props) {
  function track() {
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'worldreader_afrc_2026_outbound_click',
      campaign: 'worldreader_afrc_2026',
      placement,
      destination,
    });
  }

  return (
    <a href={href} className={className} target="_blank" rel="noopener noreferrer" onClick={track}>
      {children}
    </a>
  );
}
