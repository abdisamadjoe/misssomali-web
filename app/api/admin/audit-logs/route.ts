import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const skip = (page - 1) * limit;

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count(),
    ]);

    // Fetch admin names in memory
    const adminAuthUserIds = Array.from(new Set(logs.map((log) => log.adminAuthUserId)));
    const profiles = await prisma.userProfile.findMany({
      where: {
        authUserId: {
          in: adminAuthUserIds,
        },
      },
      select: {
        authUserId: true,
        fullName: true,
      },
    });

    const adminNameMap = new Map(profiles.map((p) => [p.authUserId, p.fullName]));

    const enrichedLogs = logs.map((log) => ({
      ...log,
      adminName: adminNameMap.get(log.adminAuthUserId) || "System / Unknown",
    }));

    return NextResponse.json({
      logs: enrichedLogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Audit Logs API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
