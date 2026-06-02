import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType } from "@prisma/client";

export async function GET() {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const events = await prisma.event.findMany({
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Admin Events GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { title, description, location, eventDate, coverImage, isPublished } = await request.json();

    if (!title || !description || !location || !eventDate || !coverImage) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    const newEvent = await prisma.event.create({
      data: {
        title,
        description,
        location,
        eventDate: new Date(eventDate),
        coverImage,
        isPublished: isPublished ?? false,
      },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.publish,
      TargetType.event,
      newEvent.id,
      { title, eventDate }
    );

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("Admin Events POST API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const { id, title, description, location, eventDate, coverImage, isPublished } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title !== undefined ? title : existingEvent.title,
        description: description !== undefined ? description : existingEvent.description,
        location: location !== undefined ? location : existingEvent.location,
        eventDate: eventDate !== undefined ? new Date(eventDate) : existingEvent.eventDate,
        coverImage: coverImage !== undefined ? coverImage : existingEvent.coverImage,
        isPublished: isPublished !== undefined ? isPublished : existingEvent.isPublished,
      },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.update,
      TargetType.event,
      id,
      { title: updatedEvent.title, eventDate: updatedEvent.eventDate }
    );

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Admin Events PUT API error:", error);
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
      return NextResponse.json({ error: "Event ID required" }, { status: 400 });
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id },
    });

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id },
    });

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.delete,
      TargetType.event,
      id,
      { title: existingEvent.title }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Events DELETE API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
