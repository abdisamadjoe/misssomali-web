import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NotificationType } from "@prisma/client";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let notifications = await prisma.notification.findMany({
      where: { userId: profile.id },
      orderBy: { createdAt: "desc" }
    });

    // Seed default inbox announcements if empty
    if (notifications.length === 0) {
      const seeded = [
        {
          userId: profile.id,
          title: "Welcome to Miss Somali Portal",
          message: "Marhaban! Thank you for registering for the Miss Somali 2026 Pageant. Complete your wizard attributes to officially submit your candidate file.",
          type: NotificationType.system,
          isRead: false
        },
        {
          userId: profile.id,
          title: "Required Photo Standards",
          message: "Please ensure your portraits are taken against neutral backgrounds with clear lighting. Profile and full-body files are mandatory guidelines.",
          type: NotificationType.event,
          isRead: false
        }
      ];

      await prisma.notification.createMany({
        data: seeded
      });

      notifications = await prisma.notification.findMany({
        where: { userId: profile.id },
        orderBy: { createdAt: "desc" }
      });
    }

    return NextResponse.json(notifications);
  } catch (error) {
    console.error("Notifications GET route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const { id, isRead, all } = await request.json();

    if (all) {
      await prisma.notification.updateMany({
        where: { userId: profile.id },
        data: { isRead: true }
      });
      return NextResponse.json({ success: true });
    }

    if (!id) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    const updated = await prisma.notification.update({
      where: {
        id,
        userId: profile.id
      },
      data: {
        isRead: isRead ?? true
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Notifications PUT route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
