export type PublicCategoryTreeItem = {
  id: string;
  slug: string;
  name_ar: string;
  description?: string | null;
  parent_id: string | null;
  sort_order?: number | null;
};

export type PublicCategoryTreeNode<T extends PublicCategoryTreeItem = PublicCategoryTreeItem> = {
  category: T;
  children: PublicCategoryTreeNode<T>[];
};

function compareCategories<T extends PublicCategoryTreeItem>(a: T, b: T) {
  const aOrder = Number.isFinite(a.sort_order) ? Number(a.sort_order) : Number.MAX_SAFE_INTEGER;
  const bOrder = Number.isFinite(b.sort_order) ? Number(b.sort_order) : Number.MAX_SAFE_INTEGER;
  if (aOrder !== bOrder) return aOrder - bOrder;
  return a.name_ar.localeCompare(b.name_ar, 'ar');
}

/**
 * Builds a public taxonomy forest without silently dropping malformed rows.
 * A category is promoted to a visible root when its parent is missing, points
 * to itself, or participates in a cycle. Every supplied category appears at
 * most once, so public navigation remains complete while taxonomy edits occur.
 */
export function buildPublicCategoryForest<T extends PublicCategoryTreeItem>(categories: T[]): PublicCategoryTreeNode<T>[] {
  const ordered = [...categories].sort(compareCategories);
  const byId = new Map(ordered.map((category) => [category.id, category]));
  const childrenByParent = new Map<string, T[]>();

  for (const category of ordered) {
    if (!category.parent_id || category.parent_id === category.id || !byId.has(category.parent_id)) continue;
    const siblings = childrenByParent.get(category.parent_id) ?? [];
    siblings.push(category);
    childrenByParent.set(category.parent_id, siblings);
  }

  for (const siblings of childrenByParent.values()) siblings.sort(compareCategories);

  const visited = new Set<string>();
  const buildNode = (category: T, ancestry: Set<string>): PublicCategoryTreeNode<T> => {
    visited.add(category.id);
    const nextAncestry = new Set(ancestry);
    nextAncestry.add(category.id);
    const children = (childrenByParent.get(category.id) ?? [])
      .filter((child) => !nextAncestry.has(child.id) && !visited.has(child.id))
      .map((child) => buildNode(child, nextAncestry));
    return { category, children };
  };

  const declaredRoots = ordered.filter((category) =>
    !category.parent_id || category.parent_id === category.id || !byId.has(category.parent_id),
  );
  const forest = declaredRoots.map((root) => buildNode(root, new Set<string>()));

  // A pure cycle has no declared root. Promote each still-unvisited component
  // so malformed taxonomy data can never make a public category disappear.
  for (const category of ordered) {
    if (!visited.has(category.id)) forest.push(buildNode(category, new Set<string>()));
  }

  return forest;
}

export function countPublicCategoryNodes<T extends PublicCategoryTreeItem>(nodes: PublicCategoryTreeNode<T>[]): number {
  return nodes.reduce((total, node) => total + 1 + countPublicCategoryNodes(node.children), 0);
}
