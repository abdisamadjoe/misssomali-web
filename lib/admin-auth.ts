import { auth } from "./auth";
import { prisma } from "./db";
import { ActionType, TargetType } from "@prisma/client";

export async function verifyAdmin() {
  const { data: session } = await auth.getSession();
  if (!session) {
    return { error: "Unauthorized", status: 401, session: null, profile: null };
  }
  const profile = await prisma.userProfile.findUnique({
    where: { authUserId: session.user.id }
  });
  if (!profile || profile.role !== "admin") {
    return { error: "Forbidden", status: 403, session, profile: null };
  }
  return { error: null, status: 200, session, profile };
}

export async function logAdminAction(
  adminAuthUserId: string,
  actionType: ActionType,
  targetType: TargetType,
  targetId: string,
  metadata?: Record<string, unknown> | null
) {
  try {
    return await prisma.auditLog.create({
      data: {
        adminAuthUserId,
        actionType,
        targetType,
        targetId,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
}
