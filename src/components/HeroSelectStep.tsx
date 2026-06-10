import { useState } from "react";
import { heroes, Hero } from "../data/heroes";

interface HeroSelectStepProps {
  onSelect: (hero: Hero) => void;
}

export default function HeroSelectStep({ onSelect }: HeroSelectStepProps) {
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const selectedHero = heroes.find((h) => h.slug === selectedSlug);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "6px 20px 4px", gap: "5px", minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
      <div style={{ flexShrink: 0 }}>
        <h2 style={{ fontSize: "24px", fontWeight: 800, fontStyle: "italic", color: "#000", marginBottom: "2px", lineHeight: 1.1 }}>
          How to take part
        </h2>
        <p style={{ fontSize: "12px", fontWeight: 500, color: "#333", lineHeight: 1.35, margin: 0 }}>
          Choose the name of a 1976 youth hero you want to carry forward, and{" "}
          <strong>change your profile picture</strong> to honour them:
        </p>
      </div>
      <div style={{ width: "100%", display: "flex", justifyContent: "center", flex: 1, minHeight: "70px", maxHeight: "260px" }}>
        <div style={{ width: "100%", maxWidth: "280px", height: "100%", borderRadius: "20px", background: "#FFCB05", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {selectedHero ? (
            <img
              key={selectedHero.slug}
              src={selectedHero.imageUrl}
              alt={selectedHero.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
            />
          ) : (
            <p style={{ fontSize: "18px", fontWeight: 700, fontStyle: "italic", color: "#000", opacity: 0.4, textAlign: "center", padding: "20px" }}>
              Select a hero below
            </p>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "center", padding: "0 4px" }}>
        <p style={{ fontSize: "11px", lineHeight: 1.35, color: "#444", fontWeight: 400, margin: 0, opacity: selectedHero ? 1 : 0.5, transition: "opacity 0.2s ease" }}>
          {selectedHero ? selectedHero.description : "Choose a youth hero to learn more about their story."}
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", width: "100%", flexShrink: 0 }}>
        {heroes.map((hero, idx) => {
          const active = selectedSlug === hero.slug;
          const isLastOdd = idx === heroes.length - 1 && heroes.length % 2 !== 0;
          return (
            <button
              key={hero.slug}
              type="button"
              onClick={() => setSelectedSlug(hero.slug)}
              style={{
                gridColumn: isLastOdd ? "1 / -1" : undefined,
                justifySelf: isLastOdd ? "center" : undefined,
                width: isLastOdd ? "calc(50% - 4px)" : undefined,
                padding: "8px 10px", borderRadius: "9999px",
                border: active ? "2.5px solid #000" : "2px solid #ccc",
                background: active ? "#FFCB05" : "#fff",
                color: "#000", fontSize: "13px", fontWeight: active ? 700 : 500,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}
            >
              {hero.name}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={() => selectedHero && onSelect(selectedHero)}
        disabled={!selectedHero}
        style={{
          width: "100%", maxWidth: "320px", padding: "12px", borderRadius: "9999px",
          border: "none", background: selectedHero ? "#000" : "#ccc",
          color: selectedHero ? "#fff" : "#888", fontSize: "16px", fontWeight: 700,
          cursor: selectedHero ? "pointer" : "not-allowed", fontFamily: "inherit",
          transition: "all 0.2s ease", display: "block", margin: "0 auto", flexShrink: 0,
        }}
      >
        Continue
      </button>
    </div>
  );
}
