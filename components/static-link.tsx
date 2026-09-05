import type { AnchorHTMLAttributes, ReactNode } from 'react';

type StaticLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> & {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
};

export default function StaticLink({ href, children, prefetch: _prefetch, ...props }: StaticLinkProps) {
  return <a href={href} {...props}>{children}</a>;
}
