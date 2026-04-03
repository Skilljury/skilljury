import { NextResponse } from "next/server";

import { AppError } from "@/lib/errors/appError";

export function routeErrorResponse(
  error: unknown,
  {
    context,
    fallbackMessage,
  }: {
    context: string;
    fallbackMessage: string;
  },
) {
  if (error instanceof AppError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  console.error(`[SkillJury:${context}]`, error);

  return NextResponse.json({ error: fallbackMessage }, { status: 500 });
}
