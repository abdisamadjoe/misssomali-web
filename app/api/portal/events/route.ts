import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let events = await prisma.event.findMany({
      orderBy: { eventDate: "asc" }
    });

    // Seed events if empty to make sure the calendar shows upcoming schedule
    if (events.length === 0) {
      // Calculate future dates (e.g., 10 days and 30 days from now)
      const date1 = new Date();
      date1.setDate(date1.getDate() + 10);
      date1.setHours(14, 0, 0, 0);

      const date2 = new Date();
      date2.setDate(date2.getDate() + 30);
      date2.setHours(19, 0, 0, 0);

      const seeded = [
        {
          title: "Preliminary Interview & Orientation",
          description: "Virtual orientation round introducing candidates, reviewing code requirements, and discussing presentation expectations.",
          location: "Zoom Video Conference",
          eventDate: date1,
          coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600",
          isPublished: true
        },
        {
          title: "Miss Somali 2026 Grand Stage Finals",
          description: "Live televised event. Cultural runway presentation, final jury panel interviews, and official crown ceremony.",
          location: "Mogadishu National Hall",
          eventDate: date2,
          coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600",
          isPublished: true
        }
      ];

      await prisma.event.createMany({
        data: seeded
      });

      events = await prisma.event.findMany({
        orderBy: { eventDate: "asc" }
      });
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error("Events GET route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
