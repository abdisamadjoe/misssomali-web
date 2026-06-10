import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ContestantPhoto } from "@prisma/client";

// Reusable application number generator format: MS-2026-XXXX
async function generateApplicationNumber(): Promise<string> {
  let attempts = 0;
  while (attempts < 10) {
    const count = await prisma.contestantApplication.count();
    const appNum = `MS-2026-${String(count + 1 + attempts).padStart(4, '0')}`;
    const exists = await prisma.contestantApplication.findUnique({
      where: { applicationNumber: appNum }
    });
    if (!exists) {
      return appNum;
    }
    attempts++;
  }
  return `MS-2026-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function GET() {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id },
      include: {
        application: true,
        photos: true
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Return null if no application is registered yet
    if (!profile.application) {
      return NextResponse.json(null);
    }

    const app = profile.application;

    // Return unified backward-compatible schema structure
    return NextResponse.json({
      id: app.id,
      isSubmitted: app.isSubmitted,
      status: app.status,
      dateOfBirth: app.dateOfBirth ? app.dateOfBirth.toISOString().split("T")[0] : null,
      city: app.city,
      country: app.country,
      height: app.height,
      occupation: app.occupation,
      educationLevel: app.educationLevel,
      bio: app.bio,
      applicationNumber: app.applicationNumber,
      photos: profile.photos.map((p: ContestantPhoto) => ({ id: p.id, url: p.url, type: p.type })),
      fullName: app.fullName || "",
      phone: app.phone || "",
      skills: app.skills || "",
      languages: app.languages || "",
      motivationWhy: app.motivationWhy || "",
      personalStory: app.personalStory || "",
      goals: app.goals || "",
      formData: {
        personalInfo: {
          fullName: app.fullName || "",
          phone: app.phone || "",
          city: app.city || "",
          country: app.country || "Somalia"
        },
        backgroundInfo: {
          educationLevel: app.educationLevel || "",
          occupation: app.occupation || "",
          skills: app.skills || "",
          languages: app.languages || "",
          height: app.height ? app.height.toString() : ""
        },
        motivation: app.motivationWhy || "",
        achievements: {
          personalStory: app.personalStory || "",
          goals: app.goals || ""
        }
      },
      updatedAt: app.updatedAt
    });
  } catch (error) {
    console.error("Application GET route error:", error);
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
      return NextResponse.json({ error: "Contestant profile not found" }, { status: 404 });
    }

    // Enforce single application constraint
    if (profile.application) {
      return NextResponse.json(profile.application);
    }

    const applicationNumber = await generateApplicationNumber();

    const application = await prisma.contestantApplication.create({
      data: {
        userId: profile.id,
        applicationNumber,
        status: "draft",
        bio: "",
        city: "",
        country: "Somalia",
        educationLevel: "",
        occupation: "",
        height: 0,
        dateOfBirth: new Date("2000-01-01"),
      }
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Application POST route error:", error);
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
      return NextResponse.json({ error: "Contestant profile not found" }, { status: 404 });
    }

    if (!profile.application) {
      return NextResponse.json({ error: "Application draft not found. Please initialize first." }, { status: 404 });
    }

    // Only allow editing when status is DRAFT
    if (profile.application.status !== "draft" || profile.application.isSubmitted) {
      return NextResponse.json({ error: "Application is already submitted and locked." }, { status: 400 });
    }

    const body = await request.json();
    const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : null;
    const height = body.height ? parseFloat(body.height) : null;

    const updated = await prisma.contestantApplication.update({
      where: { id: profile.application.id },
      data: {
        fullName: body.fullName ?? null,
        phone: body.phone ?? null,
        city: body.city ?? null,
        country: body.country ?? null,
        dateOfBirth,
        educationLevel: body.educationLevel ?? null,
        occupation: body.occupation ?? null,
        height,
        skills: body.skills ?? null,
        languages: body.languages ?? null,
        motivationWhy: body.motivationWhy ?? null,
        personalStory: body.personalStory ?? null,
        goals: body.goals ?? null,
        bio: body.bio ?? null,
      }
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error) {
    console.error("Application PUT route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
