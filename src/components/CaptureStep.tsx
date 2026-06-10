import { useState, useRef, useCallback, useEffect } from "react";
import { Hero } from "../data/heroes";
import { drawFrameOverlay } from "../utils/canvas";
import { CameraIcon, ImageIcon, FlipIcon } from "./Icons";

interface CaptureStepProps {
  hero: Hero;
  onCapture: (dataUrl: string) => void;
  onBack: () => void;
}

export default function CaptureStep({ hero, onCapture, onBack }: CaptureStepProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const captureRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const snapRef = useRef<HTMLCanvasElement>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");

  const drawOverlay = useCallback(async () => {
    const c = overlayRef.current;
    if (c) await drawFrameOverlay(c, hero.frameUrl, 600);
  }, [hero.frameUrl]);

  useEffect(() => {
    if (cameraActive) {
      const t = setTimeout(drawOverlay, 100);
      return () => clearTimeout(t);
    }
  }, [cameraActive, drawOverlay]);

  useEffect(() => {
    return () => {
      if (stream) for (const t of stream.getTracks()) t.stop();
    };
  }, [stream]);

  const processFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > 1200 || height > 1200) {
            if (width > height) { height = (height / width) * 1200; width = 1200; }
            else { width = (width / height) * 1200; height = 1200; }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
          onCapture(canvas.toDataURL("image/jpeg", 0.9));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    },
    [onCapture]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const startCamera = useCallback(
    async (dir: "user" | "environment" = facing) => {
      try {
        if (stream) for (const t of stream.getTracks()) t.stop();
        const ms = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: dir, width: { ideal: 1200 }, height: { ideal: 1200 } },
          audio: false,
        });
        setStream(ms);
        setCameraActive(true);
        const attach = (retries = 0) => {
          const v = videoRef.current;
          if (!v) { if (retries < 20) setTimeout(() => attach(retries + 1), 100); return; }
          v.srcObject = ms;
          v.play().catch(() => { setTimeout(() => { if (v.srcObject) v.play().catch(() => {}); }, 300); });
        };
        requestAnimationFrame(() => attach());
      } catch {
        captureRef.current?.click();
      }
    },
    [stream, facing]
  );

  const flipCamera = useCallback(() => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    startCamera(next);
  }, [facing, startCamera]);

  const takePhoto = useCallback(() => {
    const v = videoRef.current;
    const c = snapRef.current;
    if (!v || !c) return;
    const size = Math.min(v.videoWidth, v.videoHeight);
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d")!;
    const sx = (v.videoWidth - size) / 2;
    const sy = (v.videoHeight - size) / 2;
    if (facing === "user") { ctx.translate(size, 0); ctx.scale(-1, 1); }
    ctx.drawImage(v, sx, sy, size, size, 0, 0, size, size);
    const dataUrl = c.toDataURL("image/jpeg", 0.9);
    if (stream) for (const t of stream.getTracks()) t.stop();
    setStream(null);
    setCameraActive(false);
    onCapture(dataUrl);
  }, [stream, facing, onCapture]);

  const cancelCamera = useCallback(() => {
    if (stream) for (const t of stream.getTracks()) t.stop();
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  if (cameraActive) {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "12px 16px", gap: "16px", minHeight: 0 }}>
        <div style={{ position: "relative", width: "100%", maxWidth: "400px", aspectRatio: "1", borderRadius: "16px", overflow: "hidden" }}>
          <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: facing === "user" ? "scaleX(-1)" : "none" }} />
          <canvas ref={overlayRef} width={600} height={600} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
          <button type="button" onClick={flipCamera} style={{ position: "absolute", top: "12px", right: "12px", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2, fontFamily: "inherit" }}>
            <FlipIcon size={20} color="#fff" />
          </button>
        </div>
        <canvas ref={snapRef} style={{ display: "none" }} />
        <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "400px" }}>
          <button type="button" onClick={cancelCamera} style={{ flex: 1, padding: "14px", borderRadius: "9999px", border: "2px solid #000", background: "transparent", color: "#000", fontSize: "16px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button type="button" onClick={takePhoto} style={{ flex: 2, padding: "14px", borderRadius: "9999px", border: "none", background: "#FFCB05", color: "#000", fontSize: "16px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "inherit" }}>
            <CameraIcon size={20} color="#000" /> Take Photo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 20px", gap: "20px", minHeight: 0 }}>
      <img src="/take-your-photo.svg" alt="Take Your Photo" style={{ width: "100%", maxWidth: "360px", height: "auto" }} />
      <div style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <button type="button" onClick={() => startCamera()} style={{ width: "100%", padding: "18px", borderRadius: "9999px", border: "none", background: "#FFCB05", color: "#000", fontSize: "17px", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "inherit" }}>
          <CameraIcon size={24} color="#000" />Open Camera
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} style={{ width: "100%", padding: "18px", borderRadius: "9999px", border: "2px solid #000", background: "#fff", color: "#000", fontSize: "17px", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", fontFamily: "inherit" }}>
          <ImageIcon size={24} color="#000" />Choose From Gallery
        </button>
      </div>
      <div style={{ display: "flex", gap: "12px", width: "100%", maxWidth: "400px" }}>
        <button type="button" onClick={onBack} style={{ flex: 1, padding: "14px", borderRadius: "9999px", border: "none", background: "#000", color: "#fff", fontSize: "16px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          Back
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
      <input ref={captureRef} type="file" accept="image/*" capture="user" onChange={handleFileChange} style={{ display: "none" }} />
    </div>
  );
}
