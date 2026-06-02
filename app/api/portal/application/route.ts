import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ContestantPhoto, NotificationType } from "@prisma/client";

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
        formData: true,
        photos: true
      }
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Return the active application structure, mapping database models
    if (!profile.application && !profile.formData) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      id: profile.application?.id || profile.formData?.id,
      isSubmitted: profile.application?.isSubmitted || false,
      status: profile.application?.status || profile.formData?.status || "pending",
      dateOfBirth: profile.application?.dateOfBirth || null,
      city: profile.application?.city || null,
      country: profile.application?.country || null,
      height: profile.application?.height || null,
      occupation: profile.application?.occupation || null,
      educationLevel: profile.application?.educationLevel || null,
      bio: profile.application?.bio || null,
      photos: profile.photos.map((p: ContestantPhoto) => ({ id: p.id, url: p.url, type: p.type })),
      formData: profile.formData ? {
        personalInfo: profile.formData.personalInfo,
        backgroundInfo: profile.formData.backgroundInfo,
        motivation: profile.formData.motivation,
        achievements: profile.formData.achievements
      } : null,
      updatedAt: profile.application?.updatedAt || profile.formData?.submittedAt
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
      where: { authUserId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Contestant profile not found" }, { status: 404 });
    }

    const body = await request.json();

    // Structuring JSON drafts for ApplicationFormData
    const personalInfo = {
      fullName: body.fullName,
      phone: body.phone,
      city: body.city,
      country: body.country
    };

    const backgroundInfo = {
      educationLevel: body.educationLevel,
      occupation: body.occupation,
      skills: body.skills,
      languages: body.languages,
      height: body.height
    };

    const achievements = {
      personalStory: body.personalStory,
      goals: body.goals
    };

    const formData = await prisma.applicationFormData.upsert({
      where: { userId: profile.id },
      create: {
        userId: profile.id,
        personalInfo,
        backgroundInfo,
        motivation: body.motivationWhy || "",
        achievements,
        status: "pending"
      },
      update: {
        personalInfo,
        backgroundInfo,
        motivation: body.motivationWhy || "",
        achievements
      }
    });

    return NextResponse.json({ success: true, formData });
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
      where: { authUserId: session.user.id }
    });

    if (!profile) {
      return NextResponse.json({ error: "Contestant profile not found" }, { status: 404 });
    }

    const body = await request.json();

    // Validate attributes before locking final submission
    const dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : new Date("2000-01-01");
    const height = parseFloat(body.height) || 0;

    // Check if application already exists and is locked
    const existing = await prisma.contestantApplication.findUnique({
      where: { userId: profile.id }
    });

    if (existing && existing.isSubmitted) {
      return NextResponse.json({ error: "Application is already submitted and locked." }, { status: 400 });
    }

    // 1. Write the main business table
    const application = await prisma.contestantApplication.upsert({
      where: { userId: profile.id },
      create: {
        userId: profile.id,
        bio: body.bio || "",
        dateOfBirth,
        city: body.city || "",
        country: body.country || "Somalia",
        height,
        occupation: body.occupation || "",
        educationLevel: body.educationLevel || "",
        status: "pending",
        isSubmitted: true
      },
      update: {
        bio: body.bio || "",
        dateOfBirth,
        city: body.city || "",
        country: body.country || "Somalia",
        height,
        occupation: body.occupation || "",
        educationLevel: body.educationLevel || "",
        isSubmitted: true
      }
    });

    // 2. Also ensure ApplicationFormData is in sync and set status
    const personalInfo = {
      fullName: body.fullName,
      phone: body.phone,
      city: body.city,
      country: body.country
    };

    const backgroundInfo = {
      educationLevel: body.educationLevel,
      occupation: body.occupation,
      skills: body.skills,
      languages: body.languages,
      height: body.height
    };

    const achievements = {
      personalStory: body.personalStory,
      goals: body.goals
    };

    await prisma.applicationFormData.upsert({
      where: { userId: profile.id },
      create: {
        userId: profile.id,
        personalInfo,
        backgroundInfo,
        motivation: body.motivationWhy || "",
        achievements,
        status: "pending"
      },
      update: {
        personalInfo,
        backgroundInfo,
        motivation: body.motivationWhy || "",
        achievements,
        status: "pending"
      }
    });

    // 3. Create a welcoming notification in-app for the user
    await prisma.notification.create({
      data: {
        userId: profile.id,
        title: "Application Received",
        message: "Your application for Miss Somali 2026 has been successfully received. We are reviewing your qualifications.",
        type: NotificationType.application_update,
        isRead: false
      }
    });

    return NextResponse.json({ success: true, application });
  } catch (error) {
    console.error("Application PUT route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
