import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

    const photos = await prisma.contestantPhoto.findMany({
      where: { contestantId: profile.id },
      orderBy: { uploadedAt: "desc" }
    });

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Media GET route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id },
      include: { application: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Block changes after submission
    if (profile.application?.isSubmitted) {
      return NextResponse.json({ error: "Application is submitted. Media modifications locked." }, { status: 400 });
    }

    const { url, publicId, type } = await request.json();

    // If type is profile or full_body, demote existing ones to gallery to maintain uniqueness
    if (type === "profile" || type === "full_body") {
      await prisma.contestantPhoto.updateMany({
        where: {
          contestantId: profile.id,
          type: type
        },
        data: {
          type: "gallery"
        }
      });
    }

    const photo = await prisma.contestantPhoto.create({
      data: {
        contestantId: profile.id,
        url,
        publicId,
        type
      }
    });

    return NextResponse.json(photo);
  } catch (error) {
    console.error("Media POST route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id },
      include: { application: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Block changes after submission
    if (profile.application?.isSubmitted) {
      return NextResponse.json({ error: "Application is submitted. Media modifications locked." }, { status: 400 });
    }

    const urlParams = new URL(request.url).searchParams;
    const photoId = urlParams.get("id");

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID required" }, { status: 400 });
    }

    // Find the photo first to retrieve its public_id for Cloudinary deletion
    const photo = await prisma.contestantPhoto.findUnique({
      where: {
        id: photoId,
        contestantId: profile.id
      }
    });

    if (photo && photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (err) {
        console.error("Failed to delete image from Cloudinary:", err);
      }
    }

    await prisma.contestantPhoto.delete({
      where: {
        id: photoId,
        contestantId: profile.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media DELETE route error:", error);
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
      where: { authUserId: session.user.id },
      include: { application: true }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Block changes after submission
    if (profile.application?.isSubmitted) {
      return NextResponse.json({ error: "Application is submitted. Media modifications locked." }, { status: 400 });
    }

    const { id, type } = await request.json();

    if (type === "profile") {
      // Demote existing profile picture
      await prisma.contestantPhoto.updateMany({
        where: {
          contestantId: profile.id,
          type: "profile"
        },
        data: {
          type: "gallery"
        }
      });

      // Promote target photo
      const updated = await prisma.contestantPhoto.update({
        where: {
          id: id,
          contestantId: profile.id
        },
        data: {
          type: "profile"
        }
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Media PUT route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
