import Link from "next/link";
import { BRAND } from "../lib/theme";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.1rem 2.5rem", borderBottom: `1px solid ${BRAND.border}`,
        background: "rgba(247,249,252,0.85)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: BRAND.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11L5.5 4L9 8L11 5.5L13 11" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontSize: "1rem", fontWeight: 600, color: BRAND.navy, letterSpacing: "-0.02em" }}>job agent</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <Link href="/login" style={{ fontSize: "0.875rem", color: BRAND.muted, textDecoration: "none", padding: "0.45rem 1rem" }}>sign in</Link>
          <Link href="/register" style={{
            fontSize: "0.875rem", color: "#fff", background: BRAND.blue,
            textDecoration: "none", padding: "0.45rem 1.25rem",
            borderRadius: "8px", fontWeight: 500,
          }}>get started</Link>
        </div>
      </nav>

      {/* ── hero ── */}
      <section style={{ maxWidth: "700px", margin: "0 auto", padding: "5.5rem 2rem 3.5rem", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          fontSize: "0.75rem", color: BRAND.blue, background: BRAND.blueLight,
          border: `1px solid ${BRAND.border}`, borderRadius: "100px",
          padding: "0.3rem 0.9rem", marginBottom: "2rem", fontWeight: 500, letterSpacing: "0.04em",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: BRAND.blue, display: "inline-block" }} />
          AI-POWERED JOB APPLICATIONS
        </div>

        <h1 style={{
          fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 700,
          color: BRAND.navy, lineHeight: 1.1, letterSpacing: "-0.04em",
          marginBottom: "1.25rem",
        }}>
          Your job search,<br />
          <span style={{ color: BRAND.blue }}>automated end-to-end</span>
        </h1>

        <p style={{
          fontSize: "1.125rem", color: BRAND.muted, lineHeight: 1.75,
          marginBottom: "2.5rem", maxWidth: "520px", margin: "0 auto 2.5rem",
        }}>
          Scrape listings, swipe through AI-scored matches, get a tailored resume
          and cover letter for every job, and track every application — all in one place.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            fontSize: "0.9375rem", color: "#fff", background: BRAND.blue,
            textDecoration: "none", padding: "0.8rem 2.25rem",
            borderRadius: "10px", fontWeight: 500, letterSpacing: "-0.01em",
          }}>
            start now →
          </Link>
          <Link href="/demo" style={{
            fontSize: "0.9375rem", color: BRAND.navyMid, background: BRAND.surface,
            textDecoration: "none", padding: "0.8rem 2.25rem",
            borderRadius: "10px", border: `1px solid ${BRAND.border}`, fontWeight: 500,
          }}>
            see a demo
          </Link>
        </div>
      </section>

      <section style={{
        maxWidth: "1000px", margin: "0 auto", padding: "0 2rem 5rem",
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.875rem",
      }}>
        {[
          { icon: "🔍", title: "Smart scraping", body: "Pulls listings across the web based on your target roles and location.", iconBg: "#EFF6FF" },
          { icon: "🤖", title: "AI scoring", body: "Each job gets scored 1–10 against your profile. Low matches filtered out automatically.", iconBg: "#EEF2F6" },
          { icon: "↔️", title: "Swipe to decide", body: "Review top matches as cards. Swipe right to apply, left to skip.", iconBg: "#F5F3FF" },
          { icon: "📄", title: "Tailored resume + letter", body: "AI rewrites your bullets and writes a cover letter for every job you accept.", iconBg: "#ECFDF5" },
          { icon: "📊", title: "Application dashboard", body: "Track status, scores, and stats. Edit applications and monitor your pipeline.", iconBg: "#FFF7ED" },
        ].map((f) => (
          <div key={f.title} style={{
            background: BRAND.surface, 
            borderRadius: "12px", padding: "1.25rem",
            border: `1px solid ${BRAND.border}`,
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)", 
          }}>
            <div style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "8px", 
              background: f.iconBg, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              fontSize: "1.2rem",
              marginBottom: "0.75rem"
            }}>
              {f.icon}
            </div>
            
            <p style={{ fontSize: "0.875rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 0.35rem" }}>{f.title}</p>
            <p style={{ fontSize: "0.8rem", color: BRAND.muted, lineHeight: 1.55, margin: 0 }}>{f.body}</p>
          </div>
        ))}
      </section>
    
      <section style={{
        maxWidth: "940px", margin: "0 auto", padding: "0 2rem 6rem",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center",
      }}>
     
        <div>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: BRAND.blue, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>how it works</p>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: BRAND.navy, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "2rem" }}>
            Four steps from setup<br />to application
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              { n: "1", title: "Set up your profile", body: "Add experience, skills, target roles, salary floor, and deal-breakers. Takes five minutes." },
              { n: "2", title: "Agent scrapes & scores", body: "Pulls matching listings, scores each one 1–10 against your profile, auto-rejects bad fits." },
              { n: "3", title: "Swipe through top matches", body: "Review AI-scored job cards. Swipe right to apply, left to skip." },
              { n: "4", title: "Get tailored documents", body: "Resume bullets and cover letter generated per job. Download and send." },
            ].map((s) => (
              <div key={s.n} style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", background: BRAND.blueLight,
                  color: BRAND.blue, fontSize: "0.8rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {s.n}
                </div>
                <div>
                  <p style={{ fontSize: "0.9rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 2px" }}>{s.title}</p>
                  <p style={{ fontSize: "0.825rem", color: BRAND.muted, lineHeight: 1.55, margin: 0 }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative" }}>
         
          <div style={{
            position: "absolute", top: "24px", left: "-16px", zIndex: 3,
            background: BRAND.redBg, border: `1px solid #F5C4C4`,
            borderRadius: "8px", padding: "0.35rem 0.75rem",
            fontSize: "0.75rem", fontWeight: 600, color: BRAND.red,
            transform: "rotate(-8deg)", letterSpacing: "0.04em",
          }}>PASS ✕</div>
         
          <div style={{
            position: "absolute", top: "24px", right: "-16px", zIndex: 3,
            background: BRAND.greenBg, border: `1px solid #B5D9C4`,
            borderRadius: "8px", padding: "0.35rem 0.75rem",
            fontSize: "0.75rem", fontWeight: 600, color: BRAND.green,
            transform: "rotate(8deg)", letterSpacing: "0.04em",
          }}>APPLY ✓</div>

         
          <div style={{ position: "relative", height: "340px" }}>
           
            <div style={{
              position: "absolute", top: "20px", left: "20px", right: "20px", bottom: 0,
              background: "#E8EFF9", borderRadius: "18px",
              border: `1px solid ${BRAND.border}`, transform: "rotate(3deg)",
            }} />
            
            <div style={{
              position: "absolute", top: "10px", left: "10px", right: "10px", bottom: 0,
              background: "#F0F5FD", borderRadius: "18px",
              border: `1px solid ${BRAND.border}`, transform: "rotate(-1.5deg)",
            }} />
          
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0,
              background: BRAND.surface, borderRadius: "18px",
              border: `1px solid ${BRAND.border}`, padding: "1.5rem",
              boxShadow: "0 4px 24px rgba(59,111,212,0.08)",
            }}>
              {/* company row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "10px",
                    background: BRAND.blueLight, display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "1.1rem", fontWeight: 700, color: BRAND.blue,
                  }}>S</div>
                  <div>
                    <p style={{ fontSize: "0.7rem", color: BRAND.faint, margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Stripe · Remote</p>
                    <p style={{ fontSize: "1rem", fontWeight: 600, color: BRAND.navy, margin: 0, letterSpacing: "-0.02em" }}>Software Engineer Intern</p>
                  </div>
                </div>
                <div style={{
                  background: BRAND.greenBg, color: BRAND.green,
                  fontSize: "0.8rem", fontWeight: 700,
                  padding: "0.3rem 0.65rem", borderRadius: "100px",
                }}>9/10</div>
              </div>

              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
                {["Internship", "$45/hr", "Python", "React"].map((t) => (
                  <span key={t} style={{
                    fontSize: "0.72rem", color: BRAND.navyMid,
                    background: BRAND.surfaceAlt, padding: "0.2rem 0.55rem",
                    borderRadius: "6px", fontWeight: 500,
                    border: `1px solid ${BRAND.borderLight}`,
                  }}>{t}</span>
                ))}
              </div>

              <div style={{
                background: BRAND.bluePale, borderRadius: "10px",
                padding: "0.75rem", marginBottom: "1rem",
                borderLeft: `3px solid ${BRAND.blue}`,
              }}>
                <p style={{ fontSize: "0.72rem", color: BRAND.blue, fontWeight: 600, margin: "0 0 3px", textTransform: "uppercase", letterSpacing: "0.04em" }}>AI reasoning</p>
                <p style={{ fontSize: "0.8rem", color: BRAND.navyMid, lineHeight: 1.5, margin: 0 }}>
                  Strong match — Python and React align with requirements. Remote fits your preference.
                </p>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                <button style={{
                  padding: "0.65rem", borderRadius: "10px",
                  border: `1px solid #F5C4C4`, background: BRAND.redBg,
                  color: BRAND.red, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                }}>✕ Pass</button>
                <button style={{
                  padding: "0.65rem", borderRadius: "10px",
                  border: `1px solid #B5D9C4`, background: BRAND.greenBg,
                  color: BRAND.green, fontSize: "0.85rem", fontWeight: 600, cursor: "pointer",
                }}>✓ Apply</button>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", fontSize: "0.78rem", color: BRAND.faint, marginTop: "1rem" }}>
            12 more matches waiting
          </p>
        </div>
      </section>

      <section style={{
        background: BRAND.surface, borderTop: `1px solid ${BRAND.border}`,
        borderBottom: `1px solid ${BRAND.border}`, padding: "5rem 2rem",
      }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3.5rem", alignItems: "center" }}>
          <div style={{ position: "relative", height: "260px" }}>
            <div style={{
              position: "absolute", bottom: 0, right: "20px", width: "75%",
              background: BRAND.blueLight, borderRadius: "14px",
              border: `1px solid ${BRAND.border}`, padding: "1.1rem",
              transform: "rotate(2.5deg)",
            }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 600, color: BRAND.blue, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Cover Letter</p>
              {[80, 95, 70, 90, 55].map((w, i) => (
                <div key={i} style={{ height: 5, borderRadius: 3, background: BRAND.border, marginBottom: 5, width: `${w}%` }} />
              ))}
            </div>
            <div style={{
              position: "absolute", top: 0, left: 0, width: "78%",
              background: BRAND.surface, borderRadius: "14px",
              border: `1px solid ${BRAND.border}`, padding: "1.1rem",
              boxShadow: "0 4px 16px rgba(59,111,212,0.07)",
            }}>
              <p style={{ fontSize: "0.65rem", fontWeight: 600, color: BRAND.blue, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 6px" }}>Tailored Resume</p>
              {[60, 85, 75, 90, 65, 80].map((w, i) => (
                <div key={i} style={{ height: 5, borderRadius: 3, background: i === 0 ? BRAND.blueLight : BRAND.borderLight, marginBottom: 5, width: `${w}%` }} />
              ))}
              <div style={{
                marginTop: "8px", background: BRAND.blueLight, borderRadius: "6px",
                padding: "0.4rem 0.6rem",
              }}>
                <p style={{ fontSize: "0.65rem", color: BRAND.blue, fontWeight: 500, margin: 0 }}>✦ Bullet tailored to job keywords</p>
              </div>
            </div>
          </div>

          <div>
            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: BRAND.blue, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.75rem" }}>AI tailoring</p>
            <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: BRAND.navy, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "1rem" }}>
              A custom resume and cover letter for every job
            </h2>
            <p style={{ fontSize: "0.95rem", color: BRAND.muted, lineHeight: 1.7, marginBottom: "1.25rem" }}>
              Once you swipe right, the AI rewrites your resume bullets to mirror
              the job description's language and writes a personalised cover
              letter — all grounded in your real experience.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {[
                "Rewrites bullets using the job's exact keywords",
                "Keeps your real experience — no hallucinations",
                "Three-paragraph cover letter in your voice",
                "Downloads as a formatted PDF instantly",
              ].map((pt) => (
                <div key={pt} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <span style={{ color: BRAND.blue, fontWeight: 700, marginTop: "1px", flexShrink: 0 }}>✓</span>
                  <p style={{ fontSize: "0.875rem", color: BRAND.muted, margin: 0, lineHeight: 1.5 }}>{pt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: "900px", margin: "5rem auto", padding: "0 2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: BRAND.blue, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>dashboard</p>
          <h2 style={{ fontSize: "1.75rem", fontWeight: 700, color: BRAND.navy, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>Track every application</h2>
          <p style={{ fontSize: "0.95rem", color: BRAND.muted }}>Edit status, view AI scores, and see your pipeline at a glance.</p>
        </div>

        <div style={{
          background: BRAND.surface, borderRadius: "16px",
          border: `1px solid ${BRAND.border}`, overflow: "hidden",
          boxShadow: "0 4px 32px rgba(59,111,212,0.06)",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            borderBottom: `1px solid ${BRAND.border}`,
          }}>
            {[
              { label: "Scraped", value: "42", color: BRAND.navy },
              { label: "Reviewed", value: "18", color: BRAND.blue },
              { label: "Applied", value: "7", color: BRAND.green },
              { label: "Avg score", value: "7.4", color: BRAND.amber },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: "1.25rem 1.5rem",
                borderRight: i < 3 ? `1px solid ${BRAND.border}` : "none",
              }}>
                <p style={{ fontSize: "0.72rem", color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: "1.75rem", fontWeight: 700, color: s.color, margin: 0, letterSpacing: "-0.03em" }}>{s.value}</p>
              </div>
            ))}
          </div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 140px 80px 120px",
            padding: "0.6rem 1.5rem", background: BRAND.bg,
            borderBottom: `1px solid ${BRAND.border}`,
          }}>
            {["Job", "Company", "Score", "Status"].map((h) => (
              <p key={h} style={{ fontSize: "0.7rem", fontWeight: 600, color: BRAND.faint, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>{h}</p>
            ))}
          </div>
          {[
            { title: "SWE Intern", company: "Stripe", score: 9, status: "applied", sc: BRAND.green, sb: BRAND.greenBg },
            { title: "Frontend Intern", company: "Notion", score: 8, status: "reviewing", sc: BRAND.amber, sb: BRAND.amberBg },
            { title: "SWE Intern", company: "Linear", score: 7, status: "applied", sc: BRAND.green, sb: BRAND.greenBg },
            { title: "Product Eng Intern", company: "Figma", score: 5, status: "rejected", sc: BRAND.red, sb: BRAND.redBg },
          ].map((job, i) => (
            <div key={job.company} style={{
              display: "grid", gridTemplateColumns: "1fr 140px 80px 120px",
              padding: "0.9rem 1.5rem", alignItems: "center",
              borderBottom: i < 3 ? `1px solid ${BRAND.borderLight}` : "none",
            }}>
              <p style={{ fontSize: "0.875rem", fontWeight: 500, color: BRAND.navy, margin: 0 }}>{job.title}</p>
              <p style={{ fontSize: "0.825rem", color: BRAND.muted, margin: 0 }}>{job.company}</p>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: BRAND.blueLight, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: "0.8rem", fontWeight: 700, color: BRAND.blue,
              }}>{job.score}</div>
              <span style={{
                fontSize: "0.75rem", fontWeight: 500,
                color: job.sc, background: job.sb,
                padding: "0.25rem 0.65rem", borderRadius: "100px",
                display: "inline-block",
              }}>{job.status}</span>
            </div>
          ))}
        </div>
      </section>
      <section style={{
        borderTop: `1px solid ${BRAND.border}`, padding: "5rem 2rem",
        textAlign: "center", background: BRAND.surface,
      }}>
        <h2 style={{ fontSize: "2rem", fontWeight: 700, color: BRAND.navy, letterSpacing: "-0.03em", marginBottom: "0.75rem" }}>
          Ready to let the agent work for you?
        </h2>
        <p style={{ fontSize: "1rem", color: BRAND.muted, marginBottom: "2rem" }}>
          Set up your profile once. Job Agent handles the rest.
        </p>
        <Link href="/register" style={{
          fontSize: "1rem", color: "#fff", background: BRAND.blue,
          textDecoration: "none", padding: "0.875rem 2.75rem",
          borderRadius: "10px", fontWeight: 600,
        }}>
          create your profile →
        </Link>
      </section>

    </main>
  );
}