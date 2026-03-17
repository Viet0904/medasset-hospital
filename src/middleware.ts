import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Admin-only routes
    const adminRoutes = ["/users", "/audit-log"];
    if (adminRoutes.some((r) => pathname.startsWith(r)) && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Manager+ routes
    const managerRoutes = ["/assets/new", "/checkout", "/categories", "/locations", "/manufacturers", "/reports", "/maintenance"];
    if (managerRoutes.some((r) => pathname.startsWith(r)) && !["ADMIN", "MANAGER"].includes(token?.role as string)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
