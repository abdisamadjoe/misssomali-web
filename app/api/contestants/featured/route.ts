import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Status } from "@prisma/client";

export async function GET() {
  try {
    // 1. Fetch approved contestants
    let contestants = await prisma.contestantApplication.findMany({
      where: {
        status: Status.approved,
      },
      orderBy: { appliedAt: "desc" },
      include: {
        user: {
          include: {
            photos: true,
          },
        },
      },
    });

    // 2. If no approved contestants exist, fallback to shortlisted, pending or submitted for preview
    if (contestants.length === 0) {
      contestants = await prisma.contestantApplication.findMany({
        where: {
          status: {
            in: [Status.shortlisted, Status.pending, Status.submitted],
          },
        },
        orderBy: { appliedAt: "desc" },
        include: {
          user: {
            include: {
              photos: true,
            },
          },
        },
      });
    }

    // 3. Format the response
    const formatted = contestants.map((c) => {
      const profilePhoto = c.user.photos.find((p) => p.type === "profile");
      return {
        id: c.id,
        fullName: c.fullName || c.user.fullName,
        photoUrl: profilePhoto ? profilePhoto.url : null,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Public GET /api/contestants/featured error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
