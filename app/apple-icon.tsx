import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e40af, #2563eb, #3b82f6)",
        borderRadius: "40px",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: "96px",
        letterSpacing: "-4px",
        boxShadow: "inset 0 4px 8px rgba(255,255,255,0.4)",
      }}
    >
      M↓
    </div>,
    {
      ...size,
    },
  );
}
