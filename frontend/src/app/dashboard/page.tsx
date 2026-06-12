"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";
import DashboardMetrics from "@/src/components/DashboardMetrics";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    }
  }, []);

  return (
    <main>
      <h1>Dashboard</h1>
      <p>Welcome — you are logged in.</p>
      <div style = {{display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center"}}>
        <div style = {{display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "1rem", width: "75%", marginBottom: "1.5rem"}}>
        </div>
      </div>
    </main>
  );
}