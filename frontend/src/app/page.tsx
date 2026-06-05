import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#FAF8F5",
      fontFamily: "'Georgia', serif",
    }}>

      {/* nav */}
      <nav style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.25rem 2.5rem",
        borderBottom: "1px solid #EDE9E3",
        background: "#FAF8F5",
      }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1A1714", letterSpacing: "-0.02em" }}>
          job agent
        </span>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <Link href="/login" style={{
            fontSize: "0.875rem",
            color: "#6B6560",
            textDecoration: "none",
            padding: "0.5rem 1rem",
          }}>
            Sign In
          </Link>
          <Link href="/register" style={{
            fontSize: "0.875rem",
            color: "#FAF8F5",
            background: "#2C2420",
            textDecoration: "none",
            padding: "0.5rem 1.25rem",
            borderRadius: "6px",
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section style={{
        maxWidth: "680px",
        margin: "0 auto",
        padding: "6rem 2rem 4rem",
        textAlign: "center",
      }}>
        <div style={{
          display: "inline-block",
          fontSize: "0.75rem",
          color: "#9C6B3C",
          background: "#FDF0E3",
          border: "1px solid #F5D9B8",
          borderRadius: "100px",
          padding: "0.3rem 0.9rem",
          marginBottom: "2rem",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}>
          AI-powered job applications
        </div>

        <h1 style={{
          fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
          fontWeight: 400,
          color: "#1A1714",
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          marginBottom: "1.5rem",
        }}>
          Apply smarter,<br />
          <em style={{ fontStyle: "italic", color: "#6B6560" }}>not harder</em>
        </h1>

        <p style={{
          fontSize: "1.125rem",
          color: "#6B6560",
          lineHeight: 1.7,
          marginBottom: "2.5rem",
          fontFamily: "system-ui, sans-serif",
          fontWeight: 400,
        }}>
          Job Agent scrapes listings, scores fit against your profile, then tailors
          your resume and cover letter — automatically.
        </p>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/register" style={{
            fontSize: "0.9375rem",
            color: "#FAF8F5",
            background: "#2C2420",
            textDecoration: "none",
            padding: "0.75rem 2rem",
            borderRadius: "8px",
            fontFamily: "system-ui, sans-serif",
          }}>
            start here
          </Link>
          <Link href="/demo" style={{
            fontSize: "0.9375rem",
            color: "#2C2420",
            background: "transparent",
            textDecoration: "none",
            padding: "0.75rem 2rem",
            borderRadius: "8px",
            border: "1px solid #D4CEC7",
            fontFamily: "system-ui, sans-serif",
          }}>
            see how it works
          </Link>
        </div>
      </section>

      {/* feature cards */}
      <section style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem 2rem 6rem",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "1rem",
      }}>
        {[
          {
            step: "01",
            title: "Scrape jobs",
            body: "Pulls listings from across the web based on your target roles and location. No more manual searching.",
            color: "#FDF0E3",
            accent: "#9C6B3C",
          },
          {
            step: "02",
            title: "Score fit",
            body: "AI reads each job description and compares it to your profile. Low matches get filtered out automatically.",
            color: "#EDF5F0",
            accent: "#2D6A4F",
          },
          {
            step: "03",
            title: "Tailor & apply",
            body: "Generates a tailored resume and cover letter for every strong match. Download and send.",
            color: "#EEF0FB",
            accent: "#3D3A8C",
          },
        ].map((card) => (
          <div key={card.step} style={{
            background: card.color,
            borderRadius: "12px",
            padding: "1.75rem",
          }}>
            <div style={{
              fontSize: "0.75rem",
              color: card.accent,
              fontFamily: "system-ui, sans-serif",
              fontWeight: 500,
              letterSpacing: "0.06em",
              marginBottom: "0.75rem",
            }}>
              {card.step}
            </div>
            <h3 style={{
              fontSize: "1.0625rem",
              fontWeight: 500,
              color: "#1A1714",
              marginBottom: "0.5rem",
              letterSpacing: "-0.01em",
            }}>
              {card.title}
            </h3>
            <p style={{
              fontSize: "0.9rem",
              color: "#6B6560",
              lineHeight: 1.6,
              fontFamily: "system-ui, sans-serif",
              margin: 0,
            }}>
              {card.body}
            </p>
          </div>
        ))}
      </section>

      {/* bottom cta */}
      <section style={{
        borderTop: "1px solid #EDE9E3",
        padding: "4rem 2rem",
        textAlign: "center",
        background: "#F5F1EB",
      }}>
        <h2 style={{
          fontSize: "1.75rem",
          fontWeight: 400,
          color: "#1A1714",
          letterSpacing: "-0.02em",
          marginBottom: "0.75rem",
        }}>
          Ready to automate your job search?
        </h2>
        <p style={{
          fontSize: "1rem",
          color: "#6B6560",
          marginBottom: "2rem",
          fontFamily: "system-ui, sans-serif",
        }}>
          Set up your profile once. Let the agent do the rest.
        </p>
        <Link href="/register" style={{
          fontSize: "0.9375rem",
          color: "#FAF8F5",
          background: "#2C2420",
          textDecoration: "none",
          padding: "0.75rem 2.5rem",
          borderRadius: "8px",
          fontFamily: "system-ui, sans-serif",
        }}>
          create your profile
        </Link>
      </section>

    </main>
  );
}