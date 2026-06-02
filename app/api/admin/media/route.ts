import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType, MediaType, MediaCategory, Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where: Prisma.MediaGalleryWhereInput = {};
    if (category && Object.values(MediaCategory).includes(category as MediaCategory)) {
      where.category = category as MediaCategory;
    }

    const mediaItems = await prisma.mediaGallery.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(mediaItems);
  } catch (error) {
    console.error("Admin Media GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { title, url, type, category, isPublished } = await request.json();

    if (!title || !url || !type || !category) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (!Object.values(MediaType).includes(type)) {
      return NextResponse.json({ error: "Invalid media type" }, { status: 400 });
    }

    if (!Object.values(MediaCategory).includes(category)) {
      return NextResponse.json({ error: "Invalid media category" }, { status: 400 });
    }

    const newMedia = await prisma.mediaGallery.create({
      data: {
        title,
        url,
        type,
        category,
        isPublished: isPublished ?? false,
      },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.publish,
      TargetType.media,
      newMedia.id,
      { title, category }
    );

    return NextResponse.json(newMedia);
  } catch (error) {
    console.error("Admin Media POST API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Media ID required" }, { status: 400 });
    }

    const mediaItem = await prisma.mediaGallery.findUnique({
      where: { id },
    });

    if (!mediaItem) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    await prisma.mediaGallery.delete({
      where: { id },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.delete,
      TargetType.media,
      id,
      { title: mediaItem.title, category: mediaItem.category }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Media DELETE API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { id, isPublished } = await request.json();

    if (!id || isPublished === undefined) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const mediaItem = await prisma.mediaGallery.findUnique({
      where: { id },
    });

    if (!mediaItem) {
      return NextResponse.json({ error: "Media item not found" }, { status: 404 });
    }

    const updated = await prisma.mediaGallery.update({
      where: { id },
      data: { isPublished },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.update,
      TargetType.media,
      id,
      { title: mediaItem.title, isPublished }
    );

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin Media PUT API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
