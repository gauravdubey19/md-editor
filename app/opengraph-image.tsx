import { ImageResponse } from "next/og";

export const alt = "Markdown Studio | Bidirectional Markdown Editor & Context Sharing";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#000000",
        color: "#ffffff",
        padding: "50px 70px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "30px",
              fontWeight: 900,
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
            }}
          >
            M↓
          </div>
          <span
            style={{
              fontSize: "34px",
              fontWeight: 800,
              letterSpacing: "-0.5px",
              color: "#ffffff",
            }}
          >
            Markdown Studio
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            border: "1.5px solid rgba(59, 130, 246, 0.4)",
            padding: "10px 22px",
            borderRadius: "9999px",
            color: "#93c5fd",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          Next.js 16 Web App
        </div>
      </div>

      {/* Hero Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "1020px",
          margin: "20px 0",
        }}
      >
        <h1
          style={{
            fontSize: "60px",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-2px",
            margin: "0 0 16px 0",
            color: "#ffffff",
          }}
        >
          Bidirectional Editor & Context Sharing Studio
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            margin: 0,
            lineHeight: 1.4,
            fontWeight: 500,
          }}
        >
          Edit live in plaintext or directly in the rendered preview. Share time-limited snapshots (TTL) with seamless copy-on-edit forking.
        </p>
      </div>

      {/* Feature Pills */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {["🔄 Two-Way Live Sync", "↕️ Synchronized Scrolling", "🔗 Time-Limited Sharing", "🌿 Copy-on-Edit Forking", "📊 GFM Tables & Tasks"].map(
          (feature, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#111827",
                border: "1.5px solid #1e293b",
                padding: "12px 20px",
                borderRadius: "14px",
                fontSize: "16px",
                color: "#e2e8f0",
                fontWeight: 600,
              }}
            >
              {feature}
            </div>
          ),
        )}
      </div>
    </div>,
    {
      ...size,
    },
  );
}
