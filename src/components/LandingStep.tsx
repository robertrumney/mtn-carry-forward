import { youtubeUrl } from "../data/heroes";

function getEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : url;
}

interface LandingStepProps {
  onGetStarted: () => void;
}

export default function LandingStep({ onGetStarted }: LandingStepProps) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 20px 10px", gap: "8px", minHeight: 0 }}>
      <div style={{ textAlign: "center", maxWidth: "440px", flexShrink: 0 }}>
        <p style={{ fontSize: "clamp(13px, 3.5vw, 16px)", fontWeight: 700, color: "#000", lineHeight: 1.3, marginBottom: "4px" }}>
          The youth of 1976 changed our history.
        </p>
        <p style={{ fontSize: "clamp(11px, 3vw, 14px)", fontWeight: 600, color: "#222", lineHeight: 1.3, marginBottom: "4px" }}>
          Now it's our turn{" "}
          <span style={{ fontWeight: 400, color: "#444" }}>
            to make sure history remembers their names.
          </span>
        </p>
        <p style={{ fontSize: "clamp(11px, 3vw, 14px)", fontWeight: 500, color: "#333", lineHeight: 1.4 }}>
          Change your profile picture to{" "}
          <span style={{ fontWeight: 800, color: "#000" }}>#CarryThemForward</span>{" "}
          this 50th Youth Month.
        </p>
      </div>
      <div style={{ width: "100%", maxWidth: "440px", flex: 1, minHeight: "80px", maxHeight: "260px", borderRadius: "12px", overflow: "hidden", border: "3px solid #FFCB05" }}>
        <iframe
          src={getEmbedUrl(youtubeUrl)}
          title="Carry Them Forward"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>
      <button
        type="button"
        onClick={onGetStarted}
        style={{
          width: "100%", maxWidth: "440px", padding: "14px", borderRadius: "9999px",
          border: "none", background: "#000", color: "#fff",
          fontSize: "clamp(15px, 4vw, 18px)", fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit", flexShrink: 0, transition: "transform 0.1s ease",
        }}
      >
        Get started
      </button>
    </div>
  );
}
