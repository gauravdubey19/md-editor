import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
        borderRadius: "8px",
        color: "white",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontWeight: 900,
        fontSize: "18px",
        letterSpacing: "-1px",
        boxShadow: "inset 0 1px 1px rgba(255,255,255,0.3)",
      }}
    >
      M↓
    </div>,
    {
      ...size,
    },
  );
}
