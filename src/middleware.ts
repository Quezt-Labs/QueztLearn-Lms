import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Extract subdomain from hostname (e.g., "mit" from "mit.queztlearn.com")
  const subdomain =
    hostname.endsWith(".queztlearn.com") && hostname !== "queztlearn.com"
      ? hostname.replace(".queztlearn.com", "")
      : null;

  // Handle Vercel domain with path-based subdomains FIRST (e.g., quezt-learn-lms.vercel.app/{client}/login)
  if (
    hostname === "quezt-learn-lms.vercel.app" &&
    pathname.startsWith("/") &&
    pathname.length > 1 &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/teacher") &&
    !pathname.startsWith("/login")
  ) {
    const url = new URL(request.url);
    const subdomainPath = pathname.substring(1); // Remove leading slash
    const pathParts = subdomainPath.split("/");
    const clientSubdomain = pathParts[0]; // Dynamic client subdomain
    const remainingPath = pathParts.slice(1).join("/"); // "login" or "student/dashboard"

    url.searchParams.set("subdomain", clientSubdomain);

    if (remainingPath === "") {
      // Root of subdomain
      url.pathname = `/[client]`;
      return NextResponse.rewrite(url);
    } else if (remainingPath === "login") {
      // Login on subdomain
      url.pathname = `/[client]/login`;
      return NextResponse.rewrite(url);
    } else if (remainingPath.startsWith("student")) {
      // Student routes on subdomain
      url.pathname = `/[client]/${remainingPath}`;
      return NextResponse.rewrite(url);
    } else {
      // Other routes on subdomain
      url.pathname = `/[client]/${remainingPath}`;
      return NextResponse.rewrite(url);
    }
  }

  // Handle main domain (queztlearn.com) - admin and teacher dashboards
  if (
    hostname === "queztlearn.com" ||
    hostname === "www.queztlearn.com" ||
    hostname === "quezt-learn-lms.vercel.app"
  ) {
    // Allow admin, teacher, login, and root routes
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/teacher") ||
      pathname.startsWith("/login") ||
      pathname === "/"
    ) {
      return NextResponse.next();
    }

    // For other routes on main domain, show homepage
    return NextResponse.next();
  }

  // Handle subdomain requests (e.g., mit.queztlearn.com)
  if (hostname.endsWith(".queztlearn.com") && subdomain) {
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
