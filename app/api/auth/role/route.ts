import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Retrieve the session from Neon Auth using request headers
    const session = await auth.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Lookup the user profile matching the Neon Auth unique user ID
    let profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id },
    });

    // Auto-create a UserProfile record if it doesn't exist yet
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: {
          authUserId: session.user.id,
          fullName: session.user.name || "Contestant",
          phone: "",
          country: "Somalia",
          role: "contestant",
        },
      });
    }

    return NextResponse.json({
      authenticated: true,
      authUserId: session.user.id,
      email: session.user.email,
      fullName: profile.fullName,
      role: profile.role,
      profileId: profile.id,
    });
  } catch (error) {
    console.error("Auth role endpoint error:", error);
    return NextResponse.json({ authenticated: false, error: "Internal server error" }, { status: 500 });
  }
}
