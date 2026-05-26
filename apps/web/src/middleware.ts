import { NextRequest, NextResponse } from "next/server";
const PROTECTED = ["/upload","/results","/profile","/onboarding"];
const AUTH_ONLY = ["/auth/login","/auth/register"];
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("access_token")?.value;
  if(token && AUTH_ONLY.some(r=>pathname.startsWith(r))) return NextResponse.redirect(new URL("/results", req.url));
  if(!token && PROTECTED.some(r=>pathname.startsWith(r))) { const u = new URL("/auth/login", req.url); u.searchParams.set("redirect",pathname); return NextResponse.redirect(u); }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|share/|api/).*)"] };