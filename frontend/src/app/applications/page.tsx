"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/src/lib/auth";
import { getJobs, updateJobStatus } from "@/src/lib/api";
import { BRAND } from "@/src/lib/theme";
import Navbar from "@/src/components/NavBar";

const DEFAULT_STATUSES = ["applied", "position offered", "rejected", "interviewing", "ghosted"];

const statusStyle = (status: string): React.CSSProperties => {
    switch (status.toLowerCase()) {
        case "applied": return { background: BRAND.greenBg, color: BRAND.green };
        case "position offered": return { background: BRAND.blueLight, color: BRAND.blue };
        case "rejected": return { background: BRAND.redBg, color: BRAND.red };
        case "interviewing": return { background: BRAND.amberBg, color: BRAND.amber };
        case "ghosted": return { background: BRAND.bg, color: BRAND.muted };
        default: return { background: BRAND.bg,color: BRAND.navyMid };
  }
};

function StatusBadge({ status }: { status: string }) {
  const s = statusStyle(status);
  return (
    <span style={{
      ...s, fontSize: "0.72rem", fontWeight: 600,
      padding: "0.2rem 0.6rem", borderRadius: "100px",
      textTransform: "capitalize", whiteSpace: "nowrap",
      overflow: "hidden", textOverflow: "ellipsis", display: "inline-block", maxWidth: "100%"
    }} title={status}>{status}</span>
  );
}

function MiniChart({ jobs, statuses }: { jobs: any[]; statuses: string[] }) {
    const counts = statuses.map(s => ({
        label: s,
        count: jobs.filter(j => j.status?.toLowerCase() === s.toLowerCase()).length,
        ...statusStyle(s),
    })).filter(s => s.count > 0);

    const max = Math.max(...counts.map(c => c.count), 1);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        {counts.map(c => (
            <div key={c.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "0.72rem", color: BRAND.muted, width: 75, textTransform: "capitalize", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={c.label}>{c.label}</span>
            <div style={{ flex: 1, height: 8, background: BRAND.borderLight, borderRadius: "100px", overflow: "hidden" }}>
                <div style={{
                height: "100%", borderRadius: "100px",
                background: c.color,
                width: `${(c.count / max) * 100}%`,
                transition: "width 0.4s ease",
                }}/>
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
                const res = await getJobs();
                setJobs(res || []);
            } catch { 
                setError("Failed to load applications."); 
            } finally { 
                setLoading(false); 
            }
        }
        fetchData();
    }, [router]);

    async function handleStatusChange(jobId: number, newStatus: string) {
        setUpdatingId(jobId);
        try {
            await updateJobStatus({
                job_id: jobId,
                status: newStatus
            });
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
        } catch { 
            alert("Failed to update status"); 
        } finally { 
            setUpdatingId(null); 
        }
    }

    const filtered = statusFilter === "all" 
        ? jobs 
        : jobs.filter(j => j.status?.toLowerCase() === statusFilter.toLowerCase());

    const stats = [
        { label: "Applied", value: jobs.filter(j => j.status?.toLowerCase() === "applied").length, color: BRAND.green },
        { label: "Rejected", value: jobs.filter(j => j.status?.toLowerCase() === "job_rejected").length, color: BRAND.blue  },
        { label: "Interviewing", value: jobs.filter(j => j.status?.toLowerCase() === "interviewing").length, color: BRAND.amber  },
        { label: "Ghosted", value: jobs.filter(j => j.status?.toLowerCase() === "ghosted").length, color: BRAND.muted },
    ];

    const gridTemplate = "1.5fr 0.6fr 0.6fr 0.6fr 1fr";

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
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: BRAND.navy, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>
                        Applications
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: BRAND.muted }}>
                        Track your pipeline metrics and update submission statuses.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", marginBottom: "2rem" }}>
                    {/* stat cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                        {stats.map(s => (
                            <div key={s.label} style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "1.1rem 1.25rem" }}>
                                <p style={{ fontSize: "0.7rem", color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
                                <p style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.03em" }}>{s.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* mini bar chart */}
                    <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "1.25rem" }}>
                        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 1rem" }}>Status</p>
                        <MiniChart jobs={jobs} statuses={["applied", "job_rejected", "ghosted", "interviewing"]} />
                    </div>
                </div>

                {/* table */}
                <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 1.5rem", borderBottom: `1px solid ${BRAND.border}`, gap: "1rem" }}>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: BRAND.navy, margin: 0, flexShrink: 0 }}>
                            {filtered.length} job{filtered.length !== 1 ? "s" : ""}
                            {statusFilter !== "all" && ` · ${statusFilter}`}
                        </p>

                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", flex: 1 }}>
                            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                                {["all", ...DEFAULT_STATUSES].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        style={{
                                        padding: "0.25rem 0.65rem", borderRadius: "100px", cursor: "pointer",
                                        fontSize: "0.72rem", fontWeight: 500,
                                        border: `1px solid ${statusFilter === s ? BRAND.blue : BRAND.border}`,
                                        background: statusFilter === s ? BRAND.blueLight : BRAND.surface,
                                        color: statusFilter === s ? BRAND.blue : BRAND.muted,
                                        textTransform: "capitalize"
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        display: "grid", gridTemplateColumns: gridTemplate,
                        padding: "0.55rem 1.5rem", background: BRAND.bg, borderBottom: `1px solid ${BRAND.border}`,
                    }}>
                        {["Role", "Company", "Status", "Score", "Update status"].map(h => (
                            <p key={h} style={{ fontSize: "0.68rem", fontWeight: 600, color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
                        ))}
                    </div>

                    <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: "3rem", textAlign: "center", color: BRAND.muted, fontSize: "0.875rem" }}>
                                No jobs with status "{statusFilter}" yet.
                            </div>
                        ) : (
                            filtered.map((job) => (
                                <div key={job.id}>
                                <div style={{
                                    display: "grid", gridTemplateColumns: gridTemplate,
                                    padding: "0.875rem 1.5rem", alignItems: "center",
                                    borderBottom: `1px solid ${BRAND.borderLight}`,
                                }}>
                                    <div style={{ minWidth: 0, paddingRight: "0.5rem" }}>
                                        <p style={{ fontSize: "0.875rem", fontWeight: 500, color: BRAND.navy, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={job.title}>
                                            {job.title}
                                        </p>
                                        {job.location && (
                                            <p style={{ fontSize: "0.72rem", color: BRAND.faint, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>📍 {job.location}</p>
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
                                        background: BRAND.blueLight, color: BRAND.blue,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.78rem", fontWeight: 700,
                                    }}>
                                        {job.score ?? "—"}
                                    </div>

                                    <div>
                                        <select
                                            value={job.status?.toLowerCase() || "applied"}
                                            disabled={updatingId === job.id}
                                            onChange={(e) => handleStatusChange(job.id, e.target.value)}
                                            style={{
                                            padding: "0.3rem 0.5rem", borderRadius: "6px",
                                            border: `1px solid ${BRAND.border}`, background: BRAND.bg,
                                            color: BRAND.navy, fontSize: "0.78rem", cursor: "pointer",
                                            opacity: updatingId === job.id ? 0.5 : 1,
                                            width: "100%",
                                            maxWidth: "135px",
                                            textTransform: "capitalize"
                                            }}
                                        >
                                            {DEFAULT_STATUSES.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}