"use client";

import { BRAND } from "@/src/lib/theme";

interface ScoreHistogramProps {
    scores: {
        [scoreKey: string]: number;
    };
}

export default function ScoreHistogram({ scores }: ScoreHistogramProps) {
    const scoreData = scores || {};
    
    const buckets = Array.from({ length: 10 }, (_, i) => {
        const scoreNum = i + 1;
        return {
            score: scoreNum,
            count: scoreData[scoreNum] || 0, 
        };
    });

    const maxCount = Math.max(...Object.values(scoreData).map(Number), 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", height: "100%" }}>
            
            <div style={{
                height: 200,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                gap: "6px",
                paddingBottom: "8px",
                borderBottom: `1px solid ${BRAND.borderLight}`,
            }}>
                {buckets.map((b) => {
                    const heightPercent = maxCount > 0 ? (b.count / maxCount) * 100 : 0;
                    const hasJobs = b.count > 0;

                    return (
                        <div 
                            key={b.score} 
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "flex-end",
                                height: "100%",
                                position: "relative",
                            }}
                        >
                            {hasJobs && (
                                <span style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                    color: BRAND.navy,
                                    marginBottom: "4px",
                                    position: "absolute",
                                    bottom: `calc(${heightPercent}% + 4px)`,
                                }}>
                                    {b.count}
                                </span>
                            )}

                            <div style={{
                                width: "100%",
                                height: `${heightPercent}%`,
                                background: hasJobs ? BRAND.blue : BRAND.borderLight,
                                borderRadius: "4px 4px 0 0", 
                                transition: "height 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.2s ease",
                                cursor: hasJobs ? "pointer" : "default",
                            }} 
                            onMouseEnter={(e) => {
                                if (hasJobs) e.currentTarget.style.background = BRAND.navy;
                            }}
                            onMouseLeave={(e) => {
                                if (hasJobs) e.currentTarget.style.background = BRAND.blue;
                            }}
                            />
                        </div>
                    );
                })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: "6px" }}>
                {buckets.map((b) => (
                    <div 
                        key={b.score} 
                        style={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "0.75rem",
                            fontWeight: 500,
                            color: b.count > 0 ? BRAND.navyMid : BRAND.faint,
                        }}
                    >
                        {b.score}
                    </div>
                ))}
            </div>
        </div>
    );
}