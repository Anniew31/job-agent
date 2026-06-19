"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/src/lib/auth";
import { getJobs, updateJobStatus } from "@/src/lib/api";
import { BRAND } from "@/src/lib/theme";
import Navbar from "@/src/components/NavBar";


const APPLICATION_STATUSES = ["applied", "interviewing", "job_offered", "job_rejected", "ghosted"];

const FILTER_STATUSES = ["all", "applied", "interviewing", "job_offered", "job_rejected", "ghosted"];

const statusStyle = (status: string): React.CSSProperties => {
  switch (status.toLowerCase()) {
    case "applied":       return { background: BRAND.greenBg,  color: BRAND.green };
    case "interviewing":  return { background: BRAND.amberBg,  color: BRAND.amber };
    case "job_offered":   return { background: BRAND.blueLight, color: BRAND.blue };
    case "job_rejected":  return { background: BRAND.redBg,    color: BRAND.red };
    case "ghosted":       return { background: BRAND.bg,       color: BRAND.muted };
    default:              return { background: BRAND.bg,       color: BRAND.navyMid };
  }
};

const statusLabel = (status: string) => {
  switch (status.toLowerCase()) {
    case "job_offered":  return "Offered";
    case "job_rejected": return "Rejected";
    default: return status.charAt(0).toUpperCase() + status.slice(1);
  }
};

function StatusBadge({ status }: { status: string }) {
  const s = statusStyle(status);
  return (
    <span style={{
      ...s, fontSize: "0.72rem", fontWeight: 600,
      padding: "0.2rem 0.6rem", borderRadius: "100px",
      whiteSpace: "nowrap", overflow: "hidden",
      textOverflow: "ellipsis", display: "inline-block", maxWidth: "100%",
    }} title={statusLabel(status)}>{statusLabel(status)}</span>
  );
}

function MiniChart({ jobs }: { jobs: any[] }) {
  const counts = APPLICATION_STATUSES.map(s => ({
    label: statusLabel(s),
    count: jobs.filter(j => j.status?.toLowerCase() === s).length,
    ...statusStyle(s),
  })).filter(c => c.count > 0);

  const max = Math.max(...counts.map(c => c.count), 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
      {counts.length === 0 ? (
        <p style={{ fontSize: "0.8rem", color: BRAND.faint, margin: 0 }}>No applications yet</p>
      ) : counts.map(c => (
        <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.72rem", color: BRAND.muted, width: 80, flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {c.label}
          </span>
          <div style={{ flex: 1, height: 8, background: BRAND.borderLight, borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ height: "100%", borderRadius: "100px", background: c.color, width: `${(c.count / max) * 100}%`, transition: "width 0.4s ease" }}/>
          </div>
          <span style={{ fontSize: "0.72rem", fontWeight: 600, color: c.color, width: 20, textAlign: "right", flexShrink: 0 }}>{c.count}</span>
        </div>
      ))}
    </div>
  );
}

