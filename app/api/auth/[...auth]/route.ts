import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const handler = auth.handler();

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
  return handler.GET(request, { params: Promise.resolve(mockParams) });
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
  return handler.POST(request, { params: Promise.resolve(mockParams) });
}
