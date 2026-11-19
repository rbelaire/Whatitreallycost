import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "What It Really Cost — real bills for AI-built apps";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#1c1712",
          color: "#f4efe6",
          padding: 72,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 3, textTransform: "uppercase", color: "#8fd8bf" }}>
          cost.belairestudio.com
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 84, lineHeight: 0.95, fontFamily: "Georgia, serif", maxWidth: 980 }}>
            What it really cost to build it.
          </div>
          <div style={{ fontSize: 32, color: "#e4d8c6", maxWidth: 860 }}>
            Credits, tokens, and dollars from real AI-built apps. The source is linked. Nothing is estimated.
          </div>
        </div>
        <div style={{ fontSize: 24, color: "#8fd8bf" }}>Lovable · Bolt · Replit · Cursor · v0 · Claude · Base44</div>
      </div>
    ),
    { ...size },
  );
}
