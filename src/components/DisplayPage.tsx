import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function DisplayPage() {
  const submissions = useQuery(api.submissions.list, { permissionFilter: true });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [nextIdx, setNextIdx] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const permitted = submissions?.filter((s) => s.permissionGranted && s.compositedImageUrl);

  const advance = useCallback(() => {
    if (!permitted || permitted.length <= 1) return;
    const next = (currentIdx + 1) % permitted.length;
    setNextIdx(next);
    setFading(true);
    setTimeout(() => {
      setCurrentIdx(next);
      setNextIdx(null);
      setFading(false);
    }, 1200);
  }, [permitted, currentIdx]);

  useEffect(() => {
    timerRef.current = setInterval(advance, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [advance]);

  const current = permitted?.[currentIdx % (permitted?.length || 1)];
  const next = nextIdx !== null ? permitted?.[nextIdx % (permitted?.length || 1)] : null;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#FFF5EB", overflow: "hidden", fontFamily: '"MTN Brighter Sans", -apple-system, BlinkMacSystemFont, sans-serif', display: "flex", flexDirection: "column", position: "relative" }}>
      <div style={{ height: "4px", background: "linear-gradient(90deg, #FFCB05 0%, #FF6B35 50%, #E63946 100%)", flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        {!permitted || permitted.length === 0 ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "64px", fontWeight: 800, fontStyle: "italic", color: "#000", marginBottom: "12px" }}>
              #CarryThemForward
            </div>
            <p style={{ color: "#666", fontSize: "20px", fontWeight: 500 }}>Waiting for photos...</p>
          </div>
        ) : current ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "56px", width: "100%", height: "100%" }}>
            <div style={{ height: "calc(100vh - 140px)", maxHeight: "75vh", aspectRatio: "1", position: "relative" }}>
              <img
                key={`current-${currentIdx}`}
                src={current.compositedImageUrl || ""}
                alt={current.heroName}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
              />
              {next && (
                <img
                  key={`next-${nextIdx}`}
                  src={next.compositedImageUrl || ""}
                  alt={next.heroName}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "contain", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.12)", opacity: fading ? 1 : 0, transition: "opacity 1.2s ease-in-out" }}
                />
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px", maxWidth: "280px" }}>
              <div style={{ background: "#fff", borderRadius: "20px", padding: "20px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                <img src="/qr-code.png" alt="Scan to participate" style={{ width: "180px", height: "180px", display: "block" }} />
              </div>
              <div style={{ fontSize: "22px", fontWeight: 800, fontStyle: "italic", color: "#000", textAlign: "center" }}>
                #CarryThemForward
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#666", textAlign: "center", letterSpacing: "0.3px" }}>
                carrythemforward.co.za
              </div>
            </div>
          </div>
        ) : null}
      </div>
      <div style={{ height: "6px", background: "#e0e0e0", position: "relative", overflow: "hidden" }}>
        <div style={{ height: "100%", background: "#FFCB05", width: permitted?.length ? `${((currentIdx + 1) / permitted.length) * 100}%` : "0%", transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}
