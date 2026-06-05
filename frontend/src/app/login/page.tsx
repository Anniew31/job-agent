"use client"
import { useState } from "react";
import { login } from "@/src/lib/api";

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
    <div style={{ padding: 40 }}>
      <h1>Login</h1>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        placeholder="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}