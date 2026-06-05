import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav style={{ padding: 20, display: "flex", gap: 20 }}>
          <Link href="/">Home</Link>
          <Link href="/login">Login</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>

        <main style={{ padding: 20 }}>{children}</main>
      </body>
    </html>
  );
}