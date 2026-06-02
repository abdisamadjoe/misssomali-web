import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

const handler = auth.handler();

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handler.GET(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handler.POST(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handler.PUT(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handler.DELETE(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handler.PATCH(request, context);
}
