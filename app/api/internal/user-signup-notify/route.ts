import { NextRequest, NextResponse } from "next/server";

const WEBHOOK_SECRET = process.env.SIGNUP_WEBHOOK_SECRET ?? "";

type SignupPayload = {
  record?: {
    email?: string;
    created_at?: string;
    raw_user_meta_data?: Record<string, string>;
  };
};

const SKIP_PATTERNS = [
  "mailinator",
  "example.com",
  "e2e",
  "test-",
  "guerrillamail",
  "tempmail",
  "throwaway",
];

function isTestEmail(email: string): boolean {
  const lower = email.toLowerCase();
  return SKIP_PATTERNS.some((pattern) => lower.includes(pattern));
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (!WEBHOOK_SECRET || !secret || secret !== WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SignupPayload;
  try {
    payload = (await req.json()) as SignupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const record = payload.record;
  const email = record?.email;
  const createdAt = record?.created_at;
  const name = record?.raw_user_meta_data?.full_name ??
    record?.raw_user_meta_data?.display_name ??
    record?.raw_user_meta_data?.name ??
    "Unknown";

  if (!email) {
    return NextResponse.json({ skipped: true, reason: "no email" });
  }

  if (isTestEmail(email)) {
    return NextResponse.json({ skipped: true, reason: "test account" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "jmanav2000@gmail.com";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://skilljury.com";

  if (RESEND_API_KEY) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "SkilJury <onboarding@resend.dev>",
          to: [NOTIFY_EMAIL],
          subject: `New user signed up: ${email}`,
          html: [
            "<h2>New user on SkilJury!</h2>",
            `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
            `<p><strong>Name:</strong> ${escapeHtml(name)}</p>`,
            `<p><strong>Signed up:</strong> ${createdAt ? new Date(createdAt).toLocaleString() : "just now"}</p>`,
            `<p><a href="${siteUrl}">View SkilJury</a></p>`,
          ].join("\n"),
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "unknown");
        console.error(
          `[signup-notify] Resend API error: ${response.status} ${errorBody}`,
        );
      }
    } catch (err) {
      console.error("[signup-notify] Failed to send email:", err);
    }
  } else {
    console.log(
      `[NEW USER SIGNUP] email=${email} name=${name} at=${createdAt ?? "now"}`,
    );
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
