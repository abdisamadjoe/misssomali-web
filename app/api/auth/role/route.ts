import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  };

  try {
    // Retrieve the session from Neon Auth
    const { data: session } = await auth.getSession();

    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401, headers: noCacheHeaders }
      );
    }

    // Lookup the user profile matching the Neon Auth unique user ID
    let profile = await prisma.userProfile.findUnique({
      where: { authUserId: session.user.id },
      include: {
        photos: {
          where: { type: "profile" },
          take: 1
        }
      }
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
        include: {
          photos: {
            where: { type: "profile" },
            take: 1
          }
        }
      });
    }

    return NextResponse.json(
      {
        authenticated: true,
        authUserId: session.user.id,
        email: session.user.email,
        fullName: profile.fullName,
        role: profile.role,
        profileId: profile.id,
        profilePhotoUrl: profile.photos?.[0]?.url || "",
      },
      { headers: noCacheHeaders }
    );
  } catch (error) {
    console.error("Auth role endpoint error:", error);
    return NextResponse.json(
      { authenticated: false, error: "Internal server error" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
