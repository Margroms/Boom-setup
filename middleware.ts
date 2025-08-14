import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/customer")) {
    return NextResponse.next();
  }

  // For now, allow all authenticated routes - in production you'd check a real session
  // Since we're using localStorage for session, we can't check it in middleware
  // We'll rely on client-side guards in the layout components
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/(admin)/(.*)",
    "/kitchen/:path*",
  ],
};


