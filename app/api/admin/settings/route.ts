import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { verifyAdmin, logAdminAction } from "@/lib/admin-auth";
import { ActionType, TargetType } from "@prisma/client";

const getSettingsPath = () => path.join(process.cwd(), "lib", "settings.json");

export async function GET() {
  try {
    const { error, status } = await verifyAdmin();
    if (error) {
      return NextResponse.json({ error }, { status });
    }

    const settingsPath = getSettingsPath();
    const fileContent = await fs.readFile(settingsPath, "utf-8");
    const settings = JSON.parse(fileContent);

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Admin Settings GET API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, status, session } = await verifyAdmin();
    if (error || !session) {
      return NextResponse.json({ error }, { status: status || 401 });
    }

    const newSettings = await request.json();

    if (newSettings.applicationOpen === undefined || !newSettings.finaleDate || newSettings.registrationLimit === undefined) {
      return NextResponse.json({ error: "Missing required settings fields" }, { status: 400 });
    }

    const settingsPath = getSettingsPath();
    await fs.writeFile(settingsPath, JSON.stringify(newSettings, null, 2), "utf-8");

    // Log action
    await logAdminAction(
      session.user.id,
      ActionType.update,
      TargetType.application,
      "settings",
      newSettings
    );

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error) {
    console.error("Admin Settings POST API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
