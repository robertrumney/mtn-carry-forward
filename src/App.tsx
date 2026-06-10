import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { ThemeProvider, useTheme } from "./components/ThemeProvider";
import PhotoboothPage from "./components/PhotoboothPage";
import AdminPage from "./components/AdminPage";
import DisplayPage from "./components/DisplayPage";

function AppToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      className="toaster group"
      style={{
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" switchable={false}>
      <AppToaster />
      <Routes>
        <Route path="/" element={<PhotoboothPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/display" element={<DisplayPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}
