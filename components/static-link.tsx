import type { AnchorHTMLAttributes, ReactNode } from 'react';

type StaticLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'children'> & {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
};

export default function StaticLink({ href, children, prefetch, ...props }: StaticLinkProps) {
  void prefetch;
  return <a href={href} {...props}>{children}</a>;
}
