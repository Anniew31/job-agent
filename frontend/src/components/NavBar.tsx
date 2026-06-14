"use client";

import Link from "next/link";
import { BRAND } from "@/src/lib/theme";

interface NavbarProps {
    firstName: string;
}

export default function Navbar({ firstName }: NavbarProps) {
    return (
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
    );
}