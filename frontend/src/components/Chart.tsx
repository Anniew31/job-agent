"use client";

import { BRAND } from "@/src/lib/theme";

interface HistoryChartProps {
  data: Array<{ formatted_date: string; jobs_found: number }>;
}

export default function HistoryChart({ data }: HistoryChartProps) {
    // fallback if no history metrics exist yet
    if (!data || data.length === 0) {
        return (
            <div style={{ height: "220px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", borderRadius: "8px" }}>
                <p style={{ color: BRAND.muted, fontSize: "0.85rem" }}>No search history available for this week.</p>
            </div>
        );
    }

    const svgWidth = 500;
    const svgHeight = 200;
    const paddingX = 40;
    const paddingY = 25;

    const chartWidth = svgWidth - paddingX * 2;
    const chartHeight = svgHeight - paddingY * 2;

    const maxJobs = Math.max(...data.map(d => d.jobs_found), 5);

    const points = data.map((item, index) => {
        const x = data.length === 1 
        ? paddingX + chartWidth / 2 
        : paddingX + (index / (data.length - 1)) * chartWidth;
        
        const y = paddingY + chartHeight - (item.jobs_found / maxJobs) * chartHeight;
        return { x, y, ...item };
  });

    const pathData = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

    const areaData = points.length > 0 
        ? `${pathData} L${points[points.length - 1].x},${svgHeight - paddingY} L${points[0].x},${svgHeight - paddingY} Z` 
        : "";

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="100%" style={{ overflow: "visible" }}>
                <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={BRAND.blue} stopOpacity="0.15" />
                    <stop offset="100%" stopColor={BRAND.blue} stopOpacity="0.00" />
                    </linearGradient>
                </defs>

                {[0, 0.5, 1].map((ratio, i) => {
                    const yLoc = paddingY + chartHeight * ratio;
                    const labelVal = Math.round(maxJobs * (1 - ratio));
                    return (
                    <g key={i}>
                        <line x1={paddingX} y1={yLoc} x2={svgWidth - paddingX} y2={yLoc} stroke={BRAND.border} strokeWidth="1" strokeDasharray="4 4" />
                        <text x={paddingX - 10} y={yLoc + 4} textAnchor="end" style={{ fontSize: "10px", fill: BRAND.muted, fontWeight: 500 }}>
                            {labelVal}
                        </text>
                    </g>
                    );
                })}

                {areaData && <path d={areaData} fill="url(#chartGradient)" />}

                {pathData && (
                    <path d={pathData} fill="none" stroke={BRAND.blue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                )}

                {points.map((pt, idx) => (
                    <g key={idx}>
                        <circle cx={pt.x} cy={pt.y} r="4" fill="white" stroke={BRAND.blue} strokeWidth="2" />
                        <text x={pt.x} y={svgHeight - 5} textAnchor="middle" style={{ fontSize: "10px", fill: BRAND.muted, fontWeight: 500 }}>
                            {pt.formatted_date}
                        </text>
                    </g>
                ))}
            </svg>
        </div>
    );
}