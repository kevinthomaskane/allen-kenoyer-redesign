// Pure auth-routing helpers shared by the middleware (and unit-tested without a
// NextRequest). The middleware matcher scopes execution to `/admin/*`
// (ADR-0006), so these assume an `/admin`-prefixed pathname.

/** Routes under /admin that an unauthenticated visitor must still reach. */
export const PUBLIC_ADMIN_PATHS = [
  "/admin/login",
  "/admin/reset-password",
] as const;

export function isPublicAdminPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

/**
 * Whether an `/admin` request should be redirected to the login page: only when
 * there is no authenticated user and the target isn't itself a public admin
 * route (login / reset-password).
 */
export function shouldRedirectToLogin(
  pathname: string,
  hasUser: boolean,
): boolean {
  if (hasUser) return false;
  return !isPublicAdminPath(pathname);
}
