import { NextRequest, NextResponse } from "next/server";

import { getCurrentViewer } from "@/lib/auth/session";
import { AppError } from "@/lib/errors/appError";
import { routeErrorResponse } from "@/lib/errors/routeError";
import { applyModerationAction } from "@/lib/moderation/queue";

type ModerationRequestBody = {
  action?: "approve" | "reject" | "escalate";
  decisionNotes?: string | null;
  queueItemId?: number;
};

export async function POST(request: NextRequest) {
  try {
    const viewer = await getCurrentViewer();

    if (!viewer.user) {
      throw new AppError(401, "You must sign in as a moderator.", "unauthorized");
    }

    if (!viewer.profile || !["admin", "moderator"].includes(viewer.profile.role)) {
      throw new AppError(403, "Moderator access is required.", "forbidden");
    }

    let body: ModerationRequestBody;
    try {
      body = (await request.json()) as ModerationRequestBody;
    } catch {
      throw new AppError(400, "Invalid JSON in request body.", "invalid_json");
    }

    if (!body.action || typeof body.queueItemId !== "number") {
      throw new AppError(400, "Queue item and action are required.", "invalid_payload");
    }

    await applyModerationAction({
      action: body.action,
      actorUserId: viewer.user.id,
      decisionNotes: body.decisionNotes ?? null,
      queueItemId: body.queueItemId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeErrorResponse(error, {
      context: "moderation-action",
      fallbackMessage: "Moderation update failed.",
    });
  }
}
