"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/src/lib/theme";
import Navbar from "@/src/components/NavBar";
import router from "next/router";
import { isLoggedIn } from "@/src/lib/auth";
import { getReviewData, getJobs, updateJobStatus } from "@/src/lib/api";
import SwipeCard from "@/src/components/SwipeCard";

export default function ReviewMatchesPage() {
    const [jobs, setJobs] = useState<any>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sessionAccepted, setSessionAccepted] = useState(0);
    const [sessionPassed, setSessionPassed] = useState(0);
    const [decisions, setDecisions] = useState<{ title: string; company: string; accepted: boolean }[]>([]);
    const [allTimeStats, setAllTimeStats] = useState<any>([]);
    const accepted = sessionAccepted;
    const currentCard = jobs[currentIndex];
    const remainingCount = jobs.length - currentIndex;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const totalReadyToTailor = (allTimeStats?.total_accepted ?? 0) + sessionAccepted;

    useEffect(() => {
        if (!isLoggedIn()) {
            router.push("/login");
            return;
        }

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const [reviewRes, jobsRes] = await Promise.all([
                    getReviewData(),
                    getJobs("scored")
                ]);
                setAllTimeStats(reviewRes);
                setJobs(jobsRes);
            } catch {
                setError("Failed to load scoring data.");
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [router]);

    const handleDecision = async (accepted: boolean) => {
        if (!currentCard) return;
        const targetJobId = currentCard.id;

        setDecisions(prev => [
            { title: currentCard.title, company: currentCard.company, accepted },
            ...prev
        ]);

        if (accepted) setSessionAccepted(p => p + 1);
        else setSessionPassed(p => p + 1);

        setCurrentIndex(p => p + 1);

        try {
            const [updateRes, reviewRes] = await Promise.all([
                updateJobStatus({
                    job_id: targetJobId,
                    accepted: accepted
                }),
                getReviewData()
            ]);
            setAllTimeStats(reviewRes)

        } catch (error) {
            console.error("Failed to sync decision with database:", error);
        }
    };

    return (
        <main style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, sans-serif" }}>
            <Navbar firstName="Alex" />

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2.5rem 4rem" }}>
                
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: BRAND.navy, margin: "0 0 0.25rem" }}>
                        Review Matches
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: BRAND.muted }}>
                        Go through scored jobs. Accepted options move directly to your tailoring queue.
                    </p>
                </div>

                {loading && (
                    <div style={{ 
                        textAlign: "center", padding: "5rem 2rem", background: BRAND.surface, 
                        borderRadius: "16px", border: `1px solid ${BRAND.border}`, color: BRAND.muted 
                    }}>
                        <div style={{ fontSize: "1.1rem", fontWeight: 600, color: BRAND.navy, marginBottom: "0.25rem" }}>
                            Loading matches...
                        </div>
                        <p style={{ margin: 0, fontSize: "0.85rem" }}>Gathering your tailored AI recommendations.</p>
                    </div>
                )}

                {error && !loading && (
                    <div style={{ 
                        padding: "1.25rem", background: BRAND.surface, borderRadius: "12px", 
                        border: `1px solid ${BRAND.border}`, borderLeft: `4px solid ${BRAND.blue}`, color: BRAND.navy 
                    }}>
                        <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600 }}>{error}</p>
                        <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: BRAND.muted }}>
                            Please try refreshing the page or checking your connection.
                        </p>
                    </div>
                )}

                {!loading && !error && (
                    <>
                    {/* All Time Stats */}
                    <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2.5rem" }}>
                        <div style={{ 
                            flex: 1, background: BRAND.surface, border: `1px solid ${BRAND.border}`, 
                            borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.01)"
                        }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: BRAND.muted, marginBottom: "0.5rem" }}>
                                ALL-TIME REVIEWED
                            </div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: BRAND.blue }}>
                                {allTimeStats.total_reviewed}
                            </div>
                        </div>

                        <div style={{ 
                            flex: 1, background: BRAND.surface, border: `1px solid ${BRAND.border}`, 
                            borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.01)"
                        }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: BRAND.muted, marginBottom: "0.5rem" }}>
                                TOTAL ACCEPTED
                            </div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: BRAND.green }}>
                                {allTimeStats.total_accepted}
                            </div>
                        </div>

                        <div style={{ 
                            flex: 1, background: BRAND.surface, border: `1px solid ${BRAND.border}`, 
                            borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.01)"
                        }}>
                            <div style={{ fontSize: "0.8rem", fontWeight: 500, color: BRAND.muted, marginBottom: "0.5rem" }}>
                                TOTAL PASSED
                            </div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 700, color: BRAND.amber}}>
                                {allTimeStats.total_rejected}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: "1.5rem", minHeight: "450px", alignItems: "flex-start" }}>
                        
                        {/* Recent Decisions */}
                        <div style={{ 
                            flex: "1 0 300px", 
                            maxWidth: "300px",
                            boxSizing: "border-box",
                            background: BRAND.surface, 
                            padding: "1.25rem", 
                            height: "400px", 
                            borderRadius: "12px", 
                            border: `1px solid ${BRAND.border}`,
                            display: "flex", 
                            flexDirection: "column",
                        }}>
                            <h4 style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: BRAND.navy, fontWeight: 600, flexShrink: 0 }}>
                                Recent Decisions
                            </h4>
                            <div style={{ 
                                overflowY: "auto", 
                                flex: 1, 
                                display: "flex", 
                                flexDirection: "column", 
                                gap: "0.75rem",
                                minWidth: 0
                            }}>
                                {decisions.length === 0 ? (
                                    <p style={{ fontSize: "0.8rem", color: BRAND.muted, margin: 0 }}>No decisions made yet.</p>
                                ) : (
                                    decisions.map((d, idx) => (
                                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem", minWidth: 0, flexShrink: 0 }}>
                                            <span style={{ color: d.accepted ? BRAND.blue : BRAND.muted, fontWeight: "bold", flexShrink: 0 }}>
                                                {d.accepted ? "✓" : "✕"}
                                            </span>
                                            <span style={{ 
                                                color: BRAND.muted, 
                                                overflow: "hidden", 
                                                textOverflow: "ellipsis", 
                                                whiteSpace: "nowrap", 
                                                minWidth: 0, 
                                                flex: 1 
                                            }} title={`${d.company} — ${d.title}`}>
                                                {d.company} — {d.title}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Swipe Card */}
                        {jobs[currentIndex] && (
                            <SwipeCard
                                job={jobs[currentIndex]}
                                currentIndex={currentIndex}
                                total={jobs.length}
                                onAccept={() => handleDecision(true)}
                                onPass={() => handleDecision(false)}
                            />
                        )}

                        {/* Session Stats */}
                        <div style={{ 
                            flex: "0 0 220px", background: BRAND.surface, padding: "1.25rem", 
                            borderRadius: "12px", border: `1px solid ${BRAND.border}` 
                        }}>
                            <h4 style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: BRAND.navy, fontWeight: 600 }}>Quick Stats</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontSize: "0.85rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: BRAND.muted }}>Accepted:</span>
                                    <strong style={{ color: BRAND.muted }}>+{sessionAccepted}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span style={{ color: BRAND.muted }}>Passed:</span>
                                    <strong style={{ color: BRAND.muted }}>+{sessionPassed}</strong>
                                </div>
                                <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${BRAND.border}`, paddingTop: "0.5rem" }}>
                                    <span style={{ color: BRAND.muted }}>Remaining:</span>
                                    <strong style={{ color: BRAND.muted }}>{remainingCount}</strong>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* next step */}
                    <div style={{ 
                        marginTop: "3rem", background: BRAND.surface, borderRadius: "12px", 
                        border: `1px solid ${BRAND.border}`, padding: "1.25rem 1.75rem", 
                        display: "flex", justifyContent: "space-between", alignItems: "center" 
                    }}>
                        <div>
                            <p style={{ fontSize: "0.95rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 2px" }}>
                                {totalReadyToTailor} total {totalReadyToTailor === 1 ? 'job' : 'jobs'} ready to tailor
                            </p>
                            <p style={{ fontSize: "0.85rem", color: BRAND.muted, margin: 0 }}>
                                Ready to tailor your resume and create custom cover letters?
                            </p>
                        </div>
                        <button 
                            disabled={totalReadyToTailor === 0}
                            style={{ 
                                padding: "0.65rem 1.5rem", borderRadius: "8px", border: "none", 
                                background: totalReadyToTailor === 0 ? BRAND.border : BRAND.blue, 
                                color: totalReadyToTailor === 0 ? BRAND.muted : "white", fontSize: "0.875rem", fontWeight: 600, 
                                cursor: totalReadyToTailor === 0 ? "not-allowed" : "pointer" 
                            }}
                        >
                            Ready to tailor →
                        </button>
                    </div>
                    </>
                )}
            </div>               
        </main>
    );
}