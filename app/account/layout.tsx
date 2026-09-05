import type { ReactNode } from 'react';
import '../dashboard-v3-scoped.css';
import '../system-portals-v1.css';
import '../portal.css';
import '../account-system-v1.css';
import '../theme-admin-v4-scoped.css';

export default function AccountLayout({ children }: Readonly<{ children: ReactNode }>) {
  return children;
}
