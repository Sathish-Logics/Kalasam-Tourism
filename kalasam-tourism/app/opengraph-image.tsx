import { ImageResponse } from "next/og";

export const alt = "Kalasam Tourism — Sacred journeys. Timeless traditions.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ background: "#211c16", color: "#f7efdf", width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: "80px", border: "18px solid #ae8134" }}>
      <div style={{ display: "flex", fontSize: 25, color: "#d7ae60", letterSpacing: 8, marginBottom: 48 }}>KALASAM TOURISM</div>
      <div style={{ display: "flex", fontSize: 70, fontFamily: "serif", lineHeight: 1.15 }}>Journeys beyond destinations.</div>
      <div style={{ display: "flex", marginTop: 36, fontSize: 25, color: "#d8cebd" }}>Sacred journeys. Timeless traditions. South India.</div>
    </div>,
    size,
  );
}
