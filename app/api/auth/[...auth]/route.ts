import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const handler = auth.handler();

function getDeleteCookiesHeaders(request: NextRequest): string[] {
  const hostHeader = request.headers.get("host") || "";
  const domain = hostHeader.split(":")[0];
  
  const cookieNames = [
    // Hyphenated (Correct Neon Auth cookies)
    "__Secure-neon-auth.session_token",
    "__Secure-neon-auth.local.session_data",
    "neon-auth.session_token",
    "neon-auth.local.session_data",
    "__Host-neon-auth.session_token",
    "__Host-neon-auth.local.session_data",
    
    // Underscored (Legacy/Fallback)
    "neon_auth.session_token",
    "neon_auth.session_data",
    "__Secure-neon_auth.session_token",
    "__Secure-neon_auth.session_data",
    "__Host-neon_auth.session_token",
    "__Host-neon_auth.session_data"
  ];

  const deleteHeaders: string[] = [];

  for (const name of cookieNames) {
    // 1. Host-only / default deletion
    deleteHeaders.push(`${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`);
    
    // 2. Custom domain deletions (if host domain is valid/production)
    if (domain && domain !== "localhost" && domain !== "127.0.0.1") {
      deleteHeaders.push(`${name}=; Path=/; Domain=${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`);
      deleteHeaders.push(`${name}=; Path=/; Domain=.${domain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`);
      
      const parts = domain.split(".");
      if (parts.length > 2) {
        const parentDomain = parts.slice(1).join(".");
        deleteHeaders.push(`${name}=; Path=/; Domain=.${parentDomain}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`);
      }
    }
  }

  return deleteHeaders;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<Record<string, string[] | undefined>> }
) {
  const resolvedParams = await context.params;
  const arrayVal = resolvedParams ? (resolvedParams.auth || resolvedParams.path || resolvedParams.all || []) : [];
  const mockParams = {
    auth: arrayVal,
    path: arrayVal,
    all: arrayVal
  };
  const response = await handler.GET(request, { params: Promise.resolve(mockParams) });

  if (arrayVal.includes("sign-out")) {
    const newHeaders = new Headers(response.headers);
    const deleteCookies = getDeleteCookiesHeaders(request);
    for (const cookie of deleteCookies) {
      newHeaders.append("Set-Cookie", cookie);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  return response;
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<Record<string, string[] | undefined>> }
) {
  const resolvedParams = await context.params;
  const arrayVal = resolvedParams ? (resolvedParams.auth || resolvedParams.path || resolvedParams.all || []) : [];
  const mockParams = {
    auth: arrayVal,
    path: arrayVal,
    all: arrayVal
  };
  const response = await handler.POST(request, { params: Promise.resolve(mockParams) });

  if (arrayVal.includes("sign-out")) {
    const newHeaders = new Headers(response.headers);
    const deleteCookies = getDeleteCookiesHeaders(request);
    for (const cookie of deleteCookies) {
      newHeaders.append("Set-Cookie", cookie);
    }
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  }

  return response;
}

