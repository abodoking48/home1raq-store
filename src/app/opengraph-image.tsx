import { ImageResponse } from "next/og";

/** Default link-preview image (home and pages without their own image). */
export const alt = "Home1raq";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 45%, rgba(0,255,136,0.22) 0%, #020403 65%)",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 140, fontWeight: 800, letterSpacing: -4, display: "flex" }}>
          Home<span style={{ color: "#00FF88" }}>1</span>raq
        </div>
        <div style={{ fontSize: 40, color: "#00FF88", marginTop: 12 }}>www.home1raq.com</div>
      </div>
    ),
    size,
  );
}
