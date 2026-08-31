import { NextRequest, NextResponse } from "next/server";
import { createSharedContext, checkRateLimit } from "@/lib/services/share-service";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
    const rateLimit = await checkRateLimit(ip, "create", 30, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many share requests. Please wait a minute before sharing again.",
        },
        { status: 429 },
      );
    }

    // 2. Parse & Validate Payload
    const body = await req.json();
    const { title, markdown, metadata, ttlSeconds, parentToken } = body;

    if (!markdown || typeof markdown !== "string") {
      return NextResponse.json({ error: "Markdown content is required." }, { status: 400 });
    }

    // Size limit check (2MB)
    if (markdown.length > 2_000_000) {
      return NextResponse.json({ error: "Document is too large to share (maximum size: 2MB)." }, { status: 413 });
    }

    const duration = typeof ttlSeconds === "number" && ttlSeconds > 0 ? ttlSeconds : 3600;

    // 3. Create Shared Context
    const result = await createSharedContext({
      title: typeof title === "string" ? title.slice(0, 200) : "Untitled.md",
      markdown,
      metadata,
      ttlSeconds: duration,
      parentToken: typeof parentToken === "string" ? parentToken : null,
    });

    return NextResponse.json({
      success: true,
      shareToken: result.shareToken,
      shareUrl: result.shareUrl,
      expiresAt: result.expiresAt.toISOString(),
      ttlSeconds: duration,
    });
  } catch (error) {
    console.error("Error creating shared context:", error);
    return NextResponse.json({ error: "An error occurred while creating the share link." }, { status: 500 });
  }
}
