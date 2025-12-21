import { NextRequest, NextResponse } from "next/server";

function isStatic(pathname: string) {
  return (
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".map") ||
    pathname.endsWith(".ico")
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // No loguear assets
  if (isStatic(pathname)) return NextResponse.next();

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = new Date().toISOString();

  console.log(`[VISIT] ${now} - IP: ${ip} - URL: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
