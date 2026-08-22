import Link from 'next/link';
import type { PublicCategoryTreeItem, PublicCategoryTreeNode } from '@/lib/public-category-tree';

type Props<T extends PublicCategoryTreeItem> = {
  nodes: PublicCategoryTreeNode<T>[];
  ariaLabel?: string;
  depth?: number;
};

export default function PublicCategoryTree<T extends PublicCategoryTreeItem>({ nodes, ariaLabel, depth = 1 }: Props<T>) {
  if (nodes.length === 0) return null;

  return (
    <ul className="public-category-tree" data-depth={depth} aria-label={depth === 1 ? ariaLabel : undefined}>
      {nodes.map((node) => (
        <li key={node.category.id}>
          <Link href={`/sections/${node.category.slug}`}>{node.category.name_ar}</Link>
          {node.children.length > 0 && <PublicCategoryTree nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}
