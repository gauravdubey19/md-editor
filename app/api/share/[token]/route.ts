import { NextRequest, NextResponse } from "next/server";
import { getSharedContext, checkRateLimit } from "@/lib/services/share-service";

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required." }, { status: 400 });
    }

    // Rate Limiting on reads
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const rateLimit = await checkRateLimit(ip, "view", 120, 60);

    if (!rateLimit.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please slow down." }, { status: 429 });
    }

    const data = await getSharedContext(token);

    if (!data) {
      return NextResponse.json(
        {
          error: "This share link has expired or does not exist.",
          code: "EXPIRED_OR_NOT_FOUND",
        },
        { status: 410 },
      );
    }

    return NextResponse.json({
      success: true,
      context: data,
    });
  } catch (error) {
    console.error("Error retrieving shared context:", error);
    return NextResponse.json({ error: "Failed to load shared document." }, { status: 500 });
  }
}
