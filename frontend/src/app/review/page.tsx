"use client";

import { useState } from "react";
import { BRAND } from "@/src/lib/theme";
import Navbar from "@/src/components/NavBar";

const MOCK_JOBS = [
    { id: 1, title: "Senior Software Engineer", company: "Stripe", location: "Remote", pay: "$85/hr", score: 9, reasoning: "Strong React & Next.js matching profile preferences." },
    { id: 2, title: "Product Designer", company: "Notion", location: "New York, NY", pay: "$65/hr", score: 6, reasoning: "Decent UI match, but requires heavy Figma interaction background." },
    { id: 3, title: "Frontend Specialist", company: "Linear", location: "Remote", pay: "$75/hr", score: 8, reasoning: "Excellent alignment with tailwind and state management requirements." }
];

export default function ReviewMatchesPage() {
    const [jobs] = useState(MOCK_JOBS);
    const [currentIndex, setCurrentIndex] = useState(0);
    
    const [sessionAccepted, setSessionAccepted] = useState(0);
    const [sessionPassed, setSessionPassed] = useState(0);
    const [decisions, setDecisions] = useState<{ title: string; company: string; accepted: boolean }[]>([]);

    const allTimeStats = { reviewed: 142, accepted: 48, passed: 94 };
    const accepted = sessionAccepted;

    const currentCard = jobs[currentIndex];
    const remainingCount = jobs.length - currentIndex;

    const handleDecision = (accepted: boolean) => {
        if (!currentCard) return;

        setDecisions(prev => [
            { title: currentCard.title, company: currentCard.company, accepted },
            ...prev
        ]);

        if (accepted) setSessionAccepted(p => p + 1);
        else setSessionPassed(p => p + 1);

        setCurrentIndex(p => p + 1);
    };

    return (
        <main style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, sans-serif" }}>
            <Navbar firstName="Alex" />

            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2.5rem 4rem" }}>
                
                {/* ─── PAGE HEADER ─── */}
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: BRAND.navy, margin: "0 0 0.25rem" }}>
                        Review Matches
                    </h1>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: BRAND.muted }}>
                        Go through scored jobs. Accepted options move directly to your tailoring queue.
                    </p>
                </div>

                {/* ─── ALL TIME STATS SECTION (3 LARGE BOXES) ─── */}
                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "2.5rem" }}>
                    {/* Box 1: Reviewed */}
                    <div style={{ 
                        flex: 1, background: BRAND.surface, border: `1px solid ${BRAND.border}`, 
                        borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.01)"
                    }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 500, color: BRAND.muted, marginBottom: "0.5rem" }}>
                            ALL-TIME REVIEWED
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 700, color: BRAND.blue }}>
                            {allTimeStats.reviewed + currentIndex}
                        </div>
                    </div>

                    {/* Box 2: Accepted */}
                    <div style={{ 
                        flex: 1, background: BRAND.surface, border: `1px solid ${BRAND.border}`, 
                        borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.01)"
                    }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 500, color: BRAND.muted, marginBottom: "0.5rem" }}>
                            TOTAL ACCEPTED
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 700, color: BRAND.green }}>
                            {allTimeStats.accepted + sessionAccepted}
                        </div>
                    </div>

                    {/* Box 3: Passed */}
                    <div style={{ 
                        flex: 1, background: BRAND.surface, border: `1px solid ${BRAND.border}`, 
                        borderRadius: "12px", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.01)"
                    }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 500, color: BRAND.muted, marginBottom: "0.5rem" }}>
                            TOTAL PASSED
                        </div>
                        <div style={{ fontSize: "1.8rem", fontWeight: 700, color: BRAND.amber}}>
                            {allTimeStats.passed + sessionPassed}
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", minHeight: "450px", alignItems: "flex-start" }}>
                    
                    {/* Recent Decisions */}
                    <div style={{ 
                        flex: "0 0 240px", background: BRAND.surface, padding: "1.25rem", 
                        borderRadius: "12px", border: `1px solid ${BRAND.border}`, minHeight: "350px" 
                    }}>
                        <h4 style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: BRAND.navy, fontWeight: 600 }}>Recent Decisions</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            {decisions.length === 0 ? (
                                <p style={{ fontSize: "0.8rem", color: BRAND.muted, margin: 0 }}>No decisions made yet.</p>
                            ) : (
                                decisions.map((d, idx) => (
                                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8rem" }}>
                                        <span style={{ color: d.accepted ? BRAND.blue : BRAND.muted, fontWeight: "bold" }}>
                                            {d.accepted ? "✓" : "✕"}
                                        </span>
                                        <span style={{ color: BRAND.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                            {d.company} — {d.title}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Swipe Card */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
                        {currentCard ? (
                            <>
                                <div style={{ 
                                    background: BRAND.surface, border: `1px solid ${BRAND.border}`, 
                                    borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "480px",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.02)", boxSizing: "border-box"
                                }}>
                                    <span style={{ fontSize: "0.75rem", color: BRAND.muted, background: BRAND.bg, padding: "3px 8px", borderRadius: "4px" }}>
                                        {currentCard.location}
                                    </span>
                                    <h2 style={{ fontSize: "1.4rem", margin: "0.75rem 0 0.25rem", color: BRAND.navy, fontWeight: 700 }}>{currentCard.title}</h2>
                                    <p style={{ margin: "0 0 1rem", color: BRAND.muted, fontSize: "0.95rem" }}>{currentCard.company} • {currentCard.pay}</p>
                                    
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "1.5rem 0", padding: "0.75rem", background: BRAND.blueLight, borderRadius: "8px" }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: BRAND.blue, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.9rem" }}>
                                            {currentCard.score}
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: BRAND.navy }}>
                                            <strong>AI Match Rating</strong>
                                        </div>
                                    </div>

                                    <p style={{ fontSize: "0.85rem", color: BRAND.muted, lineHeight: "1.4", background: BRAND.bg, padding: "1rem", borderRadius: "8px", borderLeft: `3px solid ${BRAND.blue}`, margin: 0 }}>
                                        "{currentCard.reasoning}"
                                    </p>
                                </div>

                                {/* Decision Action Buttons */}
                                <div style={{ display: "flex", gap: "1rem", width: "100%", maxWidth: "480px" }}>
                                    <button 
                                        onClick={() => handleDecision(false)}
                                        style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: `1px solid ${BRAND.border}`, background: BRAND.surface, color: BRAND.navy, fontWeight: 600, cursor: "pointer" }}
                                    >
                                        ✕ Pass
                                    </button>
                                    <button 
                                        onClick={() => handleDecision(true)}
                                        style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", border: "none", background: BRAND.blue, color: "white", fontWeight: 600, cursor: "pointer" }}
                                    >
                                        ✓ Accept
                                    </button>
                                </div>
                                
                                <span style={{ fontSize: "0.8rem", color: BRAND.muted }}>
                                    {currentIndex} of {jobs.length} reviewed this session
                                </span>
                            </>
                        ) : (
                            <div style={{ textAlign: "center", padding: "3rem", background: BRAND.surface, borderRadius: "16px", border: `1px solid ${BRAND.border}`, width: "100%", maxWidth: "480px" }}>
                                <p style={{ color: BRAND.muted, fontSize: "0.95rem", margin: "0 0 1rem" }}>🎉 Queue fully cleared!</p>
                                <span style={{ fontSize: "0.8rem", color: BRAND.muted }}>Find or score jobs to populate more jobs.</span>
                            </div>
                        )}
                    </div>

                    {/* Session Stats */}
                    <div style={{ 
                        flex: "0 0 220px", background: BRAND.surface, padding: "1.25rem", 
                        borderRadius: "12px", border: `1px solid ${BRAND.border}` 
                    }}>
                        <h4 style={{ margin: "0 0 1rem", fontSize: "0.85rem", color: BRAND.navy, fontWeight: 600 }}>Quick stats</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.85rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: BRAND.muted }}>Score avg:</span>
                                <strong style={{ color: BRAND.muted }}>7.7</strong>
                            </div>
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
                            {accepted} jobs accepted this session
                        </p>
                        <p style={{ fontSize: "0.85rem", color: BRAND.muted, margin: 0 }}>
                            Ready to tailor your resume and create custom cover letters?
                        </p>
                    </div>
                    <button 
                        disabled={accepted === 0}
                        style={{ 
                            padding: "0.65rem 1.5rem", borderRadius: "8px", border: "none", 
                            background: accepted === 0 ? BRAND.border : BRAND.blue, 
                            color: accepted === 0 ? BRAND.muted : "white", fontSize: "0.875rem", fontWeight: 600, 
                            cursor: accepted === 0 ? "not-allowed" : "pointer" 
                        }}
                    >
                        Ready to tailor →
                    </button>
                </div>

            </div>
        </main>
    );
}