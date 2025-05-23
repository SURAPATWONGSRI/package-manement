import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const session = getSessionCookie(req);

  const isLoggedIn = !!session;
  const pathname = nextUrl.pathname;

  const isAdminRoot = pathname === "/admin";
  const isAdminProtected =
    pathname.startsWith("/admin") && pathname !== "/admin";

  // ✅ ไม่ login แต่พยายามเข้า admin route (ยกเว้น /admin เองที่เป็นหน้า login)
  if (!isLoggedIn && isAdminProtected) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  // ✅ login แล้วแต่เข้าหน้า login -> ส่งไป dashboard
  if (isLoggedIn && isAdminRoot) {
    return NextResponse.redirect(new URL("/admin/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin"],
};
