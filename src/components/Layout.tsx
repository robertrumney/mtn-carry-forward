import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
  hideFooter?: boolean;
  useYellowBar?: boolean;
}

export default function Layout({ children, hideHeader, hideFooter, useYellowBar }: LayoutProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
      {!hideHeader && !useYellowBar && (
        <div style={{ width: "100%", flexShrink: 1, minHeight: 0, overflow: "hidden" }}>
          <img
            src="/header.png"
            alt="MTN Carry Them Forward"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
          <div style={{ height: "4px", background: "linear-gradient(90deg, #FFCB05 0%, #FF6B35 50%, #E63946 100%)" }} />
        </div>
      )}
      {!hideHeader && useYellowBar && (
        <div style={{ width: "100%", height: "20px", background: "#FFCB05", flexShrink: 0 }} />
      )}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", minHeight: 0, overflow: "hidden" }}>
        {children}
      </div>
      {!hideFooter && (
        <div style={{ width: "100%", flexShrink: 0 }}>
          <img
            src="/footer.png"
            alt="June 16 Youth Development Foundation"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      )}
    </div>
  );
}
