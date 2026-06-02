import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

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

    return NextResponse.json({
      fullName: profile.fullName,
      phone: profile.phone || "",
      country: profile.country || "",
      email: session.user.email
    });
  } catch (error) {
    console.error("Profile GET route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phone, country } = await request.json();

    let profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id }
    });

    if (profile) {
      profile = await prisma.userProfile.update({
        where: { authUserId: session.user.id },
        data: {
          fullName: fullName || profile.fullName,
          phone: phone || profile.phone,
          country: country || profile.country
        }
      });
    } else {
      profile = await prisma.userProfile.create({
        data: {
          authUserId: session.user.id,
          fullName: fullName || session.user.name || "Contestant",
          phone: phone || "",
          country: country || "Somalia",
          role: "contestant"
        }
      });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile POST route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { data: session } = await auth.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phone, country } = await request.json();

    const profile = await prisma.userProfile.update({
      where: { authUserId: session.user.id },
      data: {
        fullName,
        phone,
        country
      }
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Profile PUT route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
