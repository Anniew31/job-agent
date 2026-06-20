"use client";

import { useState } from "react";
import Link from "next/link";
import { register, login } from "@/src/lib/api";
import { BRAND } from "@/src/lib/theme";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    async function handleRegister() {
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        try {
            setLoading(true);
            await register(email, password);
            const loginRes = await login(email, password);
            localStorage.setItem("token", loginRes.access_token);
            window.location.href = "/create-profile"; 
        } catch (err: any) {
            setError(err.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    }

    return (
    <main
        style={{
        minHeight: "100vh",
        background: BRAND.bg,
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1rem",
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: BRAND.blue, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
                d="M2 11L5.5 4L9 8L11 5.5L13 11"
                stroke="white"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            </svg>
        </div>
        <span style={{ fontSize: "1rem", fontWeight: 600, color: BRAND.navy, letterSpacing: "-0.02em"}}> job agent </span>
        </div>

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
        <div style={{ textAlign: "center", marginBottom: "0.5rem"}}>
            <h2 style={{ margin: 0, fontSize: "1.4rem", color: BRAND.navy, marginBottom: "0.5rem"}}> Create account </h2>
            <p style={{margin: 0, fontSize: "0.9rem", color: BRAND.muted,}}> Start automating your job search </p>
        </div>

        <label style={{ fontSize: "0.8rem", color: BRAND.navy }}> Email</label>
        <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="abc@example.com"
            style={{
            padding: "0.75rem",
            borderRadius: "10px",
            border: `1px solid ${BRAND.border}`,
            outline: "none",
            }}
        />

        <label style={{ fontSize: "0.8rem", color: BRAND.navy }}>Password</label>
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••••••••"
            style={{
            padding: "0.75rem",
            borderRadius: "10px",
            border: `1px solid ${BRAND.border}`,
            outline: "none",
            }}
        />

        <label style={{ fontSize: "0.8rem", color: BRAND.navy }}>Confirm password</label>
        <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{
            padding: "0.75rem",
            borderRadius: "10px",
            border: `1px solid ${BRAND.border}`,
            outline: "none",
            }}
        />

        {error && (
        <p style={{ color: "red", fontSize: "0.85rem" }}>
            {error}
        </p>
        )}

        <button
            onClick={handleRegister}
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
            {loading ? "Creating account..." : "Create account"}
        </button>

        <div style={{ textAlign: "center", marginTop: "0.5rem" }}>
            <p style={{ fontSize: "0.8rem", color: BRAND.muted, margin: 0 }}>
            Already have an account?{" "}
            <Link
                href="/login"
                style={{
                color: BRAND.blue,
                textDecoration: "none",
                fontWeight: 600,
                }}
            >
                Sign in
            </Link>
            </p>
        </div>
        </div>
    </main>
    );
}