import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Extract subdomain from hostname (e.g., "mit" from "mit.queztlearn.in")
  const subdomain =
    hostname.endsWith(".queztlearn.in") && hostname !== "queztlearn.in"
      ? hostname.replace(".queztlearn.in", "")
      : null;

  // Handle main domain (queztlearn.com) - admin and teacher dashboards
  if (hostname === "queztlearn.com" || hostname === "www.queztlearn.com") {
    // If accessing root, redirect to login
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Allow admin, teacher, and login routes
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/login")
    ) {
      return NextResponse.next();
    }

    // For other routes on main domain, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Handle subdomain requests (e.g., mit.queztlearn.in)
  if (hostname.endsWith(".queztlearn.in") && subdomain) {
    const url = new URL(request.url);
    url.searchParams.set("subdomain", subdomain);

    // If accessing root of subdomain, show client homepage
    if (pathname === "/") {
      url.pathname = `/[client]`;
      return NextResponse.rewrite(url);
    }

    // Handle login on subdomain
    if (pathname === "/login") {
      url.pathname = `/[client]/login`;
      return NextResponse.rewrite(url);
    }

    // Handle student routes on subdomain
    if (pathname.startsWith("/student")) {
      url.pathname = `/[client]${pathname}`;
      return NextResponse.rewrite(url);
    }

    // For other routes on subdomain, rewrite to client routes
    url.pathname = `/[client]${pathname}`;
    return NextResponse.rewrite(url);
  }

  // Handle localhost development - simulate subdomain behavior
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // Check if there's a subdomain in the URL
    const url = new URL(request.url);
    const subdomainFromUrl = url.searchParams.get("subdomain");

    if (subdomainFromUrl) {
      // For development, treat localhost with subdomain param as if it's a real subdomain
      // Rewrite to [client] routes just like production
      if (pathname === "/") {
        url.pathname = `/[client]`;
        url.searchParams.set("subdomain", subdomainFromUrl);
        return NextResponse.rewrite(url);
      }
      // Handle login route
      if (pathname === "/login") {
        url.pathname = `/[client]/login`;
        url.searchParams.set("subdomain", subdomainFromUrl);
        return NextResponse.rewrite(url);
      }
      // Handle student routes
      if (pathname.startsWith("/student")) {
        url.pathname = `/[client]${pathname}`;
        url.searchParams.set("subdomain", subdomainFromUrl);
        return NextResponse.rewrite(url);
      }
      // For other routes, rewrite to [client] routes
      url.pathname = `/[client]${pathname}`;
      url.searchParams.set("subdomain", subdomainFromUrl);
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
