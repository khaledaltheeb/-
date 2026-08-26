'use client';

import type { MouseEvent, ReactNode } from 'react';

type Placement = 'hero' | 'how_to' | 'evidence' | 'footer_cta' | 'worldreader_source';
type Destination = 'booksmart' | 'worldreader';

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
  function track(event: MouseEvent<HTMLAnchorElement>) {
    void event;
    if (typeof window === 'undefined') return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: destination === 'booksmart' ? 'afrc_2026_booksmart_click' : 'afrc_2026_worldreader_click',
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