export default function ApplicationsPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getJobs("applied");
        setJobs(res || []);
      } catch { setError("Failed to load applications."); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [router]);

  async function handleStatusChange(jobId: number, newStatus: string) {
    setUpdatingId(jobId);
    try {
      await updateJobStatus({ job_id: jobId, status: newStatus });
      setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    } catch { alert("Failed to update status"); }
    finally { setUpdatingId(null); }
  }

  const filtered = statusFilter === "all"
    ? jobs
    : jobs.filter(j => j.status?.toLowerCase() === statusFilter);

  const stats = [
    { label: "Applied",      value: jobs.filter(j => j.status === "applied").length,      color: BRAND.green  },
    { label: "Interviewing", value: jobs.filter(j => j.status === "interviewing").length,  color: BRAND.amber  },
    { label: "Ghosted",      value: jobs.filter(j => j.status === "ghosted").length,   color: BRAND.muted   },
    { label: "Rejected",     value: jobs.filter(j => j.status === "job_rejected").length,  color: BRAND.red    },
  ];

  const gridTemplate = "1.5fr 0.8fr 0.7fr 0.5fr 1fr";

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p style={{ color: BRAND.muted, fontSize: "0.9rem" }}>Loading applications...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
      <p style={{ color: BRAND.red, fontSize: "0.9rem" }}>{error}</p>
      <button onClick={() => window.location.reload()} style={{ background: BRAND.blue, color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>Retry</button>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Navbar firstName="" />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2.5rem 4rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: BRAND.navy, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>Applications</h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: BRAND.muted }}>
            Track what happened after you hit submit. Update statuses as you hear back.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            {stats.map(s => (
              <div key={s.label} style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "1.1rem 1.25rem" }}>
                <p style={{ fontSize: "0.7rem", color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.03em" }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "1.25rem" }}>
            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 1rem" }}>Application outcomes</p>
            <MiniChart jobs={jobs} />
          </div>
        </div>

        {/* table */}
        <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: `1px solid ${BRAND.border}`, gap: "1rem" }}>
            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: BRAND.navy, margin: 0, flexShrink: 0 }}>
              {filtered.length} job{filtered.length !== 1 ? "s" : ""} {statusFilter !== "all" && ` · ${statusLabel(statusFilter)}`}
            </p>
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
              {FILTER_STATUSES.map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: "0.25rem 0.65rem", borderRadius: "100px", cursor: "pointer",
                    fontSize: "0.72rem", fontWeight: 500,
                    border: `1px solid ${statusFilter === s ? BRAND.blue : BRAND.border}`,
                    background: statusFilter === s ? BRAND.blueLight : BRAND.surface,
                    color: statusFilter === s ? BRAND.blue : BRAND.muted,
                  }}
                >
                  {statusLabel(s)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: gridTemplate, padding: "0.55rem 1.5rem", background: BRAND.bg, borderBottom: `1px solid ${BRAND.border}` }}>
            {["Role", "Company", "Status", "Score", "Update status"].map(h => (
              <p key={h} style={{ fontSize: "0.68rem", fontWeight: 600, color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
            ))}
          </div>
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {filtered.length === 0 ? (
                <div style={{ padding: "3rem", textAlign: "center" }}>
                    <p style={{ color: BRAND.muted, fontSize: "0.875rem", margin: "0 0 0.5rem" }}>
                    {statusFilter === "all"
                        ? "No submitted applications yet."
                        : `No jobs marked as "${statusLabel(statusFilter)}" yet.`}
                    </p>
                    {statusFilter === "all" && (
                    <p style={{ fontSize: "0.8rem", color: BRAND.faint, margin: 0 }}>
                        Jobs you apply to from the tailor page will appear here.
                    </p>
                    )}
                </div>
            ) : (
              filtered.map((job) => (
                <div key={job.id} style={{
                  display: "grid", gridTemplateColumns: gridTemplate,
                  padding: "0.875rem 1.5rem", alignItems: "center",
                  borderBottom: `1px solid ${BRAND.borderLight}`,
                }}>
                  <div style={{ minWidth: 0, paddingRight: "0.5rem" }}>
                    <p style={{ fontSize: "0.875rem", fontWeight: 500, color: BRAND.navy, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={job.title}>
                      {job.title}
                    </p>
                    {job.location && (
                      <p style={{ fontSize: "0.72rem", color: BRAND.faint, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        📍 {job.location}
                      </p>
                    )}
                  </div>

                  <p style={{ fontSize: "0.85rem", color: BRAND.muted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "0.5rem" }} title={job.company}>
                    {job.company}
                  </p>

                  <div style={{ minWidth: 0, paddingRight: "0.5rem" }}>
                    <StatusBadge status={job.status || "applied"} />
                  </div>

                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: job.score ? BRAND.blueLight : BRAND.bg,
                    color: job.score ? BRAND.blue : BRAND.faint,
                    border: job.score ? "none" : `1px solid ${BRAND.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.78rem", fontWeight: 700,
                  }}>
                    {job.score ?? "—"}
                  </div>

                  <select
                    value={job.status?.toLowerCase() || "applied"}
                    disabled={updatingId === job.id}
                    onChange={(e) => handleStatusChange(job.id, e.target.value)}
                    style={{
                      padding: "0.3rem 0.5rem", borderRadius: "6px",
                      border: `1px solid ${BRAND.border}`, background: BRAND.bg,
                      color: BRAND.navy, fontSize: "0.78rem", cursor: "pointer",
                      opacity: updatingId === job.id ? 0.5 : 1,
                      width: "100%", maxWidth: "140px",
                    }}
                  >
                    {APPLICATION_STATUSES.map(s => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </div>
              ))
            )}
          </div>
        </div>
        <p style={{ fontSize: "0.75rem", color: BRAND.faint, marginTop: "1rem", textAlign: "center" }}>
          "Rejected" here means the company rejected your application — different from AI auto-rejected jobs which live in the pipeline view.
        </p>

      </div>
    </main>
  );
}