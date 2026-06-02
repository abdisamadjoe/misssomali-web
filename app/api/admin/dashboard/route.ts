import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin } from "@/lib/admin-auth";

export async function GET() {
  try {
    // 1. Authorize user as Admin
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    // 2. Fetch counts
    const totalContestants = await prisma.userProfile.count({
      where: { role: "contestant" },
    });

    const applications = await prisma.contestantApplication.findMany({
      select: {
        status: true,
        country: true,
      },
    });

    const totalApplications = applications.length;
    const pendingCount = applications.filter((a) => a.status === "pending").length;
    const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
    const approvedCount = applications.filter((a) => a.status === "approved").length;
    const rejectedCount = applications.filter((a) => a.status === "rejected").length;

    // 3. Country distribution
    const countryCounts: Record<string, number> = {};
    applications.forEach((app) => {
      const country = app.country || "Unknown";
      countryCounts[country] = (countryCounts[country] || 0) + 1;
    });

    const countryBreakdown = Object.entries(countryCounts).map(([country, count]) => ({
      country,
      count,
    }));

    // 4. Recent applications
    const recentApplications = await prisma.contestantApplication.findMany({
      take: 5,
      orderBy: { appliedAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
            phone: true,
          },
        },
      },
    });

    // 5. Recent audit logs
    const recentLogs = await prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      metrics: {
        totalContestants,
        totalApplications,
        pendingCount,
        shortlistedCount,
        approvedCount,
        rejectedCount,
      },
      countryBreakdown,
      recentApplications,
      recentLogs,
    });
  } catch (error) {
    console.error("Dashboard stats API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
