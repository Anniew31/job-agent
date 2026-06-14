"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import { getProfile, getMetrics, getRecentJobs } from "../../lib/api";
import DashboardMetrics from "@/src/components/DashboardMetrics";
import { BRAND } from "@/src/lib/theme";
import ActionCard from "@/src/components/ActionCard";
import Navbar from "@/src/components/NavBar";

interface Stats {
  scraped_count: number;
  reviewed_count: number;
  accepted_count: number;
  applied_count: number;
  avg_score: number;
}

export default function Dashboard() {
  const router = useRouter();

  const [profileData, setProfileData] = useState<any>(null);
  const [metrics, setMetrics] = useState<Stats | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, metricsRes, recentRes] = await Promise.all([
          getProfile(),
          getMetrics(),
          getRecentJobs(),
        ]);

        setProfileData(profileRes);
        setMetrics(metricsRes);
        setRecentJobs(recentRes || []);
      } catch (err) {
        setError("Failed to synchronize dashboard metrics with the server.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: BRAND.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: BRAND.muted, fontSize: "0.9rem", fontWeight: 500 }}>Loading Agent Parameters...</p>
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

  const firstName = profileData?.name?.split(" ")[0] || "there";

  return (
    <main style={{minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, -apple-system, sans-serif"}}>
      <Navbar firstName = {firstName}></Navbar>
      
      {/* content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2.5rem 4rem" }}>
        {/* welcome header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: BRAND.navy, letterSpacing: "-0.03em", margin: "0 0 0.4rem" }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: "0.95rem", color: BRAND.muted, margin: 0 }}> Here's how your job search is going.</p>
        </div>
        <DashboardMetrics
          applications={recentJobs}
          isDashboardView={true}
          metrics={metrics ?? {
            scraped_count: 0,
            reviewed_count: 0,
            accepted_count: 0,
            applied_count: 0,
            avg_score: 0,
          }}
        />
        {/* action cards */}
        <div style={{ marginTop: "2rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: BRAND.navy, marginBottom: "1rem"}}>
            Pipeline
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem"}} >
            <ActionCard
              title="Find Jobs"
              body="Find new listings matching your target roles."
              cta="Go to find roles"
              href="/find"
              step="Step 1"
              ctaColor={BRAND.blue}
              iconBg={BRAND.blueLight}
              iconFg={BRAND.blue}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              }
            />

            <ActionCard
              title="Score Matches"
              body="AI scores each pending job against your profile."
              cta="Go to scoring"
              href="/score"
              badgeText={`${metrics?.scraped_count ?? 0} pending`}
              badgeBg={BRAND.blueLight}
              badgeFg={BRAND.blue}
              ctaColor={BRAND.blue}
              iconBg={BRAND.blueLight}
              iconFg={BRAND.blue}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                </svg>
              }
            />

            <ActionCard
              title="Review Matches"
              body="Swipe through scored jobs and decide which opportunities to pursue."
              cta="Start reviewing"
              href="/review"
              badgeText={`${metrics?.reviewed_count ?? 0} to review`}
              badgeBg={BRAND.blueLight}
              badgeFg={BRAND.blue}
              ctaColor={BRAND.blue}
              iconBg={BRAND.blueLight}
              iconFg={BRAND.blue}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            />

            <ActionCard
              title="Tailor Documents"
              body="Generate customized resumes and cover letters for accepted jobs."
              cta="Go to tailoring"
              href="/tailor"
              badgeText={`${metrics?.accepted_count ?? 0} ready`}
              badgeBg={BRAND.blueLight}
              badgeFg={BRAND.blue}
              ctaColor={BRAND.blue}
              iconBg={BRAND.blueLight}
              iconFg={BRAND.blue}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </svg>
              }
            />
          </div>
        </div>
      </div>
    </main>
  );
}