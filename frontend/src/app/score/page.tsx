"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/src/lib/auth";
import { getMetrics, getJobs, score, getProfile, updatePreferences, getScoreData} from "@/src/lib/api";
import { BRAND } from "@/src/lib/theme";
import Navbar from "@/src/components/NavBar";
import Histogram from "@/src/components/Histogram"

export default function ScorePage() {
    const router = useRouter();

    const [metrics, setMetrics] = useState<any>(null);
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isScoring, setIsScoring] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [threshold, setThreshold] = useState(4);
    const [dealBreakers, setDealBreakers] = useState<string[]>([]);
    const [profile, setProfile] = useState<any>(null)
    const [histogramData, setHistogramData] = useState<any>(null);

    const firstName = "";

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/login");
            return;
        }

        async function fetchData() {
            try {
                setLoading(true);
                const [metricsRes, jobsRes, profileRes, histogramRes] = await Promise.all([
                    getMetrics(),
                    getJobs("scored"),
                    getProfile(),
                    getScoreData()
                ]);
                
                setMetrics(metricsRes);
                setJobs(jobsRes || []);
                setThreshold(profileRes.score_threshold ?? 4);
                setDealBreakers(profileRes.deal_breakers ?? []);
                setProfile(profileRes || []);
                setHistogramData(histogramRes || []);
            } catch {
                setError("Failed to load scoring data.");
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [router]);

    async function handleScore() {
        try {
            setIsScoring(true);
            await score();
            setTimeout(async () => {
                const [metricsRes, jobsRes] = await Promise.all([
                    getMetrics(),
                    getJobs("scored"),
                ]);
                setMetrics(metricsRes);
                setJobs(jobsRes || []);
                setIsScoring(false);
            }, 2000);
        } catch {
            setIsScoring(false);
        }
    }

    async function savePreferences(newThreshold: number, newDealBreakers: string[]) {
        try {
            await updatePreferences({
                salary_floor: profile?.salary_floor,
                salary_type: profile?.salary_type,
                deal_breakers: newDealBreakers,
                score_threshold: newThreshold,
            });
        } catch {
            alert("Failed to save preferences");
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <p style={{ color: BRAND.muted, fontSize: "0.9rem" }}>Loading scoring data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
                <p style={{ color: BRAND.red, fontSize: "0.9rem" }}>{error}</p>
                <button onClick={() => window.location.reload()} style={{ background: BRAND.blue, color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>
                    Retry
                </button>
            </div>
        );
    }

    const pendingCount = metrics?.scraped_count ?? 0;
    const reviewedCount = metrics?.reviewed_count ?? 0;
    const avgScore = metrics?.avg_score ?? 0;

    return (
        <main style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
            <Navbar firstName={firstName} />

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2.5rem 4rem" }}>

                {/* header */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: BRAND.navy, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>
                        Score Matches
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: BRAND.muted }}>
                        AI scores each pending job against your profile. Low fits are auto-rejected.
                    </p>
                </div>

                {/* stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                    {[
                        { label: "Pending", value: pendingCount, color: BRAND.blue },
                        { label: "Reviewed", value: reviewedCount, color: BRAND.green },
                        { label: "Avg score", value: avgScore, color: BRAND.amber },
                    ].map((s) => (
                        <div key={s.label} style={{
                            background: BRAND.surface, borderRadius: "12px",
                            border: `1px solid ${BRAND.border}`, padding: "1.25rem 1.5rem",
                        }}>
                            <p style={{ fontSize: "0.72rem", color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
                            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.03em" }}>{s.value}</p>
                        </div>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>

                    {/* chart*/}
                    <div style={{
                        background: BRAND.surface, borderRadius: "12px",
                        border: `1px solid ${BRAND.border}`, padding: "1.75rem",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy }}>Score Distribution</h3>
                            <span style={{ fontSize: "0.8rem", color: BRAND.muted, background: BRAND.bg, padding: "2px 8px", borderRadius: "4px", fontWeight: 500 }}>1 – 10</span>
                        </div>    
                        <div style={{ height: 200 }}>
                            <Histogram scores={histogramData} />
                        </div>
                    </div>

                    {/* scoring controls */}
                    <div style={{
                        background: BRAND.surface, borderRadius: "12px",
                        border: `1px solid ${BRAND.border}`, padding: "1.75rem",
                        display: "flex", flexDirection: "column", gap: "1.25rem",
                    }}>
                        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy }}>Scoring Controls</h3>

                        {/* score threshold */}
                        <div>
                            <p style={{ fontSize: "0.75rem", color: BRAND.muted, margin: "0 0 0.5rem" }}>Jobs scored under this threshold will be auto-rejected</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem",}}>
                                <input
                                    type="range" min={1} max={9}
                                    value={threshold}
                                    onChange={(e) => setThreshold(Number(e.target.value))}
                                    onPointerUp={(e) => savePreferences(Number((e.target as HTMLInputElement).value), dealBreakers)}
                                    style={{ flex: 1, accentColor: BRAND.blue }}
                                />
                                <div style={{
                                    width: 32, height: 32, borderRadius: "50%",
                                    background: BRAND.blueLight, color: BRAND.blue,
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "0.85rem", fontWeight: 700, flexShrink: 0,
                                }}>
                                    {threshold}
                                </div>
                            </div>
                        </div>

                        {/* deal breakers */}
                        <div>
                            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: BRAND.navyMid, marginBottom: "0.4rem" }}>
                                Deal-breakers
                            </label>
                            <p style={{ fontSize: "0.75rem", color: BRAND.muted, margin: "0 0 0.5rem" }}>Jobs violating these are auto-rejected</p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                {dealBreakers.map((d) => (
                                    <div key={d} style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "center",
                                        background: BRAND.bg, borderRadius: "6px",
                                        padding: "0.4rem 0.75rem", border: `1px solid ${BRAND.border}`,
                                    }}>
                                        <span style={{ fontSize: "0.8rem", color: BRAND.muted }}>{d}</span>
                                        <button
                                            onClick={() => {
                                                const updated = dealBreakers.filter(x => x !== d);
                                                setDealBreakers(updated);
                                                savePreferences(threshold, updated);
                                            }}
                                            style={{ border: "none", background: "none", color: BRAND.red, cursor: "pointer", fontSize: "0.8rem", fontWeight: 600 }}
                                        >✕</button>
                                    </div>
                                ))}

                                {/* add new deal-breaker */}
                                <input
                                    placeholder="Add a deal-breaker and press Enter"
                                    style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "6px", border: `1px solid ${BRAND.border}`, fontSize: "0.8rem", boxSizing: "border-box" }}
                                    onKeyDown={(e) => {
                                        const val = (e.target as HTMLInputElement).value.trim();
                                        if (e.key === "Enter" && val && !dealBreakers.includes(val)) {
                                            const updated = [...dealBreakers, val];
                                            setDealBreakers(updated);
                                            savePreferences(threshold, updated);
                                            (e.target as HTMLInputElement).value = "";
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* run button */}
                        <button
                            onClick={handleScore}
                            disabled={isScoring || pendingCount === 0}
                            style={{
                                width: "100%", padding: "0.75rem", borderRadius: "8px",
                                border: "none", marginTop: "auto",
                                background: (isScoring || pendingCount === 0) ? BRAND.faint : BRAND.blue,
                                color: "#fff", fontSize: "0.9rem", fontWeight: 600,
                                cursor: (isScoring || pendingCount === 0) ? "not-allowed" : "pointer",
                            }}
                        >
                            {isScoring ? "Scoring..." : `Score ${pendingCount} pending jobs`}
                        </button>
                    </div>
                </div>

                {/* scored jobs table */}
                <div style={{
                    background: BRAND.surface, borderRadius: "12px",
                    border: `1px solid ${BRAND.border}`, overflow: "hidden",
                    marginBottom: "2rem",
                }}>
                    <div style={{ padding: "1.25rem 1.75rem", borderBottom: `1px solid ${BRAND.border}` }}>
                        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy }}>Scored Jobs</h3>
                        <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: BRAND.muted }}>Jobs that have been scored and are waiting for your review.</p>
                    </div>

                    {jobs.length === 0 ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: BRAND.muted, fontSize: "0.875rem" }}>
                            No scored jobs yet — run the scorer above to get started.
                        </div>
                    ) : (
                        <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead style={{
                                    position: "sticky", top: 0,
                                    background: BRAND.bg, zIndex: 1,
                                    boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
                                }}>
                                    <tr>
                                        {["Role", "Company", "Score", "Reasoning", "Status"].map((h) => (
                                            <th key={h} style={{
                                                padding: "0.75rem 1.5rem",
                                                fontSize: "0.72rem", fontWeight: 600,
                                                color: BRAND.faint, textTransform: "uppercase",
                                                letterSpacing: "0.06em",
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.map((job: any) => (
                                        <tr key={job.id} style={{ borderTop: `1px solid ${BRAND.borderLight}` }}>
                                            <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", fontWeight: 500, color: BRAND.navy }}>{job.title}</td>
                                            <td style={{ padding: "1rem 1.5rem", fontSize: "0.85rem", color: BRAND.muted }}>{job.company}</td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: "50%",
                                                    background: BRAND.blueLight, color: BRAND.blue,
                                                    display: "flex", alignItems: "center", justifyContent: "center",
                                                    fontSize: "0.8rem", fontWeight: 700,
                                                }}>{job.score ?? "—"}</div>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem", fontSize: "0.8rem", color: BRAND.muted, maxWidth: 300 }}>
                                                <span style={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}>
                                                    {job.score_reasoning ?? "No reasoning available"}
                                                </span>
                                            </td>
                                            <td style={{ padding: "1rem 1.5rem" }}>
                                                <span style={{
                                                    fontSize: "0.73rem", fontWeight: 500,
                                                    padding: "0.2rem 0.6rem", borderRadius: "100px",
                                                    display: "inline-block", textTransform: "capitalize",
                                                    background: job.status === "reviewed" ? BRAND.greenBg : BRAND.blueLight,
                                                    color: job.status === "reviewed" ? BRAND.green : BRAND.blue,
                                                }}>{job.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* next step banner */}
                <div style={{
                    background: BRAND.surface, borderRadius: "12px",
                    border: `1px solid ${BRAND.border}`, padding: "1.25rem 1.75rem",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                    <div>
                        <p style={{ fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 2px" }}>
                            {reviewedCount} jobs ready to review
                        </p>
                        <p style={{ fontSize: "0.85rem", color: BRAND.muted, margin: 0 }}>
                            Swipe through scored jobs and accept or pass on each one.
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/review")}
                        disabled={reviewedCount === 0}
                        style={{
                            padding: "0.65rem 1.5rem", borderRadius: "8px", border: "none",
                            background: reviewedCount === 0 ? BRAND.faint : BRAND.blue,
                            color: "#fff", fontSize: "0.875rem", fontWeight: 600,
                            cursor: reviewedCount === 0 ? "not-allowed" : "pointer", flexShrink: 0,
                            transition: "background 0.2s ease"
                        }}
                    >
                        Start reviewing →
                    </button>
                </div>
            </div>
        </main>
    );
}