"use client";

import { BRAND } from "../lib/theme";

interface SwipeCardProps {
  job: any;
  currentIndex: number;
  total: number;
  onAccept: () => void;
  onPass: () => void;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null || score === undefined) return null;
  const bg = score >= 8 ? BRAND.greenBg : score >= 5 ? BRAND.amberBg : BRAND.redBg;
  const fg = score >= 8 ? BRAND.green : score >= 5 ? BRAND.amber : BRAND.red;
  return (
    <div style={{
      width: 38, height: 38, borderRadius: "50%",
      background: bg, color: fg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.9rem", fontWeight: 700, flexShrink: 0,
    }}>
      {score}
    </div>
  );
}

export default function SwipeCard({ job, currentIndex, total, onAccept, onPass }: SwipeCardProps) {

  const salary = (() => {
    if (job.job_min_salary && job.job_max_salary) {
      return `$${Math.round(job.job_min_salary / 1000)}k – $${Math.round(job.job_max_salary / 1000)}k`;
    }
    if (job.job_min_salary) return `From $${Math.round(job.job_min_salary / 1000)}k`;
    if (job.job_max_salary) return `Up to $${Math.round(job.job_max_salary / 1000)}k`;
    return null;
  })();

  const companyInitial = (job.company ?? "?").charAt(0).toUpperCase();

  if (!job) return null;
  return ( 
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem", width: "100%" }}>

      {/* progress bar */}
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "0.75rem", color: BRAND.faint }}>
            {currentIndex} of {total} reviewed
          </span>
          <span style={{ fontSize: "0.75rem", color: BRAND.faint }}>
            {Math.round((currentIndex / total) * 100)}%
          </span>
        </div>
        <div style={{ height: 3, background: BRAND.borderLight, borderRadius: "100px", overflow: "hidden" }}>
          <div style={{
            height: "100%", background: BRAND.blue, borderRadius: "100px",
            width: `${(currentIndex / total) * 100}%`,
            transition: "width 0.3s ease",
          }} />
        </div>
      </div>

      {/* card */}
      <div style={{
        background: BRAND.surface,
        border: `1px solid ${BRAND.border}`,
        borderRadius: "18px",
        width: "100%", maxWidth: 480,
        boxSizing: "border-box",
        overflow: "hidden",
      }}>

        {/* card header */}
        <div style={{ padding: "1.5rem 1.5rem 1.25rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
              {/* company initial */}
              <div style={{
                width: 42, height: 42, borderRadius: "10px", flexShrink: 0,
                background: BRAND.blueLight, color: BRAND.blue,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.1rem", fontWeight: 700,
              }}>
                {companyInitial}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "0.72rem", color: BRAND.faint, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {job.company ?? "Unknown"}
                </p>
                <p style={{ fontSize: "1.05rem", fontWeight: 700, color: BRAND.navy, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
                  {job.title ?? "Untitled Role"}
                </p>
              </div>
            </div>
            <ScoreBadge score={job.score} />
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "0.875rem" }}>
            {job.location && (
              <span style={{ fontSize: "0.75rem", color: BRAND.muted, background: BRAND.bg, padding: "0.2rem 0.6rem", borderRadius: "6px", border: `1px solid ${BRAND.borderLight}` }}>
                📍 {job.location}
              </span>
            )}
            {job.job_type && (
              <span style={{ fontSize: "0.75rem", color: BRAND.muted, background: BRAND.bg, padding: "0.2rem 0.6rem", borderRadius: "6px", border: `1px solid ${BRAND.borderLight}` }}>
                {job.job_type}
              </span>
            )}
            {salary && (
              <span style={{ fontSize: "0.75rem", color: BRAND.muted, background: BRAND.bg, padding: "0.2rem 0.6rem", borderRadius: "6px", border: `1px solid ${BRAND.borderLight}` }}>
                {salary}
              </span>
            )}
          </div>
        </div>

        <div style={{ height: 1, background: BRAND.borderLight }} />

        {/* AI reasoning */}
        {job.score_reasoning && (
          <>
            <div style={{
              margin: "1rem 1.5rem",
              background: BRAND.blueLight,
              borderRadius: "0 9px 9px 0",
              borderLeft: `3px solid ${BRAND.blue}`,
              padding: "0.75rem 0.875rem",
            }}>
              <p style={{ fontSize: "0.68rem", color: BRAND.blue, fontWeight: 700, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                AI reasoning
              </p>
              <p style={{ fontSize: "0.82rem", color: BRAND.navyMid, lineHeight: 1.55, margin: 0 }}>
                {job.score_reasoning}
              </p>
            </div>
            <div style={{ height: 1, background: BRAND.borderLight }} />
          </>
        )}

        {/* description */}
        <div style={{ padding: "1rem 1.5rem 1.5rem" }}>
          <p style={{ fontSize: "0.68rem", color: BRAND.faint, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 0.5rem" }}>
            Description
          </p>
          <div style={{
            maxHeight: 160, overflowY: "auto",
            fontSize: "0.82rem", color: BRAND.muted, lineHeight: 1.65,
            paddingRight: "0.25rem",
          }}>
            {job.description ?? "No description available."}
          </div>
        </div>
      </div>

      {/* action buttons */}
      <div style={{ display: "flex", gap: "0.875rem", width: "100%", maxWidth: 480 }}>
        <button
          onClick={onPass}
          style={{
            flex: 1, padding: "0.8rem",
            borderRadius: "10px",
            border: `1px solid ${BRAND.border}`,
            background: BRAND.surface,
            color: BRAND.red, fontWeight: 600,
            fontSize: "0.9rem", cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ✕  Pass
        </button>
        <button
          onClick={onAccept}
          style={{
            flex: 1, padding: "0.8rem",
            borderRadius: "10px",
            border: "none",
            background: BRAND.green,
            color: "#fff", fontWeight: 600,
            fontSize: "0.9rem", cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          ✓  Accept
        </button>
      </div>

    </div>
  );
}