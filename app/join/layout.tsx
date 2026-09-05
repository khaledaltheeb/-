import type { ReactNode } from 'react';
import '../system-portals-v1.css';
import '../portal-scoped.css';

export default function JoinLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
