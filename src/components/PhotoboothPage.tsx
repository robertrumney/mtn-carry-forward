import { useState, useCallback, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { heroes, Hero } from "../data/heroes";
import { preloadFrames, compositeImage } from "../utils/canvas";
import Layout from "./Layout";
import StepIndicator from "./StepIndicator";
import LandingStep from "./LandingStep";
import HeroSelectStep from "./HeroSelectStep";
import CaptureStep from "./CaptureStep";
import ResultStep from "./ResultStep";

const allSteps = ["landing", "hero", "capture", "result"] as const;
const progressSteps = ["hero", "capture", "result"] as const;
type Step = (typeof allSteps)[number];

function PhotoboothFlow() {
  const [step, setStep] = useState<Step>("landing");
  const [selectedHero, setSelectedHero] = useState<Hero | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [finalImageDataUrl, setFinalImageDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [animKey, setAnimKey] = useState(0);

  const generateUploadUrl = useMutation(api.submissions.generateUploadUrl);
  const createSubmission = useMutation(api.submissions.create);

  const stepIndex = (progressSteps as readonly string[]).indexOf(step);

  useEffect(() => {
    preloadFrames(heroes.map((h) => h.frameUrl));
  }, []);

  const goTo = useCallback(
    (next: Step) => {
      const curIdx = allSteps.indexOf(step);
      const nextIdx = allSteps.indexOf(next);
      setDirection(nextIdx >= curIdx ? "forward" : "back");
      setAnimKey((k) => k + 1);
      setStep(next);
    },
    [step]
  );

  const handleGetStarted = useCallback(() => goTo("hero"), [goTo]);

  const handleHeroSelect = useCallback(
    (hero: Hero) => { setSelectedHero(hero); goTo("capture"); },
    [goTo]
  );

  const handleCapture = useCallback(
    (dataUrl: string) => { setPhotoDataUrl(dataUrl); goTo("result"); },
    [goTo]
  );

  const handleSubmit = useCallback(
    async (permitted: boolean, composited: string) => {
      if (!photoDataUrl || !selectedHero) return;
      setIsSubmitting(true);
      try {
        const uploadUrl1 = await generateUploadUrl();
        const blob1 = await fetch(photoDataUrl).then((r) => r.blob());
        const res1 = await fetch(uploadUrl1, { method: "POST", headers: { "Content-Type": blob1.type }, body: blob1 });
        const { storageId: originalPhotoId } = await res1.json();

        const uploadUrl2 = await generateUploadUrl();
        const blob2 = await fetch(composited).then((r) => r.blob());
        const res2 = await fetch(uploadUrl2, { method: "POST", headers: { "Content-Type": "image/png" }, body: blob2 });
        const { storageId: compositedImageId } = await res2.json();

        await createSubmission({
          originalPhotoId,
          compositedImageId,
          heroName: selectedHero.name,
          heroSlug: selectedHero.slug,
          permissionGranted: permitted,
        });
        setFinalImageDataUrl(composited);
      } catch (err) {
        console.error("Submission failed:", err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [photoDataUrl, selectedHero, generateUploadUrl, createSubmission]
  );

  const handleStartOver = useCallback(() => {
    setSelectedHero(null);
    setPhotoDataUrl(null);
    setFinalImageDataUrl(null);
    setIsSubmitting(false);
    goTo("landing");
  }, [goTo]);

  const animClass = direction === "forward" ? "step-slide-in-right" : "step-slide-in-left";

  return (
    <Layout useYellowBar={step !== "landing"}>
      <main
        key={animKey}
        className={animClass}
        style={{ flex: 1, display: "flex", flexDirection: "column", maxWidth: "480px", width: "100%", margin: "0 auto", minHeight: 0 }}
      >
        {step === "landing" && <LandingStep onGetStarted={handleGetStarted} />}
        {step === "hero" && <HeroSelectStep onSelect={handleHeroSelect} />}
        {step === "capture" && selectedHero && (
          <CaptureStep hero={selectedHero} onCapture={handleCapture} onBack={() => goTo("hero")} />
        )}
        {step === "result" && selectedHero && photoDataUrl && (
          <ResultStep
            photoDataUrl={photoDataUrl}
            hero={selectedHero}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onBack={() => goTo("capture")}
            finalImageDataUrl={finalImageDataUrl}
            onStartOver={handleStartOver}
          />
        )}
      </main>
      {stepIndex >= 0 && !finalImageDataUrl && <StepIndicator currentStep={stepIndex} totalSteps={3} />}
    </Layout>
  );
}

export default function PhotoboothPage() {
  return (
    <>
      <div className="mobile-layout">
        <PhotoboothFlow />
      </div>
      <div className="desktop-layout">
        <div className="desktop-bg" />
        <div className="desktop-inner">
          <div className="desktop-box">
            <PhotoboothFlow />
          </div>
          <p className="desktop-mobile-msg">
            This experience is designed for mobile. For the best experience, visit on your phone.
          </p>
        </div>
      </div>
      <style>{`
        /* ── Swipe animations ── */
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .step-slide-in-right {
          animation: slideInRight 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        .step-slide-in-left {
          animation: slideInLeft 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }

        .mobile-layout {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          background: #FFF5EB;
          color: #000;
          overflow: hidden;
        }
        .desktop-layout {
          display: none;
        }

        @media (min-width: 768px) {
          .mobile-layout {
            display: none;
          }
          .desktop-layout {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: #1a1a1a;
            position: relative;
            overflow: hidden;
          }
          .desktop-bg {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, #FFCB05 0%, #FF6B35 50%, #000 100%);
            opacity: 0.08;
          }
          .desktop-inner {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            z-index: 1;
          }
          .desktop-box {
            width: 390px;
            height: 780px;
            border-radius: 24px;
            overflow: hidden;
            overflow-y: auto;
            background: #FFF5EB;
            color: #000;
            border: 1.5px solid #FFCB05;
            display: flex;
            flex-direction: column;
          }
          .desktop-mobile-msg {
            font-family: 'MTN Brighter Sans', -apple-system, BlinkMacSystemFont, sans-serif;
            font-weight: 400;
            font-size: 13px;
            color: #888;
            text-align: center;
            max-width: 340px;
            line-height: 1.5;
          }
        }
      `}</style>
    </>
  );
}
