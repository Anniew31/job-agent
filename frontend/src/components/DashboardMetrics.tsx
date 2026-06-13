"use client";

import { BRAND } from "../lib/theme"; 

interface JobApplication {
    title: string;
    company: string;
    score: number;
    status: "pending" | "reviewed" | "accepted" | "rejected" | "applied" | string;
}

interface DashboardMetricsProps { 
    applications: JobApplication[]; 
    isDashboardView?: boolean; 
}

export default function DashboardMetrics({ applications = [], isDashboardView = false }: DashboardMetricsProps) {
  
    const scrapedCount = applications.filter(app => app.status === "pending").length;
    const reviewedCount = applications.filter(app => app.status === "reviewed").length;
    const acceptedCount = applications.filter(app => app.status === "accepted").length;
    const appliedCount = applications.filter(app => app.status === "applied").length;

    const getStatusStyles = (status: string) => {
    switch(status.toLowerCase()) {
        case "applied": return { text: BRAND.green, bg: BRAND.greenBg };
        case "reviewed": case "reviewing": return { text: BRAND.amber, bg: BRAND.amberBg };
        case "accepted": return { text: BRAND.amber, bg: BRAND.amberBg};
        case "rejected": return { text: BRAND.red, bg: BRAND.redBg };
        default: return { text: BRAND.navy, bg: BRAND.blueLight };
    }
    };

    return (
        <section style={{ 
            width: "100%", 
            maxWidth: isDashboardView ? "1200px" : "900px", 
            margin: isDashboardView ? "0 auto" : "5rem auto", 
            padding: isDashboardView ? "0" : "0 2rem",
            boxSizing: "border-box"
        }}>
            {!isDashboardView && (
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: BRAND.blue, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>dashboard</p>
                <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: BRAND.navy, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Track every application</h2>
                <p style={{ fontSize: "0.95rem", color: BRAND.muted }}>Edit status, view AI scores, and see your pipeline at a glance.</p>
            </div>
            )}

            <div style={{
                background: BRAND.surface, 
                borderRadius: "16px",border: `1px solid ${BRAND.border}`, 
                overflow: "hidden",
                boxShadow: isDashboardView ? "none" : "0 4px 32px rgba(59,111,212,0.06)",
                width: "100%",
                boxSizing: "border-box"
            }}>
                <div style={{display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: `1px solid ${BRAND.border}`}}>
                    {[
                        { label: "Found", value: scrapedCount, color: BRAND.navy },
                        { label: "Reviewed", value: reviewedCount, color: BRAND.blue },
                        { label: "Accepted", value: acceptedCount, color: BRAND.amber },
                        { label: "Applied", value: appliedCount, color: BRAND.green },
                    ].map((s, i, arr) => (
                        <div key={s.label} style={{padding: "1.25rem 1.5rem", borderRight: i < arr.length - 1 ? `1px solid ${BRAND.border}` : "none"}}>
                            <p style={{ fontSize: "0.72rem", color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
                            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.03em" }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div style={{display: "grid", gridTemplateColumns: "2fr 1.2fr 0.6fr 1fr", gap: "0.75rem",padding: "0.6rem 1.5rem", background: BRAND.bg, borderBottom: `1px solid ${BRAND.border}`}}>
                    {["Job", "Company", "Score", "Status"].map((h) => (
                        <p key={h} style={{ fontSize: "0.68rem", fontWeight: 600, color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
                    ))}
                </div>

                {applications.length > 0 ? (applications.map((job, i) => {
                    const statusStyle = getStatusStyles(job.status);
                    return (
                        <div key={`${job.company}-${i}`} style={{
                            display: "grid", 
                            gridTemplateColumns: "2fr 1.2fr 0.6fr 1fr",
                            gap: "0.75rem",
                            padding: "0.9rem 1.5rem", 
                            alignItems: "center",
                            borderBottom: i < applications.length - 1 ? `1px solid ${BRAND.borderLight}` : "none",
                        }}>
                            <p style={{ fontSize: "0.8rem", fontWeight: 500, color: BRAND.navy, margin: 0 }}>{job.title}</p>
                            <p style={{ fontSize: "0.825rem", color: BRAND.muted, margin: 0 }}>{job.company}</p>
                            <div style={{width: 36, height: 36, borderRadius: "50%",background: BRAND.blueLight, display: "flex",alignItems: "center", justifyContent: "center",fontSize: "0.8rem", fontWeight: 700, color: BRAND.blue}}>
                                {job.score}
                            </div>
                        <div>
                            <span style={{
                                fontSize: "0.75rem", 
                                fontWeight: 500,
                                color: statusStyle.text, 
                                background: statusStyle.bg,
                                padding: "0.25rem 0.65rem", 
                                borderRadius: "100px",
                                display: "inline-block",
                                textTransform: "capitalize"
                            }}>{job.status}</span>
                        </div>
                    </div>
                    );
                })
            ) : (
                    <div style={{ padding: "3rem", textAlign: "center", color: BRAND.faint, fontSize: "0.875rem" }}>
                        No current job applications tracked yet.
                    </div>
                )}
            </div>
        </section>
    );
}