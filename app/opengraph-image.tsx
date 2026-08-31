import { ImageResponse } from "next/og";

export const alt = "Markdown Studio | Bidirectional Markdown Editor & Live Preview";
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
        backgroundColor: "#09090b",
        backgroundImage:
          "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #27272a 2%, transparent 0%)",
        backgroundSize: "100px 100px",
        color: "#fafafa",
        padding: "60px 80px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Top Header */}
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
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              backgroundColor: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "24px",
              fontWeight: "bold",
            }}
          >
            M↓
          </div>
          <span
            style={{
              fontSize: "28px",
              fontWeight: "700",
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
            gap: "8px",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.3)",
            padding: "8px 18px",
            borderRadius: "9999px",
            color: "#60a5fa",
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          ⚡ Next.js 16 • TailwindCSS v4 • shadcn/ui
        </div>
      </div>

      {/* Center Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          maxWidth: "960px",
        }}
      >
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "800",
            lineHeight: 1.15,
            letterSpacing: "-1.5px",
            margin: 0,
            background: "linear-gradient(to right, #ffffff, #a1a1aa)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Bidirectional Markdown Editor & Interactive Live Studio
        </h1>
        <p
          style={{
            fontSize: "22px",
            color: "#a1a1aa",
            marginTop: "20px",
            marginBottom: "0px",
            lineHeight: 1.5,
          }}
        >
          Format in plaintext or click directly inside the live rendered preview to edit. Complete with synchronized scrolling, file attachments, and
          GFM support.
        </p>
      </div>

      {/* Feature Badges Footer */}
      <div
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {["🔄 Two-Way Live Sync", "↕️ Synchronized Scrolling", "✏️ Live Preview Editing", "📎 File Attach & Dropzone", "📊 GFM Tables & Tasks"].map(
          (feature, i) => (
            <div
              key={i}
              style={{
                backgroundColor: "#18181b",
                border: "1px solid #27272a",
                padding: "10px 18px",
                borderRadius: "14px",
                fontSize: "16px",
                color: "#e4e4e7",
                fontWeight: "500",
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
