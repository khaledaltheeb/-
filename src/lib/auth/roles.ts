export const APP_ROLES = [
  "owner",
  "admin",
  "editor",
  "scientific_reviewer",
  "seo_manager",
  "specialist",
  "center_manager",
  "user",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ADMIN_ROLES: readonly AppRole[] = ["owner", "admin"];
export const CONTENT_ROLES: readonly AppRole[] = ["owner", "admin", "editor", "scientific_reviewer", "seo_manager", "specialist"];
