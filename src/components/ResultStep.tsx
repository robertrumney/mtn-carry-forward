import { useState, useRef, useEffect, useCallback } from "react";
import { Hero } from "../data/heroes";
import { compositeImage, drawPreview } from "../utils/canvas";
import { DownloadIcon, RefreshIcon } from "./Icons";

interface ResultStepProps {
  photoDataUrl: string;
  hero: Hero;
  isSubmitting: boolean;
  onSubmit: (permitted: boolean, finalDataUrl: string) => void;
  onBack: () => void;
  finalImageDataUrl: string | null;
  onStartOver: () => void;
}

export default function ResultStep({
  photoDataUrl,
  hero,
  isSubmitting,
  onSubmit,
  onBack,
  finalImageDataUrl,
  onStartOver,
}: ResultStepProps) {
  const [permitted, setPermitted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (c) drawPreview(c, photoDataUrl, hero.frameUrl, 600);
  }, [photoDataUrl, hero.frameUrl]);

  const handleDownload = useCallback(async () => {
    const finalDataUrl = await compositeImage(photoDataUrl, hero.frameUrl, 1200);
    onSubmit(permitted, finalDataUrl);
    const filename = `carry-them-forward-${hero.slug}.png`;
    const blob = await (await fetch(finalDataUrl)).blob();

    if (("ontouchstart" in window || navigator.maxTouchPoints > 0) && navigator.share) {
      const file = new File([blob], filename, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Carry Them Forward" });
          setDownloaded(true);
          return;
        } catch { /* fallthrough */ }
      }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = filename;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  }, [photoDataUrl, hero, permitted, onSubmit]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px", gap: "14px", minHeight: 0 }}>
      <img src="/photo-is-ready.svg" alt="Photo is ready" style={{ width: "100%", maxWidth: "360px", height: "auto" }} />
      <div style={{ display: "flex", justifyContent: "center", flex: 1, minHeight: 0, maxHeight: "280px" }}>
        <canvas
          ref={canvasRef}
          style={{ maxWidth: "100%", maxHeight: "100%", width: "auto", height: "100%", borderRadius: "8px", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", objectFit: "contain" }}
        />
      </div>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setPermitted((v) => !v)}
        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setPermitted((v) => !v); } }}
        style={{
          background: "#f5f5f5", borderRadius: "12px", padding: "12px 14px",
          border: permitted ? "2px solid #FFCB05" : "2px solid #ddd",
          cursor: "pointer", transition: "border-color 0.15s ease", userSelect: "none",
          maxWidth: "400px", width: "100%", flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <div style={{
            width: "22px", height: "22px", borderRadius: "4px",
            border: permitted ? "none" : "2px solid #999",
            background: permitted ? "#FFCB05" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0, marginTop: "1px", transition: "all 0.15s ease",
          }}>
            {permitted && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7L5.5 10.5L12 3.5" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: "12px", lineHeight: 1.5, color: "#333", fontWeight: 500 }}>
            I give MTN permission to use my image for communications purposes.
          </span>
        </div>
      </div>
      <p style={{ fontSize: "13px", fontWeight: 600, color: "#333", textAlign: "center", margin: 0, flexShrink: 0 }}>
        Your photo is ready to download and share.
      </p>
      <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "400px", flexShrink: 0 }}>
        <button type="button" onClick={onBack} disabled={isSubmitting} style={{
          flex: 1, padding: "14px", borderRadius: "9999px", border: "2px solid #000",
          background: "transparent", color: "#000", fontSize: "16px", fontWeight: 600,
          cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.5 : 1, fontFamily: "inherit",
        }}>
          Back
        </button>
        {downloaded ? (
          <button type="button" onClick={onStartOver} style={{
            flex: 2, padding: "14px", borderRadius: "9999px", border: "none",
            background: "#000", color: "#fff", fontSize: "16px", fontWeight: 700,
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            gap: "8px", fontFamily: "inherit",
          }}>
            <RefreshIcon size={16} color="#fff" /> Start Again
          </button>
        ) : (
          <button type="button" onClick={handleDownload} disabled={isSubmitting} style={{
            flex: 2, padding: "14px", borderRadius: "9999px", border: "none",
            background: "#000", color: "#fff", fontSize: "16px", fontWeight: 700,
            cursor: isSubmitting ? "not-allowed" : "pointer", opacity: isSubmitting ? 0.7 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit",
          }}>
            {isSubmitting ? (
              <>
                <span style={{ width: "18px", height: "18px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                Creating...
              </>
            ) : (
              <>
                <DownloadIcon size={18} color="#fff" /> Download
              </>
            )}
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
