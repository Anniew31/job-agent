"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/src/lib/auth";
import { getProfile, getFinderAnalytics, getRecentJobs } from "@/src/lib/api";
import { BRAND } from "@/src/lib/theme";
import Navbar from "@/src/components/NavBar";

export default function FindingJobsPage() {
    const router = useRouter();

    const [profileData, setProfileData] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFinding, setIsFinding] = useState(false);

    const firstName = profileData?.name?.split(" ")[0] || "there";
    const pendingJobsCount = recentJobs.filter(job => job.status === "pending").length;

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/login");
            return;
    }

    async function fetchData() {
        try {
            setLoading(true);
            setError(null);

            const [profileRes, analyticsRes, jobsRes] = await Promise.all([
                getProfile(),
                getFinderAnalytics(),
                getRecentJobs(),
            ]);

            setProfileData(profileRes);
            setChartData(analyticsRes || []);
            setRecentJobs(jobsRes || []);
        } catch (err) {
            setError("Failed to get data.");
        } finally {
            setLoading(false);
        }
    }
    fetchData();
    }, [router]);

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <p style={{ color: BRAND.muted, fontSize: "0.9rem", fontWeight: 500 }}>Loading Data</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
                <p style={{ color: BRAND.red, fontSize: "0.9rem" }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    style={{ background: BRAND.blue, color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    const handleTriggerScraper = async () => {
        setIsFinding(true);
        setTimeout(() => {
            setIsFinding(false);
        }, 4000);
    };

    return (
        <main style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
            <Navbar firstName={firstName} />
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2.5rem 4rem" }}>
            
                {/* Page Header */}
                <div style={{ marginBottom: "2.5rem" }}>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: BRAND.navy, margin: "0 0 0.25rem 0", letterSpacing: "-0.02em" }}>
                        Finding Jobs
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: BRAND.muted }}>
                        Scan platforms to collect and pull new matching listings into your pipeline.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem", alignItems: "start" }}>
                
                    {/* Trend Line Graph Section */}
                    <div style={{ background: "white", padding: "1.75rem", borderRadius: "12px", border: `1px solid ${BRAND.border}` }}>
                        <h3 style={{ margin: "0 0 1.5rem 0", fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy }}>
                            Yield Frequency (7 Days)
                        </h3>
                        
                        <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: "8px", border: `1px dashed ${BRAND.border}` }}>
                            <p style={{ color: BRAND.muted, fontSize: "0.85rem" }}>[ SVG Trend Line Vector Grid Goes Here ]</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div style={{ background: "white", padding: "1.75rem", borderRadius: "12px", border: `1px solid ${BRAND.border}` }}>
                            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy }}>
                                Search Filters
                            </h3>
                            <p style={{ margin: "0 1.5rem 1.5rem 0", fontSize: "0.85rem", color: BRAND.muted, lineHeight: "1.4" }}>
                                Trigger your job search criteria instantly to find new vacancies matching your target parameters.
                            </p>

                            <button
                                onClick={handleTriggerScraper}
                                disabled={isFinding}
                                style={{
                                width: "100%",
                                padding: "0.75rem",
                                background: isFinding ? BRAND.border : BRAND.blue,
                                color: isFinding ? BRAND.muted : "white",
                                border: "none",
                                borderRadius: "8px",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                                cursor: isFinding ? "not-allowed" : "pointer",
                                transition: "background 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px"
                                }}
                            >
                                {isFinding ? (
                                    <>
                                        <span className="spinner" /> 
                                        Finding jobs...
                                    </>
                                ) : ("Discover Jobs")}
                            </button>
                        </div>

                        {/* Live Stats Card */}
                        <div style={{ background: "white", padding: "1.25rem 1.5rem", borderRadius: "12px", border: `1px solid ${BRAND.border}`, display: "flex", justifyContent: "between", alignItems: "center" }}>
                            <div>
                                <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: BRAND.muted, fontWeight: 600 }}>
                                    Queue Backlog
                                </span>
                                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: BRAND.navy, marginTop: "0.25rem" }}>
                                    {pendingJobsCount} <span style={{ fontSize: "0.85rem", fontWeight: 400, color: BRAND.muted }}>unscored</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Most Recently Found Jobs History Table */}
                <div style={{ marginTop: "2.5rem", background: "white", borderRadius: "12px", border: `1px solid ${BRAND.border}`, overflow: "hidden" }}>
                    <div style={{ padding: "1.5rem 1.75rem", borderBottom: `1px solid ${BRAND.border}` }}>
                        <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy }}>
                            Recent Activity Log
                        </h3>
                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: BRAND.muted }}>
                            A live view of the latest matching job openings found.
                        </p>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        {recentJobs.length === 0 ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: BRAND.muted, fontSize: "0.9rem" }}>
                            No active listings found in your pipeline yet. Click "Find Jobs" to scan for jobs.
                        </div>
                        ) : (
                        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                            <thead>
                                <tr style={{ background: "#f9fafb", borderBottom: `1px solid ${BRAND.border}` }}>
                                    <th style={{ padding: "0.85rem 1.75rem", fontSize: "0.75rem", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Role Title</th>
                                    <th style={{ padding: "0.85rem 1.75rem", fontSize: "0.75rem", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Company</th>
                                    <th style={{ padding: "0.85rem 1.75rem", fontSize: "0.75rem", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Discovered</th>
                                    <th style={{ padding: "0.85rem 1.75rem", fontSize: "0.75rem", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                </tr>
                            </thead>

                            <tbody>
                                {recentJobs.slice(0, 10).map((job: any) => (
                                    <tr key={job.id} style={{ borderBottom: `1px solid ${BRAND.border}`, transition: "background 0.15s ease" }} className="table-row-hover">
                                    <td style={{ padding: "1rem 1.75rem", fontSize: "0.9rem", fontWeight: 500, color: BRAND.navy }}>
                                        {job.title || "Untitled Role"}
                                    </td>
                                    
                                    <td style={{ padding: "1rem 1.75rem", fontSize: "0.9rem", color: BRAND.muted }}>
                                        {job.company || "Unknown Company"}
                                    </td>
                                    
                                    <td style={{ padding: "1rem 1.75rem", fontSize: "0.85rem", color: BRAND.muted }}>
                                        {job.formatted_time || job.scraped_at || "Just now"}
                                    </td>
                                    
                                    <td style={{ padding: "1rem 1.75rem" }}>
                                        <span style={{
                                            display: "inline-block",
                                            padding: "0.25rem 0.5rem",
                                            borderRadius: "4px",
                                            fontSize: "0.75rem",
                                            fontWeight: 600,
                                            textTransform: "capitalize",
                                            background: job.status === "pending" ? BRAND.blueLight : "#f3f4f6",
                                            color: job.status === "pending" ? BRAND.blue : BRAND.muted
                                        }}>
                                            {job.status}
                                        </span>
                                    </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
            .spinner {
                width: 16px;
                height: 16px;
                border: 2px solid rgba(0,0,0,0.1);
                border-top-color: #666;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            `}</style>
        </main>
  );
}