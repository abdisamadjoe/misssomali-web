import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType, Status, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status"); // e.g., approved or shortlisted

    const where: Prisma.ContestantApplicationWhereInput = {
      status: {
        in: [Status.approved, Status.shortlisted],
      },
    };

    if (statusFilter && Object.values(Status).includes(statusFilter as Status)) {
      where.status = statusFilter as Status;
    }

    const contestants = await prisma.contestantApplication.findMany({
      where,
      orderBy: { appliedAt: "desc" },
      include: {
        user: {
          include: {
            photos: true,
          },
        },
      },
    });

    return NextResponse.json(contestants);
  } catch (error) {
    console.error("Contestants GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { applicationId, newStatus } = await request.json();

    if (!applicationId || !newStatus || !Object.values(Status).includes(newStatus)) {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    const application = await prisma.contestantApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updatedApplication = await prisma.contestantApplication.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    // Sync formData status if exists
    await prisma.applicationFormData.updateMany({
      where: { userId: application.userId },
      data: { status: newStatus },
    });

    // Log the change
    await logAdminAction(
      session.user.id,
      ActionType.update,
      TargetType.contestant,
      application.userId,
      {
        applicationId,
        oldStatus: application.status,
        newStatus,
      }
    );

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("Contestants PUT API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
