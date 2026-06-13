"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isLoggedIn } from "../../lib/auth";
import { getProfile, getMetrics, getRecentJobs } from "../../lib/api";
import DashboardMetrics from "@/src/components/DashboardMetrics";
import { BRAND } from "@/src/lib/theme";

interface Stats {
  scraped_count: number;
  reviewed_count: number;
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
      {/* top bar */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1.1rem 2.5rem", borderBottom: `1px solid ${BRAND.border}`,
        background: BRAND.bg, position: "sticky", top: 0, zIndex: 10,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: BRAND.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path d="M2 11L5.5 4L9 8L11 5.5L13 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: BRAND.navy, letterSpacing: "-0.02em" }}>job agent</span>
        </Link>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: BRAND.blueLight, color: BRAND.blue,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.85rem", fontWeight: 700,
        }}>
          {firstName.charAt(0).toUpperCase()}
        </div>
      </nav>

      {/* content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem 2.5rem 4rem" }}>

        {/* welcome header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: BRAND.navy, letterSpacing: "-0.03em", margin: "0 0 0.4rem" }}>
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: "0.95rem", color: BRAND.muted, margin: 0 }}> Here's how your job search is going.</p>
        </div>
        <DashboardMetrics applications={recentJobs} isDashboardView={true} />
      </div>
    </main>
  );
}