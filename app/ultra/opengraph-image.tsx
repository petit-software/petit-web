import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";
import { ULTRA_HEADLINE, ULTRA_IMAGE_ALT } from "@/lib/ultra";

export const alt = ULTRA_IMAGE_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const icon = await fs.readFile(path.join(process.cwd(), "public/images/ultra-icon.png"));

  return new ImageResponse(
    (
      <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 64, background: "#000", color: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* A data URL keeps the generated image independent of external hosts. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`data:image/png;base64,${icon.toString("base64")}`} width={88} height={88} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: -2 }}>Ultra</span>
            <span style={{ fontSize: 24, color: "#999" }}>For macOS</span>
          </div>
        </div>
        <div style={{ display: "flex", flex: 1, alignItems: "center", maxWidth: 1000, fontSize: 82, fontWeight: 700, lineHeight: 1.06, letterSpacing: -4 }}>
          {ULTRA_HEADLINE}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #333", paddingTop: 24, fontSize: 24, color: "#aaa" }}>
          <span>Made by Petit</span>
          <span>petit.software/ultra</span>
        </div>
      </div>
    ),
    size,
  );
}
