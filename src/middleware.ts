import { NextRequest, NextResponse } from "next/server";

const reported = new Set<string>();
const originOnly = (value: string | null) => {
  try { return value ? new URL(value).origin : "absent"; }
  catch { return "invalid"; }
};

export function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === "development" && request.method === "OPTIONS") {
    const origin = originOnly(request.headers.get("origin"));
    if (origin !== "absent" && origin !== request.nextUrl.origin) {
      const diagnostic = {
        pathname: request.nextUrl.pathname.slice(0, 240),
        origin,
        refererOrigin: originOnly(request.headers.get("referer")),
        fetchSite: ["same-origin", "same-site", "cross-site", "none"].includes(request.headers.get("sec-fetch-site") ?? "") ? request.headers.get("sec-fetch-site") : "unspecified",
        requestedMethod: /^[A-Z]{3,12}$/.test(request.headers.get("access-control-request-method") ?? "") ? request.headers.get("access-control-request-method") : "unspecified",
      };
      const key = JSON.stringify(diagnostic);
      if (reported.size < 5 && !reported.has(key)) {
        reported.add(key);
        console.info("[Orbital dev] Cross-origin API preflight received", diagnostic);
      }
    }
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
