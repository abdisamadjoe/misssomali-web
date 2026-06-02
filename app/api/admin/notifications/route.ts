import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType, NotificationType } from "@prisma/client";

export async function GET() {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    // Retrieve recent notifications sent to contestants (limit to 50)
    const notifications = await prisma.notification.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            fullName: true,
          },
        },
      },
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Admin Notifications GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { target, title, message, type } = await request.json();

    if (!target || !title || !message || !type) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (!Object.values(NotificationType).includes(type)) {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    let createdCount = 0;

    if (target === "all") {
      // Broadcast to all contestants
      const contestants = await prisma.userProfile.findMany({
        where: { role: "contestant" },
        select: { id: true },
      });

      if (contestants.length > 0) {
        const notificationData = contestants.map((c) => ({
          userId: c.id,
          title,
          message,
          type: type as NotificationType,
        }));

        await prisma.notification.createMany({
          data: notificationData,
        });
        createdCount = contestants.length;
      }

      // Log action
      await logAdminAction(
        session.user.id,
        ActionType.update,
        TargetType.contestant,
        "broadcast",
        { title, type, targetCount: createdCount }
      );
    } else {
      // Targeted notification
      const userProfile = await prisma.userProfile.findUnique({
        where: { id: target },
      });

      if (!userProfile) {
        return NextResponse.json({ error: "Contestant profile not found" }, { status: 404 });
      }

      const notification = await prisma.notification.create({
        data: {
          userId: target,
          title,
          message,
          type: type as NotificationType,
        },
      });
      createdCount = 1;

      // Log action
      await logAdminAction(
        session.user.id,
        ActionType.update,
        TargetType.contestant,
        target,
        { title, type, notificationId: notification.id }
      );
    }

    return NextResponse.json({ success: true, count: createdCount });
  } catch (error) {
    console.error("Admin Notifications POST API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
