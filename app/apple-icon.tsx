import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/metadata";

export const alt = SITE_NAME;
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/**
 * The touch icon is the favicon's mark composited onto a light ground rather
 * than the PNG itself: iOS flattens transparency to black, and the mark is
 * near-black, so shipping the transparent file directly would put a black
 * ellipse on a black square.
 */
export default async function AppleIcon() {
  // Literal path — Turbopack traces fs reads statically, and a computed one
  // makes it pull the whole project into the route's file list.
  const mark = await fs.readFile(path.join(process.cwd(), "app/icon.png"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${mark.toString("base64")}`}
          width={132}
          height={132}
          alt=""
        />
      </div>
    ),
    size,
  );
}
