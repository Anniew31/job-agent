"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "@/src/lib/auth";
import { getJobs, tailor, updateDocuments, getTailorStatus, downloadPdf, updateJobStatus } from "@/src/lib/api";
import { BRAND } from "@/src/lib/theme";
import Navbar from "@/src/components/NavBar";

const LOADING_MESSAGES = [
  "Reading job description...",
  "Identifying keyword gaps...",
  "Rewriting resume bullets...",
  "Drafting cover letter...",
  "Finishing up...",
];

export default function TailorPage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<any[]>([]);
  const [jobIndex, setJobIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const [resumeText, setResumeText] = useState("");
  const [coverText, setCoverText] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [tailored, setTailored] = useState(false);
  const [downloadResume, setDownloadResume] = useState(false);
  const [downloadCover, setDownloadCover] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showApplyPrompt, setShowApplyPrompt] = useState(false);

  const job = jobs[jobIndex] ?? null;

  useEffect(() => {
    if (!isLoggedIn()) { router.push("/login"); return; }
    async function fetchData() {
      try {
        setLoading(true);
        const res = await getJobs("accepted");
        setJobs(res || []);
      } catch { setError("Failed to load jobs."); }
      finally { setLoading(false); }
    }
    fetchData();
  }, [router]);

  useEffect(() => {
    if (!isGenerating) return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingMsg(LOADING_MESSAGES[i]);
    }, 1800);
    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (job) {
      const hasDocuments = !!job.resume_text && !!job.cover_letter_text;
      setTailored(hasDocuments);
      const hasResume = !!job.resume_text;
      const hasCover = !!job.cover_letter_text;
      setResumeText(job.resume_text ?? "");
      setCoverText(job.cover_letter_text ?? "");
      setGenerated(hasResume && hasCover);
      
      setDownloaded(false);
      setDownloadCover(false);
      setDownloadResume(false);
    }
  }, [jobIndex, jobs, job]);

  async function handleGenerate() {
    if (!job) return;
    setIsGenerating(true);
    setGenerated(false);
    setLoadingMsg(LOADING_MESSAGES[0]);

    try {
      await tailor(job.id);

      let attempts = 0;
      const maxAttempts = 20;

      const checkStatus = async (): Promise<any> => {
        if (attempts >= maxAttempts) throw new Error("Generation timed out");
        attempts++;

        const status = await getTailorStatus(job.id);

        if (status.ready) {
          return status;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return checkStatus();
        }
      };

      const result = await checkStatus();

      const resJobs = await getJobs("accepted");
      setJobs(resJobs || []);
      setResumeText(result.resume_text);
      setCoverText(result.cover_letter_text);
      setGenerated(true);
    } catch (error) {
      console.error(error);
      setErrorMessage({ message: "Failed to generate. Please try again", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!job) return;
    setIsSaving(true);
    try {
      await updateDocuments(job.id, resumeText, coverText);
      setJobs(prevJobs => 
        prevJobs.map((j, idx) => 
          idx === jobIndex 
            ? { ...j, resume_text: resumeText, cover_letter_text: coverText } 
            : j
        )
      );
      setErrorMessage({ message: "Changes saved successfully! 🎉", type: "success" });
      setTimeout(() => setErrorMessage(null), 3000);
    } catch (error) {
      setErrorMessage({ message: "Failed to save changes. Please try again.", type: "error" });
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDownload() {
    await downloadPdf(job.id, activeTab);
    if (activeTab == "resume") {
      setDownloadResume(true);
      setDownloaded(downloadCover);
    } else {
      setDownloadCover(true);
      setDownloaded(downloadResume);
    }
  }

  function handlePrev() { if (jobIndex > 0) { setJobIndex(j => j - 1); } }
  function handleNext() { if (jobIndex < jobs.length - 1) { setJobIndex(j => j + 1); } }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
      <p style={{ color: BRAND.muted, fontSize: "0.9rem" }}>Loading jobs...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "1rem" }}>
      <p style={{ color: BRAND.red, fontSize: "0.9rem" }}>{error}</p>
      <button onClick={() => window.location.reload()} style={{ background: BRAND.blue, color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer" }}>Retry</button>
    </div>
  );

  return (
    <main style={{ minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <Navbar firstName="" />

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2.5rem 4rem" }}>

        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: BRAND.navy, margin: "0 0 0.25rem", letterSpacing: "-0.02em" }}>
            Tailor Documents
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: BRAND.muted }}>
            Generate a tailored resume and cover letter for each accepted job.
          </p>
        </div>

        {errorMessage && (
          <div style={{
            marginBottom: "1.5rem",
            padding: "0.875rem 1.25rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: errorMessage.type === "success" ? BRAND.greenBg : "#FDF2F2", // Fallback light red if color missing
            color: errorMessage.type === "success" ? BRAND.green : BRAND.red,
            border: `1px solid ${errorMessage.type === "success" ? BRAND.green : BRAND.red}`,
            boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
            transition: "all 0.3s ease"
          }}>
            <span>{errorMessage.type === "success" ? "✓" : "⚠️"}</span>
            <span>{errorMessage.message}</span>
          </div>
        )}

        {jobs.length === 0 ? (
          <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "3rem", textAlign: "center" }}>
            <p style={{ color: BRAND.muted, fontSize: "0.9rem", margin: "0 0 1rem" }}>No accepted jobs yet.</p>
            <button onClick={() => router.push("/review")} style={{ background: BRAND.navy, color: "#fff", border: "none", padding: "0.65rem 1.5rem", borderRadius: "8px", fontWeight: 600, cursor: "pointer", fontSize: "0.875rem" }}>
              Go to review →
            </button>
          </div>
        ) : (
          <><div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", alignItems: "start" }}>

              {/* Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", position: "sticky", top: "5rem" }}>

                {/* job switcher */}
                <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button onClick={handlePrev} disabled={jobIndex === 0} style={{ border: "none", background: "none", color: jobIndex === 0 ? BRAND.faint : BRAND.navy, cursor: jobIndex === 0 ? "not-allowed" : "pointer", fontSize: "1.1rem", padding: "0 0.25rem" }}>←</button>
                  <span style={{ fontSize: "0.8rem", color: BRAND.muted, fontWeight: 500 }}>
                    Job {jobIndex + 1} of {jobs.length}
                  </span>
                  <button onClick={handleNext} disabled={jobIndex === jobs.length - 1} style={{ border: "none", background: "none", color: jobIndex === jobs.length - 1 ? BRAND.faint : BRAND.navy, cursor: jobIndex === jobs.length - 1 ? "not-allowed" : "pointer", fontSize: "1.1rem", padding: "0 0.25rem" }}>→</button>
                </div>

                {/* job card */}
                {job && (
                  <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.875rem" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "9px", background: BRAND.blueLight, color: BRAND.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, flexShrink: 0 }}>
                        {(job.company ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "0.7rem", color: BRAND.faint, margin: "0 0 1px", textTransform: "uppercase", letterSpacing: "0.05em" }}>{job.company}</p>
                        <p style={{ fontSize: "0.95rem", fontWeight: 700, color: BRAND.navy, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.2 }}>{job.title}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginBottom: "0.875rem" }}>
                      {job.location && <span style={{ fontSize: "0.72rem", color: BRAND.muted, background: BRAND.bg, padding: "0.2rem 0.55rem", borderRadius: "5px", border: `1px solid ${BRAND.borderLight}` }}>📍 {job.location}</span>}
                      {job.job_type && <span style={{ fontSize: "0.72rem", color: BRAND.muted, background: BRAND.bg, padding: "0.2rem 0.55rem", borderRadius: "5px", border: `1px solid ${BRAND.borderLight}` }}>{job.job_type}</span>}
                    </div>

                    {/* description */}
                    {job.description && (
                      <div
                        style={{
                          height: "180px",
                          overflowY: "auto",
                          background: BRAND.bg,
                          padding: "0.85rem 1rem",
                          borderRadius: "8px",
                          border: `1px solid ${BRAND.border}`,
                          boxSizing: "border-box",
                          width: "100%"
                        }}
                      >
                        <p style={{
                          fontSize: "0.82rem",
                          color: BRAND.navy,
                          lineHeight: 1.55,
                          margin: 0,
                          whiteSpace: "pre-wrap",
                          opacity: 0.9
                        }}>
                          {job.description}
                        </p>
                      </div>
                    )}

                    {/* apply link */}
                    {job.source_url && (
                      <a href={job.source_url} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "0.875rem", fontSize: "0.8rem", color: BRAND.blue, textDecoration: "none", fontWeight: 500 }}>
                        View job posting ↗
                      </a>
                    )}
                  </div>
                )}

                {/* generation controls */}
                <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "1.25rem" }}>
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 0.35rem" }}>Generate tailored assets</p>
                  <p style={{ fontSize: "0.75rem", color: BRAND.muted, margin: "0 0 1rem", lineHeight: 1.5 }}>
                    AI will rewrite your resume bullets and draft a cover letter matched to this role.
                  </p>

                  {isGenerating ? (
                    <div style={{ background: BRAND.blueLight, borderRadius: "8px", padding: "0.875rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 14, height: 14, border: `2px solid ${BRAND.blue}`, borderTopColor: "transparent", borderRadius: "50%", flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
                      <span style={{ fontSize: "0.8rem", color: BRAND.blue, fontWeight: 500 }}>{loadingMsg}</span>
                    </div>
                  ) : generated ? (
                    <div style={{ background: BRAND.greenBg, borderRadius: "8px", padding: "0.875rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ color: BRAND.green, fontWeight: 700 }}>✓</span>
                      <span style={{ fontSize: "0.8rem", color: BRAND.green, fontWeight: 500 }}>Documents ready</span>
                    </div>
                  ) : (
                    <button onClick={handleGenerate} style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "none", background: BRAND.navy, color: "#fff", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "system-ui, sans-serif" }}>
                      Generate tailored assets
                    </button>
                  )}
                </div>

                {/* next steps checklist */}
                {generated && (
                  <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, padding: "1.25rem" }}>
                    <p style={{ fontSize: "0.78rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 0.875rem" }}>Next steps</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {[
                        { label: "Tailor assets", done: tailored },
                        { label: "Download resume & cover letter", done: downloaded },
                        { label: "Apply on website", done: applied },
                      ].map((step) => (
                        <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: "50%",
                            border: `1.5px solid ${step.done ? BRAND.green : BRAND.border}`,
                            background: step.done ? BRAND.greenBg : "transparent",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                          }}>
                            {step.done && <span style={{ color: BRAND.green, fontSize: "0.65rem", fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: "0.8rem", color: step.done ? BRAND.green : BRAND.muted, fontWeight: step.done ? 500 : 400 }}>
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {job?.source_url && !applied && (
                      <>
                        {showApplyPrompt ? (
                          <div style={{
                            marginTop: "1rem", background: BRAND.bg, borderRadius: "8px",
                            border: `1px solid ${BRAND.border}`, padding: "0.875rem",
                          }}>
                            <p style={{ fontSize: "0.78rem", fontWeight: 600, color: BRAND.navy, margin: "0 0 0.6rem" }}>
                              Did you submit your application?
                            </p>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={async () => {
                                  await updateJobStatus({
                                    job_id: jobs[jobIndex].id,
                                    status: "applied"
                                  });
                                  setApplied(true);
                                  setShowApplyPrompt(false);
                                } }
                                style={{
                                  flex: 1, padding: "0.5rem", borderRadius: "6px",
                                  border: "none", background: BRAND.green, color: "#fff",
                                  fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
                                }}
                              >
                                Yes, I applied ✓
                              </button>
                              <button
                                onClick={() => setShowApplyPrompt(false)}
                                style={{
                                  flex: 1, padding: "0.5rem", borderRadius: "6px",
                                  border: `1px solid ${BRAND.border}`, background: BRAND.surface,
                                  color: BRAND.muted, fontSize: "0.78rem", fontWeight: 500, cursor: "pointer",
                                }}
                              >
                                Not yet
                              </button>
                            </div>
                          </div>
                        ) : (
                          <a
                            href={job.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setShowApplyPrompt(true)}
                            style={{
                              display: "block", marginTop: "1rem", padding: "0.7rem",
                              borderRadius: "8px", background: BRAND.green, color: "#fff",
                              textAlign: "center", fontSize: "0.875rem", fontWeight: 600,
                              textDecoration: "none",
                            }}
                          >
                            Apply on {job.company} website →
                          </a>
                        )}
                      </>
                    )}

                    {/* applied state — show after confirmed */}
                    {applied && (
                      <div style={{
                        marginTop: "1rem", background: BRAND.greenBg, borderRadius: "8px",
                        padding: "0.875rem", display: "flex", alignItems: "center", gap: "0.6rem",
                        border: `1px solid ${BRAND.green}`,
                      }}>
                        <span style={{ color: BRAND.green, fontWeight: 700 }}>✓</span>
                        <span style={{ fontSize: "0.8rem", color: BRAND.green, fontWeight: 500 }}>
                          Application submitted — good luck!
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

                {/* documents */}
                <div style={{ background: BRAND.surface, borderRadius: "12px", border: `1px solid ${BRAND.border}`, overflow: "hidden" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 1.5rem", borderBottom: `1px solid ${BRAND.border}`, background: BRAND.bg }}>
                    <div style={{ display: "flex" }}>
                      {(["resume", "cover"] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                          padding: "0.875rem 1.25rem", border: "none", background: "none", cursor: "pointer",
                          fontSize: "0.85rem", fontWeight: activeTab === tab ? 600 : 400,
                          color: activeTab === tab ? BRAND.navy : BRAND.muted,
                          borderBottom: activeTab === tab ? `2px solid ${BRAND.navy}` : "2px solid transparent",
                          fontFamily: "system-ui, sans-serif",
                        }}>
                          {tab === "resume" ? "Resume Bullets" : "Cover letter"}
                        </button>
                      ))}
                    </div>

                    {generated && (
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          style={{
                            padding: "0.4rem 0.875rem",
                            borderRadius: "6px",
                            border: `1px solid ${BRAND.border}`,
                            background: isSaving ? BRAND.bg : BRAND.surface,
                            color: isSaving ? BRAND.muted : BRAND.navy,
                            fontSize: "0.78rem",
                            fontWeight: 500,
                            cursor: isSaving ? "not-allowed" : "pointer",
                            fontFamily: "system-ui, sans-serif"
                          }}
                        >
                          {isSaving ? "⏳ Saving..." : "Save Changes"}
                        </button>
                        <button onClick={() => handleDownload()}
                          style={{
                            padding: "0.4rem 0.875rem",
                            borderRadius: "6px",
                            border: "none",
                            background: BRAND.navy,
                            color: "#fff",
                            fontSize: "0.78rem",
                            fontWeight: 500,
                            cursor: "pointer",
                            fontFamily: "system-ui, sans-serif"
                          }}>
                          Download PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {generated && (
                    <div style={{
                      background: BRAND.bg,
                      padding: "0.75rem 1.5rem",
                      borderBottom: `1px solid ${BRAND.border}`,
                      fontSize: "0.8rem",
                      color: BRAND.muted,
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}>
                      <span>💡</span>
                      <span>
                        Feel free to directly rewrite or tweak any text below. Make your changes, hit <strong>Save Changes</strong>, and click <strong>Download PDF</strong> once you're satisfied!
                      </span>
                    </div>
                  )}

                  {/* editor area */}
                  <div style={{ padding: "1.5rem" }}>
                    {!generated ? (
                      <div style={{ minHeight: 540, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "0.75rem" }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: BRAND.bg, border: `1px solid ${BRAND.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>✨</div>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600, color: BRAND.navy, margin: 0 }}>No documents yet</p>
                        <p style={{ fontSize: "0.8rem", color: BRAND.muted, margin: 0, textAlign: "center", maxWidth: 280 }}>
                          Click "Generate tailored assets" to create your resume and cover letter for this role.
                        </p>
                      </div>
                    ) : (
                      <textarea
                        value={activeTab === "resume" ? resumeText : coverText}
                        onChange={(e) => activeTab === "resume" ? setResumeText(e.target.value) : setCoverText(e.target.value)}
                        style={{
                          width: "100%", minHeight: 675, padding: "0.875rem",
                          borderRadius: "8px", border: `1px solid ${BRAND.border}`,
                          background: BRAND.bg, color: BRAND.navy,
                          fontSize: "0.875rem", lineHeight: 1.7,
                          fontFamily: "ui-monospace, monospace",
                          resize: "vertical", outline: "none",
                          boxSizing: "border-box",
                        }} />
                    )}
                  </div>
                </div>
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}
      </div>
    </main>
  );
}