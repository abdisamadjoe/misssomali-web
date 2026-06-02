import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";
import { Prisma, Status } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const statusFilter = searchParams.get("status");
    const country = searchParams.get("country");
    const search = searchParams.get("search");

    const skip = (page - 1) * limit;

    const where: Prisma.ContestantApplicationWhereInput = {};

    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter as Status;
    }
    if (country && country !== "all") {
      where.country = country;
    }
    if (search) {
      where.user = {
        fullName: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    // Fetch applications and total count
    const [applications, total] = await prisma.$transaction([
      prisma.contestantApplication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { appliedAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              role: true,
            },
          },
        },
      }),
      prisma.contestantApplication.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Applications API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
