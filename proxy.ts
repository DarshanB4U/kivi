import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const decoded = token ? (await verifyToken(token) as any) : null;

  const isCreatorRoute = req.nextUrl.pathname.startsWith("/creator");
  const isStudentRoute = req.nextUrl.pathname.startsWith("/student");

  if ((isCreatorRoute || isStudentRoute) && !decoded) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (isCreatorRoute && decoded?.role !== "CREATOR") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (isStudentRoute && decoded?.role !== "STUDENT") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/creator/:path*", "/student/:path*"],
};

