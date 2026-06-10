interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div style={{ display: "flex", gap: "16px", justifyContent: "center", alignItems: "center", padding: "10px 0" }}>
      {Array.from({ length: totalSteps }).map((_, i) => {
        const active = i === currentStep;
        const completed = i < currentStep;
        return (
          <div
            key={i}
            style={{
              width: active ? "16px" : "10px",
              height: active ? "16px" : "10px",
              borderRadius: "50%",
              background: active ? "#FFCB05" : completed ? "#333" : "#ccc",
              border: active ? "3px solid #000" : "none",
              boxShadow: active ? "0 0 0 1px #FFCB05" : "none",
              transition: "all 0.25s ease",
            }}
          />
        );
      })}
    </div>
  );
}
