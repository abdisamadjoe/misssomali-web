import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType, Status } from "@prisma/client";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { id } = await context.params;

    const application = await prisma.contestantApplication.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            formData: true,
            photos: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Application detail GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { id } = await context.params;
    const { newStatus, notes } = await request.json();

    if (!Object.values(Status).includes(newStatus)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    // Find the application
    const application = await prisma.contestantApplication.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            formData: true,
          },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Update status
    const updatedApplication = await prisma.contestantApplication.update({
      where: { id },
      data: { status: newStatus },
    });

    // If application is approved, let's check if we toggle something or just update the user profile
    // Wait, let's see if formData exists, and update it as well
    if (application.user.formData) {
      await prisma.applicationFormData.update({
        where: { userId: application.userId },
        data: {
          status: newStatus,
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });
    }

    // Map status to action type for logging
    let actionType: ActionType = ActionType.update;
    if (newStatus === Status.approved) {
      actionType = ActionType.approve;
    } else if (newStatus === Status.rejected) {
      actionType = ActionType.reject;
    }

    // Log the action
    await logAdminAction(
      session.user.id,
      actionType,
      TargetType.application,
      id,
      {
        oldStatus: application.status,
        newStatus,
        notes,
      }
    );

    // Also send a system notification to the contestant about their status change
    await prisma.notification.create({
      data: {
        userId: application.userId,
        title: `Application Status Updated: ${newStatus.toUpperCase()}`,
        message: notes || `Your application status has been changed to ${newStatus}.`,
        type: "application_update",
      },
    });

    return NextResponse.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error("Application detail PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
