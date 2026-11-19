import { ImageResponse } from "next/og";
import { toolName } from "@/lib/catalog";
import { costParts } from "@/lib/format";
import { getBuild } from "@/lib/queries";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Build cost";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const build = await getBuild(slug);
  const title = build?.title ?? "What It Really Cost";
  const line = build ? costParts(build).join("  ·  ") || "Figure not fully stated" : "Real bills for AI-built apps";
  const kicker = build ? toolName(build.tool) : "What It Really Cost";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f4efe6",
          color: "#1c1712",
          padding: 72,
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 2, textTransform: "uppercase", color: "#0d6a50" }}>{kicker}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, lineHeight: 1.05, maxWidth: 1000 }}>{title}</div>
          <div style={{ fontSize: 36, fontFamily: "ui-monospace, monospace" }}>{line}</div>
        </div>
        <div style={{ fontSize: 24, color: "#5f574c" }}>cost.belairestudio.com</div>
      </div>
    ),
    { ...size },
  );
}
