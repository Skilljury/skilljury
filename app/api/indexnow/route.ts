import { NextRequest, NextResponse } from "next/server";

import { routeErrorResponse } from "@/lib/errors/routeError";
import { submitIndexNow } from "@/lib/indexnow";

type IndexNowRequestBody = {
  urls?: unknown;
};

function getInternalSecret() {
  return process.env.INTERNAL_SECRET?.trim() ?? "";
}

export async function POST(request: NextRequest) {
  const expectedSecret = getInternalSecret();

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "IndexNow is not configured for this environment." },
      { status: 503 },
    );
  }

  if (request.headers.get("x-internal-secret") !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: IndexNowRequestBody;
  try {
    body = (await request.json()) as IndexNowRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!Array.isArray(body.urls) || !body.urls.every((url) => typeof url === "string")) {
    return NextResponse.json(
      { error: "urls must be an array of strings" },
      { status: 400 },
    );
  }

  try {
    await submitIndexNow(body.urls);
    return NextResponse.json({ success: true, submitted: body.urls.length });
  } catch (error) {
    return routeErrorResponse(error, {
      context: "indexnow",
      fallbackMessage: "IndexNow submission failed.",
    });
  }
}
