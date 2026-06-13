"use client";

import { useRouter } from "next/navigation";
import { BRAND } from "../lib/theme";

interface ActionCardProps {
    title: string;
    body: string;
    cta: string;
    href: string;

    icon: React.ReactNode;
    iconBg: string;
    iconFg: string;

    badgeText?: string;
    badgeBg?: string;
    badgeFg?: string;

    step?: string;
    ctaColor: string;
}

export default function ActionCard({
    title,
    body,
    cta,
    href,
    icon,
    iconBg,
    iconFg,
    badgeText,
    badgeBg,
    badgeFg,
    step,
    ctaColor,
}: ActionCardProps) {
    const router = useRouter();

    return (
        <div
            onClick={() => router.push(href)}
            style={{
                background: BRAND.surface,
                border: `1px solid ${BRAND.border}`,
                borderRadius: "16px",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = ctaColor;
                e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BRAND.border;
                e.currentTarget.style.transform = "translateY(0)";
            }}
        >
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: "1rem"}}>
                <div
                    style={{
                        width: 42,
                        height: 42,
                        borderRadius: "12px",
                        background: iconBg,
                        color: iconFg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    {icon}
                </div>

                {step ? (
                    <span style={{ fontSize: "0.8rem", color: BRAND.faint, fontWeight: 600}}>
                        {step}
                    </span>
                ) : badgeText ? (
                    <span
                        style={{
                            background: badgeBg,
                            color: badgeFg,
                            padding: "0.3rem 0.75rem",
                            borderRadius: "999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            height: "fit-content",
                        }}
                    >
                        {badgeText}
                    </span>
                ) : null}
            </div>

            <h3 style={{ margin: 0, marginBottom: "0.5rem", fontSize: "1.15rem", color: BRAND.navy }}>
                {title}
            </h3>

            <p style={{ margin: 0, color: BRAND.muted, lineHeight: 1.6, flex: 1 }}>
                {body}
            </p>

            <div style={{ marginTop: "1rem", color: ctaColor, fontWeight: 600, fontSize: "0.9rem"}}>
                {cta} →
            </div>
        </div>
    );
}