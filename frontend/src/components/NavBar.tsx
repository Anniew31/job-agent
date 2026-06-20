"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BRAND } from "@/src/lib/theme";

interface NavbarProps {
    firstName: string;
}

export default function Navbar({ firstName }: NavbarProps) {
    const pathname = usePathname();
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);

    const navLinks = [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Find Jobs", href: "/find" },
        { name: "Score Matches", href: "/score" },
        { name: "Review Matches", href: "/review" },
        { name: "Tailor Matches", href: "/tailor" },
        { name: "Applications", href: "/applications" },
    ];

    return (
        <nav style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "0.7rem 2.5rem", borderBottom: `1px solid ${BRAND.border}`,
            background: BRAND.surface, position: "sticky", top: 0, zIndex: 10,
        }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "2.5rem" }}>
                
                {/* Logo Section */}
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: BRAND.blue, display: "flex", alignItems: "center", justifyContent: "center", transform: "translateY(2px)" }}>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                            <path d="M2 11L5.5 4L9 8L11 5.5L13 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: BRAND.navy, letterSpacing: "-0.02em" }}>job agent</span>
                </Link>

                {/* Navigation */}
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        const isHovered = hoveredLink === link.href;

                        let textColor = BRAND.muted;
                        if (isActive) textColor = BRAND.blue;
                        else if (isHovered) textColor = BRAND.navy;

                        return (
                            <Link 
                                key={link.href} 
                                href={link.href}
                                onMouseEnter={() => setHoveredLink(link.href)}
                                onMouseLeave={() => setHoveredLink(null)}
                                style={{ 
                                    textDecoration: "none", 
                                    fontSize: "0.85rem", 
                                    fontWeight: isActive ? 600 : 500, 
                                    color: textColor,
                                    transition: "all 0.15s ease",
                                    borderBottom: isActive ? `2px solid ${BRAND.blue}` : "2px solid transparent",
                                    paddingBottom: "5px"
                                }}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Profile Avatar */}
            <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: BRAND.blueLight, color: BRAND.blue,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.85rem", fontWeight: 700,
            }}>
                {firstName ? firstName.charAt(0).toUpperCase() : "?"}
            </div>
        </nav>
    );
}