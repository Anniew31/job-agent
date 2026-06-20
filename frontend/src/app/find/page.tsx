"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/src/lib/auth";
import { getProfile, getFinderAnalytics, getJobs, scrape, getMetrics, updateBasicProfile } from "@/src/lib/api";
import { BRAND } from "@/src/lib/theme";
import Navbar from "@/src/components/NavBar";
import Chart from "@/src/components/Chart"

export default function FindingJobsPage() {
    const router = useRouter();

    const [profileData, setProfileData] = useState<any>(null);
    const [metrics, setMetrics] = useState<any>(null);
    const [chartData, setChartData] = useState<any[]>([]);
    const [recentJobs, setRecentJobs] = useState<any[]>([]);
    const [newKeywordInput, setNewKeywordInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFinding, setIsFinding] = useState(false);

    const firstName = profileData?.name?.split(" ")[0] || "there";

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/login");
            return;
    }

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const [profileRes, analyticsRes,jobsRes, metricsRes] = await Promise.all([
                    getProfile(),      
                    getFinderAnalytics(),
                    getJobs(),
                    getMetrics() 
                ]);

                if (profileRes && typeof profileRes.target_roles === "string") {
                    profileRes.target_roles = profileRes.target_roles
                        ? profileRes.target_roles.split(", ").filter(Boolean)
                        : [];
                } else if (!profileRes.target_roles) {
                    profileRes.target_roles = [];
                }

                setProfileData(profileRes);
                setChartData(analyticsRes || []);
                setRecentJobs(jobsRes || []);
                setMetrics(metricsRes);
            } catch (err) {
                setError("Failed to synchronize active workspace telemetry layers.");
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

    const saveUpdatedRolesToProfile = async (nextRolesList: string[]) => {
        try {
            const updatedPayload = {
                name: profileData.name,
                phone: profileData.phone,
                location: profileData.location,
                role_type: profileData.role_type,
                work_preference: profileData.work_preference,
                target_roles: nextRolesList
            };

            setProfileData({ ...profileData, target_roles: nextRolesList });
            await updateBasicProfile(updatedPayload);
        } catch (err) {
            alert("Could not commit target role choices. Re-syncing target roles...");
            const resetProfile = await getProfile();
            if (resetProfile && typeof resetProfile.target_roles === "string") {
                resetProfile.target_roles = resetProfile.target_roles ? resetProfile.target_roles.split(", ").filter(Boolean) : [];
            }
            setProfileData(resetProfile);
        }
    };

    const handleTriggerScraper = async () => {
        try {
            setIsFinding(true);
            await scrape();
            setTimeout(async () => {
                const [jobsRes, metricsRes, analyticsRes] = await Promise.all([
                    getJobs(),
                    getMetrics(),
                    getFinderAnalytics(),
                ]);
                setRecentJobs(jobsRes || []);
                setMetrics(metricsRes);
                setIsFinding(false);
                setChartData(analyticsRes || []);
            }, 2000);
        } catch (err) {
            setIsFinding(false);
        }
    };

    const handleAddRolePill = () => {
        const cleanInput = newKeywordInput.trim();
        const existingRoles = profileData?.target_roles || [];
        
        if (cleanInput && !existingRoles.includes(cleanInput)) {
            const updatedRoles = [...existingRoles, cleanInput];
            setNewKeywordInput("");
            saveUpdatedRolesToProfile(updatedRoles);
        }
    };

    const handleRemoveRolePill = (roleToRemove: string) => {
        const existingRoles = profileData?.target_roles || [];
        const updatedRoles = existingRoles.filter((role: string) => role !== roleToRemove);
        saveUpdatedRolesToProfile(updatedRoles);
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
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy }}>
                                History of Found Jobs
                            </h3>
                            <span style={{ fontSize: "0.8rem", color: BRAND.muted, background: "#f3f4f6", padding: "2px 8px", borderRadius: "4px", fontWeight: 500 }}>
                                7-Day Timeline
                            </span>
                        </div>
                        <div style={{ padding: "0.5rem 0" }}>
                            <Chart data={chartData} />
                        </div>
                    </div>

                    {/* Controls*/}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                        <div style={{ background: "white", padding: "1.75rem", borderRadius: "12px", border: `1px solid ${BRAND.border}` }}>
                            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", color: BRAND.muted, fontWeight: 600 }}>
                                Search Parameters
                            </span>
                            <div style={{ marginTop: "1rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: BRAND.navy, marginBottom: "0.6rem" }}>
                                    Target Roles to Find
                                </label>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                    {(profileData?.target_roles || []).map((role: string, index: number) => (
                                        <div 
                                            key={index} 
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "4px",
                                                background: "#eff6ff",
                                                color: BRAND.blue,
                                                padding: "0.25rem 0.6rem",
                                                borderRadius: "16px",
                                                fontSize: "0.8rem",
                                                fontWeight: 500,
                                                border: "1px solid #bfdbfe"
                                            }}
                                        >
                                            <span>{role}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveRolePill(role)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: BRAND.blue,
                                                    cursor: "pointer",
                                                    fontSize: "0.95rem",
                                                    padding: "0 2px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    fontWeight: 600
                                                }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                    {(profileData?.target_roles || []).length === 0 && (
                                        <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.8rem", color: BRAND.muted, fontStyle: "italic" }}>
                                            No target roles added yet. Type a role below to begin.
                                        </p>
                                    )}
                                </div>

                                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                                    <input
                                        type="text"
                                        placeholder="e.g. React Developer"
                                        value={newKeywordInput}
                                        onChange={(e) => setNewKeywordInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddRolePill();
                                            }
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: "0.5rem 0.75rem",
                                            border: `1px solid ${BRAND.border}`,
                                            borderRadius: "6px",
                                            fontSize: "0.85rem",
                                            outline: "none",
                                            fontFamily: "inherit"
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddRolePill}
                                        style={{
                                            padding: "0.5rem 1rem",
                                            background: "#f3f4f6",
                                            color: BRAND.navy,
                                            border: `1px solid ${BRAND.border}`,
                                            borderRadius: "6px",
                                            fontSize: "0.85rem",
                                            fontWeight: 500,
                                            cursor: "pointer"
                                        }}
                                    >
                                        Add
                                    </button>
                                </div>

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
                        </div>

                        {/* Live Stats */}
                        <div style={{ background: "white", padding: "1.25rem 1.5rem", borderRadius: "12px", border: `1px solid ${BRAND.border}` }}>
                            <div>
                                <span style={{ fontSize: "0.8rem", textTransform: "uppercase", color: BRAND.muted, fontWeight: 600 }}>
                                    Queue Backlog
                                </span>
                                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: BRAND.navy, marginTop: "0.25rem" }}>
                                    {metrics?.scraped_count || 0} <span style={{ fontSize: "0.85rem", fontWeight: 400, color: BRAND.muted }}>unscored</span>
                                </div>
                            </div>
                            <button
                                onClick={() => router.push("/score")}
                                disabled={(metrics?.scraped_count || 0) === 0}
                                style={{
                                    width: "100%",
                                    padding: "0.65rem",
                                    marginTop: "1rem",
                                    background: (metrics?.scraped_count || 0) === 0 ? "#f3f4f6" : BRAND.blue,
                                    color: (metrics?.scraped_count || 0) === 0 ? BRAND.muted : "white",
                                    border: "none",
                                    borderRadius: "6px",
                                    fontWeight: 600,
                                    fontSize: "0.85rem",
                                    cursor: (metrics?.scraped_count || 0) === 0 ? "not-allowed" : "pointer",
                                    transition: "all 0.15s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: "6px",
                                    boxShadow: (metrics?.scraped_count || 0) === 0 ? "none" : "0 1px 2px rgba(0,0,0,0.05)"
                                }}
                                onMouseEnter={(e) => {
                                    if ((metrics?.scraped_count || 0) > 0) {
                                        e.currentTarget.style.background = "#2563eb";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if ((metrics?.scraped_count || 0) > 0) {
                                        e.currentTarget.style.background = BRAND.blue;
                                    } else {
                                        e.currentTarget.style.background = "#f3f4f6";
                                    }
                                }}
                            >
                                Score Pending Jobs
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
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

                    {recentJobs.length === 0 ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: BRAND.muted, fontSize: "0.9rem" }}>
                            No listings with "pending" status found in your pipeline. Click "Find Jobs" to scan for jobs.
                        </div>
                    ) : (
                        <div style={{ maxHeight: "400px", overflowY: "auto", overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                                <thead style={{ position: "sticky", top: 0, background: "#f9fafb", zIndex: 1, boxShadow: "0 1px 0 rgba(0,0,0,0.05)" }}>
                                    <tr>
                                        <th style={{ padding: "0.85rem 1.75rem", fontSize: "0.75rem", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Role Title</th>
                                        <th style={{ padding: "0.85rem 1.75rem", fontSize: "0.75rem", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Company</th>
                                        <th style={{ padding: "0.85rem 1.75rem", fontSize: "0.75rem", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Discovered</th>
                                        <th style={{ padding: "0.85rem 1.75rem", fontSize: "0.75rem", fontWeight: 600, color: BRAND.muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentJobs.map((job: any) => (
                                        <tr key={job.id} style={{ borderBottom: `1px solid ${BRAND.border}`, transition: "background 0.15s ease" }}>
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
                                                    background: job.status?.toLowerCase() === "pending" ? BRAND.blueLight : "#f3f4f6",
                                                    color: job.status?.toLowerCase() === "pending" ? BRAND.blue : BRAND.muted
                                                }}>
                                                    {job.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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