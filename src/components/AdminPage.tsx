import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { adminPassword } from "../data/heroes";
import { CameraIcon, DownloadIcon } from "./Icons";
import type { Id } from "../../convex/_generated/dataModel";

/* ── Login form ── */
function AdminLoginForm({ onLogin }: { onLogin: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === adminPassword) {
      sessionStorage.setItem("ctf-admin-auth", "true");
      onLogin();
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: '"MTN Brighter Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <form onSubmit={submit} style={{ background: "#111", borderRadius: "20px", padding: "40px", width: "100%", maxWidth: "380px", border: "1px solid #222", textAlign: "center" }}>
        <div style={{ fontSize: "36px", fontWeight: 800, color: "#FFCB05", marginBottom: "8px" }}>MTN</div>
        <h1 style={{ fontSize: "20px", fontWeight: 700, color: "#fff", marginBottom: "24px" }}>Carry Them Forward Admin</h1>
        <input
          type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter password"
          style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: error ? "1px solid #ef4444" : "1px solid #333", background: "#1a1a1a", color: "#fff", fontSize: "15px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: "12px", transition: "border-color 0.2s" }}
          autoFocus
        />
        {error && <p style={{ color: "#ef4444", fontSize: "13px", marginBottom: "8px" }}>Incorrect password</p>}
        <button type="submit" style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: "#FFCB05", color: "#000", fontSize: "16px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Sign In
        </button>
      </form>
    </div>
  );
}

/* ── Dashboard ── */
function AdminDashboard() {
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "permitted" | "no-permission">("all");

  const queryArgs = filter === "all" ? {} : filter === "permitted" ? { permissionFilter: true } : { permissionFilter: false };
  const submissions = useQuery(api.submissions.list, queryArgs);
  const stats = useQuery(api.submissions.stats);
  const deleteSubmission = useMutation(api.submissions.deleteSubmission);

  const downloadFile = useCallback(async (url: string, slug: string) => {
    const blob = await (await fetch(url)).blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `carry-forward-${slug}-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  const downloadAll = useCallback(async () => {
    if (!submissions) return;
    setDownloading(true);
    try {
      for (const s of submissions) {
        if (s.permissionGranted && s.compositedImageUrl) {
          await downloadFile(s.compositedImageUrl, s.heroSlug);
          await new Promise((r) => setTimeout(r, 400));
        }
      }
    } finally { setDownloading(false); }
  }, [submissions, downloadFile]);

  const handleDelete = useCallback(async (id: Id<"submissions">) => {
    if (!confirm("Delete this submission? This cannot be undone.")) return;
    setDeleting(id);
    try { await deleteSubmission({ id }); } finally { setDeleting(null); }
  }, [deleteSubmission]);

  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-ZA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", color: "#fff", fontFamily: '"MTN Brighter Sans", -apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "20px", fontWeight: 800, color: "#FFCB05" }}>MTN</span>
              <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px" }}>Carry Them Forward</h1>
            </div>
            <p style={{ color: "#666", fontSize: "14px", marginTop: "4px" }}>Admin Dashboard — Youth Day 2026</p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" onClick={downloadAll} disabled={downloading || !submissions?.length}
              style={{ padding: "10px 20px", borderRadius: "9999px", border: "none", background: downloading || !submissions?.length ? "#333" : "#FFCB05", color: downloading || !submissions?.length ? "#666" : "#000", fontSize: "14px", fontWeight: 700, cursor: downloading || !submissions?.length ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
              <DownloadIcon size={16} color={downloading || !submissions?.length ? "#666" : "#000"} />
              {downloading ? "Downloading..." : "Download All"}
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "32px" }}>
            {[
              { value: stats.total, label: "Total Photos", color: "#FFCB05" },
              { value: stats.permitted, label: "Permission Granted", color: "#22c55e" },
              { value: stats.notPermitted, label: "No Permission", color: "#555" },
            ].map((s) => (
              <div key={s.label} style={{ background: "#111", borderRadius: "16px", padding: "20px", border: "1px solid #1a1a1a" }}>
                <div style={{ fontSize: "36px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "13px", color: "#666", marginTop: "6px", fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {([
            { key: "all" as const, label: "All", count: stats?.total },
            { key: "permitted" as const, label: "Permission", count: stats?.permitted },
            { key: "no-permission" as const, label: "No Permission", count: stats?.notPermitted },
          ]).map((tab) => (
            <button key={tab.key} type="button" onClick={() => setFilter(tab.key)}
              style={{ padding: "8px 18px", borderRadius: "9999px", border: filter === tab.key ? "1px solid #FFCB05" : "1px solid #333", background: filter === tab.key ? "rgba(255, 203, 5, 0.1)" : "transparent", color: filter === tab.key ? "#FFCB05" : "#888", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.2s" }}>
              {tab.label}
              {tab.count !== undefined && (
                <span style={{ fontSize: "11px", background: filter === tab.key ? "#FFCB05" : "#333", color: filter === tab.key ? "#000" : "#888", borderRadius: "9999px", padding: "1px 7px", fontWeight: 700 }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Grid */}
        {submissions ? (
          submissions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#666" }}>
              <CameraIcon size={48} color="#444" />
              <p style={{ fontSize: "16px", marginTop: "12px" }}>No submissions yet</p>
              <p style={{ fontSize: "13px", color: "#444", marginTop: "4px" }}>Photos will appear here as they're taken</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
              {submissions.map((s) => (
                <div key={s._id} style={{ background: "#111", borderRadius: "16px", overflow: "hidden", border: "1px solid #1a1a1a", transition: "border-color 0.2s" }}>
                  <div style={{ aspectRatio: "1", position: "relative" }}>
                    <img src={s.compositedImageUrl || s.originalPhotoUrl || ""} alt={`I Carry ${s.heroName}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", opacity: s.permissionGranted ? 1 : 0.5 }} />
                    {!s.permissionGranted && (
                      <div style={{ position: "absolute", top: "10px", right: "10px", background: "rgba(239, 68, 68, 0.85)", color: "#fff", fontSize: "10px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px", letterSpacing: "0.3px", textTransform: "uppercase" }}>
                        No Permission
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ fontSize: "15px", fontWeight: 700, color: s.permissionGranted ? "#FFCB05" : "#666", marginBottom: "4px" }}>
                      I Carry {s.heroName}
                    </div>
                    <div style={{ fontSize: "12px", color: "#555", marginBottom: "12px" }}>{fmtDate(s.createdAt)}</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {s.permissionGranted && s.compositedImageUrl && (
                        <button type="button" onClick={() => downloadFile(s.compositedImageUrl!, s.heroSlug)}
                          style={{ flex: 1, padding: "8px 12px", borderRadius: "9999px", border: "1px solid #333", background: "transparent", color: "#ccc", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          <DownloadIcon size={14} color="#ccc" /> Download
                        </button>
                      )}
                      <button type="button" onClick={() => handleDelete(s._id)} disabled={deleting === s._id}
                        style={{ padding: "8px 12px", borderRadius: "9999px", border: "1px solid #3a1111", background: "transparent", color: deleting === s._id ? "#555" : "#ef4444", fontSize: "12px", fontWeight: 600, cursor: deleting === s._id ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                        {deleting === s._id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#666" }}>
            <div style={{ width: "24px", height: "24px", border: "2px solid #FFCB05", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite", margin: "0 auto 12px" }} />
            Loading submissions...
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ── Wrapper ── */
export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem("ctf-admin-auth") === "true");
  return authed ? <AdminDashboard /> : <AdminLoginForm onLogin={() => setAuthed(true)} />;
}
