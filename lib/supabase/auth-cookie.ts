type CookieNameLike = { name: string };

export function hasSupabaseAuthCookie(cookies: readonly CookieNameLike[]) {
  return cookies.some(({ name }) => name.startsWith('sb-') && name.includes('-auth-token'));
}
