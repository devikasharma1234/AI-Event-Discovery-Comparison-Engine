import { googleAuthConfigured, handlers } from "../../../../auth";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  return googleAuthConfigured ? handlers.GET(request) : unavailable();
}

export function POST(request: NextRequest) {
  return googleAuthConfigured ? handlers.POST(request) : unavailable();
}

function unavailable() {
  return Response.json({ error: "Google sign-in is not configured." }, { status: 503 });
}
