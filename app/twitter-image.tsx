import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "SkillJury";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(247,212,138,0.24), transparent 30%), linear-gradient(135deg, #0b1020 0%, #111827 55%, #0f172a 100%)",
          color: "white",
          padding: "68px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "84px",
              width: "84px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "28px",
              border: "1px solid rgba(255,255,255,0.16)",
              background: "rgba(255,255,255,0.06)",
              fontSize: "30px",
              fontWeight: 700,
            }}
          >
            SJ
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "54px", fontWeight: 700 }}>SkillJury</div>
            <div
              style={{
                marginTop: "6px",
                fontSize: "22px",
                letterSpacing: "0.34em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.68)",
              }}
            >
              AI agent skill discovery
            </div>
          </div>
        </div>
        <div style={{ maxWidth: "880px", fontSize: "62px", lineHeight: 1.02 }}>
          Judge AI agent skills before you install them.
        </div>
      </div>
    ),
    size,
  );
}
