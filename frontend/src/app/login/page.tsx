"use client"
import { useState } from "react";
import { login } from "@/src/lib/api";
import Link from "next/link";
import { BRAND } from "@/src/lib/theme";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    try {
      setLoading(true);
      await login(email, password);

      alert("Login successful!");
      window.location.href = "/";
    } catch (err) {
      alert("Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style = {{ minHeight: "100vh", background: BRAND.bg, fontFamily: "system-ui, -apple-system, sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "2rem"}}>
      <section>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: BRAND.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 11L5.5 4L9 8L11 5.5L13 11" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <span style={{ fontSize: "1rem", fontWeight: 600, color: BRAND.navy, letterSpacing: "-0.02em" }}>job agent</span>
        </div>

      </section>
      <section>
          <div
            style={{
              width: 360,
              borderRadius: "14px",
              padding: "2rem",
              border: `1px solid ${BRAND.border}`,
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
              background: BRAND.surface,
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
          
            <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
              <h2 style={{ margin: 0, fontSize: "1.4rem", color: BRAND.navy }}>
                Sign In
              </h2>
            </div>

          
            <label style={{ fontSize: "0.8rem", color: BRAND.navy }}>
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                padding: "0.75rem",
                borderRadius: "10px",
                border: `1px solid ${BRAND.border}`,
                outline: "none",
              }}
            />

            <label style={{ fontSize: "0.8rem", color: BRAND.navy }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                padding: "0.75rem",
                borderRadius: "10px",
                border: `1px solid ${BRAND.border}`,
                outline: "none",
              }}
            />

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                padding: "0.75rem",
                borderRadius: "10px",
                border: "none",
                background: BRAND.blue,
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
              <p style={{ fontSize: "0.8rem", color: BRAND.muted, margin: 0 }}>
                Don't have an account?{" "}
                <Link
                  href="/register"
                  style={{
                    color: BRAND.blue,
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  Register instead
                </Link>
              </p>
            </div>
          </div>
      </section>
    </main>
  );
}