const BASE_URL = "http://localhost:8000";

// sends request to login in
export async function login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
    });

    if (!res.ok) {
    throw new Error("Login failed");
    }

    const data = await res.json();

    localStorage.setItem("token", data.access_token);

    return data;
}

// sends request to register a new account
export async function register(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Register failed");

  return res.json();
}

// reads token from browser and attaches it if existing
function getAuthHeaders() {
    const token = localStorage.getItem("token");

    return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    }

// gets jobs with a certain status if given or just all jobs for profile
export async function getJobs(status?: string) {
    const url = status
        ? `${BASE_URL}/jobs?status=${status}`
        : `${BASE_URL}/jobs`;

    const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
    });

    if (!res.ok) {
    throw new Error("Failed to fetch jobs");
    }

    return await res.json();
}

// sends a request to scrape jobs based on profile
export async function scrape() {
  const res = await fetch(`${BASE_URL}/scrape`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Scraping failed");
  }

  return await res.json();
}

// sends a request to tailor resume and cover letter
export async function tailor() {
  const res = await fetch(`${BASE_URL}/tailor`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Tailoring failed");
  }

  return await res.json();
}

// sends a request to score job description for fit based on profile
export async function score() {
  const res = await fetch(`${BASE_URL}/score`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("Scoring failed");
  }

  return await res.json();
}

// runs whole pipline: scraping, scoring, tailoring
export async function runPipeline() {
  const res = await fetch(`${BASE_URL}/run`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error("The pipeline failed");
  }

  return await res.json();
}

export {};