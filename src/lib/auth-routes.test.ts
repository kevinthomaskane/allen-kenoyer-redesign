import { describe, expect, it } from "vitest";

import { isPublicAdminPath, shouldRedirectToLogin } from "./auth-routes";

describe("isPublicAdminPath", () => {
  it("treats login and reset-password as public", () => {
    expect(isPublicAdminPath("/admin/login")).toBe(true);
    expect(isPublicAdminPath("/admin/reset-password")).toBe(true);
  });

  it("treats the dashboard and content routes as non-public", () => {
    expect(isPublicAdminPath("/admin")).toBe(false);
    expect(isPublicAdminPath("/admin/classes")).toBe(false);
    expect(isPublicAdminPath("/admin/bulletins")).toBe(false);
  });
});

describe("shouldRedirectToLogin", () => {
  it("redirects an unauthenticated request to a protected route", () => {
    expect(shouldRedirectToLogin("/admin", false)).toBe(true);
    expect(shouldRedirectToLogin("/admin/classes", false)).toBe(true);
  });

  it("does not redirect unauthenticated requests to login or reset-password", () => {
    expect(shouldRedirectToLogin("/admin/login", false)).toBe(false);
    expect(shouldRedirectToLogin("/admin/reset-password", false)).toBe(false);
  });

  it("never redirects an authenticated request", () => {
    expect(shouldRedirectToLogin("/admin", true)).toBe(false);
    expect(shouldRedirectToLogin("/admin/classes", true)).toBe(false);
  });
});
