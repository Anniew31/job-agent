"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn } from "../../lib/auth";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login");
    }
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome — you are logged in.</p>
    </div>
  );
}