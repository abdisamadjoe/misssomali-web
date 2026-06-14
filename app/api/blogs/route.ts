import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const blogs = await prisma.blog.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 3,
    });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Public Blogs GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
